/**
 * HealthWay EDL Medicine Inventory & Stock Models
 * Complies with PROJECT.md § Domain Models & Features 17-18
 */

export type StockStatus = 'ADEQUATE' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';

export type MedicineCategory =
  | 'ESSENTIAL'
  | 'ANTIBIOTIC'
  | 'CHRONIC'
  | 'MATERNAL'
  | 'EMERGENCY'
  | string;

export interface GenericSubstitute {
  id: string;
  name: string;
  generic: string;
  form?: string;
  strength?: string;
  stockLevel: number;
  status: StockStatus;
}

export interface Medicine {
  id: string;
  code: string;
  name: string;
  nameMr: string;
  generic: string;
  category: MedicineCategory;
  unit: string;
  form: string;
  strength: string;
  stockLevel: number;
  minBuffer: number;
  status: StockStatus;
  genericSubstitutes?: GenericSubstitute[];
  batchNo?: string;
  expiryDate?: string;
  facilityId?: string;
  useFor?: string[];
  useForMr?: string[];
  program?: string | null;
  lastUpdated?: string;
}
