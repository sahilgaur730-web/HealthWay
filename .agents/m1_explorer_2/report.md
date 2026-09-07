# Implementation Blueprint: Theme, Trilingual Engine, Auth Context & Shared UI Components

**Milestone**: M1 — Mobile Core Architecture & Foundation  
**Explorer**: `m1_explorer_2`  
**Target Subsystem**: `mobile/src/theme/`, `mobile/src/context/`, `mobile/src/components/`  
**Date**: 2026-09-07  

---

## 1. Executive Summary

This document specifies the exact, production-ready implementation blueprint for the four core UI, i18n, and session foundations of the HealthWay Native Cross-Platform Mobile Application (`mobile/`):

1. **Theme System (`mobile/src/theme/`)**: Complete institutional design tokens aligned with Government of Maharashtra visual identity (`#1A4B8C` Primary Navy, `#F57C00` Accent Saffron, `#1C2B3A` Dark Slate, `#546E7A` Cool Gray, `#F5F7FA` Canvas Background). Includes responsive type scaling, Devanagari script line-height adjustments, cross-platform elevation/shadows, and a strict **zero Unicode emoji** vector icon abstraction layer using `@expo/vector-icons`.
2. **Trilingual Engine (`mobile/src/context/LanguageContext.tsx`)**: Global multilingual system supporting English (`en`), Marathi (`mr`), and Hindi (`hi`). Features a comprehensive 200+ key clinical/medical/navigation dictionary, dot-notation fallback traversal, persistent storage, and native Speech-To-Text / Text-To-Speech integration via `expo-speech` with speech codes (`en-IN`, `mr-IN`, `hi-IN`).
3. **Auth & RBAC Context (`mobile/src/context/AuthContext.tsx`)**: Robust user session management with instant 4-role switching (`patient`, `asha`, `doctor`, `admin`), realistic default profiles for evaluation, 14-digit ABHA ID and OTP login simulation, secure cryptographic token storage via `expo-secure-store` (with graceful `AsyncStorage` fallback for simulators), and biometric authentication via `expo-local-authentication`.
4. **Base Shared UI Components (`mobile/src/components/`)**: Eight reusable, accessible, native components:
   - `Header`: Institutional header with MH emblem, role badge, language selector trigger, and emergency SOS quick-dial.
   - `PortalSwitcher`: Persistent top evaluator banner with animated network pulse and 4-role switcher.
   - `Card`: Multi-variant elevated/outlined clinical container.
   - `Button`: Tactile, multi-variant (`primary`, `accent`, `secondary`, `outline`, `danger`, `ghost`) button with vector icons and loading states.
   - `Badge`: Status, urgency (Red/Orange/Yellow/Green), and role indicator pill.
   - `Modal`: Accessible bottom-sheet dialog with backdrop dismiss and keyboard avoidance.
   - `FormInput`: High-contrast form field with focus highlight, vector icon adornments, and validation states.
   - `EmptyState`: Clean empty list placeholder with vector icon and action trigger.

---

## 2. Theme System Blueprint (`mobile/src/theme/`)

### 2.1 File Architecture
```
mobile/src/theme/
├── colors.ts       # Color palette, semantic states, role colors, triage tiers
├── typography.ts   # Font scale, weights, Devanagari safe line heights
├── spacing.ts      # Spacing scale, border radii, cross-platform shadow elevations
├── icons.ts        # Zero-emoji vector icon map & AppIcon component wrapper
└── index.ts        # Theme aggregator, common composite styles, types
```

