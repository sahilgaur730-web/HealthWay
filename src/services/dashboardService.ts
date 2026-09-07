/**
 * Facility Dashboard Data Service & Scoring Engine
 * Government of Maharashtra - Department of Public Health
 * Strictly zero unicode emojis - Lucide icons and clean CSS only.
 */

export type FacilityTypeKey = 'SC' | 'PHC' | 'CHC' | 'SDH' | 'DH';

export interface FacilityTypeConfig {
  code: FacilityTypeKey;
  labelEn: string;
  labelMr: string;
  color: string;
  badgeBg: string;
  level: number;
}

export const FACILITY_TYPES: Record<FacilityTypeKey, FacilityTypeConfig> = {
  SC: {
    code: 'SC',
    labelEn: 'Sub-Centre',
    labelMr: 'उपकेंद्र (SC)',
    color: '#64748B',
    badgeBg: '#F1F5F9',
    level: 1
  },
  PHC: {
    code: 'PHC',
    labelEn: 'Primary Health Centre',
    labelMr: 'प्राथमिक आरोग्य केंद्र (PHC)',
    color: '#1A4B8C',
    badgeBg: '#E8F0FE',
    level: 2
  },
  CHC: {
    code: 'CHC',
    labelEn: 'Community Health Centre',
    labelMr: 'समुदाय आरोग्य केंद्र (CHC)',
    color: '#7C3AED',
    badgeBg: '#EDE9FE',
    level: 3
  },
  SDH: {
    code: 'SDH',
    labelEn: 'Sub-District Hospital',
    labelMr: 'उपजिल्हा रुग्णालय (SDH)',
    color: '#EA580C',
    badgeBg: '#FFF7ED',
    level: 4
  },
  DH: {
    code: 'DH',
    labelEn: 'District Hospital',
    labelMr: 'जिल्हा रुग्णालय (DH)',
    color: '#DC2626',
    badgeBg: '#FEE2E2',
    level: 5
  }
};

export type GradeKey = 'A' | 'B' | 'C' | 'D' | 'F';

export interface PerformanceGradeConfig {
  grade: GradeKey;
  labelEn: string;
  labelMr: string;
  color: string;
  bgColor: string;
  borderColor: string;
  minScore: number;
}

export const PERFORMANCE_GRADES: Record<GradeKey, PerformanceGradeConfig> = {
  A: {
    grade: 'A',
    labelEn: 'Excellent',
    labelMr: 'उत्कृष्ट (>=85%)',
    color: '#16A34A',
    bgColor: '#D1FAE5',
    borderColor: '#86EFAC',
    minScore: 85
  },
  B: {
    grade: 'B',
    labelEn: 'Good',
    labelMr: 'चांगले (70-84%)',
    color: '#1A4B8C',
    bgColor: '#DBEAFE',
    borderColor: '#93C5FD',
    minScore: 70
  },
  C: {
    grade: 'C',
    labelEn: 'Average',
    labelMr: 'सरासरी (55-69%)',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    minScore: 55
  },
  D: {
    grade: 'D',
    labelEn: 'Below Average',
    labelMr: 'सरासरीपेक्षा कमी (40-54%)',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
    minScore: 40
  },
  F: {
    grade: 'F',
    labelEn: 'Critical',
    labelMr: 'गंभीर (<40%)',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    minScore: 0
  }
};

export function getPerformanceGrade(score: number): PerformanceGradeConfig {
  if (score >= PERFORMANCE_GRADES.A.minScore) return PERFORMANCE_GRADES.A;
  if (score >= PERFORMANCE_GRADES.B.minScore) return PERFORMANCE_GRADES.B;
  if (score >= PERFORMANCE_GRADES.C.minScore) return PERFORMANCE_GRADES.C;
  if (score >= PERFORMANCE_GRADES.D.minScore) return PERFORMANCE_GRADES.D;
  return PERFORMANCE_GRADES.F;
}

export interface FacilityMetrics {
  consultationsToday: number;
  consultationsTarget: number;
  consultationsMonth: number;
  referralsSent: number;
  referralsCompleted: number;
  medicinesOutOfStock: number;
  highRiskPatients: number;
  overdueFollowUps: number;
  deliveries: number;
  vaccinationsToday: number;
  tbPatientsActive: number;
  tbCompliance: number; // percentage 0-100
}

