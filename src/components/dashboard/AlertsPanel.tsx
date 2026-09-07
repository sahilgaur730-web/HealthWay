import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  PhoneCall, 
  Truck, 
  FileText, 
  CheckCircle2, 
  Building2,
  Filter,
  Check,
  Search
} from 'lucide-react';
import { AlertItem, Facility, dispatchFacilityAction } from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext';

interface AlertsPanelProps {
  alerts: AlertItem[];
  facilities?: Facility[];
  onSelectFacility?: (facilityId: string) => void;
  onAlertHandled?: (alertId: string, actionName: string) => void;
}

export default function AlertsPanel({ 
  alerts, 
  facilities = [], 
  onSelectFacility,
  onAlertHandled 
}: AlertsPanelProps) {
  const { lang } = useLanguage();
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [actionFeedback, setActionFeedback] = useState<{ id: string; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Grouped counts
  const criticalCount = alerts.filter(a => a.type === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.type === 'WARNING').length;
  const infoCount = alerts.filter(a => a.type === 'INFO').length;

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'ALL' && a.type !== filterSeverity) return false;
    return true;
  });

  const handleAction = async (alert: AlertItem, actionType: 'DISPATCH_STOCK' | 'SEND_NOTICE' | 'DISPATCH_INSPECTOR') => {
    const alertKey = alert.id || `${alert.facilityId}-${alert.category}`;
    setIsProcessing(alertKey);

    const res = await dispatchFacilityAction(alert.facilityId || 'FAC001', actionType);
    setIsProcessing(null);

    setActionFeedback({
      id: alertKey,
      message: lang === 'mr' ? res.messageMr : res.messageEn
    });

    if (onAlertHandled && alert.id) {
      onAlertHandled(alert.id, actionType);
    }

    setTimeout(() => {
      setActionFeedback(null);
    }, 4500);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header with Severity Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#1C2B3A]">
              {lang === 'mr' ? 'जिल्हास्तरीय अलर्ट व तातडीच्या सूचना' : 'District Live Operational Alerts Stream'}
            </h3>
          </div>
          <p className="text-xs text-[#546E7A] mt-1">
            {lang === 'mr' 
              ? 'औषध तुटवडा, कर्मचारी गैरहजेरी व उद्दिष्ट विलंबाच्या स्वयंचलित सूचना' 
              : 'Real-time stockouts, staff deficits, and overdue high-risk patient flags'}
          </p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterSeverity === 'ALL'
                ? 'bg-[#1A4B8C] text-white'
                : 'bg-slate-100 text-[#546E7A] hover:bg-slate-200'
            }`}
          >
            {lang === 'mr' ? 'सर्व' : 'All'} ({alerts.length})
          </button>

          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterSeverity === 'CRITICAL'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'गंभीर' : 'Critical'} ({criticalCount})</span>
          </button>

          <button
            onClick={() => setFilterSeverity('WARNING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterSeverity === 'WARNING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'इशारा' : 'Warning'} ({warningCount})</span>
          </button>

          <button
            onClick={() => setFilterSeverity('INFO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterSeverity === 'INFO'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'माहिती' : 'Info'} ({infoCount})</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Alert Stream List */}
      <div className="space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#1C2B3A]">
              {lang === 'mr' ? 'निवडलेल्या श्रेणीत कोणतेही अलर्ट नाहीत' : 'No active alerts in this category'}
            </p>
            <p className="text-[11px] text-[#546E7A] mt-0.5">
              {lang === 'mr' ? 'सर्व केंद्रांची कामगिरी सुरळीत आहे' : 'All facility operations are within threshold'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const alertKey = alert.id || `${alert.facilityId}-${idx}`;
            const isCrit = alert.type === 'CRITICAL';
            const isWarn = alert.type === 'WARNING';
            const matchingFacility = facilities.find(f => f.id === alert.facilityId);

            return (
              <div 
                key={alertKey}
                className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isCrit 
                    ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300' 
                    : isWarn 
                      ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300' 
                      : 'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isCrit 
                      ? 'bg-rose-100 text-rose-700' 
                      : isWarn 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isCrit ? (
                      <AlertOctagon className="w-4 h-4" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isCrit ? 'bg-rose-200 text-rose-900' : isWarn ? 'bg-amber-200 text-amber-900' : 'bg-blue-200 text-blue-900'
                      }`}>
                        {alert.type}
                      </span>
                      <strong className="text-xs text-[#1C2B3A]">
                        {alert.facilityName || (matchingFacility ? (lang === 'mr' ? matchingFacility.nameMr : matchingFacility.name) : 'Facility')}
                      </strong>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-[11px] text-[#546E7A] uppercase font-bold tracking-wider">
                        {alert.category}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#1C2B3A] mt-1">
                      {lang === 'mr' ? alert.messageMr : alert.messageEn}
                    </p>
                  </div>
                </div>

                {/* Direct Intervention Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
                  {alert.category === 'medicine' && (
                    <button
                      onClick={() => handleAction(alert, 'DISPATCH_STOCK')}
                      disabled={isProcessing === alertKey}
                      className="px-3 py-1.5 rounded-lg bg-[#1A4B8C] hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'साठा पाठवा' : 'Dispatch Stock'}</span>
                    </button>
                  )}

                  {alert.category === 'staff' && (
                    <button
                      onClick={() => handleAction(alert, 'SEND_NOTICE')}
                      disabled={isProcessing === alertKey}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'नोटीस बजावा' : 'Issue Notice'}</span>
                    </button>
                  )}

                  {matchingFacility?.phone && (
                    <a
                      href={`tel:${matchingFacility.phone}`}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-[#1C2B3A] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'mr' ? 'कॉल करा' : 'Call Officer'}</span>
                    </a>
                  )}

                  {alert.facilityId && onSelectFacility && (
                    <button
                      onClick={() => onSelectFacility(alert.facilityId!)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-xs font-bold text-[#1A4B8C] transition"
                    >
                      {lang === 'mr' ? 'पहा' : 'View'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
