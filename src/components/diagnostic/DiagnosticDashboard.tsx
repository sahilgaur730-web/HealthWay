import React, { useState } from 'react';
import { 
  FlaskConical, 
  Building2, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { diagnosticService, DiagnosticLabFacility } from '../../services/diagnosticService';
import TestOrderTracker from './TestOrderTracker';
import LabFinder from './LabFinder';
import CreateTestOrder from './CreateTestOrder';

interface DiagnosticDashboardProps {
  allowOrdering?: boolean;
}

export default function DiagnosticDashboard({ allowOrdering = true }: DiagnosticDashboardProps) {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'TRACKER' | 'LAB_FINDER'>('TRACKER');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [preselectedLab, setPreselectedLab] = useState<DiagnosticLabFacility | null>(null);

  const orders = diagnosticService.getAllOrders();
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
  const criticalOrders = orders.filter(o => o.hasCriticalValue).length;

  const handleSelectLabFromFinder = (lab: DiagnosticLabFacility) => {
    setPreselectedLab(lab);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1A4B8C] flex items-center justify-center shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'डिजिटल निदान व प्रयोगशाळा समन्वय केंद्र' : 'Diagnostic Coordination & Laboratory Network'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1A4B8C] border border-blue-200 uppercase">
                Demand 6
              </span>
            </div>
            <p className="text-xs text-[#546E7A] mt-1">
              {lang === 'mr'
                ? 'जवळील लॅब नेटवर्क, डिजिटल टेस्ट ऑर्डरिंग (४०+ चाचण्या), बारकोड ट्रॅकिंग आणि ABHA रेकॉर्डमध्ये स्वयंचलित अहवाल समक्रमण'
                : 'Integrated lab finder, digital test orders (40+ catalog), barcode sample tracking & instant ABHA EHR sync'}
            </p>
          </div>
        </div>

        {allowOrdering && (
          <button
            onClick={() => {
              setPreselectedLab(null);
              setIsOrderModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'mr' ? 'नवीन लॅब टेस्ट ऑर्डर करा' : 'Prescribe Lab Test'}</span>
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-[#CFD8DC] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#546E7A]">{lang === 'mr' ? 'एकूण लॅब ऑर्डर्स' : 'Total Test Orders'}</span>
          <div className="text-2xl font-bold text-[#1C2B3A]">{totalOrders}</div>
          <span className="text-[11px] text-slate-500">Government Network</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#CFD8DC] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#546E7A]">{lang === 'mr' ? 'प्रलंबित / तपासणी सुरू' : 'In Analysis / Run'}</span>
          <div className="text-2xl font-bold text-[#1A4B8C]">{pendingOrders}</div>
          <span className="text-[11px] text-blue-600 font-semibold">Under Analyzer Run</span>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs space-y-1 ${
          criticalOrders > 0 ? 'bg-red-50/80 border-red-300' : 'bg-white border-[#CFD8DC]'
        }`}>
          <span className="text-[10px] font-bold uppercase text-red-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>{lang === 'mr' ? 'गंभीर स्तर (Critical)' : 'Critical Findings'}</span>
          </span>
          <div className="text-2xl font-bold text-red-700">{criticalOrders}</div>
          <span className="text-[11px] text-red-600 font-medium">Immediate Doctor Review</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#CFD8DC] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#546E7A]">{lang === 'mr' ? 'ABHA मध्ये अपलोड' : 'EHR / ABHA Synced'}</span>
          <div className="text-2xl font-bold text-emerald-700">{completedOrders}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">NABL Verified Reports</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#CFD8DC] pb-2">
        <button
          onClick={() => setActiveTab('TRACKER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'TRACKER'
              ? 'bg-[#1A4B8C] text-white shadow-xs'
              : 'text-[#546E7A] hover:text-[#1C2B3A] hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{lang === 'mr' ? 'चाचणी ऑर्डर्स व अहवाल ट्रॅकर' : 'Test Orders & Status Tracker'}</span>
        </button>

        <button
          onClick={() => setActiveTab('LAB_FINDER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'LAB_FINDER'
              ? 'bg-[#1A4B8C] text-white shadow-xs'
              : 'text-[#546E7A] hover:text-[#1C2B3A] hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{lang === 'mr' ? 'जवळील लॅब व इमेजिंग सेंटर्स' : 'Nearby Accredited Labs'}</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'TRACKER' ? (
        <TestOrderTracker allowOrdering={allowOrdering} />
      ) : (
        <LabFinder onSelectLab={handleSelectLabFromFinder} allowBooking={true} />
      )}

      {/* Prescribe Test Order Modal */}
      {isOrderModalOpen && (
        <CreateTestOrder
          onClose={() => {
            setIsOrderModalOpen(false);
            setPreselectedLab(null);
          }}
          preselectedLabId={preselectedLab?.id}
          onOrderCreated={() => {
            setIsOrderModalOpen(false);
            setPreselectedLab(null);
            setActiveTab('TRACKER');
          }}
        />
      )}

    </div>
  );
}
