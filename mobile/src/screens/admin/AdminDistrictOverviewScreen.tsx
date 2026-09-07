/**
 * District Administration Overview Launchpad Screen
 * Government of Maharashtra - Integrated Rural Health Platform
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AdminDistrictOverviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { session } = useAuth();
  const { language } = useLanguage();

  const adminName = session.user.name || 'Smt. Prerna Patil, IAS';
  const office = session.user.facilityName || 'District Health Office Raigad';

  const hubLaunchers = [
    {
      route: 'OutbreakTracker',
      titleEn: 'Epidemic Outbreak Surveillance',
      titleMr: 'साथीचे रोग उद्रेक देखरेख',
      descEn: 'Dengue & Malaria cluster alerts, containment & ASHA advisory',
      descMr: 'डेंग्यू, हिवताप उद्रेक सूचना, नियंत्रण व आशा संदेश',
      icon: 'phoneEmergency',
      color: colors.status.error,
      bg: '#FEE2E2',
    },
    {
      route: 'NationalInterop',
      titleEn: 'National Health Interop (ABDM/HMIS)',
      titleMr: 'राष्ट्रीय आरोग्य एकात्मता (ABDM/HMIS)',
      descEn: '7 federal health gateways, M1/M2/M3 compliance & monthly forms',
      descMr: '७ राष्ट्रीय प्रणाली, आभा प्रमाणपत्र व मासिक HMIS अहवाल',
      icon: 'admin',
      color: colors.primary.DEFAULT,
      bg: '#E0F2FE',
    },
    {
      route: 'ReferralsHub',
      titleEn: 'District Referral SLA Pipeline',
      titleMr: 'जिल्हा संदर्भ सेवा व SLA ट्रॅकर',
      descEn: '7-Stage inter-facility tracking & overdue alerts',
      descMr: '७-टप्प्यांची संदर्भ सेवा, SLA ट्रॅकिंग व वेळेची देखरेख',
      icon: 'referral',
      color: '#7B1FA2',
      bg: '#F3E8FF',
    },
    {
      route: 'DiagnosticsHub',
      titleEn: 'District Diagnostic Facilities',
      titleMr: 'जिल्हा प्रयोगशाळा नेटवर्क',
      descEn: '48 Tests catalog, sample tracker & lab telemetry',
      descMr: '४८ तपासण्या सूची, नमुना ट्रॅकिंग व प्रयोगशाळा स्थिती',
      icon: 'diagnostic',
      color: colors.primary.DEFAULT,
      bg: '#E0F2FE',
    },
    {
      route: 'MedicineHub',
      titleEn: 'Warehouse Drug Supply & Indents',
      titleMr: 'गोदाम औषध साठा व मागणी',
      descEn: 'Buffer stock monitoring & auto-indent requisitions',
      descMr: 'बफर साठा देखरेख व स्वयंचलित पुरवठा मागणी',
      icon: 'medicine',
      color: '#15803D',
      bg: '#DCFCE7',
    },
    {
      route: 'QueueHub',
      titleEn: 'Health Center Queue Telemetry',
      titleMr: 'आरोग्य केंद्रे रांग व्यवस्थापन',
      descEn: 'Monitor outpatient waiting times across block clinics',
      descMr: 'तालुका आरोग्य केंद्रांमधील रुग्ण प्रतीक्षा वेळ देखरेख',
      icon: 'queue',
      color: colors.accent.DEFAULT,
      bg: '#FEF3C7',
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="HealthWay"
        subtitle={language === 'mr' ? 'जिल्हा आरोग्य प्रशासन' : 'District Health Administration'}
        showBack={false}
        showSosButton={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Administrator Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.avatarCircle, { backgroundColor: '#F3E8FF' }]}>
              <AppIcon name="admin" size={28} color="#7E22CE" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.adminNameText}>{adminName}</Text>
              <Text style={styles.officeText}>{office}</Text>
              <View style={styles.profileBadges}>
                <Badge label="District Executive" variant="purple" size="sm" />
                <Badge label="Satara / Raigad Circle" variant="neutral" size="sm" />
              </View>
            </View>
          </View>
        </Card>

        {/* Section Header */}
        <Text style={styles.sectionHeader}>
          {language === 'mr' ? 'प्रशासकीय नियंत्रण केंद्रे' : 'ADMINISTRATIVE CONTROL HUBS'}
        </Text>

        {/* Hub Launchers List */}
        {hubLaunchers.map((hub) => (
          <TouchableOpacity
            key={hub.route}
            onPress={() => navigation.navigate(hub.route)}
            activeOpacity={0.8}
            style={styles.hubCardWrapper}
          >
            <Card variant="elevated" style={styles.hubCard}>
              <View style={styles.hubCardContent}>
                <View style={[styles.hubIconBox, { backgroundColor: hub.bg }]}>
                  <AppIcon name={hub.icon as any} size={24} color={hub.color} />
                </View>
                <View style={styles.hubTextWrap}>
                  <Text style={styles.hubTitle}>
                    {language === 'mr' ? hub.titleMr : hub.titleEn}
                  </Text>
                  <Text style={styles.hubDesc}>
                    {language === 'mr' ? hub.descMr : hub.descEn}
                  </Text>
                </View>
                <AppIcon name="chevronRight" size={18} color="#94A3B8" />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  adminNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  officeText: {
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
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate.muted,
    marginBottom: spacing.sm,
  },
  hubCardWrapper: {
    marginBottom: spacing.sm,
  },
  hubCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  hubCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hubIconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTextWrap: {
    flex: 1,
  },
  hubTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  hubDesc: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 2,
  },
});
