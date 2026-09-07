/**
 * Authoritative Queue Mock Seed Data
 * Complies with PROJECT.md Feature 15 & Tier 1/4 tests
 */
import { QueueToken, QueuePriority } from '../types/queue';

export const DEPARTMENTS = [
  'General Medicine',
  'Obstetrics & Gynecology (ANC)',
  'Pediatrics',
  'Geriatric Care',
  'Casualty / Emergency',
  'Orthopedics',
];

export const QUEUE_PRIORITIES: Record<QueuePriority, {
  weight: number;
  labelEn: string;
  labelMr: string;
  badgeVariant: 'danger' | 'purple' | 'warning' | 'primary' | 'neutral';
}> = {
  emergency: { weight: 100, labelEn: 'Emergency (100)', labelMr: 'तातडीची (१००)', badgeVariant: 'danger' },
  antenatal: { weight: 75, labelEn: 'Antenatal (75)', labelMr: 'प्रसूतीपूर्व (७५)', badgeVariant: 'purple' },
  senior: { weight: 50, labelEn: 'Senior 60+ (50)', labelMr: 'ज्येष्ठ नागरिक (५०)', badgeVariant: 'warning' },
  general: { weight: 25, labelEn: 'General (25)', labelMr: 'सर्वसाधारण (२५)', badgeVariant: 'primary' },
  urgent: { weight: 80, labelEn: 'Urgent (80)', labelMr: 'तातडीची (८०)', badgeVariant: 'danger' },
  normal: { weight: 30, labelEn: 'Normal (30)', labelMr: 'सामान्य (३०)', badgeVariant: 'neutral' },
};

export const INITIAL_QUEUE_TOKENS: QueueToken[] = [
  {
    id: 'TOK-001',
    tokenNumber: 'ANC-01',
    appointmentId: 'APT-101',
    patientId: 'PT-001',
    patientName: 'Sunita Ramchandra Jadhav',
    patientPhone: '+91 98221 44001',
    department: 'Obstetrics & Gynecology (ANC)',
    healthCenterId: 'FAC001',
    doctorId: 'DOC-002',
    doctorName: 'Dr. A. R. Deshmukh',
    priority: 'antenatal',
    priorityWeight: 75,
    status: 'IN_CONSULTATION',
    checkInTime: new Date(Date.now() - 25 * 60000).toISOString(),
    calledTime: new Date(Date.now() - 5 * 60000).toISOString(),
    estWaitMinutes: 2,
    position: 0,
  },
  {
    id: 'TOK-002',
    tokenNumber: 'EMG-01',
    patientId: 'PT-002',
    patientName: 'Pooja Gaikwad (Acute Asthma)',
    patientPhone: '+91 98221 44002',
    department: 'Casualty / Emergency',
    healthCenterId: 'FAC001',
    priority: 'emergency',
    priorityWeight: 100,
    status: 'WAITING',
    checkInTime: new Date(Date.now() - 10 * 60000).toISOString(),
    estWaitMinutes: 0,
    position: 1,
  },
  {
    id: 'TOK-003',
    tokenNumber: 'SNR-01',
    patientId: 'PT-003',
    patientName: 'Ganpatrao More (72y)',
    patientPhone: '+91 98221 44003',
    department: 'Geriatric Care',
    healthCenterId: 'FAC001',
    priority: 'senior',
    priorityWeight: 50,
    status: 'WAITING',
    checkInTime: new Date(Date.now() - 20 * 60000).toISOString(),
    estWaitMinutes: 8,
    position: 2,
  },
  {
    id: 'TOK-004',
    tokenNumber: 'GEN-01',
    patientId: 'PT-004',
    patientName: 'Ramesh Shankar Patil',
    patientPhone: '+91 98221 44004',
    department: 'General Medicine',
    healthCenterId: 'FAC001',
    priority: 'general',
    priorityWeight: 25,
    status: 'WAITING',
    checkInTime: new Date(Date.now() - 30 * 60000).toISOString(),
    estWaitMinutes: 16,
    position: 3,
  },
  {
    id: 'TOK-005',
    tokenNumber: 'GEN-02',
    patientId: 'PT-005',
    patientName: 'Anil Dnyaneshwar Shinde',
    patientPhone: '+91 98221 44005',
    department: 'General Medicine',
    healthCenterId: 'FAC001',
    priority: 'general',
    priorityWeight: 25,
    status: 'WAITING',
    checkInTime: new Date(Date.now() - 15 * 60000).toISOString(),
    estWaitMinutes: 24,
    position: 4,
  },
  {
    id: 'TOK-006',
    tokenNumber: 'GEN-00',
    patientId: 'PT-000',
    patientName: 'Kavita Suresh Kadam',
    department: 'General Medicine',
    healthCenterId: 'FAC001',
    priority: 'general',
    priorityWeight: 25,
    status: 'COMPLETED',
    checkInTime: new Date(Date.now() - 50 * 60000).toISOString(),
    completionTime: new Date(Date.now() - 25 * 60000).toISOString(),
    estWaitMinutes: 0,
    position: -1,
  },
];
