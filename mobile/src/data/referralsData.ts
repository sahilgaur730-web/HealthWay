/**
 * Authoritative 7-Stage Inter-Facility Referral Pipeline Data & SLAs
 * Complies with Features 13-14, Tier 1, and Tier 4 requirements.
 */

import { Referral, ReferralStage, ReferralUrgency } from '../types/referral';

export const REFERRAL_STAGES_LIST: ReferralStage[] = [
  'CREATED',
  'NOTIFIED',
  'ACCEPTED',
  'IN_TRANSIT',
  'REACHED',
  'ADMITTED',
  'COMPLETED',
];

export const REFERRAL_SLAS_MINUTES: Record<ReferralUrgency, number> = {
  IMMEDIATE: 60,     // 1 hr (<= 2h max)
  URGENT: 360,       // 6 hrs (<= 24h max)
  PRIORITY: 1440,    // 24 hrs (<= 72h max)
  ROUTINE: 4320,     // 72 hrs (<= 7d max)
};

export function computeReferralSla(createdAtIso: string, urgency: ReferralUrgency): {
  remainingMinutes: number;
  isOverdue: boolean;
  overdueByMinutes: number;
  formattedRemaining: string;
} {
  const createdTime = new Date(createdAtIso).getTime();
  const slaMins = REFERRAL_SLAS_MINUTES[urgency];
  const elapsedMins = (Date.now() - createdTime) / (60 * 1000);
  const remainingMins = Math.round(slaMins - elapsedMins);
  const isOverdue = remainingMins <= 0;
  const overdueByMinutes = isOverdue ? Math.abs(remainingMins) : 0;

  let formattedRemaining = '';
  if (isOverdue) {
    const hours = Math.floor(overdueByMinutes / 60);
    const mins = overdueByMinutes % 60;
    formattedRemaining = hours > 0 ? `Overdue by ${hours}h ${mins}m` : `Overdue by ${mins}m`;
  } else {
    const hours = Math.floor(remainingMins / 60);
    const mins = remainingMins % 60;
    formattedRemaining = hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  }

  return { remainingMinutes: remainingMins, isOverdue, overdueByMinutes, formattedRemaining };
}

