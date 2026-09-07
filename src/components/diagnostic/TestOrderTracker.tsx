import React, { useState } from 'react';
import { 
  FlaskConical, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  ChevronRight, 
  Eye, 
  Plus, 
  Filter, 
  RefreshCw 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  diagnosticService, 
  TestOrderItem, 
  TestOrderStatus, 
  TestPriority 
} from '../../services/diagnosticService';
import { getDiagnosticStatusBadge, getPriorityBadge } from '../../utils/notificationUtils';
import LabResultViewer from './LabResultViewer';
import CreateTestOrder from './CreateTestOrder';

const ORDER_STEPS: TestOrderStatus[] = [
  'ORDERED',
  'SAMPLE_COLLECTED',
  'IN_TRANSIT',
  'PROCESSING',
  'COMPLETED',
];

const ORDER_STEP_LABELS: Record<TestOrderStatus, { mr: string; en: string }> = {
  ORDERED: { mr: 'नोंदणीकृत', en: 'Requisition' },
  SAMPLE_COLLECTED: { mr: 'नमुना संकलित', en: 'Collected' },
  IN_TRANSIT: { mr: 'वाहतुकीत', en: 'In Transit' },
  PROCESSING: { mr: 'लॅब विश्लेषण', en: 'Analyzing' },
  COMPLETED: { mr: 'पूर्ण अहवाल', en: 'Verified' },
  CANCELLED: { mr: 'रद्द', en: 'Cancelled' },
};

interface TestOrderTrackerProps {
  allowOrdering?: boolean;
}

