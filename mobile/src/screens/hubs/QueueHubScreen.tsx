/**
 * HealthWay OPD Priority Queue Management Hub
 * Government of Maharashtra - Integrated Rural Health Platform
 * Complies with PROJECT.md Feature 15 & Tier 1/4 tests
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';
import { AppIcon } from '../../theme/icons';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { FormInput } from '../../components/FormInput';
import { useLanguage } from '../../context/LanguageContext';
import { QueueToken, QueuePriority } from '../../types/queue';
import { INITIAL_QUEUE_TOKENS, DEPARTMENTS, QUEUE_PRIORITIES } from '../../data/mockQueue';

export const QueueHubScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { language } = useLanguage();

  const [tokens, setTokens] = useState<QueueToken[]>(INITIAL_QUEUE_TOKENS);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State for Issuing Token
  const [patientName, setPatientName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [priority, setPriority] = useState<QueuePriority>('general');

  const avgConsultDuration = 8; // minutes

  // Dynamic sorting and wait time calculation
  const processedTokens = useMemo(() => {
    // 1. Filter by Department, Search, Status
    let filtered = tokens.filter(tok => {
      const matchDept = selectedDept === 'ALL' || tok.department === selectedDept;
      const matchSearch =
        tok.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(tok.tokenNumber).toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusTab === 'ALL'
          ? true
          : statusTab === 'ACTIVE'
          ? tok.status === 'WAITING' || tok.status === 'IN_CONSULTATION'
          : tok.status === 'COMPLETED' || tok.status === 'SKIPPED';
      return matchDept && matchSearch && matchStatus;
    });

    // 2. Sort active queue: IN_CONSULTATION first, then WAITING by priorityWeight DESC, then FIFO
    const inConsult = filtered.filter(t => t.status === 'IN_CONSULTATION');
    const waiting = filtered
      .filter(t => t.status === 'WAITING')
      .sort((a, b) => {
        if (b.priorityWeight !== a.priorityWeight) {
          return b.priorityWeight - a.priorityWeight;
        }
        return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
      });
    const finished = filtered.filter(t => t.status === 'COMPLETED' || t.status === 'SKIPPED');

    // 3. Dynamic wait time calculation
    const rankedWaiting = waiting.map((tok, index) => {
      const pos = index + 1;
      const waitTime = tok.priority === 'emergency' ? 0 : pos * avgConsultDuration;
      return {
        ...tok,
        position: pos,
        estWaitMinutes: waitTime,
      };
    });

    return [...inConsult, ...rankedWaiting, ...finished];
  }, [tokens, selectedDept, statusTab, searchQuery]);

  // Summary Metrics
  const activeCount = tokens.filter(t => t.status === 'WAITING').length;
  const inConsultToken = tokens.find(t => t.status === 'IN_CONSULTATION');
  const emergencyCount = tokens.filter(t => t.priority === 'emergency' && t.status === 'WAITING').length;
  const avgWait = activeCount > 0 ? Math.round((activeCount * avgConsultDuration) / 2) : 0;

  // Actions
  const handleCallToken = (token: QueueToken) => {
    setTokens(prev =>
      prev.map(t => {
        if (t.id === token.id) {
          return { ...t, status: 'IN_CONSULTATION', calledTime: new Date().toISOString() };
        }
        if (t.status === 'IN_CONSULTATION') {
          return { ...t, status: 'COMPLETED', completionTime: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  const handleCompleteToken = (tokenId?: string) => {
    setTokens(prev =>
      prev.map(t =>
        t.id === tokenId ? { ...t, status: 'COMPLETED', completionTime: new Date().toISOString() } : t
      )
    );
  };

  const handleSkipToken = (tokenId?: string) => {
    setTokens(prev =>
      prev.map(t =>
        t.id === tokenId ? { ...t, status: 'SKIPPED' } : t
      )
    );
  };

  const handleIssueToken = () => {
    if (!patientName.trim()) {
      Alert.alert('Required', 'Please enter patient name');
      return;
    }
    const config = QUEUE_PRIORITIES[priority] || QUEUE_PRIORITIES.general;
    const prefix =
      priority === 'emergency'
        ? 'EMG'
        : priority === 'antenatal'
        ? 'ANC'
        : priority === 'senior'
        ? 'SNR'
        : 'GEN';
    const num = Math.floor(10 + Math.random() * 90);
    const newToken: QueueToken = {
      id: `TOK-${Date.now()}`,
      tokenNumber: `${prefix}-${num}`,
      patientId: `PT-${Date.now().toString().slice(-4)}`,
      patientName: patientName.trim(),
      department: department,
      healthCenterId: 'FAC001',
      priority: priority,
      priorityWeight: config.weight,
      status: 'WAITING',
      checkInTime: new Date().toISOString(),
      estWaitMinutes: 0,
      position: 0,
    };

    setTokens(prev => [newToken, ...prev]);
    setPatientName('');
    setIsModalOpen(false);
  };

  const getPriorityBadgeVariant = (p: QueuePriority) => {
    switch (p) {
      case 'emergency':
        return 'danger';
      case 'antenatal':
        return 'accent';
      case 'senior':
        return 'warning';
      case 'general':
      default:
        return 'primary';
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'ओपीडी रांग व्यवस्थापन' : 'OPD Queue Hub'}
        subtitle={
          language === 'mr'
            ? 'जिल्हा रुग्णालय सातारा · थेट स्थिती'
            : 'District Hospital Satara · Live Status'
        }
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={true}
        onSosPress={() => navigation.navigate('EmergencySOS')}
      />

      {/* Live Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{language === 'mr' ? 'सध्या सुरू' : 'Now Serving'}</Text>
          <Text style={styles.statValueHighlight}>
            {inConsultToken ? inConsultToken.tokenNumber : '--'}
          </Text>
          <Text style={styles.statSub} numberOfLines={1}>
            {inConsultToken ? inConsultToken.patientName : language === 'mr' ? 'कोणी नाही' : 'None'}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{language === 'mr' ? 'प्रतिक्षेत' : 'Waiting'}</Text>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statSub}>
            {emergencyCount > 0
              ? `${emergencyCount} ${language === 'mr' ? 'तातडीचे' : 'Emergency'}`
              : language === 'mr'
              ? 'सामान्य'
              : 'Normal'}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{language === 'mr' ? 'सरासरी वेळ' : 'Avg Wait'}</Text>
          <Text style={styles.statValue}>{avgWait}m</Text>
          <Text style={styles.statSub}>
            {avgConsultDuration}m / {language === 'mr' ? 'रुग्ण' : 'patient'}
          </Text>
        </View>
      </View>

      {/* TV Display Mode Action Banner */}
      <View style={styles.bannerRow}>
        <TouchableOpacity
          style={styles.tvBanner}
          onPress={() => navigation.navigate('QueueTV')}
          activeOpacity={0.85}
        >
          <View style={styles.tvBannerLeft}>
            <View style={styles.tvIconWrap}>
              <AppIcon name="queue" size={22} color={colors.white} />
            </View>
            <View>
              <Text style={styles.tvBannerTitle}>
                {language === 'mr' ? 'प्रतीक्षा कक्ष टीव्ही डिस्प्ले' : 'Waiting Room TV Mode'}
              </Text>
              <Text style={styles.tvBannerSub}>
                {language === 'mr'
                  ? 'मोठ्या स्क्रीनवर टोकन व ऑडिओ कॉलआउट'
                  : 'High-contrast display & trilingual voice chime'}
              </Text>
            </View>
          </View>
          <AppIcon name="chevronRight" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filters & Actions Bar */}
      <View style={styles.controlsBar}>
        <View style={styles.searchWrap}>
          <AppIcon name="search" size={16} color={colors.slate.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              language === 'mr'
                ? 'रुग्णाचे नाव किंवा टोकन शोधा...'
                : 'Search patient name or token...'
            }
            placeholderTextColor={colors.slate.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Button
          title={language === 'mr' ? '+ टोकन' : '+ Issue'}
          size="sm"
          variant="primary"
          onPress={() => setIsModalOpen(true)}
        />
      </View>

      {/* Department Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.deptScroll}
      >
        <TouchableOpacity
          style={[styles.deptChip, selectedDept === 'ALL' && styles.deptChipActive]}
          onPress={() => setSelectedDept('ALL')}
        >
          <Text
            style={[styles.deptChipText, selectedDept === 'ALL' && styles.deptChipTextActive]}
          >
            {language === 'mr' ? 'सर्व विभाग' : 'All Depts'}
          </Text>
        </TouchableOpacity>
        {DEPARTMENTS.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.deptChip, selectedDept === d && styles.deptChipActive]}
            onPress={() => setSelectedDept(d)}
          >
            <Text
              style={[styles.deptChipText, selectedDept === d && styles.deptChipTextActive]}
            >
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Tabs */}
      <View style={styles.statusTabs}>
        {(['ACTIVE', 'COMPLETED', 'ALL'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.statusTab, statusTab === tab && styles.statusTabActive]}
            onPress={() => setStatusTab(tab)}
          >
            <Text
              style={[styles.statusTabText, statusTab === tab && styles.statusTabTextActive]}
            >
              {tab === 'ACTIVE'
                ? language === 'mr'
                  ? 'सक्रिय रांग'
                  : 'Active Queue'
                : tab === 'COMPLETED'
                ? language === 'mr'
                  ? 'पूर्ण झालेले'
                  : 'Completed'
                : language === 'mr'
                ? 'सर्व'
                : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Queue Token FlatList */}
      <FlatList
        data={processedTokens}
        keyExtractor={(item, index) => item.id || String(index)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isWaiting = item.status === 'WAITING';
          const isInConsult = item.status === 'IN_CONSULTATION';
          const isEmergency = item.priority === 'emergency';
          const priorityCfg = QUEUE_PRIORITIES[item.priority] || QUEUE_PRIORITIES.general;

          return (
            <Card
              style={[
                styles.tokenCard,
                isInConsult && styles.tokenCardInConsult,
                isEmergency && styles.tokenCardEmergency,
              ]}
            >
              {/* Token Header Strip */}
              <View style={styles.tokenHeader}>
                <View style={styles.tokenNumberWrap}>
                  <Text
                    style={[
                      styles.tokenNumberText,
                      isInConsult && { color: colors.primary.saffron },
                      isEmergency && { color: colors.status.red },
                    ]}
                  >
                    {item.tokenNumber}
                  </Text>
                  {isWaiting && (
                    <Text style={styles.posBadge}>
                      #{item.position} in queue
                    </Text>
                  )}
                </View>

                <View style={styles.headerBadges}>
                  <Badge
                    label={
                      language === 'mr'
                        ? priorityCfg.labelMr
                        : priorityCfg.labelEn.split(' ')[0]
                    }
                    variant={getPriorityBadgeVariant(item.priority)}
                    size="sm"
                  />
                  <Badge
                    label={item.status}
                    variant={
                      isInConsult
                        ? 'accent'
                        : item.status === 'COMPLETED'
                        ? 'success'
                        : item.status === 'SKIPPED'
                        ? 'secondary'
                        : 'outline'
                    }
                    size="sm"
                  />
                </View>
              </View>

              {/* Patient Info */}
              <View style={styles.tokenBody}>
                <Text style={styles.patientName}>{item.patientName}</Text>
                <Text style={styles.deptText}>
                  {item.department} {item.doctorName ? `· ${item.doctorName}` : ''}
                </Text>

                <View style={styles.tokenMetaRow}>
                  <View style={styles.metaItem}>
                    <AppIcon name="clock" size={14} color={colors.slate.gray} />
                    <Text style={styles.metaText}>
                      {isWaiting
                        ? `${language === 'mr' ? 'अंदाजे वेळ' : 'Est. Wait'}: ${
                            item.estWaitMinutes
                          } mins`
                        : isInConsult
                        ? language === 'mr'
                          ? 'सध्या सुरू आहे'
                          : 'Consulting now'
                        : language === 'mr'
                        ? 'पूर्ण'
                        : 'Finished'}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <AppIcon name="calendar" size={14} color={colors.slate.gray} />
                    <Text style={styles.metaText}>
                      {new Date(item.checkInTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.tokenActions}>
                {isWaiting && (
                  <Button
                    title={language === 'mr' ? 'बोलवा' : 'Call Next'}
                    size="sm"
                    variant="primary"
                    onPress={() => handleCallToken(item)}
                  />
                )}
                {isInConsult && (
                  <Button
                    title={language === 'mr' ? 'पूर्ण करा' : 'Mark Completed'}
                    size="sm"
                    variant="accent"
                    onPress={() => handleCompleteToken(item.id)}
                  />
                )}
                {isWaiting && (
                  <Button
                    title={language === 'mr' ? 'वगळा' : 'Skip'}
                    size="sm"
                    variant="secondary"
                    onPress={() => handleSkipToken(item.id)}
                  />
                )}
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppIcon name="queue" size={48} color={colors.slate.muted} />
            <Text style={styles.emptyText}>
              {language === 'mr' ? 'रांगेत कोणतेही टोकन नाही' : 'No tokens found in this view'}
            </Text>
          </View>
        }
      />

      {/* Modal: Issue New Token */}
      <Modal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={language === 'mr' ? 'नवीन ओपीडी टोकन तयार करा' : 'Issue New OPD Token'}
      >
        <FormInput
          label={language === 'mr' ? 'रुग्णाचे नाव' : 'Patient Full Name'}
          placeholder="e.g. Ramesh Shankar Patil"
          value={patientName}
          onChangeText={setPatientName}
          required
        />

        <Text style={styles.modalFieldLabel}>
          {language === 'mr' ? 'विभाग निवडा' : 'Select Department'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalChips}>
          {DEPARTMENTS.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.modalChip, department === d && styles.modalChipActive]}
              onPress={() => setDepartment(d)}
            >
              <Text
                style={[styles.modalChipText, department === d && styles.modalChipTextActive]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.modalFieldLabel}>
          {language === 'mr' ? 'प्राधान्य श्रेणी' : 'Priority Category'}
        </Text>
        <View style={styles.priorityGrid}>
          {(['emergency', 'antenatal', 'senior', 'general'] as QueuePriority[]).map(p => {
            const cfg = QUEUE_PRIORITIES[p];
            const isSelected = priority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityOption,
                  isSelected && styles.priorityOptionActive,
                  p === 'emergency' &&
                    isSelected && {
                      borderColor: colors.status.red,
                      backgroundColor: '#FEF2F2',
                    },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityOptionTitle,
                    isSelected && { color: colors.slate.dark, fontWeight: '700' },
                  ]}
                >
                  {language === 'mr' ? cfg.labelMr : cfg.labelEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={language === 'mr' ? 'टोकन जारी करा' : 'Issue Token'}
          variant="primary"
          fullWidth
          style={{ marginTop: spacing.md }}
          onPress={handleIssueToken}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate.bg,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.light,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.slate.gray,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.slate.dark,
    marginVertical: 2,
  },
  statValueHighlight: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary.saffron,
    marginVertical: 2,
  },
  statSub: {
    fontSize: 10,
    color: colors.slate.muted,
  },
  bannerRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  tvBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.slate.dark,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    ...shadows.sm,
  },
  tvBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  tvIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tvBannerTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  tvBannerSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.slate.light,
    height: 40,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.slate.dark,
  },
  deptScroll: {
    paddingHorizontal: spacing.md,
    gap: 6,
    paddingBottom: 6,
  },
  deptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate.light,
  },
  deptChipActive: {
    backgroundColor: colors.primary.navy,
    borderColor: colors.primary.navy,
  },
  deptChipText: {
    fontSize: 12,
    color: colors.slate.gray,
    fontWeight: '600',
  },
  deptChipTextActive: {
    color: colors.white,
  },
  statusTabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 3,
  },
  statusTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusTabActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate.gray,
  },
  statusTabTextActive: {
    color: colors.primary.navy,
    fontWeight: '700',
  },
  listContainer: {
    padding: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 32,
    gap: spacing.sm,
  },
  tokenCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.slate.light,
    marginBottom: 8,
  },
  tokenCardInConsult: {
    borderColor: colors.primary.saffron,
    borderWidth: 1.5,
    backgroundColor: '#FFFBF5',
  },
  tokenCardEmergency: {
    borderColor: colors.status.red,
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.light,
    paddingBottom: 6,
    marginBottom: 6,
  },
  tokenNumberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary.navy,
  },
  posBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.muted,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tokenBody: {
    marginVertical: 4,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  deptText: {
    fontSize: 12,
    color: colors.slate.gray,
    marginTop: 2,
  },
  tokenMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.slate.gray,
  },
  tokenActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.slate.light,
    paddingTop: spacing.xs,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.slate.muted,
    fontSize: 14,
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
    marginTop: spacing.sm,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalChips: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  modalChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate.light,
    marginRight: spacing.xs,
    backgroundColor: colors.white,
  },
  modalChipActive: {
    backgroundColor: colors.primary.navy,
    borderColor: colors.primary.navy,
  },
  modalChipText: {
    fontSize: 12,
    color: colors.slate.gray,
  },
  modalChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  priorityOption: {
    width: '48%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate.light,
    backgroundColor: colors.white,
  },
  priorityOptionActive: {
    borderColor: colors.primary.navy,
    backgroundColor: '#EFF6FF',
  },
  priorityOptionTitle: {
    fontSize: 12,
    color: colors.slate.gray,
  },
});
