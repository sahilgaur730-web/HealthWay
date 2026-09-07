import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  ArrowRight, 
  Activity, 
  Hospital, 
  Pill, 
  PhoneCall, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { voiceService, VoiceLanguage } from '../../services/voiceService';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptCaptured?: (transcript: string) => void;
}

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  onTranscriptCaptured,
}: VoiceAssistantModalProps) {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState<{ mr: string; en: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const unsubscribe = voiceService.subscribe((state) => {
      setIsListening(state.isListening);
      setIsSpeaking(state.isSpeaking);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setAssistantReply(null);
      // Greet the user in chosen language
      voiceService.playWelcomePrompt(lang as VoiceLanguage);
      setStatusMessage(
        lang === 'mr' 
          ? 'माईक बटण दाबून तुमची अडचण किंवा प्रश्न सांगा' 
          : 'Tap the microphone to speak your question or health condition'
      );
    } else {
      voiceService.stopSpeaking();
      voiceService.stopListening();
    }
  }, [isOpen, lang]);

  if (!isOpen) return null;

  const handleStartListening = () => {
    setTranscript('');
    setAssistantReply(null);
    setStatusMessage(lang === 'mr' ? 'ऐकत आहे... कृपया बोला' : 'Listening... please speak now');

    voiceService.startListening(
      (captured) => {
        setTranscript(captured);
        handleProcessVoiceInput(captured);
      },
      (error) => {
        setStatusMessage(
          lang === 'mr' 
            ? 'आवाज समजला नाही. कृपया पुन्हा प्रयत्न करा.' 
            : 'Could not capture voice. Please try again.'
        );
      },
      lang as VoiceLanguage
    );
  };

  const handleProcessVoiceInput = (input: string) => {
    const lower = input.toLowerCase();

    // Intent routing logic
    if (lower.includes('ताप') || lower.includes('खोकला') || lower.includes('fever') || lower.includes('cough') || lower.includes('तपासणी') || lower.includes('triage')) {
      const reply = {
        mr: 'तुमची लक्षणे नोंदवली गेली आहेत. डिजिटल ट्रायज प्रणालीकडे जात आहोत.',
        en: 'Symptom noted. Transferring to the Digital Clinical Triage engine.',
      };
      setAssistantReply(reply);
      voiceService.speak(reply[lang as VoiceLanguage], lang as VoiceLanguage);
      if (onTranscriptCaptured) onTranscriptCaptured(input);
      setTimeout(() => {
        onClose();
        navigate('/patient/triage');
      }, 2400);
    } else if (lower.includes('औषध') || lower.includes('medicine') || lower.includes('गोळी') || lower.includes('stock')) {
      const reply = {
        mr: 'शासकीय औषध साठा तपासणी पोर्टल उघडत आहे. येथे सर्व प्राथमिक आरोग्य केंद्रांमधील औषध उपलब्धता दिसेल.',
        en: 'Opening Medicine Stock Tracker to check live inventory across all PHCs.',
      };
      setAssistantReply(reply);
      voiceService.speak(reply[lang as VoiceLanguage], lang as VoiceLanguage);
      setTimeout(() => {
        onClose();
        navigate('/patient/medicines');
      }, 2400);
    } else if (lower.includes('आणीबाणी') || lower.includes('emergency') || lower.includes('108') || lower.includes('रुग्णवाहिका') || lower.includes('ambulance')) {
      const reply = {
        mr: '१०८ आणीबाणी सेवा तात्काळ सक्रिय केली जात आहे. धीर धरा, आम्ही मदत पाठवत आहोत.',
        en: '108 Emergency ambulance dispatch is being activated immediately.',
      };
      setAssistantReply(reply);
      voiceService.speak(reply[lang as VoiceLanguage], lang as VoiceLanguage);
      setTimeout(() => {
        onClose();
        navigate('/patient/emergency');
      }, 2000);
    } else if (lower.includes('डॉक्टर') || lower.includes('doctor') || lower.includes('सल्ला') || lower.includes('कन्सल्ट') || lower.includes('consult')) {
      const reply = {
        mr: 'प्राथमिक आरोग्य केंद्रातील डॉक्टरांशी टेलीकन्सल्टेशन अपॉइंटमेंट बुक करत आहोत.',
        en: 'Connecting to the PHC Teleconsultation desk for doctor appointment.',
      };
      setAssistantReply(reply);
      voiceService.speak(reply[lang as VoiceLanguage], lang as VoiceLanguage);
      setTimeout(() => {
        onClose();
        navigate('/patient/book');
      }, 2400);
    } else {
      const reply = {
        mr: `आम्हाला "${input}" हा प्रश्न समजला. खालील पर्यायांपैकी योग्य पर्याय निवडा.`,
        en: `Received: "${input}". Please choose from the relevant options below.`,
      };
      setAssistantReply(reply);
      voiceService.speak(reply[lang as VoiceLanguage], lang as VoiceLanguage);
      if (onTranscriptCaptured) onTranscriptCaptured(input);
    }
  };

  const quickVoicePrompts = [
    {
      mr: 'मला तीव्र ताप आणि डोकेदुखी आहे',
      en: 'I have severe fever and headache',
      icon: Activity,
      route: '/patient/triage',
    },
    {
      mr: 'डायबेटीसची मेटफॉर्मिन गोळी उपलब्ध आहे का?',
      en: 'Is Metformin diabetes medicine in stock?',
      icon: Pill,
      route: '/patient/medicines',
    },
    {
      mr: 'डॉक्टरांशी थेट व्हिडिओ सल्ला हवा आहे',
      en: 'Connect me with the PHC Medical Officer',
      icon: Hospital,
      route: '/patient/book',
    },
    {
      mr: 'तातडीची १०८ रुग्णवाहिका बोलवा',
      en: 'Dispatch 108 Emergency Ambulance now',
      icon: PhoneCall,
      route: '/patient/emergency',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0E356A] text-white flex items-center justify-between border-b border-[#1A4B8C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Mic className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                {lang === 'mr' ? 'ग्रामीण व्हॉइस सहाय्यक (मराठी/English)' : 'Rural Health Voice Assistant'}
              </h3>
              <p className="text-[11px] text-blue-200">
                {lang === 'mr' ? 'अल्पसाक्षर नागरिकांसाठी थेट बोलून मार्गदर्शन' : 'Hands-free voice navigation for low-literacy users'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'mr' ? 'en' : 'mr')}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 transition"
            >
              {lang === 'mr' ? 'English' : 'मराठी'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Audio & Speech Visualizer */}
        <div className="p-6 text-center space-y-6 bg-[#F8FAFC]">
          
          {/* Main Microphone Button with Pulsing Wave Rings */}
          <div className="relative inline-flex items-center justify-center">
            {isListening && (
              <>
                <span className="absolute w-28 h-28 rounded-full bg-red-400/30 animate-ping" />
                <span className="absolute w-24 h-24 rounded-full bg-red-500/20 animate-pulse" />
              </>
            )}
            {isSpeaking && (
              <>
                <span className="absolute w-28 h-28 rounded-full bg-blue-400/30 animate-ping" />
                <span className="absolute w-24 h-24 rounded-full bg-blue-500/20 animate-pulse" />
              </>
            )}

            <button
              onClick={handleStartListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition active:scale-95 ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700'
                  : isSpeaking
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-[#1A4B8C] hover:bg-[#0D3470]'
              }`}
              title={lang === 'mr' ? 'बोलण्यासाठी येथे दाबा' : 'Click to speak'}
            >
              {isListening ? (
                <Mic className="w-9 h-9 animate-bounce" />
              ) : isSpeaking ? (
                <Volume2 className="w-9 h-9 animate-pulse" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          <div>
            <p className="text-xs sm:text-sm font-bold text-[#1C2B3A]">
              {isListening 
                ? (lang === 'mr' ? 'आम्ही ऐकत आहोत... कृपया स्पष्ट बोला' : 'Listening... please speak clearly')
                : isSpeaking 
                ? (lang === 'mr' ? 'व्हॉइस उत्तर ऐकवत आहे...' : 'Speaking response...')
                : statusMessage}
            </p>
            <p className="text-[11px] text-[#546E7A] mt-1">
              {lang === 'mr' 
                ? 'उदा. "मला ताप आहे", "औषध साठा", "१०८ रुग्णवाहिका"' 
                : 'e.g. "I have fever", "check medicine", "108 ambulance"'}
            </p>
          </div>

          {/* Captured Transcript Box */}
          {transcript && (
            <div className="bg-white p-3.5 rounded-2xl border border-blue-200 text-left space-y-1 shadow-xs animate-in fade-in">
              <span className="text-[10px] font-bold text-[#1A4B8C] uppercase tracking-wider block">
                {lang === 'mr' ? 'तुमचा आवाज (You Said):' : 'Voice Input:'}
              </span>
              <p className="text-xs font-semibold text-[#1C2B3A] italic">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Assistant Speech Response Box */}
          {assistantReply && (
            <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-300 text-left space-y-1 shadow-xs animate-in fade-in">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3 h-3 text-blue-700" />
                {lang === 'mr' ? 'आरोग्य सहाय्यक उत्तर:' : 'Assistant Guidance:'}
              </span>
              <p className="text-xs text-blue-950 font-medium">
                {lang === 'mr' ? assistantReply.mr : assistantReply.en}
              </p>
            </div>
          )}

        </div>

        {/* Quick Voice Shortcut Chips */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#CFD8DC] space-y-2">
          <span className="text-[11px] font-bold text-[#546E7A] uppercase tracking-wider block">
            {lang === 'mr' ? 'किंवा खालीलपैकी एक निवडा:' : 'Or tap a quick command:'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickVoicePrompts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const text = lang === 'mr' ? item.mr : item.en;
                    handleProcessVoiceInput(text);
                  }}
                  className="p-2.5 rounded-xl border border-[#CFD8DC] hover:border-[#1A4B8C] hover:bg-[#E8F0FE]/50 text-left transition flex items-center gap-2 text-xs group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1A4B8C] flex items-center justify-center shrink-0 group-hover:bg-[#1A4B8C] group-hover:text-white transition">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#1C2B3A] font-medium leading-snug line-clamp-2">
                    {lang === 'mr' ? item.mr : item.en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
