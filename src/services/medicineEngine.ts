// Medicine Engine & Inventory Service — Rural Health Medicine Availability Tracking
// Fully complies with Maharashtra NHM Essential Drug List and JSSK/PMSMA/NPCDCS programs

export type StockStatusTier = 'ADEQUATE' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK' | 'EXPIRING_SOON';

export type MedicineCategory = 
  | 'ESSENTIAL'
  | 'MATERNAL_CHILD'
  | 'CHRONIC_NCD'
  | 'ANTIBIOTIC'
  | 'VACCINE'
  | 'EMERGENCY'
  | 'OTC';

export interface MedicineMaster {
  id: string;
  code: string;
  nameEn: string;
  nameMr: string;
  genericName: string;
  category: MedicineCategory;
  form: 'Tablet' | 'Syrup' | 'Injection' | 'Sachet' | 'Drops' | 'Ointment';
  formMr: string;
  strength: string;
  program: 'NHM EDL' | 'PMSMA' | 'JSSK' | 'NPCDCS' | 'NTEP' | 'UIP';
  dosageGuidelineEn: string;
  dosageGuidelineMr: string;
  standardPackUnit: string;
  standardPackUnitMr: string;
  minBufferThreshold: number;
  dailyConsumptionEstimate: number;
}

export interface FacilityStockItem {
  facilityId: string;
  facilityName: string;
  facilityNameMr: string;
  facilityType: 'Sub-Centre' | 'PHC' | 'Rural Hospital' | 'District Hospital';
  distanceKm: number;
  phone: string;
  dispensaryHoursEn: string;
  dispensaryHoursMr: string;
  medicineId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  currentStock: number;
  unit: string;
  unitMr: string;
  lastUpdated: string;
  monthlyAllocation: number;
  status: StockStatusTier;
  daysOfSupplyRemaining: number;
  daysUntilExpiry: number;
}

export interface StockIndentRequest {
  id: string;
  indentNumber: string;
  facilityId: string;
  facilityName: string;
  dateCreated: string;
  urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL_EMERGENCY';
  items: {
    medicineId: string;
    medicineName: string;
    currentStock: number;
    requestedQuantity: number;
    unit: string;
    reason: string;
  }[];
  status: 'SUBMITTED' | 'APPROVED' | 'DISPATCHED' | 'DELIVERED';
  warehouseDestination: string;
  dispatchedAt?: string;
  trackingNumber?: string;
}