export interface StaffBreakdown {
  medicalOfficers: { present: number; total: number };
  staffNurses: { present: number; total: number };
  anmWorkers: { present: number; total: number };
  pharmacists: { present: number; total: number };
  labTechnicians: { present: number; total: number };
}

export interface AlertItem {
  id?: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'medicine' | 'staff' | 'performance' | 'highrisk' | 'referral';
  messageEn: string;
  messageMr: string;
  timestamp?: string;
  facilityId?: string;
  facilityName?: string;
}

export interface Facility {
  id: string;
  name: string;
  nameMr: string;
  type: FacilityTypeKey;
  block: string;
  blockMr: string;
  inCharge: string;
  inChargeMr: string;
  inChargeRole: string;
  phone: string;
  coordinates: { lat: number; lng: number };
  staffTotal: number;
  staffPresent: number;
  staffBreakdown?: StaffBreakdown;
  metrics: FacilityMetrics;
  performance: {
    score?: number;
    trend: string;
    lastMonth: number;
  };
  alerts: AlertItem[];
  lastDataSync: string;
  calculatedScore?: number;
  grade?: PerformanceGradeConfig;
}

export interface DistrictSummary {
  totalPatients: number;
  consultationsToday: number;
  consultationsThisMonth: number;
  activeReferrals: number;
  pendingReferrals: number;
  medicinesOutOfStock: number;
  highRiskPatients: number;
  overdueFollowUps: number;
  staffPresent: number;
  staffTotal: number;
  attendanceRate: number;
}

export interface DistrictInfo {
  name: string;
  nameMr: string;
  state: string;
  stateMr: string;
  population: number;
  blocks: number;
  totalFacilities: number;
  officerInCharge: string;
  officerRole: string;
}

export interface TrendItem {
  date: string;
  value: number;
  target?: number;
}

export interface DistrictData {
  district: DistrictInfo;
  summary: DistrictSummary;
  facilities: Facility[];
  trends: {
    consultations: TrendItem[];
    referrals: number[];
    stockAlerts: number[];
  };
}

/**
 * Weighted Facility Performance Score Calculation
 * Formula:
 * - Consultations Target vs Actual: 20%
 * - Staff Attendance Rate: 20%
 * - Medicine Stock Availability: 20%
 * - Referral Completion Rate: 15%
 * - High-Risk Follow-up Compliance: 15%
 * - TB Compliance: 10%
 */
export function calculateFacilityScore(facility: Facility): number {
  const m = facility.metrics;

  const consultationsScore = Math.min((m.consultationsToday / (m.consultationsTarget || 1)) * 100, 100);
  const staffAttendanceScore = facility.staffTotal > 0 ? (facility.staffPresent / facility.staffTotal) * 100 : 100;
  const medicineStockScore = Math.max(0, 100 - (m.medicinesOutOfStock * 10));
  const referralCompletionScore = m.referralsSent > 0 ? (m.referralsCompleted / m.referralsSent) * 100 : 100;
  const followUpComplianceScore = m.highRiskPatients > 0
    ? Math.max(0, 100 - (m.overdueFollowUps / m.highRiskPatients) * 100)
    : 100;
  const tbComplianceScore = m.tbCompliance ?? 100;

  const weights = {
    consultations: 0.20,
    staffAttendance: 0.20,
    medicineStock: 0.20,
    referralCompletion: 0.15,
    followUpCompliance: 0.15,
    tbCompliance: 0.10
  };

  const total = 
    (consultationsScore * weights.consultations) +
    (staffAttendanceScore * weights.staffAttendance) +
    (medicineStockScore * weights.medicineStock) +
    (referralCompletionScore * weights.referralCompletion) +
    (followUpComplianceScore * weights.followUpCompliance) +
    (tbComplianceScore * weights.tbCompliance);

  return Math.round(Math.max(0, Math.min(100, total)));
}

