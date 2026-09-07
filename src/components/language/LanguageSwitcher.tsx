/**
 * HealthWay Multilingual System - Language Switcher Component
 * Government of Maharashtra - Integrated Rural Health Platform
 * Supports English, Marathi, and Hindi.
 * Strictly zero unicode emojis.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check, X, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../../i18n/LanguageContext';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, changeLanguage, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    changeLanguage(code);
    setDropdownOpen(false);
  };

  if (compact) {
    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#CFD8DC] text-[#1C2B3A] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          title={t('language.title')}
          aria-label="Switch Language"
          aria-expanded={dropdownOpen}
        >
          <Languages className="w-3.5 h-3.5 text-[#1A4B8C] shrink-0" />
          <span className="font-bold tracking-tight">{currentLang.nativeName}</span>
          <ChevronDown className={`w-3 h-3 text-[#546E7A] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white border border-[#CFD8DC] shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#546E7A] border-b border-slate-100 flex items-center gap-1.5">
              <Languages className="w-3 h-3 text-[#1A4B8C]" />
              <span>{t('language.title')}</span>
            </div>
            <div className="p-1 space-y-0.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8F0FE] text-[#1A4B8C] font-bold'
                        : 'text-[#1C2B3A] hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold ${
                        isSelected ? 'bg-[#1A4B8C] text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {lang.flagText}
                      </span>
                      <span>{lang.nativeName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1A4B8C] stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showModal && (
          <LanguageModal
            currentLang={language}
            onSelect={(code) => {
              handleSelect(code);
              setShowModal(false);
            }}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1A4B8C] text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
        aria-label="Select Language"
        aria-expanded={dropdownOpen}
      >
        <Languages className="w-4 h-4 text-[#1A4B8C] shrink-0" />
        <span>{currentLang.nativeName} ({currentLang.name})</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-2xl bg-white border border-[#CFD8DC] shadow-2xl py-2 z-[100] animate-in fade-in zoom-in-95">
          <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#546E7A] border-b border-slate-100 flex items-center gap-1.5">
            <Languages className="w-3 h-3 text-[#1A4B8C]" />
            <span>{t('language.title')}</span>
          </div>
          <div className="p-1.5 space-y-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#E8F0FE] text-[#1A4B8C] font-bold'
                      : 'text-[#1C2B3A] hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                      isSelected ? 'bg-[#1A4B8C] text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {lang.flagText}
                    </span>
                    <div>
                      <div className="font-bold">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-500">{lang.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#1A4B8C] stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <LanguageModal
          currentLang={language}
          onSelect={(code) => {
            handleSelect(code);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

interface LanguageModalProps {
  currentLang: Language;
  onSelect: (code: Language) => void;
  onClose: () => void;
}

function LanguageModal({ currentLang, onSelect, onClose }: LanguageModalProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl border border-[#CFD8DC] shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-[#1A4B8C] text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {t('language.title')}
              </h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {t('language.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Language Grid */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelect(lang.code)}
                  className={`p-4 rounded-2xl border text-center transition relative flex flex-col items-center justify-center gap-2 ${
                    isSelected ? 'border-[#1A4B8C] bg-blue-50/60 shadow-xs ring-2 ring-[#1A4B8C]/20' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                    isSelected ? 'bg-[#1A4B8C] text-white' : 'bg-slate-100 text-[#1C2B3A]'
                  }`}>
                    {lang.flagText}
                  </div>

                  <div>
                    <div className="font-bold text-sm text-[#1C2B3A]">
                      {lang.nativeName}
                    </div>
                    <div className="text-[11px] text-[#546E7A]">
                      {lang.name}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1A4B8C] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Switch Button Bar */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-xs font-bold text-[#546E7A] uppercase tracking-wider">
              Quick Switch:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onSelect(lang.code)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                    currentLang === lang.code ? 'bg-[#1A4B8C] text-white' : 'bg-slate-100 text-[#1C2B3A] hover:bg-slate-200'
                  }`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#CFD8DC] flex items-center justify-between text-xs text-[#546E7A]">
          <span>{t('language.voiceLanguage')}: {SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.speechCode || 'mr-IN'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1C2B3A] text-white font-bold hover:bg-slate-800 transition"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
