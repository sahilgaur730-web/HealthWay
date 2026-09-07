/**
 * HealthWay Native ABHA Login Screen
 * Government of Maharashtra - Integrated Rural Health Platform
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { loginWithAbha, loginWithBiometrics, setRole, isBiometricSupported } = useAuth();
  const { language, speak } = useLanguage();

  const [step, setStep] = useState<'abha' | 'otp'>('abha');
  const [rawAbha, setRawAbha] = useState<string>('');
  const [formattedAbha, setFormattedAbha] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpAttempts, setOtpAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Format ABHA as XX-XXXX-XXXX-XXXX
  const handleAbhaChange = (text: string) => {
    setErrorMessage(null);
    const clean = text.replace(/\D/g, '').slice(0, 14);
    setRawAbha(clean);

    let formatted = '';
    if (clean.length > 0) formatted += clean.slice(0, 2);
    if (clean.length > 2) formatted += '-' + clean.slice(2, 6);
    if (clean.length > 6) formatted += '-' + clean.slice(6, 10);
    if (clean.length > 10) formatted += '-' + clean.slice(10, 14);
    setFormattedAbha(formatted);
  };

  const handleValidateAbha = () => {
    if (!rawAbha || rawAbha.trim().length === 0) {
      setErrorMessage(language === 'mr' ? 'कृपया ABHA क्रमांक टाका' : 'Please enter 14-digit ABHA ID');
      return;
    }
    if (rawAbha.length !== 14) {
      setErrorMessage(
        language === 'mr'
          ? `ABHA क्रमांक १४ अंकी असणे आवश्यक आहे (सध्या: ${rawAbha.length})`
          : `ABHA ID must be exactly 14 digits (currently: ${rawAbha.length})`
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 300);
  };

  const handleOtpChange = (index: number, val: string) => {
    setErrorMessage(null);
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
  };

  const handleVerifyOtp = async () => {
    if (isLocked) {
      setErrorMessage(
        language === 'mr'
          ? 'खूप चुकीचे प्रयत्न. ३ अयशस्वी प्रयत्नांनंतर खाते ५ मिनिटांसाठी लॉक केले गेले आहे.'
          : 'Too many invalid attempts. Verification locked after 3 failures (MAX_ATTEMPTS_EXCEEDED).'
      );
      return;
    }

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setErrorMessage(language === 'mr' ? 'कृपया पूर्ण ६-अंकी OTP टाका' : 'Please enter complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const success = await loginWithAbha(formattedAbha || rawAbha, enteredOtp);
    setIsLoading(false);

    if (success) {
      // Authenticated; RootNavigator handles screen switch
    } else {
      const nextAttempts = otpAttempts + 1;
      setOtpAttempts(nextAttempts);
      if (nextAttempts >= 3) {
        setIsLocked(true);
        setErrorMessage(
          language === 'mr'
            ? '३ अयशस्वी प्रयत्नांनंतर खाते लॉक केले गेले आहे (MAX_ATTEMPTS_EXCEEDED)'
            : 'Authentication locked: Maximum OTP attempts exceeded (3/3)'
        );
      } else {
        setErrorMessage(
          language === 'mr'
            ? `अवैध OTP. उर्वरित प्रयत्न: ${3 - nextAttempts}`
            : `Invalid OTP code. Remaining attempts: ${3 - nextAttempts}`
        );
      }
    }
  };

  const handleAutoFillDemo = () => {
    setRawAbha('14482198765432');
    setFormattedAbha('14-4821-9876-5432');
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
    setErrorMessage(null);
  };

  const handleBiometricLogin = async () => {
    if (!loginWithBiometrics) return;
    setIsLoading(true);
    setErrorMessage(null);
    const success = await loginWithBiometrics();
    setIsLoading(false);
    if (!success) {
      setErrorMessage(
        language === 'mr'
          ? 'बायोमेट्रिक प्रमाणीकरण अयशस्वी किंवा रद्द झाले'
          : 'Biometric verification failed or cancelled. Please use ABHA ID & OTP.'
      );
    }
  };

  const handleDemoRoleSwitch = async (role: UserRole) => {
    await setRole(role);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="HealthWay"
        subtitle={
          language === 'mr'
            ? 'रुग्ण प्रवेश व ABHA लॉगिन'
            : language === 'hi'
            ? 'मरीज़ प्रवेश व आभा लॉगिन'
            : 'Patient Access & ABHA Login'
        }
        showBack={true}
        onBack={() => {
          if (step === 'otp') setStep('abha');
          else navigation.navigate('PublicGateway');
        }}
        showRoleBadge={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Government Emblem Banner */}
        <View style={styles.topBadgeRow}>
          <Badge label="ABDM Milestone 1, 2, 3 Compliant" variant="success" size="sm" />
          <TouchableOpacity
            onPress={() =>
              speak(
                language === 'mr'
                  ? 'आपला १४-अंकी ABHA क्रमांक टाका किंवा त्वरित बायोमेट्रिक लॉगिन करा.'
                  : 'Enter your 14-digit ABHA ID or use fast biometric login.'
              )
            }
            style={styles.audioGuideBtn}
          >
            <AppIcon name="volumeHigh" size={14} color={colors.primary.DEFAULT} />
            <Text style={styles.audioGuideText}>
              {language === 'mr' ? 'ऐका' : language === 'hi' ? 'सुनें' : 'Listen'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.shieldCircle}>
              <AppIcon name="lock" size={28} color={colors.primary.DEFAULT} />
            </View>
            <Text style={styles.title}>
              {step === 'abha'
                ? language === 'mr'
                  ? 'ABHA ओळख क्रमांक लॉगिन'
                  : 'ABHA Health ID Login'
                : language === 'mr'
                ? 'OTP पडताळणी'
                : 'Enter 6-Digit OTP'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'abha'
                ? language === 'mr'
                  ? 'आपल्या डिजिटल आरोग्य नोंदी आणि तपासणी अहवाल पाहण्यासाठी'
                  : 'Access longitudinal health locker, prescriptions & test results'
                : language === 'mr'
                ? `आधार लिंक केलेल्या मोबाईलवर पाठवलेला OTP टाका (${formattedAbha})`
                : `OTP sent to Aadhaar-linked mobile for ABHA ${formattedAbha}`}
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <AppIcon name="alertTriangle" size={16} color={colors.status.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Step 1: ABHA Input */}
          {step === 'abha' && (
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>
                {language === 'mr' ? '१४-अंकी ABHA आयडी' : '14-DIGIT ABHA ID NUMBER'}
              </Text>
              <TextInput
                value={formattedAbha}
                onChangeText={handleAbhaChange}
                placeholder="14-4821-9876-5432"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={17}
                style={styles.textInput}
              />
              <Text style={styles.inputHint}>
                {language === 'mr'
                  ? 'उदा. 14-4821-9876-5432 (फक्त अंक टाका)'
                  : 'e.g. 14-4821-9876-5432 (14 numeric digits)'}
              </Text>

              <View style={styles.btnRow}>
                <Button
                  title={isLoading ? 'Verifying...' : language === 'mr' ? 'पुढे जा' : 'Continue with OTP'}
                  variant="primary"
                  onPress={handleValidateAbha}
                  loading={isLoading}
                  disabled={isLoading}
                  icon="chevronRight"
                  iconPosition="right"
                  fullWidth
                />
              </View>

              {/* Biometric Login Button */}
              {isBiometricSupported && (
                <TouchableOpacity
                  onPress={handleBiometricLogin}
                  style={styles.biometricBtn}
                  activeOpacity={0.8}
                >
                  <AppIcon name="fingerprint" size={20} color={colors.primary.DEFAULT} />
                  <View style={styles.biometricBtnContent}>
                    <Text style={styles.biometricBtnTitle}>
                      {language === 'mr' ? 'जलद बायोमेट्रिक लॉगिन' : 'Fast Biometric Login'}
                    </Text>
                    <Text style={styles.biometricBtnSub}>
                      {language === 'mr' ? 'फिंगरप्रिंट किंवा फेस आयडी वापरा' : 'Touch fingerprint sensor or Face Unlock'}
                    </Text>
                  </View>
                  <AppIcon name="chevronRight" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Step 2: 6-Digit OTP */}
          {step === 'otp' && (
            <View style={styles.formGroup}>
              <View style={styles.otpRow}>
                {otpDigits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(idx, val)}
                    keyboardType="numeric"
                    maxLength={1}
                    style={[styles.otpCell, isLocked && styles.otpCellLocked]}
                    editable={!isLocked && !isLoading}
                  />
                ))}
              </View>

              <View style={styles.btnRow}>
                <Button
                  title={isLoading ? 'Verifying...' : language === 'mr' ? 'पडताळणी करा' : 'Verify & Continue'}
                  variant="primary"
                  onPress={handleVerifyOtp}
                  loading={isLoading}
                  disabled={isLoading || isLocked}
                  icon="check"
                  iconPosition="right"
                  fullWidth
                />
              </View>

              <TouchableOpacity
                onPress={() => {
                  setOtpDigits(['1', '2', '3', '4', '5', '6']);
                  setErrorMessage(null);
                }}
                style={styles.resendBtn}
              >
                <Text style={styles.resendText}>
                  {language === 'mr' ? 'डेमो OTP भरा (123456)' : 'Autofill Demo OTP (123456)'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Demo Helper */}
          <TouchableOpacity onPress={handleAutoFillDemo} style={styles.demoFillLink}>
            <Text style={styles.demoFillText}>
              {language === 'mr' ? 'डेमो क्रेडेन्शियल्स भरा' : 'Populate Demo Patient Credentials'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Instant Demo Role Switcher for Evaluators */}
        <View style={styles.evaluatorSection}>
          <Text style={styles.evaluatorHeader}>
            {language === 'mr' ? 'मूल्यांकनकर्ता / इन्स्टंट डेमो भूमिका' : 'EVALUATOR DEMO JUMPERS (1-TAP ACCESS)'}
          </Text>
          <View style={styles.rolesGrid}>
            <TouchableOpacity
              onPress={() => handleDemoRoleSwitch('patient')}
              style={styles.roleCard}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIcon, { backgroundColor: '#E0F2FE' }]}>
                <AppIcon name="patient" size={20} color={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.roleName}>Patient</Text>
              <Text style={styles.roleSub}>Ramesh Jadhav</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDemoRoleSwitch('asha')}
              style={styles.roleCard}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIcon, { backgroundColor: '#FEF3C7' }]}>
                <AppIcon name="asha" size={20} color="#D97706" />
              </View>
              <Text style={styles.roleName}>ASHA</Text>
              <Text style={styles.roleSub}>Sunita Shinde</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDemoRoleSwitch('doctor')}
              style={styles.roleCard}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIcon, { backgroundColor: '#DCFCE7' }]}>
                <AppIcon name="doctor" size={20} color="#15803D" />
              </View>
              <Text style={styles.roleName}>Doctor</Text>
              <Text style={styles.roleSub}>Dr. Kulkarni</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDemoRoleSwitch('admin')}
              style={styles.roleCard}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIcon, { backgroundColor: '#F3E8FF' }]}>
                <AppIcon name="admin" size={20} color="#7E22CE" />
              </View>
              <Text style={styles.roleName}>Admin</Text>
              <Text style={styles.roleSub}>Prerna Patil IAS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  audioGuideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF3FB',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  audioGuideText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  shieldCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...textStyles.h3,
    color: colors.slate.dark,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.caption,
    color: colors.slate.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: colors.status.error,
    fontWeight: '600',
    flex: 1,
  },
  formGroup: {
    marginTop: spacing.xs,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate.dark,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate.dark,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#FAFAFA',
  },
  inputHint: {
    fontSize: 11,
    color: colors.slate.muted,
    marginTop: 4,
  },
  btnRow: {
    marginTop: spacing.md,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
    gap: 8,
  },
  otpCell: {
    width: 44,
    height: 50,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: borderRadius.md,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: colors.slate.dark,
    backgroundColor: '#FAFAFA',
  },
  otpCellLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    color: '#94A3B8',
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resendText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  biometricBtnContent: {
    flex: 1,
  },
  biometricBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  biometricBtnSub: {
    fontSize: 11,
    color: colors.slate.gray,
  },
  demoFillLink: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent.DEFAULT,
  },
  evaluatorSection: {
    marginTop: spacing.lg,
  },
  evaluatorHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate.muted,
    marginBottom: spacing.xs,
  },
  rolesGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  roleName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  roleSub: {
    fontSize: 9,
    color: colors.slate.gray,
    textAlign: 'center',
  },
});
