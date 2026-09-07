/**
 * HealthWay Status & Urgency Badge Component
 */
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius } from '../theme/spacing';
import { AppIcon, AppIconName } from '../theme/icons';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple' | 'teal' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
  icon?: AppIconName;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
  dot = false,
  style,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primary.light, text: colors.primary.DEFAULT, border: '#BFDBFE' };
      case 'accent':
        return { bg: colors.accent.light, text: colors.accent.dark, border: '#FED7AA' };
      case 'success':
        return { bg: colors.status.successBg, text: colors.status.success, border: colors.status.successBorder };
      case 'warning':
        return { bg: colors.status.warningBg, text: colors.status.warning, border: colors.status.warningBorder };
      case 'danger':
        return { bg: colors.status.errorBg, text: colors.status.error, border: colors.status.errorBorder };
      case 'purple':
        return { bg: colors.role.ashaBg, text: colors.role.asha, border: '#E9D5FF' };
      case 'teal':
        return { bg: colors.role.doctorBg, text: colors.role.doctor, border: '#99F6E4' };
      case 'secondary':
      case 'outline':
      default:
        return { bg: colors.slate.surfaceSubtle, text: colors.slate.gray, border: colors.slate.border };
    }
  };

  const scheme = getBadgeColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10,
        },
        style,
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: scheme.text }]} />}
      {icon && (
        <View style={{ marginRight: 4 }}>
          <AppIcon name={icon} size={isSmall ? 12 : 14} color={scheme.text} />
        </View>
      )}
      <Text style={[styles.text, { color: scheme.text, fontSize: isSmall ? 11 : 12 }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
