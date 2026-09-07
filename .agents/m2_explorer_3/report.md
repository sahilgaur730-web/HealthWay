# Architectural Blueprint: Queue Hub, Queue TV & Emergency SOS Screens
**Agent**: `m2_explorer_3` (M2 Queue & Emergency Explorer)  
**Milestone**: Milestone 2 — Navigation Hub, Auth & Shared Hubs  
**Date**: 2026-09-07  
**Working Directory**: `.agents/m2_explorer_3/`  
**Target Files for Implementation**:
- `mobile/src/screens/hubs/QueueHubScreen.tsx`
- `mobile/src/screens/hubs/QueueTVScreen.tsx`
- `mobile/src/screens/hubs/EmergencySOSScreen.tsx`
- `mobile/src/data/mockQueue.ts`
- `mobile/src/data/emergencyData.ts`

---

## 1. Executive Summary & Problem Scope

In accordance with `ORIGINAL_REQUEST.md`, `PROJECT.md` (Features 15, 16, 19, 20), and `m2_orch/SCOPE.md`, this blueprint delivers the comprehensive architectural specification for the Queue Management Hub and Emergency Care systems for the HealthWay native mobile application.

The deliverables cover:
1. **`QueueHubScreen.tsx`**: Live priority OPD token management with dynamic queue re-ordering based on clinical triage weights (Emergency: 100 > Antenatal: 75 > Senior: 50 > General: 25), dynamic wait time calculation based on position and consultation duration, department filters, token status transitions (`WAITING` -> `IN_CONSULTATION` -> `COMPLETED`), and manual token issuance.
2. **`QueueTVScreen.tsx`**: High-contrast dark slate (`#1C2B3A`) kiosk waiting room display for OPD waiting halls, massive typography for current token callout, "Now Serving" and "Next in Line" panels, flashing visual code-red alert for emergency tokens, and trilingual voice announcement chime using `expo-speech`.
3. **`EmergencySOSScreen.tsx`**: 1-Tap SOS dispatch with instant visual radar siren feedback, 10-second cancellation grace window, GPS coordinate beacon with resilient rural fallback (`18.6534° N, 74.1352° E`), 14-minute live ALS ambulance countdown with 5-stage status telemetry (`DISPATCHED` -> `EN_ROUTE` -> `ON_SCENE` -> `TRANSPORTING` -> `ARRIVED`), pre-arrival hospital casualty alert card, and 1-tap direct-dial emergency helplines (`108`, `102`, `104`, `1091`).

All designs use pure vector icons via `AppIcon` (`@expo/vector-icons`), standard design tokens (`colors.ts`, `spacing.ts`), trilingual i18n via `LanguageContext`, and safe area handling via `SafeAreaProvider`.

---

## 2. Priority Weight & Dynamic Wait Time Engine

### 2.1 Authoritative Priority Weight Hierarchy
The system enforces clinical priority weighting to ensure vulnerable and acute patients receive immediate attention:

| Category | Key | Priority Weight (Prompt) | Priority Weight (Fixture) | Color Token | Prefix | SLA / Target |
|---|---|---|---|---|---|---|
| **Emergency Casualty** | `emergency` | **100** | 100 | `colors.urgency.red` (`#D32F2F`) | `EMG` | Immediate / 0 min |
| **Antenatal Care (ANC)** | `antenatal` | **75** | 80 | `colors.role.asha` (`#7B1FA2`) | `ANC` | High Priority |
| **Senior Citizens (60+)** | `senior` | **50** | 60 | `colors.urgency.orange` (`#ED6C02`) | `SNR` | Expedited |
| **General OPD** | `general` | **25** | 40 | `colors.primary.DEFAULT` (`#1A4B8C`) | `GEN` | Standard FIFO |

To ensure 100% compatibility with both prompt weights (100, 75, 50, 25) and fixture constants (`QUEUE_PRIORITY_WEIGHTS`: 100, 80, 60, 40), the sorting comparator operates on relative order:
`Emergency > Antenatal > Senior > General`.

```typescript
export const PRIORITY_CONFIG = {
  emergency: {
    weight: 100,
    labelEn: 'Emergency',
    labelMr: 'तातडीची',
    labelHi: 'आपातकालीन',
    color: '#D32F2F',
    bgColor: '#FFEBEE',
    prefix: 'EMG',
    avgDurationMins: 15,
  },
  antenatal: {
    weight: 75,
    labelEn: 'Antenatal (ANC)',
    labelMr: 'प्रसूतीपूर्व तपासणी',
    labelHi: 'गर्भवती जांच',
    color: '#7B1FA2',
    bgColor: '#F3E5F5',
    prefix: 'ANC',
    avgDurationMins: 10,
  },
  senior: {
    weight: 50,
    labelEn: 'Senior Citizen',
    labelMr: 'ज्येष्ठ नागरिक',
    labelHi: 'वरिष्ठ नागरिक',
    color: '#ED6C02',
    bgColor: '#FFF4E5',
    prefix: 'SNR',
    avgDurationMins: 10,
  },
  general: {
    weight: 25,
    labelEn: 'General OPD',
    labelMr: 'सर्वसाधारण',
    labelHi: 'सामान्य ओपीडी',
    color: '#1A4B8C',
    bgColor: '#E8F0FE',
    prefix: 'GEN',
    avgDurationMins: 8,
  },
};
```

### 2.2 Dynamic Sorting & Wait Time Math
Queue tokens are partitioned and ordered:
1. **Primary Ordering**: Status bucket:
   - `IN_CONSULTATION`: Ranked 0 (currently inside doctor room).
   - `WAITING`: Ranked 1 (active waiting queue).
   - `COMPLETED` / `SKIPPED`: Ranked 2 (historical).
2. **Waiting Queue Ordering**:
   - `priorityWeight` descending: Higher weight comes first (Emergency > Antenatal > Senior > General).
   - `checkInTime` ascending (FIFO): If weights are identical, earlier check-in timestamp comes first.
3. **Dynamic Wait Time Calculation**:
   - For `IN_CONSULTATION`: `estWaitMinutes = 2` (nearly done).
   - For `WAITING`:
     - Calculate 1-based sequential position $P$ within the sorted waiting queue.
     - For Emergency: `estWaitMinutes = 0` (next in line immediately).
     - For others: $\text{estWaitMinutes} = P \times \text{avgConsultMinutes}$ (default 8 mins).
   - When a high-priority token (e.g., Emergency or Antenatal) checks in, it preempts lower-priority tokens, shifting their position down by 1 and dynamically increasing their wait time.

---

## 3. Screen Blueprint: `QueueHubScreen.tsx`

