/**
 * Medicine & Stock Inventory API Routes
 * Government of Maharashtra - Integrated Rural Health Platform (HealthWay)
 * Essential Drugs List (EDL) & Public Health Facility Inventory
 * Strictly zero unicode emojis.
 */

const express = require('express');
const router = express.Router();
const { MedicineCategories } = require('../models/Medicine');
const { StockTiers } = require('../models/MedicineStock');

// Seed Essential Drugs List (Maharashtra NHM Formularies)
const medicinesStore = [
  {
    medicineId: 'MED-001',
    nameEn: 'Paracetamol 500mg',
    nameMr: 'पॅरासिटामॉल ५०० मि.ग्रॅ.',
    genericName: 'Paracetamol',
    category: 'ESSENTIAL',
    form: 'Tablet',
    strength: '500 mg',
    unit: 'Tablets',
    program: 'EDL',
    dosageGuidelineEn: '1 tablet every 6-8 hours as needed for fever/pain (max 4g/day)',
    dosageGuidelineMr: 'ताप किंवा वेदनेसाठी दर ६ ते ८ तासांनी १ गोळी (कमाल ४ ग्रॅम/दिवस)',
    coldChain: false,
    minimumStockDefault: 500
  },
  {
    medicineId: 'MED-002',
    nameEn: 'Amoxicillin 500mg',
    nameMr: 'अमोक्सिसिलिन ५०० मि.ग्रॅ.',
    genericName: 'Amoxicillin',
    category: 'ANTIBIOTIC',
    form: 'Capsule',
    strength: '500 mg',
    unit: 'Capsules',
    program: 'EDL',
    dosageGuidelineEn: '1 capsule 3 times daily after food for 5-7 days',
    dosageGuidelineMr: 'जेवणानंतर दिवसातून ३ वेळा १ कॅप्सूल सलग ५ ते ७ दिवस',
    coldChain: false,
    minimumStockDefault: 300
  },
  {
    medicineId: 'MED-003',
    nameEn: 'Metformin 500mg',
    nameMr: 'मेटफॉर्मिन ५०० मि.ग्रॅ.',
    genericName: 'Metformin Hydrochloride',
    category: 'CHRONIC',
    form: 'Tablet',
    strength: '500 mg',
    unit: 'Tablets',
    program: 'NCD',
    dosageGuidelineEn: '1 tablet twice daily with meals for Type 2 Diabetes',
    dosageGuidelineMr: 'मधुमेह टाइप-२ साठी जेवणासोबत दिवसातून २ वेळा १ गोळी',
    coldChain: false,
    minimumStockDefault: 400
  },
  {
    medicineId: 'MED-004',
    nameEn: 'Amlodipine 5mg',
    nameMr: 'अम्लोडिपिन ५ मि.ग्रॅ.',
    genericName: 'Amlodipine Besylate',
    category: 'CHRONIC',
    form: 'Tablet',
    strength: '5 mg',
    unit: 'Tablets',
    program: 'NCD',
    dosageGuidelineEn: '1 tablet once daily morning for Hypertension',
    dosageGuidelineMr: 'उच्च रक्तदाबासाठी दररोज सकाळी १ गोळी',
    coldChain: false,
    minimumStockDefault: 350
  },
  {
    medicineId: 'MED-005',
    nameEn: 'Iron & Folic Acid (IFA) Tablets',
    nameMr: 'लोह आणि फॉलिक आम्ल गोळ्या',
    genericName: 'Ferrous Sulphate + Folic Acid',
    category: 'MATERNAL',
    form: 'Tablet',
    strength: '100mg Iron + 0.5mg Folic Acid',
    unit: 'Tablets',
    program: 'PMSMA',
    dosageGuidelineEn: '1 tablet daily after meal during pregnancy and lactation',
    dosageGuidelineMr: 'गरोदरपणात व स्तनपान काळात जेवणानंतर दररोज १ गोळी',
    coldChain: false,
    minimumStockDefault: 800
  },
  {
    medicineId: 'MED-006',
    nameEn: 'Oral Rehydration Salts (ORS) Sachet',
    nameMr: 'ओआरएस जलसंजीवनी पाकीट',
    genericName: 'WHO Oral Rehydration Salts formula',
    category: 'ESSENTIAL',
    form: 'Sachet',
    strength: '20.5 g sachet for 1L water',
    unit: 'Sachets',
    program: 'EDL',
    dosageGuidelineEn: 'Dissolve entire sachet in 1 litre clean boiled water',
    dosageGuidelineMr: 'संपूर्ण पाकीट १ लिटर स्वच्छ उकळलेल्या पाण्यात विरघळवा',
    coldChain: false,
    minimumStockDefault: 250
  },
  {
    medicineId: 'MED-007',
    nameEn: 'Albendazole 400mg',
    nameMr: 'अल्बेंडाझोल ४०० मि.ग्रॅ.',
    genericName: 'Albendazole',
    category: 'ESSENTIAL',
    form: 'Tablet',
    strength: '400 mg Chewable',
    unit: 'Tablets',
    program: 'EDL',
    dosageGuidelineEn: 'Single chewable dose for deworming prophylaxis',
    dosageGuidelineMr: 'जंतनाशकासाठी चावून खाण्याची एकच गोळी',
    coldChain: false,
    minimumStockDefault: 200
  },
  {
    medicineId: 'MED-008',
    nameEn: 'Azithromycin 500mg',
    nameMr: 'अझिथ्रोमायसिन ५०० मि.ग्रॅ.',
    genericName: 'Azithromycin Dihydrate',
    category: 'ANTIBIOTIC',
    form: 'Tablet',
    strength: '500 mg',
    unit: 'Tablets',
    program: 'EDL',
    dosageGuidelineEn: '1 tablet once daily 1 hour before or 2 hours after meals for 3-5 days',
    dosageGuidelineMr: 'जेवणाच्या १ तास आधी किंवा २ तासांनंतर दररोज १ गोळी सलग ३ ते ५ दिवस',
    coldChain: false,
    minimumStockDefault: 150
  },
  {
    medicineId: 'MED-009',
    nameEn: 'Cetirizine 10mg',
    nameMr: 'सिट्रिझिन १० मि.ग्रॅ.',
    genericName: 'Cetirizine Hydrochloride',
    category: 'OTC',
    form: 'Tablet',
    strength: '10 mg',
    unit: 'Tablets',
    program: 'EDL',
    dosageGuidelineEn: '1 tablet at bedtime for allergic rhinitis/urticaria',
    dosageGuidelineMr: 'अ‍ॅलर्जीसाठी झोपताना १ गोळी',
    coldChain: false,
    minimumStockDefault: 300
  },
  {
    medicineId: 'MED-010',
    nameEn: 'Ciprofloxacin 500mg',
    nameMr: 'सिप्रोफ्लॉक्सासिन ५०० मि.ग्रॅ.',
    genericName: 'Ciprofloxacin Hydrochloride',
    category: 'ANTIBIOTIC',
    form: 'Tablet',
    strength: '500 mg',
    unit: 'Tablets',
    program: 'EDL',
    dosageGuidelineEn: '1 tablet twice daily for acute bacterial infections',
    dosageGuidelineMr: 'जिवाणू संसर्गासाठी दिवसातून २ वेळा १ गोळी',
    coldChain: false,
    minimumStockDefault: 200
  },
  {
    medicineId: 'MED-011',
    nameEn: 'Enalapril 5mg',
    nameMr: 'एनालाप्रिल ५ मि.ग्रॅ.',
    genericName: 'Enalapril Maleate',
    category: 'CHRONIC',
    form: 'Tablet',
    strength: '5 mg',
    unit: 'Tablets',
    program: 'NCD',
    dosageGuidelineEn: '1 tablet daily for hypertension or heart failure',
    dosageGuidelineMr: 'हृदयरोग किंवा उच्च रक्तदाबासाठी दररोज १ गोळी',
    coldChain: false,
    minimumStockDefault: 200
  },
  {
    medicineId: 'MED-012',
    nameEn: 'Regular Insulin 40 IU/ml',
    nameMr: 'रेग्युलर इन्सुलिन ४० आय.यू./मि.लि.',
    genericName: 'Recombinant Human Insulin',
    category: 'EMERGENCY',
    form: 'Injection',
    strength: '40 IU/ml (10ml vial)',
    unit: 'Vials',
    program: 'NCD',
    dosageGuidelineEn: 'Subcutaneous injection as directed by medical officer; keep refrigerated',
    dosageGuidelineMr: 'वैद्यकीय अधिकाऱ्यांच्या सल्ल्यानुसार; २-८ अंश सेल्सिअस तापमानात ठेवा',
    coldChain: true,
    minimumStockDefault: 30
  },
  {
    medicineId: 'MED-013',
    nameEn: 'Salbutamol Inhaler (100mcg)',
    nameMr: 'साल्ब्युटामॉल इनहेलर (१०० मायक्रोग्रॅम)',
    genericName: 'Salbutamol Sulphate Metered Dose Inhaler',
    category: 'EMERGENCY',
    form: 'Drops',
    strength: '100 mcg per actuation (200 doses)',
    unit: 'Inhalers',
    program: 'EDL',
    dosageGuidelineEn: '1-2 puffs as required for acute bronchospasm / asthma relief',
    dosageGuidelineMr: 'दम्याचा झटका किंवा श्वास घेण्यास त्रास झाल्यास १ ते २ पफ',
    coldChain: false,
    minimumStockDefault: 50
  },
  {
    medicineId: 'MED-014',
    nameEn: 'Oxytocin 10 IU Injection',
    nameMr: 'ऑक्सिटोसिन १० आय.यू. इंजेक्शन',
    genericName: 'Oxytocin Injection IP',
    category: 'MATERNAL',
    form: 'Injection',
    strength: '10 IU / 1ml ampoule',
    unit: 'Ampoules',
    program: 'JSSK',
    dosageGuidelineEn: 'Active management of third stage of labor and postpartum hemorrhage prevention',
    dosageGuidelineMr: 'प्रसूतीनंतर जास्त रक्तस्त्राव रोखण्यासाठी तातडीने इंजेक्शन',
    coldChain: true,
    minimumStockDefault: 60
  },
  {
    medicineId: 'MED-015',
    nameEn: 'Magnesium Sulphate 50% Injection',
    nameMr: 'मॅग्नेशियम सल्फेट ५०% इंजेक्शन',
    genericName: 'Magnesium Sulphate Injection USP',
    category: 'EMERGENCY',
    form: 'Injection',
    strength: '50% w/v (2ml / 1g)',
    unit: 'Ampoules',
    program: 'PMSMA',
    dosageGuidelineEn: 'Loading dose for eclampsia / severe pre-eclampsia prevention in labor',
    dosageGuidelineMr: 'गरोदरपणातील झटके (एक्लॅम्प्सिया) रोखण्यासाठी तातडीचे इंजेक्शन',
    coldChain: false,
    minimumStockDefault: 40
  },
  {
    medicineId: 'MED-016',
    nameEn: 'Zinc Sulphate 20mg Dispersible',
    nameMr: 'झिंक सल्फेट २० मि.ग्रॅ. विरघळणाऱ्या गोळ्या',
    genericName: 'Zinc Sulphate Monohydrate',
    category: 'ESSENTIAL',
    form: 'Tablet',
    strength: '20 mg',
    unit: 'Tablets',
    program: 'EDL',
    dosageGuidelineEn: '1 dispersible tablet daily for 14 days alongside ORS for pediatric diarrhea',
    dosageGuidelineMr: 'बालकांमधील अतिसारासाठी ओआरएस सोबत सलग १४ दिवस दररोज १ गोळी',
    coldChain: false,
    minimumStockDefault: 400
  },
  {
    medicineId: 'MED-017',
    nameEn: 'Tetanus & Adult Diphtheria (Td) Vaccine',
    nameMr: 'धनुर्वात व घटसर्प (Td) लस',
    genericName: 'Tetanus Toxoid and Diphtheria Toxoid Adsorbed',
    category: 'VACCINE',
    form: 'Injection',
    strength: '0.5 ml dose',
    unit: 'Vials',
    program: 'UIP',
    dosageGuidelineEn: '0.5ml intramuscularly for pregnant women and injury prophylaxis',
    dosageGuidelineMr: 'गरोदर मातांसाठी आणि जखम झाल्यास ०.५ मि.ली. स्नायूमध्ये',
    coldChain: true,
    minimumStockDefault: 80
  },
  {
    medicineId: 'MED-018',
    nameEn: 'Pantoprazole 40mg',
    nameMr: 'पँटोप्राझोल ४० मि.ग्रॅ.',
    genericName: 'Pantoprazole Sodium',
    category: 'ESSENTIAL',
    form: 'Tablet',
    strength: '40 mg',
    unit: 'Tablets',
    program: 'EDL',
    dosageGuidelineEn: '1 tablet once daily morning 30 minutes before breakfast for GERD/gastritis',
    dosageGuidelineMr: 'अ‍ॅसिडिटी किंवा पित्तासाठी सकाळी नाश्त्यापूर्वी ३० मिनिटे १ गोळी',
    coldChain: false,
    minimumStockDefault: 350
  }
];

