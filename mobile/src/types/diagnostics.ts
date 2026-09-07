/**
 * HealthWay Diagnostic Lab Order & 4-Stage Sample Tracker Models
 * Complies with PROJECT.md § Domain Models & Features 10-12
 */

export type TestOrderStatus = 'ORDERED' | 'COLLECTED' | 'ANALYZING' | 'RESULT_READY';
export type TestPriority = 'ROUTINE' | 'URGENT' | 'STAT' | 'CRITICAL';
export type ParameterFlag = 'NORMAL' | 'BORDERLINE' | 'CRITICAL';

export interface ParameterResult {
  parameterId: string;
  name: string;
  nameMr?: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: ParameterFlag;
  criticalReason?: string;
}

export interface LabTest {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  abhaId?: string;
  testCode: string;
  testName: string;
  testNameMr?: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Serology' | 'Radiology' | string;
  priority: TestPriority;
  status: TestOrderStatus;
  barcode: string;
  prescribedByDoctor: string;
  facilityName: string;
  targetLabName: string;
  orderedAt: string;
  collectedAt?: string;
  inTransitAt?: string;
  processingAt?: string;
  completedAt?: string;
  sampleType: string;
  fastingRequired?: boolean;
  tatHours?: number;
  results?: ParameterResult[];
  hasCriticalValue: boolean;
  overallImpression?: string;
  normalRange?: string;
  verifiedByPathologist?: string;
  pdfUrl?: string;
}
