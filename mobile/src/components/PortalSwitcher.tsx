/**
 * PortalSwitcher Banner Component
 * Allows instant role toggling & network status inspection across the 4 portals.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth, UserRole } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import { AppIcon } from '../theme/icons';
import { spacing, borderRadius } from '../theme/spacing';

export interface PortalSwitcherProps {
  isOnline?: boolean;
  onToggleOnline?: () => void;
  onRoleSelected?: (role: UserRole) => void;
}

export const PortalSwitcher: React.FC<PortalSwitcherProps> = ({
  isOnline = true,
  onToggleOnline,
  onRoleSelected,
}) => {
  const { session, setRole } = useAuth();
  const { language } = useLanguage();

  const roles: { id: UserRole; labelEn: string; labelMr: string; labelHi: string; icon: any }[] = [
    { id: 'patient', labelEn: 'Patient', labelMr: 'रुग्ण', labelHi: 'मरीज़', icon: 'patient' },
    { id: 'asha', labelEn: 'ASHA', labelMr: 'आशा', labelHi: 'आशा', icon: 'asha' },
    { id: 'doctor', labelEn: 'Doctor', labelMr: 'डॉक्टर', labelHi: 'डॉक्टर', icon: 'doctor' },
    { id: 'admin', labelEn: 'Admin', labelMr: 'प्रशासन', labelHi: 'प्रशासन', icon: 'admin' },
  ];

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    if (onRoleSelected) onRoleSelected(role);
  };

  return (
    <View style={styles.container}>
      {/* Network Status Indicator */}
      <TouchableOpacity
        onPress={onToggleOnline}
        style={[styles.networkBadge, isOnline ? styles.networkOnline : styles.networkOffline]}
        activeOpacity={0.7}
      >
        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#F59E0B' }]} />
        <AppIcon name={isOnline ? 'wifi' : 'wifiOff'} size={12} color={isOnline ? '#34D399' : '#FCD34D'} />
        <Text style={[styles.networkText, { color: isOnline ? '#34D399' : '#FCD34D' }]}>
          {isOnline
            ? (language === 'mr' ? 'ऑनलाइन' : language === 'hi' ? 'ऑनलाइन' : 'Online')
            : (language === 'mr' ? 'ऑफलाइन' : language === 'hi' ? 'ऑफलाइन' : 'Offline')}
        </Text>
      </TouchableOpacity>

      {/* 4-Role Segmented Switcher */}
      <View style={styles.rolesRow}>
        {roles.map(r => {
          const isActive = session.role === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              onPress={() => handleSelectRole(r.id)}
              style={[
                styles.rolePill,
                isActive && styles.rolePillActive,
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.roleText,
                  isActive && styles.roleTextActive,
                ]}
              >
                {language === 'mr' ? r.labelMr : language === 'hi' ? r.labelHi : r.labelEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#071A2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#102A45',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  networkOnline: {
    backgroundColor: 'rgba(6, 78, 59, 0.4)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  networkOffline: {
    backgroundColor: 'rgba(120, 53, 15, 0.4)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  networkText: {
    fontSize: 10,
    fontWeight: '700',
  },
  rolesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rolePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  rolePillActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  roleText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  roleTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
});