// Seed Facility Inventory
let stockStore = [
  {
    stockId: 'STK-WAG-001',
    facilityId: 'FAC001',
    facilityName: 'PHC Wagholi',
    facilityType: 'PHC',
    medicineId: 'MED-001',
    quantity: 1450,
    minimumStock: 500,
    batchNumber: 'PCM-2024-B1',
    expiryDate: '2026-11-30',
    status: 'ADEQUATE',
    daysOfSupply: 48
  },
  {
    stockId: 'STK-WAG-002',
    facilityId: 'FAC001',
    facilityName: 'PHC Wagholi',
    facilityType: 'PHC',
    medicineId: 'MED-005',
    quantity: 2100,
    minimumStock: 800,
    batchNumber: 'IFA-2024-M4',
    expiryDate: '2026-08-31',
    status: 'ADEQUATE',
    daysOfSupply: 62
  },
  {
    stockId: 'STK-WAG-003',
    facilityId: 'FAC001',
    facilityName: 'PHC Wagholi',
    facilityType: 'PHC',
    medicineId: 'MED-014',
    quantity: 85,
    minimumStock: 60,
    batchNumber: 'OXY-24-991',
    expiryDate: '2025-12-31',
    status: 'ADEQUATE',
    daysOfSupply: 35
  },
  {
    stockId: 'STK-KHA-001',
    facilityId: 'FAC002',
    facilityName: 'CHC Kharadi',
    facilityType: 'CHC',
    medicineId: 'MED-003',
    quantity: 45,
    minimumStock: 400,
    batchNumber: 'MET-24-002',
    expiryDate: '2025-06-30',
    status: 'CRITICAL',
    daysOfSupply: 3
  },
  {
    stockId: 'STK-KHA-002',
    facilityId: 'FAC002',
    facilityName: 'CHC Kharadi',
    facilityType: 'CHC',
    medicineId: 'MED-012',
    quantity: 0,
    minimumStock: 30,
    batchNumber: 'INS-23-401',
    expiryDate: '2024-12-31',
    status: 'OUT_OF_STOCK',
    daysOfSupply: 0
  },
  {
    stockId: 'STK-LOH-001',
    facilityId: 'FAC003',
    facilityName: 'PHC Lohegaon',
    facilityType: 'PHC',
    medicineId: 'MED-006',
    quantity: 180,
    minimumStock: 250,
    batchNumber: 'ORS-24-81',
    expiryDate: '2026-03-31',
    status: 'LOW',
    daysOfSupply: 9
  },
  {
    stockId: 'STK-SHI-001',
    facilityId: 'FAC004',
    facilityName: 'PHC Shirur',
    facilityType: 'PHC',
    medicineId: 'MED-004',
    quantity: 620,
    minimumStock: 350,
    batchNumber: 'AML-24-118',
    expiryDate: '2026-09-30',
    status: 'ADEQUATE',
    daysOfSupply: 52
  }
];

