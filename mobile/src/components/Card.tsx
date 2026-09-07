/**
 * HealthWay Standard Surface Card Component
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { shadows, borderRadius, spacing } from '../theme/spacing';
import { AppIcon, AppIconName } from '../theme/icons';

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'accent' | 'danger' | 'warning' | 'success';
  title?: string;
  subtitle?: string;
  icon?: AppIconName;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  title,
  subtitle,
  icon,
  rightElement,
  onPress,
  padding = spacing.md,
  style,
  children,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return { ...shadows.md, backgroundColor: colors.slate.surface, borderWidth: 0 };
      case 'outlined':
        return { borderWidth: 1.5, borderColor: colors.primary.DEFAULT, backgroundColor: colors.slate.surface };
      case 'accent':
        return { borderLeftWidth: 4, borderLeftColor: colors.accent.DEFAULT, backgroundColor: colors.slate.surface };
      case 'danger':
        return { borderLeftWidth: 4, borderLeftColor: colors.status.error, backgroundColor: colors.status.errorBg };
      case 'warning':
        return { borderLeftWidth: 4, borderLeftColor: colors.status.warning, backgroundColor: colors.status.warningBg };
      case 'success':
        return { borderLeftWidth: 4, borderLeftColor: colors.status.success, backgroundColor: colors.status.successBg };
      default:
        return { borderWidth: 1, borderColor: colors.slate.border, backgroundColor: colors.slate.surface, ...shadows.sm };
    }
  };

  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      style={[styles.base, getVariantStyle(), { padding }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {(title || subtitle || icon || rightElement) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {icon && (
              <View style={styles.iconWrap}>
                <AppIcon name={icon} size={20} color={colors.primary.DEFAULT} />
              </View>
            )}
            <View style={styles.textWrap}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {rightElement && <View style={styles.headerRight}>{rightElement}</View>}
        </View>
      )}
      {children}
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    marginVertical: spacing.xs + 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    marginRight: spacing.sm,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  subtitle: {
    fontSize: 12,
    color: colors.slate.gray,
    marginTop: 2,
  },
  headerRight: {
    marginLeft: spacing.sm,
  },
});
