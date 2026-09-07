/**
 * HealthWay Doctor Teleconsultation Room Screen
 * Government of Maharashtra - Integrated Rural Health Platform
 * Feature 32: Video Consultation Room with Bandwidth Optimization
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const DoctorTeleconsultRoomScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { session } = useAuth();
  const { language } = useLanguage();

  const patientName = route.params?.patientName || 'Sunita Suresh Gaikwad';
  const abhaId = route.params?.abhaId || '14-4821-9876-5432';
  const age = route.params?.age || 28;
  const gender = route.params?.gender || 'Female';

  const [callDuration, setCallDuration] = useState<number>(75);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [networkBandwidthKbps, setNetworkBandwidthKbps] = useState<number>(240);
  const [isAudioOnlyFallback, setIsAudioOnlyFallback] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'video' | 'chart' | 'vitals'>('video');

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatic bandwidth check for audio-only fallback (< 150 Kbps)
  useEffect(() => {
    setIsAudioOnlyFallback(networkBandwidthKbps < 150);
  }, [networkBandwidthKbps]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const toggleMic = () => setIsAudioMuted(!isAudioMuted);
  const toggleVideo = () => setIsVideoMuted(!isVideoMuted);
  const toggleCamera = () => setCameraFacing(prev => (prev === 'front' ? 'back' : 'front'));
  const toggleSpeaker = () => setIsSpeakerOn(!isSpeakerOn);

  const simulateBandwidthDrop = () => {
    const newBw = networkBandwidthKbps > 150 ? 95 : 350;
    setNetworkBandwidthKbps(newBw);
  };

  const handleEndCall = () => {
    Alert.alert(
      language === 'mr' ? 'सल्ला सत्र समाप्त करा?' : 'End Consultation?',
      language === 'mr'
        ? 'कॉल समाप्त करून डिजिटल औषधोपचार लिहिला जाईल.'
        : 'Consultation will be concluded and you will navigate to Clinical Rx Writer.',
      [
        { text: language === 'mr' ? 'रद्द करा' : 'Cancel', style: 'cancel' },
        {
          text: language === 'mr' ? 'समाप्त करा' : 'End & Write Rx',
          style: 'destructive',
          onPress: () => {
            navigation.navigate('DigitalRx', {
              patientName,
              abhaId,
              visitId: `VIS-${Date.now().toString().slice(-6)}`,
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Teleconsult Room"
        subtitle={`${patientName} (${formatDuration(callDuration)})`}
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={false}
      />

      {/* Network Bandwidth Banner */}
      <View
        style={[
          styles.networkBanner,
          isAudioOnlyFallback ? styles.networkBannerWarning : styles.networkBannerGood,
        ]}
      >
        <View style={styles.networkLeft}>
          <AppIcon
            name={isAudioOnlyFallback ? 'alertTriangle' : 'sync'}
            size={14}
            color={isAudioOnlyFallback ? colors.status.warning : colors.status.success}
          />
          <Text style={styles.networkText}>
            {isAudioOnlyFallback
              ? language === 'mr'
                ? `कमी नेटवर्क (${networkBandwidthKbps} Kbps) - ऑडिओ-ओन्ली मोड सुरू`
                : `Low Bandwidth (${networkBandwidthKbps} Kbps) - Audio-Only Fallback Active`
              : language === 'mr'
              ? `उत्कृष्ट नेटवर्क (${networkBandwidthKbps} Kbps) - एचडी व्हिडिओ कॉल`
              : `HD Video Stable (${networkBandwidthKbps} Kbps)`}
          </Text>
        </View>
        <TouchableOpacity onPress={simulateBandwidthDrop} style={styles.networkSimButton}>
          <Text style={styles.networkSimText}>
            {networkBandwidthKbps < 150 ? 'Simulate 350 Kbps' : 'Simulate 95 Kbps'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Consultation Viewport */}
      <View style={styles.videoViewport}>
        {/* Remote Patient Video Feed Simulation */}
        <View style={styles.remoteVideoFeed}>
          {isAudioOnlyFallback || isVideoMuted ? (
            <View style={styles.audioOnlyPlaceholder}>
              <View style={styles.avatarLarge}>
                <AppIcon name="patient" size={48} color={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.patientNameOverlay}>{patientName}</Text>
              <Text style={styles.audioOnlyCaption}>
                {language === 'mr' ? 'ऑडिओ कॉल चालू आहे' : 'Voice Call in Progress'}
              </Text>
            </View>
          ) : (
            <View style={styles.videoActiveContainer}>
              <View style={styles.simulatedPatientVideo}>
                <AppIcon name="patient" size={64} color="#CBD5E1" />
                <Text style={styles.feedStatusText}>
                  {language === 'mr' ? 'रुग्ण व्हिडिओ स्ट्रीम (सक्रिय)' : 'Patient Video Feed (Active)'}
                </Text>
              </View>
            </View>
          )}

          {/* Picture-in-Picture Doctor Self-View Preview */}
          <View style={styles.selfPreview}>
            <View style={styles.selfPreviewInner}>
              <AppIcon name="doctor" size={20} color={colors.role.doctor} />
              <Text style={styles.selfPreviewText}>
                {cameraFacing === 'front' ? 'Self (Front)' : 'Self (Back)'}
              </Text>
            </View>
          </View>

          {/* Patient Quick Identity Tag Overlay */}
          <View style={styles.identityOverlay}>
            <Text style={styles.identityName}>{patientName}</Text>
            <Text style={styles.identitySub}>{abhaId} · {age}y / {gender}</Text>
          </View>
        </View>
      </View>

      {/* Clinical Notes & Quick Tabs Drawer */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'video' && styles.tabButtonActive]}
          onPress={() => setActiveTab('video')}
        >
          <Text style={[styles.tabText, activeTab === 'video' && styles.tabTextActive]}>
            Call Controls
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'chart' && styles.tabButtonActive]}
          onPress={() => setActiveTab('chart')}
        >
          <Text style={[styles.tabText, activeTab === 'chart' && styles.tabTextActive]}>
            Patient History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'vitals' && styles.tabButtonActive]}
          onPress={() => setActiveTab('vitals')}
        >
          <Text style={[styles.tabText, activeTab === 'vitals' && styles.tabTextActive]}>
            Intake Vitals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content Drawer */}
      <ScrollView style={styles.drawerContent} contentContainerStyle={styles.drawerInner}>
        {activeTab === 'video' && (
          <View style={styles.controlsGrid}>
            <View style={styles.callActionBar}>
              <TouchableOpacity
                style={[styles.controlBtn, isAudioMuted && styles.controlBtnActive]}
                onPress={toggleMic}
              >
                <AppIcon
                  name={isAudioMuted ? 'volumeMute' : 'volumeHigh'}
                  size={20}
                  color={isAudioMuted ? colors.white : colors.slate.dark}
                />
                <Text style={[styles.controlBtnText, isAudioMuted && styles.controlBtnTextActive]}>
                  {isAudioMuted ? 'Unmute' : 'Mute'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlBtn, isVideoMuted && styles.controlBtnActive]}
                onPress={toggleVideo}
              >
                <AppIcon
                  name="video"
                  size={20}
                  color={isVideoMuted ? colors.white : colors.slate.dark}
                />
                <Text style={[styles.controlBtnText, isVideoMuted && styles.controlBtnTextActive]}>
                  {isVideoMuted ? 'Start Cam' : 'Stop Cam'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlBtn} onPress={toggleCamera}>
                <AppIcon name="camera" size={20} color={colors.slate.dark} />
                <Text style={styles.controlBtnText}>Flip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlBtn, !isSpeakerOn && styles.controlBtnActive]}
                onPress={toggleSpeaker}
              >
                <AppIcon
                  name="volumeHigh"
                  size={20}
                  color={!isSpeakerOn ? colors.white : colors.slate.dark}
                />
                <Text style={[styles.controlBtnText, !isSpeakerOn && styles.controlBtnTextActive]}>
                  {isSpeakerOn ? 'Speaker' : 'Earpiece'}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title={language === 'mr' ? 'सल्ला समाप्त करा व औषध लिहा' : 'Conclude Call & Open Rx Writer'}
              variant="danger"
              size="lg"
              icon="phoneEmergency"
              onPress={handleEndCall}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {activeTab === 'chart' && (
          <Card variant="default" title="Longitudinal Medical History" icon="patient">
            <View style={styles.historyRow}>
              <Text style={styles.historyLabel}>Known Allergies:</Text>
              <Badge label="Penicillin (Severe)" variant="danger" size="sm" />
              <Badge label="Sulfa" variant="warning" size="sm" />
            </View>
            <View style={styles.historyRow}>
              <Text style={styles.historyLabel}>Chronic Conditions:</Text>
              <Badge label="Gestational Hypertension" variant="accent" size="sm" />
              <Badge label="Microcytic Anemia" variant="purple" size="sm" />
            </View>
            <Text style={styles.historyNotes}>
              Last ANC Visit: 14 days ago by ASHA Sunita Tai. Fundal height matches gestational age. Prescribed IFA tablets.
            </Text>
          </Card>
        )}

        {activeTab === 'vitals' && (
          <Card variant="default" title="Field Intake Vitals (Sub-Center Tapola)" icon="heartPulse">
            <View style={styles.vitalsGrid}>
              <View style={styles.vitalCard}>
                <Text style={styles.vitalVal}>135/88</Text>
                <Text style={styles.vitalUnit}>mmHg (BP)</Text>
                <Badge label="ELEVATED" variant="warning" size="sm" />
              </View>
              <View style={styles.vitalCard}>
                <Text style={styles.vitalVal}>98%</Text>
                <Text style={styles.vitalUnit}>SpO2</Text>
                <Badge label="NORMAL" variant="success" size="sm" />
              </View>
              <View style={styles.vitalCard}>
                <Text style={styles.vitalVal}>84</Text>
                <Text style={styles.vitalUnit}>bpm (Pulse)</Text>
                <Badge label="NORMAL" variant="success" size="sm" />
              </View>
              <View style={styles.vitalCard}>
                <Text style={styles.vitalVal}>98.6°</Text>
                <Text style={styles.vitalUnit}>°F (Temp)</Text>
                <Badge label="NORMAL" variant="success" size="sm" />
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate.bg,
  },
  networkBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  networkBannerGood: {
    backgroundColor: colors.status.successBg,
    borderColor: colors.status.successBorder,
  },
  networkBannerWarning: {
    backgroundColor: colors.status.warningBg,
    borderColor: colors.status.warningBorder,
  },
  networkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  networkText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate.dark,
  },
  networkSimButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.slate.borderLight,
  },
  networkSimText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  videoViewport: {
    height: 260,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  remoteVideoFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoActiveContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
  },
  simulatedPatientVideo: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  feedStatusText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  audioOnlyPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientNameOverlay: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  audioOnlyCaption: {
    color: colors.status.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  selfPreview: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 90,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  selfPreviewInner: {
    alignItems: 'center',
    gap: 4,
  },
  selfPreviewText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '600',
  },
  identityOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  identityName: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  identitySub: {
    color: '#94A3B8',
    fontSize: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.borderLight,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary.DEFAULT,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate.gray,
  },
  tabTextActive: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  drawerContent: {
    flex: 1,
  },
  drawerInner: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  controlsGrid: {
    gap: spacing.sm,
  },
  callActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate.borderLight,
    gap: 4,
  },
  controlBtnActive: {
    backgroundColor: colors.slate.dark,
    borderColor: colors.slate.dark,
  },
  controlBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate.dark,
  },
  controlBtnTextActive: {
    color: colors.white,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  historyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  historyNotes: {
    fontSize: 12,
    color: colors.slate.gray,
    lineHeight: 18,
    marginTop: 6,
    fontStyle: 'italic',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  vitalCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.slate.bg,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    gap: 2,
  },
  vitalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  vitalUnit: {
    fontSize: 10,
    color: colors.slate.muted,
  },
});
