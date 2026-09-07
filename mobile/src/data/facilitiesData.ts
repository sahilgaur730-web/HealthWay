/**
 * Authoritative Satara District Facilities & Emergency Helplines
 */

export interface FacilityInfo {
  id: string;
  code: string;
  name: string;
  nameMr: string;
  type: 'District Hospital' | 'Rural Hospital' | 'CHC' | 'PHC' | 'Sub-Centre';
  block: string;
  beds: number;
  doctorInCharge: string;
  phone: string;
}

export const DISTRICT_FACILITIES: FacilityInfo[] = [
  {
    id: 'FAC001',
    code: 'DH-STR',
    name: 'District Hospital Satara',
    nameMr: 'जिल्हा रुग्णालय सातारा',
    type: 'District Hospital',
    block: 'Satara',
    beds: 350,
    doctorInCharge: 'Dr. V. M. Kulkarni',
    phone: '+91 2162 234100',
  },
  {
    id: 'FAC002',
    code: 'SDH-KRD',
    name: 'Sub-District Hospital Karad',
    nameMr: 'उपजिल्हा रुग्णालय कराड',
    type: 'Rural Hospital',
    block: 'Karad',
    beds: 100,
    doctorInCharge: 'Dr. S. P. Patil',
    phone: '+91 2164 222150',
  },
  {
    id: 'FAC003',
    code: 'CHC-WAI',
    name: 'Community Health Centre Wai',
    nameMr: 'ग्रामीण रुग्णालय वाई',
    type: 'CHC',
    block: 'Wai',
    beds: 30,
    doctorInCharge: 'Dr. A. R. Deshmukh',
    phone: '+91 2167 220033',
  },
  {
    id: 'FAC004',
    code: 'CHC-KOR',
    name: 'Community Health Centre Koregaon',
    nameMr: 'ग्रामीण रुग्णालय कोरेगाव',
    type: 'CHC',
    block: 'Koregaon',
    beds: 30,
    doctorInCharge: 'Dr. N. G. Shinde',
    phone: '+91 2163 220144',
  },
  {
    id: 'FAC005',
    code: 'PHC-MHB',
    name: 'Primary Health Centre Mahabaleshwar',
    nameMr: 'प्राथमिक आरोग्य केंद्र महाबळेश्वर',
    type: 'PHC',
    block: 'Mahabaleshwar',
    beds: 10,
    doctorInCharge: 'Dr. P. T. More',
    phone: '+91 2168 260233',
  },
  {
    id: 'FAC006',
    code: 'PHC-MDH',
    name: 'Primary Health Centre Medha',
    nameMr: 'प्राथमिक आरोग्य केंद्र मेढा',
    type: 'PHC',
    block: 'Jawali',
    beds: 10,
    doctorInCharge: 'Dr. R. B. Chavan',
    phone: '+91 2160 224422',
  },
  {
    id: 'FAC007',
    code: 'SC-TPL',
    name: 'Sub-Centre Tapola',
    nameMr: 'आरोग्य उपकेंद्र तापोळा',
    type: 'Sub-Centre',
    block: 'Mahabaleshwar',
    beds: 2,
    doctorInCharge: 'Sister Anandi Gaikwad (ANM)',
    phone: '+91 2168 290111',
  },
];

export const FACILITY_HELPLINES = [
  { service: 'National Ambulance', number: '108', desc: 'Free ALS/BLS Emergency Transport' },
  { service: 'Janani Shishu Suraksha', number: '102', desc: 'Pregnant Women & Sick Infants Transport' },
  { service: 'Health Advice Helpline', number: '104', desc: 'Medical & Tele-triage Advice' },
  { service: 'Women Helpline', number: '1091', desc: 'Emergency Protection & Support' },
];