// Submitted Indents Store
const indentsStore = [];

// SMS Subscriptions Store
const alertSubscriptionsStore = [];

// GET /api/medicines - List all essential medicines with filtering
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let results = [...medicinesStore];

  if (category) {
    results = results.filter((m) => m.category.toUpperCase() === category.toUpperCase());
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (m) =>
        m.nameEn.toLowerCase().includes(q) ||
        m.nameMr.includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.medicineId.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
    medicines: results
  });
});

// GET /api/medicines/stock - Search inventory across facilities
router.get('/stock', (req, res) => {
  const { facilityId, status, medicineId } = req.query;
  let filtered = [...stockStore];

  if (facilityId && facilityId !== 'ALL') {
    filtered = filtered.filter((s) => s.facilityId.toLowerCase() === facilityId.toLowerCase());
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((s) => s.status.toUpperCase() === status.toUpperCase());
  }

  if (medicineId) {
    filtered = filtered.filter((s) => s.medicineId.toLowerCase() === medicineId.toLowerCase());
  }

  res.json({
    success: true,
    facilityId: facilityId || 'ALL',
    count: filtered.length,
    data: filtered,
    stocks: filtered
  });
});

// GET /api/medicines/:id - Retrieve single medicine details
router.get('/:id', (req, res) => {
  const item = medicinesStore.find(
    (m) => m.medicineId.toLowerCase() === req.params.id.toLowerCase()
  );
  if (!item) {
    return res.status(404).json({ success: false, error: 'Medicine not found in state EDL' });
  }
  res.json({ success: true, data: item, medicine: item });
});

