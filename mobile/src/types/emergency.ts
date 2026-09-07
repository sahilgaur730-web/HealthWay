/**
 * HealthWay Emergency SOS & Ambulance Dispatch Models
 * Complies with PROJECT.md § Domain Models & Features 19-20
 */

export type EmergencyStatus =
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'TRANSPORTING'
  | 'ARRIVED';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  villageEn?: string;
  villageMr?: string;
  talukaEn?: string;
  talukaMr?: string;
  districtEn?: string;
  districtMr?: string;
}

export interface AmbulanceDispatchUnit {
  vehicleId: string;
  vehicleType: 'Basic Life Support (BLS)' | 'Advanced Life Support (ALS)';
  driverName: string;
  driverPhone: string;
  paramedicName: string;
  equipment: {
    oxygenCylinder: boolean;
    defibrillatorAed: boolean;
    emergencyDeliveryKit: boolean;
    ventilator: boolean;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    landmark?: string;
  };
  initialEtaMinutes: number;
}

export interface EmergencyPreArrivalAlert {
  alertId: string;
  destinationHospitalEn: string;
  destinationHospitalMr?: string;
  casualtyDeskPhone: string;
  traumaLevel: 'Level 1' | 'Level 2' | 'Level 3';
  patientAbhaId?: string;
  patientName: string;
  clinicalCategory: 'Severe Trauma / Accident' | 'Cardiac Emergency' | 'Maternal Labor Crisis' | 'Respiratory Distress' | string;
  vitalsReported?: {
    bp?: string;
    pulse?: number;
    spo2?: number;
  };
  sentAt: string;
  status: 'RECEIVED' | 'BED_RESERVED' | 'TEAM_READY';
}

export interface Emergency {
  id: string; // SOS-YYYYMMDD-RANDOM
  patientName: string;
  patientPhone?: string;
  abhaId?: string;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  dispatchTime: string;
  etaMinutes: number;
  status: EmergencyStatus;
  ambulance: AmbulanceDispatchUnit;
  destinationHospital: {
    id: string;
    name: string;
    traumaLevel: string;
    casualtyPhone: string;
  };
  codeRedToken: string;
  clinicalCategory?: string;
}
