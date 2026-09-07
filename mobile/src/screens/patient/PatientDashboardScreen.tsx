/**
 * Patient Dashboard Screen (Feature 21)
 * HealthWay Native Mobile Platform - Patient Portal
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageEngine } from '../../storage/storageEngine';
import {
  DEFAULT_PATIENT_PROFILE,
  INITIAL_UPCOMING_APPOINTMENTS,
  INITIAL_ACTIVE_PRESCRIPTIONS,
  UpcomingAppointment,
  ActivePrescription,
  VitalsHistoryRecord,
} from '../../data/patientData';

export const PatientDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { session } = useAuth();
  const { language } = useLanguage();

  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>(INITIAL_UPCOMING_APPOINTMENTS);
  const [prescriptions] = useState<ActivePrescription[]>(INITIAL_ACTIVE_PRESCRIPTIONS);
  const [latestVitals, setLatestVitals] = useState<{
    bp: string;
    sugar: string;
    spo2: string;
    recordedDate: string;
    color: 'GREEN' | 'YELLOW' | 'RED';
  }>({
    bp: '124/82 mmHg',
    sugar: '110 mg/dL',
    spo2: '98%',
    recordedDate: '2026-09-06',
    color: 'GREEN',
  });

  const patientName = session.user?.name || DEFAULT_PATIENT_PROFILE.patientName;
  const abhaId = session.user?.abhaId || DEFAULT_PATIENT_PROFILE.abhaId;
  const aadhaarLast4 = DEFAULT_PATIENT_PROFILE.aadhaarLast4;
  const qrPayload = `https://healthway.gov.in/phr/${abhaId}`;

  const loadCachedData = useCallback(async () => {
    try {
      // Check for user-logged vitals in patient_cache
      const cachedVitals = await storageEngine.getAll<VitalsHistoryRecord>('patient_cache');
      if (cachedVitals && cachedVitals.length > 0) {
        const vitalsList = cachedVitals.filter((v) => v && (v.bpFormatted || v.systolicBp));
        if (vitalsList.length > 0) {
          const newest = vitalsList[vitalsList.length - 1];
          setLatestVitals({
            bp: newest.bpFormatted ? `${newest.bpFormatted} mmHg` : `${newest.systolicBp}/${newest.diastolicBp} mmHg`,
            sugar: `${newest.bloodSugar || 105} mg/dL`,
            spo2: `${newest.spo2 || 98}%`,
            recordedDate: newest.date || '2026-09-07',
            color: newest.color || 'GREEN',
          });
        }
      }

      // Check for user appointments in patient_cache
      const cachedAppointments = await storageEngine.getAll<UpcomingAppointment>('patient_cache');
      if (cachedAppointments && cachedAppointments.length > 0) {
        const aptList = cachedAppointments.filter((a) => a && a.tokenNumber && a.status);
        if (aptList.length > 0) {
          setAppointments(aptList);
        }
      }
    } catch (err) {
      console.warn('Error loading patient dashboard data:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCachedData();
    }, [loadCachedData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCachedData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'EMERGENCY_SOS',
      titleEn: '108 SOS',
      titleMr: '१०८ एसओएस',
      icon: 'phoneEmergency',
      color: colors.status.error,
      bg: '#FEE2E2',
      onPress: () => navigation.navigate('EmergencySOS'),
    },
    {
      id: 'BOOK_APPOINTMENT',
      titleEn: 'Book Doctor',
      titleMr: 'नोंदणी करा',
      icon: 'calendar',
      color: colors.primary.DEFAULT,
      bg: '#E0F2FE',
      onPress: () => navigation.navigate('AppointmentBooking'),
    },
    {
      id: 'TRACK_VITALS',
      titleEn: 'Vitals Tracker',
      titleMr: 'वाइटल्स ट्रॅकर',
      icon: 'heartPulse',
      color: '#16A34A',
      bg: '#DCFCE7',
      onPress: () => navigation.navigate('VitalsTracker'),
    },
    {
      id: 'MY_RECORDS',
      titleEn: 'PHR Locker',
      titleMr: 'आरोग्य लॉकर',
      icon: 'records',
      color: '#7B1FA2',
      bg: '#F3E8FF',
      onPress: () => navigation.navigate('PhrLocker'),
    },
    {
      id: 'SYMPTOM_TRIAGE',
      titleEn: 'AI Triage',
      titleMr: 'लक्षण ट्रायज',
      icon: 'triage',
      color: colors.accent.DEFAULT,
      bg: '#FEF3C7',
      onPress: () => navigation.navigate('SymptomTriage'),
    },
    {
      id: 'OPD_QUEUE',
      titleEn: 'Live Queue',
      titleMr: 'ओपीडी रांग',
      icon: 'queue',
      color: '#0D9488',
      bg: '#CCFBF1',
      onPress: () => navigation.navigate('QueueHub'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="HealthWay"
        subtitle={language === 'mr' ? 'नागरिक व रुग्ण पोर्टल' : 'Patient & Citizen Portal'}
        showBack={false}
        showSosButton={true}
        onSosPress={() => navigation.navigate('EmergencySOS')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 1. Digital ABHA ID Card (F21-1) */}
        <Card variant="elevated" style={styles.abhaCard}>
          <View style={styles.abhaHeaderRow}>
            <View style={styles.govSealBox}>
              <AppIcon name="admin" size={18} color="#93C5FD" />
              <Text style={styles.govSealText}>ABDM CERTIFIED · MAHARASHTRA</Text>
            </View>
            <Badge label="Active" variant="success" size="sm" />
          </View>

          <View style={styles.abhaCardBody}>
            <View style={styles.abhaAvatarCircle}>
              <AppIcon name="patient" size={32} color={colors.white} />
            </View>
            <View style={styles.abhaDetails}>
              <Text style={styles.abhaPatientName}>
                {language === 'mr' ? DEFAULT_PATIENT_PROFILE.nameMr : patientName}
              </Text>
              <Text style={styles.abhaIdNumber}>{abhaId}</Text>
              <View style={styles.abhaMetaRow}>
                <Text style={styles.abhaMetaText}>Aadhaar: **** {aadhaarLast4}</Text>
                <Text style={styles.abhaMetaText}>· 28 Yrs, Female</Text>
                <Text style={styles.abhaMetaText}>· Satara</Text>
              </View>
            </View>
          </View>

          {/* QR Code Simulation Box */}
          <View style={styles.abhaQrRow}>
            <View style={styles.abhaQrBox}>
              <AppIcon name="fingerprint" size={26} color={colors.primary.DEFAULT} />
              <Text style={styles.qrLabel}>ABHA QR</Text>
            </View>
            <View style={styles.abhaQrInfo}>
              <Text style={styles.qrPayloadText} numberOfLines={1}>
                {qrPayload}
              </Text>
              <Text style={styles.qrHelpText}>
                {language === 'mr'
                  ? 'रुग्णालयात त्वरित OPD नोंदणीसाठी स्कॅन करा'
                  : 'Scan for rapid paperless OPD registration'}
              </Text>
            </View>
          </View>
        </Card>

        {/* 2. Recent Vitals Summary Widget (F21-4) */}
        <Card variant="elevated" style={styles.vitalsSummaryCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWrap}>
              <AppIcon name="heartPulse" size={18} color="#16A34A" />
              <Text style={styles.sectionTitle}>
                {language === 'mr' ? 'आरोग्य निर्देशक सारांश' : 'Recent Vitals Summary'}
              </Text>
            </View>
            <Badge
              label={latestVitals.color === 'RED' ? 'CRITICAL' : latestVitals.color === 'YELLOW' ? 'ELEVATED' : 'NORMAL'}
              variant={latestVitals.color === 'RED' ? 'danger' : latestVitals.color === 'YELLOW' ? 'warning' : 'success'}
              size="sm"
            />
          </View>

          <View style={styles.vitalsMetricsRow}>
            <View style={styles.vitalsMetricBox}>
              <Text style={styles.vitalsLabel}>Blood Pressure</Text>
              <Text style={styles.vitalsValue}>{latestVitals.bp}</Text>
              <Text style={styles.vitalsDate}>{latestVitals.recordedDate}</Text>
            </View>
            <View style={styles.vitalsDivider} />
            <View style={styles.vitalsMetricBox}>
              <Text style={styles.vitalsLabel}>Blood Sugar</Text>
              <Text style={styles.vitalsValue}>{latestVitals.sugar}</Text>
              <Text style={styles.vitalsDate}>Fasting</Text>
            </View>
            <View style={styles.vitalsDivider} />
            <View style={styles.vitalsMetricBox}>
              <Text style={styles.vitalsLabel}>Oxygen SpO2</Text>
              <Text style={[styles.vitalsValue, { color: '#16A34A' }]}>{latestVitals.spo2}</Text>
              <Text style={styles.vitalsDate}>Optimal</Text>
            </View>
          </View>

          <Button
            title={language === 'mr' ? 'सर्व निर्देशक पहा व नोंदवा' : 'Track & Log Vitals'}
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('VitalsTracker')}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        {/* 3. Upcoming Consultations Widget (F21-2) */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWrap}>
              <AppIcon name="calendar" size={18} color={colors.primary.DEFAULT} />
              <Text style={styles.sectionTitle}>
                {language === 'mr' ? 'नियोजित डॉक्टरांची भेट' : 'Upcoming Consultations'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AppointmentBooking')}>
              <Text style={styles.linkText}>{language === 'mr' ? '+ नवीन नोंदणी' : '+ Book'}</Text>
            </TouchableOpacity>
          </View>

          {appointments.length > 0 ? (
            appointments.map((apt) => (
              <View key={apt.id} style={styles.appointmentItem}>
                <View style={styles.tokenCircle}>
                  <Text style={styles.tokenText}>{apt.tokenNumber}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.doctorNameText}>{apt.doctorName}</Text>
                  <Text style={styles.facilityNameText}>
                    {apt.facilityName} · {apt.specialization}
                  </Text>
                  <Text style={styles.dateTimeText}>
                    {apt.date} · {apt.slot}
                  </Text>
                </View>
                <Badge label={apt.status} variant={apt.status === 'CONFIRMED' ? 'success' : 'neutral'} size="sm" />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming appointments scheduled.</Text>
          )}
        </Card>

        {/* 4. Active Prescriptions Widget (F21-3) */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWrap}>
              <AppIcon name="medicine" size={18} color="#7B1FA2" />
              <Text style={styles.sectionTitle}>
                {language === 'mr' ? 'सक्रिय डिजिटल औषधोपचार' : 'Active Prescriptions'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('PhrLocker')}>
              <Text style={styles.linkText}>{language === 'mr' ? 'सर्व पहा' : 'View All'}</Text>
            </TouchableOpacity>
          </View>

          {prescriptions.map((rx) => (
            <View key={rx.id} style={styles.rxItemRow}>
              <View style={styles.rxPillIconBox}>
                <AppIcon name="medicine" size={18} color="#7B1FA2" />
              </View>
              <View style={styles.rxDetails}>
                <Text style={styles.rxDrugName}>{rx.medicineName}</Text>
                <Text style={styles.rxDosageText}>{rx.dosage}</Text>
                <Text style={styles.rxDoctorText}>
                  {rx.doctorName} · {rx.facility}
                </Text>
              </View>
              <Badge
                label={`${rx.daysRemaining} days left`}
                variant={rx.daysRemaining <= 3 ? 'warning' : 'primary'}
                size="sm"
              />
            </View>
          ))}
        </Card>

        {/* 5. Quick Action Shortcuts Grid (F21-5) */}
        <Text style={styles.gridSectionHeader}>
          {language === 'mr' ? 'द्रुत कृती शॉर्टकट' : 'QUICK ACTION SHORTCUTS'}
        </Text>
        <View style={styles.quickActionGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionTile}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIconCircle, { backgroundColor: action.bg }]}>
                <AppIcon name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={styles.quickActionTitle}>
                {language === 'mr' ? action.titleMr : action.titleEn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 6. Healthcare Operational Hubs */}
        <Text style={styles.gridSectionHeader}>
          {language === 'mr' ? 'आरोग्य कार्यप्रणाली केंद्रे' : 'HEALTHCARE OPERATIONAL HUBS'}
        </Text>
        <TouchableOpacity
          style={styles.hubTileRow}
          onPress={() => navigation.navigate('DiagnosticsHub')}
          activeOpacity={0.8}
        >
          <View style={[styles.hubTileIcon, { backgroundColor: '#E0F2FE' }]}>
            <AppIcon name="diagnostic" size={20} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.hubTileInfo}>
            <Text style={styles.hubTileTitle}>Diagnostics & Lab Hub</Text>
            <Text style={styles.hubTileSubtitle}>48 catalog tests, sample tracker & PDF reports</Text>
          </View>
          <AppIcon name="chevronRight" size={16} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hubTileRow}
          onPress={() => navigation.navigate('ReferralsHub')}
          activeOpacity={0.8}
        >
          <View style={[styles.hubTileIcon, { backgroundColor: '#F3E8FF' }]}>
            <AppIcon name="referral" size={20} color="#7B1FA2" />
          </View>
          <View style={styles.hubTileInfo}>
            <Text style={styles.hubTileTitle}>Referral Pipeline</Text>
            <Text style={styles.hubTileSubtitle}>7-stage inter-facility tracker & counter-referrals</Text>
          </View>
          <AppIcon name="chevronRight" size={16} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hubTileRow}
          onPress={() => navigation.navigate('MedicineHub')}
          activeOpacity={0.8}
        >
          <View style={[styles.hubTileIcon, { backgroundColor: '#DCFCE7' }]}>
            <AppIcon name="medicine" size={20} color="#15803D" />
          </View>
          <View style={styles.hubTileInfo}>
            <Text style={styles.hubTileTitle}>Essential Drug Stock (EDL)</Text>
            <Text style={styles.hubTileSubtitle}>Real-time medicine availability across Satara PHCs</Text>
          </View>
          <AppIcon name="chevronRight" size={16} color="#94A3B8" />
        </TouchableOpacity>
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
  abhaCard: {
    backgroundColor: colors.primary.DEFAULT,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  abhaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  govSealBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  govSealText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#93C5FD',
  },
  abhaCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  abhaAvatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  abhaDetails: {
    flex: 1,
  },
  abhaPatientName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  abhaIdNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FDE047',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  abhaMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  abhaMetaText: {
    fontSize: 11,
    color: '#E2E8F0',
  },
  abhaQrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  abhaQrBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
    marginTop: 1,
  },
  abhaQrInfo: {
    flex: 1,
  },
  qrPayloadText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontFamily: 'monospace',
  },
  qrHelpText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '500',
    marginTop: 2,
  },
  vitalsSummaryCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  vitalsMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  vitalsMetricBox: {
    flex: 1,
    alignItems: 'center',
  },
  vitalsDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  vitalsLabel: {
    fontSize: 10,
    color: colors.slate.gray,
    fontWeight: '600',
  },
  vitalsValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.slate.dark,
    marginTop: 2,
  },
  vitalsDate: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 1,
  },
  sectionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  tokenCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  facilityNameText: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 1,
  },
  dateTimeText: {
    fontSize: 11,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 12,
    color: colors.slate.muted,
    fontStyle: 'italic',
    paddingVertical: spacing.xs,
  },
  rxItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rxPillIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rxDetails: {
    flex: 1,
  },
  rxDrugName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  rxDosageText: {
    fontSize: 11,
    color: colors.slate.gray,
  },
  rxDoctorText: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 1,
  },
  gridSectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickActionTile: {
    width: '31%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  quickActionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.dark,
    textAlign: 'center',
  },
  hubTileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },
  hubTileIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTileInfo: {
    flex: 1,
  },
  hubTileTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  hubTileSubtitle: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 2,
  },
});
