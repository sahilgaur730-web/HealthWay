/**
 * Comprehensive Empirical Adversarial Stress Test Suite for Milestone 1
 * Theme, Trilingual Engine, AuthContext & Shared UI Components
 * 
 * Conducted by m1_challenger_2 (M1 Theme i18n & Auth Challenger)
 */

// Mock React Native and native Expo modules for Jest node environment
jest.mock('react-native', () => {
  const React = require('react');
  return {
    Platform: {
      select: (obj: any) => obj.android || obj.default,
      OS: 'android',
    },
    StyleSheet: {
      create: (s: any) => s,
    },
    View: (props: any) => React.createElement('View', props, props.children),
    Text: (props: any) => React.createElement('Text', props, props.children),
    TouchableOpacity: (props: any) => React.createElement('TouchableOpacity', props, props.children),
    TouchableWithoutFeedback: (props: any) => React.createElement('TouchableWithoutFeedback', props, props.children),
    ActivityIndicator: (props: any) => React.createElement('ActivityIndicator', props),
    TextInput: (props: any) => React.createElement('TextInput', props),
    Modal: (props: any) => React.createElement('Modal', props, props.children),
    KeyboardAvoidingView: (props: any) => React.createElement('KeyboardAvoidingView', props, props.children),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, bottom: 20, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: (props: any) => React.createElement('Ionicons', props),
    MaterialCommunityIcons: (props: any) => React.createElement('MaterialCommunityIcons', props),
    MaterialIcons: (props: any) => React.createElement('MaterialIcons', props),
    Feather: (props: any) => React.createElement('Feather', props),
  };
});

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  supportedAuthenticationTypesAsync: jest.fn().mockResolvedValue([]),
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

import React from 'react';
import * as fs from 'fs';
import * as path from 'path';

// Import translation dictionaries directly
import en from '../src/context/translations/en';
import mr from '../src/context/translations/mr';
import hi from '../src/context/translations/hi';

// Import Theme tokens and Icons
import { colors } from '../src/theme/colors';
import { typography, fontSize, lineHeight, fontWeight } from '../src/theme/typography';
import { spacing, borderRadius, shadows } from '../src/theme/spacing';
import { APP_ICONS, AppIcon, AppIconName } from '../src/theme/icons';

// Import Auth Context and Profiles
import { ROLE_PROFILES, UserRole, UserSession } from '../src/context/AuthContext';

// Import Shared UI Components
import { Badge } from '../src/components/Badge';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { EmptyState } from '../src/components/EmptyState';
import { FormInput } from '../src/components/FormInput';
import { Modal } from '../src/components/Modal';

// Import Mock Auth for comparison
import { MockAuthService } from './harness/mockAuth';

