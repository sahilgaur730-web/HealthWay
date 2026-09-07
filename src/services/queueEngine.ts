/**
 * HealthWay Queue & Appointment Management Engine
 * Implements real-time queueing, priority triage, AI wait prediction,
 * multi-tab synchronization (BroadcastChannel), and state persistence.
 */

export interface HealthCenterModel {
  _id: string;
  name: string;
  type: 'sub-centre' | 'phc' | 'rural-hospital' | 'district-hospital';
  typeLabel: string;
  typeLabelMr: string;
  location: {
    address?: string;
    village: string;
    block: string;
    district: string;
    state: string;
    pincode?: string;
    coordinates?: { lat: number; lng: number };
  };
  contact: {
    phone: string;
    alternatePhone?: string;
    email?: string;
  };
  departments: Array<{
    name: string;
    nameMr: string;
    doctorCount: number;
    avgConsultationTime: number;
  }>;
  facilities: string[];
  totalDailyCapacity: number;
  currentQueueCount: number;
  isActive: boolean;
  rating: number;
  totalReviews: number;
}

export interface DoctorModel {
  _id: string;
  name: string;
  nameMr: string;
  registrationNumber: string;
  specialization: string;
  specializationMr: string;
  qualifications: string[];
  healthCenterId: string;
  department: string;
  schedule: Array<{
    day: string;
    slots: Array<{
      startTime: string;
      endTime: string;
      maxPatients: number;
      bookedPatients: number;
      slotType: 'general' | 'emergency' | 'antenatal' | 'immunization';
    }>;
  }>;
  avgConsultationTime: number;
  isAvailable: boolean;
  languages: string[];
}

export interface AppointmentModel {
  appointmentId: string;
  patient: {
    name: string;
    phone: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    abhaId?: string;
    address?: string;
  };
  healthCenterId: string;
  healthCenterName: string;
  doctorId?: string;
  doctorName?: string;
  department: string;
  appointmentDate: string; // ISO date string
  timeSlot: {
    startTime: string;
    endTime: string;
    slotIndex?: number;
  };
  tokenNumber?: number;
  type: 'regular' | 'emergency' | 'follow-up' | 'antenatal' | 'immunization' | 'teleconsultation';
  status: 'booked' | 'confirmed' | 'waiting' | 'in-consultation' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  priority: 'normal' | 'urgent' | 'emergency';
  symptoms: string[];
  chiefComplaint?: string;
  queuePosition?: number;
  estimatedWaitTime?: number; // minutes
  checkInTime?: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  isAshaAssisted?: boolean;
  ashaWorkerId?: string;
  notes?: string;
  cancellationReason?: string;
}

export interface QueueEntryModel {
  tokenNumber: number;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'waiting' | 'called' | 'in-consultation' | 'completed' | 'skipped' | 'absent';
  checkInTime: string;
  calledTime?: string;
  completionTime?: string;
  waitDuration?: number; // minutes
  consultationDuration?: number; // minutes
  position: number;
  estimatedWait: number; // minutes
}

export interface QueueModel {
  healthCenterId: string;
  department: string;
  date: string;
  currentToken: number;
  entries: QueueEntryModel[];
  stats: {
    totalTokensIssued: number;
    totalCompleted: number;
    totalSkipped: number;
    avgWaitTime: number;
    avgConsultationTime: number;
    lastUpdated: string;
  };
  isActive: boolean;
  pausedAt?: string;
  pauseReason?: string;
}

export interface ClientQueueData {
  currentToken: number;
  currentPatient: {
    tokenNumber: number;
    name: string;
    calledAt?: string;
  } | null;
  waitingCount: number;
  completedCount: number;
  skippedCount: number;
  avgWaitTime: number;
  isActive: boolean;
  isPaused: boolean;
  pauseReason?: string;
  waitingList: Array<{
    position: number;
    tokenNumber: number;
    patientName?: string;
    priority: 'normal' | 'urgent' | 'emergency';
    estimatedWait: number;
    checkInTime: string;
  }>;
  stats: QueueModel['stats'];
  lastUpdated: string;
}

