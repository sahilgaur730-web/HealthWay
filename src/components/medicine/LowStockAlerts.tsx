import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, Clock, Truck, CheckCircle2, ArrowRight, Pill } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FacilityStockItem, MedicineEngineService } from '../../services/medicineEngine';

interface LowStockAlertsProps {
  onReorder?: (facilityId: string) => void;
}

export default function LowStockAlerts({ onReorder }: LowStockAlertsProps) {
  const { lang } = useLanguage();
  const stockList = useMemo(() => MedicineEngineService.getAllStock(), []);
  const catalog = useMemo(() => MedicineEngineService.getMedicinesCatalog(), []);

  const criticalAndLow = useMemo(() => {
    return stockList.filter(s => s.status === 'CRITICAL' || s.status === 'OUT_OF_STOCK' || s.status === 'LOW' || s.status === 'EXPIRING_SOON');
  }, [stockList]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#CFD8DC]">
        <div>
          <h3 className="text-sm font-bold text-[#1C2B3A] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{lang === 'mr' ? 'साठा सतर्कता व टंचाई व्यवस्थापन' : 'Low Stock & Critical Alert Center'}</span>
          </h3>
          <p className="text-xs text-[#546E7A] mt-0.5">
            {lang === 'mr'
              ? 'आरोग्य उपकेंद्रे आणि प्राथमिक केंद्रांमधील तातडीच्या औषध पुनर्नोंदणीची थेट यादी'
              : 'Real-time surveillance of stockouts, depleted buffers, and expiring drug batches'}
          </p>
        </div>

        {onReorder && (
          <button
            onClick={() => onReorder('FAC-01')}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Truck className="w-4 h-4" />
            <span>{lang === 'mr' ? 'सर्व टंचाईसाठी एकत्रित पुरवठा आदेश' : 'Trigger Bulk Replenishment'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {criticalAndLow.map((item) => {
          const med = catalog.find(m => m.id === item.medicineId);
          if (!med) return null;

          const isStockout = item.status === 'OUT_OF_STOCK';
          const isCritical = item.status === 'CRITICAL';
          const isExpiring = item.status === 'EXPIRING_SOON';

          return (
            <div 
              key={`${item.facilityId}-${item.medicineId}`}
              className={`bg-white rounded-2xl border p-4 shadow-sm space-y-3 transition ${
                isStockout 
                  ? 'border-red-300 bg-red-50/10' 
                  : isCritical
                    ? 'border-orange-300 bg-orange-50/10'
                    : isExpiring
                      ? 'border-purple-300 bg-purple-50/10'
                      : 'border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isStockout ? 'bg-red-100 text-red-700' :
                    isCritical ? 'bg-orange-100 text-orange-700' :
                    isExpiring ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {isStockout && <AlertCircle className="w-4 h-4" />}
                    {isCritical && <AlertTriangle className="w-4 h-4" />}
                    {isExpiring && <Clock className="w-4 h-4" />}
                    {!isStockout && !isCritical && !isExpiring && <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C2B3A]">{lang === 'mr' ? med.nameMr : med.nameEn}</h4>
                    <p className="text-[11px] text-[#546E7A]">{med.genericName}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isStockout ? 'bg-red-100 text-red-800' :
                  isCritical ? 'bg-orange-100 text-orange-800' :
                  isExpiring ? 'bg-purple-100 text-purple-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-[#CFD8DC]/60">
                <div>
                  <span className="text-[10px] text-[#78909C] uppercase font-bold block">
                    {lang === 'mr' ? 'आरोग्य केंद्र:' : 'Facility:'}
                  </span>
                  <strong className="text-[#1C2B3A]">{lang === 'mr' ? item.facilityNameMr : item.facilityName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#78909C] uppercase font-bold block">
                    {lang === 'mr' ? 'शिल्लक प्रमाण:' : 'Current Qty:'}
                  </span>
                  <strong className={`font-mono ${isStockout ? 'text-red-700' : 'text-[#1C2B3A]'}`}>
                    {item.currentStock} {lang === 'mr' ? item.unitMr : item.unit}
                  </strong>
                  <span className="text-[10px] text-[#78909C] ml-1">({item.daysOfSupplyRemaining}d buffer)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-[#546E7A] font-mono">
                  Exp: {item.expiryDate} ({item.daysUntilExpiry}d)
                </span>
                {onReorder && (
                  <button
                    onClick={() => onReorder(item.facilityId)}
                    className="px-3 py-1 bg-[#1A4B8C] hover:bg-[#0D3470] text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Truck className="w-3 h-3" />
                    <span>{lang === 'mr' ? 'मागणी नोंदवा' : 'Reorder'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {criticalAndLow.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-10 text-center text-[#546E7A] space-y-2">
          <CheckCircle2 className="w-10 h-10 mx-auto text-green-600" />
          <h4 className="font-bold text-sm text-[#1C2B3A]">
            {lang === 'mr' ? 'अभिनंदन! सर्व औषध साठा पुरेसा आहे' : 'All essential medicines in adequate stock!'}
          </h4>
          <p className="text-xs">
            {lang === 'mr' ? 'कोणत्याही आरोग्य केंद्रात टंचाई किंवा संपलेला साठा नाही.' : 'No stockouts or low-buffer alerts currently active.'}
          </p>
        </div>
      )}
    </div>
  );
}
