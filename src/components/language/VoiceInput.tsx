/**
 * HealthWay Multilingual System - Voice Input & Speech Component (Demand 11)
 * Government of Maharashtra - Integrated Rural Health Platform
 * Supports Marathi (mr-IN), Hindi (hi-IN), and English (en-IN).
 * Strictly zero unicode emojis.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  AlertCircle, 
  X, 
  Command
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const VOICE_SYMPTOM_MAP: Record<string, Record<string, string>> = {
  en: {
    'chest pain': 'chest_pain',
    'fever': 'high_fever',
    'cough': 'mild_cough',
    'headache': 'mild_headache',
    'difficulty breathing': 'difficulty_breathing',
    'vomiting': 'vomiting',
    'stomach pain': 'severe_abdominal',
    'body pain': 'mild_headache',
    'cold': 'mild_cold'
  },
  mr: {
    'छातीत दुखणे': 'chest_pain',
    'ताप': 'high_fever',
    'खोकला': 'mild_cough',
    'डोकेदुखी': 'mild_headache',
    'श्वास घेण्यास त्रास': 'difficulty_breathing',
    'उलटी': 'vomiting',
    'पोटदुखी': 'severe_abdominal',
    'अंगदुखी': 'mild_headache',
    'सर्दी': 'mild_cold'
  },
  hi: {
    'सीने में दर्द': 'chest_pain',
    'बुखार': 'high_fever',
    'खांसी': 'mild_cough',
    'सिरदर्द': 'mild_headache',
    'सांस लेने में तकलीफ': 'difficulty_breathing',
    'उल्टी': 'vomiting',
    'पेट दर्द': 'severe_abdominal',
    'बदन दर्द': 'mild_headache',
    'जुकाम': 'mild_cold'
  }
};

export interface VoiceInputProps {
  onResult?: (text: string) => void;
  onSymptomDetected?: (symptoms: string[]) => void;
  placeholder?: string;
  continuous?: boolean;
  autoStart?: boolean;
}

export default function VoiceInput({
  onResult,
  onSymptomDetected,
  placeholder,
  continuous = false,
  autoStart = false
}: VoiceInputProps) {
  const { t, speechCode, language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [animLevel, setAnimLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const animIntervalRef = useRef<any>(null);

  useEffect(() => {
    const supported = typeof window !== 'undefined' && 
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    setIsSupported(supported);
    if (autoStart && supported) {
      startListening();
    }
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      animIntervalRef.current = setInterval(() => {
        setAnimLevel(Math.floor(Math.random() * 60) + 20);
      }, 120);
    } else {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      setAnimLevel(0);
    }
  }, [isListening]);

  const detectSymptoms = useCallback((text: string) => {
    const map = VOICE_SYMPTOM_MAP[language] || VOICE_SYMPTOM_MAP.en;
    const detected: string[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(map).forEach(([keyword, symptomId]) => {
      if (lowerText.includes(keyword.toLowerCase())) {
        detected.push(symptomId);
      }
    });

    if (detected.length > 0 && onSymptomDetected) {
      onSymptomDetected(detected);
    }
    return detected;
  }, [language, onSymptomDetected]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechCode;
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTrans += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        setInterimTranscript(interim);

        if (finalTrans) {
          setTranscript((prev) => prev + finalTrans);
          setInterimTranscript('');
          detectSymptoms(finalTrans);
          if (onResult) onResult(finalTrans);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        switch (event.error) {
          case 'no-speech':
            setError('No speech detected. Please speak clearly into the microphone.');
            break;
          case 'audio-capture':
            setError('Microphone not accessible. Please verify hardware permissions.');
            break;
          case 'not-allowed':
            setError('Microphone permission denied. Allow audio capture in browser.');
            break;
          default:
            setError('Voice recognition link interrupted. Please try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setError(err?.message || 'Failed to start speech listener');
      setIsListening(false);
    }
  }, [isSupported, speechCode, continuous, detectSymptoms, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError('');
  };

  if (!isSupported) {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>{t('voice.notSupported')}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-lg mx-auto">
      {/* Transcript Box */}
      {(transcript || interimTranscript) && (
        <div className="w-full bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-950 relative leading-relaxed min-h-[60px] animate-fadeIn">
          <span className="font-semibold text-emerald-900">{transcript}</span>
          {interimTranscript && (
            <span className="text-slate-500 italic ml-1">{interimTranscript}</span>
          )}
          <button
            onClick={clearTranscript}
            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
            title="Clear text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mic Trigger Section */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={toggleListening}
          aria-label={isListening ? t('voice.tapToStop') : t('voice.tapToSpeak')}
          className={`w-18 h-18 rounded-full flex items-center justify-center text-white transition duration-300 relative shadow-lg ${
            isListening 
              ? 'bg-rose-600 hover:bg-rose-700 scale-105 shadow-rose-500/30 ring-8 ring-rose-500/20' 
              : 'bg-[#1A4B8C] hover:bg-blue-800 shadow-blue-900/20'
          }`}
        >
          {isListening ? (
            <Square className="w-7 h-7 fill-white" />
          ) : (
            <Mic className="w-7 h-7 stroke-[2.2]" />
          )}
        </button>

        {/* Dynamic Voice Waves */}
        {isListening && (
          <div className="flex items-center gap-1.5 h-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-rose-600 rounded-full transition-all duration-150"
                style={{
                  height: `${Math.max(8, Math.min(28, (animLevel * (i + 1)) % 28 + 6))}px`
                }}
              />
            ))}
          </div>
        )}

        <p className="text-xs text-[#546E7A] font-medium text-center">
          {isListening ? t('voice.listening') : placeholder || t('voice.tapToSpeak')}
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="w-full p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={startListening}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('voice.tryAgain')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Text to Speech Component
 * Reads aloud text in Marathi, Hindi, or English.
 */
