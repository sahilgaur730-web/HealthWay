/**
 * High-Risk Pregnancy & Antenatal Care Screen (Feature 28)
 * HealthWay Native Mobile Platform - ASHA Community Module
 * Complies with PMSMA protocols and Tier 4 Maternal Escalation workload
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { evaluateVitalsAlert, VitalsReading } from '../../services/vitalsService';
import { FIELD_REFERRAL_SLAS } from '../../services/fieldTriageService';
import { PMSMA_SCHEDULE, DANGER_SIGNS_CATALOG } from '../../data/ashaData';

export const HighRiskPregnancyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { language } = useLanguage();

  const beneficiaryId = route.params?.beneficiaryId || 'PT-ANC-POOJA';
  const patientName = route.params?.patientName || 'Pooja Sachin Jadhav';

  // 1. Gestational Age & Trimester (F28-1)
  const [gestationalWeeks, setGestationalWeeks] = useState<number>(34);
  const trimester = gestationalWeeks <= 12 ? 1 : gestationalWeeks <= 28 ? 2 : 3;

  // 2. Clinical Danger Signs Checklist (F28-2)
  const [selectedDangerSigns, setSelectedDangerSigns] = useState<string[]>([
    'Severe persistent headache',
    'Epigastric pain',
    'Visual blurriness',
  ]);

  // 3. Vitals Inputs (Tier 4 Step 1)
  const [systolicBp, setSystolicBp] = useState<string>('168');
  const [diastolicBp, setDiastolicBp] = useState<string>('108');
  const [heartRate, setHeartRate] = useState<string>('98');
  const [spo2, setSpo2] = useState<string>('96');
  const [bloodSugar, setBloodSugar] = useState<string>('120');
  const [temperatureF, setTemperatureF] = useState<string>('98.6');

  // 4. PMSMA ANC Visits (F28-4)
  const [completedVisits, setCompletedVisits] = useState<number[]>([1, 2]);

  // 5. NCD & CBAC Screening (F28-5)
  const [cbacScore, setCbacScore] = useState<number>(5);

  // Referral Modal State
  const [generatedReferral, setGeneratedReferral] = useState<any | null>(null);

  // Toggle Danger Sign
  const toggleDangerSign = (sign: string) => {
    setSelectedDangerSigns((prev) =>
      prev.includes(sign) ? prev.filter((s) => s !== sign) : [...prev, sign]
    );
  };

  // Evaluate Vitals & High-Risk Rules (F28-3, Tier 4 Step 2)
  const sysNum = parseInt(systolicBp, 10) || 120;
  const diaNum = parseInt(diastolicBp, 10) || 80;
  const vitalsReading: VitalsReading = {
    systolicBp: sysNum,
    diastolicBp: diaNum,
    heartRate: parseInt(heartRate, 10) || 72,
    spo2: parseInt(spo2, 10) || 98,
    bloodSugarRandom: parseInt(bloodSugar, 10) || 100,
    temperatureF: parseFloat(temperatureF) || 98.4,
  };

  const vitalsResult = evaluateVitalsAlert(vitalsReading);
  const isHighRisk = sysNum >= 140 || diaNum >= 90 || selectedDangerSigns.length > 0;
  const isEmergencyCritical = vitalsResult.isCritical || sysNum >= 160 || diaNum >= 100;

  // Generate Immediate Referral Slip (Tier 4 Step 3)
  const handleGenerateImmediateReferral = async () => {
    try {
      const referral = {
        referralId: 'REF-ANC-2026-042',
        patientId: beneficiaryId,
        patientName,
        fromFacilityId: 'FAC007', // Sub-Centre Tapola
        toFacilityId: 'FAC001', // District Hospital Satara
        specialty: 'Obstetric High-Risk ICU',
        urgency: 'IMMEDIATE',
        slaMinutes: FIELD_REFERRAL_SLAS.IMMEDIATE, // 60 mins
        provisionalDiagnosis: `Severe Preeclampsia in ${gestationalWeeks}th Week with Impending Eclampsia`,
        qrCodePayload: `REF-ANC-2026-042|${beneficiaryId}|IMMEDIATE|FAC001`,
        stage: 'CREATED',
        vitals: vitalsReading,
        dangerSigns: selectedDangerSigns,
        createdAt: new Date().toISOString(),
      };

      // Save to local referral_drafts store (F30-4, Tier 4)
      await storageEngine.saveItem('referral_drafts', referral.referralId, referral);
      // Enqueue to sync outbox
      await storageEngine.enqueueSync('/api/v1/referrals', 'POST', referral);

      setGeneratedReferral(referral);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to generate emergency referral');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'उच्च जोखीम प्रसूतीपूर्व तपासणी' : 'High-Risk Pregnancy & ANC'}
        subtitle="PMSMA Protocol · Danger Signs & Vitals"
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={true}
        onSosPress={() => navigation.navigate('EmergencySOS')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Beneficiary Banner */}
        <Card variant="elevated" style={styles.beneficiaryBanner}>
          <View style={styles.bannerRow}>
            <View style={styles.avatarCircle}>
              <AppIcon name="asha" size={24} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientNameText}>{patientName}</Text>
              <Text style={styles.patientMetaText}>ID: {beneficiaryId} · Sub-Centre Tapola</Text>
            </View>
            {isHighRisk && (
              <Badge
                label={isEmergencyCritical ? 'CRITICAL HIGH RISK' : 'HIGH RISK'}
                variant="danger"
                size="sm"
              />
            )}
          </View>
        </Card>

        {/* 1. Gestational Age & Trimester Tracker (F28-1) */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>
              {language === 'mr' ? 'गर्भधारणा वय व त्रैमासिक' : 'Gestational Age & Trimester'}
            </Text>
            <Badge label={`Trimester ${trimester}`} variant="primary" size="sm" />
          </View>

          <View style={styles.weeksStepperRow}>
            <TouchableOpacity
              onPress={() => setGestationalWeeks((w) => Math.max(1, w - 1))}
              style={styles.stepBtn}
            >
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>

            <View style={styles.weeksDisplay}>
              <Text style={styles.weeksNumber}>{gestationalWeeks}</Text>
              <Text style={styles.weeksUnit}>{language === 'mr' ? 'आठवडे' : 'Weeks'}</Text>
            </View>

            <TouchableOpacity
              onPress={() => setGestationalWeeks((w) => Math.min(42, w + 1))}
              style={styles.stepBtn}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Trimester Timeline Meter */}
          <View style={styles.trimesterBar}>
            <View style={[styles.trimesterSegment, trimester >= 1 && styles.trimesterActive]}>
              <Text style={[styles.trimesterLabel, trimester >= 1 && styles.trimesterLabelActive]}>
                T1 (1-12w)
              </Text>
            </View>
            <View style={[styles.trimesterSegment, trimester >= 2 && styles.trimesterActive]}>
              <Text style={[styles.trimesterLabel, trimester >= 2 && styles.trimesterLabelActive]}>
                T2 (13-28w)
              </Text>
            </View>
            <View style={[styles.trimesterSegment, trimester >= 3 && styles.trimesterActive]}>
              <Text style={[styles.trimesterLabel, trimester >= 3 && styles.trimesterLabelActive]}>
                T3 (29-42w)
              </Text>
            </View>
          </View>
        </Card>

        {/* 2. Clinical Danger Signs Checklist (F28-2) */}
        <Card variant="elevated" style={[styles.sectionCard, selectedDangerSigns.length > 0 && styles.dangerCardBorder]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.status.error }]}>
              {language === 'mr' ? 'धोक्याची लक्षणे तपासणी' : 'Clinical Danger Signs Checklist'}
            </Text>
            <Badge
              label={`${selectedDangerSigns.length} Detected`}
              variant={selectedDangerSigns.length > 0 ? 'danger' : 'success'}
              size="sm"
            />
          </View>

          <Text style={styles.checklistInstruction}>
            {language === 'mr'
              ? 'खालीलपैकी कोणतेही लक्षण आढळल्यास त्वरित उच्च जोखीम म्हणून नोंद होते:'
              : 'Select all signs observed during field inspection. Any sign triggers High-Risk flag.'}
          </Text>

          {DANGER_SIGNS_CATALOG.map((sign) => {
            const isChecked = selectedDangerSigns.includes(sign.labelEn);
            return (
              <TouchableOpacity
                key={sign.id}
                style={[styles.dangerSignItem, isChecked && styles.dangerSignItemChecked]}
                onPress={() => toggleDangerSign(sign.labelEn)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <AppIcon name="check" size={14} color={colors.white} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dangerSignTitle, isChecked && styles.dangerSignTitleChecked]}>
                    {language === 'mr' ? sign.labelMr : sign.labelEn}
                  </Text>
                  <Text style={styles.dangerSignDesc}>{sign.guidanceEn}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* 3. Vitals & Blood Pressure Logging (F28-3) */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>
              {language === 'mr' ? 'शारीरिक निर्देशक (रक्तदाब व वाइटल्स)' : 'Vitals & Blood Pressure'}
            </Text>
            <Badge
              label={vitalsResult.color}
              variant={vitalsResult.color === 'RED' ? 'danger' : vitalsResult.color === 'YELLOW' ? 'warning' : 'success'}
              size="sm"
            />
          </View>

          <View style={styles.vitalsInputGrid}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="Systolic BP (mmHg)"
                value={systolicBp}
                onChangeText={setSystolicBp}
                keyboardType="numeric"
                placeholder="120"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <FormInput
                label="Diastolic BP (mmHg)"
                value={diastolicBp}
                onChangeText={setDiastolicBp}
                keyboardType="numeric"
                placeholder="80"
              />
            </View>
          </View>

          <View style={styles.vitalsInputGrid}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="Heart Rate (bpm)"
                value={heartRate}
                onChangeText={setHeartRate}
                keyboardType="numeric"
                placeholder="72"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <FormInput
                label="SpO2 (%)"
                value={spo2}
                onChangeText={setSpo2}
                keyboardType="numeric"
                placeholder="98"
              />
            </View>
          </View>

          <View style={styles.vitalsInputGrid}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="Blood Sugar (mg/dL)"
                value={bloodSugar}
                onChangeText={setBloodSugar}
                keyboardType="numeric"
                placeholder="100"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <FormInput
                label="Temp (°F)"
                value={temperatureF}
                onChangeText={setTemperatureF}
                keyboardType="numeric"
                placeholder="98.6"
              />
            </View>
          </View>

          {vitalsResult.warnings.map((w, idx) => (
            <View key={idx} style={styles.vitalsWarningItem}>
              <AppIcon name="alertTriangle" size={14} color={colors.status.error} />
              <Text style={styles.vitalsWarningText}>{w}</Text>
            </View>
          ))}
        </Card>

        {/* 4. High-Risk Escalation Action Banner (F28-3 & Tier 4 Step 3) */}
        {isHighRisk && (
          <Card variant="elevated" style={styles.escalationCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <AppIcon name="phoneEmergency" size={24} color={colors.status.error} />
              <View style={{ flex: 1 }}>
                <Text style={styles.escalationTitle}>
                  {isEmergencyCritical
                    ? 'IMMEDIATE OBSTETRIC REFERRAL REQUIRED'
                    : 'HIGH-RISK PREGNANCY SURVEILLANCE'}
                </Text>
                <Text style={styles.escalationDesc}>
                  Patient presents with critical blood pressure / danger signs. Generate immediate 1-hour SLA referral to DH Satara Obstetric ICU.
                </Text>
              </View>
            </View>

            <Button
              title="Generate Immediate Referral Slip (1-Hour SLA)"
              variant="danger"
              size="lg"
              fullWidth={true}
              onPress={handleGenerateImmediateReferral}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* 5. PMSMA 4-Visit ANC Schedule (F28-4) */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {language === 'mr' ? 'PMSMA ४-तपासणी वेळापत्रक' : 'PMSMA 4-Visit ANC Schedule'}
          </Text>

          {PMSMA_SCHEDULE.map((visit) => {
            const isDone = completedVisits.includes(visit.visitNo);
            return (
              <TouchableOpacity
                key={visit.visitNo}
                style={styles.pmsmaRow}
                onPress={() => {
                  setCompletedVisits((prev) =>
                    prev.includes(visit.visitNo)
                      ? prev.filter((v) => v !== visit.visitNo)
                      : [...prev, visit.visitNo]
                  );
                }}
              >
                <View style={[styles.visitBadge, isDone && styles.visitBadgeDone]}>
                  <Text style={[styles.visitBadgeText, isDone && styles.visitBadgeTextDone]}>
                    V{visit.visitNo}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visitIdealText}>{visit.idealWeeks}</Text>
                  <Text style={styles.visitDescText}>{visit.descriptionEn}</Text>
                </View>
                <View style={[styles.checkbox, isDone && styles.checkboxChecked]}>
                  {isDone && <AppIcon name="check" size={14} color={colors.white} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* 6. CBAC NCD Screening Metric (F28-5) */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Community Based Assessment Checklist (CBAC)</Text>
            <Badge
              label={`Score: ${cbacScore}`}
              variant={cbacScore > 4 ? 'danger' : 'success'}
              size="sm"
            />
          </View>
          <Text style={styles.cbacHelpText}>
            NCD risk score above 4 requires mandatory primary health center evaluation.
          </Text>

          <View style={styles.cbacScoreStepper}>
            <Text style={styles.cbacLabel}>Current CBAC Score:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <TouchableOpacity
                onPress={() => setCbacScore((s) => Math.max(0, s - 1))}
                style={styles.cbacStepBtn}
              >
                <Text style={styles.cbacStepBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.cbacScoreValue}>{cbacScore}</Text>
              <TouchableOpacity
                onPress={() => setCbacScore((s) => s + 1)}
                style={styles.cbacStepBtn}
              >
                <Text style={styles.cbacStepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Referral Slip Modal (Tier 4 Step 3) */}
      {generatedReferral && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalBackdrop}>
            <Card variant="elevated" style={styles.referralModalCard}>
              <View style={styles.referralModalTop}>
                <AppIcon name="phoneEmergency" size={28} color={colors.status.error} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.referralModalTitle}>IMMEDIATE REFERRAL SLIP</Text>
                  <Text style={styles.referralModalSub}>SLA: 60 Minutes (Urgent Obstetric Care)</Text>
                </View>
                <Badge label="IMMEDIATE" variant="danger" size="sm" />
              </View>

              <View style={styles.referralInfoBox}>
                <Text style={styles.referralField}>
                  Ref No: <Text style={styles.fieldBold}>{generatedReferral.referralId}</Text>
                </Text>
                <Text style={styles.referralField}>
                  Patient: <Text style={styles.fieldBold}>{generatedReferral.patientName}</Text> ({beneficiaryId})
                </Text>
                <Text style={styles.referralField}>
                  Origin: <Text style={styles.fieldBold}>Sub-Centre Tapola (FAC007)</Text>
                </Text>
                <Text style={styles.referralField}>
                  Destination: <Text style={styles.fieldBold}>District Hospital Satara (FAC001)</Text>
                </Text>
                <Text style={styles.referralField}>
                  Specialty: <Text style={styles.fieldBold}>{generatedReferral.specialty}</Text>
                </Text>
                <Text style={styles.referralField}>
                  Diagnosis: <Text style={styles.fieldBold}>{generatedReferral.provisionalDiagnosis}</Text>
                </Text>
              </View>

              <View style={styles.qrCodeBox}>
                <AppIcon name="fingerprint" size={32} color={colors.primary.DEFAULT} />
                <Text style={styles.qrPayloadCode}>{generatedReferral.qrCodePayload}</Text>
              </View>

              <Button
                title="Call 108 Emergency Ambulance"
                variant="danger"
                fullWidth={true}
                onPress={() => navigation.navigate('EmergencySOS')}
                style={{ marginBottom: spacing.xs }}
              />

              <Button
                title="Dismiss & Return"
                variant="outline"
                fullWidth={true}
                onPress={() => setGeneratedReferral(null)}
              />
            </Card>
          </View>
        </Modal>
      )}
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
  beneficiaryBanner: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  patientMetaText: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 2,
  },
  sectionCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  weeksStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginVertical: spacing.sm,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  weeksDisplay: {
    alignItems: 'center',
  },
  weeksNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary.DEFAULT,
  },
  weeksUnit: {
    fontSize: 12,
    color: colors.slate.muted,
  },
  trimesterBar: {
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.sm,
  },
  trimesterSegment: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  trimesterActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  trimesterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate.gray,
  },
  trimesterLabelActive: {
    color: colors.white,
  },
  dangerCardBorder: {
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  checklistInstruction: {
    fontSize: 11,
    color: colors.slate.muted,
    marginBottom: spacing.sm,
  },
  dangerSignItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dangerSignItemChecked: {
    backgroundColor: '#FFF5F5',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.slate.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
  },
  dangerSignTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  dangerSignTitleChecked: {
    color: colors.status.error,
  },
  dangerSignDesc: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 1,
  },
  vitalsInputGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vitalsWarningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  vitalsWarningText: {
    fontSize: 11,
    color: colors.status.error,
    fontWeight: '600',
  },
  escalationCard: {
    padding: spacing.md,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  escalationTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.status.error,
  },
  escalationDesc: {
    fontSize: 11,
    color: colors.slate.dark,
    marginTop: 2,
    lineHeight: 16,
  },
  pmsmaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  visitBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitBadgeDone: {
    backgroundColor: colors.primary.DEFAULT,
  },
  visitBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slate.gray,
  },
  visitBadgeTextDone: {
    color: colors.white,
  },
  visitIdealText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  visitDescText: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 1,
  },
  cbacHelpText: {
    fontSize: 11,
    color: colors.slate.muted,
    marginBottom: spacing.sm,
  },
  cbacScoreStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  cbacLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  cbacStepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cbacStepBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  cbacScoreValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary.DEFAULT,
    minWidth: 24,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  referralModalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  referralModalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  referralModalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.status.error,
  },
  referralModalSub: {
    fontSize: 10,
    color: colors.slate.gray,
    marginTop: 1,
  },
  referralInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    gap: 4,
    marginBottom: spacing.sm,
  },
  referralField: {
    fontSize: 11,
    color: colors.slate.dark,
  },
  fieldBold: {
    fontWeight: '700',
  },
  qrCodeBox: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  qrPayloadCode: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.primary.DEFAULT,
    marginTop: 4,
  },
});
