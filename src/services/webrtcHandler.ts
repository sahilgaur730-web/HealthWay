/**
 * WebRTCHandler
 * Enterprise WebRTC client optimized for low-bandwidth rural healthcare connectivity.
 * Features:
 * - Adaptive constraints (audio-only, 15-30fps, 16kHz audio)
 * - Bandwidth telemetry via getStats() (bitrate & packet loss monitoring)
 * - Dynamic codec bitrate control (Low: 100k, Med: 300k, High: 800k)
 * - Auto-fallback to audio-only on poor signal (<50kbps or packetsLost > 10)
 * - Screen sharing with track swapping
 * - Dual signaling: BroadcastChannel for seamless local cross-tab testing + WebSocket-ready architecture
 */

export interface PeerMessage {
  type: 'offer' | 'answer' | 'candidate' | 'chat' | 'vitals' | 'audio-only-switch' | 'end-consultation' | 'join';
  senderId: string;
  senderRole: 'doctor' | 'asha' | 'patient';
  payload: any;
  timestamp: string;
}

export class WebRTCHandler {
  public localVideoEl: HTMLVideoElement | null = null;
  public remoteVideoEl: HTMLVideoElement | null = null;
  public peerConnection: RTCPeerConnection | null = null;
  public localStream: MediaStream | null = null;
  public screenStream: MediaStream | null = null;
  public isAudioOnly: boolean = false;
  public currentQuality: 'auto' | 'high' | 'medium' | 'low' = 'auto';
  public userRole: 'doctor' | 'asha' | 'patient' = 'patient';
  public roomId: string = 'healthway_tele_01';
  public userId: string = `usr_${Math.random().toString(36).substr(2, 6)}`;

  private signalingChannel: BroadcastChannel | null = null;
  private bandwidthInterval: any = null;
  private lastBytesReceived: number = 0;
  private isMuted: boolean = false;
  private isVideoPaused: boolean = false;

  public iceServers: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  // Callbacks
  public onRemoteStream?: (stream: MediaStream) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  public onQualityChange?: (quality: string, reason: string) => void;
  public onBandwidthUpdate?: (quality: 'good' | 'medium' | 'poor', bitrate: number, packetLoss: number) => void;
  public onChatMessage?: (data: { sender: string; role: string; message: string; timestamp: string }) => void;
  public onVitalsUpdate?: (vitals: any) => void;
  public onCallEnded?: () => void;

  constructor(
    roomId: string,
    userRole: 'doctor' | 'asha' | 'patient',
    localVideoEl: HTMLVideoElement | null = null,
    remoteVideoEl: HTMLVideoElement | null = null
  ) {
    this.roomId = roomId || 'healthway_tele_01';
    this.userRole = userRole || 'patient';
    this.localVideoEl = localVideoEl;
    this.remoteVideoEl = remoteVideoEl;

    this.setupSignaling();
  }

  // ============================================
  // 1. SIGNALING LAYER (BROADCASTCHANNEL FOR MULTI-TAB)
  // ============================================
  private setupSignaling() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.signalingChannel = new BroadcastChannel(`hw_tele_${this.roomId}`);
        this.signalingChannel.onmessage = async (event: MessageEvent<PeerMessage>) => {
          const msg = event.data;
          if (msg.senderId === this.userId) return; // ignore own signals

          switch (msg.type) {
            case 'join':
              if (this.userRole === 'doctor' && msg.senderRole !== 'doctor') {
                // Doctor initiates call to new joiner
                await this.initiateCall();
              }
              break;

            case 'offer':
              await this.handleOffer(msg.payload);
              break;

            case 'answer':
              await this.handleAnswer(msg.payload);
              break;

            case 'candidate':
              if (this.peerConnection && msg.payload) {
                try {
                  await this.peerConnection.addIceCandidate(new RTCIceCandidate(msg.payload));
                } catch (e) {}
              }
              break;

            case 'chat':
              if (this.onChatMessage) {
                this.onChatMessage(msg.payload);
              }
              break;

            case 'vitals':
              if (this.onVitalsUpdate) {
                this.onVitalsUpdate(msg.payload);
              }
              break;

            case 'audio-only-switch':
              this.switchToAudioOnly('Peer requested audio-only mode');
              break;

            case 'end-consultation':
              if (this.onCallEnded) {
                this.onCallEnded();
              }
              break;
          }
        };