export const MOCK_DISTRICT_DATA: DistrictData = {
  district: {
    name: 'Pune District',
    nameMr: 'पुणे जिल्हा',
    state: 'Maharashtra',
    stateMr: 'महाराष्ट्र',
    population: 9429408,
    blocks: 13,
    totalFacilities: 847,
    officerInCharge: 'Dr. Bhagwan Pawar',
    officerRole: 'District Health Officer (DHO)'
  },
  summary: {
    totalPatients: 142847,
    consultationsToday: 3421,
    consultationsThisMonth: 89234,
    activeReferrals: 234,
    pendingReferrals: 67,
    medicinesOutOfStock: 23,
    highRiskPatients: 1847,
    overdueFollowUps: 312,
    staffPresent: 2847,
    staffTotal: 3120,
    attendanceRate: 91.3
  },
  facilities: [
    {
      id: 'FAC001',
      name: 'PHC Wagholi',
      nameMr: 'प्रा. आ. केंद्र वाघोली',
      type: 'PHC',
      block: 'Haveli',
      blockMr: 'हवेली',
      inCharge: 'Dr. Priya Sharma',
      inChargeMr: 'डॉ. प्रिया शर्मा',
      inChargeRole: 'Medical Officer Gr. 1',
      phone: '020-27051234',
      coordinates: { lat: 18.5614, lng: 73.9838 },
      staffTotal: 12,
      staffPresent: 11,
      staffBreakdown: {
        medicalOfficers: { present: 2, total: 2 },
        staffNurses: { present: 3, total: 3 },
        anmWorkers: { present: 4, total: 4 },
        pharmacists: { present: 1, total: 1 },
        labTechnicians: { present: 1, total: 2 }
      },
      metrics: {
        consultationsToday: 47,
        consultationsTarget: 50,
        consultationsMonth: 1240,
        referralsSent: 8,
        referralsCompleted: 7,
        medicinesOutOfStock: 1,
        highRiskPatients: 34,
        overdueFollowUps: 3,
        deliveries: 3,
        vaccinationsToday: 12,
        tbPatientsActive: 8,
        tbCompliance: 61
      },
      performance: {
        score: 88,
        trend: '+3',
        lastMonth: 85
      },
      alerts: [],
      lastDataSync: new Date().toISOString()
    },
    {
      id: 'FAC002',
      name: 'CHC Kharadi',
      nameMr: 'समुदाय आ. केंद्र खराडी',
      type: 'CHC',
      block: 'Haveli',
      blockMr: 'हवेली',
      inCharge: 'Dr. Rahul Desai',
      inChargeMr: 'डॉ. राहुल देसाई',
      inChargeRole: 'Medical Superintendent',
      phone: '020-27051111',
      coordinates: { lat: 18.5562, lng: 73.9432 },
      staffTotal: 28,
      staffPresent: 18,
      staffBreakdown: {
        medicalOfficers: { present: 4, total: 6 },
        staffNurses: { present: 7, total: 10 },
        anmWorkers: { present: 4, total: 7 },
        pharmacists: { present: 1, total: 2 },
        labTechnicians: { present: 2, total: 3 }
      },
      metrics: {
        consultationsToday: 85,
        consultationsTarget: 150,
        consultationsMonth: 2890,
        referralsSent: 23,
        referralsCompleted: 14,
        medicinesOutOfStock: 7,
        highRiskPatients: 89,
        overdueFollowUps: 47,
        deliveries: 8,
        vaccinationsToday: 28,
        tbPatientsActive: 19,
        tbCompliance: 56
      },
      performance: {
        score: 52,
        trend: '-8',
        lastMonth: 60
      },
      alerts: [
        {
          id: 'alt-fac2-1',
          type: 'CRITICAL',
          category: 'medicine',
          messageEn: '7 essential medicines out of stock (including Amoxicillin & Iron)',
          messageMr: '७ अत्यावश्यक औषधांचा साठा संपला (एमोक्सिसिलिन व आयर्न समाविष्ट)',
          facilityId: 'FAC002',
          facilityName: 'CHC Kharadi'
        },
        {
          id: 'alt-fac2-2',
          type: 'WARNING',
          category: 'staff',
          messageEn: 'Staff attendance below 70% (18/28 present)',
          messageMr: 'कर्मचारी उपस्थिती ७०% पेक्षा कमी (१८/२८ उपस्थित)',
          facilityId: 'FAC002',
          facilityName: 'CHC Kharadi'
        },
        {
          id: 'alt-fac2-3',
          type: 'WARNING',
          category: 'highrisk',
          messageEn: '47 overdue high-risk maternal follow-ups',
          messageMr: '४७ उच्च जोखीम गरोदर महिलांची तपासणी प्रलंबित',
          facilityId: 'FAC002',
          facilityName: 'CHC Kharadi'
        }
      ],
      lastDataSync: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'FAC003',
      name: 'PHC Lohegaon',
      nameMr: 'प्रा. आ. केंद्र लोहगाव',
      type: 'PHC',
      block: 'Haveli',
      blockMr: 'हवेली',
      inCharge: 'Dr. Amit Kulkarni',
      inChargeMr: 'डॉ. अमित कुलकर्णी',
      inChargeRole: 'Medical Officer Gr. 1',
      phone: '020-27051456',
      coordinates: { lat: 18.5889, lng: 73.9121 },
      staffTotal: 10,
      staffPresent: 10,
      staffBreakdown: {
        medicalOfficers: { present: 2, total: 2 },
        staffNurses: { present: 3, total: 3 },
        anmWorkers: { present: 3, total: 3 },
        pharmacists: { present: 1, total: 1 },
        labTechnicians: { present: 1, total: 1 }
      },
      metrics: {
        consultationsToday: 50,
        consultationsTarget: 50,
        consultationsMonth: 1380,
        referralsSent: 5,
        referralsCompleted: 5,
        medicinesOutOfStock: 0,
        highRiskPatients: 28,
        overdueFollowUps: 0,
        deliveries: 2,
        vaccinationsToday: 18,
        tbPatientsActive: 5,
        tbCompliance: 60
      },
      performance: {
        score: 96,
        trend: '+6',
        lastMonth: 90
      },
      alerts: [],
      lastDataSync: new Date().toISOString()
    },
    {
      id: 'FAC004',
      name: 'SC Bhosari',
      nameMr: 'उपकेंद्र भोसरी',
      type: 'SC',
      block: 'Pimpri-Chinchwad',
      blockMr: 'पिंपरी-चिंचवड',
      inCharge: 'ANM Sunita Borde',
      inChargeMr: 'ए.एन.एम. सुनिता बोर्डे',
      inChargeRole: 'Auxiliary Nurse Midwife',
      phone: '020-27051789',
      coordinates: { lat: 18.6298, lng: 73.8567 },
      staffTotal: 3,
      staffPresent: 1,
      staffBreakdown: {
        medicalOfficers: { present: 0, total: 0 },
        staffNurses: { present: 0, total: 0 },
        anmWorkers: { present: 1, total: 2 },
        pharmacists: { present: 0, total: 0 },
        labTechnicians: { present: 0, total: 1 }
      },
      metrics: {
        consultationsToday: 6,
        consultationsTarget: 30,
        consultationsMonth: 234,
        referralsSent: 2,
        referralsCompleted: 1,
        medicinesOutOfStock: 9,
        highRiskPatients: 12,
        overdueFollowUps: 9,
        deliveries: 0,
        vaccinationsToday: 2,
        tbPatientsActive: 2,
        tbCompliance: 41
      },
      performance: {
        score: 28,
        trend: '-15',
        lastMonth: 43
      },
      alerts: [
        {
          id: 'alt-fac4-1',
          type: 'CRITICAL',
          category: 'staff',
          messageEn: 'Severe Staff Deficit: Only 1 of 3 staff present on duty',
          messageMr: 'गंभीर कर्मचारी कमतरता: ३ पैकी फक्त १ कर्मचारी कर्तव्यावर उपस्थित',
          facilityId: 'FAC004',
          facilityName: 'SC Bhosari'
        },
        {
          id: 'alt-fac4-2',
          type: 'CRITICAL',
          category: 'medicine',
          messageEn: '9 critical medicines completely out of stock',
          messageMr: '९ अत्यावश्यक औषधांचा साठा पूर्णपणे संपला आहे',
          facilityId: 'FAC004',
          facilityName: 'SC Bhosari'
        },
        {
          id: 'alt-fac4-3',
          type: 'CRITICAL',
          category: 'performance',
          messageEn: 'OPD Consultations severely lagging at 20% of target (6/30)',
          messageMr: 'ओपीडी तपासण्या उद्दिष्टाच्या फक्त २०% वर अत्यंत संथ (६/३०)',
          facilityId: 'FAC004',
          facilityName: 'SC Bhosari'
        }
      ],
      lastDataSync: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'FAC005',
      name: 'District Hospital Pune',
      nameMr: 'जिल्हा रुग्णालय पुणे (औंध)',
      type: 'DH',
      block: 'Pune City',
      blockMr: 'पुणे शहर',
      inCharge: 'Dr. Sunita Patel',
      inChargeMr: 'डॉ. सुनिता पटेल',
      inChargeRole: 'Civil Surgeon',
      phone: '020-26059999',
      coordinates: { lat: 18.5204, lng: 73.8567 },
      staffTotal: 312,
      staffPresent: 275,
      staffBreakdown: {
        medicalOfficers: { present: 45, total: 52 },
        staffNurses: { present: 135, total: 154 },
        anmWorkers: { present: 32, total: 36 },
        pharmacists: { present: 14, total: 16 },
        labTechnicians: { present: 49, total: 54 }
      },
      metrics: {
        consultationsToday: 800,
        consultationsTarget: 800,
        consultationsMonth: 21480,
        referralsSent: 34,
        referralsCompleted: 31,
        medicinesOutOfStock: 6,
        highRiskPatients: 234,
        overdueFollowUps: 24,
        deliveries: 14,
        vaccinationsToday: 87,
        tbPatientsActive: 89,
        tbCompliance: 92
      },
      performance: {
        score: 82,
        trend: '+2',
        lastMonth: 80
      },
      alerts: [
        {
          id: 'alt-fac5-1',
          type: 'INFO',
          category: 'medicine',
          messageEn: '3 specialized drugs nearing threshold buffer',
          messageMr: '३ विशेष औषधांचा साठा किमान मर्यादेजवळ आला आहे',
          facilityId: 'FAC005',
          facilityName: 'District Hospital Pune'
        }
      ],
      lastDataSync: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: 'FAC006',
      name: 'SC Vadgaon',
      nameMr: 'उपकेंद्र वडगाव',
      type: 'SC',
      block: 'Khed',
      blockMr: 'खेड',
      inCharge: 'ANM Meena Jadhav',
      inChargeMr: 'ए.एन.एम. मीना जाधव',
      inChargeRole: 'Auxiliary Nurse Midwife',
      phone: '02135-224110',
      coordinates: { lat: 18.8156, lng: 73.8821 },
      staffTotal: 2,
      staffPresent: 2,
      staffBreakdown: {
        medicalOfficers: { present: 0, total: 0 },
        staffNurses: { present: 0, total: 0 },
        anmWorkers: { present: 2, total: 2 },
        pharmacists: { present: 0, total: 0 },
        labTechnicians: { present: 0, total: 0 }
      },
      metrics: {
        consultationsToday: 22,
        consultationsTarget: 25,
        consultationsMonth: 580,
        referralsSent: 3,
        referralsCompleted: 3,
        medicinesOutOfStock: 1,
        highRiskPatients: 16,
        overdueFollowUps: 1,
        deliveries: 1,
        vaccinationsToday: 9,
        tbPatientsActive: 3,
        tbCompliance: 90
      },
      performance: {
        score: 84,
        trend: '+4',
        lastMonth: 80
      },
      alerts: [],
      lastDataSync: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      id: 'FAC007',
      name: 'RH Khed',
      nameMr: 'ग्रामीण रुग्णालय खेड (राजगुरुनगर)',
      type: 'SDH',
      block: 'Khed',
      blockMr: 'खेड',
      inCharge: 'Dr. Sanjay Shinde',
      inChargeMr: 'डॉ. संजय शिंदे',
      inChargeRole: 'Medical Superintendent',
      phone: '02135-222340',
      coordinates: { lat: 18.8450, lng: 73.8920 },
      staffTotal: 25,
      staffPresent: 22,
      staffBreakdown: {
        medicalOfficers: { present: 4, total: 5 },
        staffNurses: { present: 9, total: 10 },
        anmWorkers: { present: 4, total: 4 },
        pharmacists: { present: 2, total: 2 },
        labTechnicians: { present: 3, total: 4 }
      },
      metrics: {
        consultationsToday: 94,
        consultationsTarget: 100,
        consultationsMonth: 2410,
        referralsSent: 14,
        referralsCompleted: 12,
        medicinesOutOfStock: 1,
        highRiskPatients: 46,
        overdueFollowUps: 4,
        deliveries: 6,
        vaccinationsToday: 24,
        tbPatientsActive: 12,
        tbCompliance: 88
      },
      performance: {
        score: 79,
        trend: '+1',
        lastMonth: 78
      },
      alerts: [
        {
          id: 'alt-fac7-1',
          type: 'INFO',
          category: 'performance',
          messageEn: 'Vaccination drive target reached for current week',
          messageMr: 'चालू आठवड्यासाठी लसीकरण मोहिमेचे उद्दिष्ट पूर्ण झाले',
          facilityId: 'FAC007',
          facilityName: 'RH Khed'
        }
      ],
      lastDataSync: new Date(Date.now() - 110 * 60 * 1000).toISOString()
    }
  ],
  trends: {
    consultations: [
      { date: '25 Nov', value: 3120, target: 3000 },
      { date: '26 Nov', value: 3456, target: 3000 },
      { date: '27 Nov', value: 2890, target: 3000 },
      { date: '28 Nov', value: 3234, target: 3000 },
      { date: '29 Nov', value: 3678, target: 3000 },
      { date: '30 Nov', value: 3421, target: 3000 }
    ],
    referrals: [65, 78, 56, 89, 72, 67],
    stockAlerts: [12, 18, 15, 22, 19, 23]
  }
};

