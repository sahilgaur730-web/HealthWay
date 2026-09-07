/**
 * ASHA Multilingual Voice Intake Screen (Feature 29)
 * HealthWay Native Mobile Platform - ASHA Community Module
 * Low-literacy speech-to-text intake with clinical entity extraction
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { storageEngine } from '../../storage/storageEngine';
import {
  VoiceRecordingSession,
  ExtractedClinicalEntities,
  SAMPLE_CLINICAL_VOICE_CORPUS,
  validateAudioDuration,
  capAudioDuration,
  extractClinicalEntities,
} from '../../services/voiceIntakeService';

export const VoiceIntakeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { language } = useLanguage();
  const { session } = useAuth();

  const patientId = route.params?.patientId || 'PT-WALKIN';

  // Recording State Machine: 'IDLE' | 'RECORDING' | 'PROCESSING' | 'REVIEW'
  const [recordingState, setRecordingState] = useState<'IDLE' | 'RECORDING' | 'PROCESSING' | 'REVIEW'>('IDLE');
  const [selectedLanguage, setSelectedLanguage] = useState<'mr' | 'hi' | 'en'>(
    (route.params?.language as 'mr' | 'hi' | 'en') || (language as 'mr' | 'hi' | 'en') || 'mr'
  );
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [extractedEntities, setExtractedEntities] = useState<ExtractedClinicalEntities>({
    symptoms: [],
    duration: '',
    chiefComplaint: '',
  });

  const [activeSession, setActiveSession] = useState<VoiceRecordingSession | null>(null);
  const timerRef = useRef<any>(null);

  // Timer lifecycle during RECORDING
  useEffect(() => {
    if (recordingState === 'RECORDING') {
      timerRef.current = setInterval(() => {
        setDurationSeconds((sec) => {
          const nextSec = sec + 1;
          if (nextSec >= 180) {
            // Auto-stop at 180s cap (B39)
            clearInterval(timerRef.current);
            stopRecording(180);
            return 180;
          }
          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  const startRecording = () => {
    setDurationSeconds(0);
    setTranscript('');
    setExtractedEntities({ symptoms: [], duration: '', chiefComplaint: '' });

    const newSession: VoiceRecordingSession = {
      sessionId: `VOICE-${Date.now()}`,
      recordingState: 'RECORDING',
      durationSeconds: 0,
      sampleRateHz: 16000,
    };
    setActiveSession(newSession);
    setRecordingState('RECORDING');
  };

  const stopRecording = (finalDuration?: number) => {
    const dur = finalDuration !== undefined ? finalDuration : durationSeconds;
    const cappedDuration = capAudioDuration(dur, 180);

    // Validate min duration >= 1.0s (B38)
    if (!validateAudioDuration(cappedDuration)) {
      setRecordingState('IDLE');
      Alert.alert(
        'Recording Too Short',
        'Audio recording was under 1.0 second (click noise). Please hold microphone while speaking.'
      );
      return;
    }

    setRecordingState('PROCESSING');

    // Simulate STT model processing (F29-2, F29-4)
    setTimeout(() => {
      let simulatedText = '';
      if (selectedLanguage === 'mr') {
        simulatedText = SAMPLE_CLINICAL_VOICE_CORPUS.mr[0]; // 'रुग्णाला दोन दिवसांपासून ताप आणि खोकला आहे'
      } else if (selectedLanguage === 'hi') {
        simulatedText = SAMPLE_CLINICAL_VOICE_CORPUS.hi[0]; // 'मरीज को सिर दर्द और चक्कर आ रहे हैं'
      } else {
        simulatedText = SAMPLE_CLINICAL_VOICE_CORPUS.en[0];
      }

      setTranscript(simulatedText);
      const entities = extractClinicalEntities(simulatedText);
      setExtractedEntities(entities);
      setRecordingState('REVIEW');
    }, 600);
  };

  // Re-run extraction whenever user manually edits transcript (F29-5)
  const handleTranscriptChange = (text: string) => {
    setTranscript(text);
    const updated = extractClinicalEntities(text);
    setExtractedEntities(updated);
  };

  const handleSaveDraft = async () => {
    if (!transcript.trim()) {
      Alert.alert('Empty Intake', 'Please record or enter a clinical note first.');
      return;
    }

    try {
      const draftId = `TRG-DRAFT-${Date.now()}`;
      const draftData = {
        id: draftId,
        patientId,
        transcript,
        language: selectedLanguage,
        extractedEntities,
        durationSeconds: activeSession?.durationSeconds || durationSeconds,
        sampleRateHz: 16000,
        status: 'DRAFT_SAVED',
        createdAt: new Date().toISOString(),
        ashaId: session.user?.id || 'ASHA-01',
        ashaName: session.user?.name || 'Sister Anandi Gaikwad',
      };

      await storageEngine.saveItem('triage_drafts', draftId, draftData);
      Alert.alert('Draft Saved', 'Voice clinical intake draft saved in offline drafts store.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save triage draft');
    }
  };

  const handleProceedToTriage = () => {
    navigation.navigate('FieldTriage', {
      patientId,
      prefillComplaint: extractedEntities.chiefComplaint,
      prefillSymptoms: extractedEntities.symptoms,
      prefillDuration: extractedEntities.duration,
    });
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'व्हॉईस क्लिनिकल नोंदणी' : 'Voice Clinical Intake'}
        subtitle="Multilingual Speech-to-Text & Clinical Entity Extraction"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Language Selection Tabs */}
        <View style={styles.languageSelectRow}>
          {(
            [
              { code: 'mr', label: 'मराठी (Marathi)' },
              { code: 'hi', label: 'हिन्दी (Hindi)' },
              { code: 'en', label: 'English' },
            ] as const
          ).map((lang) => (
            <TouchableOpacity
              key={lang.code}
              disabled={recordingState === 'RECORDING'}
              style={[
                styles.languageTab,
                selectedLanguage === lang.code && styles.languageTabSelected,
              ]}
              onPress={() => setSelectedLanguage(lang.code)}
            >
              <Text
                style={[
                  styles.languageTabText,
                  selectedLanguage === lang.code && styles.languageTabTextSelected,
                ]}
              >
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Microphone Recording Console */}
        <Card variant="elevated" style={styles.micCard}>
          <Text style={styles.recordingPrompt}>
            {recordingState === 'RECORDING'
              ? selectedLanguage === 'mr'
                ? 'बोलणे सुरू आहे... (रेकॉर्डिंग सुरू)'
                : 'Listening... (Speak clearly into microphone)'
              : recordingState === 'PROCESSING'
              ? 'Transcribing clinical speech...'
              : selectedLanguage === 'mr'
              ? 'माईक बटण दाबून रुग्णाची लक्षणे सांगा'
              : 'Tap microphone button to record patient symptoms'}
          </Text>

          {/* Live Timer */}
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTimer(durationSeconds)}</Text>
            <Text style={styles.timerLimitText}>/ 03:00 Max</Text>
          </View>

          {/* Large Tactile Mic Button */}
          <View style={styles.micButtonWrapper}>
            {recordingState === 'RECORDING' && <View style={styles.micRadarPulse} />}
            <TouchableOpacity
              style={[
                styles.micBtn,
                recordingState === 'RECORDING' ? styles.micBtnRecording : styles.micBtnIdle,
              ]}
              onPress={() => {
                if (recordingState === 'RECORDING') {
                  stopRecording();
                } else {
                  startRecording();
                }
              }}
              activeOpacity={0.8}
            >
              <AppIcon
                name={recordingState === 'RECORDING' ? 'micOff' : 'mic'}
                size={40}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.micButtonCaption}>
            {recordingState === 'RECORDING' ? 'Tap to Stop & Transcribe' : 'Tap to Start Speaking'}
          </Text>
        </Card>

        {/* Review & Editable Transcript (F29-5) */}
        {(recordingState === 'REVIEW' || transcript.length > 0) && (
          <View>
            <Card variant="elevated" style={styles.transcriptCard}>
              <View style={styles.transcriptHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AppIcon name="prescription" size={18} color={colors.primary.DEFAULT} />
                  <Text style={styles.cardSectionTitle}>Spoken Clinical Transcript</Text>
                </View>
                <Badge label={selectedLanguage.toUpperCase()} variant="primary" size="sm" />
              </View>

              <Text style={styles.transcriptInstruction}>
                ASHA verification: Edit text if any words were misrecognized before saving.
              </Text>

              <TextInput
                multiline={true}
                value={transcript}
                onChangeText={handleTranscriptChange}
                style={styles.transcriptInput}
                placeholder="Transcribed words will appear here..."
              />

              {/* Extracted Clinical Entities (F29-3) */}
              <View style={styles.entitiesContainer}>
                <Text style={styles.entitiesTitle}>Extracted Clinical Entities:</Text>
                <View style={styles.entitiesRow}>
                  {extractedEntities.symptoms.map((symptom) => (
                    <View key={symptom} style={styles.entityChip}>
                      <AppIcon name="alertTriangle" size={12} color={colors.primary.DEFAULT} />
                      <Text style={styles.entityChipText}>{symptom}</Text>
                    </View>
                  ))}
                  {extractedEntities.duration !== 'Unknown' && (
                    <View style={[styles.entityChip, { backgroundColor: '#FEF3C7' }]}>
                      <AppIcon name="clock" size={12} color="#D97706" />
                      <Text style={[styles.entityChipText, { color: '#D97706' }]}>
                        Duration: {extractedEntities.duration}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.chiefComplaintBox}>
                  <Text style={styles.chiefComplaintLabel}>Synthesized Chief Complaint:</Text>
                  <Text style={styles.chiefComplaintText}>
                    {extractedEntities.chiefComplaint || 'Pending voice intake'}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.transcriptActionsRow}>
                <Button
                  title="Save Intake Draft"
                  variant="outline"
                  size="md"
                  onPress={handleSaveDraft}
                  style={{ flex: 1, marginRight: spacing.xs }}
                />
                <Button
                  title="Proceed to Field Triage"
                  variant="primary"
                  size="md"
                  onPress={handleProceedToTriage}
                  style={{ flex: 1.2, marginLeft: spacing.xs }}
                />
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  languageSelectRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  languageTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageTabSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  languageTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.gray,
  },
  languageTabTextSelected: {
    color: colors.white,
  },
  micCard: {
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  recordingPrompt: {
    fontSize: 13,
    color: colors.slate.dark,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary.DEFAULT,
  },
  timerLimitText: {
    fontSize: 12,
    color: colors.slate.muted,
    marginLeft: 6,
  },
  micButtonWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  micRadarPulse: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
  },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  micBtnIdle: {
    backgroundColor: colors.primary.DEFAULT,
  },
  micBtnRecording: {
    backgroundColor: colors.status.error,
  },
  micButtonCaption: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.gray,
  },
  transcriptCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  transcriptInstruction: {
    fontSize: 11,
    color: colors.slate.muted,
    marginBottom: spacing.sm,
  },
  transcriptInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.sm,
    fontSize: 14,
    color: colors.slate.dark,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  entitiesContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  entitiesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slate.dark,
    marginBottom: 6,
  },
  entitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xs,
  },
  entityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    borderRadius: borderRadius.full,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  entityChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  chiefComplaintBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    marginTop: 4,
  },
  chiefComplaintLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate.muted,
  },
  chiefComplaintText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate.dark,
    marginTop: 2,
  },
  transcriptActionsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
});
