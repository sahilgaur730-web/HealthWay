import React, { useState } from 'react';
import { 
  Activity, 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Download, 
  Plus, 
  FileText, 
  Search, 
  AlertCircle,
  ShieldCheck,
  Building2,
  ChevronRight,
  Send,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface DiagnosticOrder {
  id: string;
  testNameMr: string;
  testNameEn: string;
  category: 'Hematology' | 'Biochemistry' | 'Radiology' | 'Microbiology';
  prescribedBy: string;
  labFacility: string;
  date: string;
  status: 'pending_collection' | 'sample_collected' | 'processing' | 'completed';
  resultSummaryMr?: string;
  resultSummaryEn?: string;
  barcode: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
}

const INITIAL_DIAGNOSTICS: DiagnosticOrder[] = [
  {
    id: 'DIAG-2024-0089',
    testNameMr: 'हिमोग्लोबिन व संपूर्ण रक्त तपासणी (CBC)',
    testNameEn: 'Complete Blood Count (CBC) & Hemoglobin',
    category: 'Hematology',
    prescribedBy: 'डॉ. मीरा देशमुख (MO, PHC Shirur)',
    labFacility: 'PHC शिरूर पॅथॉलॉजी लॅब',
    date: '१६ जून २०२४',
    status: 'completed',
    resultSummaryMr: 'Hb: 10.2 g/dL (सौम्य अशक्तपणा), प्लेटलेट्स: २.१ लाख/uL, RBC: ४.१ mil/uL',
    resultSummaryEn: 'Hb: 10.2 g/dL (Mild Anemia), Platelets: 2.1 Lakh/uL, RBC: 4.1 mil/uL',
    barcode: 'MH-LAB-849201',
    priority: 'Routine'
  },
  {
    id: 'DIAG-2024-0092',
    testNameMr: 'गर्भावस्थेतील प्रगत सोनोग्राफी (ANC USG Anomaly Scan)',
    testNameEn: 'Obstetric Anomaly Ultrasound Scan (20-22 Wks)',
    category: 'Radiology',
    prescribedBy: 'डॉ. मीरा देशमुख (MO, PHC Shirur)',
    labFacility: 'जिल्हा रुग्णालय पुणे (औंध) रेडिओलॉजी विभाग',
    date: '१० मे २०२४',
    status: 'completed',
    resultSummaryMr: 'एकल जिवंत गर्भ, वय २२ आठवडे, गर्भजल प्रमाण सामान्य, प्लेसेंटा फंडाल',
    resultSummaryEn: 'Single live fetus, gestational age 22 weeks, normal liquor index, no anomalies seen',
    barcode: 'MH-RAD-394012',
    priority: 'Urgent'
  },
  {
    id: 'DIAG-2024-0104',
    testNameMr: 'रक्तातील साखर उपाशीपोटी व जेवणानंतर (FBS & PPBS)',
    testNameEn: 'Fasting & Post-Prandial Blood Sugar (FBS/PPBS)',
    category: 'Biochemistry',
    prescribedBy: 'डॉ. राजेश कदम (PHC Shirur)',
    labFacility: 'उपकेंद्र वडगाव डिजिटल पॉईंट-ऑफ-केअर किट',
    date: '२२ जून २०२४',
    status: 'processing',
    barcode: 'MH-LAB-992014',
    priority: 'Routine'
  },
  {
    id: 'DIAG-2024-0118',
    testNameMr: 'थायरॉईड प्रोफाईल तपासणी (TSH, Free T3, Free T4)',
    testNameEn: 'Thyroid Stimulating Hormone (TSH Profile)',
    category: 'Biochemistry',
    prescribedBy: 'डॉ. मीरा देशमुख (PHC Shirur)',
    labFacility: 'जिल्हा मध्यवर्ती लॅब, पुणे',
    date: '२४ जून २०२४',
    status: 'sample_collected',
    barcode: 'MH-LAB-110293',
    priority: 'Routine'
  }
];

const NEARBY_LABS = [
  {
    id: 'lab-shirur',
    nameMr: 'PHC शिरूर क्लिनिकल पॅथॉलॉजी लॅब',
    nameEn: 'PHC Shirur Clinical Pathology Lab',
    type: 'Primary Health Centre Lab',
    distance: '२.४ किमी',
    testsAvailable: 'CBC, Malaria, Dengue, Urine Routine, Blood Sugar, Widal',
    status: 'Open · Equipment Calibrated'
  },
  {
    id: 'lab-pune-dh',
    nameMr: 'जिल्हा रुग्णालय पुणे मध्यवर्ती निदान केंद्र',
    nameEn: 'District Hospital Pune Central Diagnostics & Imaging',
    type: 'District Tertiary Laboratory',
    distance: '४२ किमी (Connected via Digital Requisition)',
    testsAvailable: 'Histopathology, Culture & Sensitivity, USG, Digital X-Ray, CT Scan',
    status: '24x7 NABL Accredited'
  },
  {
    id: 'lab-sc-vadgaon',
    nameMr: 'उपकेंद्र वडगाव त्वरित निदान केंद्र (PoCT)',
    nameEn: 'Sub-Centre Vadgaon Point-of-Care Diagnostic Kit',
    type: 'Sub-Centre Frontline Testing',
    distance: 'स्थानिक गाव केंद्र (०.५ किमी)',
    testsAvailable: 'Digital Hemoglobinometer, Blood Glucose, Urine Protein, Rapid Pregnancy Test',
    status: 'ASHA Operated · Active'
  }
];

interface Props {
  allowOrdering?: boolean;
}

export default function DiagnosticCoordinationView({ allowOrdering = false }: Props) {
  const { lang } = useLanguage();
  const [orders, setOrders] = useState<DiagnosticOrder[]>(INITIAL_DIAGNOSTICS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // New Order Form state
  const [newTestName, setNewTestName] = useState('संपूर्ण रक्त तपासणी (CBC)');
  const [newCategory, setNewCategory] = useState<'Hematology' | 'Biochemistry' | 'Radiology' | 'Microbiology'>('Hematology');
  const [newLab, setNewLab] = useState('PHC शिरूर क्लिनिकल पॅथॉलॉजी लॅब');
  const [newPriority, setNewPriority] = useState<'Routine' | 'Urgent' | 'STAT'>('Routine');

  const filteredOrders = orders.filter(o => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'completed' ? o.status === 'completed' :
      o.status !== 'completed';

    const matchesSearch = 
      searchQuery.trim() === '' ||
      o.testNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.testNameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.barcode.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: DiagnosticOrder = {
      id: `DIAG-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      testNameMr: newTestName,
      testNameEn: newTestName,
      category: newCategory,
      prescribedBy: 'डॉ. मीरा देशमुख (PHC Shirur)',
      labFacility: newLab,
      date: 'आज (Today)',
      status: 'pending_collection',
      barcode: `MH-LAB-${Math.floor(100000 + Math.random() * 900000)}`,
      priority: newPriority
    };
    setOrders([newOrder, ...orders]);
    setIsOrderModalOpen(false);
  };

  const getStatusBadge = (status: DiagnosticOrder['status']) => {
    switch(status) {
      case 'completed':
        return {
          labelMr: 'अहवाल पूर्ण (Ready in EHR)',
          labelEn: 'Completed & Synced',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
      case 'processing':
        return {
          labelMr: 'लॅबमध्ये तपासणी सुरू',
          labelEn: 'Processing at Lab',
          color: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      case 'sample_collected':
        return {
          labelMr: 'नमुना गोळा केला',
          labelEn: 'Sample Collected',
          color: 'bg-purple-100 text-purple-800 border-purple-300'
        };
      default:
        return {
          labelMr: 'नमुना संकलन प्रलंबित',
          labelEn: 'Pending Collection',
          color: 'bg-amber-100 text-amber-800 border-amber-300'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Demand 6 Context Header */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'डिजिटल निदान व लॅब समन्वय कक्ष' : 'Diagnostic Coordination & Lab Orders'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1A4B8C] border border-blue-200 uppercase">
                Demand 6
              </span>
            </div>
            <p className="text-xs text-[#546E7A] mt-1">
              {lang === 'mr'
                ? 'जवळील लॅब नेटवर्क, डिजिटल टेस्ट ऑर्डरिंग आणि ABHA रेकॉर्डमध्ये स्वयंचलित अहवाल समक्रमण'
                : 'Automated test requisition, barcode sample tracking, and direct result synchronization to patient ABHA records'}
            </p>
          </div>
        </div>

        {allowOrdering && (
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'mr' ? 'नवीन लॅब टेस्ट ऑर्डर करा' : 'Prescribe Lab Test'}</span>
          </button>
        )}
      </div>

      {/* 2. Nearby Diagnostic Centres Directory */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1C2B3A] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1A4B8C]" />
            <span>
              {lang === 'mr' ? 'क्षेत्रातील अधिकृत सरकारी लॅब व निदान केंद्रे' : 'Accredited Government Diagnostic Facilities'}
            </span>
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {NEARBY_LABS.length} Facilities Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {NEARBY_LABS.map(lab => (
            <div key={lab.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-[#1C2B3A] leading-snug">
                  {lang === 'mr' ? lab.nameMr : lab.nameEn}
                </h4>
                <span className="text-[10px] font-bold text-[#1A4B8C] bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                  {lab.distance}
                </span>
              </div>
              <p className="text-[11px] text-[#546E7A]">
                <strong className="text-slate-700">Tests:</strong> {lab.testsAvailable}
              </p>
              <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{lab.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Diagnostic Orders List & Filters */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'all' ? 'bg-white text-[#1A4B8C] shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
              }`}
            >
              {lang === 'mr' ? 'सर्व तपासण्या' : 'All Orders'} ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
              }`}
            >
              {lang === 'mr' ? 'प्रलंबित' : 'In Progress / Pending'} ({orders.filter(o => o.status !== 'completed').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'completed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
              }`}
            >
              {lang === 'mr' ? 'पूर्ण अहवाल' : 'Completed'} ({orders.filter(o => o.status === 'completed').length})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'तपासणी नाव किंवा बारकोड...' : 'Search test or barcode...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-300 text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
            />
          </div>
        </div>

        {/* Orders Table / Cards */}
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const badge = getStatusBadge(order.status);
            return (
              <div 
                key={order.id} 
                className="p-4 rounded-xl border border-[#CFD8DC] hover:border-[#1A4B8C] transition bg-white space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1A4B8C] flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                      {order.category.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#1C2B3A]">
                          {lang === 'mr' ? order.testNameMr : order.testNameEn}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                          {lang === 'mr' ? badge.labelMr : badge.labelEn}
                        </span>
                        {order.priority === 'Urgent' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#546E7A] mt-0.5">
                        {order.prescribedBy} · {order.labFacility} · <span className="font-mono">{order.date}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {order.barcode}
                    </span>
                    {order.status === 'completed' && (
                      <button 
                        onClick={() => alert(`Downloading Verified ABHA Diagnostic Report: ${order.barcode}`)}
                        className="p-1.5 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] hover:bg-blue-100 transition"
                        title="Download Verified Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Test Result summary if completed */}
                {order.resultSummaryEn && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        {lang === 'mr' ? 'तपासणी निष्कर्ष (Verified by Pathologist):' : 'Diagnostic Findings (NABL Verified):'}
                      </span>
                      <p className="text-[11px] text-emerald-900 mt-0.5">
                        {lang === 'mr' ? order.resultSummaryMr : order.resultSummaryEn}
                      </p>
                    </div>
                  </div>
                )}

                {/* Progress bar for ongoing test */}
                {order.status !== 'completed' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#546E7A]">
                    <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>
                        {order.status === 'pending_collection' ? (lang === 'mr' ? 'रुग्ण नमुना संकलनासाठी लॅबमध्ये अपेक्षित आहे' : 'Sample collection scheduled at PHC') :
                         order.status === 'sample_collected' ? (lang === 'mr' ? 'नमुना लॅबकडे वाहतुकीत आहे' : 'Sample en-route to central lab') :
                         (lang === 'mr' ? 'अंतिम अहवाल तयार होत आहे' : 'Biochemical analyzer run in progress')}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ABDM FHIR Sync: Auto
                    </span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Prescribe Lab Test Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#CFD8DC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-[#1A4B8C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  {lang === 'mr' ? 'नवीन डिजिटल लॅब ऑर्डर सादर करा' : 'Prescribe Digital Diagnostic Test'}
                </h3>
              </div>
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                  {lang === 'mr' ? 'तपासणीचे नाव' : 'Diagnostic Test Name'}
                </label>
                <select
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFD8DC] text-xs focus:ring-2 focus:ring-[#1A4B8C]"
                >
                  <option value="संपूर्ण रक्त तपासणी (CBC)">Complete Blood Count (CBC)</option>
                  <option value="रक्तातील साखर (FBS & PPBS)">Blood Sugar (Fasting & PPBS)</option>
                  <option value="थायरॉईड प्रोफाईल (TSH, T3, T4)">Thyroid Profile (TSH, T3, T4)</option>
                  <option value="प्रसूतीपूर्व सोनोग्राफी (Obstetric USG)">Obstetric USG Scan</option>
                  <option value="क्षयरोग थुंकी तपासणी (Sputum AFB/CBNAAT)">Tuberculosis Sputum CBNAAT</option>
                  <option value="लिव्हर फंक्शन टेस्ट (LFT)">Liver Function Test (LFT)</option>
                  <option value="युरिन रुटीन व मायक्रोस्कोपी">Urine Routine & Microscopic</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                    {lang === 'mr' ? 'विभाग' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CFD8DC] text-xs"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Microbiology">Microbiology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                    {lang === 'mr' ? 'प्राधान्यता' : 'Priority'}
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CFD8DC] text-xs"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C2B3A] mb-1">
                  {lang === 'mr' ? 'निदान केंद्र / लॅब निवडा' : 'Target Laboratory Facility'}
                </label>
                <select
                  value={newLab}
                  onChange={(e) => setNewLab(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CFD8DC] text-xs"
                >
                  <option value="PHC शिरूर क्लिनिकल पॅथॉलॉजी लॅब">PHC Shirur Clinical Pathology Lab</option>
                  <option value="जिल्हा रुग्णालय पुणे मध्यवर्ती निदान केंद्र">District Hospital Pune Central Lab</option>
                  <option value="उपकेंद्र वडगाव त्वरित निदान केंद्र (PoCT)">Sub-Centre Vadgaon PoCT Unit</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#CFD8DC] text-xs font-bold text-[#546E7A] hover:bg-slate-50"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A4B8C] text-white text-xs font-bold hover:bg-[#0D3470] flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'ऑर्डर पाठवा' : 'Transmit Lab Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
