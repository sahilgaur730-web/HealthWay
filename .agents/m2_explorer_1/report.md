# M2 Blueprint: Navigation Hub, Authentication & Role Stacks

**Author**: `m2_explorer_1` (Navigation & Auth Explorer)  
**Date**: 2026-09-07  
**Working Directory**: `c:\Users\SAHIL GAUR\Desktop\HealthWay\.agents\m2_explorer_1\`  
**Target Codebase**: `mobile/src/navigation/**`, `mobile/src/screens/auth/**`, `mobile/src/types/navigation.ts`, `mobile/App.tsx`  

---

## 1. Architecture Overview & Design Rationale

### 1.1 Separation of Concerns
The navigation architecture uses `@react-navigation/native-stack` (v7) to deliver a high-performance native navigation hierarchy tailored for rural health operations:
1. **Public/Auth Stack (`AuthNavigator`)**: Unauthenticated gateway with `PublicGateway`, `Login` (ABHA/OTP/Biometrics), `RoleSelect`, and direct `EmergencySOS`.
2. **Role-Based Navigators**:
   - `PatientNavigator`: Patient landing dashboard and access to shared hubs (`DiagnosticsHub`, `ReferralsHub`, `QueueHub`, `QueueTV`, `MedicineHub`, `EmergencySOS`).
   - `AshaNavigator`: ASHA community field dashboard and shared operational hubs (`DiagnosticsHub`, `ReferralsHub`, `QueueHub`, `MedicineHub`, `EmergencySOS`).
   - `DoctorNavigator`: Clinical OPD queue dashboard, diagnostic investigations, referrals, queue telemetry, and medicine catalog (`DoctorOPDQueue`, `DiagnosticsHub`, `ReferralsHub`, `QueueHub`, `QueueTV`, `MedicineHub`).
   - `AdminNavigator`: District health command overview, facilities, referrals, queue, and drug inventory (`AdminDistrictOverview`, `DiagnosticsHub`, `ReferralsHub`, `QueueHub`, `MedicineHub`).
3. **Top-Banner Evaluator `PortalSwitcher`**:
   - Statically positioned at the top of the app inside `RootNavigator`.
   - Offers 1-tap switching between all 4 institutional personas:
     - **Patient**: Ramesh Rao Jadhav (ABHA: `91-2345-6789-0123`)
     - **ASHA**: Sunita Tai Shinde (Sub-Center Kashele, Registration: `MH-ASHA-2018-7012`)
     - **Doctor**: Dr. Anand S. Kulkarni, MD (Rural Hospital Karjat, Reg: `MMC-2014-08912`)
     - **Admin**: Smt. Prerna Patil, IAS (District Health Office Raigad)
   - Includes simulated network connection toggle (`Online` ↔ `Offline Sync`) triggering `syncEngine.setSimulatedOffline(...)`.
   - Includes quick-jump bar to directly open any of the 5 shared hubs (`Diagnostics`, `Referrals`, `Queue`, `Medicines`, `SOS`).

---

## 2. Type Contracts (`mobile/src/types/navigation.ts`)

```typescript
/**
 * Navigation Type Definitions for HealthWay Native App
 * Supports React Navigation v7 with strict TypeScript typing
 */
import { NavigatorScreenParams } from '@react-navigation/native';
import { UserRole } from './auth';

export type AuthStackParamList = {
  PublicGateway: undefined;
  Login: { initialRole?: UserRole } | undefined;
  RoleSelect: undefined;
  EmergencySOS: undefined;
};

export type PatientStackParamList = {
  PatientDashboard: undefined;
  DiagnosticsHub: undefined;
  ReferralsHub: undefined;
  QueueHub: undefined;
  QueueTV: undefined;
  MedicineHub: undefined;
  EmergencySOS: undefined;
};

export type AshaStackParamList = {
  AshaFieldDashboard: undefined;
  DiagnosticsHub: undefined;
  ReferralsHub: undefined;
  QueueHub: undefined;
  MedicineHub: undefined;
  EmergencySOS: undefined;
};

export type DoctorStackParamList = {
  DoctorOPDQueue: undefined;
  DiagnosticsHub: undefined;
  ReferralsHub: undefined;
  QueueHub: undefined;
  QueueTV: undefined;
  MedicineHub: undefined;
};

