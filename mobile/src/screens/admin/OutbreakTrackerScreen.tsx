/**
 * HealthWay Admin Outbreak Tracker & Heatmap Screen
 * Government of Maharashtra - Integrated Rural Health Platform
 * Feature 35: Outbreak Surveillance, Severity Classification & Resource Mobilization
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
import { DISTRICT_FACILITIES } from '../../data/facilitiesData';

interface OutbreakCluster {
  id: string;
  disease: 'Dengue' | 'Malaria' | 'Cholera' | 'Leptospirosis';
  taluka: string;
  casesCount: number;
  activeContainmentZone: boolean;
  lat: number;
  lng: number;
  lastUpdated: string;
}

export const OutbreakTrackerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { session } = useAuth();
  const { language } = useLanguage();

  const [clusters, setClusters] = useState<OutbreakCluster[]>([
    {
      id: 'OUT-01',
      disease: 'Dengue',
      taluka: 'Karad',
      casesCount: 28,
      activeContainmentZone: true,
      lat: 17.2885,
      lng: 74.1843,
      lastUpdated: 'Today, 09:30 AM',
    },
    {
      id: 'OUT-02',
      disease: 'Malaria',
      taluka: 'Jawali',
      casesCount: 5,
      activeContainmentZone: false,
      lat: 17.7214,
      lng: 73.8541,
      lastUpdated: 'Yesterday',
    },
    {
      id: 'OUT-03',
      disease: 'Cholera',
      taluka: 'Wai',
      casesCount: 14,
      activeContainmentZone: true,
      lat: 17.9493,
      lng: 73.8924,
      lastUpdated: '2 days ago',
    },
    {
      id: 'OUT-04',
      disease: 'Leptospirosis',
      taluka: 'Mahabaleshwar',
      casesCount: 3,
      activeContainmentZone: false,
      lat: 17.9237,
      lng: 73.6586,
      lastUpdated: '3 days ago',
    },
  ]);

  const [selectedDisease, setSelectedDisease] = useState<string>('ALL');
  const [isMobilizing, setIsMobilizing] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  // Severity classification rule: >= 50 CRITICAL_EPIDEMIC, >= 20 ALERT, else WATCH
  const getSeverity = (cases: number): 'CRITICAL_EPIDEMIC' | 'ALERT' | 'WATCH' => {
    if (cases >= 50) return 'CRITICAL_EPIDEMIC';
    if (cases >= 20) return 'ALERT';
    return 'WATCH';
  };

  const filteredClusters = clusters.filter(c =>
    selectedDisease === 'ALL' ? true : c.disease === selectedDisease
  );

  const totalCases = clusters.reduce((acc, c) => acc + c.casesCount, 0);
  const activeAlerts = clusters.filter(c => getSeverity(c.casesCount) !== 'WATCH').length;

  // Emergency containment mobilization action
  const handleMobilizeResources = async (cluster: OutbreakCluster) => {
    setIsMobilizing(true);
    try {
      const containmentPayload = {
        clusterId: cluster.id,
        taluka: cluster.taluka,
        disease: cluster.disease,
        rapidDengueKitsDispatched: 500,
        mobileFeverClinicsDeployed: 2,
        ivFluidsCases: 100,
        authorizedBy: session.user.name,
        status: 'MOBILIZED',
        timestamp: new Date().toISOString(),
      };

      await storageEngine.enqueueSync('/api/v1/containment/mobilize', 'POST', containmentPayload);

      Alert.alert(
        language === 'mr' ? 'आपत्कालीन सामग्री पाठवली!' : 'Containment Mobilized',
        language === 'mr'
          ? `${cluster.taluka} तालुक्यासाठी ५०० NS1 टेस्ट किट्स आणि २ मोबाईल क्लिनिक्स तैनात करण्यात आली.`
          : `Emergency supplies dispatched to ${cluster.taluka} Taluka:\n- 500 NS1 Rapid Test Kits\n- 2 Mobile Fever Units\n- 100 Units IV Fluids`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.warn('Failed to mobilize resources', err);
      Alert.alert('Error', 'Failed to transmit containment order.');
    } finally {
      setIsMobilizing(false);
    }
  };

  // Broadcast outbreak advisory to block ASHA workers
  const handleBroadcastAdvisory = async (cluster: OutbreakCluster) => {
    setIsBroadcasting(true);
    try {
      const advisoryPayload = {
        targetBlock: cluster.taluka,
        disease: cluster.disease,
        title: `${cluster.disease} Prevention & Surveillance Drive`,
        messageEn: `Priority vector-borne surveillance active in ${cluster.taluka}. All ASHA workers must conduct daily fever surveys.`,
        messageMr: `सर्व आशा कार्यकर्तींनी ${cluster.taluka} तालुक्यात तातडीने डास प्रतिबंधक व ताप सर्वेक्षण मोहीम राबवावी.`,
        sender: session.user.name,
        timestamp: new Date().toISOString(),
      };

      await storageEngine.enqueueSync('/api/v1/advisories/broadcast', 'POST', advisoryPayload);

      Alert.alert(
        language === 'mr' ? 'आशा कार्यकर्तींना सूचना प्रसारित!' : 'ASHA Advisory Broadcast',
        language === 'mr'
          ? `${cluster.taluka} तालुक्यातील सर्व आशा कार्यकर्तींना मोबाईल सूचना यशस्वीरीत्या पाठवण्यात आली.`
          : `Mobile alert broadcast to all 45 ASHA workers in ${cluster.taluka} block.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.warn('Broadcast failed', err);
      Alert.alert('Error', 'Failed to broadcast advisory.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Outbreak Surveillance"
        subtitle="District Epidemiological Heatmap"
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* District Epidemiology Summary Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderLeftColor: colors.status.error }]}>
            <Text style={styles.statVal}>{totalCases}</Text>
            <Text style={styles.statLabel}>Active Cases</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: colors.status.warning }]}>
            <Text style={styles.statVal}>{activeAlerts}</Text>
            <Text style={styles.statLabel}>Alert Clusters</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: colors.role.doctor }]}>
            <Text style={styles.statVal}>4</Text>
            <Text style={styles.statLabel}>Talukas Tracked</Text>
          </View>
        </View>

        {/* Disease Filter Pills */}
        <View style={styles.filterRow}>
          {['ALL', 'Dengue', 'Malaria', 'Cholera', 'Leptospirosis'].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.filterPill, selectedDisease === d && styles.filterPillActive]}
              onPress={() => setSelectedDisease(d)}
            >
              <Text
                style={[styles.filterPillText, selectedDisease === d && styles.filterPillTextActive]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Heatmap Facility GPS Geographic Coordinates */}
        <Card variant="default" title="Geographic Coordinates & Surveillance Sites" icon="admin">
          <Text style={styles.mapInfo}>
            Live GPS telemetry from 7 Block Primary Health Centers (PHCs) and Sub-District Hospitals:
          </Text>
          <View style={styles.geoList}>
            {DISTRICT_FACILITIES.slice(0, 4).map(f => (
              <View key={f.id} style={styles.geoItem}>
                <View style={styles.geoLeft}>
                  <Text style={styles.geoName}>{f.name}</Text>
                  <Text style={styles.geoCoords}>
                    Block: {f.block} · Lat: 17.6805, Lng: 74.0183
                  </Text>
                </View>
                <Badge label="MONITORED" variant="teal" size="sm" />
              </View>
            ))}
          </View>
        </Card>

        {/* Active Outbreak Clusters */}
        <Text style={styles.sectionHeader}>Active Epidemiological Clusters</Text>
        {filteredClusters.map(cluster => {
          const severity = getSeverity(cluster.casesCount);
          const isCritical = severity === 'CRITICAL_EPIDEMIC';
          const isAlert = severity === 'ALERT';

          return (
            <Card
              key={cluster.id}
              variant={isCritical ? 'accent' : 'default'}
              style={[
                styles.clusterCard,
                isCritical && styles.criticalCard,
                isAlert && styles.alertCard,
              ]}
            >
              <View style={styles.clusterHeader}>
                <View style={styles.clusterTitleRow}>
                  <Text style={styles.diseaseName}>{cluster.disease}</Text>
                  <Badge
                    label={severity}
                    variant={isCritical ? 'danger' : isAlert ? 'warning' : 'neutral'}
                    size="sm"
                  />
                </View>
                <Text style={styles.clusterMeta}>
                  Taluka: <Text style={styles.boldText}>{cluster.taluka}</Text> · {cluster.lastUpdated}
                </Text>
              </View>

              <View style={styles.casesBox}>
                <Text style={styles.casesCountText}>{cluster.casesCount}</Text>
                <Text style={styles.casesCountSub}>Confirmed Active Cases</Text>
                {cluster.activeContainmentZone && (
                  <Badge label="CONTAINMENT ZONE ACTIVE" variant="danger" size="sm" style={{ marginTop: 4 }} />
                )}
              </View>

              {/* Action Buttons for Containment & Advisory */}
              <View style={styles.clusterActions}>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() => handleMobilizeResources(cluster)}
                  disabled={isMobilizing}
                >
                  <AppIcon name="diagnostic" size={14} color={colors.white} />
                  <Text style={styles.actionBtnPrimaryText}>Mobilize Test Kits</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => handleBroadcastAdvisory(cluster)}
                  disabled={isBroadcasting}
                >
                  <AppIcon name="phoneEmergency" size={14} color={colors.primary.DEFAULT} />
                  <Text style={styles.actionBtnSecondaryText}>Broadcast to ASHA</Text>
                </TouchableOpacity>
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate.gray,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  filterPill: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.slate.borderLight,
  },
  filterPillActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate.gray,
  },
  filterPillTextActive: {
    color: colors.white,
  },
  mapInfo: {
    fontSize: 12,
    color: colors.slate.gray,
    lineHeight: 18,
    marginBottom: 8,
  },
  geoList: {
    gap: 6,
  },
  geoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.slate.borderLight,
  },
  geoLeft: {
    flex: 1,
  },
  geoName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  geoCoords: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate.dark,
    marginTop: 8,
  },
  clusterCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.slate.border,
  },
  criticalCard: {
    borderLeftColor: colors.status.error,
    backgroundColor: '#FFF1F2',
  },
  alertCard: {
    borderLeftColor: colors.status.warning,
    backgroundColor: '#FFFBEB',
  },
  clusterHeader: {
    marginBottom: 8,
  },
  clusterTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  clusterMeta: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 4,
  },
  boldText: {
    fontWeight: '700',
    color: colors.slate.dark,
  },
  casesBox: {
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginVertical: 6,
  },
  casesCountText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.status.error,
  },
  casesCountSub: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate.gray,
  },
  clusterActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 6,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: 9,
    borderRadius: borderRadius.sm,
  },
  actionBtnPrimaryText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
    paddingVertical: 9,
    borderRadius: borderRadius.sm,
  },
  actionBtnSecondaryText: {
    color: colors.primary.DEFAULT,
    fontSize: 11,
    fontWeight: '700',
  },
});
