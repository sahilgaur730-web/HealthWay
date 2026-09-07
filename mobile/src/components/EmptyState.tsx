/**
 * HealthWay Empty State Placeholder Component
 */
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { AppIcon, AppIconName } from '../theme/icons';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: AppIconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'records',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <AppIcon name={icon} size={36} color={colors.primary.DEFAULT} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <View style={styles.actionWrap}>
          <Button title={actionLabel} onPress={onAction} variant="primary" size="sm" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.slate.dark,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: colors.slate.gray,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  actionWrap: {
    marginTop: spacing.lg,
  },
});
