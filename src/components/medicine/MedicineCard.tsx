import React from 'react';
import { Pill, CheckCircle2, AlertTriangle, AlertCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MedicineItemModel, StockStatusConfig } from '../../utils/medicineEngine';

interface MedicineCardProps {
  medicine: MedicineItemModel;
  stockStatus?: StockStatusConfig;
  currentQuantity?: number;
  onCheckAvailability?: (medicine: MedicineItemModel) => void;
}

export default function MedicineCard({ 
  medicine, 
  stockStatus, 
  currentQuantity, 
  onCheckAvailability 
}: MedicineCardProps) {
  const { lang } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm hover:border-[#1A4B8C]/40 transition flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Category & Program Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-[#546E7A]">
            {medicine.category} · {medicine.form}
          </span>
          {medicine.program && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1A4B8C] border border-blue-100">
              {medicine.program}
            </span>
          )}
        </div>

        {/* Medicine Name & Strength */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1C2B3A] leading-snug">
              {lang === 'mr' ? medicine.nameMr : medicine.name}
            </h4>
            <p className="text-[11px] text-[#546E7A] mt-0.5 font-medium">
              {medicine.generic} • {medicine.strength}
            </p>
          </div>
        </div>

        {/* Usage Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(lang === 'mr' ? medicine.useForMr : medicine.useFor).map((u, idx) => (
            <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569]">
              {u}
            </span>
          ))}
        </div>

        {/* Stock Status if available */}
        {stockStatus && (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-[#CFD8DC]/60 flex items-center justify-between text-xs">
            <span className="text-[#546E7A] text-[11px]">
              {lang === 'mr' ? 'उपलब्ध प्रमाण:' : 'In Stock:'} <strong className="text-[#1C2B3A] font-mono">{currentQuantity ?? 0} {lang === 'mr' ? medicine.unitMr : medicine.unit}</strong>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
              stockStatus.id === 'ADEQUATE' ? 'bg-green-100 text-green-800' :
              stockStatus.id === 'LOW' ? 'bg-amber-100 text-amber-800' :
              stockStatus.id === 'CRITICAL' ? 'bg-orange-100 text-orange-800' :
              stockStatus.id === 'EXPIRING_SOON' ? 'bg-purple-100 text-purple-800' :
              'bg-red-100 text-red-700'
            }`}>
              {stockStatus.id === 'ADEQUATE' && <CheckCircle2 className="w-3 h-3" />}
              {stockStatus.id === 'LOW' && <AlertTriangle className="w-3 h-3" />}
              {stockStatus.id === 'CRITICAL' && <AlertCircle className="w-3 h-3" />}
              {stockStatus.id === 'EXPIRING_SOON' && <Clock className="w-3 h-3" />}
              {stockStatus.id === 'OUT_OF_STOCK' && <XCircle className="w-3 h-3" />}
              <span>{lang === 'mr' ? stockStatus.labelMr : stockStatus.label}</span>
            </span>
          </div>
        )}
      </div>

      {onCheckAvailability && (
        <button
          onClick={() => onCheckAvailability(medicine)}
          className="w-full py-2 bg-[#1A4B8C] hover:bg-[#0D3470] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>{lang === 'mr' ? 'आरोग्य केंद्रात साठा तपासा' : 'Check Center Availability'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
