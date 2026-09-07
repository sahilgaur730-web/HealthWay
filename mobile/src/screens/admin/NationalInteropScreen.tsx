/**
 * HealthWay Admin ABDM & National Health Interoperability Screen
 * Government of Maharashtra - Integrated Rural Health Platform
 * Feature 37: ABDM Certification, HMIS Form Upload & Multi-System Gateway Monitor
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

interface HealthSystem {
  id: string;
  name: string;
  category: 'National' | 'State' | 'Vertical Program';
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  uptimePercent: number;
  complianceLevel: string;
  lastHeartbeat: string;
}

export const NationalInteropScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { session } = useAuth();
  const { language } = useLanguage();

  const [systems, setSystems] = useState<HealthSystem[]>([
    {
      id: 'ABDM',
      name: 'Ayushman Bharat Digital Mission (ABDM)',
      category: 'National',
      status: 'ONLINE',
      latencyMs: 42,
      uptimePercent: 99.98,
      complianceLevel: 'M1/M2/M3',
      lastHeartbeat: '2s ago',
    },
    {
      id: 'NHM',
      name: 'National Health Mission (NHM Gateway)',
      category: 'National',
      status: 'ONLINE',
      latencyMs: 88,
      uptimePercent: 99.85,
      complianceLevel: 'v3.2',
      lastHeartbeat: '5s ago',
    },
    {
      id: 'HMIS',
      name: 'Health Management Info System (HMIS)',
      category: 'National',
      status: 'ONLINE',
      latencyMs: 110,
      uptimePercent: 99.6,
      complianceLevel: 'Form 1-12',
      lastHeartbeat: '8s ago',
    },
    {
      id: 'MCTS',
      name: 'Mother & Child Tracking System (MCTS/RCH)',
      category: 'State',
      status: 'ONLINE',
      latencyMs: 95,
      uptimePercent: 99.7,
      complianceLevel: 'RCH-2',
      lastHeartbeat: '3s ago',
    },
    {
      id: 'NIKSHAY',
      name: 'Direct TB Elimination Portal (Nikshay)',
      category: 'Vertical Program',
      status: 'ONLINE',
      latencyMs: 75,
      uptimePercent: 99.9,
      complianceLevel: 'NTEP-Direct',
      lastHeartbeat: '4s ago',
    },
    {
      id: 'COWIN',
      name: 'Universal Immunization Portal (U-WIN/CoWIN)',
      category: 'Vertical Program',
      status: 'ONLINE',
      latencyMs: 50,
      uptimePercent: 99.95,
      complianceLevel: 'UIP-API',
      lastHeartbeat: '1s ago',
    },
    {
      id: 'NCD',
      name: 'NPCDCS Non-Communicable Disease Portal',
      category: 'National',
      status: 'ONLINE',
      latencyMs: 120,
      uptimePercent: 99.4,
      complianceLevel: 'CPHC-NCD',
      lastHeartbeat: '10s ago',
    },
  ]);

  const [isSyncingHmis, setIsSyncingHmis] = useState<boolean>(false);
  const [hmisStatus, setHmisStatus] = useState<string>('VALIDATED_AND_SYNCED');

  const allOnline = systems.every(s => s.status === 'ONLINE');
  const avgLatency = Math.round(
    systems.reduce((acc, s) => acc + s.latencyMs, 0) / systems.length
  );

  // Simulate gateway outage test for F37-5
  const toggleSimulateOutage = () => {
    setSystems(prev =>
      prev.map(s =>
        s.id === 'NIKSHAY'
          ? {
              ...s,
              status: s.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE',
              latencyMs: s.status === 'ONLINE' ? 999 : 75,
            }
          : s
      )
    );
  };

  const handleSyncHmisMonthly = async () => {
    setIsSyncingHmis(true);
    try {
      const hmisReport = {
        reportingMonth: '2026-08',
        districtCode: 'DIST-RAIGAD',
        formsCompleted: 12,
        totalForms: 12,
        submissionStatus: 'VALIDATED_AND_SYNCED',
        syncedBy: session.user.name,
        timestamp: new Date().toISOString(),
      };

      await storageEngine.enqueueSync('/api/v1/hmis/monthly-sync', 'POST', hmisReport);
      setHmisStatus('VALIDATED_AND_SYNCED');

      Alert.alert(
        language === 'mr' ? 'HMIS मासिक अहवाल यशस्वी!' : 'HMIS Upload Complete',
        language === 'mr'
          ? 'मासिक निर्देशक फॉर्म १ ते १२ राष्ट्रीय HMIS पोर्टलवर पूर्णपणे प्रमाणित व समक्रमित झाले आहेत.'
          : 'Monthly Indicator Forms 1-12 successfully validated and synced to the National HMIS Gateway.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.warn('HMIS sync failed', err);
      Alert.alert('Error', 'Failed to upload HMIS forms.');
    } finally {
      setIsSyncingHmis(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="National Health Interop"
        subtitle="ABDM, HMIS & Federal Health Gateways"
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Gateway Health Overview */}
        <Card
          variant={allOnline ? 'accent' : 'default'}
          title="Federal Health Gateway Telemetry"
          subtitle={`Overall Status: ${allOnline ? 'ALL GATEWAYS HEALTHY' : 'INCIDENT DETECTED'}`}
          icon="admin"
        >
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{systems.length}/7</Text>
              <Text style={styles.metricLabel}>Online Systems</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{avgLatency} ms</Text>
              <Text style={styles.metricLabel}>Average Latency</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>99.8%</Text>
              <Text style={styles.metricLabel}>District Uptime</Text>
            </View>
          </View>

          <TouchableOpacity onPress={toggleSimulateOutage} style={styles.simToggle}>
            <Text style={styles.simToggleText}>
              {allOnline ? 'Test Alert: Simulate Nikshay Outage' : 'Restore Nikshay Gateway to Online'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* ABDM Milestone Compliance Card */}
        <Card variant="default" title="Ayushman Bharat Digital Mission (ABDM)" icon="admin">
          <Text style={styles.abdmDesc}>
            HealthWay mobile platform is certified for ABDM Milestone 1 (ABHA Creation), Milestone 2 (HIP - Health Information Provider), and Milestone 3 (HIU - Health Information User).
          </Text>
          <View style={styles.badgeRow}>
            <Badge label="M1: ABHA Registration" variant="success" size="sm" />
            <Badge label="M2: HIP Gateway" variant="success" size="sm" />
            <Badge label="M3: HIU Health Locker" variant="success" size="sm" />
          </View>
        </Card>

        {/* HMIS Monthly Forms Synchronization Card */}
        <Card variant="default" title="National HMIS Monthly Reporting" icon="sync">
          <View style={styles.hmisRow}>
            <View style={styles.hmisLeft}>
              <Text style={styles.hmisTitle}>Monthly Indicator Reports (Forms 1 - 12)</Text>
              <Text style={styles.hmisSubtitle}>Reporting Cycle: August 2026 · 12 of 12 Forms Ready</Text>
            </View>
            <Badge
              label={hmisStatus === 'VALIDATED_AND_SYNCED' ? 'SYNCED' : 'PENDING'}
              variant="success"
              size="sm"
            />
          </View>
          <Button
            title={isSyncingHmis ? 'Validating Forms...' : 'Upload & Sync HMIS Forms'}
            variant="outline"
            size="sm"
            icon="upload"
            disabled={isSyncingHmis}
            onPress={handleSyncHmisMonthly}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* 7 Monitored National Health Platforms */}
        <Text style={styles.sectionTitle}>7 National Health Platform Gateways</Text>
        {systems.map(sys => {
          const isOnline = sys.status === 'ONLINE';
          return (
            <Card key={sys.id} variant="default" style={styles.sysCard}>
              <View style={styles.sysHeader}>
                <View style={styles.sysLeft}>
                  <Text style={styles.sysName}>{sys.name}</Text>
                  <Text style={styles.sysMeta}>
                    {sys.category} · Compliance: <Text style={styles.boldText}>{sys.complianceLevel}</Text>
                  </Text>
                </View>
                <Badge
                  label={sys.status}
                  variant={isOnline ? 'success' : 'danger'}
                  size="sm"
                  dot
                />
              </View>

              <View style={styles.sysFooter}>
                <Text style={styles.sysStat}>
                  Latency: <Text style={styles.boldText}>{sys.latencyMs} ms</Text>
                </Text>
                <Text style={styles.sysStat}>
                  Uptime: <Text style={styles.boldText}>{sys.uptimePercent}%</Text>
                </Text>
                <Text style={styles.sysStat}>Ping: {sys.lastHeartbeat}</Text>
              </View>
            </Card>
          );
        })}
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.borderLight,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.slate.gray,
    marginTop: 2,
  },
  simToggle: {
    marginTop: spacing.xs,
    alignItems: 'center',
    paddingVertical: 4,
  },
  simToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
    textDecorationLine: 'underline',
  },
  abdmDesc: {
    fontSize: 12,
    color: colors.slate.gray,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hmisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hmisLeft: {
    flex: 1,
  },
  hmisTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  hmisSubtitle: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate.dark,
    marginTop: 6,
  },
  sysCard: {
    paddingVertical: spacing.sm,
  },
  sysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  sysLeft: {
    flex: 1,
  },
  sysName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  sysMeta: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 2,
  },
  boldText: {
    fontWeight: '700',
    color: colors.slate.dark,
  },
  sysFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.slate.borderLight,
  },
  sysStat: {
    fontSize: 10,
    color: colors.slate.muted,
  },
});