### 3.1 Component Architecture & State Structure
- **Target File**: `mobile/src/screens/hubs/QueueHubScreen.tsx`
- **Navigation Route**: `QueueHub`
- **Dependencies**:
  - `react`, `react-native`, `react-native-safe-area-context`
  - `@react-navigation/native` (`useNavigation`)
  - `src/theme/colors`, `src/theme/spacing`, `src/theme/icons`
  - `src/components/Header`, `src/components/Card`, `src/components/Badge`, `src/components/Button`, `src/components/Modal`, `src/components/FormInput`
  - `src/context/LanguageContext` (`useLanguage`)
  - `src/types/queue` (`QueueToken`, `QueuePriority`, `QueueStatus`)
  - `src/data/mockQueue` (initial seed data)

### 3.2 State Definition
```typescript
const [tokens, setTokens] = useState<QueueToken[]>(INITIAL_QUEUE_TOKENS);
const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');
const [searchQuery, setSearchQuery] = useState<string>('');
const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);

// New Token Form State
const [newPatientName, setNewPatientName] = useState<string>('');
const [newDepartment, setNewDepartment] = useState<string>('General Medicine');
const [newPriority, setNewPriority] = useState<QueuePriority>('general');
const [newAge, setNewAge] = useState<string>('');
```

### 3.3 Complete Code Structure for `QueueHubScreen.tsx`
```typescript
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { AppIcon } from '../../theme/icons';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { FormInput } from '../../components/FormInput';
import { useLanguage } from '../../context/LanguageContext';
import { QueueToken, QueuePriority, QueueStatus } from '../../types/queue';
import { INITIAL_QUEUE_TOKENS, DEPARTMENTS } from '../../data/mockQueue';

export const QUEUE_PRIORITIES: Record<QueuePriority, {
  weight: number;
  labelEn: string;
  labelMr: string;
  badgeVariant: 'danger' | 'purple' | 'warning' | 'primary' | 'neutral';
}> = {
  emergency: { weight: 100, labelEn: 'Emergency (100)', labelMr: 'तातडीची (१००)', badgeVariant: 'danger' },
  antenatal: { weight: 75, labelEn: 'Antenatal (75)', labelMr: 'प्रसूतीपूर्व (७५)', badgeVariant: 'purple' },
  senior: { weight: 50, labelEn: 'Senior 60+ (50)', labelMr: 'ज्येष्ठ नागरिक (५०)', badgeVariant: 'warning' },
  general: { weight: 25, labelEn: 'General (25)', labelMr: 'सर्वसाधारण (२५)', badgeVariant: 'primary' },
  urgent: { weight: 80, labelEn: 'Urgent (80)', labelMr: 'तातडीची (८०)', badgeVariant: 'danger' },
  normal: { weight: 30, labelEn: 'Normal (30)', labelMr: 'सामान्य (३०)', badgeVariant: 'neutral' },
};

export const QueueHubScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { language, t } = useLanguage();

  const [tokens, setTokens] = useState<QueueToken[]>(INITIAL_QUEUE_TOKENS);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [priority, setPriority] = useState<QueuePriority>('general');

  const avgConsultDuration = 8; // minutes

  // Dynamic sorting and wait time calculation
  const processedTokens = useMemo(() => {
    // 1. Filter by Department
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
        // If someone else was in consultation, mark them completed
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
    const config = QUEUE_PRIORITIES[priority];
    const prefix = priority === 'emergency' ? 'EMG' : priority === 'antenatal' ? 'ANC' : priority === 'senior' ? 'SNR' : 'GEN';
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

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'ओपीडी रांग व्यवस्थापन' : 'OPD Queue Hub'}
        subtitle={language === 'mr' ? 'जिल्हा रुग्णालय सातारा · थेट स्थिती' : 'District Hospital Satara · Live Status'}
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
            {inConsultToken ? inConsultToken.patientName : (language === 'mr' ? 'कोणी नाही' : 'None')}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{language === 'mr' ? 'प्रतिक्षेत' : 'Waiting'}</Text>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statSub}>
            {emergencyCount > 0 ? `${emergencyCount} ${language === 'mr' ? 'तातडीचे' : 'Emergency'}` : (language === 'mr' ? 'सामान्य' : 'Normal')}
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
                {language === 'mr' ? 'प्रतिक्षा कक्ष टीव्ही डिस्प्ले उघडा' : 'Launch Waiting Room TV Mode'}
              </Text>
              <Text style={styles.tvBannerSub}>
                {language === 'mr' ? 'हाय-कॉन्ट्रास्ट स्क्रीन व ध्वनी घोषणा' : 'High-contrast large display with audio chime'}
              </Text>
            </View>
          </View>
          <AppIcon name="chevronRight" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Department Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <TouchableOpacity
          style={[styles.filterChip, selectedDept === 'ALL' && styles.filterChipActive]}
          onPress={() => setSelectedDept('ALL')}
        >
          <Text style={[styles.filterChipText, selectedDept === 'ALL' && styles.filterChipTextActive]}>
            {language === 'mr' ? 'सर्व विभाग' : 'All Departments'}
          </Text>
        </TouchableOpacity>
        {DEPARTMENTS.map(dept => (
          <TouchableOpacity
            key={dept}
            style={[styles.filterChip, selectedDept === dept && styles.filterChipActive]}
            onPress={() => setSelectedDept(dept)}
          >
            <Text style={[styles.filterChipText, selectedDept === dept && styles.filterChipTextActive]}>
              {dept}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter Tabs & Search */}
      <View style={styles.controlsRow}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabItem, statusTab === 'ACTIVE' && styles.tabItemActive]}
            onPress={() => setStatusTab('ACTIVE')}
          >
            <Text style={[styles.tabText, statusTab === 'ACTIVE' && styles.tabTextActive]}>
              {language === 'mr' ? 'सक्रिय रांग' : 'Active Queue'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, statusTab === 'COMPLETED' && styles.tabItemActive]}
            onPress={() => setStatusTab('COMPLETED')}
          >
            <Text style={[styles.tabText, statusTab === 'COMPLETED' && styles.tabTextActive]}>
              {language === 'mr' ? 'पूर्ण झालेले' : 'Completed'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, statusTab === 'ALL' && styles.tabItemActive]}
            onPress={() => setStatusTab('ALL')}
          >
            <Text style={[styles.tabText, statusTab === 'ALL' && styles.tabTextActive]}>
              {language === 'mr' ? 'सर्व' : 'All'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.issueButton}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
        >
          <AppIcon name="check" size={16} color={colors.white} />
          <Text style={styles.issueButtonText}>{language === 'mr' ? '+ टोकन' : '+ Issue Token'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <FormInput
          label=""
          placeholder={language === 'mr' ? 'नाव किंवा टोकन क्रमांक शोधा...' : 'Search patient name or token #...'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search"
        />
      </View>

      {/* Token List */}
      <FlatList
        data={processedTokens}
        keyExtractor={item => item.id || String(item.tokenNumber)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const pConfig = QUEUE_PRIORITIES[item.priority] || QUEUE_PRIORITIES.general;
          const isInConsult = item.status === 'IN_CONSULTATION';
          const isWaiting = item.status === 'WAITING';

          return (
            <Card
              variant={isInConsult ? 'accent' : item.priority === 'emergency' ? 'danger' : 'default'}
              style={styles.tokenCard}
            >
              <View style={styles.tokenHeader}>
                <View style={styles.tokenNumberBadge}>
                  <Text style={styles.tokenNumberText}>{item.tokenNumber}</Text>
                </View>

                <View style={styles.headerBadges}>
                  <Badge
                    label={language === 'mr' ? pConfig.labelMr : pConfig.labelEn}
                    variant={pConfig.badgeVariant}
                    size="sm"
                  />
                  {isWaiting && (
                    <Badge
                      label={`#${item.position} in line`}
                      variant="neutral"
                      size="sm"
                    />
                  )}
                  {isInConsult && (
                    <Badge
                      label={language === 'mr' ? 'सुरू आहे' : 'IN CONSULTATION'}
                      variant="teal"
                      size="sm"
                      dot
                    />
                  )}
                </View>
              </View>

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
                        ? `${language === 'mr' ? 'अंदाजे' : 'Est. Wait'}: ${item.estWaitMinutes} mins`
                        : isInConsult
                        ? language === 'mr' ? 'सध्या सुरू आहे' : 'Consulting now'
                        : `${language === 'mr' ? 'पूर्ण' : 'Finished'}`}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <AppIcon name="calendar" size={14} color={colors.slate.gray} />
                    <Text style={styles.metaText}>
                      {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    icon="chevronRight"
                    onPress={() => handleCallToken(item)}
                  />
                )}
                {isInConsult && (
                  <Button
                    title={language === 'mr' ? 'पूर्ण करा' : 'Mark Completed'}
                    size="sm"
                    variant="accent"
                    icon="check"
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

        <Text style={styles.modalFieldLabel}>{language === 'mr' ? 'विभाग निवडा' : 'Select Department'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalChips}>
          {DEPARTMENTS.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.modalChip, department === d && styles.modalChipActive]}
              onPress={() => setDepartment(d)}
            >
              <Text style={[styles.modalChipText, department === d && styles.modalChipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.modalFieldLabel}>{language === 'mr' ? 'प्राधान्य श्रेणी' : 'Priority Category'}</Text>
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
                  p === 'emergency' && isSelected && { borderColor: colors.status.error, backgroundColor: colors.status.errorBg },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.priorityOptionTitle, isSelected && { color: colors.slate.dark, fontWeight: '700' }]}>
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
    backgroundColor: colors.slate.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.borderLight,
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
    color: colors.accent.DEFAULT,
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
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.slate.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.slate.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.slate.gray,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.slate.surfaceSubtle,
    borderRadius: borderRadius.full,
    padding: 2,
  },
  tabItem: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  tabItemActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  tabText: {
    fontSize: 12,
    color: colors.slate.gray,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary.DEFAULT,
  },
  issueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  issueButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  searchWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  tokenCard: {
    marginBottom: spacing.sm,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  tokenNumberBadge: {
    backgroundColor: colors.slate.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.slate.border,
  },
  tokenNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
    letterSpacing: 0.5,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
    borderTopColor: colors.slate.borderLight,
    paddingTop: spacing.xs,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl || 48,
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
    borderColor: colors.slate.border,
    marginRight: spacing.xs,
  },
  modalChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
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
    borderColor: colors.slate.border,
    backgroundColor: colors.slate.surface,
  },
  priorityOptionActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.light,
  },
  priorityOptionTitle: {
    fontSize: 12,
    color: colors.slate.gray,
  },
});
```

---

## 4. Screen Blueprint: `QueueTVScreen.tsx`

### 4.1 Component Architecture & Visual Specifications
- **Target File**: `mobile/src/screens/hubs/QueueTVScreen.tsx`
- **Navigation Route**: `QueueTV`
- **Design Philosophy**: High-contrast dark theme optimized for hospital wall displays and kiosk tablets.
  - Background: Dark Slate (`#1C2B3A` per `PROJECT.md` line 15).
  - Surface Card: Deep Slate (`#16222F` / `#22354A`).
  - Active Callout Typography: 56–64px extra bold.
  - Emergency Alert: Visual flashing beacon banner with pulsing red glow (`#DC2626`).
  - Audio Chime: Speech synthesis in Marathi (`mr-IN`), Hindi (`hi-IN`), or English (`en-IN`) via `expo-speech`.

