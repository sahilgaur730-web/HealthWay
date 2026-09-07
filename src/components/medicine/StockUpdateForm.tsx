import React, { useState } from 'react';
import { Pill, CheckCircle2, Plus, Minus, ListOrdered, Calendar, Save, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface StockUpdateFormProps {
  medicineName: string;
  medicineGeneric: string;
  unit: string;
  initialQuantity?: number;
  initialBatch?: string;
  initialExpiry?: string;
  onSubmit: (data: {
    type: 'add' | 'set' | 'remove';
    quantity: number;
    batchNumber: string;
    expiryDate: string;
    notes: string;
  }) => void;
  onCancel?: () => void;
}

export default function StockUpdateForm({
  medicineName,
  medicineGeneric,
  unit,
  initialQuantity = 0,
  initialBatch = '',
  initialExpiry = '',
  onSubmit,
  onCancel
}: StockUpdateFormProps) {
  const { lang } = useLanguage();

  const [updateType, setUpdateType] = useState<'add' | 'set' | 'remove'>('add');
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [batchNumber, setBatchNumber] = useState(initialBatch);
  const [expiryDate, setExpiryDate] = useState(initialExpiry);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: updateType,
      quantity: Number(quantity),
      batchNumber,
      expiryDate,
      notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      
      {/* Medicine Title Header */}
      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
        <span className="text-[10px] uppercase font-bold text-[#1A4B8C] block">
          {lang === 'mr' ? 'औषध:' : 'Target Medicine:'}
        </span>
        <strong className="text-sm text-[#1C2B3A] block">{medicineName}</strong>
        <span className="text-[11px] text-[#546E7A]">{medicineGeneric}</span>
      </div>

      {/* Update Type Selector */}
      <div>
        <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1.5">
          {lang === 'mr' ? 'नोंदणी प्रकार निवडा' : 'Select Update Action'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'add', mr: 'साठा मिळाला (Receipt)', en: 'Add Stock (Received)', icon: Plus },
            { id: 'set', mr: 'थेट शिल्लक नोंद (Exact Count)', en: 'Set Exact Count', icon: ListOrdered },
            { id: 'remove', mr: 'वाटप / नष्ट (Dispensed)', en: 'Remove (Dispensed)', icon: Minus },
          ].map(t => {
            const Icon = t.icon;
            const isSelected = updateType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setUpdateType(t.id as any)}
                className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-[#1A4B8C] text-white border-[#1A4B8C] shadow-sm'
                    : 'bg-white text-[#546E7A] border-[#CFD8DC] hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] leading-tight">{lang === 'mr' ? t.mr : t.en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
          {lang === 'mr' ? `प्रमाण (${unit})` : `Quantity (${unit})`}
        </label>
        <input
          type="number"
          required
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="0"
          className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono font-bold focus:outline-none focus:border-[#1A4B8C]"
        />
      </div>

      {/* Batch & Expiry Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
            {lang === 'mr' ? 'बॅच नंबर (Batch No)' : 'Batch Number'}
          </label>
          <input
            type="text"
            required
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="e.g. BATCH-MH-2024"
            className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono focus:outline-none focus:border-[#1A4B8C]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
            {lang === 'mr' ? 'कालबाह्यता दिनांक (Expiry)' : 'Expiry Date'}
          </label>
          <input
            type="date"
            required
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
          />
        </div>
      </div>

      {/* Clinical / Storekeeper Notes */}
      <div>
        <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
          {lang === 'mr' ? 'नोंदणी कारण / टिप्पणी' : 'Transaction Remarks'}
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={lang === 'mr' ? 'उदा. राज्य वखार केंद्राकडून १५ बॉक्स प्राप्त झाले...' : 'e.g. Received shipment from State Medical Warehouse...'}
          className="w-full p-2.5 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#CFD8DC]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[#CFD8DC] text-xs font-bold text-[#546E7A] hover:bg-slate-50 rounded-xl transition"
          >
            {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{lang === 'mr' ? 'नोंद साठवा' : 'Save Update'}</span>
        </button>
      </div>

    </form>
  );
}
