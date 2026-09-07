import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic } from 'lucide-react';
import { voiceService, VoiceLanguage } from '../../services/voiceService';
import { useLanguage } from '../../context/LanguageContext';

interface AudioGuidanceButtonProps {
  textMr: string;
  textEn: string;
  textHi?: string;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'primary' | 'secondary' | 'ghost';
  labelMr?: string;
  labelEn?: string;
  labelHi?: string;
}

export default function AudioGuidanceButton({
  textMr,
  textEn,
  textHi,
  className = '',
  size = 'sm',
  variant = 'ghost',
  labelMr,
  labelEn,
  labelHi,
}: AudioGuidanceButtonProps) {
  const { lang } = useLanguage();
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);

  const getActiveText = () => {
    if (lang === 'hi') return textHi || textMr || textEn;
    if (lang === 'mr') return textMr;
    return textEn;
  };

  const getActiveLabel = () => {
    if (lang === 'hi') return labelHi || labelMr || labelEn;
    if (lang === 'mr') return labelMr || labelEn;
    return labelEn;
  };

  useEffect(() => {
    const unsubscribe = voiceService.subscribe((state) => {
      const activeText = getActiveText();
      setIsSpeakingThis(state.isSpeaking && state.currentUtteranceText === activeText);
    });
    return unsubscribe;
  }, [lang, textMr, textEn, textHi]);

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeakingThis) {
      voiceService.stopSpeaking();
    } else {
      const textToSpeak = getActiveText();
      voiceService.speak(textToSpeak, lang as VoiceLanguage);
    }
  };

  const baseStyle = 'inline-flex items-center gap-1.5 rounded-full font-semibold transition active:scale-95';
  
  const sizeStyle = size === 'sm' 
    ? 'px-2.5 py-1 text-[11px]' 
    : 'px-3.5 py-1.5 text-xs';

  const variantStyle = {
    primary: 'bg-[#1A4B8C] text-white hover:bg-[#0D3470] shadow-xs',
    secondary: 'bg-blue-50 text-[#1A4B8C] border border-blue-200 hover:bg-blue-100',
    ghost: isSpeakingThis 
      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
      : 'text-[#546E7A] hover:text-[#1A4B8C] hover:bg-slate-100',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}
      title={lang === 'mr' ? (isSpeakingThis ? 'आवाज थांबवा' : 'मराठीत ऐका') : lang === 'hi' ? (isSpeakingThis ? 'आवाज़ बंद करें' : 'हिंदी में सुनें') : (isSpeakingThis ? 'Stop audio' : 'Listen in audio')}
      aria-label={lang === 'mr' ? 'मराठी आवाज मार्गदर्शन' : lang === 'hi' ? 'हिंदी आवाज़ मार्गदर्शन' : 'Audio voice guidance'}
    >
      {isSpeakingThis ? (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <VolumeX className="w-3.5 h-3.5 text-amber-700" />
          <span>{lang === 'mr' ? 'थांबवा' : lang === 'hi' ? 'रोकें' : 'Stop'}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-[#1A4B8C]" />
          {(labelMr || labelEn || labelHi) ? (
            <span>{getActiveLabel()}</span>
          ) : (
            <span>{lang === 'mr' ? 'ऐका' : lang === 'hi' ? 'सुनें' : 'Listen'}</span>
          )}
        </>
      )}
    </button>
  );
}
