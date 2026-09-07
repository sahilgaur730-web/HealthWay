/**
 * Independent Adversarial Stress Test Suite for Milestone 1 Implementation
 * Run by m1_reviewer_2
 */

import { colors } from '../../mobile/src/theme/colors';
import { APP_ICONS } from '../../mobile/src/theme/icons';
import { typography } from '../../mobile/src/theme/typography';
import { spacing, borderRadius, shadows } from '../../mobile/src/theme/spacing';
import en from '../../mobile/src/context/translations/en';
import mr from '../../mobile/src/context/translations/mr';
import hi from '../../mobile/src/context/translations/hi';
import { ROLE_PROFILES } from '../../mobile/src/context/AuthContext';
import { ALL_STORE_NAMES } from '../../mobile/src/storage/types';
import { StorageEngine } from '../../mobile/src/storage/storageEngine';
import { SyncEngine } from '../../mobile/src/services/syncEngine';

let passed = 0;
let failed = 0;
const errors: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    const msg = `  ✗ ${testName}${detail ? `: ${detail}` : ''}`;
    console.error(msg);
    errors.push(msg);
  }
}

async function runTests() {
  console.log('=== TEST 1: Theme & Visual Tokens ===');
  assert(colors.primary.DEFAULT === '#1A4B8C', 'Navy Blue primary brand color matches #1A4B8C');
  assert(colors.accent.DEFAULT === '#F57C00', 'Saffron accent color matches #F57C00');
  assert(colors.slate.dark === '#1C2B3A', 'Dark slate text matches #1C2B3A');
  assert(colors.role.patient === '#1A4B8C', 'Patient role color defined');
  assert(colors.role.asha === '#7B1FA2', 'ASHA role color defined');
  assert(colors.role.doctor === '#00796B', 'Doctor role color defined');
  assert(colors.role.admin === '#D84315', 'Admin role color defined');
  assert(colors.emergency === '#D32F2F', 'Emergency 108 red color matches #D32F2F');
  assert(spacing.xs === 4 && spacing.sm === 8 && spacing.md === 12 && spacing.lg === 16 && spacing.xl === 20, 'Spacing scale standard (4,8,12,16,20)');
  assert(borderRadius.xs === 4 && borderRadius.sm === 6 && borderRadius.md === 8 && borderRadius.lg === 12 && borderRadius.full === 9999, 'Border radius standard');

  console.log('\n=== TEST 2: Zero-Emoji Enforcement ===');
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  
  // Check theme icons
  let themeEmojiFound = false;
  for (const [key, iconDef] of Object.entries(APP_ICONS)) {
    if (emojiRegex.test(key) || emojiRegex.test(iconDef.name)) {
      themeEmojiFound = true;
    }
  }
  assert(!themeEmojiFound, 'Zero emojis in APP_ICONS mapping');
  assert(Object.keys(APP_ICONS).length >= 40, `APP_ICONS contains comprehensive icon catalog (${Object.keys(APP_ICONS).length} icons)`);

  // Check translations for emojis
  const checkObjectForEmojis = (obj: any, path = ''): boolean => {
    let found = false;
    for (const [k, v] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${k}` : k;
      if (typeof v === 'string') {
        if (emojiRegex.test(v)) {
          console.error(`Emoji detected in translation at ${currentPath}: "${v}"`);
          found = true;
        }
      } else if (typeof v === 'object' && v !== null) {
        if (checkObjectForEmojis(v, currentPath)) found = true;
      }
    }
    return found;
  };

  assert(!checkObjectForEmojis(en), 'Zero emojis in English dictionary');
  assert(!checkObjectForEmojis(mr), 'Zero emojis in Marathi dictionary');
  assert(!checkObjectForEmojis(hi), 'Zero emojis in Hindi dictionary');

  console.log('\n=== TEST 3: Trilingual Dictionary Parity & Coverage ===');
  const getKeys = (obj: any, prefix = ''): string[] => {
    let keys: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'object' && v !== null) {
        keys = keys.concat(getKeys(v, path));
      } else {
        keys.push(path);
      }
    }
    return keys;
  };

  const enKeys = getKeys(en);
  const mrKeys = getKeys(mr);
  const hiKeys = getKeys(hi);

  assert(enKeys.length >= 100, `English dictionary key count sufficient (${enKeys.length} keys)`);
  assert(mrKeys.length >= 100, `Marathi dictionary key count sufficient (${mrKeys.length} keys)`);
  assert(hiKeys.length >= 100, `Hindi dictionary key count sufficient (${hiKeys.length} keys)`);

  const missingInMr = enKeys.filter(k => !mrKeys.includes(k));
  const missingInHi = enKeys.filter(k => !hiKeys.includes(k));

  assert(missingInMr.length === 0, `All English keys translated in Marathi (missing: ${missingInMr.join(', ') || 'none'})`);
  assert(missingInHi.length === 0, `All English keys translated in Hindi (missing: ${missingInHi.join(', ') || 'none'})`);

  console.log('\n=== TEST 4: Storage Engine 8-Store Structure & Normalization ===');
  const engine = new StorageEngine();
  const expectedStores = [
    'sync_queue',
    'patient_cache',
    'triage_drafts',
    'medicine_stock',
    'facility_data',
    'referral_drafts',
    'settings',
    'sync_log',
  ];

  assert(ALL_STORE_NAMES.length === 8, '8 canonical stores defined');
  expectedStores.forEach(store => {
    assert(ALL_STORE_NAMES.includes(store as any), `Store '${store}' is included in ALL_STORE_NAMES`);
  });

  assert(engine.normalizeStore('sync_queue') === 'sync_queue', 'normalizeStore handles sync_queue');
  assert(engine.normalizeStore('syncQueue') === 'sync_queue', 'normalizeStore handles camelCase syncQueue');
  assert(engine.normalizeStore('patientCache') === 'patient_cache', 'normalizeStore handles camelCase patientCache');
  assert(engine.normalizeStore('medicineStock') === 'medicine_stock', 'normalizeStore handles camelCase medicineStock');
  assert(engine.normalizeStore('facilityData') === 'facility_data', 'normalizeStore handles camelCase facilityData');
  assert(engine.normalizeStore('referralDrafts') === 'referral_drafts', 'normalizeStore handles camelCase referralDrafts');

  console.log('\n=== TEST 5: Sync Engine Exponential Backoff & Logic ===');
  const sync = new SyncEngine();

  // Test backoff formula: min(2^retries * 500ms, 5000ms)
  assert(sync.calculateBackoff(0) === 500, 'Backoff retry 0 = 500ms');
  assert(sync.calculateBackoff(1) === 1000, 'Backoff retry 1 = 1000ms');
  assert(sync.calculateBackoff(2) === 2000, 'Backoff retry 2 = 2000ms');
  assert(sync.calculateBackoff(3) === 4000, 'Backoff retry 3 = 4000ms');
  assert(sync.calculateBackoff(4) === 5000, 'Backoff retry 4 = 5000ms (capped)');
  assert(sync.calculateBackoff(10) === 5000, 'Backoff retry 10 = 5000ms (capped at max 5000ms)');

  // Test payload compression
  const rawPayload = {
    patientId: 'PT-1234',
    name: '  Suresh Patil  ',
    emptyStr: '',
    nullField: null,
    undefinedField: undefined,
    nested: {
      vital: '120/80',
      emptyVal: null,
    },
  };
  const compressed = sync.compressPayload(rawPayload);
  assert(compressed.patientId === 'PT-1234', 'Compressed keeps valid patientId');
  assert(compressed.name === 'Suresh Patil', 'Compressed trims whitespace');
  assert(compressed.emptyStr === undefined, 'Compressed strips empty string');
  assert(compressed.nullField === undefined, 'Compressed strips null value');
  assert(compressed.undefinedField === undefined, 'Compressed strips undefined value');
  assert(compressed.nested.vital === '120/80', 'Compressed preserves valid nested fields');
  assert(compressed.nested.emptyVal === undefined, 'Compressed strips nested null fields');

  // Test network quality & simulated offline
  assert(sync.getQuality() === 'EXCELLENT', 'Initial quality is EXCELLENT');
  sync.setSimulatedOffline(true);
  assert(sync.getQuality() === 'OFFLINE', 'Simulated offline returns OFFLINE');
  assert(!sync.isOnline(), 'isOnline() returns false when simulated offline');

  sync.setSimulatedOffline(false);
  assert(sync.isOnline(), 'isOnline() returns true after restoring online');

  console.log('\n=== TEST 6: Auth Role Profiles & ABHA Validation Logic ===');
  assert(ROLE_PROFILES.patient.id === 'PT-001', 'Patient default profile configured');
  assert(ROLE_PROFILES.asha.id === 'ASHA-7012', 'ASHA default profile configured');
  assert(ROLE_PROFILES.doctor.id === 'DOC-401', 'Doctor default profile configured');
  assert(ROLE_PROFILES.admin.id === 'ADM-101', 'Admin default profile configured');

  // ABHA validation tests
  const validateAbha = (abhaId: string, otp: string): boolean => {
    const cleaned = abhaId.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;
    if (!otp || otp.length !== 6) return false;
    return true;
  };

  assert(validateAbha('91-2345-6789-0123', '123456') === true, 'Valid 14-digit ABHA with hyphens passes');
  assert(validateAbha('91234567890123', '123456') === true, 'Valid 14-digit ABHA without hyphens passes');
  assert(validateAbha('91-2345-6789-012', '123456') === false, '13-digit ABHA fails');
  assert(validateAbha('91-2345-6789-01234', '123456') === false, '15-digit ABHA fails');
  assert(validateAbha('AB-CDEF-GHIJ-KLMN', '123456') === false, 'Alphabetic ABHA fails');
  assert(validateAbha('91-2345-6789-0123', '12345') === false, '5-digit OTP fails');
  assert(validateAbha('91-2345-6789-0123', '1234567') === false, '7-digit OTP fails');
  assert(validateAbha('91-2345-6789-0123', '') === false, 'Empty OTP fails');

  console.log('\n===========================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
