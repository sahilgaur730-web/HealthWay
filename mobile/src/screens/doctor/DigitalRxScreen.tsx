/**
 * HealthWay Digital Rx & Clinical Notes Screen
 * Government of Maharashtra - Integrated Rural Health Platform
 * Feature 33: Digital Prescription Writer with FHIR R4 & ABDM Compliance
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageEngine } from '../../storage/storageEngine';
import { AUTHORITATIVE_EDL_CATALOG } from '../../data/edlMedicines';
import { DIAGNOSTIC_CATALOG_48, DiagnosticCatalogItem } from '../../data/diagnosticCatalog';

interface PrescribedItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
}

export const DigitalRxScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { session } = useAuth();
  const { language } = useLanguage();

  const patientName = route.params?.patientName || 'Sunita Suresh Gaikwad';
  const patientAbhaId = route.params?.abhaId || '14-4821-9876-5432';
  const doctorRegNo = session.user.registrationNo || 'MCI-MH-2015-09871';

  const [diagnosis, setDiagnosis] = useState<string>('Upper Respiratory Tract Infection (URTI)');
  const [selectedMedicines, setSelectedMedicines] = useState<PrescribedItem[]>([
    {
      medicineId: 'MED001',
      medicineName: 'Paracetamol 500mg (Tablet)',
      dosage: '500mg',
      frequency: '1-0-1',
      durationDays: 3,
    },
  ]);
  const [selectedTests, setSelectedTests] = useState<string[]>(['HEM-01']); // CBC
  const [referralNote, setReferralNote] = useState<string>('');
  const [isReferralNeeded, setIsReferralNeeded] = useState<boolean>(false);
  const [showFhirPreview, setShowFhirPreview] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Quick medicine add helper
  const handleAddMedicine = (code: string) => {
    const med = AUTHORITATIVE_EDL_CATALOG.find(m => m.code === code);
    if (!med) return;
    if (selectedMedicines.some(m => m.medicineId === med.id)) {
      Alert.alert('Notice', `${med.name} is already in the prescription.`);
      return;
    }
    setSelectedMedicines(prev => [
      ...prev,
      {
        medicineId: med.id,
        medicineName: `${med.name} (${med.strength})`,
        dosage: med.strength,
        frequency: '1-0-1',
        durationDays: 5,
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setSelectedMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTest = (testCode: string) => {
    if (selectedTests.includes(testCode)) {
      setSelectedTests(prev => prev.filter(t => t !== testCode));
    } else {
      setSelectedTests(prev => [...prev, testCode]);
    }
  };

  // Generate FHIR R4 Bundle representation
  const generateFhirBundle = () => ({
    resourceType: 'Bundle',
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: 'MedicationRequest',
          id: `medrx-${Date.now().toString().slice(-6)}`,
          status: 'active',
          intent: 'order',
          subject: { reference: `Patient/${patientAbhaId}` },
          requester: {
            display: session.user.name,
            identifier: { system: 'https://nmc.org.in', value: doctorRegNo },
          },
          reasonCode: [{ text: diagnosis }],
          medicationCodeableConcept: {
            coding: selectedMedicines.map(m => ({
              system: 'http://healthway.gov.in/edl',
              code: m.medicineId,
              display: m.medicineName,
            })),
          },
        },
      },
    ],
  });

  const handleSaveAndSign = async () => {
    if (!diagnosis.trim()) {
      Alert.alert('Required', 'Please enter a clinical diagnosis.');
      return;
    }
    if (selectedMedicines.length === 0 && selectedTests.length === 0) {
      Alert.alert('Required', 'Please prescribe at least one medicine or diagnostic test.');
      return;
    }

    setIsSaving(true);
    try {
      const rxId = `RX-2026-${Date.now().toString().slice(-6)}`;
      const prescriptionRecord = {
        rxId,
        patientName,
        patientAbhaId,
        doctorName: session.user.name,
        doctorRegistrationNo: doctorRegNo,
        facilityName: session.user.facilityName || 'Rural Hospital Karjat',
        diagnosis,
        medicines: selectedMedicines,
        diagnosticTests: selectedTests,
        referralNote: isReferralNeeded ? referralNote : undefined,
        fhirBundle: generateFhirBundle(),
        timestamp: new Date().toISOString(),
      };

      // Save to offline storage and sync outbox
      await storageEngine.saveItem('patient_cache', `rx_${rxId}`, prescriptionRecord);
      await storageEngine.enqueueSync('/api/v1/prescriptions', 'POST', prescriptionRecord);

      Alert.alert(
        language === 'mr' ? 'डिजिटल औषधोपचार स्वाक्षरीत!' : 'Prescription Signed & Issued',
        language === 'mr'
          ? `प्रिस्क्रिप्शन क्रमांक ${rxId} रुग्णाच्या डिजिटल लॉकरमध्ये साठवले गेले.`
          : `Digital Rx ${rxId} issued under NMC Reg: ${doctorRegNo}. Linked to ABHA: ${patientAbhaId}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('DoctorOPDQueue'),
          },
        ]
      );
    } catch (err) {
      console.warn('Failed to save prescription', err);
      Alert.alert('Error', 'Failed to issue prescription. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Clinical Rx Writer"
        subtitle={`NMC: ${doctorRegNo} · ${patientName}`}
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Doctor Verification Header Card */}
        <Card variant="accent" style={styles.docHeaderCard}>
          <View style={styles.docHeaderRow}>
            <View style={styles.docIconCircle}>
              <AppIcon name="doctor" size={24} color={colors.primary.DEFAULT} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{session.user.name}</Text>
              <Text style={styles.docReg}>
                Govt Reg / MCI No: <Text style={styles.boldText}>{doctorRegNo}</Text>
              </Text>
              <Text style={styles.docHospital}>{session.user.facilityName || 'Rural Hospital Karjat'}</Text>
            </View>
          </View>
        </Card>

        {/* Patient ABHA & Diagnosis Card */}
        <Card variant="default" title="Clinical Diagnosis" icon="patient">
          <View style={styles.patientStrip}>
            <Text style={styles.patientMetaLabel}>Patient ABHA ID:</Text>
            <Text style={styles.patientMetaVal}>{patientAbhaId}</Text>
          </View>
          <Text style={styles.inputLabel}>Provisional Diagnosis:</Text>
          <TextInput
            style={styles.textInput}
            value={diagnosis}
            onChangeText={setDiagnosis}
            placeholder="Enter clinical diagnosis / ICD-11 code"
            placeholderTextColor={colors.slate.muted}
          />
        </Card>

        {/* Selected Medicines List */}
        <Card
          variant="default"
          title={`Prescribed Medicines (${selectedMedicines.length})`}
          icon="medicine"
        >
          {selectedMedicines.map((item, index) => (
            <View key={index} style={styles.medRow}>
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{item.medicineName}</Text>
                <Text style={styles.medInstructions}>
                  Dosage: {item.dosage} · Regimen: {item.frequency} · {item.durationDays} Days
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveMedicine(index)}
                style={styles.removeBtn}
              >
                <AppIcon name="close" size={16} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Quick EDL Add Chips */}
          <Text style={styles.quickAddLabel}>Add from Maharashtra EDL Formulary:</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={styles.addChip}
              onPress={() => handleAddMedicine('EDL-02')}
            >
              <Text style={styles.addChipText}>+ Amoxicillin 500mg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addChip}
              onPress={() => handleAddMedicine('EDL-03')}
            >
              <Text style={styles.addChipText}>+ Cetirizine 10mg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addChip}
              onPress={() => handleAddMedicine('EDL-04')}
            >
              <Text style={styles.addChipText}>+ ORS Sachet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addChip}
              onPress={() => handleAddMedicine('EDL-06')}
            >
              <Text style={styles.addChipText}>+ IFA Tablets</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Diagnostic Investigations Ordering */}
        <Card variant="default" title="Order Lab Investigations" icon="diagnostic">
          <Text style={styles.quickAddLabel}>Select Tests for Specimen Collection:</Text>
          <View style={styles.testList}>
            {DIAGNOSTIC_CATALOG_48.slice(0, 5).map((test: DiagnosticCatalogItem) => {
              const isSelected = selectedTests.includes(test.code);
              return (
                <TouchableOpacity
                  key={test.code}
                  style={[styles.testItem, isSelected && styles.testItemActive]}
                  onPress={() => toggleTest(test.code)}
                >
                  <View style={styles.testLeft}>
                    <Text style={[styles.testCode, isSelected && styles.testCodeActive]}>
                      {test.code}
                    </Text>
                    <Text style={[styles.testName, isSelected && styles.testNameActive]}>
                      {test.name}
                    </Text>
                  </View>
                  <Badge
                    label={isSelected ? 'ORDERED' : 'ADD'}
                    variant={isSelected ? 'success' : 'neutral'}
                    size="sm"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Tertiary Referral Transfer Note */}
        <Card variant="default" title="Tertiary Escalation / Referral" icon="referral">
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsReferralNeeded(!isReferralNeeded)}
          >
            <View style={styles.toggleLeft}>
              <AppIcon
                name={isReferralNeeded ? 'checkCircle' : 'sync'}
                size={18}
                color={isReferralNeeded ? colors.status.error : colors.slate.muted}
              />
              <Text style={styles.toggleText}>
                {language === 'mr'
                  ? 'तृतीयक रुग्णालयात तातडीचा संदर्भ आवश्यक आहे का?'
                  : 'Escalate & issue tertiary referral slip?'}
              </Text>
            </View>
            <Badge
              label={isReferralNeeded ? 'REFERRAL ACTIVE' : 'NO'}
              variant={isReferralNeeded ? 'danger' : 'neutral'}
              size="sm"
            />
          </TouchableOpacity>

          {isReferralNeeded && (
            <View style={styles.referralInputWrap}>
              <Text style={styles.inputLabel}>Referral Reason & Receiving Center:</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                multiline
                value={referralNote}
                onChangeText={setReferralNote}
                placeholder="e.g., Transfer to District Hospital Satara for obstetric intensive monitoring..."
                placeholderTextColor={colors.slate.muted}
              />
            </View>
          )}
        </Card>

        {/* FHIR R4 Interop Inspection */}
        <TouchableOpacity
          style={styles.fhirToggleBtn}
          onPress={() => setShowFhirPreview(!showFhirPreview)}
        >
          <AppIcon name="admin" size={16} color={colors.primary.DEFAULT} />
          <Text style={styles.fhirToggleText}>
            {showFhirPreview ? 'Hide FHIR R4 MedicationRequest' : 'Inspect FHIR R4 MedicationRequest Resource'}
          </Text>
        </TouchableOpacity>

        {showFhirPreview && (
          <View style={styles.fhirBox}>
            <Text style={styles.fhirCodeText}>
              {JSON.stringify(generateFhirBundle(), null, 2)}
            </Text>
          </View>
        )}

        {/* Final Sign & Issue Button */}
        <Button
          title={isSaving ? 'Signing & Encrypting...' : 'Sign & Transmit Digital Rx'}
          variant="primary"
          size="lg"
          icon="checkCircle"
          disabled={isSaving}
          onPress={handleSaveAndSign}
          style={styles.saveBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate.bg,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing['4xl'],
  },
  docHeaderCard: {
    backgroundColor: colors.primary.light,
    borderColor: '#BFDBFE',
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  docIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary.dark,
  },
  docReg: {
    fontSize: 12,
    color: colors.slate.dark,
  },
  boldText: {
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  docHospital: {
    fontSize: 11,
    color: colors.slate.gray,
  },
  patientStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.borderLight,
    marginBottom: 8,
  },
  patientMetaLabel: {
    fontSize: 12,
    color: colors.slate.gray,
  },
  patientMetaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate.dark,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.slate.dark,
  },
  medRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.slate.borderLight,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  medInstructions: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 2,
  },
  removeBtn: {
    padding: 6,
  },
  quickAddLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate.gray,
    marginTop: 10,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  addChip: {
    backgroundColor: colors.slate.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.slate.borderLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },
  testList: {
    gap: 6,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate.borderLight,
    borderRadius: borderRadius.sm,
    padding: 8,
  },
  testItemActive: {
    borderColor: colors.status.success,
    backgroundColor: colors.status.successBg,
  },
  testLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  testCode: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.muted,
  },
  testCodeActive: {
    color: colors.status.success,
  },
  testName: {
    fontSize: 12,
    color: colors.slate.dark,
    flex: 1,
  },
  testNameActive: {
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate.dark,
    flex: 1,
  },
  referralInputWrap: {
    marginTop: 8,
  },
  fhirToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  fhirToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },
  fhirBox: {
    backgroundColor: '#1E293B',
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  fhirCodeText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#38BDF8',
    lineHeight: 14,
  },
  saveBtn: {
    marginTop: spacing.sm,
  },
});