export function TextToSpeech({ text, autoPlay = false }: { text: string; autoPlay?: boolean }) {
  const { speechCode, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (autoPlay && text) {
      speak();
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechCode;
    utterance.rate = 0.88; // Rural pace calibrated for comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [text, speechCode]);

  const stop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  return (
    <button
      onClick={isSpeaking ? stop : speak}
      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
        isSpeaking
          ? 'bg-rose-600 hover:bg-rose-700 text-white'
          : 'bg-[#1A4B8C] hover:bg-blue-800 text-white'
      }`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-3.5 h-3.5" />
          <span>{t('voice.stopReading')}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5" />
          <span>{t('voice.readAloud')}</span>
        </>
      )}
    </button>
  );
}

/**
 * Voice Command Bar
 * Hands-free speech control for rural portals.
 */
export function VoiceCommandBar({ commands }: { commands: Record<string, () => void> }) {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  const handleVoiceResult = (text: string) => {
    setLastCommand(text);
    const lowerText = text.toLowerCase();

    Object.entries(commands).forEach(([trigger, action]) => {
      if (lowerText.includes(trigger.toLowerCase())) {
        action();
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-[#CFD8DC] rounded-2xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            isActive
              ? 'bg-rose-600 text-white'
              : 'bg-[#1C2B3A] text-white hover:bg-slate-800'
          }`}
        >
          <Command className="w-3.5 h-3.5" />
          <span>{isActive ? 'Listening...' : t('voice.voiceCommands')}</span>
        </button>

        {lastCommand && (
          <span className="text-[11px] text-[#546E7A] italic">
            Heard: "{lastCommand}"
          </span>
        )}
      </div>

      {isActive && (
        <VoiceInput
          onResult={handleVoiceResult}
          continuous={true}
          autoStart={true}
          placeholder="Speak a command (e.g. triage, records, ambulance)..."
        />
      )}
    </div>
  );
}