        // Broadcast presence
        this.broadcast({
          type: 'join',
          senderId: this.userId,
          senderRole: this.userRole,
          payload: { role: this.userRole },
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Signaling channel init note:', e);
    }
  }

  public broadcast(msg: PeerMessage) {
    if (this.signalingChannel) {
      this.signalingChannel.postMessage(msg);
    }
  }

  // ============================================
  // 2. ACQUIRE MEDIA (ADAPTIVE CONSTRAINTS)
  // ============================================
  async getUserMedia(audioOnly: boolean = false): Promise<MediaStream | null> {
    this.isAudioOnly = audioOnly;

    const constraints: MediaStreamConstraints = audioOnly
      ? {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000 // optimized low bandwidth
          },
          video: false
        }
      : {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 15, max: 30 },
            facingMode: 'user'
          }
        };

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (this.localVideoEl && !audioOnly) {
          this.localVideoEl.srcObject = this.localStream;
        }

        return this.localStream;
      }
    } catch (error) {
      console.warn('Camera access unavailable, attempting audio fallback:', error);
      if (!audioOnly) {
        return this.getUserMedia(true);
      }
    }

    return null;
  }

  // ============================================
  // 3. CREATE PEER CONNECTION & CODECS
  // ============================================
  createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) return this.peerConnection;

    this.peerConnection = new RTCPeerConnection(this.iceServers);

    // Add local tracks to peer
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Remote stream receiver
    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      const stream = event.streams[0];
      if (this.remoteVideoEl && !this.isAudioOnly) {
        this.remoteVideoEl.srcObject = stream;
      }
      if (this.onRemoteStream) {
        this.onRemoteStream(stream);
      }
    };

    // ICE Candidate exchange
    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        this.broadcast({
          type: 'candidate',
          senderId: this.userId,
          senderRole: this.userRole,
          payload: event.candidate.toJSON(),
          timestamp: new Date().toISOString()
        });
      }
    };

    // Connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState || 'disconnected';
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(state);
      }
      if (state === 'failed') {
        this.peerConnection?.restartIce();
      }
    };

    // Apply bitrate codecs
    this.peerConnection.onnegotiationneeded = async () => {
      await this.setLowBandwidthCodecs();
    };

    this.startBandwidthMonitor();

    return this.peerConnection;
  }

  // ============================================
  // 4. LOW-BANDWIDTH CODEC ENCODING CONTROL
  // ============================================
  async setLowBandwidthCodecs(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const senders = this.peerConnection.getSenders();

      const bwLimits: Record<string, { maxBitrate: number; scaleResolutionDownBy: number }> = {
        low: { maxBitrate: 100000, scaleResolutionDownBy: 4 }, // 100 kbps
        medium: { maxBitrate: 300000, scaleResolutionDownBy: 2 }, // 300 kbps
        high: { maxBitrate: 800000, scaleResolutionDownBy: 1 }, // 800 kbps
        auto: { maxBitrate: 300000, scaleResolutionDownBy: 2 }
      };

      const limits = bwLimits[this.currentQuality] || bwLimits.auto;

      for (const sender of senders) {
        if (sender.track?.kind === 'video') {
          const params = sender.getParameters();
          if (!params.encodings || params.encodings.length === 0) {
            params.encodings = [{}];
          }
          params.encodings[0] = { ...params.encodings[0], ...limits };
          await sender.setParameters(params);
        }

        if (sender.track?.kind === 'audio') {
          const params = sender.getParameters();
          if (!params.encodings || params.encodings.length === 0) {
            params.encodings = [{}];
          }
          params.encodings[0].maxBitrate = 32000; // 32kbps opus audio
          await sender.setParameters(params);
        }
      }
    } catch (e) {
      console.warn('Encoding bitrate adjustment note:', e);
    }
  }

  // ============================================
  // 5. BANDWIDTH TELEMETRY MONITOR
  // ============================================
  startBandwidthMonitor(): void {
    if (this.bandwidthInterval) clearInterval(this.bandwidthInterval);

    this.bandwidthInterval = setInterval(async () => {
      if (!this.peerConnection) return;

      try {
        const stats = await this.peerConnection.getStats();
        let totalBitrate = 320000; // Default simulated healthy bitrate
        let packetsLost = 0;

        stats.forEach((stat) => {
          if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
            if (this.lastBytesReceived && stat.bytesReceived) {
              totalBitrate = ((stat.bytesReceived - this.lastBytesReceived) * 8) / 3;
            }
            this.lastBytesReceived = stat.bytesReceived || 0;
            packetsLost = stat.packetsLost || 0;
          }
        });

        let quality: 'good' | 'medium' | 'poor' = 'good';
        if (totalBitrate < 60000 || packetsLost > 10) {
          quality = 'poor';
        } else if (totalBitrate < 180000) {
          quality = 'medium';
        }

        if (this.onBandwidthUpdate) {
          this.onBandwidthUpdate(quality, totalBitrate, packetsLost);
        }

        // Automatic fallback to audio-only if signal is severely degraded
        if (quality === 'poor' && !this.isAudioOnly) {
          this.switchToAudioOnly('Auto-detected poor rural cellular bandwidth (<60kbps)');
        }
      } catch (e) {}
    }, 3000);
  }

  // ============================================
  // 6. CALL INITIATION & ANSWER
  // ============================================
  async initiateCall(): Promise<void> {
    const pc = this.createPeerConnection();

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: !this.isAudioOnly
    });

    await pc.setLocalDescription(offer);

    this.broadcast({
      type: 'offer',
      senderId: this.userId,
      senderRole: this.userRole,
      payload: offer,
      timestamp: new Date().toISOString()
    });
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.broadcast({
      type: 'answer',
      senderId: this.userId,
      senderRole: this.userRole,
      payload: answer,
      timestamp: new Date().toISOString()
    });
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  // ============================================
  // 7. AUDIO-ONLY SWITCH & SCREEN SHARING
  // ============================================
  switchToAudioOnly(reason: string = ''): void {
    if (this.isAudioOnly) return;

    this.isAudioOnly = true;

    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
    }

    if (this.remoteVideoEl) {
      this.remoteVideoEl.style.display = 'none';
    }

    this.broadcast({
      type: 'audio-only-switch',
      senderId: this.userId,
      senderRole: this.userRole,
      payload: { reason },
      timestamp: new Date().toISOString()
    });

    if (this.onQualityChange) {
      this.onQualityChange('audio-only', reason);
    }
  }

  async toggleScreenShare(): Promise<boolean> {
    if (!this.screenStream) {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
          this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenTrack = this.screenStream.getVideoTracks()[0];

          if (this.peerConnection) {
            const sender = this.peerConnection.getSenders().find((s) => s.track?.kind === 'video');
            if (sender) {
              await sender.replaceTrack(screenTrack);
            }
          }

          if (this.localVideoEl) {
            this.localVideoEl.srcObject = this.screenStream;
          }

          screenTrack.onended = () => {
            this.stopScreenShare();
          };

          return true;
        }
      } catch (e) {
        console.warn('Screen share cancelled or unsupported:', e);
      }
      return false;
    } else {
      this.stopScreenShare();
      return false;
    }
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;

      // Restore camera track
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (this.peerConnection && videoTrack) {
          const sender = this.peerConnection.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }
        if (this.localVideoEl) {
          this.localVideoEl.srcObject = this.localStream;
        }
      }
    }
  }

  // ============================================
  // 8. HARDWARE MUTE & VIDEO TOGGLES
  // ============================================
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isMuted = !audioTrack.enabled;
        return this.isMuted;
      }
    }
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoPaused = !videoTrack.enabled;
        return this.isVideoPaused;
      }
    }
    this.isVideoPaused = !this.isVideoPaused;
    return this.isVideoPaused;
  }

  sendChatMessage(message: string): void {
    this.broadcast({
      type: 'chat',
      senderId: this.userId,
      senderRole: this.userRole,
      payload: {
        sender: this.userId,
        role: this.userRole,
        message,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  }

  sendVitals(vitals: any): void {
    this.broadcast({
      type: 'vitals',
      senderId: this.userId,
      senderRole: this.userRole,
      payload: vitals,
      timestamp: new Date().toISOString()
    });
  }

  hangup(): void {
    if (this.bandwidthInterval) clearInterval(this.bandwidthInterval);

    this.broadcast({
      type: 'end-consultation',
      senderId: this.userId,
      senderRole: this.userRole,
      payload: {},
      timestamp: new Date().toISOString()
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.signalingChannel) {
      this.signalingChannel.close();
      this.signalingChannel = null;
    }
  }
}

export default WebRTCHandler;
