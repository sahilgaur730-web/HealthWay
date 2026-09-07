/**
 * Authoritative Emergency Helplines, Coordinates & Telemetry Data
 */
import { EmergencyStatus } from '../types/emergency';

export const RURAL_FALLBACK_COORDINATES = {
  latitude: 18.6534,
  longitude: 74.1352,
  formattedLat: '18.6534° N',
  formattedLng: '74.1352° E',
  village: 'Shirwal Rural Corridor, Khandala',
  district: 'Satara, Maharashtra',
};

export const EMERGENCY_HELPLINES = [
  {
    number: '108',
    titleEn: 'Emergency Ambulance',
    titleMr: '१०८ रुग्णवाहिका',
    desc: 'Free ALS / BLS Dispatch',
    color: '#D32F2F',
  },
  {
    number: '102',
    titleEn: 'Janani Shishu Suraksha',
    titleMr: '१०२ माता व बाल सेवा',
    desc: 'Maternal & Neonatal Transport',
    color: '#7B1FA2',
  },
  {
    number: '104',
    titleEn: 'Health Helpline',
    titleMr: '१०४ आरोग्य सल्ला',
    desc: 'Govt Medical Advice & Tele-Triage',
    color: '#00796B',
  },
  {
    number: '1091',
    titleEn: 'Women Helpline',
    titleMr: '१०९१ महिला सहाय्यता',
    desc: 'Emergency Distress & Protection',
    color: '#ED6C02',
  },
];

export const TELEMETRY_STAGES: Array<{ stage: EmergencyStatus; labelEn: string; labelMr: string }> = [
  { stage: 'DISPATCHED', labelEn: 'Dispatched', labelMr: 'रवाना झाले' },
  { stage: 'EN_ROUTE', labelEn: 'En Route', labelMr: 'मार्गावर' },
  { stage: 'ON_SCENE', labelEn: 'On Scene', labelMr: 'घटनास्थळी' },
  { stage: 'TRANSPORTING', labelEn: 'Transporting', labelMr: 'वाहनात' },
  { stage: 'ARRIVED', labelEn: 'Arrived', labelMr: 'रुग्णालयात' },
];
