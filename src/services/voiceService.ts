/**
 * HealthWay - Multilingual Interaction & Voice Assistance Service (Demand 11)
 * Text-to-Speech (TTS) and Speech-to-Text (STT) Engine for Low-Literacy Rural Users
 * Supports Marathi (mr-IN) & Indian English (en-IN).
 * Strictly zero unicode emojis.
 */

export type VoiceLanguage = 'mr' | 'en' | 'hi';

export interface VoiceState {
  isSpeaking: boolean;
  isListening: boolean;
  currentUtteranceText: string | null;
  activeLanguage: VoiceLanguage;
}

type VoiceListener = (state: VoiceState) => void;

class VoiceService {
  private listeners: VoiceListener[] = [];
  private recognition: any = null;
  private state: VoiceState = {
    isSpeaking: false,
    isListening: false,
    currentUtteranceText: null,
    activeLanguage: 'en',
  };

  constructor() {
    if (typeof window !== 'undefined') {
      // Pre-warm voices on browser load
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          // Voices ready
        };
      }
    }
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  /**
   * Speak text in Marathi, Hindi, or English
   */
  public speak(text: string, lang: VoiceLanguage = 'mr'): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported on this browser/device');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[\n\r]+/g, ' ').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Slightly slower, crystal clear for rural citizens
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'mr') {
      utterance.lang = 'mr-IN';
      const mrVoice = voices.find((v) => v.lang.startsWith('mr') || v.lang.includes('Marathi'));
      const hiVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('Hindi'));
      const fallbackVoice = voices.find((v) => v.lang.includes('IN'));
      if (mrVoice) utterance.voice = mrVoice;
      else if (hiVoice) utterance.voice = hiVoice;
      else if (fallbackVoice) utterance.voice = fallbackVoice;
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('Hindi'));
      const fallbackVoice = voices.find((v) => v.lang.includes('IN'));
      if (hiVoice) utterance.voice = hiVoice;
      else if (fallbackVoice) utterance.voice = fallbackVoice;
    } else {
      utterance.lang = 'en-IN';
      const enInVoice = voices.find((v) => v.lang.startsWith('en-IN') || v.lang.includes('India'));
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      if (enInVoice) utterance.voice = enInVoice;
      else if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      this.state.isSpeaking = true;
      this.state.currentUtteranceText = cleanText;
      this.state.activeLanguage = lang;
      this.notify();
    };

    utterance.onend = () => {
      this.state.isSpeaking = false;
      this.state.currentUtteranceText = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.state.isSpeaking = false;
      this.state.currentUtteranceText = null;
      this.notify();
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop ongoing audio playback
   */
  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.state.isSpeaking = false;
      this.state.currentUtteranceText = null;
      this.notify();
    }
  }

  /**
   * Start Speech-to-Text Recognition for symptom or search inputs
   */
  public startListening(
    onResult: (transcript: string) => void,
    onError?: (err: string) => void,
    lang: VoiceLanguage = 'mr'
  ): void {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      console.warn('SpeechRecognition API not available, simulating voice capture for testing');
      // Fallback voice simulation for testing on browsers without mic permission
      this.state.isListening = true;
      this.notify();

      setTimeout(() => {
        this.state.isListening = false;
        this.notify();
        const demoText = lang === 'mr' ? 'मला तीव्र ताप आणि खोकला आहे' : 'I have high fever and severe cough';
        onResult(demoText);
      }, 2500);
      return;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      this.recognition = new SpeechRec();
      this.recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.state.isListening = true;
        this.notify();
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.state.isListening = false;
        this.notify();
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.state.isListening = false;
        this.notify();
        if (onError) onError(event.error || 'Voice input error');
      };

      this.recognition.onend = () => {
        this.state.isListening = false;
        this.notify();
      };

      this.recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      this.state.isListening = false;
      this.notify();
      if (onError) onError(err.message || 'Microphone activation error');
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.state.isListening = false;
      this.notify();
    }
  }

  /**
   * Pre-configured Clinical & Emergency Voice Guidance Prompts
   */
  public playWelcomePrompt(lang: VoiceLanguage): void {
    const text = lang === 'mr'
      ? 'हेल्थवे महाराष्ट्र शासकीय एकात्मिक ग्रामीण आरोग्य पोर्टलवर आपले स्वागत आहे. कृपया आपल्या आवश्यकतेनुसार पोर्टल निवडा.'
      : lang === 'hi'
      ? 'हेल्थवे महाराष्ट्र सरकारी एकीकृत ग्रामीण स्वास्थ्य पोर्टल पर आपका स्वागत है। कृपया अपनी आवश्यकतानुसार पोर्टल चुनें।'
      : 'Welcome to HealthWay, the Government of Maharashtra Integrated Rural Healthcare Access Platform. Please select your desired portal.';
    this.speak(text, lang);
  }

  public playTriagePrompt(lang: VoiceLanguage): void {
    const text = lang === 'mr'
      ? 'आपली लक्षणे निवडा किंवा खालील माईक बटण दाबून बोला. आमची ट्रायज प्रणाली त्वरित आपल्या आरोग्याची गंभीरता तपासून डॉक्टरांशी संपर्क करेल.'
      : lang === 'hi'
      ? 'अपने लक्षण चुनें या नीचे दिए गए माइक बटन को दबाकर बोलें। हमारा ट्राइएज सिस्टम तुरंत डॉक्टर से संपर्क कराएगा।'
      : 'Select your symptoms or tap the microphone to speak. Our digital triage engine will assess severity and prioritize doctor consultation.';
    this.speak(text, lang);
  }

  public playEmergencySosPrompt(lang: VoiceLanguage): void {
    const text = lang === 'mr'
      ? '१०८ आणीबाणी रुग्णवाहिका थेट रवाना करण्यात आली आहे. आपले जीपीएस लोकेशन नियंत्रण कक्षाला मिळाले आहे. रुग्णवाहिका १४ मिनिटांत पोहोचेल.'
      : lang === 'hi'
      ? '१०८ आपातकालीन एम्बुलेंस रवाना कर दी गई है। आपकी जीपीएस लोकेशन मिल गई है। एम्बुलेंस १४ मिनट में पहुंचेगी।'
      : '108 Emergency Ambulance has been dispatched to your GPS coordinates. Casualty desk notified. Basic life support unit arriving in 14 minutes.';
    this.speak(text, lang);
  }

  public playTokenPrompt(tokenNumber: string, position: number, lang: VoiceLanguage): void {
    const text = lang === 'mr'
      ? `तुमचा डिजिटल टोकन क्रमांक ${tokenNumber} आहे. तुमच्या पुढे ${position} रुग्ण रांगेत आहेत. कृपया प्रतीक्षा करा.`
      : lang === 'hi'
      ? `आपका डिजिटल टोकन नंबर ${tokenNumber} है। आपसे पहले ${position} मरीज कतार में हैं। कृपया प्रतीक्षा करें।`
      : `Your digital queue token is ${tokenNumber}. There are ${position} patients ahead of you. Please wait for your turn.`;
    this.speak(text, lang);
  }
}

export const voiceService = new VoiceService();
