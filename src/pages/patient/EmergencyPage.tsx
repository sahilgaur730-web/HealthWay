import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PhoneCall, 
  MapPin, 
  AlertTriangle, 
  ArrowLeft, 
  ShieldAlert, 
  Clock, 
  User, 
  Truck, 
  CheckCircle2, 
  HeartPulse, 
  Hospital, 
  ChevronRight,
  Share2,
  AlertCircle,
  Radio,
  Volume2,
  Navigation,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { CURRENT_PATIENT } from '../../data/mockData';
import { EmergencyService, EmergencySosSession } from '../../services/emergencyService';
import { voiceService } from '../../services/voiceService';
import AudioGuidanceButton from '../../components/voice/AudioGuidanceButton';

export default function EmergencyPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [sosSession, setSosSession] = useState<EmergencySosSession | null>(() => EmergencyService.getActiveSosSession());
  const [eta, setEta] = useState(14);
  const [isTriggering, setIsTriggering] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<'Severe Trauma / Accident' | 'Cardiac Emergency' | 'Maternal Labor Crisis' | 'Respiratory Distress'>('Maternal Labor Crisis');

  useEffect(() => {
    let timer: any;
    if (sosSession && eta > 1) {
      timer = setInterval(() => {
        setEta((prev) => {
          const next = prev - 1;
          if (next <= 10 && next > 4) {
            setSosSession((s) => s ? { ...s, stage: 'EN_ROUTE', currentEtaMinutes: next } : null);
          } else if (next <= 4) {
            setSosSession((s) => s ? { ...s, stage: 'ON_SCENE', currentEtaMinutes: next } : null);
          }
          return next;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [sosSession, eta]);

  const handleTriggerSOS = async () => {
    setIsTriggering(true);
    try {
      const session = await EmergencyService.triggerSosDispatch({
        patientName: CURRENT_PATIENT.nameMr,
        abhaId: CURRENT_PATIENT.abhaId,
        category: selectedEmergencyType,
      });
      setSosSession(session);
      setEta(session.currentEtaMinutes);

      // Trigger automatic audio guidance in chosen language
      voiceService.playEmergencySosPrompt(lang);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleCancelSOS = () => {
    EmergencyService.cancelSosSession();
    setSosSession(null);
    voiceService.stopSpeaking();
  };

  const emergencyContacts = [
    { 
      titleMr: '१०८ रुग्णवाहिका (आणीबाणी कक्ष)', 
      titleEn: '108 Emergency Ambulance', 
      number: '108', 
      descMr: 'गंभीर अपघात, हृदयविकार, प्रसूती आणीबाणी (विनामूल्य)',
      descEn: 'Severe accidents, cardiac arrest, maternal labor emergencies'
    },
    { 
      titleMr: '१०२ जननी शिशु एक्सप्रेस', 
      titleEn: '102 Janani Shishu Express', 
      number: '102', 
      descMr: 'गरोदर माता व नवजात बालकांसाठी मोफत वाहतूक',
      descEn: 'Free ambulance for expectant mothers and newborns'
    },
    { 
      titleMr: '१०४ शासकीय आरोग्य सल्लागार', 
      titleEn: '104 Health Advisory Helpline', 
      number: '104', 
      descMr: '२४/७ शासकीय वैद्यकीय मार्गदर्शन व मानसिक आधार',
      descEn: '24x7 government medical guidance & tele-triage'
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumbs & Top Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/patient')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'mr' ? 'डॅशबोर्डवर परत' : 'Back to Dashboard'}
          </button>
          
          <div className="flex items-center gap-2">
            <AudioGuidanceButton 
              textMr="१०८ आणीबाणी रुग्णवाहिका कक्ष. तात्काळ मदतीसाठी लाल बटण दाबा."
              textEn="108 Emergency Response Desk. Tap the red button to dispatch immediate emergency ambulance."
              labelMr="आणीबाणी सूचना ऐका"
              labelEn="Listen instructions"
              variant="secondary"
            />
            <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-700 rounded-full border border-red-200">
              {lang === 'mr' ? '२४/७ आपत्कालीन प्रतिसाद' : '24x7 Emergency Response'}
            </span>
          </div>
        </div>

        {/* SOS Central Dispatch Console */}
        <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-sm overflow-hidden">
          
          {/* Header Banner */}
          <div className="p-6 bg-red-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold">
                  {lang === 'mr' ? '१०८ आणीबाणी मदत केंद्र (Emergency SOS)' : '108 Emergency Response Center'}
                </h1>
                <p className="text-xs text-red-100 mt-0.5">
                  {lang === 'mr' 
                    ? 'महाराष्ट्र शासन आपत्कालीन वैद्यकीय सेवा (MEMS) — २४/७ विनामूल्य मदत' 
                    : 'Maharashtra Emergency Medical Services (MEMS) — 100% Free Service'}
                </p>
              </div>
            </div>

            {sosSession && (
              <span className="bg-white text-red-700 text-xs font-bold px-3.5 py-1.5 rounded-full self-start sm:self-auto animate-pulse flex items-center gap-1.5 shadow-xs">
                <Radio className="w-3.5 h-3.5 text-red-600" />
                {lang === 'mr' ? 'रुग्णवाहिका सक्रिय' : 'Ambulance Dispatched'}
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            
            {!sosSession ? (
              <div className="text-center py-4 space-y-6 max-w-lg mx-auto">
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-[#1C2B3A]">
                    {lang === 'mr' ? 'तात्काळ रुग्णवाहिका हवी आहे का?' : 'Require Immediate Emergency Ambulance?'}
                  </h3>
                  <p className="text-xs text-[#546E7A] leading-relaxed">
                    {lang === 'mr' 
                      ? 'खालील लाल बटण दाबताच तुमचे थेट जीपीएस स्थान जवळच्या १०८ नियंत्रण कक्षाकडे जाईल, जवळच्या रुग्णालयाला पूर्वसूचना मिळेल आणि रुग्णवाहिका तात्काळ रवाना होईल.' 
                      : 'Tapping the SOS button transmits your GPS beacon to the district 108 dispatch desk, reserves casualty bed, and deploys the nearest ambulance.'}
                  </p>
                </div>

                {/* Emergency Condition Selection */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold text-[#546E7A] uppercase tracking-wider block">
                    {lang === 'mr' ? 'आणीबाणीचे स्वरूप निवडा:' : 'Select Emergency Condition:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'Maternal Labor Crisis', mr: 'प्रसूती वेदना / आणीबाणी' },
                      { key: 'Cardiac Emergency', mr: 'छातीत तीव्र कळ / हृदयविकार' },
                      { key: 'Severe Trauma / Accident', mr: 'गंभीर अपघात / जखम' },
                      { key: 'Respiratory Distress', mr: 'श्वास घेण्यास तीव्र त्रास' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedEmergencyType(item.key as any)}
                        className={`p-2.5 rounded-xl border text-left font-medium transition ${
                          selectedEmergencyType === item.key
                            ? 'border-red-600 bg-red-50 text-red-900 font-bold ring-1 ring-red-300'
                            : 'border-[#CFD8DC] bg-white text-[#1C2B3A] hover:bg-slate-50'
                        }`}
                      >
                        {lang === 'mr' ? item.mr : item.key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big SOS Button */}
                <div className="relative inline-block pt-2">
                  <button
                    onClick={handleTriggerSOS}
                    disabled={isTriggering}
                    className="w-44 h-44 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-2xl flex flex-col items-center justify-center gap-1 shadow-xl hover:shadow-2xl transition transform active:scale-95 border-4 border-red-200 ring-8 ring-red-100 disabled:opacity-50 cursor-pointer"
                  >
                    <HeartPulse className="w-9 h-9 animate-pulse" />
                    <span>SOS 108</span>
                    <span className="text-[11px] font-normal uppercase tracking-wider opacity-90">
                      {lang === 'mr' ? '१-टॅप मदत बोलवा' : '1-Tap Dispatch'}
                    </span>
                  </button>
                </div>

                {/* Live GPS Telemetry Beacon Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-[#CFD8DC] text-xs text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#1C2B3A]">
                      <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{lang === 'mr' ? 'थेट जीपीएस बीकन (Detected GPS Coordinates):' : 'Live GPS Geolocation Beacon:'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Accuracy: ±8.5m
                    </span>
                  </div>
                  <p className="text-[#546E7A] text-[11px] pl-6 font-mono">
                    {CURRENT_PATIENT.village}, ता. {CURRENT_PATIENT.block}, जि. {CURRENT_PATIENT.district} · Lat: 18.6534° N, Long: 74.1352° E
                  </p>
                </div>
              </div>
            ) : (
              /* Active 108 Dispatch & Hospital Pre-Arrival Tracking Screen */
              <div className="space-y-6 animate-in fade-in">
                
                {/* ETA Banner */}
                <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6 text-center space-y-2 relative overflow-hidden">
                  <div className="text-xs font-bold uppercase tracking-widest text-red-700 flex items-center justify-center gap-2">
                    <Radio className="w-4 h-4 animate-ping text-red-600" />
                    <span>{lang === 'mr' ? 'अंदाजे आगमन वेळ (Live ETA Countdown)' : 'Live Estimated Time of Arrival'}</span>
                  </div>

                  <div className="text-5xl sm:text-6xl font-black text-red-700 font-mono tracking-tight">
                    {eta} <span className="text-xl font-bold text-red-900">{lang === 'mr' ? 'मिनिटे' : 'Mins'}</span>
                  </div>

                  <p className="text-xs text-red-800 font-medium">
                    {lang === 'mr' 
                      ? '१०८ बेसिक लाईफ सपोर्ट (BLS) रुग्णवाहिका वाघोली-शिरूर बायपासवरून आपल्या दिशेने वेगाने निघाली आहे.' 
                      : 'BLS Ambulance MH-12-HE-1080 dispatched and en route via Koregaon Bhima Bypass.'}
                  </p>
                </div>

                {/* Pre-Arrival Hospital Casualty Desk Notice */}
                <div className="p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#1A4B8C]">
                      <Hospital className="w-4 h-4 text-[#1A4B8C]" />
                      <span>{lang === 'mr' ? 'जिल्हा रुग्णालय कॅज्युअल्टी कक्षाला पूर्वसूचना पाठवली' : 'Hospital Pre-Arrival Casualty Desk Notified'}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Bed Reserved · Trauma Level 1
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block">{lang === 'mr' ? 'रुग्णालय:' : 'Facility:'}</span>
                      <span className="font-bold text-[#1C2B3A]">{sosSession.preArrivalAlert.destinationHospitalMr}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">{lang === 'mr' ? 'कॅज्युअल्टी थेट फोन:' : 'Casualty Helpline:'}</span>
                      <span className="font-bold font-mono text-[#1A4B8C]">{sosSession.preArrivalAlert.casualtyDeskPhone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">{lang === 'mr' ? 'ट्रायज कोड:' : 'Priority Token:'}</span>
                      <span className="font-bold font-mono text-red-700">{sosSession.codeRedTriageToken}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle, Crew & Equipment Telemetry Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Ambulance Details */}
                  <div className="p-5 bg-white rounded-2xl border border-[#CFD8DC] space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-[#1C2B3A]">
                        <Truck className="w-4 h-4 text-red-600" />
                        <span>{lang === 'mr' ? 'रुग्णवाहिका माहिती' : 'Ambulance Details'}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {sosSession.ambulance.vehicleId}
                      </span>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#546E7A]">{lang === 'mr' ? 'प्रकार:' : 'Type:'}</span>
                        <span className="font-semibold text-[#1C2B3A]">{sosSession.ambulance.vehicleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#546E7A]">{lang === 'mr' ? 'चालक:' : 'Driver:'}</span>
                        <span className="font-semibold text-[#1C2B3A]">{sosSession.ambulance.driverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#546E7A]">{lang === 'mr' ? 'पॅरामेडिक:' : 'EMT Paramedic:'}</span>
                        <span className="font-semibold text-[#1C2B3A]">{sosSession.ambulance.paramedicName}</span>
                      </div>
                    </div>

                    <a 
                      href={`tel:${sosSession.ambulance.driverPhone}`}
                      className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>{lang === 'mr' ? 'चालकाशी थेट संपर्क करा' : 'Call Ambulance Driver'}</span>
                    </a>
                  </div>

                  {/* Life Support Equipment Status */}
                  <div className="p-5 bg-white rounded-2xl border border-[#CFD8DC] space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-[#1C2B3A]">
                        <HeartPulse className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'mr' ? 'जीवनरक्षक उपकरणे' : 'Life Support Equipment'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        100% Ready
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-[#1C2B3A]">{lang === 'mr' ? 'ऑक्सिजन सिलेंडर' : 'Oxygen 100%'}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-[#1C2B3A]">{lang === 'mr' ? 'डिफिब्रिलेटर (AED)' : 'AED Unit'}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-[#1C2B3A]">{lang === 'mr' ? 'डिलिव्हरी किट' : 'Delivery Kit'}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-[#1C2B3A]">{lang === 'mr' ? 'नेब्युलायझर' : 'Nebulizer'}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={handleCancelSOS}
                        className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-[#546E7A] hover:text-[#1C2B3A] font-semibold text-xs transition"
                      >
                        {lang === 'mr' ? 'आणीबाणी कॉल रद्द करा (Cancel SOS)' : 'Cancel Emergency Request'}
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>

        {/* Emergency Helplines Direct Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
            {lang === 'mr' ? 'इतर शासकीय आपत्कालीन संपर्क' : 'Other Government Emergency Helplines'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, idx) => (
              <div 
                key={idx} 
                className="bg-white p-5 rounded-2xl border border-[#CFD8DC] hover:border-red-500 hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#1C2B3A]">
                      {lang === 'mr' ? contact.titleMr : contact.titleEn}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black text-xs">
                      {contact.number}
                    </div>
                  </div>
                  <p className="text-xs text-[#546E7A] leading-relaxed">
                    {lang === 'mr' ? contact.descMr : contact.descEn}
                  </p>
                </div>

                <a 
                  href={`tel:${contact.number}`}
                  className="w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? `${contact.number} वर थेट कॉल करा` : `Call ${contact.number} Direct`}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
