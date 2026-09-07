/**
 * HealthWay High-Contrast Button Component
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { AppIcon, AppIconName } from '../theme/icons';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: AppIconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getContainerStyles = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      alignSelf: fullWidth ? 'stretch' : 'auto',
    };

    // Size
    switch (size) {
      case 'sm':
        base.paddingVertical = 8;
        base.paddingHorizontal = spacing.md;
        base.minHeight = 36;
        break;
      case 'lg':
        base.paddingVertical = 14;
        base.paddingHorizontal = spacing.xl;
        base.minHeight = 52;
        break;
      default:
        base.paddingVertical = 11;
        base.paddingHorizontal = spacing.lg;
        base.minHeight = 44;
        break;
    }

    // Variant
    switch (variant) {
      case 'accent':
        base.backgroundColor = colors.accent.DEFAULT;
        break;
      case 'secondary':
        base.backgroundColor = colors.slate.surfaceSubtle;
        base.borderWidth = 1;
        base.borderColor = colors.slate.border;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = colors.primary.DEFAULT;
        break;
      case 'danger':
        base.backgroundColor = colors.status.error;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      default:
        base.backgroundColor = colors.primary.DEFAULT;
        break;
    }

    if (variant === 'primary' || variant === 'accent' || variant === 'danger') {
      Object.assign(base, shadows.sm);
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextColor = (): string => {
    if (disabled) return colors.slate.muted;
    switch (variant) {
      case 'secondary':
        return colors.slate.dark;
      case 'outline':
      case 'ghost':
        return colors.primary.DEFAULT;
      default:
        return colors.white;
    }
  };

  const textColor = getTextColor();
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[getContainerStyles(), style]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.innerContent}>
          {icon && iconPosition === 'left' && (
            <View style={{ marginRight: spacing.xs + 2 }}>
              <AppIcon name={icon} size={iconSize} color={textColor} />
            </View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={{ marginLeft: spacing.xs + 2 }}>
              <AppIcon name={icon} size={iconSize} color={textColor} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