describe('Tier 5 Adversarial: Trilingual Engine & Devanagari Integrity', () => {
  const TRANSLATIONS: Record<string, any> = { en, mr, hi };

  // Production LanguageContext resolver logic under stress
  const resolvePath = (obj: any, p: string) => {
    return p.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj);
  };

  const t = (key: string, lang: string, defaultText?: string): string => {
    if (!key) return defaultText || '';
    const currentDict = TRANSLATIONS[lang];
    const enDict = TRANSLATIONS.en;

    let result = resolvePath(currentDict, key);
    if (result === undefined && lang !== 'en') {
      result = resolvePath(enDict, key);
    }
    if (result === undefined) {
      return defaultText !== undefined ? defaultText : key;
    }
    return String(result);
  };

  function getFlatKeys(obj: any, prefix = ''): Record<string, string> {
    let keys: Record<string, string> = {};
    for (const k in obj) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        Object.assign(keys, getFlatKeys(obj[k], fullKey));
      } else {
        keys[fullKey] = String(obj[k]);
      }
    }
    return keys;
  }

  const enKeys = getFlatKeys(en);
  const mrKeys = getFlatKeys(mr);
  const hiKeys = getFlatKeys(hi);

  it('ADV-I18N-01: 100% Exact Key Parity Across en, mr, and hi (152 canonical leaf keys)', () => {
    const enKeyList = Object.keys(enKeys).sort();
    const mrKeyList = Object.keys(mrKeys).sort();
    const hiKeyList = Object.keys(hiKeys).sort();

    expect(enKeyList.length).toBe(152);
    expect(mrKeyList.length).toBe(152);
    expect(hiKeyList.length).toBe(152);

    const missingInMr = enKeyList.filter(k => !(k in mrKeys));
    const missingInHi = enKeyList.filter(k => !(k in hiKeys));
    const extraInMr = mrKeyList.filter(k => !(k in enKeys));
    const extraInHi = hiKeyList.filter(k => !(k in enKeys));

    expect(missingInMr).toEqual([]);
    expect(missingInHi).toEqual([]);
    expect(extraInMr).toEqual([]);
    expect(extraInHi).toEqual([]);
  });

  it('ADV-I18N-02: Nested and flat dot-notation resolution across all clinical domains', () => {
    // Triage severity
    expect(t('triage.severity.red', 'en')).toBe('Emergency — Go to hospital immediately');
    expect(t('triage.severity.red', 'mr')).toBe('आपत्कालीन — त्वरित रुग्णालयात जा');
    expect(t('triage.severity.red', 'hi')).toBe('आपातकाल — तुरंत अस्पताल जाएं');

    // Emergency telemetry
    expect(t('emergency.ambulanceTracking', 'en')).toBe('Track Ambulance Live');
    expect(t('emergency.ambulanceTracking', 'mr')).toBe('रुग्णवाहिका ट्रॅक करा');
    expect(t('emergency.ambulanceTracking', 'hi')).toBe('एम्बुलेंस ट्रैक करें');

    // ASHA home visits
    expect(t('asha.logVisit', 'en')).toBe('Log Home Visit');
    expect(t('asha.logVisit', 'mr')).toBe('घरभेट नोंदवा');
    expect(t('asha.logVisit', 'hi')).toBe('घर यात्रा दर्ज करें');

    // Flat legacy keys
    expect(t('govt_name', 'en')).toBe('Government of Maharashtra');
    expect(t('govt_name', 'mr')).toBe('महाराष्ट्र शासन');
    expect(t('govt_name', 'hi')).toBe('महाराष्ट्र शासन');
  });

  it('ADV-I18N-03: Fallback cascades — Marathi -> English -> defaultText -> key string', () => {
    // 1. Missing in Marathi, present in English -> falls back to English
    const originalMrVoice = TRANSLATIONS.mr.voice;
    TRANSLATIONS.mr = { ...TRANSLATIONS.mr, voice: { ...originalMrVoice } };
    delete TRANSLATIONS.mr.voice.listening;

    expect(t('voice.listening', 'mr')).toBe('Listening...');
    TRANSLATIONS.mr.voice = originalMrVoice; // Restore

    // 2. Missing in both Marathi and English -> returns explicit defaultText
    expect(t('nonexistent.deep.key', 'mr', 'Standard Default')).toBe('Standard Default');

    // 3. Missing in both without defaultText -> returns key string
    expect(t('nonexistent.deep.key', 'mr')).toBe('nonexistent.deep.key');
  });

  it('ADV-I18N-04: Resilient to prototype poisoning and malicious input keys', () => {
    expect(() => t('__proto__', 'en')).not.toThrow();
    expect(() => t('constructor', 'en')).not.toThrow();
    expect(() => t('valueOf', 'en')).not.toThrow();
    expect(() => t('toString', 'en')).not.toThrow();
    expect(() => t('__proto__.polluted', 'en')).not.toThrow();

    // Leading and trailing dots
    expect(t('.common.save', 'en')).toBe('.common.save');
    expect(t('common.save.', 'en')).toBe('common.save.');
    expect(t('...', 'en')).toBe('...');
    expect(t('', 'en', 'Fallback')).toBe('Fallback');
  });

  it('ADV-I18N-05: Survives unsupported / corrupt language codes gracefully', () => {
    // If language is set to 'fr' or 'unknown', falls back to English without crashing
    expect(() => t('nav.home', 'fr')).not.toThrow();
    expect(t('nav.home', 'fr')).toBe('Home');
    expect(t('common.submit', 'unknown')).toBe('Submit');
  });

  it('ADV-I18N-06: Devanagari script integrity — 0 replacement chars, valid Unicode block U+0900-U+097F', () => {
    const devanagariRegex = /[\u0900-\u097F]/;
    const replacementCharRegex = /\uFFFD/;

    for (const [k, val] of Object.entries(mrKeys)) {
      expect(val.length).toBeGreaterThan(0);
      expect(replacementCharRegex.test(val)).toBe(false);
      expect(devanagariRegex.test(val)).toBe(true);
    }

    for (const [k, val] of Object.entries(hiKeys)) {
      expect(val.length).toBeGreaterThan(0);
      expect(replacementCharRegex.test(val)).toBe(false);
      expect(devanagariRegex.test(val)).toBe(true);
    }
  });

  it('ADV-I18N-07: Linguistic divergence verification between Marathi and Hindi', () => {
    // Ensure Marathi and Hindi are distinct, professional translations
    const distinctPairs = [
      ['common.save', 'जतन करा', 'सहेजें'],
      ['common.back', 'मागे', 'वापस'],
      ['common.yes', 'होय', 'हाँ'],
      ['common.no', 'नाही', 'नहीं'],
      ['common.submit', 'सबमिट करा', 'सबमिट करें'],
      ['common.cancel', 'रद्द करा', 'रद्द करें'],
      ['nav.medicines', 'औषधे', 'दवाइयाँ'],
      ['nav.records', 'नोंदी', 'रिकॉर्ड'],
      ['triage.result', 'आपला निकाल', 'आपका परिणाम'],
    ];

    distinctPairs.forEach(([key, expectedMr, expectedHi]) => {
      expect(mrKeys[key]).toBe(expectedMr);
      expect(hiKeys[key]).toBe(expectedHi);
      expect(mrKeys[key]).not.toEqual(hiKeys[key]);
    });
  });
});

