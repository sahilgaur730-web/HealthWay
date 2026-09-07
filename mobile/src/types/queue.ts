/**
 * HealthWay OPD Priority Queue Models
 * Complies with PROJECT.md § Domain Models & Feature 15
 */

export type QueuePriority = 'emergency' | 'antenatal' | 'senior' | 'general' | 'normal' | 'urgent';

export type QueueStatus =
  | 'WAITING'
  | 'CALLED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'ABSENT';

export interface QueueToken {
  id?: string;
  tokenNumber: number | string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  department: string;
  healthCenterId: string;
  doctorId?: string;
  doctorName?: string;
  priority: QueuePriority;
  priorityWeight: number; // e.g. Emergency=100, Antenatal=80, Senior=60, General=40
  status: QueueStatus;
  checkInTime: string;
  calledTime?: string;
  completionTime?: string;
  estWaitMinutes: number;
  position: number;
}