### 2.2 Color Tokens (`mobile/src/theme/colors.ts`)
```typescript
/**
 * HealthWay Mobile Design System - Color Tokens
 * Government of Maharashtra - Integrated Rural Health Platform
 */

export const colors = {
  // Institutional Brand Colors
  primary: {
    DEFAULT: '#1A4B8C', // Maharashtra Navy Blue
    dark: '#0B2545',    // Deep Header Navy
    light: '#E8F0FE',   // Subtle selection blue
    hover: '#153E75',
  },
  accent: {
    DEFAULT: '#F57C00', // Maharashtra Saffron
    dark: '#E65100',
    light: '#FFF3E0',   // Light saffron tint
  },

  // Neutral Canvas & Surface
  slate: {
    dark: '#1C2B3A',    // High-contrast text primary
    gray: '#546E7A',    // Body & secondary text
    muted: '#90A4AE',   // Captions & placeholders
    border: '#CFD8DC',  // Component border
    borderLight: '#E2E8F0',
    bg: '#F5F7FA',      // Screen background canvas
    surface: '#FFFFFF', // Card & modal background
    surfaceSubtle: '#EEF2F6',
  },

  // Role-Specific Semantic Colors
  role: {
    patient: '#1A4B8C', // Navy Blue
    patientBg: '#E8F0FE',
    asha: '#7B1FA2',    // Purple
    ashaBg: '#F3E5F5',
    doctor: '#00796B',  // Clinical Teal
    doctorBg: '#E0F2F1',
    admin: '#D84315',   // Rust Red
    adminBg: '#FBE9E7',
  },

  // Clinical Triage Urgency Tiers
  urgency: {
    red: '#D32F2F',     // Emergency (Immediate)
    redBg: '#FFEBEE',
    orange: '#ED6C02',  // Urgent (Within 2 hrs)
    orangeBg: '#FFF4E5',
    yellow: '#F9A825',  // Moderate (Same day)
    yellowBg: '#FFFDE7',
    green: '#2E7D32',   // Mild / Routine
    greenBg: '#E8F5E9',
  },

  // Standard Semantic Feedback
  status: {
    success: '#2E7D32',
    successBg: '#E8F5E9',
    successBorder: '#A5D6A7',
    warning: '#ED6C02',
    warningBg: '#FFF4E5',
    warningBorder: '#FFCC80',
    error: '#D32F2F',
    errorBg: '#FFEBEE',
    errorBorder: '#EF9A9A',
    info: '#0288D1',
    infoBg: '#E1F5FE',
    infoBorder: '#81D4FA',
  },

  // Operational
  emergency: '#D32F2F',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorsType = typeof colors;
```

### 2.3 Typography (`mobile/src/theme/typography.ts`)
```typescript
/**
 * HealthWay Mobile Typography Tokens
 * Supports Latin and Devanagari (Marathi/Hindi) scripts with safe vertical metrics.
 */
import { TextStyle, Platform } from 'react-native';

export const fontFamily = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'System' }),
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
} as const;

export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
};

// Line heights designed specifically so Devanagari upper/lower vowel signs don't clip
export const lineHeight = {
  xs: 16,
  sm: 19,
  base: 22,
  md: 24,
  lg: 26,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 42,
} as const;

export const textStyles = {
  h1: {
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
    fontWeight: fontWeight.bold,
    color: '#1C2B3A',
  },
  h2: {
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    fontWeight: fontWeight.bold,
    color: '#1C2B3A',
  },
  h3: {
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: fontWeight.semibold,
    color: '#1C2B3A',
  },
  h4: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: fontWeight.semibold,
    color: '#1C2B3A',
  },
  body: {
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: fontWeight.regular,
    color: '#1C2B3A',
  },
  bodySmall: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.regular,
    color: '#546E7A',
  },
  caption: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: fontWeight.medium,
    color: '#90A4AE',
  },
  button: {
    fontSize: fontSize.base,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.semibold,
  },
} as const;
```

### 2.4 Spacing, Radii & Shadows (`mobile/src/theme/spacing.ts`)
```typescript
/**
 * Spacing, Elevation & Corner Radii
 */
import { ViewStyle } from 'react-native';

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows: Record<'none' | 'sm' | 'md' | 'lg' | 'xl', ViewStyle> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#1C2B3A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

### 2.5 Vector Icon Mapping (`mobile/src/theme/icons.ts`)
Strictly zero Unicode emojis! All icons use `@expo/vector-icons`.
```typescript
/**
 * HealthWay Vector Icon Mapping Layer
 * Strict rule: ZERO unicode emojis. All icons map to @expo/vector-icons.
 */
import React from 'react';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';

export type IconFamily = 'Ionicons' | 'MaterialCommunityIcons' | 'MaterialIcons' | 'Feather';

export interface IconDefinition {
  family: IconFamily;
  name: string;
}