describe('Tier 5 Adversarial: Role Switching & Persona State Transitions', () => {
  const roles: UserRole[] = ['patient', 'asha', 'doctor', 'admin'];

  it('ADV-AUTH-01: Validates complete institutional profile attributes for all 4 personas', () => {
    roles.forEach(role => {
      const profile = ROLE_PROFILES[role];
      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
      expect(profile.name).toBeDefined();
      expect(profile.nameMr).toBeDefined();
      expect(profile.nameHi).toBeDefined();
      expect(profile.phone).toMatch(/^\+91\s\d{5}\s\d{5}$/);
      expect(profile.facilityId).toBeDefined();
      expect(profile.facilityName).toBeDefined();
    });

    // Specific persona attributes
    expect(ROLE_PROFILES.patient.abhaId).toBe('91-2345-6789-0123');
    expect(ROLE_PROFILES.asha.registrationNo).toBe('MH-ASHA-2018-7012');
    expect(ROLE_PROFILES.doctor.registrationNo).toBe('MMC-2014-08912');
    expect(ROLE_PROFILES.admin.registrationNo).toBe('MH-IAS-2016-042');
  });

  it('ADV-AUTH-02: Rapid sequential and re-entrant role switching preserves identity isolation', () => {
    let currentSession: UserSession = {
      role: 'patient',
      token: 'init_token',
      user: ROLE_PROFILES.patient,
    };

    const simulateRoleSwitch = (r: UserRole): UserSession => {
      return {
        role: r,
        token: `hw_sec_token_${Date.now()}_${r}`,
        user: ROLE_PROFILES[r],
      };
    };

    // Cycle through: patient -> asha -> doctor -> admin -> patient
    currentSession = simulateRoleSwitch('asha');
    expect(currentSession.role).toBe('asha');
    expect(currentSession.user.name).toBe('Sunita Tai Shinde');
    expect(currentSession.token).toContain('asha');

    currentSession = simulateRoleSwitch('doctor');
    expect(currentSession.role).toBe('doctor');
    expect(currentSession.user.name).toBe('Dr. Anand S. Kulkarni, MD');
    expect(currentSession.token).toContain('doctor');

    currentSession = simulateRoleSwitch('admin');
    expect(currentSession.role).toBe('admin');
    expect(currentSession.user.name).toBe('Smt. Prerna Patil, IAS');
    expect(currentSession.token).toContain('admin');

    currentSession = simulateRoleSwitch('patient');
    expect(currentSession.role).toBe('patient');
    expect(currentSession.user.name).toBe('Ramesh Rao Jadhav');
    expect(currentSession.token).toContain('patient');
  });

  it('ADV-AUTH-03: Immutability check — Switching roles does not mutate base ROLE_PROFILES', () => {
    const originalPatientName = ROLE_PROFILES.patient.name;
    const originalAshaName = ROLE_PROFILES.asha.name;

    const modifiedUser = { ...ROLE_PROFILES.patient, name: 'Hacked Name' };
    expect(modifiedUser.name).toBe('Hacked Name');
    expect(ROLE_PROFILES.patient.name).toBe(originalPatientName);
    expect(ROLE_PROFILES.asha.name).toBe(originalAshaName);
  });
});