// POST /api/medicines/stock/update - Update stock quantity & batch
router.post('/stock/update', (req, res) => {
  const { facilityId, medicineId, quantity, batchNumber, expiryDate, updateType } = req.body || {};

  if (!facilityId || !medicineId || quantity === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required inventory parameters' });
  }

  const existingIdx = stockStore.findIndex(
    (s) =>
      s.facilityId.toLowerCase() === facilityId.toLowerCase() &&
      s.medicineId.toLowerCase() === medicineId.toLowerCase()
  );

  const numQty = Number(quantity);
  const minStock = 100;
  let calculatedStatus = 'ADEQUATE';
  if (numQty === 0) calculatedStatus = 'OUT_OF_STOCK';
  else if (numQty < minStock * 0.25) calculatedStatus = 'CRITICAL';
  else if (numQty < minStock) calculatedStatus = 'LOW';

  const updatedRecord = {
    stockId: existingIdx >= 0 ? stockStore[existingIdx].stockId : `STK-${Date.now()}`,
    facilityId,
    facilityName: existingIdx >= 0 ? stockStore[existingIdx].facilityName : `Facility ${facilityId}`,
    facilityType: existingIdx >= 0 ? stockStore[existingIdx].facilityType : 'PHC',
    medicineId,
    quantity: numQty,
    minimumStock: minStock,
    batchNumber: batchNumber || 'BATCH-MANUAL',
    expiryDate: expiryDate || '2026-12-31',
    status: calculatedStatus,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    stockStore[existingIdx] = { ...stockStore[existingIdx], ...updatedRecord };
  } else {
    stockStore.push(updatedRecord);
  }

  res.json({
    success: true,
    message: 'Stock updated successfully in facility inventory ledger',
    updatedStock: updatedRecord
  });
});

