/**
 * HealthWay Institutional Navigation Header
 * Government of Maharashtra - Integrated Rural Health Platform
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, UserRole } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import { AppIcon } from '../theme/icons';
import { spacing, borderRadius } from '../theme/spacing';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showRoleBadge?: boolean;
  showLangSwitch?: boolean;
  showSosButton?: boolean;
  showSOS?: boolean;
  onSosPress?: () => void;
  onRoleBadgePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'HealthWay',
  subtitle,
  showBack = false,
  onBack,
  showRoleBadge = true,
  showLangSwitch = true,
  showSosButton = true,
  showSOS,
  onSosPress,
  onRoleBadgePress,
}) => {
  const isSosVisible = showSOS !== undefined ? showSOS : showSosButton;
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { language, setLanguage } = useLanguage();

  const roleLabelMap: Record<UserRole, { en: string; mr: string; hi: string }> = {
    patient: { en: 'Patient', mr: 'रुग्ण', hi: 'मरीज़' },
    asha: { en: 'ASHA', mr: 'आशा', hi: 'आशा' },
    doctor: { en: 'Doctor', mr: 'डॉक्टर', hi: 'डॉक्टर' },
    admin: { en: 'Admin', mr: 'प्रशासन', hi: 'प्रशासन' },
  };

  const roleColors: Record<UserRole, string> = {
    patient: colors.role.patient,
    asha: colors.role.asha,
    doctor: colors.role.doctor,
    admin: colors.role.admin,
  };

  const cycleLanguage = () => {
    if (language === 'mr') setLanguage('hi');
    else if (language === 'hi') setLanguage('en');
    else setLanguage('mr');
  };

  const activeRoleColor = roleColors[session.role] || colors.primary.DEFAULT;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.contentRow}>
        {/* Left: Back button or Government Emblem */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBack}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <AppIcon name="arrowLeft" size={22} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={styles.emblemBadge}>
              <Text style={styles.emblemText}>MH</Text>
            </View>
          )}

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {subtitle || (language === 'mr' ? 'महाराष्ट्र शासन · आरोग्य विभाग' : language === 'hi' ? 'महाराष्ट्र शासन · स्वास्थ्य विभाग' : 'Govt of Maharashtra · Health Dept')}
            </Text>
          </View>
        </View>

        {/* Right: Actions */}
        <View style={styles.rightSection}>
          {/* Emergency SOS Button */}
          {isSosVisible && (
            <TouchableOpacity
              onPress={onSosPress}
              style={styles.sosButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Emergency 108"
            >
              <AppIcon name="siren" size={16} color={colors.white} />
              <Text style={styles.sosText}>108</Text>
            </TouchableOpacity>
          )}

          {/* Language Switcher */}
          {showLangSwitch && (
            <TouchableOpacity
              onPress={cycleLanguage}
              style={styles.langButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Change language"
            >
              <Text style={styles.langText}>
                {language === 'mr' ? 'म' : language === 'hi' ? 'हि' : 'EN'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Role Badge */}
          {showRoleBadge && (
            <TouchableOpacity
              onPress={onRoleBadgePress}
              disabled={!onRoleBadgePress}
              style={[styles.roleBadge, { backgroundColor: activeRoleColor }]}
              activeOpacity={onRoleBadgePress ? 0.7 : 1}
            >
              <Text style={styles.roleBadgeText}>
                {roleLabelMap[session.role][language] || session.role}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.dark,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1A4B8C',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  emblemBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  emblemText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 11,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: '#90CAF9',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emergency,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  sosText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 11,
  },
  langButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: '#1E3A5F',
    borderWidth: 1,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roleBadgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
