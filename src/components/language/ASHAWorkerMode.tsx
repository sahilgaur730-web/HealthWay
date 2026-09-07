/**
 * HealthWay Multilingual System - ASHA Worker Dedicated Mode (Demand 11)
 * Government of Maharashtra - Integrated Rural Health Platform
 * Touch-optimized simplified interface with Marathi/Hindi/English voice interaction.
 * Strictly zero unicode emojis.
 */

import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  Home, 
  Mic, 
  Phone, 
  Check, 
  AlertOctagon, 
  CheckCircle2, 
  FileText, 
  Save, 
  Trash2, 
  Volume2, 
  ArrowRight, 
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import VoiceInput, { TextToSpeech } from './VoiceInput';
import LanguageSwitcher from './LanguageSwitcher';

interface MockPatient {
  id: number;
  name: string;
  nameLocal: string;
  category: string;
  village: string;
  urgency: 'OVERDUE' | 'TODAY' | 'SOON';
  phone: string;
  nextVisit: string;
  risk: string;
  color: string;
}

export default function ASHAWorkerMode() {
  const { t, language } = useLanguage();
  const [activeSection, setActiveSection] = useState<'home' | 'patients' | 'visit' | 'voice'>('home');
  const [loggedVisit, setLoggedVisit] = useState<MockPatient | null>(null);
  const [voiceNote, setVoiceNote] = useState('');

  const MOCK_PATIENTS: MockPatient[] = [
    {
      id: 1,
      name: 'Savita Pawar',
      nameLocal: language === 'mr' ? 'सविता पवार' : language === 'hi' ? 'सविता पवार' : 'Savita Pawar',
      category: language === 'mr' ? 'गर्भवती माता (ANC)' : language === 'hi' ? 'गर्भवती महिला (ANC)' : 'Pregnant (ANC)',
      village: 'Wagholi',
      urgency: 'OVERDUE',
      phone: '9876543210',
      nextVisit: language === 'mr' ? '३ दिवस थकीत' : language === 'hi' ? '३ दिन देरी' : '3 days overdue',
      risk: language === 'mr' ? 'गंभीर अशक्तपणा (Hb 8.1)' : language === 'hi' ? 'गंभीर एनीमिया (Hb 8.1)' : 'Severe Anaemia (Hb 8.1)',
      color: '#BE185D'
    },
    {
      id: 2,
      name: 'Baby Ravi',
      nameLocal: language === 'mr' ? 'बाळ रवी' : language === 'hi' ? 'बेबी रवि' : 'Baby Ravi',
      category: language === 'mr' ? 'नवजात अर्भक' : language === 'hi' ? 'नवजात शिशु' : 'Newborn',
      village: 'Wagholi',
      urgency: 'TODAY',
      phone: '9876543211',
      nextVisit: language === 'mr' ? 'आज देय' : language === 'hi' ? 'आज देय' : 'Due today',
      risk: language === 'mr' ? 'OPV-1 व पेंटाव्हॅलेंट लस देय' : language === 'hi' ? 'OPV-1 व पेंटावेलेंट टीका देय' : 'OPV-1 & Pentavalent due',
      color: '#1A4B8C'
    },
    {
      id: 3,
      name: 'Rekha Shinde',
      nameLocal: language === 'mr' ? 'रेखा शिंदे' : language === 'hi' ? 'रेखा शिंदे' : 'Rekha Shinde',
      category: language === 'mr' ? 'उच्च रक्तदाब (NCD)' : language === 'hi' ? 'उच्च रक्तचाप (NCD)' : 'Hypertension (NCD)',
      village: 'Kharadi',
      urgency: 'OVERDUE',
      phone: '9876543212',
      nextVisit: language === 'mr' ? '५ दिवस थकीत' : language === 'hi' ? '५ दिन देरी' : '5 days overdue',
      risk: language === 'mr' ? 'अम्लोडिपिन गोळ्या संपल्या' : language === 'hi' ? 'एम्लोडिपिन दवा खत्म' : 'Amlodipine medicine stockout',
      color: '#DC2626'
    }
  ];

  const urgencyConfig = {
    OVERDUE: {
      bg: 'bg-rose-100',
      text: 'text-rose-800',
      border: 'border-rose-300',
      label: language === 'mr' ? 'उशीर झाला' : language === 'hi' ? 'देरी हुई' : 'Overdue'
    },
    TODAY: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      label: language === 'mr' ? 'आज' : language === 'hi' ? 'आज' : 'Today'
    },
    SOON: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      label: language === 'mr' ? 'लवकरच' : language === 'hi' ? 'जल्द' : 'Soon'
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#F8FAFC] min-h-screen border-x border-[#CFD8DC] pb-24 font-sans text-slate-800">
      
      {/* ASHA Header */}
      <div className="bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] p-5 text-white shadow-md">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-lg text-white shrink-0">
              {language === 'mr' ? 'मी' : language === 'hi' ? 'मी' : 'M'}
            </div>
            <div>
              <div className="font-extrabold text-base text-white">
                {language === 'mr' ? 'मीना जाधव' : language === 'hi' ? 'मीना जाधव' : 'Meena Jadhav'}
              </div>
              <div className="text-xs text-purple-200">
                {t('asha.title')} · PHC Wagholi (Haveli)
              </div>
            </div>
          </div>
          <LanguageSwitcher compact={true} />
        </div>

        {/* 3 High-Impact Stats Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/15 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center mx-auto mb-1">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xl font-black font-mono text-white">12</div>
            <div className="text-[10px] text-purple-100 leading-tight mt-0.5">{t('asha.myPatients')}</div>
          </div>

          <div className="bg-white/15 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center mx-auto mb-1">
              <Calendar className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xl font-black font-mono text-white">2</div>
            <div className="text-[10px] text-purple-100 leading-tight mt-0.5">{t('asha.visitToday')}</div>
          </div>

          <div className="bg-rose-500/30 backdrop-blur-xs p-3 rounded-2xl border border-rose-300/40">
            <div className="w-6 h-6 rounded-lg bg-rose-500/40 flex items-center justify-center mx-auto mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xl font-black font-mono text-white">3</div>
            <div className="text-[10px] text-rose-100 leading-tight mt-0.5">{t('asha.overdueVisits')}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#CFD8DC] bg-white sticky top-0 z-20 shadow-xs">
        {[
          { id: 'home', icon: Home, label: language === 'mr' ? 'मुख्य' : language === 'hi' ? 'होम' : 'Home' },
          { id: 'patients', icon: Users, label: language === 'mr' ? 'रुग्ण' : language === 'hi' ? 'मरीज़' : 'Patients' },
          { id: 'visit', icon: ClipboardList, label: language === 'mr' ? 'भेट नोंदवा' : language === 'hi' ? 'यात्रा दर्ज' : 'Log Visit' },
          { id: 'voice', icon: Mic, label: language === 'mr' ? 'आवाज नोट' : language === 'hi' ? 'आवाज़ नोट' : 'Voice Note' }
        ].map((nav) => {
          const Icon = nav.icon;
          const isActive = activeSection === nav.id;
          return (
            <button
              key={nav.id}
              onClick={() => setActiveSection(nav.id as any)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-bold transition border-b-2 ${
                isActive
                  ? 'border-[#7C3AED] text-[#7C3AED] bg-purple-50/50'
                  : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px]">{nav.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4">
        
        {/* VIEW 1: HOME & PATIENT LIST */}
        {(activeSection === 'home' || activeSection === 'patients') && (
          <div className="space-y-4">
            
            {/* Overdue Banner with Speech Synthesis */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-rose-950">
                    {language === 'mr'
                      ? '३ रुग्णांना आजच भेट द्या!'
                      : language === 'hi'
                      ? '३ मरीजों से आज ही मिलें!'
                      : '3 high-risk patients need urgent visits today!'}
                  </div>
                  <div className="text-[11px] text-rose-800 mt-0.5">
                    {language === 'mr' ? 'ANC व NCD पाठपुरावा आवश्यक' : 'Critical ANC & NCD follow-up'}
                  </div>
                </div>
              </div>

              <TextToSpeech
                text={language === 'mr'
                  ? '३ रुग्णांना आजच भेट द्या. सविता पवार, बाळ रवी आणि रेखा शिंदे यांच्या भेटी प्रलंबित आहेत.'
                  : language === 'hi'
                  ? '३ मरीजों से आज ही मिलें। सविता पवार, बेबी रवि और रेखा शिंदे की यात्राएं बाकी हैं।'
                  : 'Three patients need urgent home visits today. Savita Pawar, Baby Ravi, and Rekha Shinde.'}
              />
            </div>

            {/* Patient Cards */}
            <div className="space-y-3">
              {MOCK_PATIENTS.map((patient) => {
                const urg = urgencyConfig[patient.urgency];
                return (
                  <div
                    key={patient.id}
                    className="p-4 bg-white rounded-2xl border border-[#CFD8DC] shadow-xs space-y-3 relative overflow-hidden"
                    style={{ borderLeftWidth: '5px', borderLeftColor: patient.color }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0"
                          style={{ backgroundColor: `${patient.color}15`, color: patient.color }}
                        >
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1C2B3A]">
                            {patient.nameLocal}
                          </h4>
                          <p className="text-xs text-[#546E7A]">
                            {patient.category} · {patient.village}
                          </p>
                          <p className="text-[11px] font-semibold text-rose-700 mt-0.5">
                            {patient.risk}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${urg.bg} ${urg.text} ${urg.border}`}>
                        {urg.label}
                      </span>
                    </div>

                    {/* Touch Friendly Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={`tel:${patient.phone}`}
                        className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex flex-col items-center justify-center gap-1 text-center"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px]">{t('asha.callPatient')}</span>
                      </a>

                      <button
                        onClick={() => setLoggedVisit(patient)}
                        className="py-2.5 px-2 rounded-xl bg-[#7C3AED] hover:bg-purple-800 text-white text-xs font-bold transition flex flex-col items-center justify-center gap-1 text-center shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{t('asha.homeVisitDone')}</span>
                      </button>

                      <button
                        onClick={() => {
                          alert(language === 'mr' ? `डॉक्टरांना अलर्ट पाठवला: ${patient.nameLocal}` : `Doctor alert dispatched for: ${patient.name}`);
                        }}
                        className="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition flex flex-col items-center justify-center gap-1 text-center"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-[10px]">{t('asha.escalateToDoctor')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* VIEW 2: VOICE NOTE RECORDING */}
        {activeSection === 'voice' && (
          <div className="p-5 bg-white rounded-2xl border border-[#CFD8DC] shadow-xs space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-2">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-[#1C2B3A]">
                {t('asha.voiceNote')}
              </h3>
              <p className="text-xs text-[#546E7A]">
                {language === 'mr'
                  ? 'मायक्रोफोनवर टॅप करा आणि रुग्णाबाबत माहिती बोला'
                  : language === 'hi'
                  ? 'माइक पर टैप करें और मरीज़ की स्थिति बोलें'
                  : 'Tap the mic and dictate patient observation notes'}
              </p>
            </div>

            <VoiceInput
              onResult={(text) => setVoiceNote((prev) => prev + text + ' ')}
              placeholder={t('triage.voicePrompt')}
              continuous={true}
            />

            {voiceNote && (
              <div className="p-4 bg-slate-50 border border-[#CFD8DC] rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#1C2B3A]">
                  <span>{language === 'mr' ? 'नोंदवलेली माहिती:' : 'Recorded Clinical Note:'}</span>
                  <span className="text-[10px] font-mono text-slate-500">Live Voice Draft</span>
                </div>

                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {voiceNote}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert(language === 'mr' ? 'आवाज नोट सुरक्षित जतन केली!' : 'Voice note saved successfully!');
                      setVoiceNote('');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#7C3AED] hover:bg-purple-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t('common.save')}</span>
                  </button>

                  <TextToSpeech text={voiceNote} />

                  <button
                    onClick={() => setVoiceNote('')}
                    className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: LOG VISIT FORM */}
        {activeSection === 'visit' && (
          <VisitLogForm
            patients={MOCK_PATIENTS}
            onLog={(patient) => {
              setLoggedVisit(patient);
              setActiveSection('home');
            }}
          />
        )}

      </div>

      {/* Visit Logged Success Modal */}
      {loggedVisit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl space-y-4 border border-[#CFD8DC] animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-black text-lg text-[#1C2B3A]">
                {language === 'mr' ? 'भेट यशस्वी नोंदवली!' : language === 'hi' ? 'यात्रा सफलतापूर्वक दर्ज!' : 'Visit Successfully Logged!'}
              </h3>
              <p className="text-xs text-[#546E7A] mt-1">
                {loggedVisit.nameLocal} · {loggedVisit.village}
              </p>
            </div>

            <button
              onClick={() => setLoggedVisit(null)}
              className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-purple-800 text-white font-bold text-sm transition shadow-xs"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * Sub-component: Visit Log Form
 */
function VisitLogForm({ patients, onLog }: { patients: MockPatient[]; onLog: (p: MockPatient) => void }) {
  const { t, language } = useLanguage();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === parseInt(selectedPatientId, 10));
    if (patient) {
      onLog(patient);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-white rounded-2xl border border-[#CFD8DC] shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <ClipboardList className="w-5 h-5 text-[#7C3AED]" />
        <h3 className="font-extrabold text-sm text-[#1C2B3A]">
          {t('asha.logVisit')}
        </h3>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#1C2B3A]">
          {language === 'mr' ? 'रुग्ण निवडा *' : language === 'hi' ? 'मरीज़ चुनें *' : 'Select Patient *'}
        </label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          required
          className="w-full p-3 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-[#7C3AED] outline-none"
        >
          <option value="">
            {language === 'mr' ? 'रुग्णाची निवड करा...' : language === 'hi' ? 'मरीज़ का चयन करें...' : 'Choose a patient...'}
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nameLocal} ({p.category})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#1C2B3A]">
          {language === 'mr' ? 'भेटीची नोंद (लिहा किंवा बोला)' : language === 'hi' ? 'यात्रा विवरण (लिखें या बोलें)' : 'Visit Observation Note'}
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={language === 'mr' ? 'रुग्णाची तब्येत, औषधे, किंवा लक्षणे नमूद करा...' : 'Enter condition details...'}
          className="w-full p-3 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-[#7C3AED] outline-none"
        />
        <VoiceInput
          onResult={(text) => setNote((prev) => prev + text + ' ')}
          placeholder={t('asha.voiceNote')}
        />
      </div>

      <button
        type="submit"
        disabled={!selectedPatientId}
        className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
      >
        <Check className="w-4 h-4" />
        <span>{language === 'mr' ? 'भेट नोंदवा' : language === 'hi' ? 'यात्रा दर्ज करें' : 'Record Home Visit'}</span>
      </button>
    </form>
  );
}