### 4.2 Complete Code Structure for `QueueTVScreen.tsx`
```typescript
/**
 * HealthWay Waiting Room TV Display & Audio Chime
 * Government of Maharashtra - Integrated Rural Health Platform
 * Complies with PROJECT.md Feature 16 & Tier 1/4 tests
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { AppIcon } from '../../theme/icons';
import { Badge } from '../../components/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { QueueToken } from '../../types/queue';
import { INITIAL_QUEUE_TOKENS } from '../../data/mockQueue';

export const QueueTVScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { language, setLanguage } = useLanguage();

  const [tokens, setTokens] = useState<QueueToken[]>(INITIAL_QUEUE_TOKENS);
  const [activeTokenIndex, setActiveTokenIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [flashAnim] = useState(new Animated.Value(0));

  // Current Active Token (IN_CONSULTATION or first WAITING)
  const sortedTokens = [...tokens].sort((a, b) => {
    if (a.status === 'IN_CONSULTATION') return -1;
    if (b.status === 'IN_CONSULTATION') return 1;
    if (b.priorityWeight !== a.priorityWeight) {
      return b.priorityWeight - a.priorityWeight;
    }
    return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
  });

  const activeToken: QueueToken | undefined =
    sortedTokens.find(t => t.status === 'IN_CONSULTATION') || sortedTokens[0];
  const upcomingTokens: QueueToken[] = sortedTokens
    .filter(t => t.status === 'WAITING' && t.id !== activeToken?.id)
    .slice(0, 4);

  const isEmergency = activeToken?.priority === 'emergency';

  // Digital Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Emergency Flashing Animation
  useEffect(() => {
    if (isEmergency) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(flashAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
        ])
      ).start();
    } else {
      flashAnim.setValue(0);
    }
  }, [isEmergency, flashAnim]);

  // Audio Speech Chime
  const announceToken = useCallback((token?: QueueToken) => {
    if (!token || isMuted) return;

    try {
      Speech.stop();
      let phrase = '';
      let langCode = 'en-IN';

      if (language === 'mr') {
        phrase = `टोकन क्रमांक ${token.tokenNumber}, ${token.patientName}, कृपया ओपीडी कक्ष २ मध्ये यावे.`;
        langCode = 'mr-IN';
      } else if (language === 'hi') {
        phrase = `टोकन नंबर ${token.tokenNumber}, ${token.patientName}, कृपया ओपीडी कक्ष २ में जाएं.`;
        langCode = 'hi-IN';
      } else {
        phrase = `Token Number ${token.tokenNumber}, ${token.patientName}, please proceed to OPD Room 2.`;
        langCode = 'en-IN';
      }

      Speech.speak(phrase, {
        language: langCode,
        rate: 0.85,
        pitch: 1.0,
      });
    } catch (err) {
      console.warn('Speech callout error', err);
    }
  }, [language, isMuted]);

  // Trigger announcement when active token changes
  useEffect(() => {
    if (activeToken) {
      announceToken(activeToken);
    }
  }, [activeToken?.tokenNumber]);

  // Call Next Token
  const handleCallNext = () => {
    const nextWaiting = sortedTokens.find(t => t.status === 'WAITING');
    if (!nextWaiting) return;

    setTokens(prev =>
      prev.map(t => {
        if (t.id === nextWaiting.id) {
          return { ...t, status: 'IN_CONSULTATION', calledTime: new Date().toISOString() };
        }
        if (t.status === 'IN_CONSULTATION') {
          return { ...t, status: 'COMPLETED', completionTime: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  // Simulate Emergency Arrival
  const handleSimulateEmergency = () => {
    const emgToken: QueueToken = {
      id: `TOK-EMG-${Date.now()}`,
      tokenNumber: `EMG-${Math.floor(10 + Math.random() * 90)}`,
      patientId: `PT-EMG-${Date.now().toString().slice(-4)}`,
      patientName: language === 'mr' ? 'पूजा गायकवाड (तातडीची दुर्घटना)' : 'Pooja Gaikwad (Acute Trauma)',
      department: 'Casualty / Emergency',
      healthCenterId: 'FAC001',
      priority: 'emergency',
      priorityWeight: 100,
      status: 'WAITING',
      checkInTime: new Date().toISOString(),
      estWaitMinutes: 0,
      position: 1,
    };
    setTokens(prev => [emgToken, ...prev]);
  };

  const emergencyBorderColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1C2B3A', '#DC2626'],
  });

  return (
    <View style={[styles.tvContainer, { paddingTop: insets.top }]}>
      {/* TV Header Bar */}
      <View style={styles.tvHeader}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.emblemBadge}>
            <Text style={styles.emblemText}>MH</Text>
          </View>
          <View>
            <Text style={styles.hospitalTitle}>
              {language === 'mr' ? 'जिल्हा रुग्णालय सातारा' : 'DISTRICT HOSPITAL SATARA'}
            </Text>
            <Text style={styles.subTitle}>
              {language === 'mr' ? 'ओपीडी प्रतीक्षा कक्ष डिजिटल डिस्प्ले' : 'OPD WAITING HALL DISPLAY · ROOM 2'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRightWrap}>
          <Text style={styles.clockText}>{currentTime}</Text>
          <TouchableOpacity
            style={[styles.tvActionBtn, isMuted && styles.tvActionBtnMuted]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <AppIcon name={isMuted ? 'volumeMute' : 'volumeHigh'} size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tvCloseBtn}
            onPress={() => navigation.goBack()}
          >
            <AppIcon name="close" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Alert Banner if Emergency Token Active */}
      {isEmergency && (
        <Animated.View style={[styles.emergencyBanner, { borderColor: emergencyBorderColor }]}>
          <AppIcon name="emergency" size={24} color="#EF4444" />
          <Text style={styles.emergencyBannerText}>
            {language === 'mr'
              ? 'तातडीची रुग्ण सूचना — कृपया डॉक्टरांना तात्काळ लक्ष द्यावे'
              : 'CRITICAL EMERGENCY CODE RED — IMMEDIATE MEDICAL ATTENTION REQUIRED'}
          </Text>
        </Animated.View>
      )}

      {/* Main Kiosk Content */}
      <ScrollView contentContainerStyle={styles.contentWrap}>
        {/* HERO NOW SERVING PANEL */}
        <Animated.View
          style={[
            styles.nowServingCard,
            isEmergency && { borderColor: emergencyBorderColor, borderWidth: 3 },
          ]}
        >
          <View style={styles.servingHeader}>
            <Badge
              label={language === 'mr' ? 'सध्या सुरू असलेले टोकन' : 'NOW SERVING'}
              variant="accent"
              size="md"
              dot
            />
            {activeToken && (
              <Badge
                label={activeToken.priority.toUpperCase()}
                variant={isEmergency ? 'danger' : 'primary'}
                size="md"
              />
            )}
          </View>

          {activeToken ? (
            <View style={styles.tokenHeroBody}>
              <Text style={styles.tokenHeroNumber}>{activeToken.tokenNumber}</Text>
              <Text style={styles.patientHeroName}>{activeToken.patientName}</Text>
              <View style={styles.roomCalloutWrap}>
                <AppIcon name="hospital" size={24} color="#38BDF8" />
                <Text style={styles.roomCalloutText}>
                  {language === 'mr' ? 'कक्ष क्र. २ — डॉ. देशमुख' : 'OPD ROOM 2 — DR. A. R. DESHMUKH'}
                </Text>
              </View>
              <Text style={styles.deptHeroText}>{activeToken.department}</Text>

              {/* Repeat Chime Button */}
              <TouchableOpacity
                style={styles.replayChimeBtn}
                onPress={() => announceToken(activeToken)}
                activeOpacity={0.8}
              >
                <AppIcon name="volumeHigh" size={18} color={colors.white} />
                <Text style={styles.replayChimeText}>
                  {language === 'mr' ? 'पुन्हा घोषणा करा' : 'Repeat Audio Announcement'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noServingWrap}>
              <Text style={styles.noServingText}>
                {language === 'mr' ? 'सध्या कोणताही रुग्ण तपासणीत नाही' : 'No patient currently in consultation'}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* NEXT IN LINE SECTION */}
        <View style={styles.upcomingSection}>
          <Text style={styles.upcomingHeading}>
            {language === 'mr' ? 'पुढील टोकन (रांगेत)' : 'NEXT IN LINE / UPCOMING TOKENS'}
          </Text>

          <View style={styles.upcomingGrid}>
            {upcomingTokens.length > 0 ? (
              upcomingTokens.map((tok, idx) => (
                <View key={tok.id || String(tok.tokenNumber)} style={styles.upcomingCard}>
                  <View style={styles.upcomingCardHeader}>
                    <Text style={styles.upcomingIndex}>#{idx + 1}</Text>
                    <Text style={styles.upcomingTokenNum}>{tok.tokenNumber}</Text>
                  </View>
                  <Text style={styles.upcomingPatient} numberOfLines={1}>
                    {tok.patientName}
                  </Text>
                  <View style={styles.upcomingFooter}>
                    <Badge
                      label={tok.priority}
                      variant={tok.priority === 'emergency' ? 'danger' : 'neutral'}
                      size="sm"
                    />
                    <Text style={styles.upcomingWait}>~{tok.estWaitMinutes || (idx + 1) * 8}m</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noUpcomingText}>
                {language === 'mr' ? 'रांगेत पुढील रुग्ण उपलब्ध नाहीत' : 'No more waiting patients in queue'}
              </Text>
            )}
          </View>
        </View>

        {/* KIOSK DEMO SIMULATION CONTROLS */}
        <View style={styles.kioskControls}>
          <TouchableOpacity
            style={[styles.kioskBtn, { backgroundColor: colors.accent.DEFAULT }]}
            onPress={handleCallNext}
          >
            <AppIcon name="chevronRight" size={18} color={colors.white} />
            <Text style={styles.kioskBtnText}>{language === 'mr' ? 'पुढील टोकन बोलवा' : 'Call Next Token'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kioskBtn, { backgroundColor: colors.status.error }]}
            onPress={handleSimulateEmergency}
          >
            <AppIcon name="siren" size={18} color={colors.white} />
            <Text style={styles.kioskBtnText}>{language === 'mr' ? '+ तातडीचा रुग्ण' : '+ Inject Emergency'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tvContainer: {
    flex: 1,
    backgroundColor: '#1C2B3A', // Dark Slate
  },
  tvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#16222F',
    borderBottomWidth: 1,
    borderBottomColor: '#2B3F54',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emblemBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  hospitalTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  headerRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clockText: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'System',
    marginRight: spacing.sm,
  },
  tvActionBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: '#26384B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tvActionBtnMuted: {
    backgroundColor: colors.status.error,
  },
  tvCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: '#26384B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 2,
    borderColor: '#DC2626',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  emergencyBannerText: {
    color: '#F87171',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  contentWrap: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  nowServingCard: {
    backgroundColor: '#22354A',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: '#334E68',
    ...shadows.lg,
  },
  servingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tokenHeroBody: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tokenHeroNumber: {
    fontSize: 68,
    fontWeight: '900',
    color: colors.accent.DEFAULT,
    letterSpacing: 2,
    lineHeight: 76,
  },
  patientHeroName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  roomCalloutWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    gap: spacing.xs + 2,
  },
  roomCalloutText: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  deptHeroText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: spacing.sm,
  },
  replayChimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  replayChimeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  noServingWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noServingText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  upcomingSection: {
    gap: spacing.sm,
  },
  upcomingHeading: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  upcomingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  upcomingCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#22354A',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#334E68',
  },
  upcomingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingIndex: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  upcomingTokenNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  upcomingPatient: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 4,
  },
  upcomingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  upcomingWait: {
    color: '#94A3B8',
    fontSize: 11,
  },
  noUpcomingText: {
    color: '#64748B',
    fontSize: 13,
  },
  kioskControls: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  kioskBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  kioskBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
```

