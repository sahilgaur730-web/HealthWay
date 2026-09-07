/**
 * HealthWay Native Trilingual Engine & Audio Guidance
 * Government of Maharashtra - Integrated Rural Health Platform
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import en from './translations/en';
import mr from './translations/mr';
import hi from './translations/hi';

export type Language = 'en' | 'mr' | 'hi';

export interface LanguageMeta {
  code: Language;
  name: string;
  nativeName: string;
  badgeText: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    badgeText: 'EN',
    speechCode: 'en-IN',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    badgeText: 'म',
    speechCode: 'mr-IN',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    badgeText: 'हि',
    speechCode: 'hi-IN',
  },
];

const TRANSLATIONS: Record<Language, any> = { en, mr, hi };

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, defaultText?: string) => string;
  speak: (text: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  supportedLanguages: LanguageMeta[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = '@healthway:selected_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('mr'); // Default to Marathi per Govt MH mandate
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Restore saved language on boot
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi')) {
          setLanguageState(saved as Language);
        }
      } catch (err) {
        // Fallback to default
      }
    })();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      console.warn('Failed to persist language preference', err);
    }
  }, []);

  // Translation resolver with dot-notation and fallback
  const t = useCallback((key: string, defaultText?: string): string => {
    if (!key) return defaultText || '';

    // Direct string match first (for legacy web strings)
    const currentDict = TRANSLATIONS[language];
    const enDict = TRANSLATIONS.en;

    const resolvePath = (obj: any, path: string) => {
      return path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj);
    };

    let result = resolvePath(currentDict, key);
    if (result === undefined && language !== 'en') {
      result = resolvePath(enDict, key);
    }

    if (result === undefined) {
      return defaultText !== undefined ? defaultText : key;
    }

    return String(result);
  }, [language]);

  // Audio Guidance Hook with expo-speech
  const speak = useCallback((text: string) => {
    if (!text) return;
    try {
      Speech.stop();
      setIsSpeaking(true);

      const meta = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

      Speech.speak(text, {
        language: meta.speechCode,
        rate: 0.9,
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.warn('Speech engine error', err);
      setIsSpeaking(false);
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    try {
      Speech.stop();
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    speak,
    isSpeaking,
    stopSpeaking,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }), [language, setLanguage, t, speak, isSpeaking, stopSpeaking]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
