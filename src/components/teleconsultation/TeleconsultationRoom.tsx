import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Clock, 
  User, 
  Stethoscope, 
  Hospital, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Pill, 
  Send, 
  Printer, 
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  FlaskConical,
  Wifi,
  WifiOff,
  Headphones,
  Monitor,
  MessageSquare,
  Sparkles,
  Volume2,
  Download,
  Languages,
  X,
  ChevronDown,
  Activity,
  HeartPulse,
  Sun,
  Moon,
  Thermometer,
  BellRing
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { WebRTCHandler } from '../../services/webrtcHandler';
import { 
  aiConsultationService, 
  SUPPORTED_LANGUAGES, 
  SymptomAssessmentResult, 
  SimplifiedPrescriptionResult,
  VitalsData,
  VitalsAnalysisResult,
  ConsultationSummaryResult 
} from '../../services/aiConsultationService';
import { CURRENT_PATIENT } from '../../data/mockData';

interface TeleconsultationRoomProps {
  userRole?: 'doctor' | 'asha' | 'patient';
  roomId?: string;
  patientName?: string;
  patientAge?: number | string;
  onExit?: () => void;
}

interface ChatMessageItem {
  id: string;
  sender: string;
  role: 'doctor' | 'asha' | 'patient' | 'system' | 'vitals';
  message: string;
  translation?: string;
  timestamp: string;
}

interface TranscriptItem {
  id: string;
  speaker: 'doctor' | 'asha' | 'patient';
  text: string;
  isFinal: boolean;
  timestamp: string;
}

