import React, { useState } from 'react';
import { Truck, Package, Clock, CheckCircle2, Building2, Calendar, FileText, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MedicineEngineService, StockIndentRequest } from '../../services/medicineEngine';

export default function SupplyChainView() {
  const { lang } = useLanguage();
  const [indents, setIndents] = useState<StockIndentRequest[]>(() => MedicineEngineService.getIndents());
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const handleConfirmReceipt = (indentId: string) => {
    const all = MedicineEngineService.getIndents();
    const ind = all.find(i => i.id === indentId);
    if (ind) {
      ind.status = 'DELIVERED';
      // Replenish stock in inventory
      ind.items.forEach(req => {
        const allStock = MedicineEngineService.getAllStock();
        const current = allStock.find(s => s.facilityId === ind.facilityId && s.medicineId === req.medicineId);
        const newStockVal = (current ? current.currentStock : 0) + req.requestedQuantity;
        MedicineEngineService.updateStockLevel(ind.facilityId, req.medicineId, newStockVal);
      });
      localStorage.setItem('healthway_stock_indents_v2', JSON.stringify(all));
      setIndents(all);
      setConfirmedId(indentId);
      setTimeout(() => setConfirmedId(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Pipeline Banner */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C2B3A]">
              {lang === 'mr' ? 'राज्य व जिल्हा मध्यवर्ती पुरवठा साखळी नेटवर्क' : 'Central Warehouse Supply Pipeline'}
            </h3>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr'
                ? 'जिल्हा मध्यवर्ती औषध भांडार (औंध, पुणे) कडून थेट वाहतूक व वितरण ट्रॅकिंग'
                : 'Direct dispatch tracking from District Central Medical Store (Aundh, Pune)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-green-100 text-green-800 rounded-xl border border-green-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            {lang === 'mr' ? 'पुरवठा साखळी थेट जोडलेली' : 'Warehouse ERP Connected'}
          </span>
        </div>
      </div>

      {/* Indents Pipeline Cards */}
      <div className="space-y-4">
        {indents.map((indent) => (
          <div 
            key={indent.id}
            className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#CFD8DC]/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A4B8C] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-mono text-xs text-[#1C2B3A]">{indent.indentNumber}</strong>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      indent.urgency === 'CRITICAL_EMERGENCY' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {indent.urgency.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#546E7A] mt-0.5 block">
                    {indent.facilityName} • {indent.dateCreated}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1.5 ${
                  indent.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-[#1A4B8C]'
                }`}>
                  <Package className="w-3.5 h-3.5" />
                  {indent.status}
                </span>

                {indent.status !== 'DELIVERED' && (
                  <button
                    onClick={() => handleConfirmReceipt(indent.id)}
                    className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? 'साठा केंद्रावर आला (Receipt)' : 'Confirm Delivery'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Warehouse destination & Transit tracking ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-[#CFD8DC]/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#78909C] block">
                  {lang === 'mr' ? 'पुरवठादार वखार केंद्र:' : 'Dispatch Warehouse:'}
                </span>
                <strong className="text-[#1C2B3A]">{indent.warehouseDestination}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#78909C] block">
                  {lang === 'mr' ? 'वाहतूक व पार्सल ट्रॅकिंग:' : 'Transit Tracking Ref:'}
                </span>
                <strong className="font-mono text-[#1A4B8C]">{indent.trackingNumber || 'MSRTC-CARGO-INTRANSIT'}</strong>
              </div>
            </div>

            {/* Items in Indent */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#546E7A] block">
                {lang === 'mr' ? 'मागणी केलेली औषधे:' : 'Requisitioned Items:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {indent.items.map((it, idx) => (
                  <div key={idx} className="p-2.5 bg-[#F8FAFC] border border-[#CFD8DC]/60 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-[#1C2B3A] block">{it.medicineName}</strong>
                      <span className="text-[10px] text-[#78909C]">{it.reason}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-[#1A4B8C]">+{it.requestedQuantity}</span>
                      <span className="text-[10px] text-[#546E7A] block">{it.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
