/**
 * HealthWay Referrals Hub
 * Government of Maharashtra - Integrated Rural Health Platform
 * Complies with Features 13-14, Tier 1, and Tier 4 requirements.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { useLanguage } from '../../context/LanguageContext';
import {
  REFERRAL_STAGES_LIST,
  INITIAL_REFERRALS_DATA,
  computeReferralSla,
} from '../../data/referralsData';
import { Referral, ReferralStage, ReferralUrgency } from '../../types/referral';

export const ReferralsHubScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { language } = useLanguage();

  const [referrals, setReferrals] = useState<Referral[]>(INITIAL_REFERRALS_DATA);
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFeedback, setSelectedFeedback] = useState<Referral | null>(null);

  // Summary counts
  const totalActive = referrals.filter(r => r.stage !== 'COMPLETED').length;
  const overdueCount = referrals.filter(r => r.isOverdue || r.stage === 'OVERDUE').length;
  const inTransitCount = referrals.filter(r => r.stage === 'IN_TRANSIT').length;

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter(ref => {
      const matchStage = stageFilter === 'ALL' || ref.stage === stageFilter;
      const matchUrgency = urgencyFilter === 'ALL' || ref.urgency === urgencyFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ref.id.toLowerCase().includes(q) ||
        ref.patientName.toLowerCase().includes(q) ||
        ref.toFacilityName.toLowerCase().includes(q) ||
        ref.department.toLowerCase().includes(q);
      return matchStage && matchUrgency && matchSearch;
    });
  }, [referrals, stageFilter, urgencyFilter, searchQuery]);

  // Advance stage sequentially
  const handleAdvanceStage = (refId: string) => {
    setReferrals(prev =>
      prev.map(r => {
        if (r.id === refId) {
          const currentIndex = REFERRAL_STAGES_LIST.indexOf(r.stage);
          if (currentIndex < REFERRAL_STAGES_LIST.length - 1) {
            const nextStage = REFERRAL_STAGES_LIST[currentIndex + 1];
            return {
              ...r,
              stage: nextStage,
              updatedAt: new Date().toISOString(),
              stageHistory: [
                ...r.stageHistory,
                {
                  stage: nextStage,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  note: `Advanced to ${nextStage}`,
                },
              ],
            };
          }
        }
        return r;
      })
    );
  };

  // Direct Phone Call helper
  const handleCall = (phone?: string) => {
    if (!phone) return;
    const clean = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      Alert.alert('Call', `Unable to place call to ${phone}`);
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'संदर्भ सेवा ट्रॅकर' : 'Referral Pipeline'}
        subtitle={language === 'mr' ? '७-टप्प्यांची संदर्भ सेवा व SLA' : '7-Stage Referral Tracking & SLAs'}
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={true}
        onSosPress={() => navigation.navigate('EmergencySOS')}
      />

      {/* Metric Strip */}
      <View style={styles.metricStrip}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>{language === 'mr' ? 'सक्रिय' : 'Active'}</Text>
          <Text style={styles.metricVal}>{totalActive}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>{language === 'mr' ? 'मार्गावर' : 'In Transit'}</Text>
          <Text style={[styles.metricVal, { color: colors.accent.DEFAULT }]}>{inTransitCount}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>{language === 'mr' ? 'मुदत संपली' : 'Overdue'}</Text>
          <Text style={[styles.metricVal, { color: overdueCount > 0 ? colors.status.error : colors.status.success }]}>
            {overdueCount}
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <AppIcon name="search" size={16} color={colors.slate.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={language === 'mr' ? 'रुग्ण, आयडी किंवा रुग्णालय शोधा...' : 'Search patient, ID, or hospital...'}
            placeholderTextColor={colors.slate.muted}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <AppIcon name="close" size={16} color={colors.slate.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stage Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsScroll}
      >
        {(['ALL', 'CREATED', 'ACCEPTED', 'IN_TRANSIT', 'ADMITTED', 'COMPLETED', 'OVERDUE'] as const).map(stg => (
          <TouchableOpacity
            key={stg}
            style={[styles.filterPill, stageFilter === stg && styles.filterPillActive]}
            onPress={() => setStageFilter(stg)}
          >
            <Text style={[styles.filterPillText, stageFilter === stg && styles.filterPillTextActive]}>
              {stg.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Referrals List */}
      <FlatList
        data={filteredReferrals}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const sla = computeReferralSla(item.createdAt, item.urgency);
          const isCompleted = item.stage === 'COMPLETED';
          const stageIndex = REFERRAL_STAGES_LIST.indexOf(item.stage);

          return (
            <Card
              variant={sla.isOverdue || item.stage === 'OVERDUE' ? 'danger' : 'elevated'}
              style={styles.referralCard}
            >
              {/* Card Header: ID & Badges */}
              <View style={styles.cardHeader}>
                <View style={styles.idPill}>
                  <Text style={styles.idText}>{item.id}</Text>
                </View>
                <Badge
                  label={item.urgency}
                  variant={item.urgency === 'IMMEDIATE' ? 'danger' : item.urgency === 'URGENT' ? 'warning' : 'primary'}
                  size="sm"
                />
                <Badge
                  label={item.stage.replace('_', ' ')}
                  variant={isCompleted ? 'success' : 'teal'}
                  size="sm"
                />
              </View>

              {/* Patient Info */}
              <Text style={styles.patientName}>
                {item.patientName} ({item.patientAge}y · {item.patientGender})
              </Text>
              <Text style={styles.patientVillage}>
                {item.patientVillage} · ABHA: {item.abhaId || 'N/A'}
              </Text>

              {/* Inter-Facility Route */}
              <View style={styles.routeContainer}>
                <View style={styles.routeCol}>
                  <Text style={styles.routeLabel}>FROM</Text>
                  <Text style={styles.routeName}>{item.fromFacilityName}</Text>
                  <Text style={styles.routeDoctor}>{item.fromDoctorName}</Text>
                </View>

                <View style={styles.routeArrowCol}>
                  <AppIcon name="arrowRight" size={18} color={colors.primary.DEFAULT} />
                  <Badge
                    label={item.transportType?.replace('_', ' ') || 'Ambulance'}
                    variant="neutral"
                    size="sm"
                  />
                </View>

                <View style={styles.routeCol}>
                  <Text style={styles.routeLabel}>TO (SPECIALIST)</Text>
                  <Text style={styles.routeName}>{item.toFacilityName}</Text>
                  <Text style={styles.routeDept}>{item.department}</Text>
                </View>
              </View>

              {/* SLA Countdown Badge */}
              <View style={styles.slaRow}>
                {isCompleted ? (
                  <Badge label="Completed within SLA" variant="success" icon="check" size="sm" />
                ) : sla.isOverdue || item.stage === 'OVERDUE' ? (
                  <View style={styles.overdueBox}>
                    <AppIcon name="alertTriangle" size={14} color={colors.status.error} />
                    <Text style={styles.overdueText}>
                      OVERDUE: SLA Breached ({sla.formattedRemaining})
                    </Text>
                  </View>
                ) : (
                  <View style={styles.slaBadge}>
                    <AppIcon name="clock" size={14} color={colors.status.warning} />
                    <Text style={styles.slaText}>SLA: {sla.formattedRemaining}</Text>
                  </View>
                )}
              </View>

              {/* Reason / Diagnosis */}
              <Text style={styles.reasonText}>
                <Text style={{ fontWeight: '700' }}>Reason: </Text>
                {item.primaryReason}
              </Text>

              {/* 7-Stage Visual Timeline */}
              <View style={styles.timeline}>
                {REFERRAL_STAGES_LIST.map((stg, idx) => {
                  const isDone = idx <= stageIndex;
                  const isCur = idx === stageIndex;
                  return (
                    <View key={stg} style={styles.timelineStep}>
                      <View
                        style={[
                          styles.timelineDot,
                          isDone && styles.timelineDotDone,
                          isCur && styles.timelineDotCurrent,
                        ]}
                      >
                        {isDone && <AppIcon name="check" size={8} color={colors.white} />}
                      </View>
                      <Text style={[styles.timelineLabel, isCur && styles.timelineLabelCurrent]}>
                        {stg.slice(0, 3)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Transport & Telemetry */}
              {item.transportStatus && (
                <View style={styles.transportBox}>
                  <View style={styles.transportInfo}>
                    <AppIcon name="ambulance" size={18} color={colors.primary.DEFAULT} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.transportVehicle}>{item.transportStatus.vehicleNumber}</Text>
                      <Text style={styles.transportDriver}>
                        Driver: {item.transportStatus.driverName} ({item.transportStatus.liveStatus})
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.callPill}
                    onPress={() => handleCall(item.transportStatus?.driverPhone)}
                  >
                    <AppIcon name="call" size={14} color={colors.white} />
                    <Text style={styles.callPillText}>Call Driver</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Card Actions */}
              <View style={styles.actionRow}>
                {!isCompleted && item.stage !== 'OVERDUE' && (
                  <Button
                    title="Advance Stage"
                    variant="secondary"
                    size="sm"
                    icon="arrowRight"
                    onPress={() => handleAdvanceStage(item.id)}
                  />
                )}
                {item.feedback && (
                  <Button
                    title="View Specialist Feedback"
                    variant="primary"
                    size="sm"
                    icon="records"
                    onPress={() => setSelectedFeedback(item)}
                  />
                )}
              </View>
            </Card>
          );
        }}
      />

      {/* Counter-Referral Feedback Modal */}
      <Modal
        visible={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        title="Counter-Referral Specialist Feedback"
      >
        {selectedFeedback?.feedback && (
          <ScrollView contentContainerStyle={styles.feedbackModalScroll}>
            <View style={styles.feedbackDocHeader}>
              <View style={styles.doctorAvatar}>
                <AppIcon name="doctor" size={24} color="#15803D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{selectedFeedback.feedback.doctorName}</Text>
                <Text style={styles.docHospital}>{selectedFeedback.feedback.hospitalName}</Text>
                <Text style={styles.docDate}>Discharge Date: {selectedFeedback.feedback.date}</Text>
              </View>
            </View>

            <View style={styles.feedbackSection}>
              <Text style={styles.fbSectionTitle}>CLINICAL SUMMARY & DIAGNOSIS</Text>
              <Text style={styles.fbSectionText}>{selectedFeedback.feedback.counterReferralNotes}</Text>
            </View>

            <View style={styles.feedbackSection}>
              <Text style={styles.fbSectionTitle}>TREATMENT GIVEN AT HOSPITAL</Text>
              <Text style={styles.fbSectionText}>{selectedFeedback.feedback.treatmentGiven}</Text>
            </View>

            <View style={[styles.feedbackSection, styles.adviceBox]}>
              <Text style={[styles.fbSectionTitle, { color: '#0F766E' }]}>
                POST-DISCHARGE FOLLOW-UP PLAN FOR ASHA / PHC
              </Text>
              <Text style={styles.fbSectionText}>{selectedFeedback.feedback.dischargeAdvice}</Text>
            </View>

            <View style={styles.routingConfirmation}>
              <AppIcon name="checkCircle" size={16} color={colors.status.success} />
              <Text style={styles.routingText}>
                Feedback closed-loop delivered to ASHA {selectedFeedback.ashaName || 'Village Escort'}
              </Text>
            </View>
          </ScrollView>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  metricStrip: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.borderLight,
    justifyContent: 'space-between',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate.muted,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.slate.dark,
    marginTop: 2,
  },
  searchRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: 42,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.slate.dark,
  },
  filterPillsScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterPill: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.slate.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterPillText: {
    fontSize: 12,
    color: colors.slate.gray,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  referralCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  idPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: colors.slate.dark,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.slate.dark,
    marginTop: 2,
  },
  patientVillage: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 1,
  },
  routeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs + 2,
    alignItems: 'center',
  },
  routeCol: {
    flex: 1,
  },
  routeArrowCol: {
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 4,
  },
  routeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.slate.muted,
  },
  routeName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
    marginTop: 1,
  },
  routeDoctor: {
    fontSize: 10,
    color: colors.slate.gray,
  },
  routeDept: {
    fontSize: 10,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  slaRow: {
    marginVertical: 4,
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  slaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  overdueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  overdueText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.status.error,
  },
  reasonText: {
    fontSize: 12,
    color: colors.slate.dark,
    marginVertical: 4,
    lineHeight: 17,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  timelineDotDone: {
    backgroundColor: colors.status.success,
  },
  timelineDotCurrent: {
    backgroundColor: colors.primary.DEFAULT,
    borderWidth: 2,
    borderColor: '#93C5FD',
  },
  timelineLabel: {
    fontSize: 8,
    color: colors.slate.muted,
    fontWeight: '600',
  },
  timelineLabelCurrent: {
    color: colors.primary.DEFAULT,
    fontWeight: '800',
  },
  transportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  transportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  transportVehicle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
  },
  transportDriver: {
    fontSize: 10,
    color: colors.slate.gray,
  },
  callPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  callPillText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  feedbackModalScroll: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  feedbackDocHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  docHospital: {
    fontSize: 11,
    color: colors.slate.gray,
  },
  docDate: {
    fontSize: 10,
    color: colors.slate.muted,
  },
  feedbackSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.slate.border,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  adviceBox: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  fbSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.slate.muted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fbSectionText: {
    fontSize: 12,
    color: colors.slate.dark,
    lineHeight: 18,
  },
  routingConfirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  routingText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
    flex: 1,
  },
});