// 18+ Essential Drug Master Catalog
export const ESSENTIAL_MEDICINES_CATALOG: MedicineMaster[] = [
  {
    id: 'MED-001',
    code: 'EDL-PCM-500',
    nameEn: 'Paracetamol Tablets 500mg',
    nameMr: 'पॅरासिटामॉल गोळ्या ५०० मि.ग्रॅ.',
    genericName: 'Paracetamol IP 500mg',
    category: 'ESSENTIAL',
    form: 'Tablet',
    formMr: 'गोळी',
    strength: '500 mg',
    program: 'NHM EDL',
    dosageGuidelineEn: '1 tablet 3 times a day after food for fever or mild pain',
    dosageGuidelineMr: 'ताप किंवा अंगदुखीसाठी जेवणानंतर १ गोळी दिवसातून ३ वेळा',
    standardPackUnit: 'Tablets',
    standardPackUnitMr: 'गोळ्या',
    minBufferThreshold: 200,
    dailyConsumptionEstimate: 45
  },
  {
    id: 'MED-002',
    code: 'EDL-PCM-SYR',
    nameEn: 'Paracetamol Pediatric Suspension 120mg/5ml',
    nameMr: 'पॅरासिटामॉल लहान मुलांचे सिरप १२० मि.ग्रॅ./५ मिली',
    genericName: 'Paracetamol Oral Suspension IP',
    category: 'MATERNAL_CHILD',
    form: 'Syrup',
    formMr: 'सिरप',
    strength: '120 mg / 5 ml (60ml bottle)',
    program: 'JSSK',
    dosageGuidelineEn: '5 ml every 6 to 8 hours as per child age/weight for fever',
    dosageGuidelineMr: 'लहान मुलांच्या तापासाठी वयानुसार ५ मिली दिवसातून २-३ वेळा',
    standardPackUnit: 'Bottles',
    standardPackUnitMr: 'बाटल्या',
    minBufferThreshold: 50,
    dailyConsumptionEstimate: 8
  },
  {
    id: 'MED-003',
    code: 'EDL-IFA-RED',
    nameEn: 'Iron & Folic Acid Tablets (Large Red)',
    nameMr: 'लोह आणि फॉलिक ॲसिड गोळ्या (लाल)',
    genericName: 'Ferrous Sulfate 100mg + Folic Acid 0.5mg',
    category: 'MATERNAL_CHILD',
    form: 'Tablet',
    formMr: 'गोळी',
    strength: '100 mg Fe + 500 mcg FA',
    program: 'PMSMA',
    dosageGuidelineEn: '1 tablet daily at night after meals throughout pregnancy & lactation',
    dosageGuidelineMr: 'गर्भवती व स्तनदा मातांसाठी दररोज रात्री जेवणानंतर १ गोळी',
    standardPackUnit: 'Tablets',
    standardPackUnitMr: 'गोळ्या',
    minBufferThreshold: 300,
    dailyConsumptionEstimate: 35
  },
  {
    id: 'MED-004',
    code: 'EDL-CAL-500',
    nameEn: 'Calcium Carbonate with Vitamin D3 Tablets',
    nameMr: 'कॅल्शियम व व्हिटॅमिन डी३ गोळ्या ५०० मि.ग्रॅ.',
    genericName: 'Calcium Carbonate 500mg + Vit D3 250 IU',
    category: 'MATERNAL_CHILD',
    form: 'Tablet',
    formMr: 'गोळी',
    strength: '500 mg Elemental Ca',
    program: 'PMSMA',
    dosageGuidelineEn: '1 tablet twice daily from 14 weeks of pregnancy onwards',
    dosageGuidelineMr: 'गरोदरपणाच्या १४व्या आठवड्यापासून दिवसातून २ वेळा १ गोळी',
    standardPackUnit: 'Tablets',
    standardPackUnitMr: 'गोळ्या',
    minBufferThreshold: 250,
    dailyConsumptionEstimate: 30
  },
  {
    id: 'MED-005',
    code: 'EDL-ORS-20G',
    nameEn: 'Oral Rehydration Salts (ORS) WHO Formula',
    nameMr: 'ओ.आर.एस. पावडर सॅचेट (डब्ल्यूएचओ फॉर्म्युला)',
    genericName: 'Sodium Chloride + Potassium Chloride + Dextrose + Trisodium Citrate',
    category: 'ESSENTIAL',
    form: 'Sachet',
    formMr: 'पाकीट',
    strength: '21.8 gm for 1 Litre water',
    program: 'NHM EDL',
    dosageGuidelineEn: 'Dissolve entire packet in 1 litre boiled and cooled water. Sip frequently',
    dosageGuidelineMr: 'संपूर्ण पाकीट १ लिटर उकळून थंड केलेल्या पाण्यात मिसळून घोट घोट प्यावे',
    standardPackUnit: 'Sachets',
    standardPackUnitMr: 'पाकिटे',
    minBufferThreshold: 100,
    dailyConsumptionEstimate: 20
  },
  {
    id: 'MED-006',
    code: 'EDL-ZINC-20',
    nameEn: 'Zinc Sulfate Dispersible Tablets 20mg',
    nameMr: 'झिंक सल्फेट विरघळणाऱ्या गोळ्या २० मि.ग्रॅ.',
    genericName: 'Zinc Sulfate Monohydrate IP 20mg',
    category: 'MATERNAL_CHILD',
    form: 'Tablet',
    formMr: 'गोळी',
    strength: '20 mg Dispersible',
    program: 'JSSK',
    dosageGuidelineEn: 'Dissolve in maternal milk or water. 1 tablet daily for 14 days in diarrhea',
    dosageGuidelineMr: 'अतिसारामध्ये १४ दिवस दररोज १ गोळी पाण्यात विरघळवून द्यावी',
    standardPackUnit: 'Tablets',
    standardPackUnitMr: 'गोळ्या',
    minBufferThreshold: 120,
    dailyConsumptionEstimate: 15
  },
  {
    id: 'MED-007',
    code: 'EDL-MET-500',
    nameEn: 'Metformin Hydrochloride Tablets 500mg',
    nameMr: 'मेटफॉर्मिन गोळ्या ५०० मि.ग्रॅ. (मधुमेह)',
    genericName: 'Metformin Hydrochloride IP 500mg',
    category: 'CHRONIC_NCD',
    form: 'Tablet',
    formMr: 'गोळी',
    strength: '500 mg',
    program: 'NPCDCS',
    dosageGuidelineEn: '1 tablet twice daily with breakfast and dinner for Type 2 Diabetes',
    dosageGuidelineMr: 'टाइप २ मधुमेहासाठी सकाळ-संध्याकाळ जेवणासोबत १ गोळी',
    standardPackUnit: 'Tablets',
    standardPackUnitMr: 'गोळ्या',
    minBufferThreshold: 400,
    dailyConsumptionEstimate: 50
  },
  {
    id: 'MED-008',
    code: 'EDL-AML-005',
    nameEn: 'Amlodipine Besylate Tablets 5mg',
    nameMr: 'ॲम्लोडिपिन गोळ्या ५ मि.ग्रॅ. (रक्तदाब)',
    genericName: 'Amlodipine Besylate IP 5mg',
    category: 'CHRONIC_NCD',
    form: 'Tablet',
    formMr: 'गोळी',
    strength: '5 mg',
    program: 'NPCDCS',
    dosageGuidelineEn: '1 tablet once daily morning for hypertension management',
    dosageGuidelineMr: 'उच्च रक्तदाब नियंत्रणासाठी रोज सकाळी १ गोळी',
    standardPackUnit: 'Tablets',
    standardPackUnitMr: 'गोळ्या',
    minBufferThreshold: 350,
    dailyConsumptionEstimate: 40
  },
  {
    id: 'MED-009',
    code: 'EDL-ENA-005',
    nameEn: 'Enalapril Maleate Tablets 5mg',
    nameMr: 'एनालाप्रिल गोळ्या ५ मि.ग्रॅ.',
    genericName: 'Enalapril Maleate IP 5mg',
    category: 'CHRONIC_NCD',
    form: 'Tablet',
    formMr: 'गोळी',
    strength: '5 mg',
    program: 'NPCDCS',
    dosageGuidelineEn: '1 tablet daily as directed by medical officer for hypertension or heart strain',
    dosageGuidelineMr: 'डॉक्टरांच्या सल्ल्यानुसार रक्तदाबासाठी दररोज १ गोळी',
    standardPackUnit: 'Tablets',
    standardPackUnitMr: 'गोळ्या',
    minBufferThreshold: 150,
    dailyConsumptionEstimate: 15
  },
  {
    id: 'MED-010',
    code: 'EDL-ATV-010',
    nameEn: 'Atorvastatin Tablets 10mg',
    nameMr: 'ॲटोर्वास्टॅटिन गोळ्या १० मि.ग्रॅ. (कोलेस्टेरॉल)',
    genericName: 'Atorvastatin Calcium IP 10mg',
    category: 'CHRONIC_NCD',
    form: 'Tablet',
    formMr: 'गोळी',
    strength: '10 mg',
    program: 'NPCDCS',
    dosageGuidelineEn: '1 tablet daily at bedtime for cholesterol and cardiovascular risk',
    dosageGuidelineMr: 'कोलेस्टेरॉल व हृदय सुरक्षिततेसाठी रोज रात्री १ गोळी',
    standardPackUnit: 'Tablets',
    standardPackUnitMr: 'गोळ्या',
    minBufferThreshold: 200,
    dailyConsumptionEstimate: 20
  },
  {
    id: 'MED-011',
    code: 'EDL-AMX-500',
    nameEn: 'Amoxicillin Capsules 500mg',
    nameMr: 'ॲमोक्सिसिलिन कॅप्सूल्स ५०० मि.ग्रॅ.',
    genericName: 'Amoxicillin Trihydrate IP 500mg',
    category: 'ANTIBIOTIC',
    form: 'Tablet',
    formMr: 'कॅप्सूल',
    strength: '500 mg',
    program: 'NHM EDL',
    dosageGuidelineEn: '1 capsule 3 times daily for 5 days as prescribed for bacterial infections',
    dosageGuidelineMr: 'जिवाणू संसर्गासाठी ५ दिवस दिवसातून ३ वेळा १ कॅप्सूल',
    standardPackUnit: 'Capsules',
    standardPackUnitMr: 'कॅप्सूल्स',
    minBufferThreshold: 200,
    dailyConsumptionEstimate: 25
  },
  {
    id: 'MED-012',
    code: 'EDL-AZI-500',
    nameEn: 'Azithromycin Tablets 500mg',
    nameMr: 'ॲझिथ्रोमायसिन गोळ्या ५०० मि.ग्रॅ.',
    genericName: 'Azithromycin Dihydrate IP 500mg',
    category: 'ANTIBIOTIC',
    form: 'Tablet',
    formMr: 'गोळी',
    strength: '500 mg',
    program: 'NHM EDL',
    dosageGuidelineEn: '1 tablet once daily 1 hour before or 2 hours after meals for 3 to 5 days',
    dosageGuidelineMr: 'श्वसन संसर्गासाठी दररोज जेवणापूर्वी १ तास १ गोळी सलग ३ ते ५ दिवस',
    standardPackUnit: 'Tablets',
    standardPackUnitMr: 'गोळ्या',
    minBufferThreshold: 100,
    dailyConsumptionEstimate: 12
  },
  {
    id: 'MED-013',
    code: 'EDL-ALB-400',
    nameEn: 'Albendazole Chewable Tablets 400mg',
    nameMr: 'अल्बेंडाझोल चावून खाण्याच्या गोळ्या ४०० मि.ग्रॅ.',
    genericName: 'Albendazole IP 400mg',
    category: 'ESSENTIAL',
    form: 'Tablet',
    formMr: 'गोळी',
    strength: '400 mg Chewable',
    program: 'NHM EDL',
    dosageGuidelineEn: 'Chew 1 tablet single dose at bedtime for deworming',
    dosageGuidelineMr: 'जंतांच्या निर्मूलनासाठी रात्री झोपताना १ गोळी चावून खावी',
    standardPackUnit: 'Tablets',
    standardPackUnitMr: 'गोळ्या',
    minBufferThreshold: 150,
    dailyConsumptionEstimate: 18
  },
  {
    id: 'MED-014',
    code: 'EDL-TT-INJ',
    nameEn: 'Tetanus Toxoid (TT / Td) Vaccine 0.5ml',
    nameMr: 'धनुर्वात लस (TT / Td) ०.५ मिली इंजेक्शन',
    genericName: 'Tetanus and Diphtheria Toxoid for Adult and Pregnancy',
    category: 'VACCINE',
    form: 'Injection',
    formMr: 'इंजेक्शन',
    strength: '0.5 ml Ampoule / Vial',
    program: 'UIP',
    dosageGuidelineEn: '0.5 ml IM in deltoid for pregnant mothers (2 doses) or wound prophylaxis',
    dosageGuidelineMr: 'गर्भवती मातांना व जखम झाल्यास दंडावर ०.५ मिली स्नायूमध्ये',
    standardPackUnit: 'Vials',
    standardPackUnitMr: 'व्हाईल्स',
    minBufferThreshold: 60,
    dailyConsumptionEstimate: 6
  },
  {
    id: 'MED-015',
    code: 'EDL-ADR-INJ',
    nameEn: 'Adrenaline Injection IP 1:1000 (1mg/ml)',
    nameMr: 'ॲड्रिनॅलिन जीवनरक्षक इंजेक्शन १:१००० (१ मि.ग्रॅ./मिली)',
    genericName: 'Epinephrine Injection IP 1mg/ml',
    category: 'EMERGENCY',
    form: 'Injection',
    formMr: 'इंजेक्शन',
    strength: '1 mg / 1 ml Ampoule',
    program: 'NHM EDL',
    dosageGuidelineEn: 'Emergency life support for anaphylaxis, severe bronchospasm, or cardiac resuscitation',
    dosageGuidelineMr: 'अति-तीव्र ॲलर्जी व हृदय आणीबाणीसाठी तात्काळ जीवनरक्षक इंजेक्शन',
    standardPackUnit: 'Ampoules',
    standardPackUnitMr: 'ॲम्प्युल्स',
    minBufferThreshold: 20,
    dailyConsumptionEstimate: 1
  },
  {
    id: 'MED-016',
    code: 'EDL-D25-100',
    nameEn: 'Dextrose 25% Heavy IV Infusion 100ml',
    nameMr: 'डेक्स्ट्रोज २५% सलाईन १०० मिली (हायपोग्लायसेमिया)',
    genericName: 'Dextrose Injection IP 25% w/v',
    category: 'EMERGENCY',
    form: 'Injection',
    formMr: 'सलाईन बाटली',
    strength: '25% w/v (100 ml)',
    program: 'NHM EDL',
    dosageGuidelineEn: 'Immediate IV administration for severe acute hypoglycemia or diabetic coma',
    dosageGuidelineMr: 'रक्तातील साखर अचानक कमी झाल्यास किंवा बेशुद्धीत तात्काळ शिरेतून',
    standardPackUnit: 'Bottles',
    standardPackUnitMr: 'बाटल्या',
    minBufferThreshold: 25,
    dailyConsumptionEstimate: 2
  },
  {
    id: 'MED-017',
    code: 'EDL-INS-REG',
    nameEn: 'Human Insulin Regular 40 IU/ml (10ml vial)',
    nameMr: 'इन्सुलिन रेग्युलर ४० आय.यू. (मधुमेह नियंत्रण)',
    genericName: 'Human Insulin IP (rDNA origin) Short-acting',
    category: 'CHRONIC_NCD',
    form: 'Injection',
    formMr: 'व्हाईल',
    strength: '40 IU/ml (10 ml vial)',
    program: 'NPCDCS',
    dosageGuidelineEn: 'Subcutaneous injection 30 minutes before meals under cold chain storage (2-8°C)',
    dosageGuidelineMr: 'थंड तापमानात (२-८ अंश से.) साठवून जेवणापूर्वी ३० मिनिटे त्वचेखाली',
    standardPackUnit: 'Vials',
    standardPackUnitMr: 'व्हाईल्स',
    minBufferThreshold: 30,
    dailyConsumptionEstimate: 3
  },
  {
    id: 'MED-018',
    code: 'EDL-CIP-003',
    nameEn: 'Ciprofloxacin Eye/Ear Drops 0.3% w/v',
    nameMr: 'सिप्रोफ्लोक्सासिन डोळ्यांचे/कानाचे थेंब ०.३%',
    genericName: 'Ciprofloxacin Ophthalmic Solution IP 0.3%',
    category: 'OTC',
    form: 'Drops',
    formMr: 'थेंब',
    strength: '0.3% w/v (10 ml)',
    program: 'NHM EDL',
    dosageGuidelineEn: '1-2 drops in affected eye or ear 3-4 times daily for infections',
    dosageGuidelineMr: 'संसर्गासाठी बाधित डोळ्यात किंवा कानात दिवसातून ३-४ वेळा १-२ थेंब',
    standardPackUnit: 'Bottles',
    standardPackUnitMr: 'बाटल्या',
    minBufferThreshold: 40,
    dailyConsumptionEstimate: 5
  }
];