// -------------------------------------------------------------
// DEFAULT MOCK HEALTH CENTERS
// -------------------------------------------------------------
export const SEED_HEALTH_CENTERS: HealthCenterModel[] = [
  {
    _id: 'phc_baramati',
    name: 'Primary Health Centre Baramati',
    type: 'phc',
    typeLabel: 'Primary Health Centre (PHC)',
    typeLabelMr: 'प्राथमिक आरोग्य केंद्र (PHC)',
    location: {
      address: 'Near Taluka Panchayat Office, Station Road',
      village: 'Baramati Rural',
      block: 'Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '413102'
    },
    contact: {
      phone: '02112-224501',
      alternatePhone: '9822014589',
      email: 'phc.baramati@health.maharashtra.gov.in'
    },
    departments: [
      { name: 'General Medicine', nameMr: 'सामान्य बाह्यरुग्ण (OPD)', doctorCount: 2, avgConsultationTime: 10 },
      { name: 'Maternal & Antenatal', nameMr: 'प्रसूतीपूर्व व माता आरोग्य (ANC)', doctorCount: 1, avgConsultationTime: 15 },
      { name: 'Pediatrics & Immunization', nameMr: 'बालरोग व लसीकरण कक्ष', doctorCount: 1, avgConsultationTime: 10 },
      { name: 'NCD Clinic', nameMr: 'मधुमेह व रक्तदाब कक्ष', doctorCount: 1, avgConsultationTime: 12 }
    ],
    facilities: ['OPD', 'Emergency Ward', '24x7 Lab', 'Jan Aushadhi Pharmacy', 'Maternity Ward', 'Cold Chain'],
    totalDailyCapacity: 80,
    currentQueueCount: 14,
    isActive: true,
    rating: 4.6,
    totalReviews: 128
  },
  {
    _id: 'sub_patas',
    name: 'Sub-Centre Patas',
    type: 'sub-centre',
    typeLabel: 'Sub-Centre',
    typeLabelMr: 'उपकेंद्र',
    location: {
      village: 'Patas',
      block: 'Daund',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '412219'
    },
    contact: {
      phone: '02117-235120',
      alternatePhone: '9860341290'
    },
    departments: [
      { name: 'General Medicine', nameMr: 'प्राथमिक उपचार (General)', doctorCount: 1, avgConsultationTime: 8 },
      { name: 'Immunization', nameMr: 'बाल लसीकरण', doctorCount: 1, avgConsultationTime: 10 }
    ],
    facilities: ['Basic OPD', 'ASHA Rest Desk', 'Vaccine Storage', 'First Aid'],
    totalDailyCapacity: 35,
    currentQueueCount: 5,
    isActive: true,
    rating: 4.2,
    totalReviews: 42
  },
  {
    _id: 'rh_junnar',
    name: 'Rural Hospital Junnar',
    type: 'rural-hospital',
    typeLabel: 'Rural Hospital',
    typeLabelMr: 'ग्रामीण रुग्णालय',
    location: {
      village: 'Junnar City',
      block: 'Junnar',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '410502'
    },
    contact: {
      phone: '02132-222045',
      alternatePhone: '9423589012'
    },
    departments: [
      { name: 'General Medicine', nameMr: 'सामान्य बाह्यरुग्ण (OPD)', doctorCount: 3, avgConsultationTime: 10 },
      { name: 'Gynaecology & Maternity', nameMr: 'स्त्रीरोग व प्रसूती', doctorCount: 2, avgConsultationTime: 15 },
      { name: 'Pediatrics', nameMr: 'बालरोग विभाग', doctorCount: 1, avgConsultationTime: 10 },
      { name: 'Surgery & Trauma', nameMr: 'शल्यचिकित्सा व अपघात कक्ष', doctorCount: 2, avgConsultationTime: 20 },
      { name: 'Dental Care', nameMr: 'दंत चिकित्सा कक्ष', doctorCount: 1, avgConsultationTime: 15 }
    ],
    facilities: ['Emergency OT', 'X-Ray & Sonography', 'Pathology Lab', 'Blood Storage', '24x7 Ambulance'],
    totalDailyCapacity: 160,
    currentQueueCount: 38,
    isActive: true,
    rating: 4.4,
    totalReviews: 215
  },
  {
    _id: 'dh_satara',
    name: 'District Civil Hospital Satara',
    type: 'district-hospital',
    typeLabel: 'District Hospital',
    typeLabelMr: 'जिल्हा सामान्य रुग्णालय',
    location: {
      address: 'Sadar Bazar, Civil Lines',
      village: 'Satara',
      block: 'Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415001'
    },
    contact: {
      phone: '02162-234200',
      alternatePhone: '02162-234201',
      email: 'civilhospital.satara@health.maharashtra.gov.in'
    },
    departments: [
      { name: 'General Medicine', nameMr: 'सामान्य बाह्यरुग्ण (OPD)', doctorCount: 5, avgConsultationTime: 10 },
      { name: 'Cardiology & NCD', nameMr: 'हृदयरोग व गंभीर आजार कक्ष', doctorCount: 2, avgConsultationTime: 15 },
      { name: 'Orthopaedics', nameMr: 'अस्थिरोग विभाग', doctorCount: 2, avgConsultationTime: 12 },
      { name: 'Obstetrics & Gynaecology', nameMr: 'प्रसूती व स्त्रीरोग विभाग', doctorCount: 3, avgConsultationTime: 15 },
      { name: 'Ophthalmology', nameMr: 'नेत्रचिकित्सा विभाग', doctorCount: 2, avgConsultationTime: 10 },
      { name: 'TB & Chest Clinic', nameMr: 'क्षयरोग व श्वसनरोग (NTEP)', doctorCount: 1, avgConsultationTime: 12 }
    ],
    facilities: ['ICU & NICU', 'CT Scan & Dialysis', 'Blood Bank', 'Advanced Pathology', 'Tele-ICU Hub', 'ABHA Kiosk'],
    totalDailyCapacity: 350,
    currentQueueCount: 92,
    isActive: true,
    rating: 4.7,
    totalReviews: 640
  }
];

