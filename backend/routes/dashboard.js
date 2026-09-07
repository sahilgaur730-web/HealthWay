/**
 * District Facility Dashboard API Routes (Express Router Spec)
 * Strictly zero unicode emojis.
 */

const express = require('express');
const router = express.Router();

// Mock initial facilities state
const facilitiesStore = [
  {
    id: 'FAC001',
    name: 'PHC Wagholi',
    nameMr: 'प्रा. आ. केंद्र वाघोली',
    type: 'PHC',
    block: 'Haveli',
    blockMr: 'हवेली',
    inCharge: 'Dr. Priya Sharma',
    inChargeMr: 'डॉ. प्रिया शर्मा',
    inChargeRole: 'Medical Officer Gr. 1',
    phone: '020-27051234',
    coordinates: { lat: 18.5614, lng: 73.9838 },
    staffTotal: 12,
    staffPresent: 11,
    metrics: {
      consultationsToday: 47,
      consultationsTarget: 50,
      consultationsMonth: 1240,
      referralsSent: 8,
      referralsCompleted: 7,
      medicinesOutOfStock: 1,
      highRiskPatients: 34,
      overdueFollowUps: 3,
      deliveries: 3,
      vaccinationsToday: 12,
      tbPatientsActive: 8,
      tbCompliance: 61
    },
    performance: { score: 88, trend: '+3', lastMonth: 85 },
    alerts: [],
    lastDataSync: new Date().toISOString()
  },
  {
    id: 'FAC002',
    name: 'CHC Kharadi',
    nameMr: 'समुदाय आ. केंद्र खराडी',
    type: 'CHC',
    block: 'Haveli',
    blockMr: 'हवेली',
    inCharge: 'Dr. Rahul Desai',
    inChargeMr: 'डॉ. राहुल देसाई',
    inChargeRole: 'Medical Superintendent',
    phone: '020-27051111',
    coordinates: { lat: 18.5562, lng: 73.9432 },
    staffTotal: 28,
    staffPresent: 18,
    metrics: {
      consultationsToday: 85,
      consultationsTarget: 150,
      consultationsMonth: 2890,
      referralsSent: 23,
      referralsCompleted: 14,
      medicinesOutOfStock: 7,
      highRiskPatients: 89,
      overdueFollowUps: 47,
      deliveries: 8,
      vaccinationsToday: 28,
      tbPatientsActive: 19,
      tbCompliance: 56
    },
    performance: { score: 52, trend: '-8', lastMonth: 60 },
    alerts: [
      {
        id: 'alt-fac2-1',
        type: 'CRITICAL',
        category: 'medicine',
        messageEn: '7 essential medicines out of stock',
        messageMr: '७ अत्यावश्यक औषधांचा साठा संपला'
      },
      {
        id: 'alt-fac2-2',
        type: 'WARNING',
        category: 'staff',
        messageEn: 'Staff attendance below 70% (18/28 present)',
        messageMr: 'कर्मचारी उपस्थिती ७०% पेक्षा कमी'
      }
    ],
    lastDataSync: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'FAC003',
    name: 'PHC Lohegaon',
    nameMr: 'प्रा. आ. केंद्र लोहगाव',
    type: 'PHC',
    block: 'Haveli',
    blockMr: 'हवेली',
    inCharge: 'Dr. Amit Kulkarni',
    inChargeMr: 'डॉ. अमित कुलकर्णी',
    inChargeRole: 'Medical Officer Gr. 1',
    phone: '020-27051456',
    coordinates: { lat: 18.5889, lng: 73.9121 },
    staffTotal: 10,
    staffPresent: 10,
    metrics: {
      consultationsToday: 50,
      consultationsTarget: 50,
      consultationsMonth: 1380,
      referralsSent: 5,
      referralsCompleted: 5,
      medicinesOutOfStock: 0,
      highRiskPatients: 28,
      overdueFollowUps: 0,
      deliveries: 2,
      vaccinationsToday: 18,
      tbPatientsActive: 5,
      tbCompliance: 60
    },
    performance: { score: 96, trend: '+6', lastMonth: 90 },
    alerts: [],
    lastDataSync: new Date().toISOString()
  },
  {
    id: 'FAC004',
    name: 'SC Bhosari',
    nameMr: 'उपकेंद्र भोसरी',
    type: 'SC',
    block: 'Pimpri-Chinchwad',
    blockMr: 'पिंपरी-चिंचवड',
    inCharge: 'ANM Sunita Borde',
    inChargeMr: 'ए.एन.एम. सुनिता बोर्डे',
    inChargeRole: 'Auxiliary Nurse Midwife',
    phone: '020-27051789',
    coordinates: { lat: 18.6298, lng: 73.8567 },
    staffTotal: 3,
    staffPresent: 1,
    metrics: {
      consultationsToday: 6,
      consultationsTarget: 30,
      consultationsMonth: 234,
      referralsSent: 2,
      referralsCompleted: 1,
      medicinesOutOfStock: 9,
      highRiskPatients: 12,
      overdueFollowUps: 9,
      deliveries: 0,
      vaccinationsToday: 2,
      tbPatientsActive: 2,
      tbCompliance: 41
    },
    performance: { score: 28, trend: '-15', lastMonth: 43 },
    alerts: [
      {
        id: 'alt-fac4-1',
        type: 'CRITICAL',
        category: 'staff',
        messageEn: 'Severe Staff Deficit: Only 1/3 staff present',
        messageMr: 'गंभीर कर्मचारी कमतरता: ३ पैकी फक्त १ कर्मचारी उपस्थित'
      },
      {
        id: 'alt-fac4-2',
        type: 'CRITICAL',
        category: 'medicine',
        messageEn: '9 critical medicines out of stock',
        messageMr: '९ अत्यावश्यक औषधांचा साठा संपला'
      }
    ],
    lastDataSync: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'FAC005',
    name: 'District Hospital Pune',
    nameMr: 'जिल्हा रुग्णालय पुणे',
    type: 'DH',
    block: 'Pune City',
    blockMr: 'पुणे शहर',
    inCharge: 'Dr. Sunita Patel',
    inChargeMr: 'डॉ. सुनिता पटेल',
    inChargeRole: 'Civil Surgeon',
    phone: '020-26059999',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    staffTotal: 312,
    staffPresent: 275,
    metrics: {
      consultationsToday: 800,
      consultationsTarget: 800,
      consultationsMonth: 21480,
      referralsSent: 34,
      referralsCompleted: 31,
      medicinesOutOfStock: 6,
      highRiskPatients: 234,
      overdueFollowUps: 24,
      deliveries: 14,
      vaccinationsToday: 87,
      tbPatientsActive: 89,
      tbCompliance: 92
    },
    performance: { score: 82, trend: '+2', lastMonth: 80 },
    alerts: [
      {
        id: 'alt-fac5-1',
        type: 'INFO',
        category: 'medicine',
        messageEn: '3 specialized drugs nearing threshold buffer',
        messageMr: '३ औषधांचा साठा किमान मर्यादेजवळ'
      }
    ],
    lastDataSync: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'FAC006',
    name: 'SC Vadgaon',
    nameMr: 'उपकेंद्र वडगाव',
    type: 'SC',
    block: 'Khed',
    blockMr: 'खेड',
    inCharge: 'ANM Meena Jadhav',
    inChargeMr: 'ए.एन.एम. मीना जाधव',
    inChargeRole: 'Auxiliary Nurse Midwife',
    phone: '02135-224110',
    coordinates: { lat: 18.8156, lng: 73.8821 },
    staffTotal: 2,
    staffPresent: 2,
    metrics: {
      consultationsToday: 22,
      consultationsTarget: 25,
      consultationsMonth: 580,
      referralsSent: 3,
      referralsCompleted: 3,
      medicinesOutOfStock: 1,
      highRiskPatients: 16,
      overdueFollowUps: 1,
      deliveries: 1,
      vaccinationsToday: 9,
      tbPatientsActive: 3,
      tbCompliance: 90
    },
    performance: { score: 84, trend: '+4', lastMonth: 80 },
    alerts: [],
    lastDataSync: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'FAC007',
    name: 'RH Khed',
    nameMr: 'ग्रामीण रुग्णालय खेड (राजगुरुनगर)',
    type: 'SDH',
    block: 'Khed',
    blockMr: 'खेड',
    inCharge: 'Dr. Sanjay Shinde',
    inChargeMr: 'डॉ. संजय शिंदे',
    inChargeRole: 'Medical Superintendent',
    phone: '02135-222340',
    coordinates: { lat: 18.8450, lng: 73.8920 },
    staffTotal: 25,
    staffPresent: 22,
    metrics: {
      consultationsToday: 94,
      consultationsTarget: 100,
      consultationsMonth: 2410,
      referralsSent: 14,
      referralsCompleted: 12,
      medicinesOutOfStock: 1,
      highRiskPatients: 46,
      overdueFollowUps: 4,
      deliveries: 6,
      vaccinationsToday: 24,
      tbPatientsActive: 12,
      tbCompliance: 88
    },
    performance: { score: 79, trend: '+1', lastMonth: 78 },
    alerts: [
      {
        id: 'alt-fac7-1',
        type: 'INFO',
        category: 'performance',
        messageEn: 'Vaccination drive target reached for current week',
        messageMr: 'चालू आठवड्यासाठी लसीकरण मोहिमेचे उद्दिष्ट पूर्ण झाले'
      }
    ],
    lastDataSync: new Date(Date.now() - 110 * 60 * 1000).toISOString()
  }
];