// Facilities Registry
export interface FacilityMetadata {
  id: string;
  nameEn: string;
  nameMr: string;
  type: 'Sub-Centre' | 'PHC' | 'Rural Hospital' | 'District Hospital';
  distanceKm: number;
  phone: string;
  dispensaryHoursEn: string;
  dispensaryHoursMr: string;
  addressEn: string;
  addressMr: string;
}

export const NETWORK_FACILITIES: FacilityMetadata[] = [
  {
    id: 'FAC-01',
    nameEn: 'PHC Shirur',
    nameMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    type: 'PHC',
    distanceKm: 2.3,
    phone: '02138-222340',
    dispensaryHoursEn: '08:30 AM – 01:30 PM & 04:00 PM – 06:00 PM',
    dispensaryHoursMr: 'सकाळी ०८:३० ते दुपारी ०१:३० व सायं. ०४:०० ते ०६:००',
    addressEn: 'Near Market Yard, Shirur, Pune - 412210',
    addressMr: 'मार्केट यार्ड जवळ, शिरूर, पुणे - ४१२२१०'
  },
  {
    id: 'FAC-02',
    nameEn: 'Sub-Centre Vadgaon',
    nameMr: 'आरोग्य उपकेंद्र वडगाव',
    type: 'Sub-Centre',
    distanceKm: 0.5,
    phone: '02138-289011',
    dispensaryHoursEn: '09:00 AM – 01:00 PM',
    dispensaryHoursMr: 'सकाळी ०९:०० ते दुपारी ०१:००',
    addressEn: 'Gram Panchayat Compound, Vadgaon Rasai, Shirur',
    addressMr: 'ग्रामपंचायत परिसर, वडगाव रासाई, शिरूर'
  },
  {
    id: 'FAC-03',
    nameEn: 'Rural Hospital Khed',
    nameMr: 'ग्रामीण रुग्णालय खेड',
    type: 'Rural Hospital',
    distanceKm: 14.0,
    phone: '02135-244100',
    dispensaryHoursEn: '24 Hours Emergency Dispensary & OPD 09:00 AM - 02:00 PM',
    dispensaryHoursMr: '२४ तास तातडीची फार्मसी व बाह्यरुग्ण स. ०९:०० ते दु. ०२:००',
    addressEn: 'Station Road, Rajgurunagar (Khed), Pune - 410505',
    addressMr: 'स्टेशन रोड, राजगुरुनगर (खेड), पुणे - ४१०५०५'
  },
  {
    id: 'FAC-04',
    nameEn: 'Sub-Centre Takli',
    nameMr: 'आरोग्य उपकेंद्र टाकळी',
    type: 'Sub-Centre',
    distanceKm: 5.1,
    phone: '02138-290401',
    dispensaryHoursEn: '09:00 AM – 01:00 PM',
    dispensaryHoursMr: 'सकाळी ०९:०० ते दुपारी ०१:००',
    addressEn: 'Takli Haji Road, Shirur Block',
    addressMr: 'टाकळी हाजी रोड, शिरूर तालुका'
  },
  {
    id: 'FAC-05',
    nameEn: 'CHC Wagholi',
    nameMr: 'सामुदायिक आरोग्य केंद्र वाघोली',
    type: 'PHC',
    distanceKm: 9.5,
    phone: '020-27051200',
    dispensaryHoursEn: '08:00 AM – 02:00 PM & 24x7 Inpatient',
    dispensaryHoursMr: 'सकाळी ०८:०० ते दु. ०२:०० व २४ तास भरती रुग्ण सेवा',
    addressEn: 'Nagar Road, Wagholi, Pune - 412207',
    addressMr: 'नगर रोड, वाघोली, पुणे - ४१२२०७'
  },
  {
    id: 'FAC-06',
    nameEn: 'District Hospital Aundh Pune',
    nameMr: 'जिल्हा रुग्णालय औंध पुणे',
    type: 'District Hospital',
    distanceKm: 28.0,
    phone: '020-25881400',
    dispensaryHoursEn: '24 Hours Central Drug Store & 6 Outpatient Counters',
    dispensaryHoursMr: '२४ तास मध्यवर्ती औषध भांडार व ६ बाह्यरुग्ण खिडक्या',
    addressEn: 'Aundh Camp, Pune - 411027',
    addressMr: 'औंध कॅम्प, पुणे - ४११०२७'
  }
];