export const SEED_DOCTORS: DoctorModel[] = [
  {
    _id: 'doc_1',
    name: 'Dr. Anand Kulkarni',
    nameMr: 'डॉ. आनंद कुलकर्णी',
    registrationNumber: 'MCI-2015-88421',
    specialization: 'General Medicine',
    specializationMr: 'सामान्य वैद्यकशास्त्र (MBBS)',
    qualifications: ['MBBS', 'MD (Gen Med)'],
    healthCenterId: 'phc_baramati',
    department: 'General Medicine',
    schedule: [
      {
        day: 'monday',
        slots: [
          { startTime: '09:00 AM', endTime: '09:30 AM', maxPatients: 8, bookedPatients: 4, slotType: 'general' },
          { startTime: '09:30 AM', endTime: '10:00 AM', maxPatients: 8, bookedPatients: 6, slotType: 'general' },
          { startTime: '10:00 AM', endTime: '10:30 AM', maxPatients: 8, bookedPatients: 8, slotType: 'general' },
          { startTime: '10:30 AM', endTime: '11:00 AM', maxPatients: 8, bookedPatients: 3, slotType: 'general' },
          { startTime: '11:30 AM', endTime: '12:00 PM', maxPatients: 8, bookedPatients: 2, slotType: 'general' },
          { startTime: '02:00 PM', endTime: '02:30 PM', maxPatients: 6, bookedPatients: 1, slotType: 'general' }
        ]
      }
    ],
    avgConsultationTime: 10,
    isAvailable: true,
    languages: ['Marathi', 'Hindi', 'English']
  },
  {
    _id: 'doc_2',
    name: 'Dr. Sunita Deshpande',
    nameMr: 'डॉ. सुनिता देशपांडे',
    registrationNumber: 'MCI-2012-39401',
    specialization: 'Obstetrics & Gynaecology',
    specializationMr: 'प्रसूती व स्त्रीरोगतज्ज्ञ (DGO)',
    qualifications: ['MBBS', 'DGO'],
    healthCenterId: 'phc_baramati',
    department: 'Maternal & Antenatal',
    schedule: [
      {
        day: 'monday',
        slots: [
          { startTime: '09:30 AM', endTime: '10:00 AM', maxPatients: 6, bookedPatients: 5, slotType: 'antenatal' },
          { startTime: '10:30 AM', endTime: '11:00 AM', maxPatients: 6, bookedPatients: 3, slotType: 'antenatal' },
          { startTime: '02:30 PM', endTime: '03:00 PM', maxPatients: 6, bookedPatients: 2, slotType: 'antenatal' }
        ]
      }
    ],
    avgConsultationTime: 15,
    isAvailable: true,
    languages: ['Marathi', 'Hindi']
  },
  {
    _id: 'doc_3',
    name: 'Dr. Rajesh Gaikwad',
    nameMr: 'डॉ. राजेश गायकवाड',
    registrationNumber: 'MCI-2018-99014',
    specialization: 'Pediatrics',
    specializationMr: 'बालरोगतज्ज्ञ (DCH)',
    qualifications: ['MBBS', 'DCH'],
    healthCenterId: 'rh_junnar',
    department: 'Pediatrics',
    schedule: [
      {
        day: 'monday',
        slots: [
          { startTime: '09:00 AM', endTime: '09:30 AM', maxPatients: 8, bookedPatients: 2, slotType: 'immunization' },
          { startTime: '10:00 AM', endTime: '10:30 AM', maxPatients: 8, bookedPatients: 4, slotType: 'immunization' }
        ]
      }
    ],
    avgConsultationTime: 10,
    isAvailable: true,
    languages: ['Marathi', 'Hindi', 'English']
  }
];