// POST /api/medicines/indent - Dispatch emergency reorder indent to warehouse
router.post('/indent', (req, res) => {
  const { facilityId, items, urgency } = req.body || {};
  if (!facilityId || !items || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ success: false, error: 'Empty or invalid indent requisition' });
  }

  const indentNumber = `IND-2026-MH-${Math.floor(1000 + Math.random() * 9000)}`;
  const record = {
    id: `indent-${Date.now()}`,
    indentNumber,
    facilityId,
    items,
    urgency: urgency || 'STANDARD',
    status: 'SUBMITTED',
    warehouseDestination: 'District Central Medical Store (Aundh, Pune)',
    submittedAt: new Date().toISOString()
  };

  indentsStore.push(record);

  res.status(201).json({
    success: true,
    indentNumber,
    status: 'SUBMITTED',
    warehouseDestination: record.warehouseDestination,
    data: record
  });
});

// POST /api/medicines/subscribe-alert - Patient SMS stock arrival alert
router.post('/subscribe-alert', (req, res) => {
  const { phone, medicineId, facilityId } = req.body || {};
  if (!phone || !medicineId) {
    return res.status(400).json({ success: false, error: 'Phone and medicineId required' });
  }

  const subscription = {
    id: `sub-${Date.now()}`,
    phone: phone.trim(),
    medicineId,
    facilityId: facilityId || 'ALL',
    subscribedAt: new Date().toISOString()
  };
  alertSubscriptionsStore.push(subscription);

  res.json({
    success: true,
    message: 'SMS stock subscription active. You will be notified via SMS upon restock.',
    subscription
  });
});

module.exports = router;