// GET /api/dashboard/district - Complete district overview
router.get('/district', (req, res) => {
  res.json({
    success: true,
    district: {
      name: 'Pune District',
      nameMr: 'पुणे जिल्हा',
      state: 'Maharashtra',
      stateMr: 'महाराष्ट्र',
      population: 9429408,
      blocks: 13,
      totalFacilities: 847,
      officerInCharge: 'Dr. Bhagwan Pawar',
      officerRole: 'District Health Officer (DHO)'
    },
    summary: {
      totalPatients: 142847,
      consultationsToday: 3421,
      consultationsThisMonth: 89234,
      activeReferrals: 234,
      pendingReferrals: 67,
      medicinesOutOfStock: 23,
      highRiskPatients: 1847,
      overdueFollowUps: 312,
      staffPresent: 2847,
      staffTotal: 3120,
      attendanceRate: 91.3
    },
    facilities: facilitiesStore,
    trends: {
      consultations: [
        { date: '25 Nov', value: 3120, target: 3000 },
        { date: '26 Nov', value: 3456, target: 3000 },
        { date: '27 Nov', value: 2890, target: 3000 },
        { date: '28 Nov', value: 3234, target: 3000 },
        { date: '29 Nov', value: 3678, target: 3000 },
        { date: '30 Nov', value: 3421, target: 3000 }
      ],
      referrals: [65, 78, 56, 89, 72, 67],
      stockAlerts: [12, 18, 15, 22, 19, 23]
    }
  });
});

// GET /api/dashboard/facility/:id - Individual facility operational view
router.get('/facility/:id', (req, res) => {
  const facility = facilitiesStore.find((f) => f.id === req.params.id);
  if (!facility) {
    return res.status(404).json({ success: false, error: 'Facility not found' });
  }
  res.json({
    success: true,
    facility
  });
});

// POST /api/dashboard/facility/:id/action - Trigger direct intervention
router.post('/facility/:id/action', (req, res) => {
  const { actionType, notes } = req.body;
  const facilityId = req.params.id;
  const actionId = `ACT-MH-${Date.now().toString(36).toUpperCase()}`;

  res.json({
    success: true,
    actionId,
    facilityId,
    actionType,
    status: 'DISPATCHED',
    messageEn: `Action ${actionType} successfully registered with identifier ${actionId}.`,
    messageMr: `कारवाई ${actionType} ओळख क्रमांक ${actionId} सह यशस्वीपणे नोंदवली.`
  });
});

module.exports = router;
