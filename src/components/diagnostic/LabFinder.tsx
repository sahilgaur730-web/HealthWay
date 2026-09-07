import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  FlaskConical, 
  Search, 
  CheckCircle2, 
  PhoneCall, 
  ShieldCheck, 
  Home, 
  Filter 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { diagnosticService, DiagnosticLabFacility } from '../../services/diagnosticService';

interface LabFinderProps {
  onSelectLab?: (lab: DiagnosticLabFacility) => void;
  allowBooking?: boolean;
}

export default function LabFinder({ onSelectLab, allowBooking = false }: LabFinderProps) {
  const { lang } = useLanguage();
  const labs = diagnosticService.getNearbyLabs();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmpanelled, setFilterEmpanelled] = useState(false);
  const [filterHomeCollection, setFilterHomeCollection] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterGovtOnly, setFilterGovtOnly] = useState(false);

  const filteredLabs = labs.filter(lab => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      q === '' ||
      lab.nameMr.toLowerCase().includes(q) ||
      lab.nameEn.toLowerCase().includes(q) ||
      lab.address.toLowerCase().includes(q) ||
      lab.accreditation.toLowerCase().includes(q);

    const matchesEmpanelled = !filterEmpanelled || lab.isEmpanelled;
    const matchesHome = !filterHomeCollection || lab.hasHomeCollection;
    const matchesOpen = !filterOpenNow || lab.isOpenNow;
    const matchesGovt = !filterGovtOnly || lab.isGovtOnly;

    return matchesSearch && matchesEmpanelled && matchesHome && matchesOpen && matchesGovt;
  });

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Chips Bar */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1C2B3A] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1A4B8C]" />
              <span>
                {lang === 'mr' ? 'जवळील अधिकृत लॅब व निदान केंद्र शोधक' : 'Nearby Diagnostic Laboratories & Imaging Centers'}
              </span>
            </h3>
            <p className="text-[11px] text-[#546E7A]">
              {lang === 'mr' ? 'अंतर, चाचणी क्षमता आणि शासकीय पॅनल स्थितीनुसार शोधा' : 'Filter by distance, tests available, NABL status and home sample pickup'}
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'लॅबचे नाव किंवा ठिकाण शोधा...' : 'Search lab facility...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 rounded-xl border border-slate-300 text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
            />
          </div>
        </div>

        {/* 4 Interactive Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase text-[#546E7A] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>{lang === 'mr' ? 'फिल्टर्स:' : 'Filters:'}</span>
          </span>

          {/* 1. Empanelled */}
          <button
            type="button"
            onClick={() => setFilterEmpanelled(!filterEmpanelled)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${
              filterEmpanelled 
                ? 'bg-blue-100 text-[#1A4B8C] border-blue-300 shadow-xs ring-1 ring-blue-300' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#1A4B8C]" />
            <span>{lang === 'mr' ? 'पॅनेलवर अधिकृत (Empanelled)' : 'Empanelled'}</span>
          </button>

          {/* 2. Home Collection */}
          <button
            type="button"
            onClick={() => setFilterHomeCollection(!filterHomeCollection)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${
              filterHomeCollection 
                ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-xs ring-1 ring-purple-300' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-purple-700" />
            <span>{lang === 'mr' ? 'घरपोच नमुना संकलन (Home Collection)' : 'Home Collection'}</span>
          </button>

          {/* 3. Open Now */}
          <button
            type="button"
            onClick={() => setFilterOpenNow(!filterOpenNow)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${
              filterOpenNow 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs ring-1 ring-emerald-300' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <span>{lang === 'mr' ? 'आत्ता उघडे (Open Now)' : 'Open Now'}</span>
          </button>

          {/* 4. Govt Only */}
          <button
            type="button"
            onClick={() => setFilterGovtOnly(!filterGovtOnly)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${
              filterGovtOnly 
                ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs ring-1 ring-amber-300' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            <span>{lang === 'mr' ? 'फक्त शासकीय (Govt Only)' : 'Govt Only'}</span>
          </button>

          {(filterEmpanelled || filterHomeCollection || filterOpenNow || filterGovtOnly || searchQuery) && (
            <button
              onClick={() => {
                setFilterEmpanelled(false);
                setFilterHomeCollection(false);
                setFilterOpenNow(false);
                setFilterGovtOnly(false);
                setSearchQuery('');
              }}
              className="text-[11px] text-red-600 hover:underline font-bold ml-auto"
            >
              {lang === 'mr' ? 'फिल्टर्स क्लिअर करा' : 'Clear Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLabs.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            {lang === 'mr' ? 'कोणतीही लॅब आढळली नाही. कृपया वेगळा फिल्टर निवडा.' : 'No diagnostic facilities match the selected filters.'}
          </div>
        ) : (
          filteredLabs.map(lab => (
            <div 
              key={lab.id} 
              className="p-4 rounded-2xl border border-[#CFD8DC] bg-white hover:border-[#1A4B8C] transition shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1A4B8C] border border-blue-100">
                    {lab.distanceKm} km {lang === 'mr' ? 'अंतर' : 'away'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {lab.isOpenNow ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Open</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Closed
                      </span>
                    )}

                    {lab.isEmpanelled && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Empanelled
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#1C2B3A] leading-snug">
                    {lang === 'mr' ? lab.nameMr : lab.nameEn}
                  </h4>
                  <p className="text-[11px] text-[#546E7A] mt-0.5">
                    {lang === 'mr' ? lab.typeMr : lab.typeEn}
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <FlaskConical className="w-3.5 h-3.5 text-[#1A4B8C]" />
                    <span>{lab.testsAvailableCount}+ {lang === 'mr' ? 'चाचण्या उपलब्ध' : 'Tests Available'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>TAT: {lab.turnaroundTimeLabel}</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{lab.accreditation}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{lab.address}</span>
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${lab.phone}`}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1"
                  title="Call Facility"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </a>

                {onSelectLab && (
                  <button
                    type="button"
                    onClick={() => onSelectLab(lab)}
                    className="flex-1 py-1.5 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition text-center shadow-xs"
                  >
                    {lang === 'mr' ? 'लॅब निवडा' : 'Select Facility'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