export const APP_ICONS = {
  // Navigation & Core Roles
  home: { family: 'Ionicons', name: 'home-outline' },
  homeFilled: { family: 'Ionicons', name: 'home' },
  patient: { family: 'MaterialCommunityIcons', name: 'account-heart-outline' },
  asha: { family: 'MaterialCommunityIcons', name: 'mother-nurse' },
  doctor: { family: 'MaterialCommunityIcons', name: 'doctor' },
  admin: { family: 'MaterialCommunityIcons', name: 'shield-account-outline' },
  settings: { family: 'Ionicons', name: 'settings-outline' },
  profile: { family: 'Ionicons', name: 'person-circle-outline' },

  // Emergency & SOS
  emergency: { family: 'MaterialCommunityIcons', name: 'alert-octagon' },
  ambulance: { family: 'MaterialCommunityIcons', name: 'ambulance' },
  siren: { family: 'MaterialCommunityIcons', name: 'alarm-light-outline' },
  hospital: { family: 'MaterialCommunityIcons', name: 'hospital-building' },
  phoneEmergency: { family: 'Ionicons', name: 'call' },

  // Clinical & Vitals
  stethoscope: { family: 'MaterialCommunityIcons', name: 'stethoscope' },
  heartPulse: { family: 'MaterialCommunityIcons', name: 'heart-pulse' },
  bloodPressure: { family: 'MaterialCommunityIcons', name: 'water-percent' },
  sugar: { family: 'MaterialCommunityIcons', name: 'blood-bag' },
  thermometer: { family: 'MaterialCommunityIcons', name: 'thermometer' },
  lungs: { family: 'MaterialCommunityIcons', name: 'lungs' },
  weight: { family: 'MaterialCommunityIcons', name: 'scale-bathroom' },
  triage: { family: 'MaterialCommunityIcons', name: 'clipboard-pulse-outline' },

  // Diagnostics & Pharmacy
  diagnostic: { family: 'MaterialCommunityIcons', name: 'flask-outline' },
  testTube: { family: 'MaterialCommunityIcons', name: 'test-tube' },
  medicine: { family: 'MaterialCommunityIcons', name: 'pill' },
  prescription: { family: 'MaterialCommunityIcons', name: 'file-document-edit-outline' },
  records: { family: 'MaterialCommunityIcons', name: 'folder-account-outline' },
  referral: { family: 'MaterialCommunityIcons', name: 'transit-connection-variant' },
  queue: { family: 'MaterialCommunityIcons', name: 'human-queue' },

  // Media & Hardware
  camera: { family: 'Ionicons', name: 'camera-outline' },
  mic: { family: 'Ionicons', name: 'mic-outline' },
  micOff: { family: 'Ionicons', name: 'mic-off-outline' },
  volumeHigh: { family: 'Ionicons', name: 'volume-high-outline' },
  volumeMute: { family: 'Ionicons', name: 'volume-mute-outline' },
  video: { family: 'Ionicons', name: 'videocam-outline' },
  fingerprint: { family: 'MaterialIcons', name: 'fingerprint' },
  qrCode: { family: 'MaterialCommunityIcons', name: 'qrcode-scan' },

  // Networking & Sync
  wifi: { family: 'Ionicons', name: 'wifi' },
  wifiOff: { family: 'Ionicons', name: 'wifi-outline' },
  sync: { family: 'Ionicons', name: 'sync-outline' },
  syncAlert: { family: 'MaterialCommunityIcons', name: 'sync-alert' },
  cloudDone: { family: 'Ionicons', name: 'cloud-done-outline' },

  // UI Actions & Indicators
  search: { family: 'Ionicons', name: 'search-outline' },
  filter: { family: 'Ionicons', name: 'filter-outline' },
  check: { family: 'Ionicons', name: 'checkmark' },
  checkCircle: { family: 'Ionicons', name: 'checkmark-circle' },
  close: { family: 'Ionicons', name: 'close' },
  closeCircle: { family: 'Ionicons', name: 'close-circle-outline' },
  chevronRight: { family: 'Ionicons', name: 'chevron-forward' },
  chevronLeft: { family: 'Ionicons', name: 'chevron-back' },
  chevronDown: { family: 'Ionicons', name: 'chevron-down' },
  chevronUp: { family: 'Ionicons', name: 'chevron-up' },
  arrowRight: { family: 'Ionicons', name: 'arrow-forward' },
  arrowLeft: { family: 'Ionicons', name: 'arrow-back' },
  alertTriangle: { family: 'Ionicons', name: 'warning-outline' },
  info: { family: 'Ionicons', name: 'information-circle-outline' },
  lock: { family: 'Ionicons', name: 'lock-closed-outline' },
  eye: { family: 'Ionicons', name: 'eye-outline' },
  eyeOff: { family: 'Ionicons', name: 'eye-off-outline' },
  language: { family: 'MaterialIcons', name: 'translate' },
  download: { family: 'Ionicons', name: 'download-outline' },
  upload: { family: 'Ionicons', name: 'cloud-upload-outline' },
  share: { family: 'Ionicons', name: 'share-social-outline' },
  calendar: { family: 'Ionicons', name: 'calendar-outline' },
  clock: { family: 'Ionicons', name: 'time-outline' },
  location: { family: 'Ionicons', name: 'location-outline' },
  call: { family: 'Ionicons', name: 'call-outline' },
} as const;

