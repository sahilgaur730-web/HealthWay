import React, { useState } from 'react';
import { 
  FlaskConical, 
  Search, 
  Plus, 
  Check, 
  X, 
  Clock, 
  Send, 
  Building2, 
  User, 
  Home, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  diagnosticService, 
  CatalogTestItem, 
  TestPriority, 
  SampleCollectionMethod, 
  DiagnosticCategory, 
  TestOrderItem 
} from '../../services/diagnosticService';
import { smsService } from '../../services/smsService';
import { VILLAGE_PATIENTS_REGISTRY } from '../../data/mockData';

interface CreateTestOrderProps {
  onClose: () => void;
  onOrderCreated: (newOrder: TestOrderItem) => void;
  preselectedPatientId?: string;
  preselectedLabId?: string;
}

export default function CreateTestOrder({
  onClose,
  onOrderCreated,
  preselectedPatientId,
  preselectedLabId
}: CreateTestOrderProps) {
  const { lang } = useLanguage();
  const allTests = diagnosticService.getAvailableTests();
  const allLabs = diagnosticService.getNearbyLabs();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatientId || VILLAGE_PATIENTS_REGISTRY[0].id
  );
  const [selectedLabId, setSelectedLabId] = useState<string>(
    preselectedLabId || allLabs[0].id
  );
  const [priority, setPriority] = useState<TestPriority>('ROUTINE');
  const [collectionMethod, setCollectionMethod] = useState<SampleCollectionMethod>('VISIT_LAB');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Test Selection
  const [selectedCategory, setSelectedCategory] = useState<DiagnosticCategory | 'ALL'>('ALL');
  const [searchTest, setSearchTest] = useState('');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([allTests[0].id]);

  const selectedPatient = VILLAGE_PATIENTS_REGISTRY.find(p => p.id === selectedPatientId) || VILLAGE_PATIENTS_REGISTRY[0];
  const selectedLab = allLabs.find(l => l.id === selectedLabId) || allLabs[0];

  const filteredTests = allTests.filter(t => {
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const q = searchTest.toLowerCase().trim();
    const matchesSearch = 
      q === '' ||
      t.nameMr.toLowerCase().includes(q) ||
      t.nameEn.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const toggleTest = (testId: string) => {
    if (selectedTestIds.includes(testId)) {
      if (selectedTestIds.length === 1) {
        alert(lang === 'mr' ? 'किमान एक तपासणी निवडणे आवश्यक आहे.' : 'At least one test must be selected.');
        return;
      }
      setSelectedTestIds(selectedTestIds.filter(id => id !== testId));
    } else {
      setSelectedTestIds([...selectedTestIds, testId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const chosenTests = allTests.filter(t => selectedTestIds.includes(t.id));

    const order = diagnosticService.createTestOrder({
      patientId: selectedPatient.id,
      patientNameMr: selectedPatient.nameMr,
      patientNameEn: selectedPatient.nameEn,
      patientPhone: selectedPatient.phone,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      abhaId: selectedPatient.abhaId,

      prescribedByDoctorMr: 'डॉ. मीरा देशमुख (वैद्यकीय अधिकारी, PHC शिरूर)',
      prescribedByDoctorEn: 'Dr. Meera Deshmukh (Medical Officer, PHC Shirur)',
      facilityMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
      facilityEn: 'PHC Shirur',

      targetLabId: selectedLab.id,
      targetLabNameMr: selectedLab.nameMr,
      targetLabNameEn: selectedLab.nameEn,

      tests: chosenTests,
      priority,
      collectionMethod,
      clinicalNotes: clinicalNotes || 'नैमित्तिक तपासणी व पुढील उपचार सल्ला',
    });

    // Notify patient via SMS
    smsService.sendTestReadySms(
      selectedPatient.phone,
      selectedPatient.nameMr,
      chosenTests.map(t => t.code).join(', '),
      order.barcode,
      lang === 'mr' ? 'mr' : 'en'
    );

    onOrderCreated(order);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#CFD8DC] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1A4B8C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {lang === 'mr' ? 'नवीन डिजिटल लॅब टेस्ट ऑर्डर (४०+ चाचण्या)' : 'Prescribe Digital Lab Test Order (40+ Catalog)'}
              </h3>
              <p className="text-[11px] text-blue-100">
                {lang === 'mr' ? 'स्वयंचलित बारकोड, नमुना पद्धती व ABHA एकत्रीकरण' : 'Automated barcode assignment, collection method & ABHA sync'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Patient Selection & Target Lab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#1C2B3A] mb-1">
                {lang === 'mr' ? 'रुग्ण निवडा (Patient Registry)' : 'Select Patient'}
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 border border-[#CFD8DC] rounded-xl bg-white font-semibold text-xs"
              >
                {VILLAGE_PATIENTS_REGISTRY.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nameMr} ({p.nameEn}) · ABHA: {p.abhaId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#1C2B3A] mb-1">
                {lang === 'mr' ? 'तपासणी लॅब / केंद्र (Laboratory)' : 'Target Laboratory Facility'}
              </label>
              <select
                value={selectedLabId}
                onChange={(e) => setSelectedLabId(e.target.value)}
                className="w-full p-2.5 border border-[#CFD8DC] rounded-xl bg-white font-semibold text-xs"
              >
                {allLabs.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.nameMr} ({l.distanceKm} km · {l.turnaroundTimeLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Levels & Collection Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            {/* Priority */}
            <div>
              <label className="block font-bold text-[#1C2B3A] mb-1.5">
                {lang === 'mr' ? 'प्राधान्यता स्तर (Priority SLA)' : 'Priority SLA Level'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['STAT', 'URGENT', 'ROUTINE'] as TestPriority[]).map((p) => {
                  const isSel = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-2 px-2 rounded-xl text-center font-bold text-xs border transition ${
                        isSel
                          ? p === 'STAT' ? 'bg-red-600 text-white border-red-700' :
                            p === 'URGENT' ? 'bg-amber-600 text-white border-amber-700' :
                            'bg-[#1A4B8C] text-white border-[#1A4B8C]'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>{p}</div>
                      <div className="text-[9px] font-normal opacity-90">
                        {p === 'STAT' ? '<2h' : p === 'URGENT' ? '<6h' : '24-48h'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collection Method */}
            <div>
              <label className="block font-bold text-[#1C2B3A] mb-1.5">
                {lang === 'mr' ? 'नमुना संकलन पद्धत (Sample Collection)' : 'Collection Method'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'VISIT_LAB', labelMr: 'लॅब भेट', labelEn: 'Visit Lab' },
                  { key: 'HOME_COLLECTION', labelMr: 'घरपोच', labelEn: 'Home Coll.' },
                  { key: 'AT_FACILITY', labelMr: 'आरोग्य केंद्र', labelEn: 'At Facility' },
                ].map(m => {
                  const isSel = collectionMethod === m.key;
                  return (
                    <button
                      type="button"
                      key={m.key}
                      onClick={() => setCollectionMethod(m.key as any)}
                      className={`py-2 px-1.5 rounded-xl text-center font-bold text-[11px] border transition ${
                        isSel 
                          ? 'bg-[#1A4B8C] text-white border-[#1A4B8C]' 
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'mr' ? m.labelMr : m.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 40+ Tests Multi-Select Catalog */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold text-[#1C2B3A] flex items-center gap-1.5">
                <span>{lang === 'mr' ? 'तपासण्या निवडा (Select Tests)' : 'Select Diagnostic Tests'}</span>
                <span className="text-[11px] font-mono text-[#1A4B8C] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {selectedTestIds.length} {lang === 'mr' ? 'निवडल्या' : 'Selected'}
                </span>
              </label>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={lang === 'mr' ? 'तपासणी नाव किंवा कोड शोधा...' : 'Search test name/code...'}
                  value={searchTest}
                  onChange={(e) => setSearchTest(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs w-56"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { key: 'ALL', labelMr: 'सर्व (All)', labelEn: 'All (40+)' },
                { key: 'Hematology', labelMr: 'रक्त (Blood)', labelEn: 'Hematology' },
                { key: 'Biochemistry', labelMr: 'बायोकेम (Biochem)', labelEn: 'Biochemistry' },
                { key: 'Urine', labelMr: 'लघवी (Urine)', labelEn: 'Urine & Stool' },
                { key: 'Microbiology', labelMr: 'मायक्रोबायो (Micro)', labelEn: 'Microbiology' },
                { key: 'Radiology', labelMr: 'इमेजिंग (Imaging)', labelEn: 'Radiology' },
              ].map(cat => (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                    selectedCategory === cat.key 
                      ? 'bg-[#1A4B8C] text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'mr' ? cat.labelMr : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Tests Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-[#CFD8DC] p-2.5 rounded-xl bg-slate-50/50">
              {filteredTests.map(test => {
                const isChecked = selectedTestIds.includes(test.id);
                return (
                  <div
                    key={test.id}
                    onClick={() => toggleTest(test.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start justify-between gap-2 ${
                      isChecked 
                        ? 'bg-blue-50/80 border-[#1A4B8C] ring-1 ring-[#1A4B8C]' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {test.code}
                        </span>
                        <h5 className="font-bold text-xs text-[#1C2B3A] line-clamp-1">
                          {lang === 'mr' ? test.nameMr : test.nameEn}
                        </h5>
                      </div>
                      <div className="text-[10px] text-[#546E7A] flex items-center gap-2">
                        <span>{test.sampleType}</span> ·
                        <span>TAT: {test.tatHours}h</span>
                        {test.fastingRequired && (
                          <span className="text-amber-700 font-semibold">(Fasting Req)</span>
                        )}
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                      isChecked ? 'bg-[#1A4B8C] text-white border-[#1A4B8C]' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Notes & Indications */}
          <div>
            <label className="block font-bold text-[#1C2B3A] mb-1">
              {lang === 'mr' ? 'क्लिनिकल इंडिकेशन व डॉक्टरांच्या सूचना (Clinical Notes)' : 'Clinical Indications & Prescribing Notes'}
            </label>
            <textarea
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="उदा. प्रसूतीपूर्व नियमित तपासणी, रक्तातील साखर तपासणी किंवा संशयित संसर्ग..."
              className="w-full p-2.5 border border-[#CFD8DC] rounded-xl text-xs focus:ring-2 focus:ring-[#1A4B8C]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#CFD8DC] text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'डिजिटल लॅब ऑर्डर पाठवा' : 'Transmit Test Order'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
