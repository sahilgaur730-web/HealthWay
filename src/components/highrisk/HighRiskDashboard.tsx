import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Search, 
  Filter, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  HeartPulse, 
  Baby, 
  Activity, 
  PhoneCall, 
  Send, 
  Plus, 
  FileText, 
  BarChart3, 
  Calendar,
  Building2,
  ChevronRight,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  RiskEngineService, 
  HighRiskPatient, 
  ClinicalRiskCategory, 
  RiskUrgencyTier 
} from '../../services/riskEngine';
import ASHAWorkerView from './ASHAWorkerView';
import RiskFlagForm from './RiskFlagForm';
import RiskAnalytics from './RiskAnalytics';

export default function HighRiskDashboard() {
  const { lang } = useLanguage();

  const [activeTab, setActiveTab] = useState<'surveillance' | 'asha_schedule' | 'flag_new' | 'analytics'>('surveillance');
  const [patients, setPatients] = useState<HighRiskPatient[]>(() => RiskEngineService.getPatients());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifiedPatientId, setNotifiedPatientId] = useState<string | null>(null);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<HighRiskPatient | null>(null);

  const refreshData = () => {
    setPatients(RiskEngineService.getPatients());
  };

  const handleNotifyAsha = (patientId: string) => {
    setNotifiedPatientId(patientId);
    setTimeout(() => setNotifiedPatientId(null), 3000);
  };

  const categories = [
    { id: 'ALL', mr: 'सर्व जोखीम प्रवर्ग', en: 'All Categories' },
    { id: 'PREGNANT', mr: 'गर्भवती माता (ANC)', en: 'High-Risk ANC' },
    { id: 'NEWBORN', mr: 'नवजात व कमी वजन', en: 'High-Risk Infant' },
    { id: 'DIABETES', mr: 'मधुमेह (NCD)', en: 'Diabetes' },
    { id: 'HYPERTENSION', mr: 'रक्तदाब (HTN)', en: 'Hypertension' },
    { id: 'TUBERCULOSIS', mr: 'क्षयरोग (TB DOTS)', en: 'TB DOTS' },
    { id: 'MENTAL_HEALTH', mr: 'मानसोपचार (Mental)', en: 'Mental Health' },
    { id: 'MALNUTRITION', mr: 'कुपोषण (SAM)', en: 'Malnutrition' },
  ];

  const urgencyFilters = [
    { id: 'ALL', mr: 'सर्व', en: 'All' },
    { id: 'OVERDUE', mr: 'थकीत (Overdue)', en: 'Overdue' },
    { id: 'DUE_TODAY', mr: 'आज देय (Due Today)', en: 'Due Today' },
    { id: 'DUE_SOON', mr: 'लवकर (१-३ दिवस)', en: 'Due Soon' },
    { id: 'DUE_WEEK', mr: 'या आठवड्यात', en: 'This Week' },
    { id: 'ON_TRACK', mr: 'ट्रॅकवर (>७ दिवस)', en: 'On Track' },
  ];

  const filteredPatients = useMemo(() => {
    return patients.filter(pt => {
      if (selectedCategory !== 'ALL' && pt.category !== selectedCategory) {
        return false;
      }
      if (selectedUrgency !== 'ALL' && pt.urgency !== selectedUrgency) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = pt.nameEn.toLowerCase().includes(q) || pt.nameMr.toLowerCase().includes(q);
        const matchVillage = pt.village.toLowerCase().includes(q);
        const matchAsha = pt.assignedAshaName.toLowerCase().includes(q);
        const matchAbha = pt.abhaId.toLowerCase().includes(q);
        if (!matchName && !matchVillage && !matchAsha && !matchAbha) {
          return false;
        }
      }
      return true;
    });
  }, [patients, selectedCategory, selectedUrgency, searchQuery]);

  const overdueCount = patients.filter(p => p.urgency === 'OVERDUE').length;
  const criticalCount = patients.filter(p => p.severity === 'CRITICAL').length;

  return (
    <div className="space-y-6">

      {/* Overdue Urgent Alert Banner */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-900">
                {lang === 'mr'
                  ? `सक्रिय दक्षता इशारा: ${overdueCount} उच्च जोखीम रुग्णांच्या पाठपुरावा भेटी थकीत आहेत!`
                  : `Active Clinical Alert: ${overdueCount} high-risk patients have overdue follow-up visits!`}
              </h4>
              <p className="text-[11px] text-red-700 mt-0.5">
                {lang === 'mr'
                  ? 'गर्भवती माता किंवा गंभीर रुग्णांची गैरहजेरी टाळण्यासाठी आशा कार्यकर्त्यांना तत्काळ अलर्ट पाठवा.'
                  : 'Automated Day 1/3/7 escalation protocol is triggered to ensure zero dropouts.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('surveillance');
                setSelectedUrgency('OVERDUE');
              }}
              className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'थकीत रुग्ण पहा' : 'View Overdue Cohort'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Controls */}
      <div className="flex items-center gap-2 border-b border-[#CFD8DC] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('surveillance')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'surveillance'
              ? 'border-[#1A4B8C] text-[#1A4B8C]'
              : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{lang === 'mr' ? 'तालुका दक्षता नोंदवही' : 'Surveillance Cohort'}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-[#546E7A]">
            {patients.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('asha_schedule')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'asha_schedule'
              ? 'border-[#1A4B8C] text-[#1A4B8C]'
              : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{lang === 'mr' ? 'आशा कार्यकर्ती गृहभेट वेळापत्रक' : 'ASHA Home Visit Schedule'}</span>
          {overdueCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-[10px] text-red-700 font-bold">
              {overdueCount} {lang === 'mr' ? 'थकीत' : 'due'}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('flag_new')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'flag_new'
              ? 'border-[#1A4B8C] text-[#1A4B8C]'
              : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A]'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'mr' ? 'नवीन रुग्ण दक्षता नोंद (Flag Patient)' : 'Flag New High-Risk Patient'}</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-[#1A4B8C] text-[#1A4B8C]'
              : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{lang === 'mr' ? 'क्लिनिकल विश्लेषण व अहवाल' : 'Clinical Analytics'}</span>
        </button>
      </div>

      {/* Tab 1: Surveillance Registry */}
      {activeTab === 'surveillance' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#546E7A] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder={lang === 'mr' ? 'रुग्णाचे नाव, गाव, आभा आयडी किंवा आशा...' : 'Search patient, village, ABHA, or ASHA...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C] bg-[#F8FAFC]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                {urgencyFilters.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUrgency(u.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedUrgency === u.id
                        ? 'bg-[#1A4B8C] text-white shadow-sm'
                        : 'bg-slate-50 text-[#546E7A] hover:bg-slate-100 border border-[#CFD8DC]'
                    }`}
                  >
                    {lang === 'mr' ? u.mr : u.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-[#CFD8DC]/50 pt-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === c.id
                      ? 'bg-blue-100 text-[#1A4B8C] font-bold border border-blue-200'
                      : 'text-[#546E7A] hover:bg-slate-100'
                  }`}
                >
                  {lang === 'mr' ? c.mr : c.en}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="flex items-center justify-between text-xs text-[#546E7A] px-1">
            <span>
              {lang === 'mr' ? `एकूण सापडलेले रुग्ण: ${filteredPatients.length}` : `Showing ${filteredPatients.length} registered high-risk cases`}
            </span>
            <span className="text-[11px] text-[#78909C]">
              {lang === 'mr' ? '२४ तास स्वयंचलित पाठपुरावा सक्रिय' : 'Automated 24x7 Surveillance Active'}
            </span>
          </div>

          {/* Patient Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.map((pt) => {
              const isOverdue = pt.urgency === 'OVERDUE';
              const isCritical = pt.severity === 'CRITICAL';

              return (
                <div
                  key={pt.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                    isOverdue 
                      ? 'border-red-300 ring-1 ring-red-200' 
                      : 'border-[#CFD8DC] hover:border-[#1A4B8C]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1C2B3A]">
                          {lang === 'mr' ? pt.nameMr : pt.nameEn}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isOverdue 
                            ? 'bg-red-100 text-red-700' 
                            : pt.urgency === 'DUE_TODAY'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-[#1A4B8C]'
                        }`}>
                          {pt.urgency.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isCritical ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pt.severity}
                        </span>
                      </div>
                      <p className="text-xs text-[#546E7A] mt-0.5">
                        {lang === 'mr' ? pt.categoryLabelMr : pt.categoryLabelEn} · वय: {pt.age} वर्षे
                      </p>
                    </div>

                    <span className="font-mono text-xs text-[#78909C] bg-slate-100 px-2 py-0.5 rounded">
                      {pt.id}
                    </span>
                  </div>

                  {/* Clinical Risk Factors */}
                  <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 text-xs text-red-950 font-medium space-y-1">
                    <span className="text-[10px] uppercase font-bold text-red-800 block">
                      {lang === 'mr' ? 'क्लिनिकल जोखीम घटक:' : 'Clinical Risk Factors:'}
                    </span>
                    <ul className="space-y-0.5">
                      {(lang === 'mr' ? pt.clinicalRiskFactorsMr : pt.clinicalRiskFactorsEn).map((rf, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Assigned Staff & Village Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-[#CFD8DC]/70">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#78909C] block">
                        {lang === 'mr' ? 'आशा कार्यकर्ती:' : 'Assigned ASHA:'}
                      </span>
                      <strong className="text-[#1C2B3A]">{pt.assignedAshaName}</strong>
                      <div className="text-[11px] text-[#546E7A]">{pt.village}</div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#78909C] block">
                        {lang === 'mr' ? 'पुढील पाठपुरावा तारीख:' : 'Next Follow-Up:'}
                      </span>
                      <strong className={`font-mono ${isOverdue ? 'text-red-700' : 'text-[#1A4B8C]'}`}>
                        {pt.nextFollowUpDate}
                      </strong>
                      <div className="text-[11px] text-[#546E7A]">
                        {isOverdue 
                          ? (lang === 'mr' ? `${pt.daysOverdue} दिवस थकीत!` : `${pt.daysOverdue} days overdue!`)
                          : (lang === 'mr' ? 'शेड्यूलनुसार' : 'On Schedule')}
                      </div>
                    </div>
                  </div>

                  {/* Vitals Snapshot and Adherence */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#546E7A]">
                        {lang === 'mr' ? 'औषध नियमितता:' : 'Compliance:'}
                      </span>
                      <span className={`font-mono font-bold ${
                        pt.adherencePercentage < 60 ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {pt.adherencePercentage}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPatientDetail(pt)}
                        className="px-2.5 py-1 text-xs font-bold text-[#1A4B8C] hover:bg-blue-50 rounded-lg transition"
                      >
                        {lang === 'mr' ? 'इतिहास पहा' : 'View History'}
                      </button>

                      <button
                        onClick={() => handleNotifyAsha(pt.id)}
                        className="px-3 py-1.5 bg-[#E8F0FE] hover:bg-blue-100 text-[#1A4B8C] font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {notifiedPatientId === pt.id 
                            ? (lang === 'mr' ? 'अलर्ट पाठवला!' : 'Alert Sent!') 
                            : (lang === 'mr' ? 'आशा अलर्ट पाठवा' : 'Alert ASHA')}
                        </span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredPatients.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#CFD8DC] p-12 text-center text-[#546E7A] space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <h4 className="font-bold text-sm text-[#1C2B3A]">
                {lang === 'mr' ? 'कोणताही रुग्ण आढळला नाही' : 'No patients match your search criteria'}
              </h4>
              <p className="text-xs">
                {lang === 'mr' ? 'कृपया फिल्टर तपासा किंवा वेगळे नाव शोधून पहा.' : 'Try changing your category or urgency filter.'}
              </p>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: ASHA Worker Schedule */}
      {activeTab === 'asha_schedule' && (
        <ASHAWorkerView onRefresh={refreshData} />
      )}

      {/* Tab 3: Flag New High-Risk Patient */}
      {activeTab === 'flag_new' && (
        <RiskFlagForm 
          onSuccess={(newPt) => {
            refreshData();
            setActiveTab('surveillance');
          }}
          onCancel={() => setActiveTab('surveillance')}
        />
      )}

      {/* Tab 4: Analytics */}
      {activeTab === 'analytics' && (
        <RiskAnalytics />
      )}

      {/* Patient Detail / Visit History Modal */}
      {selectedPatientDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#CFD8DC] space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#CFD8DC]">
              <div>
                <h3 className="font-bold text-sm text-[#1C2B3A]">
                  {lang === 'mr' ? 'रुग्ण क्लिनिकल इतिहास व गृहभेट नोंदी' : 'Longitudinal Clinical & Visit History'}
                </h3>
                <p className="text-xs text-[#546E7A] mt-0.5">
                  {lang === 'mr' ? selectedPatientDetail.nameMr : selectedPatientDetail.nameEn} · ABHA: {selectedPatientDetail.abhaId}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPatientDetail(null)}
                className="text-[#546E7A] hover:text-[#1C2B3A] p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vitals Snapshot */}
            <div className="p-3 bg-slate-50 rounded-xl border border-[#CFD8DC] space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-[#78909C] block">
                {lang === 'mr' ? 'शेवटची शारीरिक मापे:' : 'Latest Clinical Measurements:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div>BP: <strong className="text-[#1C2B3A]">{selectedPatientDetail.vitalsSnapshot.bp || '—'}</strong></div>
                <div>Sugar: <strong className="text-[#1C2B3A]">{selectedPatientDetail.vitalsSnapshot.bloodSugar || '—'}</strong></div>
                <div>Hb: <strong className="text-[#1C2B3A]">{selectedPatientDetail.vitalsSnapshot.hb || '—'}</strong></div>
                <div>Weight: <strong className="text-[#1C2B3A]">{selectedPatientDetail.vitalsSnapshot.weight || '—'}</strong></div>
              </div>
            </div>

            {/* Visit Log Timeline */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold uppercase text-[#546E7A]">
                {lang === 'mr' ? 'मागील प्रत्यक्ष भेटींचा इतिहास' : 'Previous Home Visits Record'}
              </h5>

              {selectedPatientDetail.visitsHistory.length === 0 ? (
                <p className="text-xs text-[#78909C] italic">No previous visit records logged.</p>
              ) : (
                selectedPatientDetail.visitsHistory.map((v, i) => (
                  <div key={i} className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-[#1C2B3A]">
                      <span>{v.visitDate} · {v.visitedBy} ({v.role})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                        {v.medicineAdherence} ADHERENCE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#546E7A]">
                      <strong>{lang === 'mr' ? 'निरीक्षण: ' : 'Observation: '}</strong>
                      {lang === 'mr' ? v.clinicalObservationsMr : v.clinicalObservationsEn}
                    </p>
                    <p className="text-[11px] text-[#1A4B8C]">
                      <strong>{lang === 'mr' ? 'कृती: ' : 'Action: '}</strong>
                      {lang === 'mr' ? v.actionTakenMr : v.actionTakenEn}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#CFD8DC]">
              <button
                onClick={() => setSelectedPatientDetail(null)}
                className="px-4 py-2 bg-[#1A4B8C] text-white text-xs font-bold rounded-xl hover:bg-[#0D3470] transition"
              >
                {lang === 'mr' ? 'बंद करा' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