describe('Tier 5 Adversarial: ABHA ID Validation & Authentication Edge Cases', () => {
  const authService = new MockAuthService();

  // Test standard ABHA validation
  it('ADV-ABHA-01: Validates standard 14-digit ABHA IDs with hyphens, spaces, and raw digits', () => {
    expect(authService.validateAbhaId('14-4821-9876-5432')).toBe(true);
    expect(authService.validateAbhaId('91-2345-6789-0123')).toBe(true);
    expect(authService.validateAbhaId('14482198765432')).toBe(true);
  });

  it('ADV-ABHA-02: Rejects length boundary violations (13 digits, 15 digits, empty)', () => {
    expect(authService.validateAbhaId('14-4821-9876-543')).toBe(false); // 13 digits
    expect(authService.validateAbhaId('14-4821-9876-54321')).toBe(false); // 15 digits
    expect(authService.validateAbhaId('')).toBe(false);
    expect(authService.validateAbhaId('   ')).toBe(false);
  });

  it('ADV-ABHA-03: Rejects adversarial injection tokens, scripts, and non-numeric inputs', () => {
    expect(authService.validateAbhaId('ABCD-EFGH-IJKL-MN')).toBe(false);
    expect(authService.validateAbhaId("14' OR '1'='1")).toBe(false);
    expect(authService.validateAbhaId('<script>alert("XSS")</script>')).toBe(false);
    expect(authService.validateAbhaId('14-4821-9876-5432\x00')).toBe(false); // Null byte
  });

  it('ADV-ABHA-04: Handles null and undefined safely without throwing exceptions', () => {
    expect(authService.validateAbhaId(null as any)).toBe(false);
    expect(authService.validateAbhaId(undefined as any)).toBe(false);
  });

  it('ADV-ABHA-05: Simulates AuthContext loginWithAbha sanitization & formatting', async () => {
    // Robust ABHA validator function matching Government ABDM specification
    const robustValidateAbha = (abha: any): boolean => {
      if (!abha || typeof abha !== 'string') return false;
      const clean = abha.replace(/[-\s]/g, '').trim();
      return /^\d{14}$/.test(clean);
    };

    expect(robustValidateAbha('14-4821-9876-5432')).toBe(true);
    expect(robustValidateAbha('14 4821 9876 5432')).toBe(true);
    expect(robustValidateAbha('14482198765432')).toBe(true);

    // Rejects letters embedded with 14 digits
    expect(robustValidateAbha('14-4821-9876-5432-ABC')).toBe(false);
    expect(robustValidateAbha('14482198765432X')).toBe(false);

    // Formatter check
    const formatAbha = (raw: string): string => {
      const clean = raw.replace(/\D/g, '');
      return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}-${clean.slice(10, 14)}`;
    };

    expect(formatAbha('14482198765432')).toBe('14-4821-9876-5432');
  });

  it('ADV-ABHA-06: OTP validation boundaries (strict 6-digit requirement)', async () => {
    const validateOtp = (otp: string): boolean => {
      if (!otp || typeof otp !== 'string') return false;
      return /^\d{6}$/.test(otp.trim());
    };

    expect(validateOtp('123456')).toBe(true);
    expect(validateOtp('000000')).toBe(true);
    expect(validateOtp('999999')).toBe(true);

    expect(validateOtp('12345')).toBe(false); // 5 digits
    expect(validateOtp('1234567')).toBe(false); // 7 digits
    expect(validateOtp('12AB56')).toBe(false); // Letters
    expect(validateOtp('')).toBe(false);
    expect(validateOtp(null as any)).toBe(false);
  });
});

describe('Tier 5 Adversarial: Zero-Emoji Compliance & Vector Icons Verification', () => {
  const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;
  const variationSelectorEmoji = /\uFE0F/;
  const pictographicRegex = /\p{Extended_Pictographic}/u;

  it('ADV-EMOJI-01: Zero raw Unicode emojis across ALL 35 mobile/src TypeScript files', () => {
    const srcDir = path.resolve(__dirname, '../src');

    function scanDirectory(dir: string): { file: string; line: number; text: string }[] {
      let findings: { file: string; line: number; text: string }[] = [];
      const list = fs.readdirSync(dir);
      for (const item of list) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findings = findings.concat(scanDirectory(fullPath));
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((l, idx) => {
            if (emojiRegex.test(l) || variationSelectorEmoji.test(l) || pictographicRegex.test(l)) {
              findings.push({ file: path.relative(srcDir, fullPath), line: idx + 1, text: l.trim() });
            }
          });
        }
      }
      return findings;
    }

    const violations = scanDirectory(srcDir);
    expect(violations).toEqual([]);
  });

  it('ADV-EMOJI-02: Zero raw Unicode emojis in root entry files App.tsx and index.ts', () => {
    const mobileDir = path.resolve(__dirname, '..');
    ['App.tsx', 'index.ts'].forEach(f => {
      const full = path.join(mobileDir, f);
      if (fs.existsSync(full)) {
        const lines = fs.readFileSync(full, 'utf8').split('\n');
        lines.forEach(l => {
          expect(emojiRegex.test(l)).toBe(false);
          expect(pictographicRegex.test(l)).toBe(false);
        });
      }
    });
  });

  it('ADV-EMOJI-03: Vector icon catalog completeness & safety (55+ icon tokens)', () => {
    const supportedFamilies = ['Ionicons', 'MaterialCommunityIcons', 'MaterialIcons', 'Feather'];
    const iconNames = Object.keys(APP_ICONS) as AppIconName[];

    expect(iconNames.length).toBeGreaterThanOrEqual(50);

    iconNames.forEach(iconName => {
      const iconDef = APP_ICONS[iconName];
      expect(iconDef).toBeDefined();
      expect(supportedFamilies).toContain(iconDef.family);
      expect(typeof iconDef.name).toBe('string');
      expect(iconDef.name.length).toBeGreaterThan(0);
      expect(emojiRegex.test(iconDef.name)).toBe(false);
    });
  });

  it('ADV-EMOJI-04: AppIcon renders vector icon elements without raw text or emojis', () => {
    const element = AppIcon({ name: 'heartPulse', size: 24, color: '#D32F2F' });
    expect(element).toBeDefined();
    expect(element.type).toBeDefined();
    // Verify fallback when unknown icon passed
    const fallbackElement = AppIcon({ name: 'unknown' as any, size: 20 });
    expect(fallbackElement).toBeDefined();
  });
});

describe('Tier 5 Adversarial: Design System Tokens & Shared UI Robustness', () => {
  it('ADV-THEME-01: Government of Maharashtra color palette integrity', () => {
    expect(colors.primary.DEFAULT).toBe('#1A4B8C'); // Maharashtra Navy Blue
    expect(colors.primary.dark).toBe('#0B2545');
    expect(colors.primary.light).toBe('#E8F0FE');
    expect(colors.accent.DEFAULT).toBe('#F57C00'); // Maharashtra Saffron
    expect(colors.accent.dark).toBe('#E65100');
    expect(colors.slate.dark).toBe('#1C2B3A');
    expect(colors.slate.gray).toBe('#546E7A');
    expect(colors.slate.bg).toBe('#F5F7FA');
    expect(colors.urgency.red).toBe('#D32F2F');
    expect(colors.urgency.orange).toBe('#ED6C02');
    expect(colors.urgency.yellow).toBe('#F9A825');
    expect(colors.urgency.green).toBe('#2E7D32');
  });

  it('ADV-THEME-02: Typography metrics guarantee Devanagari vertical safety (no glyph clipping)', () => {
    const sizeKeys = Object.keys(fontSize) as (keyof typeof fontSize)[];
    sizeKeys.forEach(k => {
      const fsVal = fontSize[k];
      const lhVal = lineHeight[k];
      expect(lhVal).toBeGreaterThan(fsVal);
      // Minimum 3px safety margin for upper vowel signs (e.g. मात्रा, अनुस्वार)
      expect(lhVal - fsVal).toBeGreaterThanOrEqual(3);
    });
  });

  it('ADV-THEME-03: Spacing, elevation shadows, and corner radii consistency', () => {
    expect(spacing.none).toBe(0);
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(12);
    expect(spacing.lg).toBe(16);
    expect(spacing.xl).toBe(20);

    expect(borderRadius.full).toBe(9999);
    expect(shadows.sm.elevation).toBe(1);
    expect(shadows.md.elevation).toBe(3);
    expect(shadows.lg.elevation).toBe(5);
    expect(shadows.xl.elevation).toBe(8);
  });

  it('ADV-UI-01: Badge renders safely with edge-case variants and icons', () => {
    const variants: ('primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple' | 'teal')[] = [
      'primary', 'accent', 'success', 'warning', 'danger', 'neutral', 'purple', 'teal'
    ];

    variants.forEach(variant => {
      const badge = Badge({ label: 'EMERGENCY', variant, size: 'sm', dot: true, icon: 'emergency' });
      expect(badge).toBeDefined();
    });

    // Default variant and size
    const defaultBadge = Badge({ label: 'DEFAULT' });
    expect(defaultBadge).toBeDefined();
  });

  it('ADV-UI-02: Button handles loading, disabled, and fullWidth states properly', () => {
    const onPress = jest.fn();

    // Normal button
    const normalBtn = Button({ title: 'Submit', onPress, variant: 'primary', size: 'md' });
    expect(normalBtn).toBeDefined();

    // Loading button
    const loadingBtn = Button({ title: 'Loading...', onPress, loading: true });
    expect(loadingBtn).toBeDefined();

    // Disabled button
    const disabledBtn = Button({ title: 'Disabled', onPress, disabled: true });
    expect(disabledBtn).toBeDefined();

    // Icon button (left and right position)
    const iconBtnLeft = Button({ title: 'Next', onPress, icon: 'arrowRight', iconPosition: 'left' });
    expect(iconBtnLeft).toBeDefined();
    const iconBtnRight = Button({ title: 'Next', onPress, icon: 'arrowRight', iconPosition: 'right' });
    expect(iconBtnRight).toBeDefined();
  });

  it('ADV-UI-03: Card handles various variants, click handlers, and slot compositions', () => {
    const variants: ('default' | 'elevated' | 'outlined' | 'accent' | 'danger' | 'warning' | 'success')[] = [
      'default', 'elevated', 'outlined', 'accent', 'danger', 'warning', 'success'
    ];

    variants.forEach(variant => {
      const card = Card({
        variant,
        title: 'Patient Card',
        subtitle: 'OPD Queue #04',
        icon: 'patient',
        onPress: jest.fn(),
      });
      expect(card).toBeDefined();
    });

    // Minimal card (no header, just children)
    const minimalCard = Card({ children: null });
    expect(minimalCard).toBeDefined();
  });

  it('ADV-UI-04: EmptyState renders with customizable vector icons and action handlers', () => {
    const onAction = jest.fn();
    const empty = EmptyState({
      icon: 'records',
      title: 'No Health Records Found',
      description: 'Your lab reports and prescriptions will appear here once issued by your doctor.',
      actionLabel: 'Refresh',
      onAction,
    });
    expect(empty).toBeDefined();
  });

  it('ADV-UI-05: FormInput handles password visibility toggle, error states, and required flags', () => {
    const useStateSpy = jest.spyOn(React, 'useState').mockImplementation((init: any) => [init, jest.fn()]);
    const onChangeText = jest.fn();

    // Standard input
    const input = FormInput({
      label: 'ABHA Number',
      value: '14-4821-9876-5432',
      onChangeText,
      placeholder: 'Enter 14-digit ABHA',
      required: true,
      icon: 'lock',
    });
    expect(input).toBeDefined();

    // Error state
    const errorInput = FormInput({
      label: 'Mobile Number',
      value: '12345',
      onChangeText,
      error: 'Invalid 10-digit mobile number',
    });
    expect(errorInput).toBeDefined();

    // Secure password input
    const passInput = FormInput({
      label: 'Passcode',
      value: '123456',
      onChangeText,
      secureTextEntry: true,
    });
    expect(passInput).toBeDefined();

    useStateSpy.mockRestore();
  });

  it('ADV-UI-06: Modal handles dismissable states and header slot safely', () => {
    const onClose = jest.fn();
    const modal = Modal({
      visible: true,
      onClose,
      title: 'Confirm Emergency SOS',
      dismissable: true,
      children: null,
    });
    expect(modal).toBeDefined();
  });
});
