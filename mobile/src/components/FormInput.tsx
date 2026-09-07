/**
 * HealthWay Form Input Field
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { AppIcon, AppIconName } from '../theme/icons';

export interface FormInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  icon?: AppIconName;
  rightIcon?: AppIconName;
  onRightIconPress?: () => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  icon,
  rightIcon,
  onRightIconPress,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  required = false,
  editable = true,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const hasError = !!error;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
          multiline && { minHeight: numberOfLines * 24 + 20, alignItems: 'flex-start' },
        ]}
      >
        {icon && (
          <View style={styles.leftIcon}>
            <AppIcon
              name={icon}
              size={18}
              color={isFocused ? colors.primary.DEFAULT : colors.slate.muted}
            />
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.slate.muted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && { textAlignVertical: 'top' },
          ]}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
          >
            <AppIcon
              name={isPasswordVisible ? 'eyeOff' : 'eye'}
              size={18}
              color={colors.slate.gray}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIcon}
          >
            <AppIcon name={rightIcon} size={18} color={colors.slate.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate.dark,
  },
  requiredAsterisk: {
    color: colors.status.error,
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate.surface,
    borderWidth: 1.5,
    borderColor: colors.slate.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  inputFocused: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: '#FAFBFD',
  },
  inputError: {
    borderColor: colors.status.error,
  },
  inputDisabled: {
    backgroundColor: colors.slate.surfaceSubtle,
    borderColor: colors.slate.borderLight,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.slate.dark,
    paddingVertical: 10,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorText: {
    fontSize: 11,
    color: colors.status.error,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 4,
  },
});
