// Medicine Engine & Master Data Utility — Rural Healthcare Access Platform
// Zero unicode emojis: pure Lucide icon identifiers and Maharashtra NHM EDL data

export interface StockStatusConfig {
  id: string;
  label: string;
  labelMr: string;
  color: string;
  bgColor: string;
  iconName: 'CheckCircle2' | 'AlertTriangle' | 'AlertCircle' | 'XCircle' | 'Clock';
  description: string;
  descriptionMr: string;
}

export const STOCK_STATUS: Record<string, StockStatusConfig> = {
  ADEQUATE: {
    id: 'ADEQUATE',
    label: 'In Stock',
    labelMr: 'साठा उपलब्ध',
    color: '#16A34A',
    bgColor: '#D1FAE5',
    iconName: 'CheckCircle2',
    description: 'Sufficient stock available',
    descriptionMr: 'मुबलक साठा उपलब्ध'
  },
  LOW: {
    id: 'LOW',
    label: 'Low Stock',
    labelMr: 'मर्यादित साठा',
    color: '#D97706',
    bgColor: '#FEF3C7',
    iconName: 'AlertTriangle',
    description: 'Stock running low — order soon',
    descriptionMr: 'साठा कमी होत आहे — लवकर मागणी करा'
  },
  CRITICAL: {
    id: 'CRITICAL',
    label: 'Critical',
    labelMr: 'अति-कमी साठा',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    iconName: 'AlertCircle',
    description: 'Very low stock — urgent reorder needed',
    descriptionMr: 'अति-कमी साठा — तातडीने पुरवठा आवश्यक'
  },
  OUT_OF_STOCK: {
    id: 'OUT_OF_STOCK',
    label: 'Out of Stock',
    labelMr: 'साठा संपला',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    iconName: 'XCircle',
    description: 'Not available — check alternate centers',
    descriptionMr: 'उपलब्ध नाही — पर्यायी केंद्रात तपासा'
  },
  EXPIRING_SOON: {
    id: 'EXPIRING_SOON',
    label: 'Expiring Soon',
    labelMr: 'कालबाह्य जवळ',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    iconName: 'Clock',
    description: 'Expires within 30 days',
    descriptionMr: '३० दिवसांच्या आत कालबाह्य'
  }
};

export interface MedicineCategoryConfig {
  label: string;
  labelMr: string;
  color: string;
  iconName: string;
}

export const MEDICINE_CATEGORIES: Record<string, MedicineCategoryConfig> = {
  ESSENTIAL: { label: 'Essential Medicines', labelMr: 'अत्यावश्यक औषधे', color: '#DC2626', iconName: 'Pill' },
  CHRONIC: { label: 'Chronic Disease', labelMr: 'दीर्घकालीन आजार', color: '#7C3AED', iconName: 'Activity' },
  MATERNAL: { label: 'Maternal & Child', labelMr: 'माता व बाल आरोग्य', color: '#BE185D', iconName: 'Baby' },
  ANTIBIOTIC: { label: 'Antibiotics', labelMr: 'अँटीबायोटिक्स', color: '#059669', iconName: 'ShieldAlert' },
  VACCINE: { label: 'Vaccines', labelMr: 'लसीकरण', color: '#2563EB', iconName: 'HeartPulse' },
  EMERGENCY: { label: 'Emergency', labelMr: 'तातडीची औषधे', color: '#DC2626', iconName: 'AlertTriangle' },
  OTC: { label: 'Over The Counter', labelMr: 'सामान्य औषधे', color: '#64748B', iconName: 'Hospital' }
};

