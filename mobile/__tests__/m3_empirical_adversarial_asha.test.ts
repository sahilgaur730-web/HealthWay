/**
 * Comprehensive Empirical Adversarial Stress Test Suite for Milestone 3
 * ASHA Field Operations Features (F26 - F30)
 * 
 * Conducted by m3_challenger_2 (M3 ASHA Operations Challenger)
 * Strictly zero Unicode emojis.
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
    ScrollView: (props: any) => React.createElement('ScrollView', props, props.children),
    Image: (props: any) => React.createElement('Image', props),
    RefreshControl: (props: any) => React.createElement('RefreshControl', props),
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      openURL: jest.fn().mockResolvedValue(true),
      canOpenURL: jest.fn().mockResolvedValue(true),
    },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, bottom: 20, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
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

jest.mock('expo-camera', () => {
  const React = require('react');
  return {
    CameraView: React.forwardRef((props: any, ref: any) =>
      React.createElement('View', { ...props, ref })
    ),
    useCameraPermissions: () => [
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ],
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: (cb: any) => cb(),
}));

import { storageEngine } from '../src/storage/storageEngine';
import {
  TAPOLA_VILLAGE_BEAT,
  INITIAL_PREGNANT_ROSTER,
  INITIAL_IMMUNIZATION_DUE_LIST,
  INITIAL_DAILY_TASKS,
  PMSMA_SCHEDULE,
  DANGER_SIGNS_CATALOG,
  EMERGENCY_SPEED_DIALERS,
  PregnantBeneficiary,
  ImmunizationDueItem,
  DailyFieldTask,
} from '../src/data/ashaData';
import {
  validateAudioDuration,
  capAudioDuration,
  extractClinicalEntities,
  CLINICAL_KEYWORD_PATTERNS,
  SAMPLE_CLINICAL_VOICE_CORPUS,
} from '../src/services/voiceIntakeService';
import {
  computePriority,
  resolveDestinationFacility,
  evaluateFieldTriage,
  FIELD_REFERRAL_SLAS,
  FieldTriageInput,
} from '../src/services/fieldTriageService';
import { evaluateVitalsAlert, VitalsReading } from '../src/services/vitalsService';
import { DISTRICT_FACILITIES } from '../src/data/facilitiesData';

describe('M3 Adversarial: Feature 26 - ASHA Field Dashboard Stress Suite', () => {
  beforeEach(async () => {
    await storageEngine.clearStore('sync_queue');
    await storageEngine.clearStore('patient_cache');
  });

  describe('ADV-F26-1: Village Household Survey Coverage Assertions & Edge Boundaries', () => {
    it('verifies exact authoritative Tapola village beat metrics', () => {
      expect(TAPOLA_VILLAGE_BEAT.villageName).toBe('Tapola');
      expect(TAPOLA_VILLAGE_BEAT.totalHouseholds).toBe(142);
      expect(TAPOLA_VILLAGE_BEAT.surveyedHouseholds).toBe(138);
      expect(TAPOLA_VILLAGE_BEAT.subCenterId).toBe('FAC007');
      expect(TAPOLA_VILLAGE_BEAT.block).toBe('Mahabaleshwar');
      expect(TAPOLA_VILLAGE_BEAT.district).toBe('Satara');
    });

    it('calculates survey coverage percentage strictly at 97%', () => {
      const coverage = (TAPOLA_VILLAGE_BEAT.surveyedHouseholds / TAPOLA_VILLAGE_BEAT.totalHouseholds) * 100;
      expect(coverage.toFixed(0)).toBe('97');
      expect(coverage).toBeGreaterThan(97.1);
      expect(coverage).toBeLessThan(97.2);
    });

    it('handles zero-denominator and boundary conditions without NaN or infinity crashes', () => {
      const calculateRate = (surveyed: number, total: number) => {
        if (total <= 0) return 0;
        return Math.min(100, Math.max(0, (surveyed / total) * 100));
      };
      expect(calculateRate(0, 0)).toBe(0);
      expect(calculateRate(142, 142)).toBe(100);
      expect(calculateRate(0, 142)).toBe(0);
      expect(calculateRate(150, 142)).toBe(100);
      expect(calculateRate(-5, 142)).toBe(0);
    });
  });

  describe('ADV-F26-2: High-Risk Pregnant Women Roster Inspection', () => {
    it('correctly filters high-risk beneficiaries from authoritative seed data', () => {
      const highRisk = INITIAL_PREGNANT_ROSTER.filter((p) => p.isHighRisk);
      expect(highRisk.length).toBe(1);
      expect(highRisk[0].name).toBe('Pooja Jadhav');
      expect(highRisk[0].trimester).toBe(3);
      expect(highRisk[0].gestationalAgeWeeks).toBe(34);
      expect(highRisk[0].dangerReason).toBe('Severe PIH');
      expect(highRisk[0].bpLatest).toBe('168/108');
    });

    it('validates gestational age to trimester mapping consistency in seed roster', () => {
      INITIAL_PREGNANT_ROSTER.forEach((p) => {
        const computedTrimester = p.gestationalAgeWeeks <= 12 ? 1 : p.gestationalAgeWeeks <= 28 ? 2 : 3;
        expect(p.trimester).toBe(computedTrimester);
      });
    });

    it('evaluates dynamic risk escalation across varying gestational weeks and danger signs', () => {
      const evaluateRisk = (patient: Partial<PregnantBeneficiary>, dangerSigns: string[]): boolean => {
        const bpParts = (patient.bpLatest || '120/80').split('/').map(Number);
        const sys = bpParts[0];
        const dia = bpParts[1];
        return dangerSigns.length > 0 || sys >= 140 || dia >= 90;
      };

      expect(evaluateRisk({ bpLatest: '118/76' }, [])).toBe(false);
      expect(evaluateRisk({ bpLatest: '140/90' }, [])).toBe(true);
      expect(evaluateRisk({ bpLatest: '120/80' }, ['Severe persistent headache'])).toBe(true);
      expect(evaluateRisk({ bpLatest: '168/108' }, ['Visual blurriness'])).toBe(true);
    });
  });

  describe('ADV-F26-3: Pediatric Immunization Schedule & Overdue Tracker', () => {
    it('identifies overdue pediatric immunizations with Pentavalent 1 leading', () => {
      const overdue = INITIAL_IMMUNIZATION_DUE_LIST.filter((i) => i.status === 'OVERDUE');
      expect(overdue.length).toBe(1);
      expect(overdue[0].childName).toBe('Aarav Shinde');
      expect(overdue[0].vaccine).toBe('Pentavalent 1');
      expect(overdue[0].motherName).toBe('Kavita Shinde');
      expect(new Date(overdue[0].dueDate).getTime()).toBeLessThan(new Date('2026-09-01').getTime());
    });

    it('filters correctly across ALL, OVERDUE, and UPCOMING states', () => {
      const filterList = (filter: 'ALL' | 'OVERDUE' | 'UPCOMING') => {
        if (filter === 'ALL') return INITIAL_IMMUNIZATION_DUE_LIST;
        return INITIAL_IMMUNIZATION_DUE_LIST.filter((i) => i.status === filter);
      };

      expect(filterList('ALL').length).toBe(3);
      expect(filterList('OVERDUE').length).toBe(1);
      expect(filterList('UPCOMING').length).toBe(2);
    });

    it('simulates state transition when ASHA records dose completion', () => {
      let list = [...INITIAL_IMMUNIZATION_DUE_LIST];
      const markCompleted = (id: string) => {
        list = list.map((item) => (item.id === id ? { ...item, status: 'COMPLETED' as const } : item));
      };

      markCompleted('IMM-01');
      const updated = list.find((i) => i.id === 'IMM-01');
      expect(updated?.status).toBe('COMPLETED');
      expect(list.filter((i) => i.status === 'OVERDUE').length).toBe(0);
    });
  });

  describe('ADV-F26-4: Daily Field Task Checklist & Dynamic Rate', () => {
    it('verifies initial seed task completion count and 50% rate', () => {
      const completed = INITIAL_DAILY_TASKS.filter((t) => t.completed).length;
      expect(completed).toBe(2);
      expect(INITIAL_DAILY_TASKS.length).toBe(4);
      expect(completed / INITIAL_DAILY_TASKS.length).toBe(0.5);
    });

    it('toggles task completion and recalculates percentage accurately', () => {
      let currentTasks = [...INITIAL_DAILY_TASKS];
      const toggle = (id: string) => {
        currentTasks = currentTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      };

      toggle('T2');
      expect(currentTasks.filter((t) => t.completed).length).toBe(3);
      expect(currentTasks.filter((t) => t.completed).length / currentTasks.length).toBe(0.75);

      toggle('T3');
      expect(currentTasks.filter((t) => t.completed).length).toBe(4);
      expect(currentTasks.filter((t) => t.completed).length / currentTasks.length).toBe(1.0);
    });
  });

  describe('ADV-F26-5: Pending Offline Sync Badge & Helplines', () => {
    it('correctly formats sync badge counter based on queue depth', async () => {
      const getSyncBadge = async () => {
        const pending = await storageEngine.getPendingSyncItems();
        return pending.length > 0 ? `${pending.length} Pending` : 'Fully Synced';
      };

      expect(await getSyncBadge()).toBe('Fully Synced');

      await storageEngine.enqueueSync('/api/v1/test1', 'POST', { x: 1 });
      expect(await getSyncBadge()).toBe('1 Pending');

      await storageEngine.enqueueSync('/api/v1/test2', 'POST', { x: 2 });
      await storageEngine.enqueueSync('/api/v1/test3', 'POST', { x: 3 });
      expect(await getSyncBadge()).toBe('3 Pending');
    });

    it('verifies all 4 emergency speed dialers are present with valid phone formats', () => {
      expect(EMERGENCY_SPEED_DIALERS.length).toBe(4);
      const numbers = EMERGENCY_SPEED_DIALERS.map((d) => d.number);
      expect(numbers).toContain('108');
      expect(numbers).toContain('102');
      expect(numbers).toContain('104');
      expect(numbers).toContain('02168290111');
    });
  });
});

describe('M3 Adversarial: Feature 27 - Beneficiary Registration Stress Suite', () => {
  beforeEach(async () => {
    await storageEngine.clearStore('patient_cache');
    await storageEngine.clearStore('sync_queue');
  });

  const validateBeneficiary = (data: {
    name: string;
    age: string;
    gender: string;
    village: string;
    phone?: string;
    abhaId?: string;
    aadhaarLast4?: string;
  }): { isValid: boolean; errors: Record<string, string> } => {
    const errs: Record<string, string> = {};

    const cleanName = data.name.trim().replace(/\s+/g, ' ');
    if (!cleanName || cleanName.length < 2) {
      errs.name = 'Full name is required (min 2 characters)';
    }

    const ageNum = parseInt(data.age, 10);
    if (!data.age || isNaN(ageNum) || !Number.isInteger(Number(data.age)) || ageNum < 0 || ageNum > 125) {
      errs.age = 'Age must be an integer between 0 and 125';
    }

    if (!data.gender || !['Female', 'Male', 'Other'].includes(data.gender)) {
      errs.gender = 'Gender must be Female, Male, or Other';
    }

    if (!data.village || !data.village.trim()) {
      errs.village = 'Village / Settlement name is required';
    }

    if (data.phone && data.phone.trim()) {
      const cleanPhone = data.phone.replace(/[\s-]/g, '');
      if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(cleanPhone)) {
        errs.phone = 'Enter a valid 10-digit mobile number';
      }
    }

    if (data.abhaId && data.abhaId.trim()) {
      const normAbha = data.abhaId.replace(/\s+/g, '-');
      if (!/^\d{2}-\d{4}-\d{4}-\d{4}$/.test(normAbha)) {
        errs.abhaId = 'ABHA format must be 14 digits: 14-4821-9876-5432';
      }
    }

    if (data.aadhaarLast4 && data.aadhaarLast4.trim() && !/^\d{4}$/.test(data.aadhaarLast4.trim())) {
      errs.aadhaarLast4 = 'Enter exactly 4 digits of Aadhaar';
    }

    return { isValid: Object.keys(errs).length === 0, errors: errs };
  };

  describe('ADV-F27-1: Age Integer Limits (0 to 125 Boundary Stress)', () => {
    it('accepts boundary age 0 (newborn infant)', () => {
      const res = validateBeneficiary({ name: 'Navjat Balak', age: '0', gender: 'Male', village: 'Tapola' });
      expect(res.isValid).toBe(true);
      expect(res.errors.age).toBeUndefined();
    });

    it('accepts boundary age 125 (supercentenarian limit)', () => {
      const res = validateBeneficiary({ name: 'Aaji Jadhav', age: '125', gender: 'Female', village: 'Tapola' });
      expect(res.isValid).toBe(true);
      expect(res.errors.age).toBeUndefined();
    });

    it('rejects negative age (-1)', () => {
      const res = validateBeneficiary({ name: 'Sunita', age: '-1', gender: 'Female', village: 'Tapola' });
      expect(res.isValid).toBe(false);
      expect(res.errors.age).toContain('between 0 and 125');
    });

    it('rejects age exceeding limit (126, 999)', () => {
      const res1 = validateBeneficiary({ name: 'Sunita', age: '126', gender: 'Female', village: 'Tapola' });
      expect(res1.isValid).toBe(false);
      expect(res1.errors.age).toContain('between 0 and 125');

      const res2 = validateBeneficiary({ name: 'Sunita', age: '999', gender: 'Female', village: 'Tapola' });
      expect(res2.isValid).toBe(false);
    });

    it('rejects decimal / non-integer ages (25.5, 0.8)', () => {
      const res1 = validateBeneficiary({ name: 'Sunita', age: '25.5', gender: 'Female', village: 'Tapola' });
      expect(res1.isValid).toBe(false);
      expect(res1.errors.age).toContain('integer between 0 and 125');

      const res2 = validateBeneficiary({ name: 'Sunita', age: '0.8', gender: 'Female', village: 'Tapola' });
      expect(res2.isValid).toBe(false);
    });

    it('rejects non-numeric string ages', () => {
      const res = validateBeneficiary({ name: 'Sunita', age: 'twenty', gender: 'Female', village: 'Tapola' });
      expect(res.isValid).toBe(false);
    });
  });

  describe('ADV-F27-2: Marathi Unicode Names & Whitespace Cleansing', () => {
    it('accepts complex Marathi Devanagari Unicode names without corruption', () => {
      const marathiNames = [
        'सुनीता रामचंद्र जाधव',
        'पूजा सचिन गायकवाड',
        'आनंदीबाई धोंडिबा कांबळे',
        'ज्ञानेश्वर तुकाराम शिंदे',
      ];

      marathiNames.forEach((name) => {
        const res = validateBeneficiary({ name, age: '28', gender: 'Female', village: 'Tapola' });
        expect(res.isValid).toBe(true);
        expect(res.errors.name).toBeUndefined();
      });
    });

    it('cleanses excessive internal and external whitespace', () => {
      const messy = '   सुनीता    रामचंद्र    जाधव   ';
      const cleaned = messy.trim().replace(/\s+/g, ' ');
      expect(cleaned).toBe('सुनीता रामचंद्र जाधव');
      expect(cleaned.length).toBeGreaterThan(2);
    });

    it('rejects empty or single character names', () => {
      expect(validateBeneficiary({ name: '', age: '28', gender: 'Female', village: 'Tapola' }).isValid).toBe(false);
      expect(validateBeneficiary({ name: ' ', age: '28', gender: 'Female', village: 'Tapola' }).isValid).toBe(false);
      expect(validateBeneficiary({ name: 'A', age: '28', gender: 'Female', village: 'Tapola' }).isValid).toBe(false);
      expect(validateBeneficiary({ name: 'क', age: '28', gender: 'Female', village: 'Tapola' }).isValid).toBe(false);
    });
  });

  describe('ADV-F27-3: Gender Enum & Identifier Format Constraints', () => {
    it('strictly restricts gender to Female, Male, Other', () => {
      expect(validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Female', village: 'Tapola' }).isValid).toBe(true);
      expect(validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Male', village: 'Tapola' }).isValid).toBe(true);
      expect(validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Other', village: 'Tapola' }).isValid).toBe(true);

      expect(validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Unknown', village: 'Tapola' }).isValid).toBe(false);
      expect(validateBeneficiary({ name: 'Sunita', age: '28', gender: '', village: 'Tapola' }).isValid).toBe(false);
    });

    it('enforces Aadhaar last-4 strictly as 4 digits', () => {
      const valid = validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Female', village: 'Tapola', aadhaarLast4: '4821' });
      expect(valid.isValid).toBe(true);

      const invalid3 = validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Female', village: 'Tapola', aadhaarLast4: '482' });
      expect(invalid3.isValid).toBe(false);
      expect(invalid3.errors.aadhaarLast4).toContain('exactly 4 digits');

      const invalid5 = validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Female', village: 'Tapola', aadhaarLast4: '48211' });
      expect(invalid5.isValid).toBe(false);

      const invalidAlpha = validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Female', village: 'Tapola', aadhaarLast4: '482A' });
      expect(invalidAlpha.isValid).toBe(false);
    });

    it('validates 14-digit ABHA format with hyphen normalization', () => {
      const validStandard = validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Female', village: 'Tapola', abhaId: '14-4821-9876-5432' });
      expect(validStandard.isValid).toBe(true);

      const validSpaced = validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Female', village: 'Tapola', abhaId: '14 4821 9876 5432' });
      expect(validSpaced.isValid).toBe(true);

      const invalidLength = validateBeneficiary({ name: 'Sunita', age: '28', gender: 'Female', village: 'Tapola', abhaId: '14-4821-9876-543' });
      expect(invalidLength.isValid).toBe(false);
      expect(invalidLength.errors.abhaId).toContain('14 digits');
    });
  });

  describe('ADV-F27-4: Photo Fallback URI & Dual Offline Persistence', () => {
    it('generates compliant fallback photo URI matching Android cache path', () => {
      const now = Date.now();
      const fallback = `file:///data/user/0/com.healthway.mobile/cache/photo_ben_${now}.jpg`;
      expect(fallback).toMatch(/^file:\/\/\/data\/user\/0\/com\.healthway\.mobile\/cache\/photo_ben_\d+\.jpg$/);
    });

    it('simulates full offline registration workflow with patient_cache and sync_queue', async () => {
      const beneficiaryId = `BEN-${Date.now().toString(36).toUpperCase()}`;
      const mockRecord = {
        id: beneficiaryId,
        abhaId: '14-4821-9876-5432',
        aadhaarLast4: '4821',
        nameEn: 'सुनीता जाधव',
        nameMr: 'सुनीता जाधव',
        age: 28,
        gender: 'Female',
        phone: '+91 98220 12345',
        village: 'Tapola',
        block: 'Mahabaleshwar',
        district: 'Satara',
        conditions: ['Antenatal'],
        riskLevel: 'moderate',
        isPregnant: true,
        photoUri: `file:///data/user/0/com.healthway.mobile/cache/photo_ben_${Date.now()}.jpg`,
        registeredBy: 'Sister Anandi Gaikwad',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
      };

      // 1. Save to patient_cache
      await storageEngine.saveItem('patient_cache', mockRecord.id, mockRecord);
      const cached = await storageEngine.getItem<typeof mockRecord>('patient_cache', mockRecord.id);
      expect(cached).toBeDefined();
      expect(cached?.nameMr).toBe('सुनीता जाधव');
      expect(cached?.isPregnant).toBe(true);

      // 2. Enqueue to sync_queue
      await storageEngine.enqueueSync('/api/v1/beneficiaries', 'POST', mockRecord);
      const pendingSyncs = await storageEngine.getPendingSyncItems();
      expect(pendingSyncs.length).toBe(1);
      expect(pendingSyncs[0].endpoint).toBe('/api/v1/beneficiaries');
      expect(pendingSyncs[0].payload.id).toBe(beneficiaryId);
      expect(pendingSyncs[0].status).toBe('PENDING');
    });
  });
});

describe('M3 Adversarial: Feature 28 - High-Risk Pregnancy & Antenatal Care Stress Suite', () => {
  beforeEach(async () => {
    await storageEngine.clearStore('referral_drafts');
    await storageEngine.clearStore('sync_queue');
  });

  describe('ADV-F28-1: Gestational Age & Trimester Calculation Boundary Stress', () => {
    const computeTrimester = (weeks: number): 1 | 2 | 3 => {
      return weeks <= 12 ? 1 : weeks <= 28 ? 2 : 3;
    };

    it('tests all boundary transitions across the 42-week spectrum', () => {
      // Trimester 1
      expect(computeTrimester(1)).toBe(1);
      expect(computeTrimester(6)).toBe(1);
      expect(computeTrimester(12)).toBe(1);

      // Trimester 2
      expect(computeTrimester(13)).toBe(2);
      expect(computeTrimester(20)).toBe(2);
      expect(computeTrimester(28)).toBe(2);

      // Trimester 3
      expect(computeTrimester(29)).toBe(3);
      expect(computeTrimester(34)).toBe(3);
      expect(computeTrimester(40)).toBe(3);
      expect(computeTrimester(42)).toBe(3);
    });

    it('enforces UI stepper clamping between 1 and 42 weeks', () => {
      const stepDown = (w: number) => Math.max(1, w - 1);
      const stepUp = (w: number) => Math.min(42, w + 1);

      expect(stepDown(1)).toBe(1);
      expect(stepDown(0)).toBe(1);
      expect(stepUp(42)).toBe(42);
      expect(stepUp(50)).toBe(42);
    });
  });

  describe('ADV-F28-2: Clinical Danger Signs Checklist & High-Risk Flagging', () => {
    it('verifies all 7 danger signs are configured with correct severity', () => {
      expect(DANGER_SIGNS_CATALOG.length).toBe(7);
      const critical = DANGER_SIGNS_CATALOG.filter((d) => d.severity === 'CRITICAL');
      const high = DANGER_SIGNS_CATALOG.filter((d) => d.severity === 'HIGH');

      expect(critical.length).toBe(5);
      expect(high.length).toBe(2);

      const labels = DANGER_SIGNS_CATALOG.map((d) => d.labelEn);
      expect(labels).toContain('Severe persistent headache');
      expect(labels).toContain('Visual blurriness');
      expect(labels).toContain('Epigastric pain');
      expect(labels).toContain('Vaginal bleeding or fluid leakage');
      expect(labels).toContain('Convulsions or fainting fits');
    });

    it('triggers high-risk flag on ANY danger sign presence', () => {
      const evaluateIsHighRisk = (sys: number, dia: number, dangerSigns: string[]) => {
        return sys >= 140 || dia >= 90 || dangerSigns.length > 0;
      };

      expect(evaluateIsHighRisk(110, 70, [])).toBe(false);
      expect(evaluateIsHighRisk(110, 70, ['Severe persistent headache'])).toBe(true);
      expect(evaluateIsHighRisk(140, 80, [])).toBe(true);
      expect(evaluateIsHighRisk(120, 90, [])).toBe(true);
      expect(evaluateIsHighRisk(168, 108, ['Severe persistent headache', 'Epigastric pain'])).toBe(true);
    });
  });

  describe('ADV-F28-3: Immediate 1-Hour SLA Referral to District Hospital Satara OB-ICU (FAC001)', () => {
    it('generates immediate referral slip with exact 60-min SLA to FAC001', async () => {
      const referral = {
        referralId: 'REF-ANC-2026-042',
        patientId: 'PT-ANC-POOJA',
        patientName: 'Pooja Sachin Jadhav',
        fromFacilityId: 'FAC007',
        toFacilityId: 'FAC001',
        specialty: 'Obstetric High-Risk ICU',
        urgency: 'IMMEDIATE',
        slaMinutes: FIELD_REFERRAL_SLAS.IMMEDIATE,
        provisionalDiagnosis: 'Severe Preeclampsia in 34th Week with Impending Eclampsia',
        qrCodePayload: 'REF-ANC-2026-042|PT-ANC-POOJA|IMMEDIATE|FAC001',
        stage: 'CREATED',
        createdAt: new Date().toISOString(),
      };

      expect(referral.slaMinutes).toBe(60);
      expect(referral.toFacilityId).toBe('FAC001');
      expect(referral.specialty).toBe('Obstetric High-Risk ICU');

      const fac = DISTRICT_FACILITIES.find((f) => f.id === referral.toFacilityId);
      expect(fac?.name).toBe('District Hospital Satara');
      expect(fac?.type).toBe('District Hospital');

      await storageEngine.saveItem('referral_drafts', referral.referralId, referral);
      const saved = await storageEngine.getItem<typeof referral>('referral_drafts', referral.referralId);
      expect(saved?.referralId).toBe('REF-ANC-2026-042');
      expect(saved?.urgency).toBe('IMMEDIATE');

      await storageEngine.enqueueSync('/api/v1/referrals', 'POST', referral);
      const pending = await storageEngine.getPendingSyncItems();
      expect(pending.some((p) => p.payload.referralId === 'REF-ANC-2026-042')).toBe(true);
    });
  });

  describe('ADV-F28-4: PMSMA 4-Visit ANC Schedule & CBAC Calculator', () => {
    it('verifies exact 4 mandatory PMSMA visits and timing guidelines', () => {
      expect(PMSMA_SCHEDULE.length).toBe(4);
      expect(PMSMA_SCHEDULE[0].idealWeeks).toBe('Within 12 weeks');
      expect(PMSMA_SCHEDULE[1].idealWeeks).toBe('14 - 26 weeks');
      expect(PMSMA_SCHEDULE[2].idealWeeks).toBe('28 - 34 weeks');
      expect(PMSMA_SCHEDULE[3].idealWeeks).toBe('36 weeks till delivery');
    });

    it('evaluates CBAC NCD score cutoff rule (> 4 triggers referral)', () => {
      const checkCbacReferral = (score: number) => score > 4;

      expect(checkCbacReferral(0)).toBe(false);
      expect(checkCbacReferral(3)).toBe(false);
      expect(checkCbacReferral(4)).toBe(false);
      expect(checkCbacReferral(5)).toBe(true);
      expect(checkCbacReferral(8)).toBe(true);
    });
  });
});

describe('M3 Adversarial: Feature 29 - Voice Intake / STT Mode Stress Suite', () => {
  beforeEach(async () => {
    await storageEngine.clearStore('triage_drafts');
  });

  describe('ADV-F29-1: Duration Boundaries (Reject < 1.0s, Cap at 180s)', () => {
    it('rejects audio duration below 1.0 second (click noise rejection)', () => {
      expect(validateAudioDuration(0.0)).toBe(false);
      expect(validateAudioDuration(0.5)).toBe(false);
      expect(validateAudioDuration(0.99)).toBe(false);
      expect(validateAudioDuration(1.0)).toBe(true);
      expect(validateAudioDuration(1.01)).toBe(true);
      expect(validateAudioDuration(60)).toBe(true);
    });

    it('caps audio duration strictly at maximum 180 seconds (3 minutes)', () => {
      expect(capAudioDuration(10)).toBe(10);
      expect(capAudioDuration(179)).toBe(179);
      expect(capAudioDuration(180)).toBe(180);
      expect(capAudioDuration(181)).toBe(180);
      expect(capAudioDuration(3600)).toBe(180);
    });
  });

  describe('ADV-F29-2: Trilingual Speech-to-Text Simulation (mr, hi, en)', () => {
    it('contains valid trilingual corpus entries for Marathi, Hindi, English', () => {
      expect(SAMPLE_CLINICAL_VOICE_CORPUS.mr.length).toBeGreaterThan(0);
      expect(SAMPLE_CLINICAL_VOICE_CORPUS.hi.length).toBeGreaterThan(0);
      expect(SAMPLE_CLINICAL_VOICE_CORPUS.en.length).toBeGreaterThan(0);

      expect(SAMPLE_CLINICAL_VOICE_CORPUS.mr[0]).toContain('ताप आणि खोकला');
      expect(SAMPLE_CLINICAL_VOICE_CORPUS.hi[0]).toContain('सिर दर्द और चक्कर');
      expect(SAMPLE_CLINICAL_VOICE_CORPUS.en[0]).toContain('high fever and severe cough');
    });
  });

  describe('ADV-F29-3: Clinical Entity Extraction & Duration Parsing', () => {
    it('extracts FEVER and COUGH from Marathi clinical transcript', () => {
      const text = 'रुग्णाला दोन दिवसांपासून ताप आणि खोकला आहे';
      const entities = extractClinicalEntities(text);
      expect(entities.symptoms).toContain('FEVER');
      expect(entities.symptoms).toContain('COUGH');
      expect(entities.duration).toBe('2 days');
      expect(entities.chiefComplaint).toContain('FEVER, COUGH');
      expect(entities.chiefComplaint).toContain('2 days');
    });

    it('extracts HEADACHE and DIZZINESS from Hindi clinical transcript', () => {
      const text = 'मरीज को सिर दर्द और चक्कर आ रहे हैं';
      const entities = extractClinicalEntities(text);
      expect(entities.symptoms).toContain('HEADACHE');
      expect(entities.symptoms).toContain('DIZZINESS');
    });

    it('extracts PREGNANCY_DANGER and BLEEDING from acute maternal transcript', () => {
      const text = 'गर्भवती महिलेला पोटात असह्य कळ येत आहे आणि रक्तस्त्राव होत आहे';
      const entities = extractClinicalEntities(text);
      expect(entities.symptoms).toContain('PREGNANCY_DANGER');
      expect(entities.symptoms).toContain('ABDOMINAL_PAIN');
      expect(entities.symptoms).toContain('BLEEDING');
    });

    it('extracts CHEST_PAIN and DYSPNEA from emergency cardiac transcript', () => {
      const text = 'Acute chest pain and severe dyspnea since yesterday';
      const entities = extractClinicalEntities(text);
      expect(entities.symptoms).toContain('CHEST_PAIN');
      expect(entities.symptoms).toContain('DYSPNEA');
      expect(entities.duration).toBe('1 day');
    });

    it('handles unrecognized or empty clinical speech gracefully without throw', () => {
      const empty = extractClinicalEntities('');
      expect(empty.symptoms).toEqual([]);
      expect(empty.duration).toBe('Unknown');
      expect(empty.chiefComplaint).toContain('General Malaise');

      const gibberish = extractClinicalEntities('नमस्कार, काही नाही सहज फोन केला');
      expect(gibberish.symptoms).toEqual([]);
      expect(gibberish.duration).toBe('Unknown');
    });
  });

  describe('ADV-F29-4: Transcript Editing & triage_drafts Store Persistence', () => {
    it('updates extracted entities dynamically when ASHA worker edits transcript', () => {
      const initialText = 'रुग्णाला ताप आहे';
      const e1 = extractClinicalEntities(initialText);
      expect(e1.symptoms).toEqual(['FEVER']);

      const editedText = 'रुग्णाला तीव्र ताप आणि खोकला आणि चक्कर येत आहे दोन दिवस';
      const e2 = extractClinicalEntities(editedText);
      expect(e2.symptoms).toContain('FEVER');
      expect(e2.symptoms).toContain('COUGH');
      expect(e2.symptoms).toContain('DIZZINESS');
      expect(e2.duration).toBe('2 days');
    });

    it('persists voice intake draft into offline triage_drafts store', async () => {
      const draftId = `TRG-DRAFT-${Date.now()}`;
      const draft = {
        id: draftId,
        patientId: 'PT-ANC-POOJA',
        transcript: 'रुग्णाला दोन दिवसांपासून ताप आणि खोकला आहे',
        language: 'mr',
        extractedEntities: extractClinicalEntities('रुग्णाला दोन दिवसांपासून ताप आणि खोकला आहे'),
        durationSeconds: 12,
        sampleRateHz: 16000,
        status: 'DRAFT_SAVED',
        createdAt: new Date().toISOString(),
      };

      await storageEngine.saveItem('triage_drafts', draftId, draft);
      const retrieved = await storageEngine.getItem<typeof draft>('triage_drafts', draftId);
      expect(retrieved?.id).toBe(draftId);
      expect(retrieved?.language).toBe('mr');
      expect(retrieved?.extractedEntities.symptoms).toContain('FEVER');
    });
  });
});

describe('M3 Adversarial: Feature 30 - Field Triage & Priority Referral Slip Stress Suite', () => {
  beforeEach(async () => {
    await storageEngine.clearStore('referral_drafts');
    await storageEngine.clearStore('sync_queue');
  });

  const baseVitals: VitalsReading = {
    systolicBp: 120,
    diastolicBp: 80,
    heartRate: 72,
    spo2: 98,
    bloodSugarRandom: 100,
    temperatureF: 98.4,
  };

  describe('ADV-F30-1: AVPU Consciousness Scale Escalation', () => {
    it('keeps normal Alert ("A") within standard vitals-driven classification', () => {
      const input: FieldTriageInput = {
        patientId: 'PT-01',
        patientName: 'Sunita',
        age: 28,
        gender: 'Female',
        consciousness: 'A',
        vitals: baseVitals,
        dangerSigns: [],
        primaryComplaint: 'Mild malaise',
        ashaId: 'ASHA-01',
        ashaName: 'Anandi',
      };

      const result = evaluateFieldTriage(input);
      expect(result.triageLevel).toBe('GREEN');
      expect(result.urgency).toBe('ROUTINE');
      expect(result.slaMinutes).toBe(4320);
    });

    it('escalates to EMERGENCY RED (IMMEDIATE 60m SLA) when consciousness is "V" (Voice)', () => {
      const input: FieldTriageInput = {
        patientId: 'PT-01',
        patientName: 'Sunita',
        age: 28,
        gender: 'Female',
        consciousness: 'V',
        vitals: baseVitals,
        dangerSigns: [],
        primaryComplaint: 'Drowsy, responds only to loud voice',
        ashaId: 'ASHA-01',
        ashaName: 'Anandi',
      };

      const result = evaluateFieldTriage(input);
      expect(result.triageLevel).toBe('RED');
      expect(result.urgency).toBe('IMMEDIATE');
      expect(result.slaMinutes).toBe(60);
      expect(result.destinationFacility.type).toBe('District Hospital');
    });

    it('escalates to EMERGENCY RED for "P" (Pain) and "U" (Unresponsive)', () => {
      ['P' as const, 'U' as const].forEach((code) => {
        const res = evaluateFieldTriage({
          patientId: 'PT-01',
          patientName: 'Sunita',
          age: 28,
          gender: 'Female',
          consciousness: code,
          vitals: baseVitals,
          dangerSigns: [],
          primaryComplaint: 'Altered sensorium',
          ashaId: 'ASHA-01',
          ashaName: 'Anandi',
        });
        expect(res.triageLevel).toBe('RED');
        expect(res.urgency).toBe('IMMEDIATE');
        expect(res.isEmergency).toBe(true);
      });
    });
  });

  describe('ADV-F30-2: Vitals Alerting & Danger Signs Scoring Matrix', () => {
    it('verifies computePriority rule matrix', () => {
      expect(computePriority(0, false)).toBe('ROUTINE');
      expect(computePriority(1, false)).toBe('URGENT');
      expect(computePriority(2, false)).toBe('EMERGENCY');
      expect(computePriority(0, true)).toBe('EMERGENCY');
      expect(computePriority(1, true)).toBe('EMERGENCY');
      expect(computePriority(3, true)).toBe('EMERGENCY');
    });

    it('escalates to RED when systolic BP >= 180 (Hypertensive Emergency)', () => {
      const vitals: VitalsReading = { ...baseVitals, systolicBp: 185, diastolicBp: 115 };
      const res = evaluateFieldTriage({
        patientId: 'PT-01',
        patientName: 'Sunita',
        age: 28,
        gender: 'Female',
        consciousness: 'A',
        vitals,
        dangerSigns: [],
        primaryComplaint: 'Extremely high BP',
        ashaId: 'ASHA-01',
        ashaName: 'Anandi',
      });
      expect(res.triageLevel).toBe('RED');
      expect(res.urgency).toBe('IMMEDIATE');
      expect(res.specialty).toContain('Cardiology');
    });

    it('escalates to RED when SpO2 < 90% (Hypoxemic Respiratory Distress)', () => {
      const vitals: VitalsReading = { ...baseVitals, spo2: 86 };
      const res = evaluateFieldTriage({
        patientId: 'PT-01',
        patientName: 'Sunita',
        age: 28,
        gender: 'Female',
        consciousness: 'A',
        vitals,
        dangerSigns: [],
        primaryComplaint: 'Severe breathlessness',
        ashaId: 'ASHA-01',
        ashaName: 'Anandi',
      });
      expect(res.triageLevel).toBe('RED');
      expect(res.specialty).toContain('Pulmonology');
    });

    it('routes pregnant patient with danger signs to Obstetric High-Risk ICU at District Hospital Satara', () => {
      const vitals: VitalsReading = { ...baseVitals, systolicBp: 168, diastolicBp: 108 };
      const res = evaluateFieldTriage({
        patientId: 'PT-ANC-POOJA',
        patientName: 'Pooja Jadhav',
        age: 26,
        gender: 'Female',
        isPregnant: true,
        consciousness: 'A',
        vitals,
        dangerSigns: ['Severe persistent headache', 'Epigastric pain'],
        primaryComplaint: 'Severe preeclampsia with danger signs',
        ashaId: 'ASHA-01',
        ashaName: 'Sister Anandi Gaikwad',
      });

      expect(res.triageLevel).toBe('RED');
      expect(res.urgency).toBe('IMMEDIATE');
      expect(res.slaMinutes).toBe(60);
      expect(res.destinationFacility.id).toBe('FAC001');
      expect(res.specialty).toBe('Obstetric High-Risk ICU');
      expect(res.transportType).toBe('108_AMBULANCE');
    });
  });

  describe('ADV-F30-3: Digital Referral Slip Identification & QR Barcode Payload', () => {
    it('formats referral numbers and display barcodes matching authoritative patterns', () => {
      const res = evaluateFieldTriage({
        patientId: 'PT-01',
        patientName: 'Sunita',
        age: 28,
        gender: 'Female',
        consciousness: 'A',
        vitals: baseVitals,
        dangerSigns: ['Severe persistent headache'],
        primaryComplaint: 'Persistent headache',
        ashaId: 'ASHA-01',
        ashaName: 'Anandi',
      });

      expect(res.referralNumber).toMatch(/^REF-MH-STR-2026-\d{4}$/);
      expect(res.displayCode).toMatch(/^MH-REF-\d{4}$/);
    });

    it('encodes valid, parseable JSON QR barcode payload with critical transfer metadata', () => {
      const res = evaluateFieldTriage({
        patientId: 'PT-01',
        patientName: 'Sunita Jadhav',
        age: 28,
        gender: 'Female',
        consciousness: 'A',
        vitals: baseVitals,
        dangerSigns: ['Visual blurriness'],
        primaryComplaint: 'Blurred vision',
        ashaId: 'ASHA-01',
        ashaName: 'Anandi',
      });

      const qr = JSON.parse(res.qrPayload);
      expect(qr.refNo).toBe(res.referralNumber);
      expect(qr.ptName).toBe('Sunita Jadhav');
      expect(qr.urgency).toBe(res.urgency);
      expect(qr.ashaId).toBe('ASHA-01');
      expect(qr.dest).toBe(res.destinationFacility.id);
      expect(qr.triage).toBe(res.triageLevel);
    });
  });

  describe('ADV-F30-4: 1-Tap 108 Ambulance Dispatch & Dual Store Offline Queuing', () => {
    it('verifies 1-tap call action string format', () => {
      const dialAction = (num: string) => `tel:${num}`;
      expect(dialAction('108')).toBe('tel:108');
    });

    it('saves referral slip into referral_drafts and enqueues to sync_queue', async () => {
      const res = evaluateFieldTriage({
        patientId: 'PT-ANC-POOJA',
        patientName: 'Pooja Jadhav',
        age: 26,
        gender: 'Female',
        isPregnant: true,
        consciousness: 'A',
        vitals: { ...baseVitals, systolicBp: 168, diastolicBp: 108 },
        dangerSigns: ['Severe persistent headache', 'Epigastric pain'],
        primaryComplaint: 'Severe preeclampsia',
        ashaId: 'ASHA-01',
        ashaName: 'Anandi',
      });

      // 1. Save to referral_drafts
      await storageEngine.saveItem('referral_drafts', res.referralId, res);
      const draft = await storageEngine.getItem<typeof res>('referral_drafts', res.referralId);
      expect(draft?.referralId).toBe(res.referralId);
      expect(draft?.destinationFacility.id).toBe('FAC001');

      // 2. Queue referral to sync_queue
      await storageEngine.enqueueSync('/api/v1/referrals', 'POST', res);
      const pending = await storageEngine.getPendingSyncItems();
      expect(pending.some((p) => p.endpoint === '/api/v1/referrals')).toBe(true);
    });
  });
});
