/**
 * ASHA Field Triage & Referral Slip Screen (Feature 30)
 * HealthWay Native Mobile Platform - ASHA Community Module
 * Standardized WHO ETAT field assessment and digital priority referral slips
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
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
import { useAuth } from '../../context/AuthContext';
import { storageEngine } from '../../storage/storageEngine';
import {
  evaluateFieldTriage,
  FieldTriageInput,
  FieldTriageResult,
} from '../../services/fieldTriageService';
import { VitalsReading } from '../../services/vitalsService';
import { DANGER_SIGNS_CATALOG } from '../../data/ashaData';
import { DEFAULT_PATIENT_PROFILE } from '../../data/patientData';

export const FieldTriageScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { language } = useLanguage();
  const { session } = useAuth();

  // Patient parameters
  const [patientId, setPatientId] = useState(route.params?.patientId || 'PT-001');
  const [patientName, setPatientName] = useState('Sunita Jadhav');
  const [patientAge, setPatientAge] = useState('28');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [isPregnant, setIsPregnant] = useState(true);

  // AVPU Consciousness
  const [consciousness, setConsciousness] = useState<'A' | 'V' | 'P' | 'U'>('A');

  // Vitals
  const [systolicBp, setSystolicBp] = useState('145');
  const [diastolicBp, setDiastolicBp] = useState('95');
  const [heartRate, setHeartRate] = useState('88');
  const [spo2, setSpo2] = useState('96');
  const [bloodSugar, setBloodSugar] = useState('110');
  const [temperatureF, setTemperatureF] = useState('99.2');

  // Danger Signs
  const [selectedDangerSigns, setSelectedDangerSigns] = useState<string[]>(
    route.params?.prefillSymptoms?.length > 0 ? ['Severe persistent headache'] : ['Severe persistent headache']
  );

  // Complaint & Notes
  const [complaint, setComplaint] = useState(
    route.params?.prefillComplaint || 'Severe headache and elevated blood pressure observed in 3rd trimester.'
  );

  // Referral Slip Generation State
  const [generatedSlip, setGeneratedSlip] = useState<FieldTriageResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Attempt to preload patient profile from cache
    storageEngine.getItem<any>('patient_cache', patientId).then((rec) => {
      if (rec) {
        if (rec.nameEn) setPatientName(rec.nameEn);
        if (rec.age) setPatientAge(String(rec.age));
        if (rec.gender) setGender(rec.gender);
        if (rec.isPregnant !== undefined) setIsPregnant(rec.isPregnant);
      }
    });
  }, [patientId]);

  const toggleDangerSign = (sign: string) => {
    setSelectedDangerSigns((prev) =>
      prev.includes(sign) ? prev.filter((s) => s !== sign) : [...prev, sign]
    );
  };

  const handleGenerateSlip = async () => {
    setIsGenerating(true);
    try {
      const vitals: VitalsReading = {
        systolicBp: parseInt(systolicBp, 10) || 120,
        diastolicBp: parseInt(diastolicBp, 10) || 80,
        heartRate: parseInt(heartRate, 10) || 72,
        spo2: parseInt(spo2, 10) || 98,
        bloodSugarRandom: parseInt(bloodSugar, 10) || 100,
        temperatureF: parseFloat(temperatureF) || 98.4,
      };

      const triageInput: FieldTriageInput = {
        patientId,
        patientName,
        age: parseInt(patientAge, 10) || 28,
        gender,
        isPregnant,
        consciousness,
        vitals,
        dangerSigns: selectedDangerSigns,
        primaryComplaint: complaint,
        ashaId: session.user?.id || 'ASHA-01',
        ashaName: session.user?.name || 'Sister Anandi Gaikwad',
        fromFacilityId: 'FAC007', // Sub-Centre Tapola
      };

      const result = evaluateFieldTriage(triageInput);

      // 1. Save to referral_drafts store (F30-4, XC01)
      await storageEngine.saveItem('referral_drafts', result.referralId, {
        ...result,
        patientId,
        patientName,
        fromFacilityId: 'FAC007',
        toFacilityId: result.destinationFacility.id,
        stage: 'CREATED',
        vitals,
        createdAt: new Date().toISOString(),
      });

      // 2. Queue referral to sync_queue (XC13-15)
      await storageEngine.enqueueSync('/api/v1/referrals', 'POST', {
        ...result,
        patientId,
        fromFacilityId: 'FAC007',
        toFacilityId: result.destinationFacility.id,
        stage: 'CREATED',
      });

      // 3. Queue vitals to sync_queue (XC14)
      await storageEngine.enqueueSync('/api/v1/vitals', 'POST', {
        patientId,
        ...vitals,
        recordedAt: new Date().toISOString(),
      });

      // 4. If antenatal / emergency priority, allocate priority token (XC14)
      if (isPregnant) {
        await storageEngine.enqueueSync('/api/v1/queue/tokens', 'POST', {
          patientId,
          patientName,
          category: 'ANTENATAL',
          priorityWeight: 80,
          status: 'WAITING',
          facilityId: result.destinationFacility.id,
        });
      }

      setGeneratedSlip(result);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to generate field triage referral slip');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDial108 = () => {
    // 1-tap call to 108 ambulance (F30-5)
    Linking.openURL('tel:108').catch(() => {
      Alert.alert('108 Helpline', 'Direct dial tel:108');
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'फील्ड ट्रायज व संदर्भ' : 'Community Field Triage'}
        subtitle="ETAT Rapid Assessment & Priority Referral Slip"
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={true}
        onSosPress={() => navigation.navigate('EmergencySOS')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Beneficiary Information */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>1. Beneficiary Demographics</Text>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1.5 }}>
              <FormInput
                label="Beneficiary Name"
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Sunita Jadhav"
                icon="profile"
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <FormInput
                label="Age (Yrs)"
                value={patientAge}
                onChangeText={setPatientAge}
                placeholder="28"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Antenatal Status Toggle */}
          <View style={styles.ancToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ancToggleText}>Antenatal Care (Pregnant Patient)</Text>
              <Text style={styles.ancToggleSub}>Enables maternal triage protocol & 102 Janani dispatch</Text>
            </View>
            <TouchableOpacity
              style={[styles.ancBtn, isPregnant && styles.ancBtnActive]}
              onPress={() => setIsPregnant(!isPregnant)}
            >
              <Text style={[styles.ancBtnText, isPregnant && styles.ancBtnTextActive]}>
                {isPregnant ? 'YES' : 'NO'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Step 2: AVPU Consciousness Scale */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>2. AVPU Consciousness Level (ETAT Standard)</Text>
          <Text style={styles.avpuHelpText}>Any score below Alert escalates to Emergency RED</Text>

          <View style={styles.avpuRow}>
            {(
              [
                { code: 'A', label: 'Alert (सजग)', isNormal: true },
                { code: 'V', label: 'Voice (आवाजाला प्रतिसाद)', isNormal: false },
                { code: 'P', label: 'Pain (वेदनेला प्रतिसाद)', isNormal: false },
                { code: 'U', label: 'Unresponsive (बेशुद्ध)', isNormal: false },
              ] as const
            ).map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.avpuTile,
                  consciousness === item.code && styles.avpuTileSelected,
                  consciousness === item.code && !item.isNormal && styles.avpuTileEmergency,
                ]}
                onPress={() => setConsciousness(item.code)}
              >
                <Text
                  style={[
                    styles.avpuCodeText,
                    consciousness === item.code && styles.avpuCodeTextSelected,
                  ]}
                >
                  {item.code}
                </Text>
                <Text
                  style={[
                    styles.avpuLabelText,
                    consciousness === item.code && styles.avpuLabelTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Step 3: Vitals Entry */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>3. Physiological Vitals</Text>

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
        </Card>

        {/* Step 4: Danger Signs Checklist */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={[styles.cardHeaderTitle, { color: colors.status.error }]}>
            4. Clinical Danger Signs Checklist
          </Text>
          <Text style={styles.dangerHelpText}>
            2+ signs or elevated BP triggers EMERGENCY priority (RED)
          </Text>

          {DANGER_SIGNS_CATALOG.map((sign) => {
            const isChecked = selectedDangerSigns.includes(sign.labelEn);
            return (
              <TouchableOpacity
                key={sign.id}
                style={[styles.dangerRow, isChecked && styles.dangerRowChecked]}
                onPress={() => toggleDangerSign(sign.labelEn)}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <AppIcon name="check" size={14} color={colors.white} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dangerLabel, isChecked && styles.dangerLabelChecked]}>
                    {sign.labelEn}
                  </Text>
                  <Text style={styles.dangerSub}>{sign.labelMr}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Step 5: Complaint & Notes */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>5. Field Clinical Notes / Complaint</Text>
          <FormInput
            value={complaint}
            onChangeText={setComplaint}
            placeholder="Clinical observation notes..."
            multiline={true}
          />
        </Card>

        {/* Submit & Generate Slip Action */}
        <Button
          title={isGenerating ? 'Evaluating & Generating Slip...' : 'Evaluate & Generate Referral Slip'}
          variant="primary"
          size="lg"
          fullWidth={true}
          loading={isGenerating}
          onPress={handleGenerateSlip}
          style={{ marginVertical: spacing.md }}
        />
      </ScrollView>

      {/* Digital Priority Referral Slip Modal (F30-2, F30-3, F30-5) */}
      {generatedSlip && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalBackdrop}>
            <Card variant="elevated" style={styles.slipCard}>
              <View style={styles.slipHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.slipTitle}>COMMUNITY PRIORITY REFERRAL SLIP</Text>
                  <Text style={styles.slipSub}>Government of Maharashtra · Health Department</Text>
                </View>
                <Badge
                  label={generatedSlip.triageLevel}
                  variant={generatedSlip.triageLevel === 'RED' ? 'danger' : generatedSlip.triageLevel === 'YELLOW' ? 'warning' : 'success'}
                  size="sm"
                />
              </View>

              {/* Reference ID & Barcode Display (F30-2) */}
              <View style={styles.refBox}>
                <Text style={styles.refNumberText}>{generatedSlip.referralNumber}</Text>
                <Text style={styles.displayCodeText}>Barcode: {generatedSlip.displayCode}</Text>
              </View>

              {/* SLA Banner */}
              <View
                style={[
                  styles.slaBanner,
                  {
                    backgroundColor:
                      generatedSlip.urgency === 'IMMEDIATE'
                        ? '#FEF2F2'
                        : generatedSlip.urgency === 'URGENT'
                        ? '#FFFBEB'
                        : '#F0FDF4',
                  },
                ]}
              >
                <AppIcon
                  name="clock"
                  size={16}
                  color={
                    generatedSlip.urgency === 'IMMEDIATE'
                      ? colors.status.error
                      : generatedSlip.urgency === 'URGENT'
                      ? '#D97706'
                      : colors.status.success
                  }
                />
                <Text style={styles.slaText}>
                  Urgency: {generatedSlip.urgency} · SLA: {generatedSlip.slaMinutes} Minutes
                </Text>
              </View>

              {/* Clinical Breakdown */}
              <View style={styles.detailsGrid}>
                <Text style={styles.detailItem}>
                  Patient: <Text style={{ fontWeight: '700' }}>{patientName}</Text> ({patientAge}y, {gender})
                </Text>
                <Text style={styles.detailItem}>
                  Origin: <Text style={{ fontWeight: '700' }}>Sub-Centre Tapola (FAC007)</Text>
                </Text>
                <Text style={styles.detailItem}>
                  Destination: <Text style={{ fontWeight: '700' }}>{generatedSlip.destinationFacility.name} ({generatedSlip.destinationFacility.id})</Text>
                </Text>
                <Text style={styles.detailItem}>
                  Specialty: <Text style={{ fontWeight: '700' }}>{generatedSlip.specialty}</Text>
                </Text>
                <Text style={styles.detailItem}>
                  Transport: <Text style={{ fontWeight: '700' }}>{generatedSlip.transportType}</Text>
                </Text>
              </View>

              {/* QR Code Payload Display (F30-3) */}
              <View style={styles.qrPayloadBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <AppIcon name="qrCode" size={16} color={colors.primary.DEFAULT} />
                  <Text style={styles.qrTitle}>QR Barcode Data</Text>
                </View>
                <Text style={styles.qrContentText} numberOfLines={3}>
                  {generatedSlip.qrPayload}
                </Text>
              </View>

              {/* Emergency Calling (F30-5) */}
              <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
                {generatedSlip.isEmergency && (
                  <Button
                    title="1-Tap Call 108 Emergency Ambulance"
                    variant="danger"
                    fullWidth={true}
                    onPress={handleDial108}
                  />
                )}
                <Button
                  title="Close & Return to Dashboard"
                  variant="outline"
                  fullWidth={true}
                  onPress={() => setGeneratedSlip(null)}
                />
              </View>
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
  sectionCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.slate.dark,
    marginBottom: spacing.sm,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ancToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ancToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  ancToggleSub: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 2,
  },
  ancBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: borderRadius.sm,
    backgroundColor: '#E2E8F0',
  },
  ancBtnActive: {
    backgroundColor: colors.status.error,
  },
  ancBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slate.gray,
  },
  ancBtnTextActive: {
    color: colors.white,
  },
  avpuHelpText: {
    fontSize: 11,
    color: colors.slate.muted,
    marginBottom: spacing.sm,
  },
  avpuRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  avpuTile: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avpuTileSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: colors.primary.DEFAULT,
  },
  avpuTileEmergency: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.status.error,
  },
  avpuCodeText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.slate.dark,
  },
  avpuCodeTextSelected: {
    color: colors.primary.DEFAULT,
  },
  avpuLabelText: {
    fontSize: 8,
    color: colors.slate.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  avpuLabelTextSelected: {
    color: colors.slate.dark,
    fontWeight: '700',
  },
  dangerHelpText: {
    fontSize: 11,
    color: colors.slate.muted,
    marginBottom: spacing.sm,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dangerRowChecked: {
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
  },
  checkboxChecked: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
  },
  dangerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  dangerLabelChecked: {
    color: colors.status.error,
  },
  dangerSub: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  slipCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.lg,
  },
  slipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: spacing.sm,
  },
  slipTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary.DEFAULT,
  },
  slipSub: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 1,
  },
  refBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.slate.dark,
    letterSpacing: 0.5,
  },
  displayCodeText: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  slaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  slaText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  detailsGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    gap: 4,
    marginBottom: spacing.sm,
  },
  detailItem: {
    fontSize: 11,
    color: colors.slate.dark,
  },
  qrPayloadBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  qrTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
  },
  qrContentText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: colors.slate.dark,
  },
});
