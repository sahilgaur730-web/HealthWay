/**
 * ASHA Field Dashboard Screen (Feature 26)
 * HealthWay Native Mobile Platform - ASHA Community Module
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
  Alert,
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
import { syncEngine } from '../../services/syncEngine';
import {
  TAPOLA_VILLAGE_BEAT,
  INITIAL_PREGNANT_ROSTER,
  INITIAL_IMMUNIZATION_DUE_LIST,
  INITIAL_DAILY_TASKS,
  EMERGENCY_SPEED_DIALERS,
  PregnantBeneficiary,
  ImmunizationDueItem,
  DailyFieldTask,
} from '../../data/ashaData';

export const AshaFieldDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { session } = useAuth();
  const { language } = useLanguage();

  const [refreshing, setRefreshing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [connectionQuality, setConnectionQuality] = useState(syncEngine.getQuality());
  const [tasks, setTasks] = useState<DailyFieldTask[]>(INITIAL_DAILY_TASKS);
  const [pregnantRoster] = useState<PregnantBeneficiary[]>(INITIAL_PREGNANT_ROSTER);
  const [immunizations, setImmunizations] = useState<ImmunizationDueItem[]>(INITIAL_IMMUNIZATION_DUE_LIST);
  const [immunizationFilter, setImmunizationFilter] = useState<'ALL' | 'OVERDUE' | 'UPCOMING'>('ALL');

  const ashaName = session.user?.name || 'Sister Anandi Gaikwad';
  const facility = session.user?.facilityName || 'Sub-Centre Tapola';

  // Load sync badge and offline records
  const loadDashboardData = useCallback(async () => {
    try {
      const pending = await storageEngine.getPendingSyncItems();
      setPendingSyncCount(pending.length);
      setConnectionQuality(syncEngine.getQuality());
    } catch (err) {
      console.warn('Dashboard data refresh error:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    if (syncEngine.isOnline()) {
      await syncEngine.syncOutbox();
      await loadDashboardData();
    }
    setRefreshing(false);
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = tasks.length > 0 ? completedTasksCount / tasks.length : 0;
  const highRiskMothers = pregnantRoster.filter((p) => p.isHighRisk);
  const overdueImmunizations = immunizations.filter((i) => i.status === 'OVERDUE');

  const filteredImmunizations = immunizations.filter((i) => {
    if (immunizationFilter === 'OVERDUE') return i.status === 'OVERDUE';
    if (immunizationFilter === 'UPCOMING') return i.status === 'UPCOMING';
    return true;
  });

  const handleDial = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Calling Unavailable', `Dial ${number} manually.`);
    });
  };

  return (
    <View style={styles.container}>
      {/* Institutional Navigation Header */}
      <Header
        title="HealthWay"
        subtitle={language === 'mr' ? 'आशा कार्यकर्ती डॅशबोर्ड' : 'ASHA Field Operations'}
        showBack={false}
        showSosButton={true}
        onSosPress={() => navigation.navigate('EmergencySOS')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Top Operational Status Bar & Sync Badge (F26-5) */}
        <View style={styles.syncStatusBar}>
          <View style={styles.syncStatusLeft}>
            <View
              style={[
                styles.networkDot,
                { backgroundColor: connectionQuality === 'OFFLINE' ? colors.status.warning : colors.status.success },
              ]}
            />
            <Text style={styles.networkStatusText}>
              {connectionQuality === 'OFFLINE'
                ? (language === 'mr' ? 'ऑफलाइन मोड (कॅश सक्रिय)' : 'Offline Mode (Local Cache)')
                : (language === 'mr' ? 'ऑनलाइन सिंक सुरू' : 'Online Sync Active')}
            </Text>
          </View>
          {pendingSyncCount > 0 ? (
            <TouchableOpacity
              onPress={() => syncEngine.syncOutbox().then(loadDashboardData)}
              style={styles.pendingBadgeBtn}
            >
              <AppIcon name="sync" size={14} color={colors.white} />
              <Text style={styles.pendingBadgeText}>
                {`${pendingSyncCount} ${language === 'mr' ? 'प्रलंबित' : 'Pending'}`}
              </Text>
            </TouchableOpacity>
          ) : (
            <Badge label={language === 'mr' ? 'सिंक पूर्ण' : 'Fully Synced'} variant="success" size="sm" />
          )}
        </View>

        {/* ASHA Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <AppIcon name="asha" size={28} color="#9C27B0" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.ashaNameText}>{ashaName}</Text>
              <Text style={styles.facilityText}>{facility} · Block Mahabaleshwar</Text>
              <View style={styles.profileBadges}>
                <Badge label="Beat Tapola (#4)" variant="purple" size="sm" />
                <Badge label="Reg: MH-ASHA-7012" variant="neutral" size="sm" />
              </View>
            </View>
          </View>
        </Card>

        {/* Primary Operational Action Buttons */}
        <View style={styles.mainActionsRow}>
          <TouchableOpacity
            style={[styles.mainActionBtn, { backgroundColor: '#E0F2FE', borderColor: '#BFDBFE' }]}
            onPress={() => navigation.navigate('BeneficiaryRegistration')}
            activeOpacity={0.8}
          >
            <AppIcon name="profile" size={22} color={colors.primary.DEFAULT} />
            <Text style={[styles.mainActionTitle, { color: colors.primary.DEFAULT }]}>
              + Register
            </Text>
            <Text style={styles.mainActionSub}>Offline Intake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainActionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
            onPress={() => navigation.navigate('HighRiskPregnancy')}
            activeOpacity={0.8}
          >
            <AppIcon name="heartPulse" size={22} color={colors.status.error} />
            <Text style={[styles.mainActionTitle, { color: colors.status.error }]}>
              High-Risk ANC
            </Text>
            <Text style={styles.mainActionSub}>Preeclampsia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainActionBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
            onPress={() => navigation.navigate('VoiceIntake')}
            activeOpacity={0.8}
          >
            <AppIcon name="mic" size={22} color="#D97706" />
            <Text style={[styles.mainActionTitle, { color: '#D97706' }]}>
              Voice STT
            </Text>
            <Text style={styles.mainActionSub}>mr / hi / en</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainActionBtn, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}
            onPress={() => navigation.navigate('FieldTriage')}
            activeOpacity={0.8}
          >
            <AppIcon name="triage" size={22} color="#15803D" />
            <Text style={[styles.mainActionTitle, { color: '#15803D' }]}>
              Field Triage
            </Text>
            <Text style={styles.mainActionSub}>Referral Slip</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Village Household Roster Summary (F26-1) */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderTitleWrap}>
              <AppIcon name="home" size={18} color={colors.primary.DEFAULT} />
              <Text style={styles.cardHeaderTitle}>
                {language === 'mr' ? 'ग्राम कुटुंब सर्वेक्षण सारांश' : 'Village Household Survey Summary'}
              </Text>
            </View>
            <Badge label={`Beat: ${TAPOLA_VILLAGE_BEAT.villageName}`} variant="primary" size="sm" />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{TAPOLA_VILLAGE_BEAT.totalHouseholds}</Text>
              <Text style={styles.statLabel}>
                {language === 'mr' ? 'एकूण कुटुंबे' : 'Total Households'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.status.success }]}>
                {TAPOLA_VILLAGE_BEAT.surveyedHouseholds}
              </Text>
              <Text style={styles.statLabel}>
                {language === 'mr' ? 'सर्वेक्षण पूर्ण' : 'Surveyed'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.accent.DEFAULT }]}>
                {`${((TAPOLA_VILLAGE_BEAT.surveyedHouseholds / TAPOLA_VILLAGE_BEAT.totalHouseholds) * 100).toFixed(0)}%`}
              </Text>
              <Text style={styles.statLabel}>
                {language === 'mr' ? 'कव्हरेज दर' : 'Coverage Rate'}
              </Text>
            </View>
          </View>

          <View style={styles.surveyProgressBar}>
            <View
              style={[
                styles.surveyProgressFill,
                { width: `${(TAPOLA_VILLAGE_BEAT.surveyedHouseholds / TAPOLA_VILLAGE_BEAT.totalHouseholds) * 100}%` },
              ]}
            />
          </View>

          <Button
            title={language === 'mr' ? '+ नवीन लाभार्थी नोंदणी करा' : '+ Register New Beneficiary'}
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('BeneficiaryRegistration', { initialVillage: 'Tapola' })}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        {/* 2. High-Risk Pregnant Women Roster (F26-2 & Tier 4) */}
        <Card variant="elevated" style={[styles.sectionCard, { borderColor: '#FCA5A5' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderTitleWrap}>
              <AppIcon name="heartPulse" size={18} color={colors.status.error} />
              <Text style={[styles.cardHeaderTitle, { color: colors.status.error }]}>
                {language === 'mr' ? 'उच्च जोखीम गरोदर माता' : 'High-Risk Pregnant Women'}
              </Text>
            </View>
            <Badge label={`${highRiskMothers.length} High-Risk`} variant="danger" size="sm" />
          </View>

          <Text style={styles.alertSubtext}>
            {language === 'mr'
              ? 'साप्ताहिक गृहभेट व रक्तदाब तपासणी आवश्यक असलेल्या माता'
              : 'Beneficiaries requiring weekly mandatory visits & BP surveillance'}
          </Text>

          {pregnantRoster.map((mother) => (
            <TouchableOpacity
              key={mother.id}
              style={[styles.motherCard, mother.isHighRisk && styles.motherCardHighRisk]}
              onPress={() =>
                navigation.navigate('HighRiskPregnancy', {
                  beneficiaryId: mother.id,
                  patientName: mother.name,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.motherTopRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.motherName}>{mother.name}</Text>
                    {mother.isHighRisk && <Badge label="HIGH RISK" variant="danger" size="sm" />}
                  </View>
                  <Text style={styles.motherDetails}>
                    {`${mother.age} yrs · Trimester ${mother.trimester} (${mother.gestationalAgeWeeks} weeks) · ${mother.gravida}`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDial(mother.phone)}
                  style={styles.callCircleBtn}
                >
                  <AppIcon name="call" size={16} color={colors.primary.DEFAULT} />
                </TouchableOpacity>
              </View>

              {mother.dangerReason && (
                <View style={styles.dangerReasonBox}>
                  <AppIcon name="alertTriangle" size={14} color={colors.status.error} />
                  <Text style={styles.dangerReasonText}>{mother.dangerReason}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* 3. Pending Pediatric Immunization Due List (F26-3) */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderTitleWrap}>
              <AppIcon name="testTube" size={18} color="#0D9488" />
              <Text style={styles.cardHeaderTitle}>
                {language === 'mr' ? 'बाल लसीकरण वेळापत्रक' : 'Pediatric Immunization Due List'}
              </Text>
            </View>
            <Badge label={`${overdueImmunizations.length} Overdue`} variant="danger" size="sm" />
          </View>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            {(['ALL', 'OVERDUE', 'UPCOMING'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, immunizationFilter === filter && styles.filterChipActive]}
                onPress={() => setImmunizationFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    immunizationFilter === filter && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredImmunizations.map((item) => (
            <View key={item.id} style={styles.immunizationRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.childName}>{item.childName}</Text>
                  <Badge
                    label={item.status}
                    variant={item.status === 'OVERDUE' ? 'danger' : 'primary'}
                    size="sm"
                  />
                </View>
                <Text style={styles.vaccineName}>
                  {item.vaccine} · Due: {item.dueDate}
                </Text>
                <Text style={styles.motherSubName}>Mother: {item.motherName} ({item.age})</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setImmunizations((prev) =>
                    prev.map((i) => (i.id === item.id ? { ...i, status: 'COMPLETED' } : i))
                  );
                }}
                style={styles.doneVaccineBtn}
              >
                <AppIcon name="check" size={16} color={colors.status.success} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        {/* 4. Daily Field Task Checklist (F26-4) */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderTitleWrap}>
              <AppIcon name="records" size={18} color={colors.accent.DEFAULT} />
              <Text style={styles.cardHeaderTitle}>
                {language === 'mr' ? 'दैनिक क्षेत्रीय कार्य सूची' : 'Daily Field Tasks'}
              </Text>
            </View>
            <Text style={styles.taskRateText}>
              {`${completedTasksCount}/${tasks.length} (${(taskCompletionRate * 100).toFixed(0)}%)`}
            </Text>
          </View>

          <View style={styles.taskProgressBar}>
            <View style={[styles.taskProgressFill, { width: `${taskCompletionRate * 100}%` }]} />
          </View>

          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskItemRow}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkboxBox, task.completed && styles.checkboxBoxChecked]}>
                {task.completed && <AppIcon name="check" size={14} color={colors.white} />}
              </View>
              <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                {language === 'mr' ? task.taskMr : task.task}
              </Text>
              {task.priority === 'HIGH' && <Badge label="Urgent" variant="danger" size="sm" />}
            </TouchableOpacity>
          ))}
        </Card>

        {/* 5. Direct Emergency Speed Dialers */}
        <Card variant="elevated" style={[styles.sectionCard, { backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.cardHeaderTitle, { color: colors.status.error, marginBottom: spacing.sm }]}>
            {language === 'mr' ? 'तातडीचे आपत्कालीन क्रमांक' : 'EMERGENCY DIRECT SPEED DIAL'}
          </Text>
          <View style={styles.dialerRow}>
            {EMERGENCY_SPEED_DIALERS.map((dialer) => (
              <TouchableOpacity
                key={dialer.number}
                onPress={() => handleDial(dialer.number)}
                style={styles.dialerBtn}
              >
                <AppIcon name="phoneEmergency" size={18} color={colors.white} />
                <Text style={styles.dialerNumber}>{dialer.number}</Text>
                <Text style={styles.dialerLabel}>{dialer.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* 6. Quick Action Navigation Hubs */}
        <Text style={styles.sectionLabel}>
          {language === 'mr' ? 'आरोग्य कार्यप्रणाली केंद्रे' : 'OPERATIONAL HUBS'}
        </Text>
        <View style={styles.hubGrid}>
          <TouchableOpacity
            style={styles.hubTile}
            onPress={() => navigation.navigate('ReferralsHub')}
          >
            <AppIcon name="referral" size={24} color="#7B1FA2" />
            <Text style={styles.hubTileTitle}>Referral Pipeline</Text>
            <Text style={styles.hubTileDesc}>7-stage tracking & SLA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hubTile}
            onPress={() => navigation.navigate('MedicineHub')}
          >
            <AppIcon name="medicine" size={24} color="#15803D" />
            <Text style={styles.hubTileTitle}>Sub-Center Drugs</Text>
            <Text style={styles.hubTileDesc}>IFA, ORS, EDL Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hubTile}
            onPress={() => navigation.navigate('DiagnosticsHub')}
          >
            <AppIcon name="diagnostic" size={24} color={colors.primary.DEFAULT} />
            <Text style={styles.hubTileTitle}>Diagnostics</Text>
            <Text style={styles.hubTileDesc}>Samples & Barcodes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hubTile}
            onPress={() => navigation.navigate('QueueHub')}
          >
            <AppIcon name="queue" size={24} color={colors.accent.DEFAULT} />
            <Text style={styles.hubTileTitle}>OPD Tokens</Text>
            <Text style={styles.hubTileDesc}>ANC Priority Queue</Text>
          </TouchableOpacity>
        </View>
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
  syncStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  syncStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  networkStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate.dark,
  },
  pendingBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warning,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  profileCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  ashaNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  facilityText: {
    fontSize: 12,
    color: colors.slate.gray,
    fontWeight: '600',
    marginTop: 2,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 6,
  },
  mainActionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  mainActionBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...shadows.sm,
  },
  mainActionTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
  },
  mainActionSub: {
    fontSize: 9,
    color: colors.slate.muted,
    marginTop: 1,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary.DEFAULT,
  },
  statLabel: {
    fontSize: 10,
    color: colors.slate.gray,
    marginTop: 2,
  },
  surveyProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  surveyProgressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
  },
  alertSubtext: {
    fontSize: 11,
    color: colors.slate.muted,
    marginBottom: spacing.sm,
  },
  motherCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  motherCardHighRisk: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  motherTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  motherName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  motherDetails: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 2,
  },
  callCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  dangerReasonText: {
    fontSize: 11,
    color: colors.status.error,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: spacing.xs,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    backgroundColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate.gray,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  immunizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  childName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  vaccineName: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 1,
  },
  motherSubName: {
    fontSize: 10,
    color: colors.slate.muted,
  },
  doneVaccineBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskRateText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent.DEFAULT,
  },
  taskProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  taskProgressFill: {
    height: '100%',
    backgroundColor: colors.accent.DEFAULT,
  },
  taskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.slate.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: colors.accent.DEFAULT,
    borderColor: colors.accent.DEFAULT,
  },
  taskText: {
    flex: 1,
    fontSize: 12,
    color: colors.slate.dark,
    fontWeight: '600',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.slate.muted,
  },
  dialerRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dialerBtn: {
    flex: 1,
    backgroundColor: colors.status.error,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialerNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.white,
    marginTop: 2,
  },
  dialerLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FEE2E2',
    textAlign: 'center',
    marginTop: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate.muted,
    marginBottom: spacing.xs,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hubTile: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  hubTileTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slate.dark,
    marginTop: spacing.xs,
  },
  hubTileDesc: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 2,
  },
});
