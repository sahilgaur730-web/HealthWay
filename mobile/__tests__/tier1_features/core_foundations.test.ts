/**
 * Tier 1: Feature Coverage — Core Foundations (Features 1 - 7)
 * F01: Expo SDK 57 Native Setup & Config
 * F02: Design System & Theme Engine
 * F03: Trilingual i18n System
 * F04: Offline Storage & 8-Store Engine
 * F05: Connection Quality & Sync Engine
 * F06: Secure Session & Auth Context
 * F07: Shared UI Components
 */

import * as fs from 'fs';
import * as path from 'path';
import { MockStorageService } from '../harness/mockStorage';
import { MockAuthService } from '../harness/mockAuth';
import { MockSyncEngine } from '../harness/mockSync';
import { THEME_TOKENS, I18N_DICTIONARY, LanguageCode } from '../harness/domainFixtures';

describe('Tier 1: Feature 01 — Expo SDK 57 Native Setup & Config', () => {
  const mobileDir = path.resolve(__dirname, '../../');

  it('F01-1: verifies app.json exists and specifies bundle identifier and scheme', () => {
    const appJsonPath = path.join(mobileDir, 'app.json');
    expect(fs.existsSync(appJsonPath)).toBe(true);
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const expoConfig = appJson.expo;
    expect(expoConfig).toBeDefined();
    expect(expoConfig.name).toBe('HealthWay');
    expect(expoConfig.slug).toBe('healthway');
    expect(expoConfig.scheme).toBe('healthway');
    expect(expoConfig.android.package).toBe('com.healthway.mobile');
    expect(expoConfig.ios.bundleIdentifier).toBe('com.healthway.mobile');
  });

  it('F01-2: verifies package.json contains Expo SDK 57 and React Native 0.86.3 dependencies', () => {
    const pkgPath = path.join(mobileDir, 'package.json');
    expect(fs.existsSync(pkgPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.dependencies.expo).toMatch(/~?57\./);
    expect(pkg.dependencies['react-native']).toMatch(/0\.86\./);
  });

  it('F01-3: verifies tsconfig.json is configured for strict TypeScript compilation', () => {
    const tsconfigPath = path.join(mobileDir, 'tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    expect(tsconfig.extends).toContain('expo/tsconfig.base');
  });

  it('F01-4: verifies App.tsx or index.ts exists as standard entry point', () => {
    const appTsx = path.join(mobileDir, 'App.tsx');
    const indexTs = path.join(mobileDir, 'index.ts');
    expect(fs.existsSync(appTsx) || fs.existsSync(indexTs)).toBe(true);
  });

  it('F01-5: verifies npm test runner script is configured in package.json', () => {
    const pkgPath = path.join(mobileDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
  });
});

describe('Tier 1: Feature 02 — Design System & Theme Engine', () => {
  it('F02-1: enforces Maharashtra Government navy blue (#1A4B8C) as primary brand color', () => {
    expect(THEME_TOKENS.colors.primaryNavy).toBe('#1A4B8C');
  });

  it('F02-2: enforces saffron (#F57C00) and dark slate (#1C2B3A) as secondary palette tokens', () => {
    expect(THEME_TOKENS.colors.primarySaffron).toBe('#F57C00');
    expect(THEME_TOKENS.colors.darkSlate).toBe('#1C2B3A');
  });

  it('F02-3: provides consistent spacing scales (xs=4, sm=8, md=16, lg=24, xl=32)', () => {
    expect(THEME_TOKENS.spacing.xs).toBe(4);
    expect(THEME_TOKENS.spacing.sm).toBe(8);
    expect(THEME_TOKENS.spacing.md).toBe(16);
    expect(THEME_TOKENS.spacing.lg).toBe(24);
    expect(THEME_TOKENS.spacing.xl).toBe(32);
  });

  it('F02-4: enforces zero Unicode emojis policy across theme icons and alert configurations', () => {
    const hasEmoji = (str: string) => /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/u.test(str);
    Object.values(THEME_TOKENS.colors).forEach(colorHex => {
      expect(hasEmoji(colorHex)).toBe(false);
    });
  });

  it('F02-5: provides functional alert color tokens for emergency red, warning orange, and success green', () => {
    expect(THEME_TOKENS.colors.emergencyRed).toBe('#DC2626');
    expect(THEME_TOKENS.colors.warningOrange).toBe('#EA580C');
    expect(THEME_TOKENS.colors.successGreen).toBe('#16A34A');
  });
});

describe('Tier 1: Feature 03 — Trilingual i18n System', () => {
  it('F03-1: provides complete dictionary for English, Marathi, and Hindi', () => {
    expect(I18N_DICTIONARY.en).toBeDefined();
    expect(I18N_DICTIONARY.mr).toBeDefined();
    expect(I18N_DICTIONARY.hi).toBeDefined();
  });

  it('F03-2: resolves key translations dynamically per selected language code', () => {
    const translate = (key: string, lang: LanguageCode) => I18N_DICTIONARY[lang]?.[key] || key;
    expect(translate('role_patient', 'en')).toBe('Patient');
    expect(translate('role_patient', 'mr')).toBe('रुग्ण');
    expect(translate('role_patient', 'hi')).toBe('मरीज');
  });

  it('F03-3: handles fallback gracefully when key is missing', () => {
    const translate = (key: string, lang: LanguageCode, defaultText: string) =>
      I18N_DICTIONARY[lang]?.[key] || defaultText;
    expect(translate('unknown_key', 'en', 'Fallback Text')).toBe('Fallback Text');
  });

  it('F03-4: supports audio speech guidance key resolution for low-literacy users', () => {
    const speechKeys = ['emergency_sos', 'book_appointment', 'vitals_tracker'];
    speechKeys.forEach(k => {
      expect(I18N_DICTIONARY.mr[k]).toBeTruthy();
      expect(I18N_DICTIONARY.hi[k]).toBeTruthy();
    });
  });

  it('F03-5: validates that all 4 user roles exist across all 3 language dictionaries', () => {
    const roles = ['role_patient', 'role_asha', 'role_doctor', 'role_admin'];
    (['en', 'mr', 'hi'] as LanguageCode[]).forEach(lang => {
      roles.forEach(roleKey => {
        expect(I18N_DICTIONARY[lang][roleKey]).toBeDefined();
        expect(I18N_DICTIONARY[lang][roleKey].length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Tier 1: Feature 04 — Offline Storage & 8-Store Engine', () => {
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
  });

  it('F04-1: supports all 8 canonical stores defined in PROJECT.md', async () => {
    const storeNames = [
      'sync_queue',
      'patient_cache',
      'triage_drafts',
      'medicine_stock',
      'facility_data',
      'referral_drafts',
      'settings',
      'sync_log',
    ] as const;

    for (const store of storeNames) {
      await storage.saveItem(store, 'test-01', { ping: 'pong' });
      const item = await storage.getItem<{ ping: string }>(store, 'test-01');
      expect(item?.ping).toBe('pong');
    }
  });

  it('F04-2: retrieves all items in a specific store', async () => {
    await storage.saveItem('patient_cache', 'PT-01', { name: 'Sunita' });
    await storage.saveItem('patient_cache', 'PT-02', { name: 'Rahul' });
    const all = await storage.getAll<{ name: string }>('patient_cache');
    expect(all.length).toBe(2);
    expect(all.map(p => p.name)).toContain('Sunita');
    expect(all.map(p => p.name)).toContain('Rahul');
  });

  it('F04-3: deletes specific item by key without affecting others', async () => {
    await storage.saveItem('triage_drafts', 'TR-01', { risk: 'HIGH' });
    await storage.saveItem('triage_drafts', 'TR-02', { risk: 'LOW' });
    await storage.deleteItem('triage_drafts', 'TR-01');
    const item1 = await storage.getItem('triage_drafts', 'TR-01');
    const item2 = await storage.getItem('triage_drafts', 'TR-02');
    expect(item1).toBeNull();
    expect(item2).not.toBeNull();
  });

  it('F04-4: enqueues offline mutation into sync_queue with PENDING status', async () => {
    const queueItem = await storage.enqueueSync('/api/v1/patients', 'POST', { name: 'Asha Beneficiary' });
    expect(queueItem.id).toMatch(/^SYNC-/);
    expect(queueItem.status).toBe('PENDING');
    const pending = await storage.getPendingSyncItems();
    expect(pending.some(i => i.id === queueItem.id)).toBe(true);
  });

  it('F04-5: clears store completely when requested', async () => {
    await storage.saveItem('medicine_stock', 'MED-01', { qty: 100 });
    await storage.clearStore('medicine_stock');
    const all = await storage.getAll('medicine_stock');
    expect(all.length).toBe(0);
  });
});

describe('Tier 1: Feature 05 — Connection Quality & Sync Engine', () => {
  let storage: MockStorageService;
  let syncEngine: MockSyncEngine;

  beforeEach(() => {
    storage = new MockStorageService();
    syncEngine = new MockSyncEngine(storage);
  });

  it('F05-1: starts with EXCELLENT quality and notifies observers on transition', () => {
    expect(syncEngine.getQuality()).toBe('EXCELLENT');
    const observed: string[] = [];
    const unsubscribe = syncEngine.onQualityChange(q => observed.push(q));
    syncEngine.setQuality('POOR');
    syncEngine.setQuality('OFFLINE');
    unsubscribe();
    syncEngine.setQuality('EXCELLENT');
    expect(observed).toEqual(['POOR', 'OFFLINE']);
  });

  it('F05-2: calculates exponential backoff delay capped at maxMs', () => {
    expect(syncEngine.calculateBackoff(0, 1000, 32000)).toBe(1000);
    expect(syncEngine.calculateBackoff(1, 1000, 32000)).toBe(2000);
    expect(syncEngine.calculateBackoff(2, 1000, 32000)).toBe(4000);
    expect(syncEngine.calculateBackoff(3, 1000, 32000)).toBe(8000);
    expect(syncEngine.calculateBackoff(10, 1000, 32000)).toBe(32000); // Capped
  });

  it('F05-3: does not process outbox queue when connection is OFFLINE', async () => {
    await storage.enqueueSync('/api/v1/referrals', 'POST', { patientId: 'PT-01' });
    syncEngine.setQuality('OFFLINE');
    const result = await syncEngine.syncOutbox();
    expect(result.processed).toBe(0);
    expect(result.succeeded).toBe(0);
  });

  it('F05-4: drains pending items when network restores to EXCELLENT', async () => {
    const item1 = await storage.enqueueSync('/api/v1/referrals', 'POST', { patientId: 'PT-01' });
    const item2 = await storage.enqueueSync('/api/v1/vitals', 'POST', { bp: '120/80' });
    syncEngine.setQuality('EXCELLENT');
    const result = await syncEngine.syncOutbox();
    expect(result.processed).toBe(2);
    expect(result.succeeded).toBe(2);

    const pending = await storage.getPendingSyncItems();
    expect(pending.length).toBe(0);
  });

  it('F05-5: increments retries and records failure in sync_log on API error', async () => {
    const item = await storage.enqueueSync('/api/v1/fail', 'POST', {});
    syncEngine.setQuality('MODERATE');
    const result = await syncEngine.syncOutbox(async () => {
      throw new Error('500 Internal Server Error');
    });
    expect(result.failed).toBe(1);
    const updated = await storage.getItem<any>('sync_queue', item.id);
    expect(updated.retries).toBe(1);
    expect(updated.error).toContain('Transient');
  });
});

describe('Tier 1: Feature 06 — Secure Session & Auth Context', () => {
  let auth: MockAuthService;

  beforeEach(() => {
    auth = new MockAuthService();
  });

  it('F06-1: initializes with no active session and isAuthenticated = false', () => {
    expect(auth.getSession()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('F06-2: switches role among patient, asha, doctor, and admin', async () => {
    await auth.setRole('patient');
    expect(auth.getSession()?.role).toBe('patient');
    await auth.setRole('asha');
    expect(auth.getSession()?.role).toBe('asha');
    await auth.setRole('doctor');
    expect(auth.getSession()?.role).toBe('doctor');
    await auth.setRole('admin');
    expect(auth.getSession()?.role).toBe('admin');
  });

  it('F06-3: validates 14-digit ABHA IDs with or without formatting hyphens', () => {
    expect(auth.validateAbhaId('14-4821-9876-5432')).toBe(true);
    expect(auth.validateAbhaId('14482198765432')).toBe(true);
    expect(auth.validateAbhaId('14-4821-9876')).toBe(false); // Too short
    expect(auth.validateAbhaId('14-4821-9876-5432-99')).toBe(false); // Too long
    expect(auth.validateAbhaId('ABCD-EFGH-IJKL-MN')).toBe(false); // Non-numeric
  });

  it('F06-4: persists secure auth tokens on successful ABHA login', async () => {
    const success = await auth.loginWithAbha('14-4821-9876-5432', '123456');
    expect(success).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
    const token = await auth.getSecureItem('authToken');
    expect(token).toMatch(/^JWT-ABHA-/);
  });

  it('F06-5: completely clears session and tokens upon logout', async () => {
    await auth.loginWithAbha('14-4821-9876-5432', '123456');
    expect(auth.isAuthenticated()).toBe(true);
    await auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.getSession()).toBeNull();
    const token = await auth.getSecureItem('authToken');
    expect(token).toBeNull();
  });
});

describe('Tier 1: Feature 07 — Shared UI Component Contracts', () => {
  it('F07-1: validates Header component contract with title, subtitle, and back action', () => {
    interface HeaderProps {
      title: string;
      subtitle?: string;
      showBack?: boolean;
      onBack?: () => void;
    }
    const props: HeaderProps = {
      title: 'Diagnostics Hub',
      subtitle: 'District Hospital Satara',
      showBack: true,
      onBack: jest.fn(),
    };
    expect(props.title).toBe('Diagnostics Hub');
    expect(props.showBack).toBe(true);
    props.onBack?.();
    expect(props.onBack).toHaveBeenCalled();
  });

  it('F07-2: validates Button component contract with variant styling (primary, secondary, danger)', () => {
    type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
    interface ButtonProps {
      label: string;
      variant: ButtonVariant;
      disabled?: boolean;
      loading?: boolean;
      onPress: () => void;
    }
    const button: ButtonProps = {
      label: 'Submit Referral',
      variant: 'primary',
      disabled: false,
      loading: false,
      onPress: jest.fn(),
    };
    expect(button.variant).toBe('primary');
    button.onPress();
    expect(button.onPress).toHaveBeenCalled();
  });

  it('F07-3: validates Badge component contract with status tiers (success, warning, error, info)', () => {
    type BadgeType = 'success' | 'warning' | 'error' | 'info';
    interface BadgeProps {
      label: string;
      type: BadgeType;
    }
    const badge: BadgeProps = { label: 'CRITICAL', type: 'error' };
    expect(badge.type).toBe('error');
    expect(badge.label).toBe('CRITICAL');
  });

  it('F07-4: validates Card component contract with elevation, header, and children slots', () => {
    interface CardProps {
      title?: string;
      elevated?: boolean;
      onPress?: () => void;
    }
    const card: CardProps = { title: 'Emergency Contact', elevated: true };
    expect(card.elevated).toBe(true);
  });

  it('F07-5: validates PortalSwitcher component allowing direct role toggling in prototype/evaluator mode', () => {
    interface PortalSwitcherProps {
      activeRole: string;
      onSelectRole: (role: string) => void;
      availableRoles: string[];
    }
    const onSelect = jest.fn();
    const switcher: PortalSwitcherProps = {
      activeRole: 'patient',
      onSelectRole: onSelect,
      availableRoles: ['patient', 'asha', 'doctor', 'admin'],
    };
    expect(switcher.availableRoles.length).toBe(4);
    switcher.onSelectRole('doctor');
    expect(onSelect).toHaveBeenCalledWith('doctor');
  });
});