// Helper to calculate days until expiry
export function getDaysUntilExpiry(expiryDateStr: string): number {
  const [year, month, day] = expiryDateStr.split('-').map(Number);
  if (!year || !month) return 999;
  const expiry = new Date(year, month - 1, day || 28);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Logic to derive stock status tier based on quantity, threshold and expiry
export function calculateStockStatus(
  currentStock: number, 
  minThreshold: number, 
  expiryDateStr: string
): StockStatusTier {
  if (currentStock <= 0) {
    return 'OUT_OF_STOCK';
  }
  const daysToExpire = getDaysUntilExpiry(expiryDateStr);
  if (daysToExpire <= 30 && daysToExpire > 0) {
    return 'EXPIRING_SOON';
  }
  if (currentStock < Math.floor(minThreshold * 0.3)) {
    return 'CRITICAL';
  }
  if (currentStock < minThreshold) {
    return 'LOW';
  }
  return 'ADEQUATE';
}

// Default stock generator across all 6 facilities
export function generateInitialStock(): FacilityStockItem[] {
  const stockList: FacilityStockItem[] = [];

  NETWORK_FACILITIES.forEach(fac => {
    ESSENTIAL_MEDICINES_CATALOG.forEach((med, medIdx) => {
      // Seed varying realistic stocks per facility
      let multiplier = 1.0;
      if (fac.type === 'District Hospital') multiplier = 3.5;
      else if (fac.type === 'Rural Hospital') multiplier = 2.0;
      else if (fac.type === 'Sub-Centre') multiplier = 0.4;

      const baseThreshold = Math.round(med.minBufferThreshold * multiplier);
      let initialQty = Math.round(baseThreshold * 1.3);

      // Create intentional low stock, critical, and out-of-stock scenarios for testing
      let batchNum = `MH-${med.code.slice(4, 7)}-${100 + medIdx}`;
      let expYear = 2026;
      let expMonth = ((medIdx % 11) + 2).toString().padStart(2, '0');

      if (fac.id === 'FAC-01') {
        // PHC Shirur: Amoxicillin is OUT OF STOCK, ORS is LOW, Calcium is EXPIRING SOON
        if (med.id === 'MED-011') initialQty = 0;
        else if (med.id === 'MED-005') initialQty = Math.round(baseThreshold * 0.4);
        else if (med.id === 'MED-004') {
          initialQty = 180;
          expYear = 2026;
          expMonth = '04'; // Soon
        }
      } else if (fac.id === 'FAC-02') {
        // Sub-Centre Vadgaon: IFA is LOW, ORS is ADEQUATE, Paracetamol is ADEQUATE
        if (med.id === 'MED-003') initialQty = 18;
        else if (med.id === 'MED-011') initialQty = 0;
      } else if (fac.id === 'FAC-03') {
        // Rural Hospital Khed: Plenty of Amoxicillin and Insulin
        initialQty = Math.round(baseThreshold * 1.8);
      } else if (fac.id === 'FAC-04') {
        // Sub-Centre Takli: Paracetamol is CRITICAL, IFA is OUT OF STOCK
        if (med.id === 'MED-001') initialQty = 12;
        if (med.id === 'MED-003') initialQty = 0;
      }

      const expiryDate = `${expYear}-${expMonth}-28`;
      const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
      const status = calculateStockStatus(initialQty, baseThreshold, expiryDate);
      const dailyUsage = Math.max(1, Math.round(med.dailyConsumptionEstimate * multiplier));
      const daysOfSupplyRemaining = initialQty > 0 ? Math.floor(initialQty / dailyUsage) : 0;

      stockList.push({
        facilityId: fac.id,
        facilityName: fac.nameEn,
        facilityNameMr: fac.nameMr,
        facilityType: fac.type,
        distanceKm: fac.distanceKm,
        phone: fac.phone,
        dispensaryHoursEn: fac.dispensaryHoursEn,
        dispensaryHoursMr: fac.dispensaryHoursMr,
        medicineId: med.id,
        batchNumber: batchNum,
        manufacturingDate: '2024-01-15',
        expiryDate,
        currentStock: initialQty,
        unit: med.standardPackUnit,
        unitMr: med.standardPackUnitMr,
        lastUpdated: '10 mins ago',
        monthlyAllocation: baseThreshold * 2,
        status,
        daysOfSupplyRemaining,
        daysUntilExpiry
      });
    });
  });

  return stockList;
}

const STOCK_STORAGE_KEY = 'healthway_facility_medicines_v2';
const INDENT_STORAGE_KEY = 'healthway_stock_indents_v2';
const NOTIFICATION_SUBS_KEY = 'healthway_medicine_notify_subs_v2';

// Service API
export const MedicineEngineService = {
  getAllStock(): FacilityStockItem[] {
    try {
      const stored = localStorage.getItem(STOCK_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    const fresh = generateInitialStock();
    this.saveStock(fresh);
    return fresh;
  },

  saveStock(items: FacilityStockItem[]) {
    try {
      localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  },

  getMedicinesCatalog(): MedicineMaster[] {
    return ESSENTIAL_MEDICINES_CATALOG;
  },

  getFacilities(): FacilityMetadata[] {
    return NETWORK_FACILITIES;
  },

  // Update stock level for a specific facility & medicine batch
  updateStockLevel(
    facilityId: string, 
    medicineId: string, 
    newQuantity: number, 
    batchNumber?: string, 
    expiryDate?: string
  ): FacilityStockItem | null {
    const all = this.getAllStock();
    const index = all.findIndex(item => item.facilityId === facilityId && item.medicineId === medicineId);
    if (index === -1) return null;

    const med = ESSENTIAL_MEDICINES_CATALOG.find(m => m.id === medicineId);
    const minThreshold = med ? med.minBufferThreshold : 100;
    const finalExpiry = expiryDate || all[index].expiryDate;
    const finalBatch = batchNumber || all[index].batchNumber;

    const daysUntilExp = getDaysUntilExpiry(finalExpiry);
    const status = calculateStockStatus(newQuantity, minThreshold, finalExpiry);
    const dailyUsage = Math.max(1, med?.dailyConsumptionEstimate || 10);
    const daysOfSupply = newQuantity > 0 ? Math.floor(newQuantity / dailyUsage) : 0;

    all[index] = {
      ...all[index],
      currentStock: Math.max(0, newQuantity),
      batchNumber: finalBatch,
      expiryDate: finalExpiry,
      status,
      daysUntilExpiry: daysUntilExp,
      daysOfSupplyRemaining: daysOfSupply,
      lastUpdated: 'Just now'
    };

    this.saveStock(all);
    return all[index];
  },

  // Record a dispensed prescription (decrements stock)
  dispenseMedicine(facilityId: string, medicineId: string, quantityToDeduct: number): boolean {
    const all = this.getAllStock();
    const item = all.find(i => i.facilityId === facilityId && i.medicineId === medicineId);
    if (!item) return false;
    const updatedQty = Math.max(0, item.currentStock - quantityToDeduct);
    this.updateStockLevel(facilityId, medicineId, updatedQty);
    return true;
  },

  // Get active Indents (requisitions)
  getIndents(): StockIndentRequest[] {
    try {
      const stored = localStorage.getItem(INDENT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    const sampleIndents: StockIndentRequest[] = [
      {
        id: 'IND-901',
        indentNumber: 'IND-2024-MH-0811',
        facilityId: 'FAC-01',
        facilityName: 'PHC Shirur',
        dateCreated: '2024-06-18 09:30 AM',
        urgency: 'CRITICAL_EMERGENCY',
        items: [
          {
            medicineId: 'MED-011',
            medicineName: 'Amoxicillin Capsules 500mg',
            currentStock: 0,
            requestedQuantity: 500,
            unit: 'Capsules',
            reason: 'Zero stock available. High pediatric and respiratory OPD influx.'
          },
          {
            medicineId: 'MED-005',
            medicineName: 'Oral Rehydration Salts (ORS)',
            currentStock: 18,
            requestedQuantity: 300,
            unit: 'Sachets',
            reason: 'Monsoon acute gastroenteritis buffer required.'
          }
        ],
        status: 'SUBMITTED',
        warehouseDestination: 'District Central Medical Store (Aundh, Pune)'
      }
    ];
    localStorage.setItem(INDENT_STORAGE_KEY, JSON.stringify(sampleIndents));
    return sampleIndents;
  },

  // Create an automated or manual stock indent to warehouse
  createIndent(
    facilityId: string, 
    urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL_EMERGENCY', 
    items: { medicineId: string; requestedQuantity: number; reason: string }[]
  ): StockIndentRequest {
    const indents = this.getIndents();
    const fac = NETWORK_FACILITIES.find(f => f.id === facilityId);
    const allStock = this.getAllStock();

    const formattedItems = items.map(req => {
      const med = ESSENTIAL_MEDICINES_CATALOG.find(m => m.id === req.medicineId);
      const stock = allStock.find(s => s.facilityId === facilityId && s.medicineId === req.medicineId);
      return {
        medicineId: req.medicineId,
        medicineName: med?.nameEn || 'Medicine',
        currentStock: stock ? stock.currentStock : 0,
        requestedQuantity: req.requestedQuantity,
        unit: med?.standardPackUnit || 'Units',
        reason: req.reason
      };
    });

    const newIndent: StockIndentRequest = {
      id: `IND-${Date.now().toString().slice(-4)}`,
      indentNumber: `IND-2024-MH-${Math.floor(1000 + Math.random() * 9000)}`,
      facilityId,
      facilityName: fac?.nameEn || 'Health Facility',
      dateCreated: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      urgency,
      items: formattedItems,
      status: 'SUBMITTED',
      warehouseDestination: 'District Central Medical Store (Aundh, Pune)',
      trackingNumber: `MSRTC-CARGO-${Math.floor(10000 + Math.random() * 90000)}`
    };

    indents.unshift(newIndent);
    try {
      localStorage.setItem(INDENT_STORAGE_KEY, JSON.stringify(indents));
    } catch {
      // ignore
    }
    return newIndent;
  },

  // Notify Me subscriptions for patients when out-of-stock items arrive
  subscribeStockNotification(patientPhone: string, medicineId: string, facilityId: string): boolean {
    try {
      const subs = JSON.parse(localStorage.getItem(NOTIFICATION_SUBS_KEY) || '[]');
      subs.push({
        phone: patientPhone,
        medicineId,
        facilityId,
        dateSubscribed: new Date().toISOString()
      });
      localStorage.setItem(NOTIFICATION_SUBS_KEY, JSON.stringify(subs));
      return true;
    } catch {
      return false;
    }
  },

  isSubscribed(patientPhone: string, medicineId: string, facilityId: string): boolean {
    try {
      const subs = JSON.parse(localStorage.getItem(NOTIFICATION_SUBS_KEY) || '[]');
      return subs.some((s: any) => s.medicineId === medicineId && s.facilityId === facilityId);
    } catch {
      return false;
    }
  }
};