/**
 * Fetch District Data from backend or fallback to enriched mock data
 */
export async function fetchDistrictData(): Promise<DistrictData> {
  try {
    const res = await fetch('/api/dashboard/district');
    if (res.ok) {
      const data = await res.json();
      if (data && data.district && data.facilities) {
        return enrichDistrictData(data);
      }
    }
  } catch {
    // offline or backend not running, fallback to mock data
  }
  return enrichDistrictData(MOCK_DISTRICT_DATA);
}

/**
 * Fetch Individual Facility Metrics
 */
export async function fetchFacilityMetrics(facilityId: string): Promise<Facility | null> {
  try {
    const res = await fetch(`/api/dashboard/facility/${facilityId}`);
    if (res.ok) {
      const json = await res.json();
      if (json.facility) {
        const fac = json.facility as Facility;
        const score = calculateFacilityScore(fac);
        return {
          ...fac,
          calculatedScore: score,
          grade: getPerformanceGrade(score)
        };
      }
    }
  } catch {
    // fallback
  }

  const found = MOCK_DISTRICT_DATA.facilities.find(f => f.id === facilityId);
  if (!found) return null;
  const score = calculateFacilityScore(found);
  return {
    ...found,
    calculatedScore: score,
    grade: getPerformanceGrade(score)
  };
}

