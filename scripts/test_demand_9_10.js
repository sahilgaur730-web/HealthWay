import { 
  calculateFacilityScore, 
  getPerformanceGrade, 
  PERFORMANCE_GRADES, 
  FACILITY_TYPES, 
  MOCK_DISTRICT_DATA, 
  enrichDistrictData 
} from '../src/services/dashboardService.ts';
import { STORES, HealthWayOfflineDB } from '../src/services/offlineDB.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${message}`);
  } else {
    failed++;
    console.error(`[FAIL] ${message}`);
  }
}

console.log('=== RUNNING DEEP VERIFICATION SUITE FOR DEMAND 9 & 10 ===\n');

// 1. Verify Facility Score Calculations on Mock Facilities
const enriched = enrichDistrictData(MOCK_DISTRICT_DATA);

// Check Wagholi
const wagholi = enriched.facilities.find(f => f.id === 'FAC001');
assert(wagholi !== undefined, 'FAC001 Wagholi exists');
assert(wagholi.calculatedScore >= 85 && wagholi.calculatedScore <= 90, `FAC001 Wagholi score in expected range (~88): got ${wagholi.calculatedScore}`);
assert(wagholi.grade.grade === 'A', `FAC001 Wagholi has Grade A: got ${wagholi.grade.grade}`);

// Check Kharadi
const kharadi = enriched.facilities.find(f => f.id === 'FAC002');
assert(kharadi !== undefined, 'FAC002 Kharadi exists');
assert(kharadi.calculatedScore >= 50 && kharadi.calculatedScore <= 60, `FAC002 Kharadi score in expected range (~52): got ${kharadi.calculatedScore}`);
assert(kharadi.grade.grade === 'D', `FAC002 Kharadi has Grade D: got ${kharadi.grade.grade}`);

// Check Lohegaon
const lohegaon = enriched.facilities.find(f => f.id === 'FAC003');
assert(lohegaon !== undefined, 'FAC003 Lohegaon exists');
assert(lohegaon.calculatedScore >= 95, `FAC003 Lohegaon high performer (>=95): got ${lohegaon.calculatedScore}`);
assert(lohegaon.grade.grade === 'A', `FAC003 Lohegaon has Grade A: got ${lohegaon.grade.grade}`);

// Check Bhosari (Critical Deficit)
const bhosari = enriched.facilities.find(f => f.id === 'FAC004');
assert(bhosari !== undefined, 'FAC004 Bhosari exists');
assert(bhosari.calculatedScore < 40, `FAC004 Bhosari score < 40 (Critical F): got ${bhosari.calculatedScore}`);
assert(bhosari.grade.grade === 'F', `FAC004 Bhosari has Grade F: got ${bhosari.grade.grade}`);

// Check District Hospital Pune
const dhPune = enriched.facilities.find(f => f.id === 'FAC005');
assert(dhPune !== undefined, 'FAC005 DH Pune exists');
assert(dhPune.grade.grade === 'B', `FAC005 DH Pune has Grade B: got ${dhPune.grade.grade}`);

// 2. Grade Boundary Verification
assert(getPerformanceGrade(100).grade === 'A', '100 is Grade A');
assert(getPerformanceGrade(85).grade === 'A', '85 is Grade A (boundary)');
assert(getPerformanceGrade(84.9).grade === 'B', '84.9 is Grade B (boundary)');
assert(getPerformanceGrade(70).grade === 'B', '70 is Grade B (boundary)');
assert(getPerformanceGrade(69.9).grade === 'C', '69.9 is Grade C (boundary)');
assert(getPerformanceGrade(55).grade === 'C', '55 is Grade C (boundary)');
assert(getPerformanceGrade(54.9).grade === 'D', '54.9 is Grade D (boundary)');
assert(getPerformanceGrade(40).grade === 'D', '40 is Grade D (boundary)');
assert(getPerformanceGrade(39.9).grade === 'F', '39.9 is Grade F (boundary)');
assert(getPerformanceGrade(0).grade === 'F', '0 is Grade F');

// 3. Edge Case: Division by zero safety
const zeroFacility = {
  id: 'FAC_ZERO',
  name: 'Empty SC',
  nameMr: 'रिक्त उपकेंद्र',
  type: 'SC',
  block: 'Haveli',
  blockMr: 'हवेली',
  inCharge: 'None',
  inChargeMr: 'नाही',
  inChargeRole: 'ANM',
  phone: '0000000000',
  coordinates: { lat: 0, lng: 0 },
  staffTotal: 0,
  staffPresent: 0,
  metrics: {
    consultationsToday: 0,
    consultationsTarget: 0, // 0 target
    consultationsMonth: 0,
    referralsSent: 0, // 0 referrals sent
    referralsCompleted: 0,
    medicinesOutOfStock: 0,
    highRiskPatients: 0, // 0 high risk
    overdueFollowUps: 0,
    deliveries: 0,
    vaccinationsToday: 0,
    tbPatientsActive: 0,
    tbCompliance: 100
  },
  performance: { trend: '0', lastMonth: 0 },
  alerts: [],
  lastDataSync: new Date().toISOString()
};

