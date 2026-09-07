/**
 * Vitals Tracker Screen (Feature 22)
 * HealthWay Native Mobile Platform - Patient Portal
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  calculateBmi,
  getBmiCategory,
  evaluateVitalsAlert,
  VitalsReading,
  VitalsAlertResult,
} from '../../services/vitalsService';
import {
  INITIAL_VITALS_HISTORY,
  VitalsHistoryRecord,
} from '../../data/patientData';

export const VitalsTrackerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { language } = useLanguage();

  // Form inputs
  const [systolicBp, setSystolicBp] = useState('120');
  const [diastolicBp, setDiastolicBp] = useState('80');
  const [heartRate, setHeartRate] = useState('72');
  const [spo2, setSpo2] = useState('98');
  const [bloodSugar, setBloodSugar] = useState('95');
  const [sugarType, setSugarType] = useState<'FASTING' | 'RANDOM' | 'POST_PRANDIAL'>('RANDOM');
  const [temperatureF, setTemperatureF] = useState('98.4');
  const [weightKg, setWeightKg] = useState('65');
  const [heightCm, setHeightCm] = useState('170');

  // History & Evaluation
  const [history, setHistory] = useState<VitalsHistoryRecord[]>(INITIAL_VITALS_HISTORY);
  const [latestAlert, setLatestAlert] = useState<VitalsAlertResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Compute live BMI (F22-2)
  const weightNum = parseFloat(weightKg) || 0;
  const heightNum = parseFloat(heightCm) || 0;
  const liveBmi = calculateBmi(weightNum, heightNum);
  const bmiCategory = getBmiCategory(liveBmi);

  // Load cached history
  const loadHistory = useCallback(async () => {
    try {
      const cached = await storageEngine.getAll<VitalsHistoryRecord>('patient_cache');
      if (cached && cached.length > 0) {
        const validRecords = cached.filter((r) => r && r.id && r.bpFormatted);
        if (validRecords.length > 0) {
          // Merge with initial history without duplicating IDs
          const existingIds = new Set(INITIAL_VITALS_HISTORY.map((i) => i.id));
          const newEntries = validRecords.filter((r) => !existingIds.has(r.id));
          setHistory([...INITIAL_VITALS_HISTORY, ...newEntries]);
        }
      }
    } catch (err) {
      console.warn('Failed to load vitals history from cache:', err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleEvaluateAndLog = async () => {
    const sys = parseInt(systolicBp, 10) || 0;
    const dia = parseInt(diastolicBp, 10) || 0;
    const hr = parseInt(heartRate, 10) || 0;
    const ox = parseInt(spo2, 10) || 0;
    const sug = parseInt(bloodSugar, 10) || 0;
    const temp = parseFloat(temperatureF) || 98.4;

    if (sys <= 0 || dia <= 0) {
      Alert.alert('Validation Error', 'Please enter valid Systolic and Diastolic Blood Pressure values.');
      return;
    }

    const currentReading: VitalsReading = {
      systolicBp: sys,
      diastolicBp: dia,
      heartRate: hr,
      spo2: ox,
      bloodSugarRandom: sugarType === 'RANDOM' ? sug : undefined,
      bloodSugarFasting: sugarType === 'FASTING' ? sug : undefined,
      bloodSugarPostPrandial: sugarType === 'POST_PRANDIAL' ? sug : undefined,
      temperatureF: temp,
      weightKg: weightNum,
      heightCm: heightNum,
      bmi: liveBmi,
    };

    const alertResult = evaluateVitalsAlert(currentReading);
    setLatestAlert(alertResult);

    setIsSaving(true);
    try {
      const newRecord: VitalsHistoryRecord = {
        id: `VIT-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        systolicBp: sys,
        diastolicBp: dia,
        bpFormatted: `${sys}/${dia}`,
        bloodSugar: sug,
        sugarType,
        spo2: ox,
        heartRate: hr,
        temperatureF: temp,
        weightKg: weightNum,
        heightCm: heightNum,
        bmi: liveBmi,
        color: alertResult.color,
      };

      // 1. Save to patient_cache
      await storageEngine.saveItem('patient_cache', newRecord.id, newRecord);

      // 2. Queue for background sync (XC14)
      await storageEngine.enqueueSync('/api/v1/vitals', 'POST', newRecord);

      setHistory((prev) => [...prev, newRecord]);

      if (alertResult.isCritical) {
        Alert.alert(
          'CRITICAL CLINICAL ALERT',
          'Vitals indicate high urgency. Please contact emergency services or consult a doctor immediately.',
          [
            { text: 'OK', style: 'cancel' },
            { text: 'Call 108 Ambulance', onPress: () => navigation.navigate('EmergencySOS') },
          ]
        );
      } else {
        Alert.alert('Success', 'Vitals reading logged and cached offline.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save vitals reading');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title={language === 'mr' ? 'आरोग्य निर्देशक ट्रॅकर' : 'Vitals Tracker'}
        subtitle="Standard Physiological & BMI Logging"
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={true}
        onSosPress={() => navigation.navigate('EmergencySOS')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Real-time Alert Banner (F22-3, F22-4) */}
        {latestAlert && (
          <View
            style={[
              styles.alertBanner,
              latestAlert.color === 'RED'
                ? styles.alertBannerRed
                : latestAlert.color === 'YELLOW'
                ? styles.alertBannerYellow
                : styles.alertBannerGreen,
            ]}
          >
            <View style={styles.alertBannerTop}>
              <AppIcon
                name={latestAlert.color === 'RED' ? 'alertTriangle' : 'checkCircle'}
                size={20}
                color={
                  latestAlert.color === 'RED'
                    ? colors.status.error
                    : latestAlert.color === 'YELLOW'
                    ? '#D97706'
                    : colors.status.success
                }
              />
              <Text
                style={[
                  styles.alertBannerTitle,
                  {
                    color:
                      latestAlert.color === 'RED'
                        ? colors.status.error
                        : latestAlert.color === 'YELLOW'
                        ? '#D97706'
                        : colors.status.success,
                  },
                ]}
              >
                {latestAlert.color === 'RED'
                  ? 'CRITICAL ALERT: IMMEDIATE ATTENTION REQUIRED'
                  : latestAlert.color === 'YELLOW'
                  ? 'ELEVATED VITALS: MEDICAL REVIEW RECOMMENDED'
                  : 'ALL VITALS WITHIN OPTIMAL RANGE'}
              </Text>
            </View>

            {latestAlert.warnings.map((warn, idx) => (
              <Text key={idx} style={styles.alertWarningText}>
                • {warn}
              </Text>
            ))}

            {latestAlert.color === 'RED' && (
              <Button
                title="Dispatch 108 Emergency SOS"
                variant="danger"
                size="sm"
                onPress={() => navigation.navigate('EmergencySOS')}
                style={{ marginTop: spacing.sm }}
              />
            )}
          </View>
        )}

        {/* 1. Vitals Entry Form (F22-1) */}
        <Card variant="elevated" style={styles.formCard}>
          <Text style={styles.cardHeading}>
            {language === 'mr' ? 'नवीन तपासणी नोंदवा' : 'Log New Vitals Reading'}
          </Text>

          {/* Blood Pressure Row */}
          <Text style={styles.fieldSectionLabel}>Blood Pressure (mmHg)</Text>
          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="Systolic"
                value={systolicBp}
                onChangeText={setSystolicBp}
                placeholder="120"
                keyboardType="numeric"
                required={true}
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <FormInput
                label="Diastolic"
                value={diastolicBp}
                onChangeText={setDiastolicBp}
                placeholder="80"
                keyboardType="numeric"
                required={true}
              />
            </View>
          </View>

          {/* Blood Sugar & Type Row */}
          <Text style={styles.fieldSectionLabel}>Blood Sugar (mg/dL)</Text>
          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="Glucose Value"
                value={bloodSugar}
                onChangeText={setBloodSugar}
                placeholder="95"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1.2, marginLeft: spacing.sm }}>
              <Text style={styles.sugarTypeLabel}>Test Type</Text>
              <View style={styles.sugarTypeRow}>
                {(['FASTING', 'RANDOM', 'POST_PRANDIAL'] as const).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.sugarTypeChip, sugarType === mode && styles.sugarTypeChipActive]}
                    onPress={() => setSugarType(mode)}
                  >
                    <Text
                      style={[
                        styles.sugarTypeChipText,
                        sugarType === mode && styles.sugarTypeChipTextActive,
                      ]}
                    >
                      {mode === 'POST_PRANDIAL' ? 'PPBS' : mode.slice(0, 4)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Oxygen SpO2 & Heart Rate */}
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

          {/* Body Temperature */}
          <FormInput
            label="Body Temperature (°F)"
            value={temperatureF}
            onChangeText={setTemperatureF}
            placeholder="98.4"
            keyboardType="numeric"
          />

          {/* BMI Calculator Row (F22-2) */}
          <Text style={styles.fieldSectionLabel}>Anthropometric & BMI Engine</Text>
          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="Weight (kg)"
                value={weightKg}
                onChangeText={setWeightKg}
                placeholder="65"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <FormInput
                label="Height (cm)"
                value={heightCm}
                onChangeText={setHeightCm}
                placeholder="170"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Live BMI Output Badge Box */}
          <View style={styles.bmiDisplayCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bmiResultTitle}>Computed Body Mass Index (BMI)</Text>
              <Text style={styles.bmiFormulaSub}>weight (kg) / [height (m)]²</Text>
            </View>
            <View style={styles.bmiBadgeWrapper}>
              <Text style={styles.bmiNumber}>{liveBmi > 0 ? liveBmi : '--'}</Text>
              <Badge
                label={bmiCategory.labelEn}
                variant={liveBmi >= 25 ? 'warning' : 'success'}
                size="sm"
              />
            </View>
          </View>

          {/* Submit Action */}
          <Button
            title={isSaving ? 'Logging & Evaluating...' : 'Evaluate & Log Reading'}
            variant="primary"
            size="lg"
            fullWidth={true}
            onPress={handleEvaluateAndLog}
            loading={isSaving}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* 2. Chronological History Log (F22-5) */}
        <Text style={styles.historySectionHeading}>
          {language === 'mr' ? 'तपासणी इतिहास' : 'CHRONOLOGICAL VITALS HISTORY'}
        </Text>

        {history.slice().reverse().map((rec) => (
          <Card key={rec.id} variant="elevated" style={styles.historyCard}>
            <View style={styles.historyHeaderRow}>
              <Text style={styles.historyDateText}>{rec.date}</Text>
              <Badge
                label={rec.color === 'RED' ? 'CRITICAL' : rec.color === 'YELLOW' ? 'ELEVATED' : 'NORMAL'}
                variant={rec.color === 'RED' ? 'danger' : rec.color === 'YELLOW' ? 'warning' : 'success'}
                size="sm"
              />
            </View>

            <View style={styles.historyGrid}>
              <View style={styles.historyGridItem}>
                <Text style={styles.historyLabel}>Blood Pressure</Text>
                <Text style={styles.historyValue}>{rec.bpFormatted} mmHg</Text>
              </View>
              <View style={styles.historyGridItem}>
                <Text style={styles.historyLabel}>Blood Sugar</Text>
                <Text style={styles.historyValue}>{rec.bloodSugar} mg/dL</Text>
              </View>
              <View style={styles.historyGridItem}>
                <Text style={styles.historyLabel}>SpO2</Text>
                <Text style={[styles.historyValue, { color: rec.spo2 < 90 ? colors.status.error : colors.slate.dark }]}>
                  {rec.spo2}%
                </Text>
              </View>
              <View style={styles.historyGridItem}>
                <Text style={styles.historyLabel}>Pulse / HR</Text>
                <Text style={styles.historyValue}>{rec.heartRate} bpm</Text>
              </View>
              <View style={styles.historyGridItem}>
                <Text style={styles.historyLabel}>Temp</Text>
                <Text style={styles.historyValue}>{rec.temperatureF}°F</Text>
              </View>
              <View style={styles.historyGridItem}>
                <Text style={styles.historyLabel}>BMI</Text>
                <Text style={styles.historyValue}>{rec.bmi}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
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
  alertBanner: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  alertBannerRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  alertBannerYellow: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  alertBannerGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  alertBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  alertBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  alertWarningText: {
    fontSize: 12,
    color: colors.slate.dark,
    marginTop: 2,
    lineHeight: 18,
  },
  formCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.slate.dark,
    marginBottom: spacing.sm,
  },
  fieldSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.gray,
    marginTop: spacing.xs,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sugarTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate.dark,
    marginBottom: 6,
  },
  sugarTypeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  sugarTypeChip: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: '#F1F5F9',
  },
  sugarTypeChipActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  sugarTypeChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate.gray,
  },
  sugarTypeChipTextActive: {
    color: colors.white,
  },
  bmiDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bmiResultTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  bmiFormulaSub: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 1,
  },
  bmiBadgeWrapper: {
    alignItems: 'flex-end',
  },
  bmiNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
    marginBottom: 2,
  },
  historySectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate.muted,
    marginBottom: spacing.sm,
  },
  historyCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  historyDateText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  historyGridItem: {
    width: '30%',
  },
  historyLabel: {
    fontSize: 10,
    color: colors.slate.muted,
  },
  historyValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
    marginTop: 1,
  },
});