// Initial pre-loaded appointments for live testing
const SEED_APPOINTMENTS: AppointmentModel[] = [
  {
    appointmentId: 'APT20260907001',
    patient: {
      name: 'Ramesh Vitthal Shinde',
      phone: '9822104599',
      age: 48,
      gender: 'male',
      abhaId: '91-4402-8819-2041',
      address: 'Baramati Rural, Ward 4'
    },
    healthCenterId: 'phc_baramati',
    healthCenterName: 'Primary Health Centre Baramati',
    doctorId: 'doc_1',
    doctorName: 'Dr. Anand Kulkarni',
    department: 'General Medicine',
    appointmentDate: new Date().toISOString(),
    timeSlot: { startTime: '09:00 AM', endTime: '09:30 AM' },
    tokenNumber: 1,
    type: 'regular',
    status: 'completed',
    priority: 'normal',
    symptoms: ['Fever / ताप', 'Headache / डोकेदुखी'],
    chiefComplaint: 'Continuous viral fever since 2 days',
    checkInTime: new Date(Date.now() - 65 * 60000).toISOString(),
    consultationStartTime: new Date(Date.now() - 40 * 60000).toISOString(),
    consultationEndTime: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    appointmentId: 'APT20260907002',
    patient: {
      name: 'Savita Baburao Jadhav',
      phone: '9822345091',
      age: 26,
      gender: 'female',
      abhaId: '91-9988-1200-3490',
      address: 'Patas, Daund'
    },
    healthCenterId: 'phc_baramati',
    healthCenterName: 'Primary Health Centre Baramati',
    doctorId: 'doc_1',
    doctorName: 'Dr. Anand Kulkarni',
    department: 'General Medicine',
    appointmentDate: new Date().toISOString(),
    timeSlot: { startTime: '09:30 AM', endTime: '10:00 AM' },
    tokenNumber: 2,
    type: 'regular',
    status: 'in-consultation',
    priority: 'normal',
    symptoms: ['Body Pain / अंगदुखी', 'Weakness / अशक्तपणा'],
    chiefComplaint: 'Generalized weakness and mild dehydration',
    checkInTime: new Date(Date.now() - 45 * 60000).toISOString(),
    consultationStartTime: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    appointmentId: 'APT20260907003',
    patient: {
      name: 'Ganesh Pandurang More',
      phone: '9423190821',
      age: 62,
      gender: 'male',
      address: 'Malegaon Budruk'
    },
    healthCenterId: 'phc_baramati',
    healthCenterName: 'Primary Health Centre Baramati',
    doctorId: 'doc_1',
    doctorName: 'Dr. Anand Kulkarni',
    department: 'General Medicine',
    appointmentDate: new Date().toISOString(),
    timeSlot: { startTime: '10:00 AM', endTime: '10:30 AM' },
    tokenNumber: 3,
    type: 'emergency',
    status: 'waiting',
    priority: 'emergency',
    symptoms: ['Chest Tightness / छातीत भरून येणे', 'Breathlessness'],
    chiefComplaint: 'Sudden shortness of breath while walking',
    queuePosition: 1,
    estimatedWaitTime: 3,
    checkInTime: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    appointmentId: 'APT20260907004',
    patient: {
      name: 'Rekha Sunil Patil',
      phone: '9850231900',
      age: 34,
      gender: 'female',
      abhaId: '91-3312-5509-8871'
    },
    healthCenterId: 'phc_baramati',
    healthCenterName: 'Primary Health Centre Baramati',
    doctorId: 'doc_1',
    doctorName: 'Dr. Anand Kulkarni',
    department: 'General Medicine',
    appointmentDate: new Date().toISOString(),
    timeSlot: { startTime: '10:30 AM', endTime: '11:00 AM' },
    tokenNumber: 4,
    type: 'follow-up',
    status: 'waiting',
    priority: 'urgent',
    symptoms: ['High Blood Pressure / उच्च रक्तदाब'],
    chiefComplaint: 'Routine hypertension follow-up',
    queuePosition: 2,
    estimatedWaitTime: 12,
    checkInTime: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    appointmentId: 'APT20260907005',
    patient: {
      name: 'Kisan Dhondiba Pawar',
      phone: '9765431200',
      age: 55,
      gender: 'male'
    },
    healthCenterId: 'phc_baramati',
    healthCenterName: 'Primary Health Centre Baramati',
    doctorId: 'doc_1',
    doctorName: 'Dr. Anand Kulkarni',
    department: 'General Medicine',
    appointmentDate: new Date().toISOString(),
    timeSlot: { startTime: '11:00 AM', endTime: '11:30 AM' },
    tokenNumber: 5,
    type: 'regular',
    status: 'waiting',
    priority: 'normal',
    symptoms: ['Cough / खोकला'],
    chiefComplaint: 'Productive cough since 5 days',
    queuePosition: 3,
    estimatedWaitTime: 22,
    checkInTime: new Date(Date.now() - 5 * 60000).toISOString()
  }
];

