import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hospital, 
  Stethoscope, 
  Users, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  PhoneCall, 
  Activity, 
  HeartPulse, 
  ChevronRight, 
  ChevronDown, 
  X,
  Mic,
  Network,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import VoiceAssistantModal from '../../components/voice/VoiceAssistantModal';
import AudioGuidanceButton from '../../components/voice/AudioGuidanceButton';
import { MARQUEE_BIOMARKERS } from '../../data/mockData';

export default function LandingPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [activeTimelineStep, setActiveTimelineStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const timelineSteps = [
    {
      step: '01',
      titleMr: 'घरोघरी तपासणी व पूर्वतयारी',
      titleHi: 'घर-घर जाँच व प्रारंभिक तैयारी',
      titleEn: 'Doorstep Screening & Vitals',
      descMr: 'आशा कार्यकर्त्यांनी प्रत्यक्ष भेट देऊन डिजिटल उपकरणांद्वारे रक्तदाब, साखर व हिमोग्लोबिन मोजले आणि लक्षण आधारित ट्रायज केले.',
      descHi: 'आशा कार्यकर्ताओं द्वारा डिजिटल उपकरणों से रक्तचाप, शुगर व हीमोग्लोबिन की जाँच और लक्षण आधारित ट्रिआज।',
      descEn: 'Frontline ASHA workers screen vitals at rural doorsteps using digital diagnostic kits and triage condition seriousness.'
    },
    {
      step: '02',
      titleMr: 'थेट डॉक्टर टेलीकन्सल्टेशन',
      titleHi: 'त्वरित डॉक्टर टेलीकंसल्टेशन',
      titleEn: 'Instant PHC Teleconsultation',
      descMr: 'कमी बँडविड्थवर कार्य करणाऱ्या व्हिडिओ/ऑडिओ प्रणालीद्वारे प्राथमिक आरोग्य केंद्रातील वैद्यकीय अधिकाऱ्यांशी थेट सल्लामसलत.',
      descHi: 'कम बैंडविड्थ पर कार्य करने वाली वीडियो/ऑडियो प्रणाली द्वारा प्राथमिक स्वास्थ्य केंद्र के डॉक्टर से सीधा परामर्श।',
      descEn: 'Sub-Centre connects directly to the PHC Medical Officer via low-latency telemedicine with ASHA worker assistance.'
    },
    {
      step: '03',
      titleMr: 'डिजिटल प्रिस्क्रिप्शन व मोफत औषध',
      titleHi: 'डिजिटल प्रिस्क्रिप्शन व निःशुल्क दवा',
      titleEn: 'Digital Rx & Free Medication',
      descMr: 'शासकीय औषध साठ्यातून प्रमाणित औषधे त्वरित उपलब्ध केली जातात आणि स्टॉक पातळी स्वयंचलित अद्ययावत होते.',
      descHi: 'शासकीय दवा भंडार से प्रमाणित दवाइयां तुरंत उपलब्ध और स्टॉक स्थिति का स्वचालित अद्यतन।',
      descEn: 'Digitally signed prescription synchronized with local dispensary for immediate collection and live stock visibility.'
    },
    {
      step: '04',
      titleMr: 'जिल्हा रुग्णालयात अखंड रेफरल',
      titleHi: 'जिला अस्पताल में निर्बाध रेफरल',
      titleEn: 'Tertiary Referral & 108 Dispatch',
      descMr: 'गरज भासल्यास १०२/१०८ रुग्णवाहिकेद्वारे जिल्हा रुग्णालयात मोफत वाहतूक आणि तज्ञ डॉक्टरांचा संदर्भ ट्रॅकिंग.',
      descHi: 'आवश्यकता पड़ने पर १०८ एम्बुलेंस द्वारा जिला अस्पताल में निःशुल्क परिवहन और विशेषज्ञ डॉक्टर रेफरल ट्रैकिंग।',
      descEn: 'Priority hospital admission and 108 emergency transport tracked end-to-end with closing feedback to the referring PHC.'
    }
  ];

  const healthPrograms = [
    {
      code: 'PMSMA',
      titleMr: 'प्रधानमंत्री सुरक्षित मातृत्व',
      titleHi: 'प्रधानमंत्री सुरक्षित मातृत्व (PMSMA)',
      titleEn: 'Safe Motherhood (PMSMA)',
      descMr: 'प्रत्येक महिन्याच्या ९ तारखेला मोफत तज्ञ प्रसूतीपूर्व तपासणी व सोनोग्राफी.',
      descHi: 'हर महीने की ९ तारीख को निःशुल्क विशेषज्ञ प्रसवपूर्व जाँच व सोनोग्राफी।',
      descEn: 'Free specialist antenatal checkups and sonography on the 9th of every month.'
    },
    {
      code: 'NP-NCD',
      titleMr: 'असंगर्गजन्य रोग नियंत्रण',
      titleHi: 'गैर-संचारी रोग नियंत्रण (NP-NCD)',
      titleEn: 'Chronic Disease Control (NP-NCD)',
      descMr: '३० वर्षांवरील सर्व नागरिकांची मधुमेह, उच्च रक्तदाब व मुख कर्करोग तपासणी.',
      descHi: '३० वर्ष से अधिक उम्र के सभी नागरिकों की मधुमेह, उच्च रक्तचाप व मुख कैंसर जाँच।',
      descEn: 'Screening for diabetes, hypertension, and chronic risks for all adults aged 30+.'
    },
    {
      code: 'NTEP',
      titleMr: 'राष्ट्रीय क्षयरोग निर्मूलन',
      titleHi: 'राष्ट्रीय क्षयरोग उन्मूलन (NTEP)',
      titleEn: 'Tuberculosis Elimination (NTEP)',
      descMr: 'मोफत DOTS औषधोपचार व निक्षय पोषण योजनेअंतर्गत थेट बँक खात्यात आर्थिक सहाय्य.',
      descHi: 'निःशुल्क डॉट्स दवाइयां और निक्षय पोषण योजना के तहत बैंक खाते में सीधी आर्थिक सहायता।',
      descEn: 'Free DOTS medications and direct financial assistance under Nikshay Poshan Yojana.'
    },
    {
      code: 'IMI 5.0',
      titleMr: 'मिशन इंद्रधनुष्य लसीकरण',
      titleHi: 'मिशन इंद्रधनुष टीकाकरण (IMI 5.0)',
      titleEn: 'Mission Indradhanush (IMI 5.0)',
      descMr: '० ते ५ वर्षांपर्यंतच्या सर्व बालकांचे व गरोदर मातांचे संपूर्ण मोफत लसीकरण.',
      descHi: '० से ५ वर्ष तक के सभी बच्चों और गर्भवती महिलाओं का संपूर्ण निःशुल्क टीकाकरण।',
      descEn: 'Universal immunization coverage ensuring zero-dose vaccine catchup for all infants.'
    }
  ];

  const faqs = [
    {
      qMr: 'हेल्थवे (HealthWay) प्लॅटफॉर्म नेमके काय आहे?',
      qHi: 'हेल्थवे (HealthWay) प्लेटफॉर्म क्या है?',
      qEn: 'What is the HealthWay Rural Healthcare Platform?',
      aMr: 'हेल्थवे हे महाराष्ट्र शासनाच्या सार्वजनिक आरोग्य विभागाचे एकात्मिक डिजिटल पोर्टल आहे, जे ग्रामीण नागरिक, आशा कार्यकर्त्या, प्राथमिक आरोग्य केंद्रे (PHC) आणि जिल्हा रुग्णालयांना एकमेकांशी अखंड जोडते.',
      aHi: 'हेल्थवे महाराष्ट्र शासन के सार्वजनिक स्वास्थ्य विभाग का एकीकृत डिजिटल पोर्टल है, जो ग्रामीण नागरिकों, आशा कार्यकर्ताओं, प्राथमिक स्वास्थ्य केंद्रों (PHC) और जिला अस्पतालों को आपस में जोड़ता है।',
      aEn: 'HealthWay is the Government of Maharashtra\'s integrated healthcare platform connecting rural patients, ASHA workers, PHC Medical Officers, and District tertiary hospitals.'
    },
    {
      qMr: 'ग्रामीण भागात इंटरनेट नसताना प्रणाली कार्य करते का?',
      qHi: 'क्या यह प्रणाली इंटरनेट के बिना भी कार्य करती है?',
      qEn: 'Does the platform function without internet in remote villages?',
      aMr: 'होय. आशा कार्यकर्त्यांचे पोर्टल संपूर्ण ऑफलाइन क्षमतेसह कार्य करते. सर्व नोंदी स्थानिक मेमरीमध्ये सुरक्षित राहतात आणि नेटवर्क उपलब्ध झाल्यावर आपोआप सर्व्हरशी सिंक होतात.',
      aHi: 'हाँ, आशा कार्यकर्ता पोर्टल पूरी तरह से ऑफलाइन कार्य करता है। सारा डेटा स्थानीय डिवाइस में सुरक्षित रहता है और नेटवर्क मिलने पर स्वचालित रूप से सिंक हो जाता है।',
      aEn: 'Yes. The ASHA portal features an offline-first architecture. All records are saved locally and automatically synchronized with the central cloud once connectivity is restored.'
    },
    {
      qMr: 'ABHA ओळख क्रमांक कसा तयार होतो?',
      qHi: 'आभा (ABHA) आईडी कैसे बनती है?',
      qEn: 'How is the ABHA ID generated and linked?',
      aMr: 'नागरिकांच्या आधार क्रमांकाद्वारे किंवा मोबाईल पडताळणीद्वारे त्वरित १४ अंकी डिजिटल ABHA ID तयार होतो, ज्यामुळे सर्व वैद्यकीय इतिहास सुरक्षितरीत्या एकाच ठिकाणी जतन केला जातो.',
      aHi: 'नागरिकों के आधार नंबर या मोबाइल सत्यापन द्वारा तुरंत १४ अंकों की डिजिटल आभा आईडी तैयार होती है, जिससे सभी स्वास्थ्य रिकॉर्ड एक जगह सुरक्षित रहते हैं।',
      aEn: 'Patients receive an instant 14-digit ABHA Health ID verified via Aadhaar OTP or mobile, unifying all past prescriptions, lab tests, and hospital visits.'
    },
    {
      qMr: '१०८ आणीबाणी सेवा कशी कार्य करते?',
      qHi: '१०८ आपातकालीन एम्बुलेंस सेवा कैसे काम करती है?',
      qEn: 'How does the 108 Emergency Ambulance dispatch work?',
      aMr: 'रुग्ण किंवा आशा कार्यकर्तीने १-टॅप SOS बटण दाबताच जवळच्या १०८ आपत्कालीन कक्षाला थेट GPS लोकेशन पाठवले जाते आणि सर्वात जवळची रुग्णवाहिका रवाना होते.',
      aHi: '१-टैप एसओएस बटन दबाते ही जीपीएस लोकेशन सीधे जिला १०८ नियंत्रण कक्ष को भेजी जाती है और निकटतम एम्बुलेंस तुरंत रवाना होती है।',
      aEn: 'Tapping the 1-Tap SOS button transmits precise GPS coordinates to the district 108 dispatch desk, deploying the nearest Basic Life Support (BLS) ambulance.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1C2B3A] flex flex-col">
      
      {/* 1. Header with sticky top-0 and permanent navigation bar */}
      <Header onOpenModal={() => setIsModalOpen(true)} />

      {/* 2. HERO SECTION — High-Impact Two-Column Layout (Responsive, Clean, Institutional Medical Design) */}
      <section className="relative bg-[#0E356A] text-white pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#1A4B8C]">
        
        {/* Subtle geometric grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a4b8c15_1px,transparent_1px),linear-gradient(to_bottom,#1a4b8c15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Two-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Institutional Mission & Actions (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Top Accreditation Badges & Audio Guidance */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-blue-100 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {lang === 'mr' 
                      ? 'महाराष्ट्र शासन · राष्ट्रीय आरोग्य अभियान (NHM)' 
                      : lang === 'hi'
                        ? 'महाराष्ट्र शासन · राष्ट्रीय स्वास्थ्य मिशन (NHM)'
                        : 'Govt of Maharashtra · National Health Mission (NHM)'}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                  <Network className="w-3 h-3 text-emerald-400" />
                  <span>ABDM Milestone 1, 2 & 3 Certified</span>
                </div>

                <AudioGuidanceButton 
                  textMr="आपल्या आरोग्यासाठी एक डिजिटल सेतू. गावागावात तज्ञ डॉक्टरांचा सल्ला, डिजिटल ABHA नोंदी, थेट लॅब समन्वय आणि जीवनरक्षक औषधांची माहिती आता एका क्लिकवर."
                  textHi="आपके स्वास्थ्य के लिए एक डिजिटल सेतु। हर गांव में विशेषज्ञ डॉक्टर परामर्श, डिजिटल आभा रिकॉर्ड, सीधी लैब समन्वय और आवश्यक दवाओं की उपलब्धता अब एक क्लिक पर।"
                  textEn="Integrated Rural Healthcare. Connected anywhere. Specialist doctor teleconsultations, ABHA digital health records, and 108 emergency escalation for rural Maharashtra."
                  labelMr="माहिती ऐका"
                  labelHi="जानकारी सुनें"
                  labelEn="Listen Overview"
                  variant="secondary"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                />
              </div>

              {/* Main Hero Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                {lang === 'mr' ? (
                  <>
                    आपल्या आरोग्यासाठी — <br />
                    <span className="text-blue-200">एक अखंड डिजिटल सेतू.</span>
                  </>
                ) : lang === 'hi' ? (
                  <>
                    आपके स्वास्थ्य के लिए — <br />
                    <span className="text-blue-200">एक अखंड डिजिटल सेतु.</span>
                  </>
                ) : (
                  <>
                    Integrated Rural Healthcare. <br />
                    <span className="text-blue-200">Connected. Anywhere.</span>
                  </>
                )}
              </h1>

              {/* Subtitle description */}
              <p className="text-xs sm:text-sm md:text-base text-blue-100/90 leading-relaxed font-normal max-w-2xl">
                {lang === 'mr' ? (
                  'गावागावात तज्ञ डॉक्टरांचा सल्ला, डिजिटल ABHA नोंदी, थेट लॅब समन्वय आणि जीवनरक्षक औषधांची माहिती आता एका क्लिकवर. उपकेंद्रापासून जिल्हा रुग्णालयापर्यंत अखंड आरोग्य प्रवास.'
                ) : lang === 'hi' ? (
                  'हर ग्रामीण गांव के लिए विशेषज्ञ डॉक्टर टेलीकंसल्टेशन, डिजिटल आभा स्वास्थ्य रिकॉर्ड, सीधी लैब समन्वय और आवश्यक दवा उपलब्धता अब एक क्लिक पर। उपकेंद्र से जिला अस्पताल तक निर्बाध स्वास्थ्य यात्रा।'
                ) : (
                  'Comprehensive digital healthcare connecting rural Maharashtra: ASHA-assisted teleconsultation, ABHA longitudinal health records, real-time medicine tracking, 108 emergency escalation, and pan-India FHIR/HMIS interoperability.'
                )}
              </p>

              {/* Action Buttons: Portals, 108 SOS, Voice Assistant */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 rounded-full bg-white text-[#1A4B8C] text-xs sm:text-sm font-bold hover:bg-blue-50 transition shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'पोर्टल प्रवेश करा' : lang === 'hi' ? 'पोर्टल प्रवेश करें' : 'Access Portals'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/patient/emergency')}
                  className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{lang === 'mr' ? '१०८ आणीबाणी सेवा' : lang === 'hi' ? '१०८ आपातकालीन सेवा' : '108 Emergency SOS'}</span>
                </button>

                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="px-5 py-3 rounded-full bg-blue-900/80 hover:bg-blue-800 text-blue-100 border border-blue-400/40 text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-2 active:scale-95 cursor-pointer"
                  title="Open Voice Assistant for hands-free navigation"
                >
                  <Mic className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'mr' ? 'व्हॉइस सहाय्यक' : lang === 'hi' ? 'आवाज़ सहायक' : 'Voice Assistant'}</span>
                </button>
              </div>

              {/* Live District Metric Badges (4 KPIs) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/10 rounded-2xl p-3 sm:p-4 border border-white/15 text-left shadow-xs">
                  <div className="text-xl sm:text-2xl font-black font-mono text-white">36</div>
                  <p className="text-[11px] text-blue-100 font-semibold mt-0.5">
                    {lang === 'mr' ? 'कार्यरत PHC' : lang === 'hi' ? 'सक्रिय प्राथमिक स्वास्थ्य केंद्र' : 'Active PHCs'}
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-3 sm:p-4 border border-white/15 text-left shadow-xs">
                  <div className="text-xl sm:text-2xl font-black font-mono text-blue-200">847</div>
                  <p className="text-[11px] text-blue-100 font-semibold mt-0.5">
                    {lang === 'mr' ? 'एकूण केंद्रे' : lang === 'hi' ? 'कुल स्वास्थ्य केंद्र' : 'Total Facilities'}
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-3 sm:p-4 border border-white/15 text-left shadow-xs">
                  <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300">142K+</div>
                  <p className="text-[11px] text-blue-100 font-semibold mt-0.5">
                    {lang === 'mr' ? 'ABHA नागरिक' : lang === 'hi' ? 'पंजीकृत आभा नागरिक' : 'ABHA Patients'}
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-3 sm:p-4 border border-white/15 text-left shadow-xs">
                  <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">24/7</div>
                  <p className="text-[11px] text-blue-100 font-semibold mt-0.5">
                    {lang === 'mr' ? '१०८ रुग्णवाहिका' : lang === 'hi' ? '२४/७ एम्बुलेंस सेवा' : '108 Dispatch'}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Live Operational Command Showcase (Balanced, Clean, Professional, Fully Responsive) */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-5 sm:p-6 shadow-2xl space-y-4">
                
                {/* Card Header: Live Operations Network */}
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {lang === 'mr' ? 'आरोग्य थेट नियंत्रण कक्ष' : lang === 'hi' ? 'स्वास्थ्य सीधा नियंत्रण कक्ष' : 'Live Health Operations'}
                      </h3>
                      <p className="text-[11px] text-blue-200">
                        {lang === 'mr' ? '३६ जिल्हे जोडलेले · २४/७ सक्रिय' : lang === 'hi' ? '३६ जिले जुड़े · २४/७ सक्रिय' : '36 Districts Connected · 24/7 Active'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{lang === 'mr' ? 'थेट सेतू' : lang === 'hi' ? 'लाइव सेतु' : 'LIVE'}</span>
                  </div>
                </div>

                {/* 4 Interactive Feature Cards */}
                <div className="space-y-2.5">
                  {/* 108 Emergency Dispatch */}
                  <div 
                    onClick={() => navigate('/patient/emergency')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-red-400/40 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-300 flex items-center justify-center">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{lang === 'mr' ? '१०८ आणीबाणी रुग्णवाहिका' : lang === 'hi' ? '१०८ आपातकालीन एम्बुलेंस' : '108 Emergency Dispatch'}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-red-500/30 text-red-200 rounded font-mono font-bold">14m ETA</span>
                        </div>
                        <p className="text-[11px] text-blue-100/70">
                          {lang === 'mr' ? '१२ रुग्णवाहिका सज्ज · १-टॅप जीपीएस' : lang === 'hi' ? '१२ एम्बुलेंस तैनात · १-टैप जीपीएस' : '12 BLS/ALS units on call · 1-Tap GPS'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-300 group-hover:text-white transition group-hover:translate-x-0.5" />
                  </div>

                  {/* Telemedicine Live Queue */}
                  <div 
                    onClick={() => navigate('/consultation')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-emerald-400/40 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{lang === 'mr' ? 'थेट डॉक्टर टेलीकन्सल्ट' : lang === 'hi' ? 'सीधा डॉक्टर टेलीकंसल्ट' : 'Doctor Teleconsult Queue'}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/30 text-emerald-200 rounded font-mono font-bold">48 Online</span>
                        </div>
                        <p className="text-[11px] text-blue-100/70">
                          {lang === 'mr' ? 'कमी बँडविड्थ व्हिडिओ · <५ मि प्रतीक्षा' : lang === 'hi' ? 'कम बैंडविड्थ वीडियो · <५ मिनट प्रतीक्षा' : 'Low-latency HD audio/video · <5m wait'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-300 group-hover:text-white transition group-hover:translate-x-0.5" />
                  </div>

                  {/* ABHA Digital Health Record */}
                  <div 
                    onClick={() => navigate('/patient/records')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-blue-400/40 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-200 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{lang === 'mr' ? 'ABHA डिजिटल हेल्थ कार्ड' : lang === 'hi' ? 'आभा डिजिटल हेल्थ कार्ड' : 'ABHA Digital Health Record'}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-blue-400/30 text-blue-200 rounded font-mono font-bold">FHIR R4</span>
                        </div>
                        <p className="text-[11px] text-blue-100/70">
                          {lang === 'mr' ? '१४ अंकी सुरक्षित आयडी · थेट लॅब सिंक' : lang === 'hi' ? '१४ अंकों की सुरक्षित आईडी · सीधी लैब सिंक' : 'Instant 14-digit ABHA · NABL verified'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-300 group-hover:text-white transition group-hover:translate-x-0.5" />
                  </div>

                  {/* Medicine Supply Chain */}
                  <div 
                    onClick={() => navigate('/patient/medicines')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/40 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{lang === 'mr' ? 'स्थानिक औषध साठा' : lang === 'hi' ? 'स्थानीय दवा उपलब्धता' : 'PHC Drug Supply Chain'}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-400/30 text-amber-200 rounded font-mono font-bold">98.4% In Stock</span>
                        </div>
                        <p className="text-[11px] text-blue-100/70">
                          {lang === 'mr' ? 'थेट डिस्पेंसरी साठा · त्वरित वितरण' : lang === 'hi' ? 'सीधा डिस्पेंसरी स्टॉक · त्वरित वितरण' : 'Real-time dispensary inventory & tracking'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-300 group-hover:text-white transition group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Footer Badges */}
                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-blue-200">
                  <div className="flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ABDM Milestone 1, 2, 3</span>
                  </div>
                  <span className="font-mono text-emerald-300">99.98% Uptime</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. CONTINUOUS BIOMARKER MARQUEE TICKER */}
      <div className="bg-[#1C2B3A] py-3 text-white overflow-hidden border-y border-slate-700">
        <div className="flex whitespace-nowrap animate-marquee-track gap-8 items-center text-xs">
          {MARQUEE_BIOMARKERS.concat(MARQUEE_BIOMARKERS).map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-2.5 shrink-0 px-3">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-200">
                {lang === 'mr' ? item.labelMr : lang === 'hi' ? item.name : item.name}:
              </span>
              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-600">
                {item.value} {item.unit}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FOUR ROLE-BASED PORTALS (PATIENT, ASHA, DOCTOR, ADMIN) */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-y border-[#CFD8DC]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1A4B8C] bg-[#E8F0FE] px-3 py-1 rounded-full">
              {lang === 'mr' ? 'चार मुख्य पोर्टल्स' : lang === 'hi' ? 'चार मुख्य पोर्टल' : 'Dedicated User Portals'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C2B3A]">
              {lang === 'mr' ? 'प्रत्येक भूमिकेसाठी स्वतंत्र कार्यक्षेत्र' : lang === 'hi' ? 'प्रत्येक भूमिका के लिए समर्पित कार्यक्षेत्र' : 'Tailored for Every Healthcare Stakeholder'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Patient Portal */}
            <div 
              onClick={() => navigate('/patient')}
              className="p-6 rounded-2xl border border-[#CFD8DC] hover:border-[#1A4B8C] hover:shadow-md transition cursor-pointer space-y-4 bg-[#F8FAFC]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'रुग्ण पोर्टल' : lang === 'hi' ? 'नागरिक मरीज़ पोर्टल' : 'Citizen Patient Portal'}
                </h3>
                <p className="text-xs text-[#546E7A] leading-relaxed mt-2">
                  {lang === 'mr' 
                    ? 'अपॉइंटमेंट बुकिंग, ABHA रेकॉर्ड्स, लक्षण ट्रायज, औषध तपासणी आणि रेफरल ट्रॅकर.' 
                    : lang === 'hi'
                      ? 'अपॉइंटमेंट बुकिंग, आभा रिकॉर्ड, लक्षण ट्रिआज, दवा उपलब्धता और रेफरल ट्रैकर।'
                      : 'ABHA health card, appointment booking, lab results, medicine stock, and referral tracker.'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A4B8C]">
                <span>{lang === 'mr' ? 'प्रवेश करा' : lang === 'hi' ? 'प्रवेश करें' : 'Open Portal'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* ASHA Portal */}
            <div 
              onClick={() => navigate('/asha')}
              className="p-6 rounded-2xl border border-[#CFD8DC] hover:border-emerald-600 hover:shadow-md transition cursor-pointer space-y-4 bg-[#F8FAFC]"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'आशा कार्यकर्ती पोर्टल' : lang === 'hi' ? 'आशा कार्यकर्ता पोर्टल' : 'ASHA Field Worker Portal'}
                </h3>
                <p className="text-xs text-[#546E7A] leading-relaxed mt-2">
                  {lang === 'mr' 
                    ? 'ऑफलाइन दैनिक कार्यसूची, नवीन रुग्ण नोंदणी, फील्ड ट्रायज आणि थेट डॉक्टर टेलीकन्सल्ट मदत.' 
                    : lang === 'hi'
                      ? 'ऑफलाइन दैनिक कार्यसूची, नया मरीज़ पंजीकरण, फील्ड ट्रिआज और डॉक्टर टेलीकंसल्ट सहायता।'
                      : 'Offline field tasks, door-to-door screening, patient onboarding, and assisted doctor consults.'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span>{lang === 'mr' ? 'प्रवेश करा' : lang === 'hi' ? 'प्रवेश करें' : 'Open Portal'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Doctor Portal */}
            <div 
              onClick={() => navigate('/doctor')}
              className="p-6 rounded-2xl border border-[#CFD8DC] hover:border-[#F57C00] hover:shadow-md transition cursor-pointer space-y-4 bg-[#F8FAFC]"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F57C00] flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'डॉक्टर टेलीकन्सल्टेशन' : lang === 'hi' ? 'डॉक्टर टेलीकंसल्टेशन' : 'Doctor Teleconsult Portal'}
                </h3>
                <p className="text-xs text-[#546E7A] leading-relaxed mt-2">
                  {lang === 'mr' 
                    ? 'थेट व्हिडिओ कन्सल्ट रूम, डिजिटल प्रिस्क्रिप्शन जनरेटर आणि तज्ञ रेफरल व्यवस्था.' 
                    : lang === 'hi'
                      ? 'लाइव वीडियो कंसल्ट रूम, डिजिटल प्रिस्क्रिप्शन जनरेटर और विशेषज्ञ रेफरल व्यवस्था।'
                      : 'Live consult queue, digital Rx builder, EHR history access, and specialist referrals.'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F57C00]">
                <span>{lang === 'mr' ? 'प्रवेश करा' : lang === 'hi' ? 'प्रवेश करें' : 'Open Portal'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Admin Portal */}
            <div 
              onClick={() => navigate('/admin')}
              className="p-6 rounded-2xl border border-[#CFD8DC] hover:border-[#1C2B3A] hover:shadow-md transition cursor-pointer space-y-4 bg-[#F8FAFC]"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#1C2B3A] flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'जिल्हा प्रशासन डॅशबोर्ड' : lang === 'hi' ? 'जिला प्रशासन डैशबोर्ड' : 'District Health Admin'}
                </h3>
                <p className="text-xs text-[#546E7A] leading-relaxed mt-2">
                  {lang === 'mr' 
                    ? '३६ केंद्रांचे थेट संचलन, उच्च जोखीम ट्रॅकर, पुरवठा साखळी आणि रीचार्ट्स विश्लेषण.' 
                    : lang === 'hi'
                      ? '३६ केंद्रों का सीधा संचालन, उच्च जोखिम ट्रैकर, दवा आपूर्ति श्रृंखला और विश्लेषण।'
                      : 'Live 36-facility operational matrix, high-risk cohorts, drug supply, and performance KPIs.'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C2B3A]">
                <span>{lang === 'mr' ? 'प्रवेश करा' : lang === 'hi' ? 'प्रवेश करें' : 'Open Portal'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE TIMELINE: PATIENT JOURNEY */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1A4B8C] bg-[#E8F0FE] px-3 py-1 rounded-full">
            {lang === 'mr' ? 'रुग्ण प्रवास' : lang === 'hi' ? 'मरीज़ यात्रा' : 'Patient Journey'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C2B3A]">
            {lang === 'mr' ? 'गावातून जिल्हा रुग्णालयापर्यंत अखंड जोडणी' : lang === 'hi' ? 'गाँव से जिला अस्पताल तक निर्बाध स्वास्थ्य यात्रा' : 'Seamless Journey: Village Sub-Centre to District Hospital'}
          </h2>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timelineSteps.map((step, idx) => {
            const isActive = activeTimelineStep === idx;
            return (
              <button
                key={step.step}
                onClick={() => setActiveTimelineStep(idx)}
                className={`p-4 rounded-xl border text-left transition ${
                  isActive 
                    ? 'border-[#1A4B8C] bg-[#E8F0FE]/60 ring-1 ring-[#1A4B8C]' 
                    : 'border-[#CFD8DC] bg-white hover:bg-slate-50'
                }`}
              >
                <span className={`text-xs font-mono font-bold block ${isActive ? 'text-[#1A4B8C]' : 'text-[#546E7A]'}`}>
                  {lang === 'mr' ? 'टप्पा' : lang === 'hi' ? 'चरण' : 'Step'} {step.step}
                </span>
                <h4 className="text-xs font-bold text-[#1C2B3A] mt-1 line-clamp-2">
                  {lang === 'mr' ? step.titleMr : lang === 'hi' ? step.titleHi : step.titleEn}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#CFD8DC] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-3 max-w-xl">
            <div className="inline-block font-mono text-xs font-bold text-[#1A4B8C] bg-[#E8F0FE] px-2.5 py-1 rounded-md">
              {lang === 'mr' ? 'टप्पा' : lang === 'hi' ? 'चरण' : 'STEP'} {timelineSteps[activeTimelineStep].step}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1C2B3A]">
              {lang === 'mr' ? timelineSteps[activeTimelineStep].titleMr : lang === 'hi' ? timelineSteps[activeTimelineStep].titleHi : timelineSteps[activeTimelineStep].titleEn}
            </h3>
            <p className="text-xs sm:text-sm text-[#546E7A] leading-relaxed">
              {lang === 'mr' ? timelineSteps[activeTimelineStep].descMr : lang === 'hi' ? timelineSteps[activeTimelineStep].descHi : timelineSteps[activeTimelineStep].descEn}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-full bg-[#1A4B8C] text-white text-xs font-bold hover:bg-[#0D3470] transition shadow-sm shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>{lang === 'mr' ? 'थेट अनुभव घ्या' : lang === 'hi' ? 'लाइव सिमुलेशन देखें' : 'Try Live Simulation'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6. HEALTH PROGRAMS DIRECTORY */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-y border-[#CFD8DC]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1A4B8C] bg-[#E8F0FE] px-3 py-1 rounded-full">
              {lang === 'mr' ? 'शासकीय योजना' : lang === 'hi' ? 'सरकारी योजनाएं' : 'Government Programs'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C2B3A]">
              {lang === 'mr' ? 'राष्ट्रीय आरोग्य अभियानांतर्गत योजना' : lang === 'hi' ? 'राष्ट्रीय स्वास्थ्य मिशन अंतर्गत प्रमुख योजनाएं' : 'Integrated National Health Programs'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthPrograms.map((prog) => (
              <div key={prog.code} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#CFD8DC] space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#1A4B8C] tracking-wider">{prog.code}</span>
                <h4 className="text-sm font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? prog.titleMr : lang === 'hi' ? prog.titleHi : prog.titleEn}
                </h4>
                <p className="text-xs text-[#546E7A] leading-relaxed">
                  {lang === 'mr' ? prog.descMr : lang === 'hi' ? prog.descHi : prog.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-[#CFD8DC]">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1A4B8C] bg-[#E8F0FE] px-3 py-1 rounded-full">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C2B3A]">
              {lang === 'mr' ? 'वारंवार विचारले जाणारे प्रश्न' : lang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-[#CFD8DC] rounded-xl overflow-hidden transition">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#1C2B3A]">
                      {lang === 'mr' ? faq.qMr : lang === 'hi' ? faq.qHi : faq.qEn}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#546E7A] transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-[#546E7A] leading-relaxed border-t border-slate-100 pt-3">
                      {lang === 'mr' ? faq.aMr : lang === 'hi' ? faq.aHi : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. PORTAL ACCESS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#CFD8DC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-[#1A4B8C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Hospital className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  {lang === 'mr' ? 'पोर्टल निवडा' : lang === 'hi' ? 'स्वास्थ्य पोर्टल चुनें' : 'Select Healthcare Portal'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); navigate('/login'); }}
                className="w-full p-3.5 rounded-xl bg-[#1A4B8C] text-white text-left transition flex items-center justify-between group cursor-pointer shadow-xs hover:bg-[#0D3470]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {lang === 'mr' ? 'आरोग्य डेटाबेस लॉगिन व नोंदणी' : 'Unified Database Auth & Sign Up'}
                    </h4>
                    <p className="text-[11px] text-blue-200">
                      {lang === 'mr' ? 'प्राची-आशा, रोहित-आशा, डॉक्टर व प्रशासक खाती' : 'Prachi-ASHA, Rohit-ASHA, Doctor & Admin accounts'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => { setIsModalOpen(false); navigate('/patient/login'); }}
                className="w-full p-3.5 rounded-xl border border-[#CFD8DC] hover:border-[#1A4B8C] hover:bg-[#E8F0FE]/40 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C2B3A]">
                      {lang === 'mr' ? 'रुग्ण पोर्टल' : lang === 'hi' ? 'नागरिक मरीज़ पोर्टल' : 'Patient Portal'}
                    </h4>
                    <p className="text-[11px] text-[#546E7A]">
                      {lang === 'mr' ? 'लॉग इन, अपॉइंटमेंट व औषध तपासणी' : lang === 'hi' ? 'लॉगिन, अपॉइंटमेंट व दवा उपलब्धता' : 'OTP & ABHA login, appointments & medicine check'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#1A4B8C]" />
              </button>

              <button
                onClick={() => { setIsModalOpen(false); navigate('/asha'); }}
                className="w-full p-3.5 rounded-xl border border-[#CFD8DC] hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C2B3A]">
                      {lang === 'mr' ? 'आशा कार्यकर्ती पोर्टल' : lang === 'hi' ? 'आशा कार्यकर्ता पोर्टल' : 'ASHA Worker Portal'}
                    </h4>
                    <p className="text-[11px] text-[#546E7A]">
                      {lang === 'mr' ? 'ऑफलाइन कार्यसूची व गाव नोंदवही' : lang === 'hi' ? 'ऑफलाइन कार्यसूची व गाँव मरीज़ सूची' : 'Offline checklists, patient registry & triage'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#546E7A] group-hover:text-emerald-700" />
              </button>

              <button
                onClick={() => { setIsModalOpen(false); navigate('/doctor'); }}
                className="w-full p-3.5 rounded-xl border border-[#CFD8DC] hover:border-[#F57C00] hover:bg-amber-50/40 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#F57C00] flex items-center justify-center">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C2B3A]">
                      {lang === 'mr' ? 'डॉक्टर पोर्टल' : lang === 'hi' ? 'डॉक्टर टेलीकंसल्टेशन पोर्टल' : 'Doctor Teleconsultation Portal'}
                    </h4>
                    <p className="text-[11px] text-[#546E7A]">
                      {lang === 'mr' ? 'थेट व्हिडिओ कन्सल्ट व ई-प्रिस्क्रिप्शन' : lang === 'hi' ? 'सीधा वीडियो कंसल्ट व ई-प्रिस्क्रिप्शन' : 'Live video consult queue & digital prescription'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#F57C00]" />
              </button>

              <button
                onClick={() => { setIsModalOpen(false); navigate('/admin'); }}
                className="w-full p-3.5 rounded-xl border border-[#CFD8DC] hover:border-[#1C2B3A] hover:bg-slate-50 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#1C2B3A] flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C2B3A]">
                      {lang === 'mr' ? 'जिल्हा प्रशासन' : lang === 'hi' ? 'जिला प्रशासन डैशबोर्ड' : 'District Admin Dashboard'}
                    </h4>
                    <p className="text-[11px] text-[#546E7A]">
                      {lang === 'mr' ? '३६ केंद्रांचे थेट नियंत्रण व साठा मॅट्रिक्स' : lang === 'hi' ? '३६ केंद्रों का सीधा नियंत्रण व आपूर्ति मैट्रिक्स' : 'Facility matrix, analytics & drug supply'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#1C2B3A]" />
              </button>

              <button
                onClick={() => { setIsModalOpen(false); navigate('/interoperability'); }}
                className="w-full p-3.5 rounded-xl border border-blue-300 hover:border-[#1A4B8C] hover:bg-blue-50/50 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#1A4B8C] flex items-center justify-center">
                    <Network className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[#1C2B3A]">
                        {lang === 'mr' ? 'आंतरकार्यक्षमता केंद्र' : lang === 'hi' ? 'इंटरऑपरेबिलिटी हब' : 'Interoperability Hub'}
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        ABDM/FHIR/HMIS
                      </span>
                    </div>
                    <p className="text-[11px] text-[#546E7A]">
                      {lang === 'mr' ? 'HL7 FHIR R4 बंडल व NHM HMIS अहवाल' : lang === 'hi' ? 'HL7 FHIR R4 बंडल व NHM HMIS रिपोर्ट' : 'ABDM Milestones, FHIR R4 & NHM HMIS reports'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#546E7A] group-hover:text-[#1A4B8C]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Assistant Modal (Demand 11) */}
      <VoiceAssistantModal 
        isOpen={isVoiceModalOpen} 
        onClose={() => setIsVoiceModalOpen(false)} 
      />

      <Footer />
    </div>
  );
}