---

## 5. Screen Blueprint: `EmergencySOSScreen.tsx`

### 5.1 Component Architecture & Key Requirements
- **Target File**: `mobile/src/screens/hubs/EmergencySOSScreen.tsx`
- **Navigation Route**: `EmergencySOS`
- **Key Modules**:
  1. **1-Tap SOS Button**: Giant circular pulsating siren button.
  2. **10-Second Grace Window**: Prevents accidental triggers (test `F19-4`).
  3. **GPS Coordinate Beacon with Rural Fallback**:
     - Uses `expo-location`.
     - Authoritative Rural Fallback: `18.6534° N, 74.1352° E` (Shirwal/Khandala rural valley).
  4. **14-Minute Live ALS Ambulance Countdown & 5-Stage Status Telemetry**:
     - Sequential stages: `DISPATCHED` -> `EN_ROUTE` -> `ON_SCENE` -> `TRANSPORTING` -> `ARRIVED`.
     - Live countdown ticker.
     - ALS vehicle `MH-12-HE-1080` with 1-tap call to driver (`Linking.openURL('tel:+919822110800')`).
     - Equipment badges: Oxygen, AED Defibrillator, Transport Ventilator, Trauma Kit.
  5. **Pre-Arrival Hospital Casualty Alert Card**:
     - District Hospital Satara (`FAC001`), Code Red Trauma token, direct casualty call (`+91 2162 234100`).
  6. **Direct-Call Emergency Helplines Grid**:
     - `108` (Ambulance), `102` (Maternal), `104` (Health Advice), `1091` (Women).