export default function TestOrderTracker({ allowOrdering = true }: TestOrderTrackerProps) {
  const { lang } = useLanguage();
  const [orders, setOrders] = useState<TestOrderItem[]>(() => diagnosticService.getAllOrders());
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CRITICAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [viewingOrder, setViewingOrder] = useState<TestOrderItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const reloadData = () => {
    setOrders(diagnosticService.getAllOrders());
    if (viewingOrder) {
      setViewingOrder(diagnosticService.getOrderById(viewingOrder.id) || null);
    }
  };

  const handleAdvanceStatus = (order: TestOrderItem) => {
    const currentIdx = ORDER_STEPS.indexOf(order.status);
    if (currentIdx >= 0 && currentIdx < ORDER_STEPS.length - 1) {
      const nextStatus = ORDER_STEPS[currentIdx + 1];
      diagnosticService.updateOrderStatus(order.id, nextStatus);
      reloadData();
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = 
      filter === 'ALL' ? true :
      filter === 'PENDING' ? o.status !== 'COMPLETED' && o.status !== 'CANCELLED' :
      filter === 'COMPLETED' ? o.status === 'COMPLETED' :
      o.hasCriticalValue;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      q === '' ||
      o.patientNameMr.toLowerCase().includes(q) ||
      o.patientNameEn.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.barcode.toLowerCase().includes(q) ||
      o.tests.some(t => t.nameEn.toLowerCase().includes(q) || t.nameMr.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const criticalCount = orders.filter(o => o.hasCriticalValue).length;
  const pendingCount = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
  const completedCount = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="space-y-4">
      
      {/* Action Header & Tabs */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl flex-wrap">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'ALL' ? 'bg-white text-[#1A4B8C] shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            {lang === 'mr' ? 'सर्व' : 'All Orders'} ({orders.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'PENDING' ? 'bg-white text-amber-800 shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            {lang === 'mr' ? 'प्रलंबित / सुरू' : 'Pending / Run'} ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'COMPLETED' ? 'bg-white text-emerald-800 shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            {lang === 'mr' ? 'पूर्ण अहवाल' : 'Completed'} ({completedCount})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filter === 'CRITICAL' ? 'bg-white text-red-700 shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>{lang === 'mr' ? 'गंभीर स्तर (Critical)' : 'Critical'} ({criticalCount})</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'तपासणी, रुग्ण किंवा बारकोड शोधा...' : 'Search test or barcode...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 rounded-xl border border-slate-300 text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
            />
          </div>

          <button
            onClick={reloadData}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {allowOrdering && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'नवीन चाचणी' : 'Order Test'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            {lang === 'mr' ? 'कोणतीही चाचणी ऑर्डर आढळली नाही.' : 'No diagnostic orders found matching filter.'}
          </div>
        ) : (
          filteredOrders.map(order => {
            const statusBadge = getDiagnosticStatusBadge(order.status, lang);
            const priorityBadge = getPriorityBadge(order.priority, lang);
            const stepIdx = ORDER_STEPS.indexOf(order.status);

            return (
              <div 
                key={order.id} 
                className={`p-5 rounded-2xl border transition bg-white space-y-3.5 shadow-xs hover:shadow-md ${
                  order.hasCriticalValue ? 'border-red-300 ring-1 ring-red-200' : 'border-[#CFD8DC] hover:border-[#1A4B8C]'
                }`}
              >
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A4B8C] flex items-center justify-center shrink-0">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#1C2B3A]">
                          {order.tests.map(t => lang === 'mr' ? t.nameMr : t.nameEn).join(' + ')}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityBadge.className}`}>
                          {priorityBadge.label}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#546E7A] mt-0.5">
                        {lang === 'mr' ? 'रुग्ण:' : 'Patient:'} <strong className="text-slate-800">{lang === 'mr' ? order.patientNameMr : order.patientNameEn}</strong> (ABHA: <span className="font-mono">{order.abhaId}</span>) · {lang === 'mr' ? order.facilityMr : order.facilityEn}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {order.barcode}
                    </span>
                  </div>
                </div>

                {/* Progress Bar (ORDERED -> SAMPLE_COLLECTED -> IN_TRANSIT -> PROCESSING -> COMPLETED) */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                    <span>{lang === 'mr' ? 'नमुना व चाचणी प्रगती स्तर' : 'Specimen & Testing Workflow SLA'}</span>
                    <span className="font-mono text-[#1A4B8C]">
                      {order.status === 'COMPLETED' ? '100%' : `${Math.round(((stepIdx + 1) / ORDER_STEPS.length) * 100)}%`}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-3 right-3 top-2.5 h-1 bg-slate-200 -z-0" />
                    <div 
                      className="absolute left-3 top-2.5 h-1 bg-[#1A4B8C] transition-all duration-300 -z-0"
                      style={{ width: `${Math.max(0, Math.min(100, (stepIdx / (ORDER_STEPS.length - 1)) * 100))}%` }}
                    />

                    {ORDER_STEPS.map((s, idx) => {
                      const isDone = stepIdx >= idx;
                      const isCurr = order.status === s;
                      const label = ORDER_STEP_LABELS[s];

                      return (
                        <div key={s} className="relative z-10 flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition ${
                            isDone 
                              ? 'bg-[#1A4B8C] border-[#1A4B8C] text-white' 
                              : 'bg-white border-slate-300 text-slate-400'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap hidden sm:inline ${
                            isCurr ? 'text-[#1A4B8C] font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                          }`}>
                            {lang === 'mr' ? label.mr : label.en}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Critical Alert Bar if present */}
                {order.hasCriticalValue && (
                  <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-center justify-between text-xs text-red-900 font-semibold animate-pulse">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{lang === 'mr' ? order.overallImpressionMr : (order.overallImpressionEn || order.overallImpressionMr || 'Critical findings detected: immediate clinical attention required.')}</span>
                    </div>
                    <button
                      onClick={() => setViewingOrder(order)}
                      className="px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-bold shrink-0 ml-2"
                    >
                      {lang === 'mr' ? 'अहवाल पहा' : 'View STAT'}
                    </button>
                  </div>
                )}

                {/* Footer details & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-[11px] text-[#546E7A]">
                    <span>{lang === 'mr' ? order.targetLabNameMr : order.targetLabNameEn}</span> · 
                    <span className="font-mono ml-1">{order.completedAt || order.createdAt.slice(0, 10)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Advance Status button */}
                    {order.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleAdvanceStatus(order)}
                        className="px-3 py-1.5 rounded-xl border border-blue-200 text-[#1A4B8C] hover:bg-blue-50 text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <span>{lang === 'mr' ? 'पुढील टप्पा' : 'Advance Workflow'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* View Report button */}
                    {order.status === 'COMPLETED' && (
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-[11px] font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'अहवाल पहा' : 'View Verified Report'}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Viewing Order Result Modal */}
      {viewingOrder && (
        <LabResultViewer
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
        />
      )}

      {/* Create Order Modal */}
      {isCreateOpen && (
        <CreateTestOrder
          onClose={() => setIsCreateOpen(false)}
          onOrderCreated={(newOrder) => {
            setIsCreateOpen(false);
            reloadData();
            setViewingOrder(newOrder);
          }}
        />
      )}

    </div>
  );
}
