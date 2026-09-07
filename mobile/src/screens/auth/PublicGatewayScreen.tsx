/**
 * Public Gateway Screen
 * Direct mirror of HealthWay Web Landing Page with trilingual guidance & SOS
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';

export const PublicGatewayScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { language, speak } = useLanguage();

  return (
    <View style={styles.container}>
      <Header
        title="HealthWay"
        subtitle={
          language === 'mr'
            ? 'महाराष्ट्र शासन · आरोग्य विभाग'
            : language === 'hi'
            ? 'महाराष्ट्र शासन · स्वास्थ्य विभाग'
            : 'Govt of Maharashtra · Health Dept'
        }
        showBack={false}
        showRoleBadge={false}
        showSosButton={true}
        onSosPress={() => navigation.navigate('EmergencySOS')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={styles.heroSection}>
          <View style={styles.badgeRow}>
            <View style={styles.govPill}>
              <Text style={styles.govPillText}>NHM · ABDM CERTIFIED</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                speak(
                  language === 'mr'
                    ? 'आरोग्यसेतू प्रणालीमध्ये आपले स्वागत आहे. उपकेंद्रापासून जिल्हा रुग्णालयापर्यंत अखंड आरोग्य सेवा.'
                    : 'Welcome to HealthWay. Seamless healthcare from Sub-Center to District Hospital.'
                )
              }
              style={styles.listenBtn}
            >
              <AppIcon name="volumeHigh" size={14} color="#93C5FD" />
              <Text style={styles.listenText}>
                {language === 'mr' ? 'माहिती ऐका' : 'Listen'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>
            {language === 'mr' ? (
              'आपल्या आरोग्यासाठी —\nएक अखंड डिजिटल सेतू'
            ) : language === 'hi' ? (
              'आपके स्वास्थ्य के लिए —\nएक अखंड डिजिटल सेतु'
            ) : (
              'Integrated Rural Health.\nConnected. Anywhere.'
            )}
          </Text>

          <Text style={styles.heroSub}>
            {language === 'mr'
              ? 'गावागावात तज्ञ डॉक्टरांचा सल्ला, डिजिटल ABHA नोंदी आणि जीवनरक्षक १०८ रुग्णवाहिका.'
              : 'ASHA-assisted teleconsultation, ABHA health records & 108 emergency escalation for rural Maharashtra.'}
          </Text>

          {/* Action CTAs */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.primaryCta}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>
                {language === 'mr' ? 'रुग्ण ABHA लॉगिन' : 'Patient ABHA Login'}
              </Text>
              <AppIcon name="chevronRight" size={16} color={colors.primary.DEFAULT} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('EmergencySOS')}
              style={styles.emergencyCta}
              activeOpacity={0.85}
            >
              <AppIcon name="phoneEmergency" size={16} color={colors.white} />
              <Text style={styles.emergencyCtaText}>108 SOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 District Live KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiNumber}>36</Text>
            <Text style={styles.kpiLabel}>
              {language === 'mr' ? 'कार्यरत PHC' : 'Active PHCs'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={[styles.kpiNumber, { color: colors.accent.DEFAULT }]}>847</Text>
            <Text style={styles.kpiLabel}>
              {language === 'mr' ? 'आरोग्य केंद्रे' : 'Total Facilities'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={[styles.kpiNumber, { color: colors.status.success }]}>142K+</Text>
            <Text style={styles.kpiLabel}>
              {language === 'mr' ? 'ABHA नागरिक' : 'ABHA Citizens'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={[styles.kpiNumber, { color: colors.status.warning }]}>24/7</Text>
            <Text style={styles.kpiLabel}>
              {language === 'mr' ? '१०८ नियंत्रण' : '108 Dispatch'}
            </Text>
          </View>
        </View>

        {/* Role Selector Card */}
        <Card variant="elevated" style={styles.rolePortalCard}>
          <View style={styles.rolePortalHeader}>
            <Text style={styles.cardSectionTitle}>
              {language === 'mr' ? 'संस्थात्मक कर्मचारी प्रवेश' : 'INSTITUTIONAL STAFF ACCESS'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RoleSelect')}>
              <Text style={styles.viewAllText}>
                {language === 'mr' ? 'सर्व भूमिका पहा' : 'View All Roles →'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('RoleSelect')}
            style={styles.roleQuickRow}
            activeOpacity={0.8}
          >
            <View style={styles.roleMiniPill}>
              <AppIcon name="asha" size={16} color="#D97706" />
              <Text style={styles.roleMiniText}>ASHA</Text>
            </View>
            <View style={styles.roleMiniPill}>
              <AppIcon name="doctor" size={16} color="#15803D" />
              <Text style={styles.roleMiniText}>Doctor</Text>
            </View>
            <View style={styles.roleMiniPill}>
              <AppIcon name="admin" size={16} color="#7E22CE" />
              <Text style={styles.roleMiniText}>Admin</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Emergency Contacts Card */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <AppIcon name="alertTriangle" size={18} color={colors.status.error} />
            <Text style={styles.emergencyTitle}>
              {language === 'mr' ? '२४/७ राष्ट्रीय व राज्य आपत्कालीन संपर्क' : '24/7 Emergency Helplines'}
            </Text>
          </View>
          <View style={styles.helplineGrid}>
            <View style={styles.helplineItem}>
              <Text style={styles.helplineNum}>108</Text>
              <Text style={styles.helplineName}>Ambulance</Text>
            </View>
            <View style={styles.helplineItem}>
              <Text style={styles.helplineNum}>102</Text>
              <Text style={styles.helplineName}>Janani Shishu</Text>
            </View>
            <View style={styles.helplineItem}>
              <Text style={styles.helplineNum}>104</Text>
              <Text style={styles.helplineName}>Health Advice</Text>
            </View>
            <View style={styles.helplineItem}>
              <Text style={styles.helplineNum}>1091</Text>
              <Text style={styles.helplineName}>Women Help</Text>
            </View>
          </View>
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
    paddingBottom: spacing.xl,
  },
  heroSection: {
    backgroundColor: '#0E356A',
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: colors.accent.DEFAULT,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  govPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  govPillText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  listenText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    lineHeight: 28,
  },
  heroSub: {
    fontSize: 12,
    color: '#BFDBFE',
    marginTop: 6,
    lineHeight: 18,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryCta: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryCtaText: {
    color: colors.primary.DEFAULT,
    fontSize: 13,
    fontWeight: '800',
  },
  emergencyCta: {
    backgroundColor: colors.status.error,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emergencyCtaText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  kpiGrid: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.xs,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary.DEFAULT,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.slate.gray,
    marginTop: 2,
    textAlign: 'center',
  },
  rolePortalCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  rolePortalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate.muted,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  roleQuickRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  roleMiniPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  roleMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  emergencyCard: {
    margin: spacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
  },
  helplineGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helplineItem: {
    alignItems: 'center',
  },
  helplineNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#B91C1C',
  },
  helplineName: {
    fontSize: 10,
    color: '#7F1D1D',
    fontWeight: '600',
  },
});