### 5.2 Complete Code Structure for `EmergencySOSScreen.tsx`
```typescript
/**
 * HealthWay Emergency 1-Tap SOS & Live ALS Ambulance Tracking
 * Government of Maharashtra - Integrated Rural Health Platform
 * Complies with PROJECT.md Features 19-20 & Tier 1/4 tests
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { AppIcon } from '../../theme/icons';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EmergencyStatus } from '../../types/emergency';
import storage from '../../storage';

export const RURAL_FALLBACK_COORDINATES = {
  latitude: 18.6534,
  longitude: 74.1352,
  formattedLat: '18.6534° N',
  formattedLng: '74.1352° E',
  village: 'Shirwal Rural Corridor, Khandala',
  district: 'Satara, Maharashtra',
};

export const EMERGENCY_HELPLINES = [
  { number: '108', titleEn: 'Emergency Ambulance', titleMr: '१०८ रुग्णवाहिका', desc: 'Free ALS / BLS Dispatch', color: '#D32F2F' },
  { number: '102', titleEn: 'Janani Shishu Suraksha', titleMr: '१०२ माता व बाल सेवा', desc: 'Maternal & Neonatal', color: '#7B1FA2' },
  { number: '104', titleEn: 'Health Helpline', titleMr: '१०४ आरोग्य सल्ला', desc: 'Govt Medical Advice', color: '#00796B' },
  { number: '1091', titleEn: 'Women Helpline', titleMr: '१०९१ महिला सहाय्यता', desc: 'Emergency Distress', color: '#ED6C02' },
];

export const TELEMETRY_STAGES: Array<{ stage: EmergencyStatus; labelEn: string; labelMr: string }> = [
  { stage: 'DISPATCHED', labelEn: 'Dispatched', labelMr: 'रवाना झाले' },
  { stage: 'EN_ROUTE', labelEn: 'En Route', labelMr: 'मार्गावर' },
  { stage: 'ON_SCENE', labelEn: 'On Scene', labelMr: 'घटनास्थळी' },
  { stage: 'TRANSPORTING', labelEn: 'Transporting', labelMr: 'वाहनात' },
  { stage: 'ARRIVED', labelEn: 'Arrived', labelMr: 'रुग्णालयात' },
];

export const EmergencySOSScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { language } = useLanguage();
  const { session } = useAuth();

  // SOS States
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [graceRemaining, setGraceRemaining] = useState<number>(10);
  const [etaSeconds, setEtaSeconds] = useState<number>(14 * 60); // 14 mins
  const [currentStage, setCurrentStage] = useState<EmergencyStatus>('DISPATCHED');
  const [sosId, setSosId] = useState<string>('');

  // GPS State
  const [gpsLocation, setGpsLocation] = useState({
    latitude: RURAL_FALLBACK_COORDINATES.latitude,
    longitude: RURAL_FALLBACK_COORDINATES.longitude,
    isFallback: true,
    locationName: `${RURAL_FALLBACK_COORDINATES.village}, ${RURAL_FALLBACK_COORDINATES.district}`,
  });

  // Pulse animation for siren button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse effect loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Capture GPS on mount with fallback
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setGpsLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            isFallback: false,
            locationName: `${loc.coords.latitude.toFixed(4)}° N, ${loc.coords.longitude.toFixed(4)}° E`,
          });
        }
      } catch (err) {
        // Fallback already set
      }
    })();
  }, []);

  // 10-Second Grace Window Countdown
  useEffect(() => {
    let graceTimer: NodeJS.Timeout;
    if (isActivated && !isDispatched) {
      graceTimer = setInterval(() => {
        setGraceRemaining(prev => {
          if (prev <= 1) {
            clearInterval(graceTimer);
            confirmDispatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(graceTimer);
  }, [isActivated, isDispatched]);

  // 14-Minute Live Ambulance Countdown & Stage Progression
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    if (isDispatched && etaSeconds > 0) {
      countdownTimer = setInterval(() => {
        setEtaSeconds(prev => {
          const next = prev - 1;
          // Dynamically advance telemetry stage based on elapsed time
          if (next === 11 * 60) setCurrentStage('EN_ROUTE');
          else if (next === 6 * 60) setCurrentStage('ON_SCENE');
          else if (next === 3 * 60) setCurrentStage('TRANSPORTING');
          else if (next <= 0) setCurrentStage('ARRIVED');
          return Math.max(0, next);
        });
      }, 1000);
    }
    return () => clearInterval(countdownTimer);
  }, [isDispatched, etaSeconds]);

  // Trigger SOS button pressed
  const handleTriggerSOS = () => {
    if (isDispatched) return;
    const newSosId = `SOS-${Date.now()}`;
    setSosId(newSosId);
    setIsActivated(true);
    setGraceRemaining(10);
  };

  // Confirm Dispatch (after 10s or manually)
  const confirmDispatch = async () => {
    setIsDispatched(true);
    setIsActivated(false);
    setCurrentStage('DISPATCHED');

    // Persist to sync_queue locally
    try {
      const sosEvent = {
        sosId: sosId || `SOS-${Date.now()}`,
        patientName: session.user.name,
        abhaId: session.user.abhaId || '14-4821-9876-5432',
        bloodGroup: 'B Positive',
        lat: gpsLocation.latitude,
        lng: gpsLocation.longitude,
        timestamp: Date.now(),
        status: 'DISPATCHED',
      };
      await storage.saveItem('sync_queue', sosEvent.sosId, sosEvent);
    } catch {
      // offline safe
    }
  };

  // Cancel False Alarm (grace window)
  const handleCancelSOS = () => {
    setIsActivated(false);
    setGraceRemaining(10);
  };

  // Dial helpline
  const handleDial = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Call Failed', `Cannot make phone call to ${phone}`);
    });
  };

  // Format ETA time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeStageIndex = TELEMETRY_STAGES.findIndex(s => s.stage === currentStage);

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'तातडीची आणीबाणी एसओएस' : 'Emergency 1-Tap SOS'}
        subtitle={language === 'mr' ? '१०८ रुग्णवाहिका व ट्रामा केंद्र' : '108 Ambulance & Trauma Network'}
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* GPS Beacon Status Card */}
        <Card variant="default" style={styles.beaconCard}>
          <View style={styles.beaconHeader}>
            <View style={styles.beaconTitleRow}>
              <AppIcon name="location" size={20} color={colors.status.error} />
              <Text style={styles.beaconTitle}>
                {language === 'mr' ? 'थेट जीपीएस बीकन' : 'Live GPS Emergency Beacon'}
              </Text>
            </View>
            <Badge
              label={gpsLocation.isFallback ? 'RURAL MESH FALLBACK' : 'GPS LOCKED'}
              variant={gpsLocation.isFallback ? 'warning' : 'success'}
              size="sm"
            />
          </View>

          <View style={styles.coordinatesWrap}>
            <Text style={styles.coordText}>
              {`${gpsLocation.latitude.toFixed(4)}° N, ${gpsLocation.longitude.toFixed(4)}° E`}
            </Text>
            <Text style={styles.villageText}>{gpsLocation.locationName}</Text>
          </View>
        </Card>

        {/* 1-TAP SOS HERO BUTTON SECTION */}
        {!isDispatched ? (
          <View style={styles.heroSosSection}>
            <Text style={styles.sosInstructions}>
              {language === 'mr'
                ? 'वैद्यकीय आणीबाणीसाठी तात्काळ खालील बटण दाबा'
                : 'Tap once for immediate 108 ALS Ambulance Dispatch'}
            </Text>

            <Animated.View style={{ transform: [{ scale: isActivated ? pulseAnim : 1 }] }}>
              <TouchableOpacity
                style={[styles.bigSosButton, isActivated && styles.bigSosButtonActive]}
                onPress={handleTriggerSOS}
                activeOpacity={0.85}
              >
                <AppIcon name="siren" size={56} color={colors.white} />
                <Text style={styles.bigSosText}>108 SOS</Text>
                <Text style={styles.bigSosSubText}>
                  {language === 'mr' ? 'तात्काळ मदत' : 'TAP TO DISPATCH'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* 10-Second Grace Window Banner */}
            {isActivated && (
              <View style={styles.graceBanner}>
                <View style={styles.graceLeft}>
                  <Text style={styles.graceTimerText}>{graceRemaining}s</Text>
                  <Text style={styles.graceLabel}>
                    {language === 'mr' ? 'रवाना होत आहे... रद्द करण्यासाठी टॅप करा' : 'Dispatching... Tap to cancel false alarm'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.cancelGraceBtn} onPress={handleCancelSOS}>
                  <Text style={styles.cancelGraceText}>{language === 'mr' ? 'रद्द करा' : 'Cancel'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* LIVE ALS AMBULANCE TELEMETRY SECTION */
          <View style={styles.telemetrySection}>
            <Card variant="danger" style={styles.countdownCard}>
              <View style={styles.countdownHeader}>
                <Badge label="CODE RED ACTIVATED" variant="danger" dot size="sm" />
                <Text style={styles.sosIdBadge}>{sosId || 'SOS-ACTIVE'}</Text>
              </View>

              <View style={styles.timerRow}>
                <Text style={styles.timerNumber}>{formatTime(etaSeconds)}</Text>
                <Text style={styles.timerUnit}>
                  {language === 'mr' ? 'मिनिटे (अंदाजे आगमन)' : 'MINUTES (EST. ARRIVAL)'}
                </Text>
              </View>

              {/* 5-Stage Status Telemetry Bar */}
              <View style={styles.telemetryTrack}>
                {TELEMETRY_STAGES.map((s, idx) => {
                  const isPassed = idx <= activeStageIndex;
                  const isCurrent = idx === activeStageIndex;
                  return (
                    <View key={s.stage} style={styles.telemetryStep}>
                      <View
                        style={[
                          styles.stepDot,
                          isPassed && styles.stepDotPassed,
                          isCurrent && styles.stepDotCurrent,
                        ]}
                      >
                        {isPassed && <AppIcon name="check" size={10} color={colors.white} />}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          isCurrent && styles.stepLabelCurrent,
                        ]}
                      >
                        {language === 'mr' ? s.labelMr : s.labelEn}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Assigned ALS Unit Details */}
            <Card variant="default" style={styles.unitCard}>
              <View style={styles.unitHeader}>
                <View style={styles.unitTitleRow}>
                  <AppIcon name="ambulance" size={22} color={colors.primary.DEFAULT} />
                  <View>
                    <Text style={styles.unitId}>MH-12-HE-1080 (ALS Unit)</Text>
                    <Text style={styles.unitType}>Advanced Life Support · Satara Rural EOC</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.callDriverBtn}
                  onPress={() => handleDial('+919822110800')}
                >
                  <AppIcon name="call" size={16} color={colors.white} />
                  <Text style={styles.callDriverText}>Call 108</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.equipmentRow}>
                <Text style={styles.equipHeading}>{language === 'mr' ? 'सज्ज वैद्यकीय उपकरणे:' : 'Onboard Life Support:'}</Text>
                <View style={styles.equipBadges}>
                  <Badge label="Oxygen 100%" variant="teal" size="sm" />
                  <Badge label="Defibrillator AED" variant="danger" size="sm" />
                  <Badge label="Ventilator" variant="primary" size="sm" />
                  <Badge label="Trauma Kit" variant="purple" size="sm" />
                </View>
              </View>
            </Card>

            {/* Pre-Arrival Hospital Casualty Alert */}
            <Card variant="warning" style={styles.casualtyCard}>
              <View style={styles.casualtyHeader}>
                <AppIcon name="hospital" size={20} color={colors.urgency.orange} />
                <Text style={styles.casualtyTitle}>
                  {language === 'mr' ? 'रुग्णालय पूर्व सूचना (कॅज्युअल्टी)' : 'Pre-Arrival Hospital Casualty Alert'}
                </Text>
              </View>

              <Text style={styles.hospitalDest}>
                District Hospital Satara (Level 2 Trauma Centre)
              </Text>
              <Text style={styles.casualtySub}>
                Casualty Ward Token: <Text style={{ fontWeight: '800' }}>CODE_RED_TRAUMA</Text> · Trauma Bay 1 Reserved
              </Text>

              <View style={styles.casualtyActionRow}>
                <TouchableOpacity
                  style={styles.dialHospitalBtn}
                  onPress={() => handleDial('+912162234100')}
                >
                  <AppIcon name="phoneEmergency" size={14} color={colors.white} />
                  <Text style={styles.dialHospitalText}>Casualty Desk: +91 2162 234100</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* 24/7 HELPLINES DIRECT DIAL GRID */}
        <View style={styles.helplinesSection}>
          <Text style={styles.sectionHeading}>
            {language === 'mr' ? '२४x७ आपत्कालीन थेट हेल्पलाइन' : '24x7 Emergency Helplines'}
          </Text>

          <View style={styles.helplinesGrid}>
            {EMERGENCY_HELPLINES.map(line => (
              <TouchableOpacity
                key={line.number}
                style={styles.helplineCard}
                onPress={() => handleDial(line.number)}
                activeOpacity={0.75}
              >
                <View style={[styles.helplineIconWrap, { backgroundColor: line.color }]}>
                  <AppIcon name="phoneEmergency" size={18} color={colors.white} />
                </View>
                <View style={styles.helplineContent}>
                  <Text style={styles.helplineNumber}>{line.number}</Text>
                  <Text style={styles.helplineTitle}>
                    {language === 'mr' ? line.titleMr : line.titleEn}
                  </Text>
                  <Text style={styles.helplineDesc}>{line.desc}</Text>
                </View>
                <AppIcon name="chevronRight" size={16} color={colors.slate.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    gap: spacing.md,
  },
  beaconCard: {
    backgroundColor: colors.slate.surface,
  },
  beaconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  beaconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  beaconTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  coordinatesWrap: {
    marginTop: 4,
  },
  coordText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.slate.dark,
    letterSpacing: 0.5,
  },
  villageText: {
    fontSize: 12,
    color: colors.slate.gray,
    marginTop: 2,
  },
  heroSosSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  sosInstructions: {
    fontSize: 14,
    color: colors.slate.gray,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  bigSosButton: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFCDD2',
    ...shadows.lg,
  },
  bigSosButtonActive: {
    backgroundColor: '#B71C1C',
    borderColor: '#EF5350',
  },
  bigSosText: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  bigSosSubText: {
    color: '#FFCDD2',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  graceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#ED6C02',
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 4,
    width: '100%',
  },
  graceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  graceTimerText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ED6C02',
  },
  graceLabel: {
    fontSize: 12,
    color: colors.slate.dark,
    flex: 1,
  },
  cancelGraceBtn: {
    backgroundColor: '#ED6C02',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  cancelGraceText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  telemetrySection: {
    gap: spacing.md,
  },
  countdownCard: {
    backgroundColor: colors.slate.surface,
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sosIdBadge: {
    fontSize: 11,
    color: colors.slate.muted,
    fontWeight: '700',
  },
  timerRow: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  timerNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.status.error,
    letterSpacing: 1,
  },
  timerUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.gray,
    marginTop: -4,
  },
  telemetryTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: 4,
  },
  telemetryStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.slate.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotPassed: {
    backgroundColor: colors.status.success,
  },
  stepDotCurrent: {
    backgroundColor: colors.status.error,
    borderWidth: 2,
    borderColor: '#FFCDD2',
  },
  stepLabel: {
    fontSize: 9,
    color: colors.slate.muted,
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelCurrent: {
    color: colors.status.error,
    fontWeight: '800',
  },
  unitCard: {
    backgroundColor: colors.slate.surface,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  unitId: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  unitType: {
    fontSize: 11,
    color: colors.slate.gray,
  },
  callDriverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  callDriverText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  equipmentRow: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.slate.borderLight,
    paddingTop: spacing.xs,
  },
  equipHeading: {
    fontSize: 11,
    color: colors.slate.muted,
    fontWeight: '600',
    marginBottom: 4,
  },
  equipBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  casualtyCard: {
    backgroundColor: '#FFFDE7',
  },
  casualtyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  casualtyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.urgency.orange,
    textTransform: 'uppercase',
  },
  hospitalDest: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  casualtySub: {
    fontSize: 12,
    color: colors.slate.gray,
    marginVertical: 4,
  },
  casualtyActionRow: {
    marginTop: spacing.xs,
  },
  dialHospitalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.urgency.orange,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  dialHospitalText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  helplinesSection: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.slate.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helplinesGrid: {
    gap: spacing.xs + 2,
  },
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate.surface,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate.border,
    gap: spacing.sm,
  },
  helplineIconWrap: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineContent: {
    flex: 1,
  },
  helplineNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  helplineTitle: {
    fontSize: 12,
    color: colors.slate.gray,
    fontWeight: '600',
  },
  helplineDesc: {
    fontSize: 10,
    color: colors.slate.muted,
  },
});
```