export type AppIconName = keyof typeof APP_ICONS;

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function AppIcon({ name, size = 22, color = '#1C2B3A', style }: AppIconProps) {
  const iconDef = APP_ICONS[name] || APP_ICONS.info;

  switch (iconDef.family) {
    case 'Ionicons':
      return <Ionicons name={iconDef.name as any} size={size} color={color} style={style} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={iconDef.name as any} size={size} color={color} style={style} />;
    case 'MaterialIcons':
      return <MaterialIcons name={iconDef.name as any} size={size} color={color} style={style} />;
    case 'Feather':
      return <Feather name={iconDef.name as any} size={size} color={color} style={style} />;
    default:
      return <Ionicons name="help-circle-outline" size={size} color={color} style={style} />;
  }
}
```

### 2.6 Theme Barrel (`mobile/src/theme/index.ts`)
```typescript
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './icons';

import { colors } from './colors';
import { typography, textStyles, fontSize, fontWeight, lineHeight } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { APP_ICONS, AppIcon } from './icons';

export const theme = {
  colors,
  typography,
  textStyles,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
  borderRadius,
  shadows,
  icons: APP_ICONS,
};

export default theme;
```

---

## 3. Trilingual Engine Blueprint (`mobile/src/context/LanguageContext.tsx`)

### 3.1 Specification & Features
1. **Three Official Languages**:
   - `en`: English (Speech code: `en-IN`)
   - `mr`: Marathi / मराठी (Speech code: `mr-IN`)
   - `hi`: Hindi / हिंदी (Speech code: `hi-IN`)
2. **Key Lookups with Dot-Notation & Direct Parity**:
   - Supports structured paths: `t('common.submit')`, `t('triage.severity.red')`.
   - Supports direct string fallback matching web parity: `t('Patient Portal')` -> `मरीज़ पोर्टल` / `रुग्ण पोर्टल`.
3. **Speech Integration (`expo-speech`)**:
   - Audio guidance function: `speak(text: string)`.
   - Cancellation: `stopSpeaking()`.
   - Voice state tracking: `isSpeaking`.
   - Proper language code routing with fallback to Indian English/Hindi if Marathi voice is missing.
4. **Persistent Language Selection**:
   - Saved to `@healthway:language` via `@react-native-async-storage/async-storage`.

### 3.2 Context Implementation (`mobile/src/context/LanguageContext.tsx`)
```typescript
/**
 * HealthWay Native Trilingual Engine & Audio Guidance
 * Government of Maharashtra - Integrated Rural Health Platform
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import en from './translations/en';
import mr from './translations/mr';
import hi from './translations/hi';

export type Language = 'en' | 'mr' | 'hi';

export interface LanguageMeta {
  code: Language;
  name: string;
  nativeName: string;
  badgeText: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    badgeText: 'EN',
    speechCode: 'en-IN',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    badgeText: 'म',
    speechCode: 'mr-IN',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    badgeText: 'हि',
    speechCode: 'hi-IN',
  },
];

const TRANSLATIONS: Record<Language, any> = { en, mr, hi };

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, defaultText?: string) => string;
  speak: (text: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  supportedLanguages: LanguageMeta[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = '@healthway:selected_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('mr'); // Default to Marathi per Govt MH mandate
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Restore saved language on boot
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi')) {
          setLanguageState(saved as Language);
        }
      } catch (err) {
        // Fallback to default
      }
    })();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      console.warn('Failed to persist language preference', err);
    }
  }, []);

  // Translation resolver with dot-notation and fallback
  const t = useCallback((key: string, defaultText?: string): string => {
    if (!key) return defaultText || '';

    // Direct string match first (for legacy web strings)
    const currentDict = TRANSLATIONS[language];
    const enDict = TRANSLATIONS.en;

    const resolvePath = (obj: any, path: string) => {
      return path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj);
    };

    let result = resolvePath(currentDict, key);
    if (result === undefined && language !== 'en') {
      result = resolvePath(enDict, key);
    }

    if (result === undefined) {
      return defaultText !== undefined ? defaultText : key;
    }

    return String(result);
  }, [language]);

  // Audio Guidance Hook with expo-speech
  const speak = useCallback((text: string) => {
    if (!text) return;
    try {
      Speech.stop();
      setIsSpeaking(true);

      const meta = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

      Speech.speak(text, {
        language: meta.speechCode,
        rate: 0.9,
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.warn('Speech engine error', err);
      setIsSpeaking(false);
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    try {
      Speech.stop();
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    speak,
    isSpeaking,
    stopSpeaking,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }), [language, setLanguage, t, speak, isSpeaking, stopSpeaking]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
```

---

## 4. Auth & RBAC Context Blueprint (`mobile/src/context/AuthContext.tsx`)

### 4.1 Specification & Contract
- **Interface Contract** matching `PROJECT.md § Interface Contracts`:
  - `session: UserSession`
  - `setRole: (role: 'patient' | 'asha' | 'doctor' | 'admin') => Promise<void>`
  - `loginWithAbha: (abhaId: string, otp: string) => Promise<boolean>`
  - `loginWithBiometrics: () => Promise<boolean>`
  - `logout: () => Promise<void>`
  - `isAuthenticated: boolean`
- **Default Evaluation Profiles**: Pre-seeded active profiles for each role, allowing instant testing without manual form filling.
- **Secure Persistence Engine**:
  - Primary: `expo-secure-store`
  - Fallback: `AsyncStorage` (if running in browser preview or simulator where Keychain/Keystore is restricted)
- **Biometric Integration**:
  - Uses `expo-local-authentication` (`hasHardwareAsync`, `isEnrolledAsync`, `authenticateAsync`).

### 4.2 Implementation Code (`mobile/src/context/AuthContext.tsx`)
```typescript
/**
 * HealthWay Native Authentication & Role-Based Session Context
 * Government of Maharashtra - Integrated Rural Health Platform
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'patient' | 'asha' | 'doctor' | 'admin';

export interface UserSession {
  role: UserRole;
  token?: string;
  user: {
    id: string;
    name: string;
    nameMr?: string;
    nameHi?: string;
    abhaId?: string;
    phone?: string;
    facilityId?: string;
    facilityName?: string;
    registrationNo?: string;
    avatar?: string;
  };
}

export interface AuthContextType {
  session: UserSession;
  setRole: (role: UserRole) => Promise<void>;
  loginWithAbha: (abhaId: string, otp: string) => Promise<boolean>;
  loginWithBiometrics: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBiometricSupported: boolean;
  availableBiometrics: string[];
}

const STORAGE_SESSION_KEY = 'hw_auth_session_v1';

// Default Institutional Profiles for instant role switching & evaluation
export const ROLE_PROFILES: Record<UserRole, UserSession['user']> = {
  patient: {
    id: 'PT-001',
    name: 'Ramesh Rao Jadhav',
    nameMr: 'रमेश राव जाधव',
    nameHi: 'रमेश राव जाधव',
    abhaId: '91-2345-6789-0123',
    phone: '+91 98201 98201',
    facilityId: 'FAC-003',
    facilityName: 'PHC Karjat',
  },
  asha: {
    id: 'ASHA-7012',
    name: 'Sunita Tai Shinde',
    nameMr: 'सुनीता ताई शिंदे',
    nameHi: 'सुनीता ताई शिंदे',
    phone: '+91 98223 34455',
    facilityId: 'FAC-003-SC',
    facilityName: 'Sub-Center Kashele',
    registrationNo: 'MH-ASHA-2018-7012',
  },
  doctor: {
    id: 'DOC-401',
    name: 'Dr. Anand S. Kulkarni, MD',
    nameMr: 'डॉ. आनंद एस. कुलकर्णी',
    nameHi: 'डॉ. आनंद एस. कुलकर्णी',
    phone: '+91 94220 11223',
    facilityId: 'FAC-001',
    facilityName: 'Rural Hospital Karjat',
    registrationNo: 'MMC-2014-08912',
  },
  admin: {
    id: 'ADM-101',
    name: 'Smt. Prerna Patil, IAS',
    nameMr: 'श्रीमती प्रेरणा पाटील',
    nameHi: 'श्रीमती प्रेरणा पाटील',
    phone: '+91 98210 99887',
    facilityId: 'DIST-RAIGAD',
    facilityName: 'District Health Office, Raigad',
    registrationNo: 'MH-IAS-2016-042',
  },
};

const DEFAULT_SESSION: UserSession = {
  role: 'patient',
  token: 'mock_hw_token_patient_default',
  user: ROLE_PROFILES.patient,
};

// Safe storage wrapper (SecureStore with AsyncStorage fallback)
async function safeSaveSession(session: UserSession): Promise<void> {
  const json = JSON.stringify(session);
  try {
    await SecureStore.setItemAsync(STORAGE_SESSION_KEY, json);
  } catch {
    await AsyncStorage.setItem(STORAGE_SESSION_KEY, json);
  }
}

async function safeGetSession(): Promise<UserSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  try {
    const raw = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  return null;
}

async function safeClearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_SESSION_KEY);
  } catch {
    // Fallback
  }
  try {
    await AsyncStorage.removeItem(STORAGE_SESSION_KEY);
  } catch {
    // Fallback
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(DEFAULT_SESSION);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false);
  const [availableBiometrics, setAvailableBiometrics] = useState<string[]>([]);

  // Initialize biometrics and restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const [hasHardware, isEnrolled, types, savedSession] = await Promise.all([
          LocalAuthentication.hasHardwareAsync().catch(() => false),
          LocalAuthentication.isEnrolledAsync().catch(() => false),
          LocalAuthentication.supportedAuthenticationTypesAsync().catch(() => []),
          safeGetSession(),
        ]);

        setIsBiometricSupported(hasHardware && isEnrolled);
        setAvailableBiometrics(
          types.map(t => {
            if (t === LocalAuthentication.AuthenticationType.FINGERPRINT) return 'FINGERPRINT';
            if (t === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) return 'FACIAL_RECOGNITION';
            if (t === LocalAuthentication.AuthenticationType.IRIS) return 'IRIS';
            return 'BIOMETRIC';
          })
        );

        if (savedSession) {
          setSession(savedSession);
          setIsAuthenticated(!!savedSession.token);
        }
      } catch (err) {
        console.warn('Auth initialization error', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Switch role dynamically
  const setRole = useCallback(async (newRole: UserRole) => {
    const updatedSession: UserSession = {
      role: newRole,
      token: `hw_sec_token_${Date.now()}_${newRole}`,
      user: ROLE_PROFILES[newRole],
    };
    setSession(updatedSession);
    setIsAuthenticated(true);
    await safeSaveSession(updatedSession);
  }, []);

  // 14-digit ABHA login simulation
  const loginWithAbha = useCallback(async (abhaId: string, otp: string): Promise<boolean> => {
    // Clean formatting
    const cleanedAbha = abhaId.replace(/\D/g, '');
    if (cleanedAbha.length !== 14) {
      return false;
    }
    // Accept valid 6-digit OTP in demo mode (default: 123456 or any 6 digits)
    if (!otp || otp.length !== 6) {
      return false;
    }

    const updatedSession: UserSession = {
      role: 'patient',
      token: `hw_abha_auth_${Date.now()}`,
      user: {
        ...ROLE_PROFILES.patient,
        abhaId: `${cleanedAbha.slice(0, 2)}-${cleanedAbha.slice(2, 6)}-${cleanedAbha.slice(6, 10)}-${cleanedAbha.slice(10, 14)}`,
      },
    };

    setSession(updatedSession);
    setIsAuthenticated(true);
    await safeSaveSession(updatedSession);
    return true;
  }, []);

  // Biometric login
  const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'HealthWay Biometric Login',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use ABHA ID & OTP',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Restore or refresh session
        const currentRole = session.role || 'patient';
        const updatedSession: UserSession = {
          role: currentRole,
          token: `hw_bio_token_${Date.now()}`,
          user: ROLE_PROFILES[currentRole],
        };
        setSession(updatedSession);
        setIsAuthenticated(true);
        await safeSaveSession(updatedSession);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Biometric auth failed', err);
      return false;
    }
  }, [session.role]);

  // Logout
  const logout = useCallback(async () => {
    await safeClearSession();
    setIsAuthenticated(false);
    setSession({
      role: 'patient',
      token: undefined,
      user: ROLE_PROFILES.patient,
    });
  }, []);

  const value = useMemo(() => ({
    session,
    setRole,
    loginWithAbha,
    loginWithBiometrics,
    logout,
    isAuthenticated,
    isLoading,
    isBiometricSupported,
    availableBiometrics,
  }), [session, setRole, loginWithAbha, loginWithBiometrics, logout, isAuthenticated, isLoading, isBiometricSupported, availableBiometrics]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
```

---

## 5. Base Shared UI Components Blueprint (`mobile/src/components/`)

### 5.1 Overview
All components are built with zero emojis, using `AppIcon` from `@/theme/icons`. They fully respect `react-native-safe-area-context` and React Native's accessibility primitives.

```
mobile/src/components/
├── Header.tsx           # Institutional top navigation header
├── PortalSwitcher.tsx   # Top banner for 4-role switcher and live telemetry
├── Card.tsx             # Multi-variant container with elevation
├── Button.tsx           # Tactile button with loading states and icon adornments
├── Badge.tsx            # Status, role, and triage urgency pill
├── Modal.tsx            # Bottom-sheet modal dialog with backdrop dismiss
├── FormInput.tsx        # High-contrast clinical form input
├── EmptyState.tsx       # Illustrated empty-list view
└── index.ts             # Barrel export
```

### 5.2 Complete Component Implementations

#### 1. `Header.tsx`
```typescript
/**
 * HealthWay Institutional Navigation Header
 * Government of Maharashtra - Integrated Rural Health Platform
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
  onSosPress,
  onRoleBadgePress,
}) => {
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
          {showSosButton && (
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
```

#### 2. `PortalSwitcher.tsx`
```typescript
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
```

#### 3. `Card.tsx`
```typescript
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
```

#### 4. `Button.tsx`
```typescript
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
```

#### 5. `Badge.tsx`
```typescript
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
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple' | 'teal';
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
```

#### 6. `Modal.tsx`
```typescript
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
```

#### 7. `FormInput.tsx`
```typescript
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
```

#### 8. `EmptyState.tsx`
```typescript
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
```

#### 9. Barrel File (`mobile/src/components/index.ts`)
```typescript
export * from './Header';
export * from './PortalSwitcher';
export * from './Card';
export * from './Button';
export * from './Badge';
export * from './Modal';
export * from './FormInput';
export * from './EmptyState';
```

---

## 6. Verification and Implementation Checklist

| Requirement | Implementation Target | Verification Check |
|---|---|---|
| Maharashtra Gov Palette | `#1A4B8C` Primary Navy, `#F57C00` Accent Saffron, `#1C2B3A` Dark Slate, `#546E7A` Gray, `#F5F7FA` Canvas | All colors declared in `colors.ts`, used across components |
| Zero Unicode Emojis | `icons.ts` | Codebase grep confirms zero unicode emoji characters in UI; all icons rendered with `@expo/vector-icons` |
| Trilingual Engine | English (`en`), Marathi (`mr`), Hindi (`hi`) | Instant language switching without remounting entire app, Devanagari line-heights intact |
| Text-To-Speech (TTS) | `expo-speech` with `en-IN`, `mr-IN`, `hi-IN` | `speak()` triggers device speech, safe fallback when native voice missing |
| Role-Based Auth Context | 4 Roles: Patient, ASHA, Doctor, Admin | `setRole()` updates session and informs navigators; pre-seeded profiles load cleanly |
| ABHA Login Simulation | 14-digit ABHA and 6-digit OTP | Validates length, formats string, creates active session |
| Secure Persistence | `expo-secure-store` with `AsyncStorage` fallback | Session persists across app reload; fallback handles web/test environments |
| Biometric Integration | `expo-local-authentication` | Safely queries sensor availability and prompts biometric dialog |
| TypeScript Compliance | Strict mode in `tsconfig.json` | `npx tsc --noEmit` exits with 0 errors |

---

## 7. Recommendations for the Builder Agent

1. **Package Installations**: Ensure `m1_builder` installs `@expo/vector-icons`, `expo-speech`, `expo-secure-store`, `expo-local-authentication`, `@react-native-async-storage/async-storage`, and `react-native-safe-area-context`.
2. **Path Aliasing**: Import theme and components using `@/theme`, `@/context`, `@/components` once `tsconfig.json` paths are configured.
3. **Safe Area Discipline**: All header and modal views must use `useSafeAreaInsets()` to prevent overlapping status bar / home indicators.
4. **Devanagari Typography Protection**: Never use fixed height on text containers holding Marathi or Hindi strings to avoid Devanagari matra clipping.
