/**
 * Role Selection Gateway
 * Allows direct persona activation for Patient, ASHA, Doctor, and District Admin
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';

export const RoleSelectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { setRole } = useAuth();
  const { language } = useLanguage();

  const handleSelect = async (role: UserRole) => {
    await setRole(role);
  };

  const roles = [
    {
      id: 'patient' as UserRole,
      title: 'Patient & Citizen Portal',
      titleMr: 'नागरिक व रुग्ण पोर्टल',
      desc: 'ABHA Health Locker, lab reports, doctor appointment booking & 108 SOS emergency care.',
      icon: 'patient',
      color: colors.primary.DEFAULT,
      bg: '#E0F2FE',
      profile: 'Ramesh Rao Jadhav · PHC Karjat',
    },
    {
      id: 'asha' as UserRole,
      title: 'ASHA Community Worker',
      titleMr: 'आशा कार्यकर्ती कार्यप्रणाली',
      desc: 'Doorstep maternal screening, offline beneficiary registration, voice STT intake & referral slips.',
      icon: 'asha',
      color: '#D97706',
      bg: '#FEF3C7',
      profile: 'Sunita Tai Shinde · Sub-Center Kashele',
    },
    {
      id: 'doctor' as UserRole,
      title: 'Doctor OPD & Teleconsultation',
      titleMr: 'वैद्यकीय अधिकारी टेलीकन्सल्टेशन',
      desc: 'Live outpatient queue, video teleconsultation, digital Rx generator & ABDM referrals.',
      icon: 'doctor',
      color: '#15803D',
      bg: '#DCFCE7',
      profile: 'Dr. Anand S. Kulkarni, MD · RH Karjat',
    },
    {
      id: 'admin' as UserRole,
      title: 'District Health Administration',
      titleMr: 'जिल्हा आरोग्य प्रशासन डॅशबोर्ड',
      desc: '7-Facility performance index, Dengue/Malaria outbreak clusters, warehouse drug stock & HMIS.',
      icon: 'admin',
      color: '#7E22CE',
      bg: '#F3E8FF',
      profile: 'Smt. Prerna Patil, IAS · DHO Raigad',
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="HealthWay"
        subtitle={language === 'mr' ? 'भूमिका निवडा' : 'Select Institutional Role'}
        showBack={true}
        onBack={() => navigation.navigate('PublicGateway')}
        showRoleBadge={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>
          {language === 'mr' ? 'प्रवेशासाठी आपली भूमिका निवडा' : 'SELECT YOUR OPERATIONAL PERSONA'}
        </Text>

        {roles.map((r) => (
          <TouchableOpacity
            key={r.id}
            onPress={() => handleSelect(r.id)}
            activeOpacity={0.8}
            style={styles.roleCardWrapper}
          >
            <Card variant="elevated" style={styles.roleCard}>
              <View style={styles.cardTopRow}>
                <View style={[styles.iconBox, { backgroundColor: r.bg }]}>
                  <AppIcon name={r.icon as any} size={24} color={r.color} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.roleTitle}>
                    {language === 'mr' ? r.titleMr : r.title}
                  </Text>
                  <Text style={styles.profileSnippet}>{r.profile}</Text>
                </View>
                <AppIcon name="chevronRight" size={18} color="#94A3B8" />
              </View>
              <Text style={styles.roleDesc}>{r.desc}</Text>
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
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate.muted,
    marginBottom: spacing.sm,
  },
  roleCardWrapper: {
    marginBottom: spacing.sm,
  },
  roleCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  profileSnippet: {
    fontSize: 11,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
    marginTop: 2,
  },
  roleDesc: {
    fontSize: 12,
    color: colors.slate.gray,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
});