---

## 6. Seed Datasets Blueprint (`mobile/src/data/mockQueue.ts`)

To ensure realistic, instant rendering across all four clinical priority tiers without waiting for backends, `mockQueue.ts` should be created as follows:

```typescript
/**
 * Authoritative Queue Mock Seed Data
 * Complies with PROJECT.md Feature 15 & Tier 1/4 tests
 */
import { QueueToken } from '../types/queue';

export const DEPARTMENTS = [
  'General Medicine',
  'Obstetrics & Gynecology (ANC)',
  'Pediatrics',
  'Geriatric Care',
  'Casualty / Emergency',
  'Orthopedics',
];

export const INITIAL_QUEUE_TOKENS: QueueToken[] = [
  {
    id: 'TOK-001',
    tokenNumber: 'ANC-01',
    appointmentId: 'APT-101',
    patientId: 'PT-001',
    patientName: 'Sunita Ramchandra Jadhav',
    patientPhone: '+91 98221 44001',
    department: 'Obstetrics & Gynecology (ANC)',
    healthCenterId: 'FAC001',
    doctorId: 'DOC-002',
    doctorName: 'Dr. A. R. Deshmukh',
    priority: 'antenatal',
    priorityWeight: 75,
    status: 'IN_CONSULTATION',
    checkInTime: new Date(Date.now() - 25 * 60000).toISOString(),
    calledTime: new Date(Date.now() - 5 * 60000).toISOString(),
    estWaitMinutes: 2,
    position: 0,
  },
  {
    id: 'TOK-002',
    tokenNumber: 'EMG-01',
    patientId: 'PT-002',
    patientName: 'Pooja Gaikwad (Acute Asthma)',
    patientPhone: '+91 98221 44002',
    department: 'Casualty / Emergency',
    healthCenterId: 'FAC001',
    priority: 'emergency',
    priorityWeight: 100,
    status: 'WAITING',
    checkInTime: new Date(Date.now() - 10 * 60000).toISOString(),
    estWaitMinutes: 0,
    position: 1,
  },
  {
    id: 'TOK-003',
    tokenNumber: 'SNR-01',
    patientId: 'PT-003',
    patientName: 'Ganpatrao More (72y)',
    patientPhone: '+91 98221 44003',
    department: 'Geriatric Care',
    healthCenterId: 'FAC001',
    priority: 'senior',
    priorityWeight: 50,
    status: 'WAITING',
    checkInTime: new Date(Date.now() - 20 * 60000).toISOString(),
    estWaitMinutes: 8,
    position: 2,
  },
  {
    id: 'TOK-004',
    tokenNumber: 'GEN-01',
    patientId: 'PT-004',
    patientName: 'Ramesh Shankar Patil',
    patientPhone: '+91 98221 44004',
    department: 'General Medicine',
    healthCenterId: 'FAC001',
    priority: 'general',
    priorityWeight: 25,
    status: 'WAITING',
    checkInTime: new Date(Date.now() - 30 * 60000).toISOString(),
    estWaitMinutes: 16,
    position: 3,
  },
  {
    id: 'TOK-005',
    tokenNumber: 'GEN-02',
    patientId: 'PT-005',
    patientName: 'Anil Dnyaneshwar Shinde',
    patientPhone: '+91 98221 44005',
    department: 'General Medicine',
    healthCenterId: 'FAC001',
    priority: 'general',
    priorityWeight: 25,
    status: 'WAITING',
    checkInTime: new Date(Date.now() - 15 * 60000).toISOString(),
    estWaitMinutes: 24,
    position: 4,
  },
  {
    id: 'TOK-006',
    tokenNumber: 'GEN-00',
    patientId: 'PT-000',
    patientName: 'Kavita Suresh Kadam',
    department: 'General Medicine',
    healthCenterId: 'FAC001',
    priority: 'general',
    priorityWeight: 25,
    status: 'COMPLETED',
    checkInTime: new Date(Date.now() - 50 * 60000).toISOString(),
    completionTime: new Date(Date.now() - 25 * 60000).toISOString(),
    estWaitMinutes: 0,
    position: -1,
  },
];
```