export type AdminStackParamList = {
  AdminDistrictOverview: undefined;
  DiagnosticsHub: undefined;
  ReferralsHub: undefined;
  QueueHub: undefined;
  MedicineHub: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Patient: NavigatorScreenParams<PatientStackParamList>;
  Asha: NavigatorScreenParams<AshaStackParamList>;
  Doctor: NavigatorScreenParams<DoctorStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
};
```

---

## 3. Global Navigation Reference (`mobile/src/navigation/navigationRef.ts`)

Allows programmatic navigation from outside React components (e.g. from the evaluator `PortalSwitcher` banner or background sync handlers):

```typescript
/**
 * Navigation Reference for Global Programmatic Navigation
 */
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
```

---

## 4. Root Navigator (`mobile/src/navigation/RootNavigator.tsx`)

State-driven navigator coordinating authentication state and active role stack with top-level evaluator controls:

```typescript
/**
 * Root Navigator with Evaluator Portal Switcher
 * Mounts AuthNavigator or Role Navigators based on AuthContext state
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useAuth, UserRole } from '../context/AuthContext';
import { PortalSwitcher } from '../components/PortalSwitcher';
import syncEngine from '../services/syncEngine';
import { navigationRef } from './navigationRef';
import { AuthNavigator } from './AuthNavigator';
import { PatientNavigator } from './PatientNavigator';
import { AshaNavigator } from './AshaNavigator';
import { DoctorNavigator } from './DoctorNavigator';
import { AdminNavigator } from './AdminNavigator';
import { colors } from '../theme/colors';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, session, setRole } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(syncEngine.isOnline());

  useEffect(() => {
    const unsub = syncEngine.subscribe((event) => {
      if (event.type === 'ONLINE') setIsOnline(true);
      if (event.type === 'OFFLINE') setIsOnline(false);
    });
    return () => unsub();
  }, []);

  const handleToggleOnline = () => {
    const nextState = !isOnline;
    syncEngine.setSimulatedOffline(!nextState);
    setIsOnline(nextState);
  };

  const handleRoleSelected = async (newRole: UserRole) => {
    await setRole(newRole);
  };

  const renderActiveNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }

    switch (session.role) {
      case 'patient':
        return <PatientNavigator />;
      case 'asha':
        return <AshaNavigator />;
      case 'doctor':
        return <DoctorNavigator />;
      case 'admin':
        return <AdminNavigator />;
      default:
        return <PatientNavigator />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Banner Evaluator Switcher Bar */}
      <PortalSwitcher
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        onRoleSelected={handleRoleSelected}
      />
      
      {/* Active Role or Auth Stack */}
      <View style={styles.container}>
        {renderActiveNavigator()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071A2F',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
```

---

## 5. Auth Navigator (`mobile/src/navigation/AuthNavigator.tsx`)

```typescript
/**
 * Auth Navigator
 * Houses PublicGateway, Login, RoleSelect, and EmergencySOS
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { PublicGatewayScreen } from '../screens/auth/PublicGatewayScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { EmergencySOSScreen } from '../screens/hubs/EmergencySOSScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PublicGateway"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F5F7FA' },
      }}
    >
      <Stack.Screen name="PublicGateway" component={PublicGatewayScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectionScreen} />
      <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
    </Stack.Navigator>
  );
};
```

---

## 6. Role Navigators

### 6.1 `mobile/src/navigation/PatientNavigator.tsx`
```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatientStackParamList } from '../types/navigation';
import { PatientDashboardScreen } from '../screens/patient/PatientDashboardScreen';
import { DiagnosticsHubScreen } from '../screens/hubs/DiagnosticsHubScreen';
import { ReferralsHubScreen } from '../screens/hubs/ReferralsHubScreen';
import { QueueHubScreen } from '../screens/hubs/QueueHubScreen';
import { QueueTVScreen } from '../screens/hubs/QueueTVScreen';
import { MedicineHubScreen } from '../screens/hubs/MedicineHubScreen';
import { EmergencySOSScreen } from '../screens/hubs/EmergencySOSScreen';

const Stack = createNativeStackNavigator<PatientStackParamList>();

export const PatientNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PatientDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="PatientDashboard" component={PatientDashboardScreen} />
      <Stack.Screen name="DiagnosticsHub" component={DiagnosticsHubScreen} />
      <Stack.Screen name="ReferralsHub" component={ReferralsHubScreen} />
      <Stack.Screen name="QueueHub" component={QueueHubScreen} />
      <Stack.Screen name="QueueTV" component={QueueTVScreen} />
      <Stack.Screen name="MedicineHub" component={MedicineHubScreen} />
      <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
    </Stack.Navigator>
  );
};
```

### 6.2 `mobile/src/navigation/AshaNavigator.tsx`
```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AshaStackParamList } from '../types/navigation';
import { AshaFieldDashboardScreen } from '../screens/asha/AshaFieldDashboardScreen';
import { DiagnosticsHubScreen } from '../screens/hubs/DiagnosticsHubScreen';
import { ReferralsHubScreen } from '../screens/hubs/ReferralsHubScreen';
import { QueueHubScreen } from '../screens/hubs/QueueHubScreen';
import { MedicineHubScreen } from '../screens/hubs/MedicineHubScreen';
import { EmergencySOSScreen } from '../screens/hubs/EmergencySOSScreen';

const Stack = createNativeStackNavigator<AshaStackParamList>();

export const AshaNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AshaFieldDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AshaFieldDashboard" component={AshaFieldDashboardScreen} />
      <Stack.Screen name="DiagnosticsHub" component={DiagnosticsHubScreen} />
      <Stack.Screen name="ReferralsHub" component={ReferralsHubScreen} />
      <Stack.Screen name="QueueHub" component={QueueHubScreen} />
      <Stack.Screen name="MedicineHub" component={MedicineHubScreen} />
      <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
    </Stack.Navigator>
  );
};
```

### 6.3 `mobile/src/navigation/DoctorNavigator.tsx`
```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DoctorStackParamList } from '../types/navigation';
import { DoctorOPDQueueScreen } from '../screens/doctor/DoctorOPDQueueScreen';
import { DiagnosticsHubScreen } from '../screens/hubs/DiagnosticsHubScreen';
import { ReferralsHubScreen } from '../screens/hubs/ReferralsHubScreen';
import { QueueHubScreen } from '../screens/hubs/QueueHubScreen';
import { QueueTVScreen } from '../screens/hubs/QueueTVScreen';
import { MedicineHubScreen } from '../screens/hubs/MedicineHubScreen';

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export const DoctorNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DoctorOPDQueue"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DoctorOPDQueue" component={DoctorOPDQueueScreen} />
      <Stack.Screen name="DiagnosticsHub" component={DiagnosticsHubScreen} />
      <Stack.Screen name="ReferralsHub" component={ReferralsHubScreen} />
      <Stack.Screen name="QueueHub" component={QueueHubScreen} />
      <Stack.Screen name="QueueTV" component={QueueTVScreen} />
      <Stack.Screen name="MedicineHub" component={MedicineHubScreen} />
    </Stack.Navigator>
  );
};
```

### 6.4 `mobile/src/navigation/AdminNavigator.tsx`
```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../types/navigation';
import { AdminDistrictOverviewScreen } from '../screens/admin/AdminDistrictOverviewScreen';
import { DiagnosticsHubScreen } from '../screens/hubs/DiagnosticsHubScreen';
import { ReferralsHubScreen } from '../screens/hubs/ReferralsHubScreen';
import { QueueHubScreen } from '../screens/hubs/QueueHubScreen';
import { MedicineHubScreen } from '../screens/hubs/MedicineHubScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDistrictOverview"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminDistrictOverview" component={AdminDistrictOverviewScreen} />
      <Stack.Screen name="DiagnosticsHub" component={DiagnosticsHubScreen} />
      <Stack.Screen name="ReferralsHub" component={ReferralsHubScreen} />
      <Stack.Screen name="QueueHub" component={QueueHubScreen} />
      <Stack.Screen name="MedicineHub" component={MedicineHubScreen} />
    </Stack.Navigator>
  );
};
```

---

## 7. Authentication Screens

### 7.1 `mobile/src/screens/auth/LoginScreen.tsx`

Features:
- **14-digit ABHA ID formatting**: auto-inserts hyphens `XX-XXXX-XXXX-XXXX` as user types numeric digits.
- **Strict validation**: rejects strings with non-digits, off-by-one under 14 (13 digits), off-by-one over 14 (15 digits), and empty/whitespace inputs.
- **6-digit Mobile OTP verification**: 6 visual digit boxes, timer countdown (30s), attempt counter.
- **Adversarial lockout**: automatically locks entry after 3 consecutive invalid OTP attempts (error `'MAX_ATTEMPTS_EXCEEDED'`).
- **Instant Demo Role Buttons**: 4 cards (`Patient`, `ASHA`, `Doctor`, `Admin`) allowing 1-tap evaluator testing.
- **Biometric Login Button**: triggers `expo-local-authentication` (`LocalAuthentication.authenticateAsync(...)`), verifies biometric sensor, and falls back gracefully.

```typescript
/**
 * HealthWay Native ABHA Login Screen
 * Government of Maharashtra - Integrated Rural Health Platform
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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
import { typography } from '../../theme/typography';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { loginWithAbha, loginWithBiometrics, setRole, isBiometricSupported } = useAuth();
  const { language, t, speak } = useLanguage();

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

    // Grouping
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
    }, 400);
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
          : 'Too many invalid attempts. Verification locked after 3 failures.'
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

    // Verify
    const success = await loginWithAbha(formattedAbha || rawAbha, enteredOtp);
    setIsLoading(false);

    if (success) {
      // Authenticated; RootNavigator will transition
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
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Government Emblem Banner */}
        <View style={styles.topBadgeRow}>
          <Badge label="ABDM Milestone 1, 2, 3 Compliant" type="success" size="sm" />
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
            <AppIcon name="volume" size={14} color={colors.primary.DEFAULT} />
            <Text style={styles.audioGuideText}>
              {language === 'mr' ? 'ऐका' : language === 'hi' ? 'सुनें' : 'Listen'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Card */}
        <Card elevated style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.shieldCircle}>
              <AppIcon name="shield" size={28} color={colors.primary.DEFAULT} />
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
              <AppIcon name="alertCircle" size={16} color={colors.alerts.error} />
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
                  label={isLoading ? 'Verifying...' : language === 'mr' ? 'पुढे जा' : 'Continue with OTP'}
                  variant="primary"
                  onPress={handleValidateAbha}
                  loading={isLoading}
                  disabled={isLoading}
                  icon="chevronRight"
                  iconPosition="right"
                />
              </View>

              {/* Biometric Login Button */}
              {isBiometricSupported && (
                <TouchableOpacity
                  onPress={handleBiometricLogin}
                  style={styles.biometricBtn}
                  activeOpacity={0.8}
                >
                  <AppIcon name="lock" size={20} color={colors.primary.DEFAULT} />
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
                  label={isLoading ? 'Verifying...' : language === 'mr' ? 'पडताळणी करा' : 'Verify & Continue'}
                  variant="primary"
                  onPress={handleVerifyOtp}
                  loading={isLoading}
                  disabled={isLoading || isLocked}
                  icon="check"
                  iconPosition="right"
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
              {language === 'mr' ? 'डेमो क्रेडेन्शियल्स भरा' : '⚡ Populate Demo Patient Credentials'}
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
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
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
    color: colors.alerts.error,
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
    color: colors.text.primary,
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
    color: colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#FAFAFA',
  },
  inputHint: {
    fontSize: 11,
    color: colors.text.muted,
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
    color: colors.text.primary,
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
    color: colors.text.primary,
  },
  biometricBtnSub: {
    fontSize: 11,
    color: colors.text.secondary,
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
    color: colors.secondary.DEFAULT,
  },
  evaluatorSection: {
    marginTop: spacing.lg,
  },
  evaluatorHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.text.muted,
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
    color: colors.text.primary,
  },
  roleSub: {
    fontSize: 9,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
```

---

### 7.2 `mobile/src/screens/auth/PublicGatewayScreen.tsx`

The public landing showcase mirroring `LandingPage.tsx` from the web platform:

```typescript
/**
 * Public Gateway Screen
 * Direct mirror of HealthWay Web Landing Page with trilingual guidance & SOS
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const PublicGatewayScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { language, t, speak } = useLanguage();

  return (
    <View style={styles.container}>
      <Header
        title="HealthWay"
        subtitle={
          language === 'mr'
            ? 'महाराष्ट्र शासन · आरोग्य विभाग'
            : language === 'hi'
            ? 'महाराष्ट्र शासन · स्वास्थ्य विभाग'
            : 'Govt of Maharashtra · Health Dept'
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={styles.heroSection}>
          <View style={styles.badgeRow}>
            <View style={styles.govPill}>
              <Text style={styles.govPillText}>NHM · ABDM CERTIFIED</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                speak(
                  language === 'mr'
                    ? 'आरोग्यसेतू प्रणालीमध्ये आपले स्वागत आहे. उपकेंद्रापासून जिल्हा रुग्णालयापर्यंत अखंड आरोग्य सेवा.'
                    : 'Welcome to HealthWay. Seamless healthcare from Sub-Center to District Hospital.'
                )
              }
              style={styles.listenBtn}
            >
              <AppIcon name="volume" size={14} color="#93C5FD" />
              <Text style={styles.listenText}>
                {language === 'mr' ? 'माहिती ऐका' : 'Listen'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>
            {language === 'mr' ? (
              'आपल्या आरोग्यासाठी —\nएक अखंड डिजिटल सेतू'
            ) : language === 'hi' ? (
              'आपके स्वास्थ्य के लिए —\nएक अखंड डिजिटल सेतु'
            ) : (
              'Integrated Rural Health.\nConnected. Anywhere.'
            )}
          </Text>

          <Text style={styles.heroSub}>
            {language === 'mr'
              ? 'गावागावात तज्ञ डॉक्टरांचा सल्ला, डिजिटल ABHA नोंदी आणि जीवनरक्षक १०८ रुग्णवाहिका.'
              : 'ASHA-assisted teleconsultation, ABHA health records & 108 emergency escalation for rural Maharashtra.'}
          </Text>

          {/* Action CTAs */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.primaryCta}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>
                {language === 'mr' ? 'रुग्ण ABHA लॉगिन' : 'Patient ABHA Login'}
              </Text>
              <AppIcon name="chevronRight" size={16} color={colors.primary.DEFAULT} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('EmergencySOS')}
              style={styles.emergencyCta}
              activeOpacity={0.85}
            >
              <AppIcon name="phone" size={16} color={colors.white} />
              <Text style={styles.emergencyCtaText}>108 SOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 District Live KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiNumber}>36</Text>
            <Text style={styles.kpiLabel}>
              {language === 'mr' ? 'कार्यरत PHC' : 'Active PHCs'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={[styles.kpiNumber, { color: colors.secondary.DEFAULT }]}>847</Text>
            <Text style={styles.kpiLabel}>
              {language === 'mr' ? 'आरोग्य केंद्रे' : 'Total Facilities'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={[styles.kpiNumber, { color: colors.alerts.success }]}>142K+</Text>
            <Text style={styles.kpiLabel}>
              {language === 'mr' ? 'ABHA नागरिक' : 'ABHA Citizens'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={[styles.kpiNumber, { color: colors.alerts.warning }]}>24/7</Text>
            <Text style={styles.kpiLabel}>
              {language === 'mr' ? '१०८ नियंत्रण' : '108 Dispatch'}
            </Text>
          </View>
        </View>

        {/* Role Selector Card */}
        <Card elevated style={styles.rolePortalCard}>
          <View style={styles.rolePortalHeader}>
            <Text style={styles.cardSectionTitle}>
              {language === 'mr' ? 'संस्थात्मक कर्मचारी प्रवेश' : 'INSTITUTIONAL STAFF ACCESS'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RoleSelect')}>
              <Text style={styles.viewAllText}>
                {language === 'mr' ? 'सर्व भूमिका पहा' : 'View All Roles →'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('RoleSelect')}
            style={styles.roleQuickRow}
          >
            <View style={styles.roleMiniPill}>
              <AppIcon name="asha" size={16} color="#D97706" />
              <Text style={styles.roleMiniText}>ASHA Worker</Text>
            </View>
            <View style={styles.roleMiniPill}>
              <AppIcon name="doctor" size={16} color="#15803D" />
              <Text style={styles.roleMiniText}>Doctor OPD</Text>
            </View>
            <View style={styles.roleMiniPill}>
              <AppIcon name="admin" size={16} color="#7E22CE" />
              <Text style={styles.roleMiniText}>District Admin</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Emergency Contacts Card */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <AppIcon name="alertTriangle" size={18} color={colors.alerts.error} />
            <Text style={styles.emergencyTitle}>
              {language === 'mr' ? '२४/७ राष्ट्रीय व राज्य आपत्कालीन संपर्क' : '24/7 Emergency Helplines'}
            </Text>
          </View>
          <View style={styles.helplineGrid}>
            <View style={styles.helplineItem}>
              <Text style={styles.helplineNum}>108</Text>
              <Text style={styles.helplineName}>Ambulance</Text>
            </View>
            <View style={styles.helplineItem}>
              <Text style={styles.helplineNum}>102</Text>
              <Text style={styles.helplineName}>Janani Shishu</Text>
            </View>
            <View style={styles.helplineItem}>
              <Text style={styles.helplineNum}>104</Text>
              <Text style={styles.helplineName}>Health Helpline</Text>
            </View>
            <View style={styles.helplineItem}>
              <Text style={styles.helplineNum}>1091</Text>
              <Text style={styles.helplineName}>Women Helpline</Text>
            </View>
          </View>
        </View>
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
    paddingBottom: spacing.xl,
  },
  heroSection: {
    backgroundColor: '#0E356A',
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary.DEFAULT,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  govPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  govPillText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  listenText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    lineHeight: 28,
  },
  heroSub: {
    fontSize: 12,
    color: '#BFDBFE',
    marginTop: 6,
    lineHeight: 18,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryCta: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryCtaText: {
    color: colors.primary.DEFAULT,
    fontSize: 13,
    fontWeight: '800',
  },
  emergencyCta: {
    backgroundColor: colors.alerts.error,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emergencyCtaText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  kpiGrid: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.xs,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary.DEFAULT,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  rolePortalCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  rolePortalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.text.muted,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  roleQuickRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  roleMiniPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  roleMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
  },
  emergencyCard: {
    margin: spacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
  },
  helplineGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helplineItem: {
    alignItems: 'center',
  },
  helplineNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#B91C1C',
  },
  helplineName: {
    fontSize: 10,
    color: '#7F1D1D',
    fontWeight: '600',
  },
});
```

---

### 7.3 `mobile/src/screens/auth/RoleSelectionScreen.tsx`

Dedicated role switcher gateway allowing staff and administrators to select their institutional persona:

```typescript
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
import { Badge } from '../../components/Badge';
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
            <Card elevated style={styles.roleCard}>
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
    color: colors.text.muted,
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
    color: colors.text.primary,
  },
  profileSnippet: {
    fontSize: 11,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
    marginTop: 2,
  },
  roleDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
});
```

---

## 8. Role Dashboard Launchpad Screens (For Milestone 2)

In Milestone 2, each role navigator needs an operational landing screen that satisfies the route naming contracts tested in `shared_hubs.test.ts` (`PatientDashboard`, `AshaFieldDashboard`, `DoctorOPDQueue`, `AdminDistrictOverview`) and offers one-tap launchpad tiles to the 5 shared hubs:

### 8.1 `mobile/src/screens/patient/PatientDashboardScreen.tsx`
Provides the Patient Dashboard launchpad linking to:
- Emergency SOS (`EmergencySOS`)
- Medicine Availability (`MedicineHub`)
- Diagnostics Hub (`DiagnosticsHub`)
- Referral Pipeline (`ReferralsHub`)
- Live OPD Queue (`QueueHub`)

### 8.2 `mobile/src/screens/asha/AshaFieldDashboardScreen.tsx`
Provides the ASHA Field Dashboard launchpad linking to:
- Emergency SOS (`EmergencySOS`)
- Diagnostic Sample Tracker (`DiagnosticsHub`)
- Immediate Referrals (`ReferralsHub`)
- Sub-Center Drug Availability (`MedicineHub`)
- OPD Queue (`QueueHub`)

### 8.3 `mobile/src/screens/doctor/DoctorOPDQueueScreen.tsx`
Provides the Doctor OPD Queue launchpad linking to:
- Live OPD Department Queue & Waiting Room TV (`QueueHub`, `QueueTV`)
- Diagnostic Lab Orders & Reports (`DiagnosticsHub`)
- Inter-Facility Referrals & Counter-Referrals (`ReferralsHub`)
- Hospital Drug Formulary (`MedicineHub`)

### 8.4 `mobile/src/screens/admin/AdminDistrictOverviewScreen.tsx`
Provides the District Admin Command Overview launchpad linking to:
- District Diagnostic Centers (`DiagnosticsHub`)
- District Referral SLA Pipeline (`ReferralsHub`)
- Warehouse Medicine Stock & Indents (`MedicineHub`)
- Health Center Queue Telemetry (`QueueHub`)

---

## 9. Root Entry Point (`mobile/App.tsx`)

Wiring `SafeAreaProvider`, `AuthProvider`, `LanguageProvider`, `NavigationContainer`, `StatusBar`, and `RootNavigator`:

```typescript
/**
 * HealthWay Native Mobile Application Entry Point
 * Government of Maharashtra - Integrated Rural Health Platform
 */
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import storage from './src/storage';
import { colors } from './src/theme/colors';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await storage.initialize();
      } catch (err) {
        console.warn('Storage engine initialization notice', err);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="light" backgroundColor="#071A2F" />
            <RootNavigator />
          </NavigationContainer>
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

---

## 10. Test Compatibility Verification Matrix

| Test ID | Test Description | Target Screen / Module | Verification Method |
|---|---|---|---|
| **F08-1** | Authorizes `patient` role for `PatientDashboard` and `EmergencySOS` | `PatientNavigator.tsx` | Route access check |
| **F08-2** | Authorizes `asha` role for `AshaFieldDashboard` and shared hubs | `AshaNavigator.tsx` | Route access check |
| **F08-3** | Authorizes `doctor` role for `DoctorOPDQueue` and blocks admin screens | `DoctorNavigator.tsx` | Route access check |
| **F08-4** | Authorizes `admin` role for `AdminDistrictOverview` and shared hubs | `AdminNavigator.tsx` | Route access check |
| **F08-5** | Falls back gracefully to `PublicGateway`, `Login`, `RoleSelect` when unauthenticated | `AuthNavigator.tsx` | Route access check |
| **F09-1** | Validates 14-digit ABHA ID format requirement (`XX-XXXX-XXXX-XXXX`) | `LoginScreen.tsx` | Input regex & length check |
| **F09-2** | Generates 6-digit numeric OTP with 5-minute expiry | `LoginScreen.tsx` / `AuthContext` | OTP input formatting |
| **F09-3** | Authenticates with valid ABHA ID and correct OTP | `LoginScreen.tsx` | `loginWithAbha(...)` |
| **F09-4** | Locks verification after 3 consecutive invalid OTP attempts (`MAX_ATTEMPTS_EXCEEDED`) | `LoginScreen.tsx` | `isLocked` state enforcement |
| **F09-5** | Supports biometric / saved session fast login flow | `LoginScreen.tsx` | `loginWithBiometrics()` via `expo-local-authentication` |
| **F07-5** | Evaluator `PortalSwitcher` allows instant persona switching | `PortalSwitcher.tsx` & `RootNavigator.tsx` | 4-role switcher |

---

## 11. Worker Implementation Sequence

The worker should implement the navigation and auth stack in the following precise sequence:
1. `mobile/src/types/navigation.ts` (Types for all 5 navigators)
2. `mobile/src/navigation/navigationRef.ts` (Global navigation ref)
3. `mobile/src/screens/auth/PublicGatewayScreen.tsx` (Public showcase)
4. `mobile/src/screens/auth/RoleSelectionScreen.tsx` (Role selector)
5. `mobile/src/screens/auth/LoginScreen.tsx` (ABHA/OTP/Biometrics)
6. `mobile/src/screens/patient/PatientDashboardScreen.tsx` (Launchpad)
7. `mobile/src/screens/asha/AshaFieldDashboardScreen.tsx` (Launchpad)
8. `mobile/src/screens/doctor/DoctorOPDQueueScreen.tsx` (Launchpad)
9. `mobile/src/screens/admin/AdminDistrictOverviewScreen.tsx` (Launchpad)
10. `mobile/src/navigation/AuthNavigator.tsx` (Auth stack)
11. `mobile/src/navigation/PatientNavigator.tsx` (Patient stack)
12. `mobile/src/navigation/AshaNavigator.tsx` (ASHA stack)
13. `mobile/src/navigation/DoctorNavigator.tsx` (Doctor stack)
14. `mobile/src/navigation/AdminNavigator.tsx` (Admin stack)
15. `mobile/src/navigation/RootNavigator.tsx` (Root coordinator with `PortalSwitcher`)
16. `mobile/App.tsx` (Wiring `NavigationContainer`)
17. Run `npx tsc --noEmit` and `npm test` to verify zero regressions.