// =============================================================
// QUEUE ENGINE IMPLEMENTATION
// =============================================================
class QueueEngineService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(queue: ClientQueueData) => void> = new Set();
  private appointments: AppointmentModel[] = [];
  private activeQueues: Map<string, QueueModel> = new Map();

  constructor() {
    this.initStorage();
    this.initBroadcast();
  }

  private initStorage() {
    try {
      const storedApts = localStorage.getItem('hw_appointments_data');
      if (storedApts) {
        this.appointments = JSON.parse(storedApts);
      } else {
        this.appointments = [...SEED_APPOINTMENTS];
        localStorage.setItem('hw_appointments_data', JSON.stringify(this.appointments));
      }

      const storedQueues = localStorage.getItem('hw_queues_cache');
      if (storedQueues) {
        const rawMap = JSON.parse(storedQueues);
        Object.entries(rawMap).forEach(([k, v]) => {
          this.activeQueues.set(k, v as QueueModel);
        });
      } else {
        // Initialize Baramati General Medicine default queue
        this.initializeDailyQueue('phc_baramati', 'General Medicine', new Date().toISOString());
      }
    } catch {
      this.appointments = [...SEED_APPOINTMENTS];
    }
  }

  private persist() {
    try {
      localStorage.setItem('hw_appointments_data', JSON.stringify(this.appointments));
      const rawObj: Record<string, QueueModel> = {};
      this.activeQueues.forEach((v, k) => { rawObj[k] = v; });
      localStorage.setItem('hw_queues_cache', JSON.stringify(rawObj));
    } catch (e) {
      console.error('Queue persist error:', e);
    }
  }

  private initBroadcast() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('hw_queue_channel');
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'QUEUE_UPDATE') {
          // reload from storage
          this.initStorage();
          const q = this.getLiveQueueStatus(event.data.centerId, event.data.department);
          this.notifyListeners(q);
        }
      };
    }
  }

  private notifyListeners(queueData: ClientQueueData) {
    this.listeners.forEach(l => l(queueData));
  }

  private broadcastChange(centerId: string, department: string) {
    this.persist();
    if (this.channel) {
      this.channel.postMessage({ type: 'QUEUE_UPDATE', centerId, department });
    }
    const q = this.getLiveQueueStatus(centerId, department);
    this.notifyListeners(q);
  }

  public subscribe(callback: (queue: ClientQueueData) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getCacheKey(centerId: string, department: string, dateStr?: string) {
    const d = (dateStr ? new Date(dateStr) : new Date()).toISOString().split('T')[0];
    return `${centerId}_${department}_${d}`;
  }

  // ============================================
  // INITIALIZE QUEUE FOR A DAY
  // ============================================
  public initializeDailyQueue(centerId: string, department: string, dateStr: string): QueueModel {
    const key = this.getCacheKey(centerId, department, dateStr);
    let queue = this.activeQueues.get(key);

    if (!queue) {
      // Build from existing appointments matching center & dept
      const todayIso = new Date().toISOString().split('T')[0];
      const matchingApts = this.appointments.filter(a => 
        a.healthCenterId === centerId && 
        a.department === department && 
        a.appointmentDate.startsWith(todayIso)
      );

      const entries: QueueEntryModel[] = [];
      let tokenCounter = 0;

      matchingApts.forEach(apt => {
        if (['waiting', 'called', 'in-consultation', 'completed'].includes(apt.status)) {
          tokenCounter++;
          const pos = apt.status === 'waiting' ? entries.filter(e => e.status === 'waiting').length + 1 : 0;
          entries.push({
            tokenNumber: apt.tokenNumber || tokenCounter,
            appointmentId: apt.appointmentId,
            patientName: apt.patient.name,
            patientPhone: apt.patient.phone,
            priority: apt.priority,
            status: apt.status as QueueEntryModel['status'],
            checkInTime: apt.checkInTime || new Date().toISOString(),
            calledTime: apt.consultationStartTime,
            completionTime: apt.consultationEndTime,
            position: pos,
            estimatedWait: pos * 10
          });
        }
      });

      const currentServing = entries.find(e => e.status === 'in-consultation');
      const completedCount = entries.filter(e => e.status === 'completed').length;

      queue = {
        healthCenterId: centerId,
        department,
        date: todayIso,
        currentToken: currentServing ? currentServing.tokenNumber : (completedCount > 0 ? completedCount : 0),
        entries,
        stats: {
          totalTokensIssued: entries.length,
          totalCompleted: completedCount,
          totalSkipped: 0,
          avgWaitTime: 12,
          avgConsultationTime: 10,
          lastUpdated: new Date().toISOString()
        },
        isActive: true
      };

      this.activeQueues.set(key, queue);
      this.persist();
    }

    return queue;
  }

  // ============================================
  // BOOK APPOINTMENT
  // ============================================
  public bookAppointment(data: Omit<AppointmentModel, 'appointmentId' | 'status'>): AppointmentModel {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const appointmentId = `APT${dateStr}${random}`;

    const newApt: AppointmentModel = {
      ...data,
      appointmentId,
      status: 'booked',
      priority: data.priority || (data.type === 'emergency' ? 'emergency' : 'normal')
    };

    this.appointments.unshift(newApt);
    this.persist();
    this.broadcastChange(data.healthCenterId, data.department);
    return newApt;
  }

  // ============================================
  // CHECK-IN PATIENT
  // ============================================
  public checkInPatient(appointmentId: string, centerId: string, department: string) {
    const apt = this.appointments.find(a => a.appointmentId === appointmentId);
    if (!apt) throw new Error('Appointment not found');

    if (apt.status === 'waiting' || apt.status === 'in-consultation') {
      return { success: false, message: 'Patient already checked in' };
    }

    const queue = this.initializeDailyQueue(centerId, department, new Date().toISOString());
    const tokenNumber = queue.stats.totalTokensIssued + 1;

    let position = queue.entries.filter(e => e.status === 'waiting' || e.status === 'called').length + 1;
    if (apt.priority === 'emergency') {
      position = 1;
    } else if (apt.priority === 'urgent') {
      position = Math.min(3, position);
    }

    const estimatedWait = this.calculateWaitTime(queue, position);

    const entry: QueueEntryModel = {
      tokenNumber,
      appointmentId: apt.appointmentId,
      patientName: apt.patient.name,
      patientPhone: apt.patient.phone,
      priority: apt.priority,
      status: 'waiting',
      checkInTime: new Date().toISOString(),
      position,
      estimatedWait
    };

    queue.entries.push(entry);
    queue.stats.totalTokensIssued += 1;
    queue.stats.lastUpdated = new Date().toISOString();

    apt.status = 'waiting';
    apt.tokenNumber = tokenNumber;
    apt.queuePosition = position;
    apt.estimatedWaitTime = estimatedWait;
    apt.checkInTime = entry.checkInTime;

    this.recalculatePositions(queue);
    this.broadcastChange(centerId, department);

    return {
      success: true,
      tokenNumber,
      position,
      estimatedWait,
      queueData: this.formatQueueForClient(queue)
    };
  }

  // ============================================
  // CALL NEXT PATIENT
  // ============================================
  public callNextPatient(centerId: string, department: string, doctorId?: string) {
    const queue = this.initializeDailyQueue(centerId, department, new Date().toISOString());

    // Priority Order: Emergency -> Urgent -> Normal
    const priorityOrder: Array<'emergency' | 'urgent' | 'normal'> = ['emergency', 'urgent', 'normal'];
    let nextPatient: QueueEntryModel | undefined;

    for (const p of priorityOrder) {
      nextPatient = queue.entries.find(e => e.status === 'waiting' && e.priority === p);
      if (nextPatient) break;
    }

    if (!nextPatient) {
      return { success: false, message: 'No patients waiting in queue' };
    }

    // Complete the current in-consultation patient if any
    const currentlyServing = queue.entries.find(e => e.status === 'in-consultation');
    if (currentlyServing) {
      currentlyServing.status = 'completed';
      currentlyServing.completionTime = new Date().toISOString();
      if (currentlyServing.calledTime) {
        currentlyServing.consultationDuration = Math.max(1, Math.round(
          (new Date().getTime() - new Date(currentlyServing.calledTime).getTime()) / 60000
        ));
      } else {
        currentlyServing.consultationDuration = 10;
      }

      queue.stats.totalCompleted += 1;
      queue.stats.avgConsultationTime = Math.round(
        (queue.stats.avgConsultationTime * (queue.stats.totalCompleted - 1) + currentlyServing.consultationDuration) / queue.stats.totalCompleted
      );

      const apt = this.appointments.find(a => a.appointmentId === currentlyServing.appointmentId);
      if (apt) {
        apt.status = 'completed';
        apt.consultationEndTime = currentlyServing.completionTime;
      }
    }

    // Call the new patient
    nextPatient.status = 'in-consultation';
    nextPatient.calledTime = new Date().toISOString();
    nextPatient.waitDuration = Math.round(
      (new Date().getTime() - new Date(nextPatient.checkInTime).getTime()) / 60000
    );

    queue.currentToken = nextPatient.tokenNumber;

    const apt = this.appointments.find(a => a.appointmentId === nextPatient.appointmentId);
    if (apt) {
      apt.status = 'in-consultation';
      apt.consultationStartTime = nextPatient.calledTime;
    }

    this.recalculatePositions(queue);
    this.broadcastChange(centerId, department);

    return {
      success: true,
      calledPatient: nextPatient,
      currentToken: nextPatient.tokenNumber,
      remainingPatients: queue.entries.filter(e => e.status === 'waiting').length
    };
  }

  // ============================================
  // COMPLETE CONSULTATION
  // ============================================
  public completeConsultation(centerId: string, department: string) {
    const queue = this.initializeDailyQueue(centerId, department, new Date().toISOString());
    const current = queue.entries.find(e => e.status === 'in-consultation');

    if (!current) {
      return { success: false, message: 'No patient currently in consultation' };
    }

    current.status = 'completed';
    current.completionTime = new Date().toISOString();
    current.consultationDuration = current.calledTime
      ? Math.max(1, Math.round((new Date().getTime() - new Date(current.calledTime).getTime()) / 60000))
      : 10;

    queue.stats.totalCompleted += 1;
    const apt = this.appointments.find(a => a.appointmentId === current.appointmentId);
    if (apt) {
      apt.status = 'completed';
      apt.consultationEndTime = current.completionTime;
    }

    this.recalculatePositions(queue);
    this.broadcastChange(centerId, department);
    return { success: true };
  }

  // ============================================
  // SKIP PATIENT (No show)
  // ============================================
  public skipPatient(tokenNumber: number, centerId: string, department: string, reason = 'No show') {
    const queue = this.initializeDailyQueue(centerId, department, new Date().toISOString());
    const entry = queue.entries.find(e => e.tokenNumber === tokenNumber);

    if (!entry) return { success: false, message: 'Token not found' };

    entry.status = 'skipped';
    queue.stats.totalSkipped += 1;
    queue.stats.lastUpdated = new Date().toISOString();

    const apt = this.appointments.find(a => a.appointmentId === entry.appointmentId);
    if (apt) {
      apt.status = 'no-show';
      apt.notes = reason;
    }

    this.recalculatePositions(queue);
    this.broadcastChange(centerId, department);
    return { success: true, message: `Token #${tokenNumber} marked as skipped` };
  }

  // ============================================
  // PAUSE / RESUME QUEUE
  // ============================================
  public pauseQueue(centerId: string, department: string, reason: string) {
    const queue = this.initializeDailyQueue(centerId, department, new Date().toISOString());
    queue.pausedAt = new Date().toISOString();
    queue.pauseReason = reason;
    this.broadcastChange(centerId, department);
    return { success: true };
  }

  public resumeQueue(centerId: string, department: string) {
    const queue = this.initializeDailyQueue(centerId, department, new Date().toISOString());
    queue.pausedAt = undefined;
    queue.pauseReason = undefined;
    this.broadcastChange(centerId, department);
    return { success: true };
  }

  // ============================================
  // ADD WALK-IN PATIENT
  // ============================================
  public addWalkInPatient(centerId: string, department: string, data: { name: string; phone: string; priority: 'normal' | 'urgent' | 'emergency'; age?: number; gender?: 'male' | 'female' | 'other' }) {
    const appointment = this.bookAppointment({
      patient: {
        name: data.name,
        phone: data.phone,
        age: data.age || 35,
        gender: data.gender || 'male'
      },
      healthCenterId: centerId,
      healthCenterName: SEED_HEALTH_CENTERS.find(c => c._id === centerId)?.name || 'Health Center',
      department,
      appointmentDate: new Date().toISOString(),
      timeSlot: {
        startTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        endTime: 'Walk-in'
      },
      type: data.priority === 'emergency' ? 'emergency' : 'regular',
      priority: data.priority,
      symptoms: ['Walk-in Intake / थेट नोंदणी'],
      chiefComplaint: 'Walk-in registration at health center reception'
    });

    return this.checkInPatient(appointment.appointmentId, centerId, department);
  }

  // ============================================
  // CALCULATE WAIT TIME (AI & Statistical Logic)
  // ============================================
  public calculateWaitTime(queue: QueueModel, position: number): number {
    const avgConsult = queue.stats.avgConsultationTime || 10;
    const emergencyAhead = queue.entries.filter(
      e => e.status === 'waiting' && e.priority === 'emergency' && e.position < position
    ).length;

    const emergencyBuffer = emergencyAhead * 6;
    return Math.max(2, (position * avgConsult) + emergencyBuffer);
  }

  private recalculatePositions(queue: QueueModel) {
    let counter = 1;
    const priorityWeight = { emergency: 0, urgent: 1, normal: 2 };

    const waiting = queue.entries
      .filter(e => e.status === 'waiting')
      .sort((a, b) => {
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
          return priorityWeight[a.priority] - priorityWeight[b.priority];
        }
        return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
      });

    waiting.forEach(entry => {
      entry.position = counter++;
      entry.estimatedWait = this.calculateWaitTime(queue, entry.position);
      const apt = this.appointments.find(a => a.appointmentId === entry.appointmentId);
      if (apt) {
        apt.queuePosition = entry.position;
        apt.estimatedWaitTime = entry.estimatedWait;
      }
    });

    queue.stats.lastUpdated = new Date().toISOString();
  }

  // ============================================
  // GET LIVE QUEUE STATUS
  // ============================================
  public getLiveQueueStatus(centerId: string, department: string): ClientQueueData {
    const queue = this.initializeDailyQueue(centerId, department, new Date().toISOString());
    return this.formatQueueForClient(queue);
  }

  public formatQueueForClient(queue: QueueModel): ClientQueueData {
    const waiting = queue.entries
      .filter(e => e.status === 'waiting')
      .sort((a, b) => a.position - b.position);

    const inConsultation = queue.entries.find(e => e.status === 'in-consultation');

    return {
      currentToken: queue.currentToken,
      currentPatient: inConsultation ? {
        tokenNumber: inConsultation.tokenNumber,
        name: inConsultation.patientName,
        calledAt: inConsultation.calledTime
      } : null,
      waitingCount: waiting.length,
      completedCount: queue.stats.totalCompleted,
      skippedCount: queue.stats.totalSkipped,
      avgWaitTime: queue.stats.avgConsultationTime || 10,
      isActive: queue.isActive,
      isPaused: !!queue.pausedAt,
      pauseReason: queue.pauseReason,
      waitingList: waiting.map(e => ({
        position: e.position,
        tokenNumber: e.tokenNumber,
        patientName: e.patientName,
        priority: e.priority,
        estimatedWait: e.estimatedWait,
        checkInTime: e.checkInTime
      })),
      stats: queue.stats,
      lastUpdated: queue.stats.lastUpdated
    };
  }

  // ============================================
  // GET APPOINTMENTS LIST
  // ============================================
  public getAppointments(centerId?: string, phoneOrId?: string): AppointmentModel[] {
    let list = [...this.appointments];
    if (centerId) {
      list = list.filter(a => a.healthCenterId === centerId);
    }
    if (phoneOrId) {
      const q = phoneOrId.trim().toLowerCase();
      list = list.filter(a => 
        a.appointmentId.toLowerCase().includes(q) || 
        a.patient.phone.includes(q) ||
        a.patient.name.toLowerCase().includes(q)
      );
    }
    return list;
  }
}

// Export singleton instance
export const queueEngine = new QueueEngineService();