export default function TeleconsultationRoom({
  userRole = 'doctor',
  roomId = 'tele_mh_phc_402',
  patientName = CURRENT_PATIENT.nameEn,
  patientAge = CURRENT_PATIENT.age,
  onExit
}: TeleconsultationRoomProps) {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  // Media refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const webrtcRef = useRef<WebRTCHandler | null>(null);

  // Connection & Room state
  const [callDuration, setCallDuration] = useState(128);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connected');
  const [networkQuality, setNetworkQuality] = useState<'good' | 'medium' | 'poor'>('good');
  const [bitrateKbps, setBitrateKbps] = useState(340);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<'auto' | 'high' | 'medium' | 'low'>('auto');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // UI Tabs & Panels
  const [activeTab, setActiveTab] = useState<'chat' | 'transcription' | 'ai-assist' | 'vitals'>('chat');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([
    {
      id: 'msg_1',
      sender: 'ASHA Worker Priya',
      role: 'asha',
      message: 'नमस्कार डॉक्टर, रुग्ण संगीता कांबळे उपस्थित आहेत. ७वा महिना सुरू आहे.',
      translation: 'Hello doctor, patient Sangeeta Kamble is present. 7th month of pregnancy.',
      timestamp: '10:32 AM'
    },
    {
      id: 'msg_2',
      sender: 'Dr. Rajesh Kulkarni',
      role: 'doctor',
      message: 'नमस्ते आशा ताई. कृपया रुग्णाचे आजचे रक्तदाब आणि तापमान सांगा.',
      translation: 'Hello ASHA sister. Please provide the patient\'s blood pressure and temperature today.',
      timestamp: '10:33 AM'
    }
  ]);
  const [inputChat, setInputChat] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [selectedTranslateLang, setSelectedTranslateLang] = useState('mr');
  const [isVoiceTyping, setIsVoiceTyping] = useState(false);

  // Live Transcription State
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 'tr_1',
      speaker: 'doctor',
      text: 'संगीता ताई, पायावर सूज कधीपासून जाणवत आहे?',
      isFinal: true,
      timestamp: '10:33 AM'
    },
    {
      id: 'tr_2',
      speaker: 'patient',
      text: 'डॉक्टर साहेब, गेल्या ३-४ दिवसांपासून संध्याकाळी पाय थोडे जड वाटतात.',
      isFinal: true,
      timestamp: '10:34 AM'
    }
  ]);
  const [clinicalNotes, setClinicalNotes] = useState(
    'रुग्ण ७व्या महिन्यात आहे. गर्भाचे ठोके सामान्य (१४४ bpm). हिमोग्लोबिन १०.२ g/dL थोडे कमी आहे. आहारात गूळ, शेंगदाणे, हिरव्या भाज्या वाढवण्याचा सल्ला दिला.'
  );

  // AI Symptom Checker State
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomTags, setSymptomTags] = useState<string[]>([
    'Moderate fatigue',
    'Afternoon mild headache',
    'Mild pedal edema'
  ]);
  const [symptomResult, setSymptomResult] = useState<SymptomAssessmentResult | null>(null);
  const [isCheckingSymptoms, setIsCheckingSymptoms] = useState(false);

  // Prescription Simplifier State
  const [prescriptionInput, setPrescriptionInput] = useState(
    'Tab. Iron Folic Acid 100mg OD night, Tab. Calcium Carbonate 500mg OD afternoon post lunch, Tab. Paracetamol 500mg SOS'
  );
  const [simplifiedPrescription, setSimplifiedPrescription] = useState<SimplifiedPrescriptionResult | null>(null);
  const [isSimplifyingRx, setIsSimplifyingRx] = useState(false);

  // Vitals State
  const [vitalTemp, setVitalTemp] = useState('98.6');
  const [vitalBPSys, setVitalBPSys] = useState('130');
  const [vitalBPDia, setVitalBPDia] = useState('84');
  const [vitalHR, setVitalHR] = useState('78');
  const [vitalSpO2, setVitalSpO2] = useState('98');
  const [vitalWeight, setVitalWeight] = useState('56');
  const [vitalsAnalysis, setVitalsAnalysis] = useState<VitalsAnalysisResult | null>(null);

  // Modals & Alerts
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<ConsultationSummaryResult | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [bandwidthAlertMessage, setBandwidthAlertMessage] = useState<string | null>(null);
  const [incomingCallBanner, setIncomingCallBanner] = useState(false);

  // 1. Initialize WebRTC & Media
  useEffect(() => {
    const handler = new WebRTCHandler(roomId, userRole);
    webrtcRef.current = handler;

    handler.onRemoteStream = (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setConnectionStatus('connected');
    };

    handler.onConnectionStateChange = (state) => {
      if (state === 'connected') setConnectionStatus('connected');
      else if (state === 'connecting') setConnectionStatus('connecting');
      else setConnectionStatus('disconnected');
    };

    handler.onQualityChange = (quality, reason) => {
      if (quality === 'audio-only') {
        setIsAudioOnly(true);
        setBandwidthAlertMessage(reason || 'Low cellular network detected. Switched to audio mode.');
      }
    };

    handler.onBandwidthUpdate = (quality, bitrate, packetLoss) => {
      setNetworkQuality(quality);
      setBitrateKbps(Math.round(bitrate / 1000));
    };

    handler.onChatMessage = (msg) => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          sender: msg.sender,
          role: msg.role as any,
          message: msg.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      if (activeTab !== 'chat') {
        setUnreadChatCount(c => c + 1);
      }
    };

    handler.onVitalsUpdate = (vitals) => {
      if (vitals.temperature) setVitalTemp(String(vitals.temperature));
      if (vitals.bpSys) setVitalBPSys(String(vitals.bpSys));
      if (vitals.bpDia) setVitalBPDia(String(vitals.bpDia));
      if (vitals.heartRate) setVitalHR(String(vitals.heartRate));
      if (vitals.spo2) setVitalSpO2(String(vitals.spo2));
    };

    handler.onCallEnded = () => {
      handleOpenSummaryModal();
    };

    // Acquire camera stream
    handler.getUserMedia(isAudioOnly).then(stream => {
      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });

    // Call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Initial vitals check
    handleAnalyzeVitals();

    return () => {
      clearInterval(timer);
      handler.hangup();
      aiConsultationService.stopSpeech();
    };
  }, [roomId, userRole]);

  // Format MM:SS timer
  const formatTimer = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. Chat Methods
  const handleSendMessage = async () => {
    if (!inputChat.trim()) return;
    const originalText = inputChat.trim();
    setInputChat('');

    let translatedText: string | undefined;
    if (autoTranslate && selectedTranslateLang !== 'en') {
      translatedText = await aiConsultationService.translateText(originalText, 'auto', selectedTranslateLang);
    }

    const newMsg: ChatMessageItem = {
      id: `msg_${Date.now()}`,
      sender: userRole === 'doctor' ? 'Dr. Rajesh Kulkarni' : userRole === 'asha' ? 'ASHA Priya' : patientName,
      role: userRole,
      message: originalText,
      translation: translatedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);

    if (webrtcRef.current) {
      webrtcRef.current.sendChatMessage(originalText);
    }
  };

  const handleQuickChat = (phrase: string) => {
    setInputChat(phrase);
  };

  const handleVoiceInput = () => {
    if (isVoiceTyping) return;
    setIsVoiceTyping(true);

    const stt = aiConsultationService.startSpeechRecognition(
      (transcript, isFinal) => {
        setInputChat(transcript);
        if (isFinal) {
          setIsVoiceTyping(false);
        }
      },
      () => setIsVoiceTyping(false),
      selectedTranslateLang
    );

    if (!stt) {
      setIsVoiceTyping(false);
      alert('Voice recognition not supported in this browser. Please use Chrome.');
    }
  };

  // 3. AI Symptom Check
  const handleAddSymptom = () => {
    if (!symptomInput.trim()) return;
    if (!symptomTags.includes(symptomInput.trim())) {
      setSymptomTags([...symptomTags, symptomInput.trim()]);
    }
    setSymptomInput('');
  };

  const handleRemoveSymptom = (s: string) => {
    setSymptomTags(symptomTags.filter(item => item !== s));
  };

  const handleAnalyzeSymptoms = async () => {
    if (symptomTags.length === 0) return;
    setIsCheckingSymptoms(true);
    try {
      const res = await aiConsultationService.preAssessSymptoms(symptomTags, patientAge, 'female', lang);
      setSymptomResult(res);
    } finally {
      setIsCheckingSymptoms(false);
    }
  };

  // 4. Prescription Simplifier
  const handleSimplifyRx = async () => {
    if (!prescriptionInput.trim()) return;
    setIsSimplifyingRx(true);
    try {
      const res = await aiConsultationService.simplifyPrescription(prescriptionInput, lang);
      setSimplifiedPrescription(res);
    } finally {
      setIsSimplifyingRx(false);
    }
  };

  // 5. Vitals Telemetry & Analysis
  const handleAnalyzeVitals = () => {
    const vitalsData: VitalsData = {
      temperature: parseFloat(vitalTemp) || 98.6,
      bloodPressure: {
        systolic: parseFloat(vitalBPSys) || 120,
        diastolic: parseFloat(vitalBPDia) || 80
      },
      heartRate: parseFloat(vitalHR) || 72,
      spo2: parseFloat(vitalSpO2) || 98,
      weight: parseFloat(vitalWeight) || 55
    };

    const res = aiConsultationService.analyzeVitals(vitalsData, patientAge, 'female');
    setVitalsAnalysis(res);
  };

  const handleShareVitals = () => {
    handleAnalyzeVitals();
    const vitalsMsg = `[Vitals Update]: Temp: ${vitalTemp}°F | BP: ${vitalBPSys}/${vitalBPDia} mmHg | HR: ${vitalHR} bpm | SpO2: ${vitalSpO2}% | Wt: ${vitalWeight} kg`;
    
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        sender: userRole.toUpperCase(),
        role: 'vitals',
        message: vitalsMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    if (webrtcRef.current) {
      webrtcRef.current.sendChatMessage(vitalsMsg);
      webrtcRef.current.sendVitals({
        temperature: vitalTemp,
        bpSys: vitalBPSys,
        bpDia: vitalBPDia,
        heartRate: vitalHR,
        spo2: vitalSpO2
      });
    }
  };

  // 6. Call Controls
  const handleToggleMute = () => {
    if (webrtcRef.current) {
      const muted = webrtcRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const handleToggleVideo = () => {
    if (webrtcRef.current) {
      const paused = webrtcRef.current.toggleVideo();
      setIsVideoOff(paused);
    }
  };

  const handleToggleScreenShare = async () => {
    if (webrtcRef.current) {
      const sharing = await webrtcRef.current.toggleScreenShare();
      setIsScreenSharing(sharing);
    }
  };

  const handleQualityChange = (q: 'auto' | 'high' | 'medium' | 'low') => {
    setCurrentQuality(q);
    if (webrtcRef.current) {
      webrtcRef.current.currentQuality = q;
      webrtcRef.current.setLowBandwidthCodecs();
    }
  };

  const handleToggleAudioOnly = () => {
    const next = !isAudioOnly;
    setIsAudioOnly(next);
    if (webrtcRef.current) {
      if (next) {
        webrtcRef.current.switchToAudioOnly('User enabled low data mode');
      } else {
        webrtcRef.current.getUserMedia(false).then(stream => {
          if (stream && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        });
      }
    }
  };

  // 7. Consultation Summary Generation
  const handleOpenSummaryModal = () => {
    setIsGeneratingSummary(true);
    setIsSummaryModalOpen(true);

    const fullTranscript = transcripts.map(t => `${t.speaker}: ${t.text}`).join('\n');
    const summary = aiConsultationService.generateConsultationSummary(
      fullTranscript,
      { name: patientName, age: patientAge },
      { temperature: vitalTemp, heartRate: vitalHR, spo2: vitalSpO2 },
      clinicalNotes
    );

    setSummaryData(summary);
    setIsGeneratingSummary(false);
  };

  const handleEndCall = () => {
    if (window.confirm(lang === 'mr' ? 'सल्लामसलत पूर्ण करायची आहे का?' : 'Are you sure you want to end the consultation?')) {
      handleOpenSummaryModal();
      if (webrtcRef.current) {
        webrtcRef.current.hangup();
      }
    }
  };

  const handleReadSummaryAloud = () => {
    if (!summaryData) return;
    const textToRead = lang === 'mr'
      ? `रुग्ण नाव: ${patientName}. प्राथमिक तक्रार: ${summaryData.chiefComplaint}. डॉक्टर निष्कर्ष: ${summaryData.doctorFindings}. पुढील सूचना: ${summaryData.patientInstructions.join('. ')}`
      : `Patient: ${patientName}. Chief complaint: ${summaryData.chiefComplaint}. Doctor findings: ${summaryData.doctorFindings}. Instructions: ${summaryData.patientInstructions.join('. ')}`;

    aiConsultationService.textToSpeech(textToRead, lang);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0B1727] text-white overflow-hidden select-none font-sans">
      
      {/* 1. TOP TELEMETRY STATUS BAR */}
      <header className="h-12 bg-[#0F233D] border-b border-blue-900/40 px-4 flex items-center justify-between text-xs z-30 shrink-0">
        
        {/* Left: Status indicator & Room info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onExit ? onExit() : navigate(-1)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'mr' ? 'मागे जा' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`} />
            <span className="font-bold text-slate-100 hidden sm:inline">
              {connectionStatus === 'connected' 
                ? (lang === 'mr' ? 'थेट सुरक्षित जोडणी' : 'P2P Encrypted Call') 
                : (lang === 'mr' ? 'जोडणी करत आहे...' : 'Connecting...')}
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              {roomId}
            </span>
          </div>
        </div>

        {/* Center: Bandwidth Telemetry & Data Mode */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px]">
            {networkQuality === 'good' ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : networkQuality === 'medium' ? (
              <Wifi className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className="font-mono font-semibold">{bitrateKbps} kbps</span>
            <span className="text-[10px] text-slate-400 hidden md:inline">({networkQuality})</span>
          </div>

          <div className="flex items-center gap-1.5 text-blue-200 font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTimer(callDuration)}</span>
          </div>
        </div>

        {/* Right: Role & Panel Toggles */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            userRole === 'doctor' ? 'bg-blue-600 text-white' : userRole === 'asha' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            {userRole === 'doctor' ? 'Doctor MO' : userRole === 'asha' ? 'ASHA Assist' : 'Patient'}
          </span>

          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={`p-1.5 rounded-lg border transition ${
              rightPanelOpen ? 'bg-[#1A4B8C] border-blue-500 text-white' : 'bg-white/10 border-slate-700 text-slate-300 hover:bg-white/20'
            }`}
            title="Toggle Right Intelligence Panel"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. BANDWIDTH ALERT BANNER */}
      {bandwidthAlertMessage && (
        <div className="bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-950 shrink-0" />
            <span>{bandwidthAlertMessage}</span>
          </div>
          <button 
            onClick={() => setBandwidthAlertMessage(null)}
            className="p-1 hover:bg-black/10 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. MAIN STAGE (VIDEO + RIGHT INTELLIGENCE PANEL) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left/Center Video Stage */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          
          {/* Main Remote Video */}
          <div className="w-full h-full relative flex items-center justify-center">
            {isAudioOnly ? (
              // Audio-Only Low-Bandwidth Mode Graphic
              <div className="flex flex-col items-center justify-center gap-4 text-center p-6 animate-in fade-in">
                <div className="w-24 h-24 rounded-full bg-blue-950/80 border-2 border-blue-500/50 flex items-center justify-center shadow-lg">
                  <Headphones className="w-10 h-10 text-blue-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {lang === 'mr' ? 'ऑडिओ सल्लामसलत सक्रिय' : 'Audio-Only Consultation Active'}
                  </h3>
                  <p className="text-xs text-blue-300 mt-1">
                    {lang === 'mr' 
                      ? 'कमी बँडविड्थ मोड — ८५% इंटरनेट डेटा बचत आणि अखंड आवाज.' 
                      : 'Low bandwidth mode conserving 85% data for crystal-clear audio.'}
                  </p>
                </div>
                
                {/* Visual Audio Wave Bars */}
                <div className="flex items-center gap-1.5 h-8 mt-2">
                  <div className="w-1.5 bg-emerald-400 rounded-full h-4 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 bg-emerald-400 rounded-full h-7 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 bg-emerald-400 rounded-full h-5 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="w-1.5 bg-emerald-400 rounded-full h-8 animate-bounce" style={{ animationDelay: '450ms' }} />
                  <div className="w-1.5 bg-emerald-400 rounded-full h-3 animate-bounce" style={{ animationDelay: '600ms' }} />
                </div>
              </div>
            ) : (
              // Active Video Stream
              <div className="w-full h-full relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Video Overlay Info */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <span className="font-bold text-white">
                      {userRole === 'doctor' ? `${patientName} (Sub-Centre ASHA Unit)` : 'Dr. Rajesh Kulkarni (PHC Medical Officer)'}
                    </span>
                    <span className="text-[10px] text-blue-300 block">
                      ABHA ID: 91-4029-8812-4410
                    </span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 text-[11px] text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ABDM Certified Telehealth</span>
                </div>
              </div>
            )}

            {/* Local Video Picture-in-Picture */}
            {!isAudioOnly && (
              <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-44 sm:h-32 rounded-xl overflow-hidden border-2 border-[#1A4B8C] bg-slate-900 shadow-2xl z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute bottom-1.5 left-2 text-[10px] bg-black/70 px-1.5 py-0.5 rounded text-white font-semibold">
                  {lang === 'mr' ? 'तुम्ही (स्थानिक)' : 'You (Local)'}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Intelligence Panel (Tabs: Chat, Notes, AI Assist, Vitals) */}
        {rightPanelOpen && (
          <aside className="w-80 sm:w-96 bg-[#0E1E33] border-l border-blue-900/40 flex flex-col z-20 shrink-0">
            
            {/* Panel Tabs Header */}
            <div className="flex border-b border-blue-900/40 bg-[#0A1627] text-xs">
              <button
                onClick={() => { setActiveTab('chat'); setUnreadChatCount(0); }}
                className={`flex-1 py-3 px-2 text-center font-bold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  activeTab === 'chat'
                    ? 'border-blue-500 text-blue-400 bg-blue-950/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'चॅट' : 'Chat'}</span>
                {unreadChatCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-mono flex items-center justify-center">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('transcription')}
                className={`flex-1 py-3 px-2 text-center font-bold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  activeTab === 'transcription'
                    ? 'border-blue-500 text-blue-400 bg-blue-950/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'नोंदी' : 'Notes'}</span>
              </button>

              <button
                onClick={() => setActiveTab('ai-assist')}
                className={`flex-1 py-3 px-2 text-center font-bold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  activeTab === 'ai-assist'
                    ? 'border-blue-500 text-blue-400 bg-blue-950/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'mr' ? 'एआय' : 'AI Help'}</span>
              </button>

              <button
                onClick={() => setActiveTab('vitals')}
                className={`flex-1 py-3 px-2 text-center font-bold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  activeTab === 'vitals'
                    ? 'border-blue-500 text-blue-400 bg-blue-950/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                <span>{lang === 'mr' ? 'व्हायटल्स' : 'Vitals'}</span>
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              
              {/* TAB 1: CHAT */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-full space-y-3">
                  {/* Auto-Translate Control Bar */}
                  <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-900/50 flex items-center justify-between text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-medium">
                      <input
                        type="checkbox"
                        checked={autoTranslate}
                        onChange={(e) => setAutoTranslate(e.target.checked)}
                        className="rounded border-slate-600 text-blue-600 focus:ring-0"
                      />
                      <span>{lang === 'mr' ? 'स्वयंचलित भाषांतर' : 'Auto-Translate (11 Langs)'}</span>
                    </label>

                    <select
                      value={selectedTranslateLang}
                      onChange={(e) => setSelectedTranslateLang(e.target.value)}
                      className="bg-[#0B1727] text-blue-300 border border-blue-800 rounded px-2 py-0.5 text-[11px] outline-none"
                    >
                      {SUPPORTED_LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl max-w-[90%] leading-relaxed ${
                          msg.role === userRole
                            ? 'ml-auto bg-[#1A4B8C] text-white'
                            : msg.role === 'vitals'
                            ? 'mx-auto w-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 font-mono text-[11px]'
                            : 'mr-auto bg-slate-800 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1 text-[10px] text-blue-200 font-semibold">
                          <span>{msg.sender}</span>
                          <span className="text-slate-400 font-normal">{msg.timestamp}</span>
                        </div>
                        <p>{msg.message}</p>
                        {msg.translation && (
                          <div className="mt-1.5 pt-1.5 border-t border-white/15 text-[11px] text-blue-200 italic flex items-center gap-1">
                            <Languages className="w-3 h-3 shrink-0 text-blue-300" />
                            <span>{msg.translation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Phrase Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] whitespace-nowrap">
                    <button
                      onClick={() => handleQuickChat(lang === 'mr' ? 'माझा आवाज येतोय का?' : 'Can you hear me clearly?')}
                      className="px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    >
                      {lang === 'mr' ? 'आवाज येतोय का?' : 'Hear me?'}
                    </button>
                    <button
                      onClick={() => handleQuickChat(lang === 'mr' ? 'व्हायटल्स तपासा' : 'Check vitals now')}
                      className="px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    >
                      {lang === 'mr' ? 'व्हायटल्स तपासा' : 'Check Vitals'}
                    </button>
                    <button
                      onClick={() => handleQuickChat(lang === 'mr' ? 'प्रिस्क्रिप्शन तयार आहे' : 'Prescription is ready')}
                      className="px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    >
                      {lang === 'mr' ? 'प्रिस्क्रिप्शन तयार' : 'Rx Ready'}
                    </button>
                  </div>

                  {/* Message Input Box */}
                  <div className="flex items-center gap-2 pt-1 border-t border-blue-900/40">
                    <button
                      onClick={handleVoiceInput}
                      className={`p-2 rounded-xl transition ${
                        isVoiceTyping ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title="Voice Speech-to-Text Input"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={inputChat}
                      onChange={(e) => setInputChat(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={lang === 'mr' ? 'संदेश टाइप करा किंवा बोला...' : 'Type message or use voice...'}
                      className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />

                    <button
                      onClick={handleSendMessage}
                      className="p-2 rounded-xl bg-[#1A4B8C] hover:bg-blue-600 text-white transition shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE TRANSCRIPTION & DOCTOR NOTES */}
              {activeTab === 'transcription' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      {lang === 'mr' ? 'थेट ऑडिओ ट्रान्सक्रिप्शन' : 'Live Speech Transcription'}
                    </span>
                    <button
                      onClick={() => setIsTranscribing(!isTranscribing)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isTranscribing ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isTranscribing ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Listening
                        </span>
                      ) : 'Paused'}
                    </button>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 text-xs">
                    {transcripts.map(t => (
                      <div key={t.id} className="leading-relaxed">
                        <span className={`text-[10px] font-bold font-mono uppercase px-1.5 py-0.2 rounded mr-1.5 ${
                          t.speaker === 'doctor' ? 'bg-blue-900 text-blue-300' : 'bg-emerald-900 text-emerald-300'
                        }`}>
                          {t.speaker}
                        </span>
                        <span className="text-slate-300">{t.text}</span>
                      </div>
                    ))}
                    {isTranscribing && (
                      <div className="text-[11px] text-blue-400 italic flex items-center gap-1.5 pt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                        <span>Capturing speech stream...</span>
                      </div>
                    )}
                  </div>

                  {/* Doctor Clinical Notes Editor */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        {lang === 'mr' ? 'वैद्यकीय अधिकाऱ्याच्या नोंदी' : 'Clinical Officer Notes'}
                      </span>
                      <span className="text-[10px] text-slate-400">ABHA Auto-Sync</span>
                    </div>

                    <textarea
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500"
                    />

                    <button
                      onClick={() => alert('Notes saved to patient longitudinal record!')}
                      className="w-full py-2 rounded-xl bg-[#1A4B8C] hover:bg-blue-600 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'नोंदी जतन करा' : 'Save Notes to EHR'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: AI ASSIST (SYMPTOM PRE-CHECK & PRESCRIPTION SIMPLIFIER) */}
              {activeTab === 'ai-assist' && (
                <div className="space-y-4">
                  {/* 1. Quick Symptom Pre-Check */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Stethoscope className="w-4 h-4" />
                      <span>{lang === 'mr' ? 'लक्षण पूर्व-मूल्यांकन' : 'AI Symptom Pre-Assessment'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSymptom()}
                        placeholder="Add symptom (e.g. fever, headache)..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                      />
                      <button
                        onClick={handleAddSymptom}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {symptomTags.map(s => (
                        <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800 text-[11px] text-blue-200">
                          {s}
                          <button onClick={() => handleRemoveSymptom(s)} className="hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={handleAnalyzeSymptoms}
                      disabled={isCheckingSymptoms || symptomTags.length === 0}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isCheckingSymptoms ? 'Evaluating...' : (lang === 'mr' ? 'लक्षणे विश्लेषित करा' : 'Analyze Symptoms')}</span>
                    </button>

                    {/* Symptom Results Card */}
                    {symptomResult && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-blue-900/60 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300">Urgency Level:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            symptomResult.urgencyLevel === 'immediate'
                              ? 'bg-red-900 text-red-300'
                              : symptomResult.urgencyLevel === 'urgent'
                              ? 'bg-amber-900 text-amber-300'
                              : 'bg-emerald-900 text-emerald-300'
                          }`}>
                            {symptomResult.urgencyLevel}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block">Possible Concerns:</span>
                          <ul className="list-disc pl-4 text-slate-300 space-y-0.5 text-[11px] mt-0.5">
                            {symptomResult.possibleConcerns.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block">Frontline Action:</span>
                          <ul className="list-disc pl-4 text-emerald-300 space-y-0.5 text-[11px] mt-0.5">
                            {symptomResult.immediateActions.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Prescription Simplifier */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Pill className="w-4 h-4" />
                        <span>{lang === 'mr' ? 'प्रिस्क्रिप्शन सुलभ करा' : 'Prescription Simplifier'}</span>
                      </div>
                    </div>

                    <textarea
                      value={prescriptionInput}
                      onChange={(e) => setPrescriptionInput(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                    />

                    <button
                      onClick={handleSimplifyRx}
                      disabled={isSimplifyingRx}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>{isSimplifyingRx ? 'Processing...' : (lang === 'mr' ? 'सुलभ औषध तक्ता तयार करा' : 'Generate Visual Patient Cards')}</span>
                    </button>

                    {/* Simplified Prescription Output */}
                    {simplifiedPrescription && (
                      <div className="space-y-2 pt-1">
                        {simplifiedPrescription.medicines.map((m, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-emerald-900/50 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{m.name}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                {m.howManyTablets}
                              </span>
                            </div>
                            
                            {m.localName && (
                              <p className="text-[11px] text-blue-300">{m.localName}</p>
                            )}

                            {/* Visual Daily Timing Cues */}
                            <div className="flex items-center gap-2 pt-1 text-[10px] font-semibold">
                              <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                                m.timingCues.morning ? 'bg-amber-900/60 text-amber-300 border border-amber-700' : 'bg-slate-900 text-slate-500'
                              }`}>
                                <Sun className="w-3 h-3" />
                                {lang === 'mr' ? 'सकाळी' : 'Morning'}
                              </span>

                              <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                                m.timingCues.afternoon ? 'bg-amber-900/60 text-amber-300 border border-amber-700' : 'bg-slate-900 text-slate-500'
                              }`}>
                                <Sun className="w-3 h-3" />
                                {lang === 'mr' ? 'दुपारी' : 'Afternoon'}
                              </span>

                              <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                                m.timingCues.night ? 'bg-blue-900/60 text-blue-300 border border-blue-700' : 'bg-slate-900 text-slate-500'
                              }`}>
                                <Moon className="w-3 h-3" />
                                {lang === 'mr' ? 'रात्री' : 'Night'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                              {m.whyTaking} ({m.withOrWithoutFood})
                            </p>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const text = simplifiedPrescription.medicines
                              .map(m => `${m.name}: ${m.howManyTablets}, ${m.whenToTake}`)
                              .join('. ');
                            aiConsultationService.textToSpeech(text, lang);
                          }}
                          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{lang === 'mr' ? 'मराठीत वाचून दाखवा (Audio)' : 'Read Aloud in Local Language'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: VITALS TELEMETRY & CLINICAL TRIAGE */}
              {activeTab === 'vitals' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      {lang === 'mr' ? 'रुग्ण शारीरिक तपासणी (Vitals)' : 'Frontline Patient Vitals'}
                    </span>
                    <span className="text-[10px] text-emerald-400">Live Telemetry</span>
                  </div>

                  {/* Vitals Inputs */}
                  <div className="space-y-2.5">
                    {/* Temperature */}
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-slate-300">Temp (°F)</span>
                      </div>
                      <input
                        type="number"
                        value={vitalTemp}
                        onChange={(e) => setVitalTemp(e.target.value)}
                        className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-right text-white font-mono"
                      />
                    </div>

                    {/* Blood Pressure */}
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rose-400" />
                        <span className="text-xs text-slate-300">BP (mmHg)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={vitalBPSys}
                          onChange={(e) => setVitalBPSys(e.target.value)}
                          className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-right text-white font-mono"
                        />
                        <span className="text-slate-500">/</span>
                        <input
                          type="number"
                          value={vitalBPDia}
                          onChange={(e) => setVitalBPDia(e.target.value)}
                          className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-right text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Heart Rate */}
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-slate-300">Pulse (bpm)</span>
                      </div>
                      <input
                        type="number"
                        value={vitalHR}
                        onChange={(e) => setVitalHR(e.target.value)}
                        className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-right text-white font-mono"
                      />
                    </div>

                    {/* SpO2 */}
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-slate-300">SpO2 (%)</span>
                      </div>
                      <input
                        type="number"
                        value={vitalSpO2}
                        onChange={(e) => setVitalSpO2(e.target.value)}
                        className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-right text-white font-mono"
                      />
                    </div>

                    {/* Weight */}
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-slate-300">Weight (kg)</span>
                      </div>
                      <input
                        type="number"
                        value={vitalWeight}
                        onChange={(e) => setVitalWeight(e.target.value)}
                        className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-right text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Action: Share with Doctor & AI Analyze */}
                  <button
                    onClick={handleShareVitals}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'mr' ? 'डॉक्टरांशी शेअर करा व विश्लेषित करा' : 'Share & AI Analyze Vitals'}</span>
                  </button>

                  {/* AI Vitals Analysis Result */}
                  {vitalsAnalysis && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">Overall Status:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          vitalsAnalysis.overallStatus === 'critical'
                            ? 'bg-red-900 text-red-300'
                            : vitalsAnalysis.overallStatus === 'concerning'
                            ? 'bg-amber-900 text-amber-300'
                            : 'bg-emerald-900 text-emerald-300'
                        }`}>
                          {vitalsAnalysis.overallStatus}
                        </span>
                      </div>

                      {vitalsAnalysis.alerts.length > 0 ? (
                        <div className="space-y-1">
                          {vitalsAnalysis.alerts.map((a, idx) => (
                            <p key={idx} className="text-amber-300 text-[11px] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{a}</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-emerald-400 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>All biomarkers in normal range.</span>
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-1.5 leading-relaxed">
                        {vitalsAnalysis.recommendation}
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>
          </aside>
        )}

      </div>

      {/* 4. BOTTOM FLOATING CALL CONTROL BAR */}
      <footer className="h-16 bg-[#0A1627] border-t border-blue-900/40 px-4 sm:px-8 flex items-center justify-between text-xs z-30 shrink-0">
        
        {/* Left: Media Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleToggleVideo}
            className={`p-3 rounded-2xl transition shadow-sm ${
              isVideoOff ? 'bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Toggle Camera"
          >
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>

          <button
            onClick={handleToggleMute}
            className={`p-3 rounded-2xl transition shadow-sm ${
              isMuted ? 'bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Toggle Microphone"
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={handleToggleScreenShare}
            className={`p-3 rounded-2xl transition shadow-sm hidden sm:flex ${
              isScreenSharing ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Share Screen"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Bandwidth Controls & Audio-Only mode */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold">{lang === 'mr' ? 'गुणवत्ता:' : 'Quality:'}</span>
            <select
              value={currentQuality}
              onChange={(e) => handleQualityChange(e.target.value as any)}
              className="bg-transparent text-blue-300 font-semibold outline-none cursor-pointer text-xs"
            >
              <option value="auto" className="bg-slate-900">Auto Adaptive</option>
              <option value="high" className="bg-slate-900">HD (800 kbps)</option>
              <option value="medium" className="bg-slate-900">SD (300 kbps)</option>
              <option value="low" className="bg-slate-900">Low (100 kbps)</option>
            </select>
          </div>

          <button
            onClick={handleToggleAudioOnly}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              isAudioOnly ? 'bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isAudioOnly ? (lang === 'mr' ? 'ऑडिओ मोड सुरू' : 'Audio Only Active') : (lang === 'mr' ? 'कमी डेटा मोड' : 'Audio Mode')}
            </span>
          </button>
        </div>

        {/* Right: AI Summary & End Call */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleOpenSummaryModal}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">{lang === 'mr' ? 'एआय सारांश' : 'AI Summary'}</span>
          </button>

          <button
            onClick={handleEndCall}
            className="px-4 sm:px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{lang === 'mr' ? 'कॉल समाप्त' : 'End Call'}</span>
          </button>
        </div>

      </footer>

      {/* 5. AI CONSULTATION SUMMARY MODAL */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1E33] border border-blue-900/60 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1A4B8C] to-blue-900 text-white flex items-center justify-between border-b border-blue-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {lang === 'mr' ? 'डिजिटल सल्लामसलत सारांश (AI Summary)' : 'Official Teleconsultation Clinical Summary'}
                  </h3>
                  <p className="text-[10px] text-blue-200">
                    ABDM M2 Compliant FHIR R4 Bundle Record
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {isGeneratingSummary || !summaryData ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-300">Generating structured clinical documentation with AI...</p>
                </div>
              ) : (
                <>
                  {/* Urgency & Patient Details */}
                  <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="font-bold text-white text-sm">{patientName}</span>
                      <span className="text-slate-400 text-xs ml-2">Age: {patientAge} | Female | ANC 3rd Trimester</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      summaryData.urgencyLevel === 'high' ? 'bg-red-900 text-red-300' : summaryData.urgencyLevel === 'medium' ? 'bg-amber-900 text-amber-300' : 'bg-emerald-900 text-emerald-300'
                    }`}>
                      Urgency: {summaryData.urgencyLevel}
                    </span>
                  </div>

                  {/* Chief Complaint */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                      Chief Complaint / मुख्य तक्रार
                    </h4>
                    <p className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200 leading-relaxed">
                      {summaryData.chiefComplaint}
                    </p>
                  </div>

                  {/* Doctor Findings & Diagnosis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                        Doctor Clinical Findings
                      </h4>
                      <p className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200 leading-relaxed text-[11px]">
                        {summaryData.doctorFindings}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                        Preliminary Diagnosis
                      </h4>
                      <p className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200 leading-relaxed text-[11px]">
                        {summaryData.diagnosis}
                      </p>
                    </div>
                  </div>

                  {/* Prescribed Medications */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                      Prescribed Medications / औषधोपचार
                    </h4>
                    <div className="space-y-1.5">
                      {summaryData.prescriptions.map((rx, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white">{rx.medicine}</span>
                            <span className="text-[11px] text-slate-400 block">{rx.dosage} • {rx.frequency}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                            {rx.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patient Instructions in Local Language */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                      Patient Instructions / रुग्णासाठी सूचना
                    </h4>
                    <ul className="list-disc pl-5 text-slate-200 space-y-1 text-[11px] leading-relaxed">
                      {summaryData.patientInstructions.map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Follow-up & Next steps */}
                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-200">Follow-up Date:</span>
                      <span className="text-blue-300 ml-1.5">{summaryData.followUpDate}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-200">Referral:</span>
                      <span className="text-emerald-400 ml-1.5">{summaryData.referralType}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReadSummaryAloud}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 transition flex items-center gap-1.5 font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'वाचून दाखवा (Audio)' : 'Read Aloud'}</span>
                </button>

                <button
                  onClick={handlePrintSummary}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'प्रिंट करा' : 'Print'}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  alert('Consultation record successfully synchronized with Ayushman Bharat ABHA Health Locker!');
                  setIsSummaryModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'ABHA रेकॉर्डमध्ये सिंक करा' : 'Sync to ABHA EHR'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
