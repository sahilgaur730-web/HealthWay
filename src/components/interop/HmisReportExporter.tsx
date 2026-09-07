import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  BarChart3,
  Calendar
} from 'lucide-react';
import { InteropService, HmisIndicator } from '../../services/interopService';
import { useLanguage } from '../../context/LanguageContext';

export default function HmisReportExporter() {
  const { lang } = useLanguage();
  const [indicators] = useState<HmisIndicator[]>(() => InteropService.getHmisMonthlyReport());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExporting, setIsExporting] = useState(false);

  const categories = ['All', 'Maternal Health', 'Child Health', 'Immunization', 'OPD & Telehealth', 'Communicable Diseases'];

  const filtered = selectedCategory === 'All'
    ? indicators
    : indicators.filter((i) => i.category === selectedCategory);

  const handleExportCsv = () => {
    setIsExporting(true);
    const csvContent = InteropService.generateHmisCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MH_HMIS_PUNE_DISTRICT_2024_06.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 1200);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-sm overflow-hidden space-y-4">
      
      {/* Header Bar */}
      <div className="p-5 bg-white border-b border-[#CFD8DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-[#1C2B3A]">
                {lang === 'mr' ? 'राष्ट्रीय आरोग्य अभियान — HMIS मासिक अहवाल' : 'National Health Mission — HMIS Monthly Indicator Report'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                June 2024
              </span>
            </div>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'महाराष्ट्र राज्य आरोग्य सोसायटी पोर्टलवर थेट अपलोड करण्यासाठी प्रमाणित मासिक दर्शक अहवाल' 
                : 'Standardized monthly health indicators for direct reporting to State Health Society & MoHFW'}
            </p>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="px-4 py-2 rounded-full bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs shrink-0 active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>
            {isExporting 
              ? (lang === 'mr' ? 'तयार होत आहे...' : 'Generating CSV...') 
              : (lang === 'mr' ? 'अधिकृत CSV डाउनलोड करा' : 'Export HMIS CSV')}
          </span>
        </button>
      </div>

      {/* Filter Category Chips */}
      <div className="px-5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-[#546E7A] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          {lang === 'mr' ? 'वर्गवारी:' : 'Category:'}
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full font-semibold transition shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#1A4B8C] text-white shadow-2xs'
                : 'bg-slate-100 text-[#546E7A] hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Indicators Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-y border-[#CFD8DC] text-[#546E7A] font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Form</th>
              <th className="py-3 px-4">{lang === 'mr' ? 'मासिक दर्शक (Indicator)' : 'Indicator Description'}</th>
              <th className="py-3 px-4 text-right">{lang === 'mr' ? 'लक्ष्य (Target)' : 'Monthly Target'}</th>
              <th className="py-3 px-4 text-right">{lang === 'mr' ? 'साध्य (Achieved)' : 'Achieved'}</th>
              <th className="py-3 px-4 text-right">{lang === 'mr' ? 'प्रगती' : 'Progress'}</th>
              <th className="py-3 px-4 text-center">{lang === 'mr' ? 'स्थिती' : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium text-[#1C2B3A]">
            {filtered.map((ind) => {
              const isOptimal = ind.performancePercent >= 95;
              const isAcceptable = ind.performancePercent >= 85 && ind.performancePercent < 95;
              return (
                <tr key={ind.code} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-[#1A4B8C]">{ind.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-500">{ind.formNumber}</td>
                  <td className="py-3 px-4 font-semibold">
                    <div>{lang === 'mr' ? ind.nameMr : ind.nameEn}</div>
                    <span className="text-[10px] text-slate-500 font-normal">{ind.category}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">{ind.target.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#1C2B3A]">{ind.achieved.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono font-bold text-xs">{ind.performancePercent}%</span>
                      <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOptimal ? 'bg-emerald-500' : isAcceptable ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(ind.performancePercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isOptimal
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isAcceptable
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {ind.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="p-4 bg-slate-50 border-t border-[#CFD8DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#546E7A]">
        <div>
          <span>{lang === 'mr' ? 'एकूण ८४७ संस्थांचा एकत्रित डेटा' : 'Aggregated from 847 health facilities across Pune District'}</span>
        </div>
        <div className="font-mono font-semibold text-[#1A4B8C]">
          Reporting Period: June 2024 · Form 1 to 12
        </div>
      </div>

    </div>
  );
}