// Determine stock status based on current vs minimum levels
export const getStockStatus = (current: number, minimum: number, expiry?: string): StockStatusConfig => {
  if (current <= 0) return STOCK_STATUS.OUT_OF_STOCK;
  
  // Check expiry
  if (expiry) {
    const daysToExpiry = Math.floor(
      (new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysToExpiry <= 30 && daysToExpiry > 0) return STOCK_STATUS.EXPIRING_SOON;
    if (daysToExpiry <= 0) return STOCK_STATUS.OUT_OF_STOCK;
  }
  
  const percentage = (current / (minimum || 100)) * 100;
  if (percentage <= 25) return STOCK_STATUS.CRITICAL;
  if (percentage <= 75) return STOCK_STATUS.LOW;
  return STOCK_STATUS.ADEQUATE;
};

// Calculate days of stock remaining based on consumption rate
export const getDaysRemaining = (current: number, dailyConsumption: number): string => {
  if (!dailyConsumption || dailyConsumption === 0) return 'Unknown';
  const days = Math.floor(current / dailyConsumption);
  if (days === 0) return 'Less than 1 day';
  if (days === 1) return '1 day';
  if (days > 365) return '> 1 year';
  return `~${days} days`;
};

export interface MedicineItemModel {
  id: string;
  name: string;
  nameMr: string;
  generic: string;
  category: string;
  unit: string;
  unitMr: string;
  form: string;
  strength: string;
  minimumStock: number;
  useFor: string[];
  useForMr: string[];
  program: string | null;
}

// Master Medicine Database (17+ Essential Medicines)
export const MEDICINE_DATABASE: MedicineItemModel[] = [
  // Essential
  { id: 'MED001', name: 'Paracetamol 500mg', nameMr: 'पॅरासिटामॉल ५०० मि.ग्रॅ.', generic: 'Paracetamol', category: 'ESSENTIAL',
    unit: 'Tablets', unitMr: 'गोळ्या', form: 'Tablet', strength: '500mg', minimumStock: 500,
    useFor: ['Fever', 'Pain relief'], useForMr: ['ताप', 'अंगदुखी'], program: null },
  { id: 'MED002', name: 'Amoxicillin 250mg', nameMr: 'ॲमोक्सिसिलिन २५० मि.ग्रॅ.', generic: 'Amoxicillin', category: 'ANTIBIOTIC',
    unit: 'Capsules', unitMr: 'कॅप्सूल्स', form: 'Capsule', strength: '250mg', minimumStock: 200,
    useFor: ['Bacterial infections', 'Pneumonia'], useForMr: ['जिवाणू संसर्ग', 'न्यूमोनिया'], program: null },
  { id: 'MED003', name: 'ORS Sachet', nameMr: 'ओआरएस पाकीट', generic: 'Oral Rehydration Salts', category: 'ESSENTIAL',
    unit: 'Sachets', unitMr: 'पाकिटे', form: 'Sachet', strength: 'Standard', minimumStock: 300,
    useFor: ['Diarrhoea', 'Dehydration'], useForMr: ['अतिसार', 'पाण्याची कमतरता'], program: null },
  
  // Chronic Disease
  { id: 'MED004', name: 'Metformin 500mg', nameMr: 'मेटफॉर्मिन ५०० मि.ग्रॅ.', generic: 'Metformin', category: 'CHRONIC',
    unit: 'Tablets', unitMr: 'गोळ्या', form: 'Tablet', strength: '500mg', minimumStock: 300,
    useFor: ['Diabetes Type 2'], useForMr: ['टाइप २ मधुमेह'], program: 'NCD' },
  { id: 'MED005', name: 'Amlodipine 5mg', nameMr: 'ॲम्लोडिपिन ५ मि.ग्रॅ.', generic: 'Amlodipine', category: 'CHRONIC',
    unit: 'Tablets', unitMr: 'गोळ्या', form: 'Tablet', strength: '5mg', minimumStock: 200,
    useFor: ['Hypertension', 'Chest pain'], useForMr: ['उच्च रक्तदाब', 'छातीत अस्वस्थता'], program: 'NCD' },
  { id: 'MED006', name: 'Atenolol 50mg', nameMr: 'ॲटेनॉलॉल ५० मि.ग्रॅ.', generic: 'Atenolol', category: 'CHRONIC',
    unit: 'Tablets', unitMr: 'गोळ्या', form: 'Tablet', strength: '50mg', minimumStock: 150,
    useFor: ['Hypertension', 'Heart conditions'], useForMr: ['रक्तदाब', 'हृदय विकार'], program: 'NCD' },
  { id: 'MED007', name: 'Glibenclamide 5mg', nameMr: 'ग्लिबेनक्लामाईड ५ मि.ग्रॅ.', generic: 'Glibenclamide', category: 'CHRONIC',
    unit: 'Tablets', unitMr: 'गोळ्या', form: 'Tablet', strength: '5mg', minimumStock: 200,
    useFor: ['Diabetes Type 2'], useForMr: ['मधुमेह'], program: 'NCD' },
  { id: 'MED008', name: 'Atorvastatin 10mg', nameMr: 'ॲटोर्वास्टॅटिन १० मि.ग्रॅ.', generic: 'Atorvastatin', category: 'CHRONIC',
    unit: 'Tablets', unitMr: 'गोळ्या', form: 'Tablet', strength: '10mg', minimumStock: 200,
    useFor: ['High cholesterol', 'Heart disease prevention'], useForMr: ['कोलेस्टेरॉल', 'हृदय सुरक्षा'], program: 'NCD' },
  
  // Maternal & Child
  { id: 'MED009', name: 'Iron-Folic Acid', nameMr: 'लोह व फॉलिक ॲसिड गोळ्या', generic: 'Ferrous Sulphate + Folic Acid', category: 'MATERNAL',
    unit: 'Tablets', unitMr: 'गोळ्या', form: 'Tablet', strength: '60mg+500mcg', minimumStock: 500,
    useFor: ['Anaemia in pregnancy', 'Folic acid deficiency'], useForMr: ['गरोदरपणातील अशक्तपणा', 'लोह कमतरता'], program: 'PMSMA' },
  { id: 'MED010', name: 'Calcium Carbonate', nameMr: 'कॅल्शियम कार्बोनेट ५०० मि.ग्रॅ.', generic: 'Calcium Carbonate', category: 'MATERNAL',
    unit: 'Tablets', unitMr: 'गोळ्या', form: 'Tablet', strength: '500mg', minimumStock: 400,
    useFor: ['Pregnancy supplementation'], useForMr: ['गरोदरपणातील पोषण'], program: 'PMSMA' },
  { id: 'MED011', name: 'Oxytocin Injection', nameMr: 'ऑक्सिटोसिन १० आय.यू. इंजेक्शन', generic: 'Oxytocin', category: 'MATERNAL',
    unit: 'Ampoules', unitMr: 'ॲम्प्युल्स', form: 'Injection', strength: '10 IU', minimumStock: 50,
    useFor: ['Labour induction', 'Postpartum haemorrhage'], useForMr: ['प्रसूती वेदना', 'रक्तस्राव प्रतिबंध'], program: 'JSSK' },
  { id: 'MED012', name: 'Magnesium Sulphate', nameMr: 'मॅग्नेशियम सल्फेट इंजेक्शन ५०%', generic: 'Magnesium Sulphate', category: 'EMERGENCY',
    unit: 'Ampoules', unitMr: 'ॲम्प्युल्स', form: 'Injection', strength: '50%', minimumStock: 30,
    useFor: ['Eclampsia', 'Pre-eclampsia'], useForMr: ['एक्लॅम्प्सिया', 'उच्च रक्तदाब आकडी'], program: 'JSSK' },
  
  // TB
  { id: 'MED013', name: 'Rifampicin 450mg', nameMr: 'रिफाम्पिसिन ४५० मि.ग्रॅ.', generic: 'Rifampicin', category: 'ANTIBIOTIC',
    unit: 'Tablets', unitMr: 'गोळ्या', form: 'Tablet', strength: '450mg', minimumStock: 100,
    useFor: ['Tuberculosis treatment'], useForMr: ['क्षयरोग उपचार'], program: 'RNTCP' },
  { id: 'MED014', name: 'Isoniazid 300mg', nameMr: 'आयसोनियाझिड ३०० मि.ग्रॅ.', generic: 'Isoniazid', category: 'ANTIBIOTIC',
    unit: 'Tablets', unitMr: 'गोळ्या', form: 'Tablet', strength: '300mg', minimumStock: 100,
    useFor: ['Tuberculosis treatment', 'TB prevention'], useForMr: ['क्षयरोग नियंत्रण'], program: 'RNTCP' },
  
  // Vaccines
  { id: 'MED015', name: 'BCG Vaccine', nameMr: 'बीसीजी लस (क्षयरोग प्रतिबंध)', generic: 'BCG', category: 'VACCINE',
    unit: 'Vials', unitMr: 'व्हाईल्स', form: 'Injection', strength: '20 doses/vial', minimumStock: 20,
    useFor: ['TB prevention (newborns)'], useForMr: ['नवजात बालकांसाठी क्षयरोग लस'], program: 'UIP' },
  { id: 'MED016', name: 'OPV Drops', nameMr: 'पोलिओ डोस (OPV)', generic: 'Oral Polio Vaccine', category: 'VACCINE',
    unit: 'Vials', unitMr: 'व्हाईल्स', form: 'Oral drops', strength: '10 doses/vial', minimumStock: 20,
    useFor: ['Polio prevention'], useForMr: ['पोलिओ प्रतिबंधक थेंब'], program: 'UIP' },
  { id: 'MED017', name: 'Hepatitis B Vaccine', nameMr: 'हेपॅटायटिस बी लस', generic: 'Hep B', category: 'VACCINE',
    unit: 'Vials', unitMr: 'व्हाईल्स', form: 'Injection', strength: '1ml/dose', minimumStock: 30,
    useFor: ['Hepatitis B prevention'], useForMr: ['कावीळ प्रतिबंध लस'], program: 'UIP' },
];

export interface MockFacilityStock {
  medicineId: string;
  facilityId: string;
  quantity: number;
  minimumStock: number;
  batchNumber: string;
  expiryDate: string;
  dailyConsumption: number;
  lastUpdated: string;
  status: StockStatusConfig;
  daysRemaining: string;
}

// Mock stock generator for facilities
export const generateMockStock = (facilityId: string): MockFacilityStock[] => {
  return MEDICINE_DATABASE.map(medicine => {
    const mockQuantities: Record<string, number> = {
      'MED001': 650, 'MED002': 80, 'MED003': 450, 'MED004': 120,
      'MED005': 45, 'MED006': 200, 'MED007': 30, 'MED008': 180,
      'MED009': 320, 'MED010': 0, 'MED011': 15, 'MED012': 8,
      'MED013': 90, 'MED014': 95, 'MED015': 5, 'MED016': 12, 'MED017': 25
    };
    
    const quantity = mockQuantities[medicine.id] ?? Math.floor(Math.random() * 500);
    const dailyConsumption = Math.max(1, Math.floor(medicine.minimumStock / 30));
    const expiryDate = new Date(Date.now() + (Math.random() * 365 + 30) * 24 * 60 * 60 * 1000).toISOString();
    
    return {
      medicineId: medicine.id,
      facilityId,
      quantity,
      minimumStock: medicine.minimumStock,
      batchNumber: `BATCH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      expiryDate,
      dailyConsumption,
      lastUpdated: new Date().toISOString(),
      status: getStockStatus(quantity, medicine.minimumStock, expiryDate),
      daysRemaining: getDaysRemaining(quantity, dailyConsumption)
    };
  });
};

export const FACILITIES = [
  { id: 'FAC001', name: 'PHC Wagholi', nameMr: 'प्राथमिक आरोग्य केंद्र वाघोली', type: 'PHC', distance: '0.5 km' },
  { id: 'FAC002', name: 'CHC Kharadi', nameMr: 'सामुदायिक आरोग्य केंद्र खराडी', type: 'CHC', distance: '4.2 km' },
  { id: 'FAC003', name: 'District Hospital Pune', nameMr: 'जिल्हा रुग्णालय पुणे', type: 'District Hospital', distance: '12 km' },
  { id: 'FAC004', name: 'PHC Lohegaon', nameMr: 'प्राथमिक आरोग्य केंद्र लोहगाव', type: 'PHC', distance: '6.8 km' }
];