---

## 7. Verification Checklist & Test Suite Mapping

| Test File | Test Cases Covered | Key Expectations Verified |
|---|---|---|
| `shared_hubs.test.ts` | **F15-1 to F15-5** | Priority weights `Emergency (100) > Antenatal (75/80) > Senior (50/60) > General (25/40)`; Emergency inserted at head; FIFO arrival tie-breaker; dynamic wait time formula `pos * avg`; lifecycle `WAITING` -> `IN_CONSULTATION` -> `COMPLETED`. |
| `shared_hubs.test.ts` | **F16-1 to F16-5** | High-contrast dark slate (`#1C2B3A`) display; huge token typography; bilingual audio announcements chime; upcoming tokens list; emergency visual alert flash. |
| `shared_hubs.test.ts` | **F19-1 to F19-5** | 1-Tap SOS payload generation; audible/visual siren feedback; pre-arrival casualty alert; 10-second cancellation grace window; ABHA ID & blood group transmission. |
| `shared_hubs.test.ts` | **F20-1 to F20-5** | 14-minute arrival countdown; 5-stage status telemetry (`DISPATCHED` -> `EN_ROUTE` -> `ON_SCENE` -> `TRANSPORTING` -> `ARRIVED`); dynamic ETA decrement; 1-tap dial to 108 driver; 24/7 national/state helplines. |
| `emergency_108.test.ts` | **Steps 1–5** | Step 1 GPS coordinates & timestamp; Step 2 Siren & casualty pre-arrival beacon; Step 3 ALS MH-12-HE-1080 countdown; Step 4 5-stage telemetry; Step 5 Trauma bay admission. |
| `rural_walkin.test.ts` | **Steps 1–2** | Step 1 Intake vitals & ANC priority token allocation; Step 2 Waiting room TV screen bilingual callout. |

---

## 8. Summary for the Worker Agent

1. **Directories to Create**:
   - `mobile/src/screens/hubs/`
   - `mobile/src/data/`
2. **Files to Implement**:
   - `mobile/src/data/mockQueue.ts`
   - `mobile/src/screens/hubs/QueueHubScreen.tsx`
   - `mobile/src/screens/hubs/QueueTVScreen.tsx`
   - `mobile/src/screens/hubs/EmergencySOSScreen.tsx`
3. **Zero External Changes**:
   - All code resides strictly in `mobile/src/`.
   - Never modify web or backend code.
4. **Clean Builds**:
   - Zero TypeScript errors (`npx tsc --noEmit`).
   - 100% test pass (`npm test`).
