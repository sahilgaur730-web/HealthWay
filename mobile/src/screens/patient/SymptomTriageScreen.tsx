/**
 * AI Symptom Triage Screen (Feature 25)
 * HealthWay Native Mobile Platform - Patient Portal
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { useLanguage } from '../../context/LanguageContext';
import { storageEngine } from '../../storage/storageEngine';
import {
  SYMPTOM_PATHWAYS,
  SymptomPathwayKey,
  evaluateTriageLevel,
  TriageEvaluation,
  TRIAGE_TRILINGUAL_GUIDANCE,
} from '../../services/triageService';
import { VitalsReading } from '../../services/vitalsService';
import { VitalsHistoryRecord } from '../../data/patientData';

export const SymptomTriageScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { language } = useLanguage();

  // 4 Steps: 1: Pathway -> 2: Symptoms & Severity -> 3: Vitals -> 4: Assessment
  const [step, setStep] = useState<number>(1);

  // Step 1: Pathway
  const [selectedPathway, setSelectedPathway] = useState<SymptomPathwayKey>('CHEST_PAIN');

  // Step 2: Specific Symptom & Severity
  const [selectedSymptomKey, setSelectedSymptomKey] = useState<string>('CHEST_PAIN_SEVERE');
  const [severityLevel, setSeverityLevel] = useState<number>(4);
  const [durationText, setDurationText] = useState<string>('2 hours');

  // Step 3: Vitals
  const [systolicBp, setSystolicBp] = useState<string>('');
  const [diastolicBp, setDiastolicBp] = useState<string>('');
  const [spo2, setSpo2] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [temperatureF, setTemperatureF] = useState<string>('');
  const [bloodSugar, setBloodSugar] = useState<string>('');

  // Step 4: Assessment Result
  const [evaluation, setEvaluation] = useState<TriageEvaluation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch latest vitals from patient_cache
  const handleFetchLatestVitals = async () => {
    try {
      const cached = await storageEngine.getAll<VitalsHistoryRecord>('patient_cache');
      if (cached && cached.length > 0) {
        const valid = cached.filter((v) => v && (v.systolicBp || v.bpFormatted));
        if (valid.length > 0) {
          const latest = valid[valid.length - 1];
          setSystolicBp(String(latest.systolicBp || 120));
          setDiastolicBp(String(latest.diastolicBp || 80));
          setSpo2(String(latest.spo2 || 98));
          setHeartRate(String(latest.heartRate || 72));
          setTemperatureF(String(latest.temperatureF || 98.4));
          setBloodSugar(String(latest.bloodSugar || 100));
          Alert.alert('Vitals Loaded', 'Populated from latest offline records.');
          return;
        }
      }
      Alert.alert('No Cached Vitals', 'No prior recorded vitals found.');
    } catch (err) {
      console.warn('Failed to load vitals:', err);
    }
  };

  const handleEvaluate = async () => {
    let vitalsObj: VitalsReading | undefined;
    const sys = parseInt(systolicBp, 10);
    const dia = parseInt(diastolicBp, 10);
    if (!isNaN(sys) && !isNaN(dia)) {
      vitalsObj = {
        systolicBp: sys,
        diastolicBp: dia,
        heartRate: parseInt(heartRate, 10) || 72,
        spo2: parseInt(spo2, 10) || 98,
        bloodSugarRandom: parseInt(bloodSugar, 10) || 100,
        temperatureF: parseFloat(temperatureF) || 98.4,
      };
    }

    const evalResult = evaluateTriageLevel(selectedSymptomKey, severityLevel, vitalsObj);
    setEvaluation(evalResult);
    setStep(4);

    // Save triage draft to triage_drafts (F25 persistence)
    setIsSaving(true);
    try {
      const draftId = `TRG-${Date.now()}`;
      await storageEngine.saveItem('triage_drafts', draftId, {
        id: draftId,
        pathway: selectedPathway,
        symptomKey: selectedSymptomKey,
        severityLevel,
        duration: durationText,
        vitals: vitalsObj,
        evaluation: evalResult,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to save triage draft:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDial108 = () => {
    Linking.openURL('tel:108').catch(() => {
      Alert.alert('Emergency Contact', 'Dial 108 manually on your phone.');
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'एआय लक्षण ट्रायज' : 'AI Symptom Triage'}
        subtitle="Clinical Urgency & Escalation Protocol"
        showBack={true}
        onBack={() => {
          if (step > 1) setStep(step - 1);
          else navigation.goBack();
        }}
        showSosButton={true}
        onSosPress={() => navigation.navigate('EmergencySOS')}
      />

      {/* Stepper Header */}
      <View style={styles.stepperRow}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, step >= s && styles.stepDotTextActive]}>{s}</Text>
            </View>
            <Text style={[styles.stepLabelText, step >= s && styles.stepLabelTextActive]}>
              {s === 1 ? 'Pathway' : s === 2 ? 'Symptoms' : s === 3 ? 'Vitals' : 'Result'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Pathway Selection (F25-1) */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionHeading}>Step 1: Choose Symptom Pathway</Text>
            <Text style={styles.sectionSubtitle}>
              Select the primary clinical condition presenting:
            </Text>

            {(Object.keys(SYMPTOM_PATHWAYS) as SymptomPathwayKey[]).map((key) => {
              const path = SYMPTOM_PATHWAYS[key];
              const isSelected = selectedPathway === key;

              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.pathwayCard, isSelected && styles.pathwayCardSelected]}
                  onPress={() => {
                    setSelectedPathway(key);
                    setSelectedSymptomKey(path.options[0].key);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.pathwayIconCircle, isSelected && styles.pathwayIconCircleSelected]}>
                    <AppIcon
                      name={path.icon as any}
                      size={24}
                      color={isSelected ? colors.white : colors.primary.DEFAULT}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pathwayTitle, isSelected && styles.pathwayTitleSelected]}>
                      {language === 'mr' ? path.nameMr : path.nameEn}
                    </Text>
                    <Text style={styles.pathwaySub}>{path.options.length} clinical questions</Text>
                  </View>
                  {isSelected && <AppIcon name="checkCircle" size={20} color={colors.primary.DEFAULT} />}
                </TouchableOpacity>
              );
            })}

            <Button
              title="Next: Specific Symptoms"
              variant="primary"
              size="lg"
              fullWidth={true}
              onPress={() => setStep(2)}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {/* Step 2: Specific Symptoms & Severity Questionnaire */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionHeading}>Step 2: Symptoms & Severity</Text>
            <Text style={styles.sectionSubtitle}>
              Pathway: <Text style={{ fontWeight: '800' }}>{SYMPTOM_PATHWAYS[selectedPathway].nameEn}</Text>
            </Text>

            <Text style={styles.questionLabel}>Select Specific Symptom:</Text>
            {SYMPTOM_PATHWAYS[selectedPathway].options.map((opt) => {
              const isSelected = selectedSymptomKey === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.symptomOptionItem, isSelected && styles.symptomOptionItemSelected]}
                  onPress={() => {
                    setSelectedSymptomKey(opt.key);
                    setSeverityLevel(opt.severityDefault);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.symptomOptionText, isSelected && styles.symptomOptionTextSelected]}>
                      {language === 'mr' ? opt.nameMr : opt.nameEn}
                    </Text>
                    {opt.isRedFlag && (
                      <Badge label="Emergency Red Flag" variant="danger" size="sm" style={{ marginTop: 4 }} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Duration Selector */}
            <Text style={styles.questionLabel}>Symptom Duration:</Text>
            <View style={styles.durationRow}>
              {['Few Hours', '1-2 Days', '3-5 Days', '1+ Weeks'].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[styles.durationChip, durationText === dur && styles.durationChipSelected]}
                  onPress={() => setDurationText(dur)}
                >
                  <Text
                    style={[styles.durationChipText, durationText === dur && styles.durationChipTextSelected]}
                  >
                    {dur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Severity Level Rating (1 to 5) */}
            <Text style={styles.questionLabel}>Subjective Severity (Level 1 - 5):</Text>
            <View style={styles.severityRow}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.severityBox, severityLevel === lvl && styles.severityBoxSelected]}
                  onPress={() => setSeverityLevel(lvl)}
                >
                  <Text style={[styles.severityNum, severityLevel === lvl && styles.severityNumSelected]}>
                    {lvl}
                  </Text>
                  <Text style={[styles.severityTag, severityLevel === lvl && styles.severityTagSelected]}>
                    {lvl === 1 ? 'Mild' : lvl === 3 ? 'Moderate' : lvl === 5 ? 'Critical' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Next: Vitals Integration"
              variant="primary"
              size="lg"
              fullWidth={true}
              onPress={() => setStep(3)}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {/* Step 3: Vitals Integration (F25-4) */}
        {step === 3 && (
          <View>
            <Text style={styles.sectionHeading}>Step 3: Clinical Vitals Integration</Text>
            <Text style={styles.sectionSubtitle}>
              Optional: Enter measured vitals to enable physiological safety overrides.
            </Text>

            <Button
              title="Fetch Latest Logged Vitals"
              variant="secondary"
              size="sm"
              onPress={handleFetchLatestVitals}
              style={{ marginBottom: spacing.sm }}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Systolic BP"
                  value={systolicBp}
                  onChangeText={setSystolicBp}
                  placeholder="120"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <FormInput
                  label="Diastolic BP"
                  value={diastolicBp}
                  onChangeText={setDiastolicBp}
                  placeholder="80"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="SpO2 (%)"
                  value={spo2}
                  onChangeText={setSpo2}
                  placeholder="98"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <FormInput
                  label="Heart Rate (bpm)"
                  value={heartRate}
                  onChangeText={setHeartRate}
                  placeholder="72"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Blood Sugar (mg/dL)"
                  value={bloodSugar}
                  onChangeText={setBloodSugar}
                  placeholder="100"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <FormInput
                  label="Temperature (°F)"
                  value={temperatureF}
                  onChangeText={setTemperatureF}
                  placeholder="98.4"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Button
              title="Compute Triage Risk Assessment"
              variant="primary"
              size="lg"
              fullWidth={true}
              onPress={handleEvaluate}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {/* Step 4: Assessment Result & Trilingual Advice (F25-2, F25-3, F25-4, F25-5) */}
        {step === 4 && evaluation && (
          <View>
            <Text style={styles.sectionHeading}>Step 4: Clinical Triage Assessment</Text>
            <Text style={styles.sectionSubtitle}>Computerized Decision Support Recommendation</Text>

            {/* Priority Status Card */}
            <Card
              variant="elevated"
              style={[
                styles.resultCard,
                evaluation.level === 'RED'
                  ? styles.resultCardRed
                  : evaluation.level === 'ORANGE'
                  ? styles.resultCardOrange
                  : evaluation.level === 'YELLOW'
                  ? styles.resultCardYellow
                  : styles.resultCardGreen,
              ]}
            >
              <View style={styles.resultHeaderRow}>
                <View style={styles.levelBadgeCircle}>
                  <Text style={styles.levelBadgeText}>{evaluation.level}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultTitle}>
                    {evaluation.level === 'RED'
                      ? 'CRITICAL EMERGENCY (PRIORITY 1)'
                      : evaluation.level === 'ORANGE'
                      ? 'URGENT ATTENTION REQUIRED'
                      : evaluation.level === 'YELLOW'
                      ? 'SCHEDULE OPD CONSULTATION'
                      : 'PRIMARY CARE / ROUTINE FOLLOW-UP'}
                  </Text>
                  {evaluation.isVitalsOverride && (
                    <Text style={styles.vitalsOverrideTag}>
                      Critical physiological vitals override activated
                    </Text>
                  )}
                </View>
              </View>

              {/* Trilingual Guidance (F25-5) */}
              <View style={styles.trilingualBox}>
                <Text style={styles.trilingualHeader}>CLINICAL GUIDANCE / वैद्यकीय सल्ला</Text>

                <View style={styles.langItem}>
                  <Text style={styles.langLabel}>English:</Text>
                  <Text style={styles.langText}>{TRIAGE_TRILINGUAL_GUIDANCE[evaluation.level].en}</Text>
                </View>

                <View style={styles.langItem}>
                  <Text style={styles.langLabel}>मराठी:</Text>
                  <Text style={styles.langText}>{TRIAGE_TRILINGUAL_GUIDANCE[evaluation.level].mr}</Text>
                </View>

                <View style={styles.langItem}>
                  <Text style={styles.langLabel}>हिन्दी:</Text>
                  <Text style={styles.langText}>{TRIAGE_TRILINGUAL_GUIDANCE[evaluation.level].hi}</Text>
                </View>
              </View>

              {/* Action Triggers */}
              {evaluation.level === 'RED' && (
                <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                  <Button
                    title="Call 108 Emergency Ambulance"
                    variant="danger"
                    size="lg"
                    fullWidth={true}
                    onPress={handleDial108}
                  />
                  <Button
                    title="Dispatch Emergency 1-Tap SOS"
                    variant="outline"
                    size="md"
                    fullWidth={true}
                    onPress={() => navigation.navigate('EmergencySOS')}
                  />
                </View>
              )}

              {evaluation.level === 'YELLOW' && (
                <Button
                  title="Book Doctor Appointment Today"
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  onPress={() => navigation.navigate('AppointmentBooking')}
                  style={{ marginTop: spacing.md }}
                />
              )}

              <Button
                title="Start New Assessment"
                variant="ghost"
                size="sm"
                fullWidth={true}
                onPress={() => setStep(1)}
                style={{ marginTop: spacing.sm }}
              />
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
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  stepDotActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slate.gray,
  },
  stepDotTextActive: {
    color: colors.white,
  },
  stepLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate.muted,
  },
  stepLabelTextActive: {
    color: colors.primary.DEFAULT,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.slate.dark,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.slate.gray,
    marginBottom: spacing.md,
  },
  pathwayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.md,
  },
  pathwayCardSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: '#F0F7FF',
  },
  pathwayIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathwayIconCircleSelected: {
    backgroundColor: colors.primary.DEFAULT,
  },
  pathwayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  pathwayTitleSelected: {
    color: colors.primary.DEFAULT,
  },
  pathwaySub: {
    fontSize: 11,
    color: colors.slate.muted,
    marginTop: 2,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
    marginTop: spacing.sm,
    marginBottom: 6,
  },
  symptomOptionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.sm,
  },
  symptomOptionItemSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: '#F0F7FF',
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.slate.muted,
    marginTop: 2,
  },
  radioDotSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.DEFAULT,
  },
  symptomOptionText: {
    fontSize: 13,
    color: colors.slate.dark,
    fontWeight: '600',
    lineHeight: 18,
  },
  symptomOptionTextSelected: {
    color: colors.primary.DEFAULT,
    fontWeight: '800',
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationChipSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  durationChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.gray,
  },
  durationChipTextSelected: {
    color: colors.white,
  },
  severityRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  severityBox: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  severityBoxSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  severityNum: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  severityNumSelected: {
    color: colors.white,
  },
  severityTag: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.slate.muted,
    marginTop: 2,
  },
  severityTagSelected: {
    color: '#E0F2FE',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  resultCardRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  resultCardOrange: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  resultCardYellow: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D97706',
  },
  resultCardGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  levelBadgeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.slate.dark,
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.slate.dark,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.slate.dark,
  },
  vitalsOverrideTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 3,
  },
  trilingualBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  trilingualHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate.muted,
    marginBottom: 2,
  },
  langItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  langLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
  },
  langText: {
    fontSize: 12,
    color: colors.slate.dark,
    lineHeight: 18,
    marginTop: 2,
  },
});