export const INITIAL_REFERRALS_DATA: Referral[] = [
  {
    id: 'REF-20240615-9102',
    patientId: 'PT-001',
    patientName: 'Sunita Ramchandra Jadhav',
    patientNameMr: 'सुनीता रामचंद्र जाधव',
    patientPhone: '+91 98223 04912',
    patientVillage: 'Tapola, Mahabaleshwar',
    patientAge: 28,
    patientGender: 'Female',
    abhaId: '14-4821-9876-5432',
    fromFacilityId: 'FAC007',
    fromFacilityName: 'Sub-Centre Tapola',
    fromDoctorName: 'Sister Anandi Gaikwad (ANM)',
    toFacilityId: 'FAC001',
    toFacilityName: 'District Hospital Satara',
    department: 'Obstetrics & Gynecology (OBGYN)',
    urgency: 'URGENT',
    primaryReason: 'High-risk antenatal in 34th week with fetal growth lag, requiring tertiary Doppler USG.',
    provisionalDiagnosis: 'High-Risk Pregnancy (O36.5) / Mild Nutritional Anemia',
    vitalsSummary: { bp: '118/76 mmHg', pulse: '76 bpm', spO2: '99%', sugar: '94 mg/dL' },
    transportNeeded: true,
    transportType: '102_JANANI',
    transportStatus: {
      vehicleNumber: 'MH-12-AH-8419',
      driverName: 'Gajanan Shinde',
      driverPhone: '+91 98901 23450',
      etaMinutes: 18,
      liveStatus: '102 Janani Ambulance en route to Satara District Hospital',
    },
    ashaEscortAssigned: true,
    ashaName: 'Suman Tai Patil',
    ashaPhone: '+91 94231 80912',
    stage: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    isOverdue: false,
    stageHistory: [
      { stage: 'CREATED', timestamp: '15 Jun, 10:00 AM', note: 'Referral initiated by ANM Anandi Gaikwad for Doppler review.', updatedBy: 'Sister Anandi Gaikwad' },
      { stage: 'NOTIFIED', timestamp: '15 Jun, 10:05 AM', note: 'Automated SMS sent to patient and ASHA escort.', updatedBy: 'System Gateway' },
      { stage: 'ACCEPTED', timestamp: '15 Jun, 10:45 AM', note: 'Accepted by Duty Medical Officer, District Hospital Satara.', updatedBy: 'Dr. V. M. Kulkarni' },
      { stage: 'IN_TRANSIT', timestamp: '15 Jun, 01:15 PM', note: 'Patient boarded 102 Janani Express accompanied by ASHA escort.', updatedBy: 'Driver Gajanan Shinde' },
    ],
  },
  {
    id: 'REF-20240616-0081',
    patientId: 'PT-ANC-POOJA',
    patientName: 'Pooja Sachin Jadhav',
    patientNameMr: 'पूजा सचिन जाधव',
    patientPhone: '+91 98224 51009',
    patientVillage: 'Vadgaon, Shirur',
    patientAge: 24,
    patientGender: 'Female',
    abhaId: '14-8899-7766-5544',
    fromFacilityId: 'FAC007',
    fromFacilityName: 'Sub-Centre Tapola',
    fromDoctorName: 'Sister Anandi Gaikwad (ANM)',
    toFacilityId: 'FAC001',
    toFacilityName: 'District Hospital Satara',
    department: 'Obstetric High-Risk ICU',
    urgency: 'IMMEDIATE',
    primaryReason: 'Impending Eclampsia: BP 168/108, severe headache, epigastric pain, visual blurriness.',
    provisionalDiagnosis: 'Severe Preeclampsia in 34th Week with Impending Eclampsia',
    vitalsSummary: { bp: '168/108 mmHg', pulse: '98 bpm', spO2: '96%', sugar: '120 mg/dL' },
    transportNeeded: true,
    transportType: '108_AMBULANCE',
    transportStatus: {
      vehicleNumber: 'MH-12-1080',
      driverName: 'Sachin Gaikwad',
      driverPhone: '+91 98221 19988',
      etaMinutes: 12,
      liveStatus: '108 ALS Ambulance siren active, pre-arrival CASUALTY alert signaled',
    },
    ashaEscortAssigned: true,
    ashaName: 'Anandi Gaikwad',
    ashaPhone: '+91 94220 01122',
    stage: 'ACCEPTED',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    isOverdue: false,
    stageHistory: [
      { stage: 'CREATED', timestamp: '16 Jun, 09:30 AM', note: 'Emergency referral generated with Magnesium Sulfate loading.', updatedBy: 'Sister Anandi Gaikwad' },
      { stage: 'NOTIFIED', timestamp: '16 Jun, 09:32 AM', note: '108 Control Room alerted, ALS dispatched.', updatedBy: '108 Dispatcher' },
      { stage: 'ACCEPTED', timestamp: '16 Jun, 09:40 AM', note: 'Accepted by Dr. V. M. Kulkarni; Obstetric ICU bed reserved.', updatedBy: 'Dr. V. M. Kulkarni' },
    ],
  },
  {
    id: 'REF-20240612-8840',
    patientId: 'PT-002',
    patientName: 'Mahadev Vitthal Patil',
    patientNameMr: 'महादेव विठ्ठल पाटील',
    patientPhone: '+91 98224 51001',
    patientVillage: 'Medha, Jawali',
    patientAge: 58,
    patientGender: 'Male',
    abhaId: '14-1122-3344-5566',
    fromFacilityId: 'FAC006',
    fromFacilityName: 'Primary Health Centre Medha',
    fromDoctorName: 'Dr. R. B. Chavan',
    toFacilityId: 'FAC001',
    toFacilityName: 'District Hospital Satara',
    department: 'Cardiology & Intensive Coronary Care (ICCU)',
    urgency: 'IMMEDIATE',
    primaryReason: 'Acute Coronary Syndrome with elevated Troponin I (148.5 pg/mL) and severe hyperglycaemia (382 mg/dL).',
    provisionalDiagnosis: 'Acute Coronary Syndrome (STEMI/NSTEMI) / Uncontrolled Type 2 Diabetes',
    vitalsSummary: { bp: '150/98 mmHg', pulse: '92 bpm', spO2: '97%', sugar: '382 mg/dL' },
    transportNeeded: true,
    transportType: '108_AMBULANCE',
    ashaEscortAssigned: false,
    stage: 'COMPLETED',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() - 71 * 3600 * 1000).toISOString(),
    isOverdue: false,
    stageHistory: [
      { stage: 'CREATED', timestamp: '12 Jun, 08:30 AM', note: 'Emergency referral generated with STAT ECG alert.', updatedBy: 'Dr. R. B. Chavan' },
      { stage: 'NOTIFIED', timestamp: '12 Jun, 08:32 AM', note: '108 Command Room dispatched ALS unit.', updatedBy: '108 Dispatcher' },
      { stage: 'ACCEPTED', timestamp: '12 Jun, 08:40 AM', note: 'ICCU Trauma Team mobilized at DH Satara.', updatedBy: 'Dr. V. M. Kulkarni' },
      { stage: 'IN_TRANSIT', timestamp: '12 Jun, 08:50 AM', note: 'Ambulance transit with oxygen & continuous cardiac telemetry.', updatedBy: 'Paramedic Shinde' },
      { stage: 'REACHED', timestamp: '12 Jun, 09:55 AM', note: 'Arrived at Satara District Hospital emergency casualty.', updatedBy: 'Casualty MO' },
      { stage: 'ADMITTED', timestamp: '12 Jun, 10:10 AM', note: 'Admitted to ICCU Bed 4; Coronary angiography performed.', updatedBy: 'Dr. Avinash Sawant' },
      { stage: 'COMPLETED', timestamp: '14 Jun, 04:00 PM', note: 'Patient stabilized, medically optimized, discharged with counter-referral to PHC Medha.', updatedBy: 'Dr. Avinash Sawant' },
    ],
    feedback: {
      doctorName: 'Dr. Avinash Sawant (MD, DM Cardiology)',
      hospitalName: 'District Hospital Satara Apex Cardiac Unit',
      date: '14 Jun 2024',
      counterReferralNotes: 'Patient underwent coronary angiography revealing 70% proximal LAD stenosis managed medically with Dual Antiplatelets (Aspirin + Clopidogrel), Atorvastatin 40mg, and Metformin titration. Glycemia stabilized to 128 mg/dL.',
      treatmentGiven: '1. Tab Aspirin 75mg + Clopidogrel 75mg OD\n2. Tab Atorvastatin 40mg HS\n3. Tab Metformin 500mg BD after meals\n4. Inj. Regular Insulin during acute phase, converted to oral agents.',
      dischargeAdvice: 'Weekly BP check and 12-lead ECG review at PHC Medha. Fasting blood sugar monitoring every 14 days by ASHA. Follow-up in Cardiology OPD on 28 Jun 2024.',
    },
  },
  {
    id: 'REF-20240616-0044',
    patientId: 'PT-005',
    patientName: 'Aniket Dattatray Shinde',
    patientNameMr: 'अनिकेत दत्तात्रय शिंदे',
    patientPhone: '+91 98229 44332',
    patientVillage: 'Kusgaon, Wai',
    patientAge: 19,
    patientGender: 'Male',
    abhaId: '14-3322-1100-9988',
    fromFacilityId: 'FAC006',
    fromFacilityName: 'Primary Health Centre Medha',
    fromDoctorName: 'Dr. R. B. Chavan',
    toFacilityId: 'FAC003',
    toFacilityName: 'Community Health Centre Wai',
    department: 'Orthopedics & Digital X-Ray',
    urgency: 'PRIORITY',
    primaryReason: 'Right lower limb trauma following farm equipment injury. Severe swelling, inability to bear weight.',
    provisionalDiagnosis: 'Suspected Right Tibia-Fibula Fracture',
    vitalsSummary: { bp: '124/82 mmHg', pulse: '84 bpm', spO2: '98%', sugar: '102 mg/dL' },
    transportNeeded: false,
    transportType: 'OWN_VEHICLE',
    ashaEscortAssigned: false,
    stage: 'CREATED',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    isOverdue: false,
    stageHistory: [
      { stage: 'CREATED', timestamp: '16 Jun, 11:00 AM', note: 'Priority referral created with limb immobilization splint applied.', updatedBy: 'Dr. R. B. Chavan' },
    ],
  },
  {
    id: 'REF-20240614-7721',
    patientId: 'PT-006',
    patientName: 'Dnyaneshwar Vitthal Rao',
    patientNameMr: 'ज्ञानेश्वर विठ्ठल राव',
    patientPhone: '+91 98226 77112',
    patientVillage: 'Pratapgad, Mahabaleshwar',
    patientAge: 46,
    patientGender: 'Male',
    abhaId: '14-4455-6677-8899',
    fromFacilityId: 'FAC005',
    fromFacilityName: 'Primary Health Centre Mahabaleshwar',
    fromDoctorName: 'Dr. P. T. More',
    toFacilityId: 'FAC001',
    toFacilityName: 'District Hospital Satara',
    department: 'Emergency Medicine & Toxicology',
    urgency: 'IMMEDIATE',
    primaryReason: 'Russell\'s Viper Snakebite with hemotoxic signs (local swelling, whole blood clotting time >20 mins).',
    provisionalDiagnosis: 'Viperid Snake Envenomation (T63.0)',
    vitalsSummary: { bp: '100/60 mmHg', pulse: '110 bpm', spO2: '95%' },
    transportNeeded: true,
    transportType: '108_AMBULANCE',
    transportStatus: {
      vehicleNumber: 'MH-12-EM-1088',
      driverName: 'Vinod Pawar',
      driverPhone: '+91 98225 66778',
      etaMinutes: 0,
      liveStatus: 'Admitted to Satara District Hospital Trauma Bay',
    },
    ashaEscortAssigned: true,
    ashaName: 'Meena Tai Bhosale',
    stage: 'ADMITTED',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    isOverdue: false,
    stageHistory: [
      { stage: 'CREATED', timestamp: '16 Jun, 06:00 AM', note: '10 vials Polyvalent ASV reconstituted and IV started.', updatedBy: 'Dr. P. T. More' },
      { stage: 'NOTIFIED', timestamp: '16 Jun, 06:05 AM', note: 'Emergency 108 dispatched.', updatedBy: '108 Control' },
      { stage: 'ACCEPTED', timestamp: '16 Jun, 06:15 AM', note: 'Accepted by Satara Casualty In-charge.', updatedBy: 'Casualty MO' },
      { stage: 'IN_TRANSIT', timestamp: '16 Jun, 06:30 AM', note: 'Patient in transit with vitals monitoring.', updatedBy: 'Paramedic' },
      { stage: 'REACHED', timestamp: '16 Jun, 07:45 AM', note: 'Arrived at Satara Casualty gate.', updatedBy: 'Triage Nurse' },
      { stage: 'ADMITTED', timestamp: '16 Jun, 08:00 AM', note: 'Patient in ICU; 2nd dose ASV administered, urine output monitored.', updatedBy: 'Dr. Kulkarni' },
    ],
  },
  {
    id: 'REF-20240610-1123',
    patientId: 'PT-007',
    patientName: 'Kisanrao Bapu Shinde',
    patientNameMr: 'किसनराव बापू शिंदे',
    patientPhone: '+91 98221 00998',
    patientVillage: 'Koregaon Rural',
    patientAge: 65,
    patientGender: 'Male',
    abhaId: '14-7766-5544-3322',
    fromFacilityId: 'FAC004',
    fromFacilityName: 'Community Health Centre Koregaon',
    fromDoctorName: 'Dr. N. G. Shinde',
    toFacilityId: 'FAC001',
    toFacilityName: 'District Hospital Satara',
    department: 'General Surgery & Ophthalmology',
    urgency: 'IMMEDIATE',
    primaryReason: 'Acute glaucoma attack with severe ocular pain and vision loss.',
    provisionalDiagnosis: 'Acute Angle-Closure Glaucoma',
    vitalsSummary: { bp: '160/95 mmHg', pulse: '88 bpm', spO2: '98%' },
    transportNeeded: true,
    transportType: '108_AMBULANCE',
    ashaEscortAssigned: false,
    stage: 'OVERDUE',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    slaDeadline: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    isOverdue: true,
    overdueHours: 4,
    stageHistory: [
      { stage: 'CREATED', timestamp: '16 Jun, 07:00 AM', note: 'Immediate referral issued. Mannitol IV infused.', updatedBy: 'Dr. N. G. Shinde' },
      { stage: 'OVERDUE', timestamp: '16 Jun, 09:00 AM', note: 'ALERT: SLA expired without receiving hospital admission confirmation.', updatedBy: 'System Monitor' },
    ],
  },
];