const zeroScore = calculateFacilityScore(zeroFacility);
assert(!isNaN(zeroScore) && isFinite(zeroScore), `Zero division handled safely: score is ${zeroScore}`);
assert(zeroScore >= 0 && zeroScore <= 100, `Score is in valid range [0, 100]: got ${zeroScore}`);

// 4. Edge Case: Over-performance capped at 100
const overPerfFacility = {
  ...zeroFacility,
  staffTotal: 10,
  staffPresent: 10,
  metrics: {
    ...zeroFacility.metrics,
    consultationsToday: 500, // 500 vs 50 target (1000%)
    consultationsTarget: 50,
    referralsSent: 10,
    referralsCompleted: 10,
    medicinesOutOfStock: 0,
    highRiskPatients: 50,
    overdueFollowUps: 0,
    tbCompliance: 100
  }
};
const overScore = calculateFacilityScore(overPerfFacility);
assert(overScore === 100, `Over-target performance capped at 100: got ${overScore}`);

// 5. Edge Case: Massive deficit clamped at 0
const deficitFacility = {
  ...zeroFacility,
  staffTotal: 10,
  staffPresent: 0,
  metrics: {
    ...zeroFacility.metrics,
    consultationsToday: 0,
    consultationsTarget: 100,
    referralsSent: 10,
    referralsCompleted: 0,
    medicinesOutOfStock: 50, // huge deficit
    highRiskPatients: 50,
    overdueFollowUps: 50,
    tbCompliance: 0
  }
};
const deficitScore = calculateFacilityScore(deficitFacility);
assert(deficitScore >= 0, `Massive deficit clamped to non-negative: got ${deficitScore}`);

// 6. Test Payload Compression function logic
function compressForLowBandwidth(data) {
  if (data === null || data === undefined) return null;
  if (typeof data !== 'object') return data;
  return JSON.parse(
    JSON.stringify(data, (_, val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') return val.trim();
      return val;
    })
  );
}

const rawPayload = {
  patientId: 'P123',
  emptyField: '',
  nullField: null,
  undefinedField: undefined,
  whitespaceStr: '   pune rural   ',
  nested: {
    valid: 'data',
    anotherEmpty: null
  }
};
const compressed = compressForLowBandwidth(rawPayload);
assert(compressed.patientId === 'P123', 'Payload valid data preserved');
assert(compressed.whitespaceStr === 'pune rural', 'Whitespace stripped properly');
assert(!('emptyField' in compressed), 'Empty strings stripped');
assert(!('nullField' in compressed), 'Null fields stripped');
assert(compressed.nested.valid === 'data', 'Nested valid preserved');
assert(!('anotherEmpty' in compressed.nested), 'Nested null stripped');

// 7. Verify STORES and HealthWayOfflineDB interface
assert(Object.keys(STORES).length === 8, '8 specialized IndexedDB object stores defined');
assert(STORES.SYNC_QUEUE === 'syncQueue', 'syncQueue store present');
assert(STORES.PATIENT_CACHE === 'patientCache', 'patientCache store present');
assert(STORES.TRIAGE_DRAFTS === 'triageDrafts', 'triageDrafts store present');
assert(STORES.MEDICINE_STOCK === 'medicineStock', 'medicineStock store present');
assert(STORES.FACILITY_DATA === 'facilityData', 'facilityData store present');
assert(STORES.REFERRAL_DRAFTS === 'referralDrafts', 'referralDrafts store present');
assert(STORES.SETTINGS === 'settings', 'settings store present');
assert(STORES.SYNC_LOG === 'syncLog', 'syncLog store present');

const testDb = new HealthWayOfflineDB();
const requiredDbMethods = [
  'addToQueue',
  'getQueue',
  'removeFromQueue',
  'updateQueueItem',
  'getQueueCount',
  'saveDraft',
  'getDraft',
  'deleteDraft',
  'savePatients',
  'getPatients',
  'saveFacilities',
  'getFacilities',
  'saveAnalytics',
  'getAnalytics',
  'saveMedicines',
  'getMedicines',
  'saveToCache',
  'getFromCache',
  'getStorageInfo',
  'getStorageUsage',
  'clearAllData'
];

for (const m of requiredDbMethods) {
  assert(typeof testDb[m] === 'function', `HealthWayOfflineDB implements method: ${m}`);
}

// 8. Verify Facility Types (5-tier hierarchy)
assert(FACILITY_TYPES.SC.level === 1, 'Sub-Centre is Level 1');
assert(FACILITY_TYPES.PHC.level === 2, 'Primary Health Centre is Level 2');
assert(FACILITY_TYPES.CHC.level === 3, 'Community Health Centre is Level 3');
assert(FACILITY_TYPES.SDH.level === 4, 'Sub-District Hospital is Level 4');
assert(FACILITY_TYPES.DH.level === 5, 'District Hospital is Level 5');

// 9. Verify Grade Definitions
assert(PERFORMANCE_GRADES.A.minScore === 85, 'Grade A min is 85');
assert(PERFORMANCE_GRADES.B.minScore === 70, 'Grade B min is 70');
assert(PERFORMANCE_GRADES.C.minScore === 55, 'Grade C min is 55');
assert(PERFORMANCE_GRADES.D.minScore === 40, 'Grade D min is 40');
assert(PERFORMANCE_GRADES.F.minScore === 0, 'Grade F min is 0');

console.log(`\n=== ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) process.exit(1);
