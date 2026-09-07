/**
 * HealthWay Accessible Modal Sheet Component
 */
import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { borderRadius, spacing, shadows } from '../theme/spacing';
import { AppIcon } from '../theme/icons';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  dismissable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  dismissable = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (dismissable) onClose();
      }}
    >
      <TouchableWithoutFeedback onPress={() => dismissable && onClose()}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.sheetContainer,
                  { paddingBottom: Math.max(insets.bottom, spacing.md) },
                ]}
              >
                {/* Drag / Indicator Pill */}
                <View style={styles.handleWrap}>
                  <View style={styles.handle} />
                </View>

                {/* Header */}
                {(title || dismissable) && (
                  <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    {dismissable && (
                      <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Close dialog"
                      >
                        <AppIcon name="close" size={20} color={colors.slate.gray} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Body */}
                <View style={styles.body}>{children}</View>

                {/* Optional Footer */}
                {footer && <View style={styles.footer}>{footer}</View>}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 37, 69, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  sheetContainer: {
    backgroundColor: colors.slate.surface,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...shadows.xl,
    maxHeight: '90%',
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.slate.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate.dark,
    flex: 1,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  body: {
    paddingVertical: spacing.md,
  },
  footer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.slate.borderLight,
  },
});
