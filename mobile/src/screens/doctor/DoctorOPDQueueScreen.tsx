/**
 * Doctor OPD Queue & Clinical Dashboard Launchpad Screen
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

export const DoctorOPDQueueScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { session } = useAuth();
  const { language } = useLanguage();

  const doctorName = session.user.name || 'Dr. Anand S. Kulkarni, MD';
  const hospital = session.user.facilityName || 'Rural Hospital Karjat';

  const hubLaunchers = [
    {
      route: 'DoctorTeleconsultRoom',
      titleEn: 'Video Teleconsultation Room',
      titleMr: 'व्हिडिओ टेलीकन्सल्टेशन कक्ष',
      descEn: 'Live HD video, patient history drawer & camera controls',
      descMr: 'थेट व्हिडिओ कॉल, रुग्ण इतिहास व कॅमेरा नियंत्रणे',
      icon: 'video',
      color: '#0D9488',
      bg: '#CCFBF1',
    },
    {
      route: 'DigitalRx',
      titleEn: 'Digital Rx & Clinical Notes',
      titleMr: 'डिजिटल प्रिस्क्रिप्शन व नोंदी',
      descEn: 'FHIR R4 compliant prescription writer & lab test orders',
      descMr: 'एमआयसीआय नोंदणीकृत डिजिटल प्रिस्क्रिप्शन व तपासण्या',
      icon: 'success',
      color: colors.primary.DEFAULT,
      bg: '#DBEAFE',
    },
    {
      route: 'QueueHub',
      titleEn: 'Live OPD Queue Management',
      titleMr: 'थेट ओपीडी रांग व्यवस्थापन',
      descEn: 'Priority tokens, triage ordering & patient calling',
      descMr: 'प्राधान्य टोकन, ट्रायज क्रमवारी व रुग्ण कॉलिंग',
      icon: 'queue',
      color: colors.primary.DEFAULT,
      bg: '#E0F2FE',
    },
    {
      route: 'QueueTV',
      titleEn: 'Waiting Room TV Kiosk',
      titleMr: 'प्रतिक्षा कक्ष टीव्ही डिस्प्ले',
      descEn: 'High-contrast display & trilingual voice chime',
      descMr: 'हाय-कॉन्ट्रास्ट स्क्रीन व ध्वनी घोषणा प्रणाली',
      icon: 'queue',
      color: '#0284C7',
      bg: '#E0F2FE',
    },
    {
      route: 'DiagnosticsHub',
      titleEn: 'Diagnostic Investigations',
      titleMr: 'प्रयोगशाळा तपासण्या व अहवाल',
      descEn: 'Order tests, sample tracking & critical alerts',
      descMr: 'चाचण्या नोंदणी, नमुना ट्रॅकिंग व अहवाल',
      icon: 'diagnostic',
      color: '#7B1FA2',
      bg: '#F3E8FF',
    },
    {
      route: 'ReferralsHub',
      titleEn: 'Inter-Facility Referrals',
      titleMr: 'आंतर-रुग्णालय संदर्भ सेवा',
      descEn: 'Specialist escalation & closed-loop feedback',
      descMr: 'तज्ञ डॉक्टरांकडे संदर्भ व डिस्चार्ज अभिप्राय',
      icon: 'referral',
      color: colors.status.error,
      bg: '#FEE2E2',
    },
    {
      route: 'MedicineHub',
      titleEn: 'Hospital EDL Inventory',
      titleMr: 'औषध सूची व साठा तपासणी',
      descEn: 'Check formulary stock & generic substitutes',
      descMr: 'औषध साठा तपासणी व जेनेरिक पर्याय',
      icon: 'medicine',
      color: '#15803D',
      bg: '#DCFCE7',
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="HealthWay"
        subtitle={language === 'mr' ? 'वैद्यकीय अधिकारी डॅशबोर्ड' : 'Doctor OPD & Teleconsultation'}
        showBack={false}
        showSosButton={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Doctor Identity Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.avatarCircle, { backgroundColor: '#DCFCE7' }]}>
              <AppIcon name="doctor" size={28} color="#15803D" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.doctorNameText}>{doctorName}</Text>
              <Text style={styles.hospitalText}>{hospital}</Text>
              <View style={styles.profileBadges}>
                <Badge label="MMC Registered" variant="success" size="sm" />
                <Badge label="OPD Room 2" variant="neutral" size="sm" />
              </View>
            </View>
          </View>
        </Card>

        {/* Section Header */}
        <Text style={styles.sectionHeader}>
          {language === 'mr' ? 'क्लिनिकल कार्यप्रणाली केंद्रे' : 'CLINICAL OPERATIONAL HUBS'}
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
  doctorNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  hospitalText: {
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
