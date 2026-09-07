import React, { useState } from 'react';
import { 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  Calendar, 
  HeartPulse, 
  Baby, 
  Activity, 
  MapPin, 
  Check, 
  Send,
  Plus,
  FileText,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  RiskEngineService, 
  HighRiskPatient, 
  RiskUrgencyTier,
  ClinicalRiskCategory 
} from '../../services/riskEngine';

interface ASHAWorkerViewProps {
  onRefresh?: () => void;
}

export default function ASHAWorkerView({ onRefresh }: ASHAWorkerViewProps) {
  const { lang } = useLanguage();

  const [patients, setPatients] = useState<HighRiskPatient[]>(() => RiskEngineService.getPatients());
  const [activeFilter, setActiveFilter] = useState<'PRIORITY' | 'ALL'>('PRIORITY');
  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<HighRiskPatient | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Home Visit Form State
  const [visitedBy, setVisitedBy] = useState('सुमन ताई पाटील (ASHA)');
  const [vitalsBp, setVitalsBp] = useState('');
  const [vitalsSugar, setVitalsSugar] = useState('');
  const [vitalsWeight, setVitalsWeight] = useState('');
  const [vitalsMuac, setVitalsMuac] = useState('');
  const [adherence, setAdherence] = useState<'FULL' | 'PARTIAL' | 'MISSED'>('FULL');
  const [dangerSignsChecked, setDangerSignsChecked] = useState<string[]>([]);
  const [obsMr, setObsMr] = useState('');
  const [obsEn, setObsEn] = useState('');
  const [actionMr, setActionMr] = useState('');
  const [actionEn, setActionEn] = useState('');
  const [nextDate, setNextDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const refreshList = () => {
    const fresh = RiskEngineService.getPatients();
    setPatients(fresh);
    if (onRefresh) onRefresh();
  };

  // Filter patients for ASHA: Suman Tai
  const ashaPatients = patients.filter(p => p.assignedAshaName.includes('सुमन') || p.assignedAshaName.includes('Suman'));

  const displayedPatients = activeFilter === 'PRIORITY'
    ? ashaPatients.filter(p => p.urgency === 'OVERDUE' || p.urgency === 'DUE_TODAY' || p.urgency === 'DUE_SOON')
    : ashaPatients;

  // Open Log Visit Modal
  const openVisitModal = (pt: HighRiskPatient) => {
    setSelectedPatientForVisit(pt);
    setVitalsBp(pt.vitalsSnapshot.bp ? pt.vitalsSnapshot.bp.replace(' mmHg', '') : '');
    setVitalsSugar(pt.vitalsSnapshot.bloodSugar ? pt.vitalsSnapshot.bloodSugar.replace(' mg/dL', '') : '');
    setVitalsWeight(pt.vitalsSnapshot.weight ? pt.vitalsSnapshot.weight.replace(' kg', '') : '');
    setVitalsMuac(pt.vitalsSnapshot.muacMm ? pt.vitalsSnapshot.muacMm.toString() : '');
    setAdherence('FULL');
    setDangerSignsChecked([]);
    setObsMr('');
    setObsEn('');
    setActionMr(lang === 'mr' ? 'गोळ्या नियमित घेण्याचा सल्ला दिला व तारीख निश्चित केली.' : 'Advised regular medication and confirmed next checkup.');
    setActionEn('Advised regular medication and confirmed next checkup.');
    
    // default next visit in 7 days
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setNextDate(d.toISOString().split('T')[0]);
  };

  // Handle Home Visit Form Submit
  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForVisit) return;

    RiskEngineService.logHomeVisit(selectedPatientForVisit.id, {
      visitedBy,
      role: 'ASHA',
      vitals: {
        bp: vitalsBp || undefined,
        bloodGlucose: vitalsSugar || undefined,
        weightKg: vitalsWeight ? Number(vitalsWeight) : undefined,
        muacMm: vitalsMuac ? Number(vitalsMuac) : undefined
      },
      medicineAdherence: adherence,
      dangerSignsObserved: dangerSignsChecked,
      observationsEn: obsEn || 'Home visit completed. Vitals logged.',
      observationsMr: obsMr || 'गृहभेट पूर्ण केली. महत्त्वाची शारीरिक मापे नोंदवली.',
      actionTakenEn: actionEn || 'Routine counsel provided.',
      actionTakenMr: actionMr || 'आरोग्य मार्गदर्शन केले.',
      nextScheduledDate: nextDate
    });

    showToast(
      lang === 'mr'
        ? `${selectedPatientForVisit.nameMr} यांची गृहभेट यशस्वीरित्या नोंदवली गेली!`
        : `Home visit logged for ${selectedPatientForVisit.nameEn}!`
    );

    setSelectedPatientForVisit(null);
    refreshList();
  };

  // Escalate to PHC Medical Officer
  const handleEscalateMO = (pt: HighRiskPatient) => {
    RiskEngineService.escalatePatient(
      pt.id, 
      'MO_ALERT', 
      `ASHA Suman Tai escalated: Patient overdue with critical risk factors. Direct doctor intervention requested.`
    );
    showToast(
      lang === 'mr' 
        ? `वैद्यकीय अधिकारी डॉ. मीरा देशमुख यांच्याकडे तातडीचा अलर्ट पाठवला गेला!` 
        : `Urgent alert dispatched to PHC Medical Officer Dr. Meera Deshmukh!`
    );
    refreshList();
  };

  return (
    <div className="space-y-6">

      {/* Floating Toast */}
      {toastMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between text-xs text-green-900 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold underline text-green-900">
            {lang === 'mr' ? 'बंद करा' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* ASHA Profile & Summary Strip */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center font-bold text-lg">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'सुमन ताई पाटील (आशा कार्यकर्ती)' : 'Suman Tai Patil (ASHA Worker)'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1A4B8C]">
                वडगाव रासाई (Vadgaon)
              </span>
            </div>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'प्राथमिक आरोग्य केंद्र शिरूर अंतर्गत उच्च जोखीम गृहभेट वेळापत्रक' 
                : 'Assigned high-risk home visit schedule under PHC Shirur'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('PRIORITY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'PRIORITY'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-50 text-[#546E7A] hover:bg-slate-100 border border-[#CFD8DC]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'आजच्या / थकीत भेटी' : 'Urgent & Due Today'}</span>
          </button>

          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'ALL'
                ? 'bg-[#1A4B8C] text-white shadow-sm'
                : 'bg-slate-50 text-[#546E7A] hover:bg-slate-100 border border-[#CFD8DC]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'सर्व रुग्ण' : 'All Cohort'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {ashaPatients.length}
            </span>
          </button>
        </div>
      </div>

      {/* Patient Cards List */}
      <div className="space-y-4">
        {displayedPatients.map((pt) => {
          const isOverdue = pt.urgency === 'OVERDUE';
          const isCritical = pt.severity === 'CRITICAL';

          return (
            <div
              key={pt.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                isOverdue
                  ? 'border-red-300 ring-1 ring-red-200 bg-red-50/10'
                  : 'border-[#CFD8DC] hover:border-[#1A4B8C]/40'
              }`}
            >
              {/* Header: Name, Urgency, ABHA ID */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#CFD8DC]/60">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-[#1C2B3A]">
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
                  <div className="text-xs text-[#546E7A] mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{pt.gender} · {pt.age} {lang === 'mr' ? 'वर्षे' : 'years'}</span>
                    <span>·</span>
                    <span className="font-semibold text-[#1A4B8C]">{lang === 'mr' ? pt.categoryLabelMr : pt.categoryLabelEn}</span>
                    <span>·</span>
                    <span className="font-mono text-[11px] text-[#78909C]">ABHA: {pt.abhaId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#546E7A]">
                    {isOverdue && (
                      <span className="text-red-700 font-bold mr-2">
                        {lang === 'mr' ? `${pt.daysOverdue} दिवस थकीत!` : `${pt.daysOverdue} days overdue!`}
                      </span>
                    )}
                    {lang === 'mr' ? 'पुढील भेट:' : 'Next Due:'} {pt.nextFollowUpDate}
                  </span>
                </div>
              </div>

              {/* Clinical Risk Factors & Danger Signs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-red-50/50 rounded-xl border border-red-200">
                  <span className="text-[10px] uppercase font-bold text-red-800 block mb-1">
                    {lang === 'mr' ? 'क्लिनिकल जोखीम घटक:' : 'Clinical Risk Factors:'}
                  </span>
                  <ul className="space-y-1 text-[#1C2B3A]">
                    {(lang === 'mr' ? pt.clinicalRiskFactorsMr : pt.clinicalRiskFactorsEn).map((rf, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <span>{rf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
                    {lang === 'mr' ? 'धोक्याची लक्षणे (तपासणी आवश्यक):' : 'Danger Signs to Check:'}
                  </span>
                  <ul className="space-y-1 text-[#1C2B3A]">
                    {(lang === 'mr' ? pt.dangerSignsMr : pt.dangerSignsEn).map((ds, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <span>{ds}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Latest Vitals Snapshot & Medication Adherence */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-[#CFD8DC]/70">
                <div className="flex items-center gap-4 flex-wrap">
                  {pt.vitalsSnapshot.bp && (
                    <div>
                      <span className="text-[10px] text-[#78909C] uppercase font-bold block">BP:</span>
                      <strong className="text-[#1C2B3A] font-mono">{pt.vitalsSnapshot.bp}</strong>
                    </div>
                  )}
                  {pt.vitalsSnapshot.bloodSugar && (
                    <div>
                      <span className="text-[10px] text-[#78909C] uppercase font-bold block">Sugar:</span>
                      <strong className="text-[#1C2B3A] font-mono">{pt.vitalsSnapshot.bloodSugar}</strong>
                    </div>
                  )}
                  {pt.vitalsSnapshot.weight && (
                    <div>
                      <span className="text-[10px] text-[#78909C] uppercase font-bold block">Weight:</span>
                      <strong className="text-[#1C2B3A] font-mono">{pt.vitalsSnapshot.weight}</strong>
                    </div>
                  )}
                  {pt.vitalsSnapshot.muacMm && (
                    <div>
                      <span className="text-[10px] text-[#78909C] uppercase font-bold block">MUAC:</span>
                      <strong className="text-red-700 font-mono">{pt.vitalsSnapshot.muacMm} mm</strong>
                    </div>
                  )}
                  {pt.vitalsSnapshot.gestationalAgeWeeks && (
                    <div>
                      <span className="text-[10px] text-[#78909C] uppercase font-bold block">Gestation:</span>
                      <strong className="text-[#1A4B8C] font-mono">{pt.vitalsSnapshot.gestationalAgeWeeks} wks</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#546E7A]">
                    {lang === 'mr' ? 'औषध नियमितता:' : 'Med Adherence:'}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          pt.adherencePercentage < 60 ? 'bg-red-500' : pt.adherencePercentage < 80 ? 'bg-amber-500' : 'bg-green-600'
                        }`}
                        style={{ width: `${pt.adherencePercentage}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-xs text-[#1C2B3A]">{pt.adherencePercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Call, Log Visit, Escalate */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${pt.phone}`}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#1C2B3A] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#1A4B8C]" />
                    <span>{lang === 'mr' ? 'रुग्णास फोन करा' : 'Call Patient'}</span>
                  </a>

                  {isOverdue && (
                    <button
                      onClick={() => handleEscalateMO(pt)}
                      className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-red-700" />
                      <span>{lang === 'mr' ? 'डॉक्टरांकडे अलर्ट' : 'Escalate to MO'}</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => openVisitModal(pt)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#1A4B8C] hover:bg-[#0D3470] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'गृहभेट नोंदवा (Log Visit)' : 'Log Home Visit'}</span>
                </button>
              </div>

            </div>
          );
        })}

        {displayedPatients.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-10 text-center text-[#546E7A] space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-green-600" />
            <h4 className="font-bold text-sm text-[#1C2B3A]">
              {lang === 'mr' ? 'अभिनंदन! आज कोणतीही भेट थकीत नाही' : 'All high-risk home visits up to date!'}
            </h4>
            <p className="text-xs">
              {lang === 'mr' ? 'आपल्या कार्यक्षेत्रातील सर्व उच्च जोखीम रुग्णांचे निरीक्षण वेळेवर पूर्ण झाले आहे.' : 'Great job! No pending overdue visits in your village register.'}
            </p>
          </div>
        )}
      </div>

      {/* Log Home Visit Modal */}
      {selectedPatientForVisit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#CFD8DC] space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#CFD8DC]">
              <div>
                <h3 className="font-bold text-sm text-[#1C2B3A]">
                  {lang === 'mr' ? 'गृहभेट व शारीरिक मापे नोंदणी' : 'Log ASHA Home Visit Record'}
                </h3>
                <p className="text-xs text-[#546E7A] mt-0.5">
                  {lang === 'mr' ? selectedPatientForVisit.nameMr : selectedPatientForVisit.nameEn} · {selectedPatientForVisit.categoryLabelEn}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPatientForVisit(null)}
                className="text-[#546E7A] hover:text-[#1C2B3A] p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVisit} className="space-y-4">
              
              {/* Vitals inputs */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase text-[#546E7A] block">
                  {lang === 'mr' ? 'प्रत्यक्ष मोजलेली शारीरिक मापे (Vitals):' : 'Measured Vitals:'}
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#78909C] mb-1">
                      {lang === 'mr' ? 'रक्तदाब (BP mmHg)' : 'Blood Pressure'}
                    </label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={vitalsBp}
                      onChange={(e) => setVitalsBp(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono focus:outline-none focus:border-[#1A4B8C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#78909C] mb-1">
                      {lang === 'mr' ? 'रक्तातील साखर (mg/dL)' : 'Blood Glucose'}
                    </label>
                    <input
                      type="text"
                      placeholder="140"
                      value={vitalsSugar}
                      onChange={(e) => setVitalsSugar(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono focus:outline-none focus:border-[#1A4B8C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#78909C] mb-1">
                      {lang === 'mr' ? 'वजन (किलो)' : 'Weight (kg)'}
                    </label>
                    <input
                      type="text"
                      placeholder="58"
                      value={vitalsWeight}
                      onChange={(e) => setVitalsWeight(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono focus:outline-none focus:border-[#1A4B8C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#78909C] mb-1">
                      {lang === 'mr' ? 'दंडाचा घेर MUAC (मिमी)' : 'MUAC (mm)'}
                    </label>
                    <input
                      type="text"
                      placeholder="115"
                      value={vitalsMuac}
                      onChange={(e) => setVitalsMuac(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono focus:outline-none focus:border-[#1A4B8C]"
                    />
                  </div>
                </div>
              </div>

              {/* Medicine Adherence */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1.5">
                  {lang === 'mr' ? 'औषध नियमितता (Medication Adherence)' : 'Medication Compliance'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'FULL', mr: 'पूर्ण नियमित', en: '100% Full' },
                    { id: 'PARTIAL', mr: 'काही चुकवले', en: 'Partial' },
                    { id: 'MISSED', mr: 'गोळ्या बंद', en: 'Defaulted' },
                  ].map(adm => (
                    <button
                      key={adm.id}
                      type="button"
                      onClick={() => setAdherence(adm.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition border ${
                        adherence === adm.id
                          ? 'bg-[#1A4B8C] text-white border-[#1A4B8C]'
                          : 'bg-slate-50 text-[#546E7A] border-[#CFD8DC] hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'mr' ? adm.mr : adm.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Danger signs checklist */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                  {lang === 'mr' ? 'धोक्याची लक्षणे आढळली का?' : 'Danger Signs Observed:'}
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-[#F8FAFC] border border-[#CFD8DC] rounded-xl">
                  {(lang === 'mr' ? selectedPatientForVisit.dangerSignsMr : selectedPatientForVisit.dangerSignsEn).map((ds, idx) => {
                    const isChecked = dangerSignsChecked.includes(ds);
                    return (
                      <label key={idx} className="flex items-center gap-2 text-xs text-[#1C2B3A] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDangerSignsChecked(prev => [...prev, ds]);
                            } else {
                              setDangerSignsChecked(prev => prev.filter(item => item !== ds));
                            }
                          }}
                          className="w-4 h-4 text-red-600 rounded border-[#CFD8DC] focus:ring-red-500"
                        />
                        <span>{ds}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Observations */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                  {lang === 'mr' ? 'प्रत्यक्ष निरीक्षण व मार्गदर्शन' : 'Clinical Notes / Actions Taken'}
                </label>
                <textarea
                  rows={2}
                  value={lang === 'mr' ? obsMr : obsEn}
                  onChange={(e) => {
                    if (lang === 'mr') setObsMr(e.target.value);
                    else setObsEn(e.target.value);
                  }}
                  placeholder={lang === 'mr' ? 'उदा. रुग्णाची प्रकृती समाधानकारक, आहारात बदल सुचवले...' : 'e.g. Patient stable, advised green leafy vegetables...'}
                  className="w-full p-2.5 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
                />
              </div>

              {/* Next follow-up date */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                  {lang === 'mr' ? 'पुढील भेटीची तारीख' : 'Next Scheduled Follow-Up Date'}
                </label>
                <input
                  type="date"
                  required
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#CFD8DC]">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForVisit(null)}
                  className="px-4 py-2 border border-[#CFD8DC] text-xs font-bold text-[#546E7A] hover:bg-slate-50 rounded-xl transition"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'mr' ? 'भेट नोंद पूर्ण करा' : 'Save Visit Log'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
