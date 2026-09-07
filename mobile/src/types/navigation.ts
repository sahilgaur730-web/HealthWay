/**
 * Navigation Type Definitions for HealthWay Native App
 * Supports React Navigation v7 with strict TypeScript typing
 */
import { NavigatorScreenParams } from '@react-navigation/native';
import { UserRole } from './auth';

export type AuthStackParamList = {
  PublicGateway: undefined;
  Login: { initialRole?: UserRole } | undefined;
  RoleSelect: undefined;
  EmergencySOS: undefined;
};

export type PatientStackParamList = {
  PatientDashboard: undefined;
  VitalsTracker: undefined;
  AppointmentBooking: undefined;
  PhrLocker: undefined;
  SymptomTriage: undefined;
  DiagnosticsHub: undefined;
  ReferralsHub: undefined;
  QueueHub: undefined;
  QueueTV: undefined;
  MedicineHub: undefined;
  EmergencySOS: undefined;
};

export type AshaStackParamList = {
  AshaFieldDashboard: undefined;
  BeneficiaryRegistration: { initialVillage?: string; beneficiaryId?: string } | undefined;
  HighRiskPregnancy: { beneficiaryId?: string; patientName?: string } | undefined;
  VoiceIntake: { patientId?: string; language?: 'mr' | 'hi' | 'en' } | undefined;
  FieldTriage: {
    patientId?: string;
    prefillComplaint?: string;
    prefillSymptoms?: string[];
    prefillDuration?: string;
    draftId?: string;
  } | undefined;
  DiagnosticsHub: undefined;
  ReferralsHub: undefined;
  QueueHub: undefined;
  MedicineHub: undefined;
  EmergencySOS: undefined;
};

export type DoctorStackParamList = {
  DoctorOPDQueue: undefined;
  DoctorTeleconsultRoom: { patientName?: string; abhaId?: string; age?: number; gender?: string } | undefined;
  DigitalRx: { patientName?: string; abhaId?: string; visitId?: string } | undefined;
  DiagnosticsHub: undefined;
  ReferralsHub: undefined;
  QueueHub: undefined;
  QueueTV: undefined;
  MedicineHub: undefined;
};

export type AdminStackParamList = {
  AdminDistrictOverview: undefined;
  OutbreakTracker: undefined;
  NationalInterop: undefined;
  DiagnosticsHub: undefined;
  ReferralsHub: undefined;
  QueueHub: undefined;
  MedicineHub: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Patient: NavigatorScreenParams<PatientStackParamList>;
  Asha: NavigatorScreenParams<AshaStackParamList>;
  Doctor: NavigatorScreenParams<DoctorStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
};