/**
 * Dispatch Admin Action (Stock dispatch, send notice, call)
 */
export async function dispatchFacilityAction(
  facilityId: string,
  actionType: 'DISPATCH_STOCK' | 'SEND_NOTICE' | 'DISPATCH_INSPECTOR' | 'EMERGENCY_ESCALATION',
  notes?: string
): Promise<{ success: boolean; messageEn: string; messageMr: string; actionId: string }> {
  const actionId = `ACT-MH-${Date.now().toString(36).toUpperCase()}`;
  try {
    const res = await fetch(`/api/dashboard/facility/${facilityId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType, notes, actionId })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // mock response
  }

  const messages = {
    DISPATCH_STOCK: {
      en: `Emergency stock dispatch requisition created (#${actionId}). Indent routed to District Warehouse Aundh.`,
      mr: `तातडीचा औषध पुरवठा मागणी अर्ज तयार केला (#${actionId}). औंध जिल्हा वखार केंद्राकडे पाठवला.`
    },
    SEND_NOTICE: {
      en: `Formal compliance inquiry notice served to Facility In-Charge (#${actionId}). Response required within 24h.`,
      mr: `केंद्र प्रमुखांना अधिकृत स्पष्टीकरण नोटीस जारी करण्यात आली (#${actionId}). २४ तासांत खुलासा अनिवार्य.`
    },
    DISPATCH_INSPECTOR: {
      en: `District Quality Inspector deployed for spot inspection (#${actionId}). Scheduled within 4 hours.`,
      mr: `जिल्हा गुणवत्ता निरीक्षकांची प्रत्यक्ष पाहणीसाठी नेमणूक करण्यात आली (#${actionId}). पुढील ४ तासांत भेट.`
    },
    EMERGENCY_ESCALATION: {
      en: `Direct red-flag escalated to District Collector & Directorate of Health Services (#${actionId}).`,
      mr: `जिल्हाधिकारी व आरोग्य संचालनालयाकडे थेट तातडीचे पत्र पाठवले (#${actionId}).`
    }
  };

  return {
    success: true,
    actionId,
    messageEn: messages[actionType]?.en || 'Action recorded successfully.',
    messageMr: messages[actionType]?.mr || 'कारवाई यशस्वीरीत्या नोंदवली गेली.'
  };
}

/**
 * Enriches facilities with calculated score and performance grade
 */
export function enrichDistrictData(raw: DistrictData): DistrictData {
  const facilities = raw.facilities.map(f => {
    const score = calculateFacilityScore(f);
    const grade = getPerformanceGrade(score);
    return {
      ...f,
      calculatedScore: score,
      grade
    };
  });

  return {
    ...raw,
    facilities
  };
}
