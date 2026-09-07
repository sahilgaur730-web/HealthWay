import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  FlaskConical, 
  Send, 
  Check, 
  X, 
  ChevronRight, 
  PhoneCall, 
  ShieldAlert 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { referralService } from '../../services/referralService';
import { diagnosticService } from '../../services/diagnosticService';
import { smsService } from '../../services/smsService';
import { reminderService } from '../../services/reminderService';

export default function NotificationBell() {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [overdueReferrals, setOverdueReferrals] = useState<any[]>([]);
  const [criticalLabOrders, setCriticalLabOrders] = useState<any[]>([]);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);

  const refreshAlerts = () => {
    const refs = referralService.getAllReferrals().filter(r => r.isOverdue && r.stage !== 'COMPLETED');
    const labs = diagnosticService.getAllOrders().filter(o => o.hasCriticalValue);
    const sms = smsService.getRecentLogs().slice(0, 5);

    setOverdueReferrals(refs);
    setCriticalLabOrders(labs);
    setSmsLogs(sms);
    setUnreadCount(refs.length + labs.length);
  };

  useEffect(() => {
    refreshAlerts();
    const timer = setInterval(refreshAlerts, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleAlertAsha = (refId: string) => {
    const ref = referralService.getReferralById(refId);
    if (!ref) return;
    referralService.triggerReminder(
      refId,
      'ASHA',
      `तातडीचा इशारा: रुग्ण ${ref.patientNameMr} यांचा रेफरल वेळ ओलांडला आहे. कृपया त्वरित पाठपुरावा करा.`,
      `URGENT REMINDER: Patient ${ref.patientNameEn} referral is overdue. Please intervene.`
    );
    refreshAlerts();
    alert(lang === 'mr' ? 'आशा कार्यकर्त्यास त्वरित एसएमएस इशारा पाठवला.' : 'Emergency SMS alert dispatched to ASHA worker.');
  };

  const handleEscalateDho = (refId: string) => {
    const ref = referralService.getReferralById(refId);
    if (!ref) return;
    const ticket = reminderService.escalateToDho(ref);
    refreshAlerts();
    alert(lang === 'mr' ? `जिल्हा आरोग्य अधिकाऱ्यांना एस्कलेशन तिकीट जारी: ${ticket.ticketId}` : `Escalated to DHO Command Center. Ticket: ${ticket.ticketId}`);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        title={lang === 'mr' ? 'सूचना व इशारे' : 'Notifications & Alerts'}
      >
        <Bell className="w-4 h-4 text-blue-100" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#CFD8DC] z-50 overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="p-3.5 bg-[#0B2545] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs">
                  {lang === 'mr' ? 'आरोग्य सूचना व इशारे' : 'Active Health Alerts & Logs'}
                </h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-white/80"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-1 text-xs">
              
              {/* Overdue Referrals Section */}
              {overdueReferrals.length > 0 && (
                <div className="p-2 space-y-2">
                  <div className="flex items-center gap-1.5 text-red-700 font-bold text-[11px] px-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>{lang === 'mr' ? 'मुदत ओलांडलेले रेफरल्स (Overdue)' : 'Overdue Referral Cases'}</span>
                  </div>

                  {overdueReferrals.map(ref => (
                    <div key={ref.id} className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h5 className="font-bold text-[#1C2B3A]">
                            {lang === 'mr' ? ref.patientNameMr : ref.patientNameEn}
                          </h5>
                          <span className="font-mono text-[10px] text-red-800">
                            {ref.id} · {ref.urgency} ({ref.overdueHours || 1}h+ overdue)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white shrink-0">
                          Overdue
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700">
                        {lang === 'mr' ? ref.primaryReasonMr : ref.primaryReasonEn}
                      </p>

                      <div className="flex items-center justify-end gap-1.5 pt-1 flex-wrap">
                        <a
                          href={`tel:${ref.patientPhone}`}
                          className="px-2 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] flex items-center gap-1"
                          title={lang === 'mr' ? `रुग्णास कॉल करा (${ref.patientPhone})` : `Call Patient (${ref.patientPhone})`}
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'कॉल' : 'Call'}</span>
                        </a>
                        <button
                          onClick={() => handleAlertAsha(ref.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'आशा अलर्ट' : 'Alert ASHA'}</span>
                        </button>
                        <button
                          onClick={() => handleEscalateDho(ref.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] flex items-center gap-1"
                        >
                          <ShieldAlert className="w-3 h-3" />
                          <span>{lang === 'mr' ? 'DHO एस्कलेट' : 'Escalate DHO'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Critical Lab Results Section */}
              {criticalLabOrders.length > 0 && (
                <div className="p-2 space-y-2">
                  <div className="flex items-center gap-1.5 text-red-700 font-bold text-[11px] px-1">
                    <FlaskConical className="w-3.5 h-3.5 text-red-600" />
                    <span>{lang === 'mr' ? 'गंभीर लॅब अहवाल (Critical Values)' : 'Critical Diagnostic Findings'}</span>
                  </div>

                  {criticalLabOrders.map(order => (
                    <div key={order.id} className="p-2.5 rounded-xl bg-red-50 border border-red-300 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1C2B3A]">
                          {lang === 'mr' ? order.patientNameMr : order.patientNameEn}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-700 text-white">
                          CRITICAL
                        </span>
                      </div>
                      <p className="text-[11px] text-red-900 font-medium">
                        {lang === 'mr' ? order.overallImpressionMr : (order.overallImpressionEn || order.overallImpressionMr)}
                      </p>
                      <div className="text-[10px] font-mono text-slate-500">
                        ABHA ID: {order.abhaId}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Automated SMS Dispatches */}
              <div className="p-2 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-[#546E7A] px-1">
                  {lang === 'mr' ? 'स्वयंचलित एसएमएस नोंदी' : 'Recent Automated SMS Logs'}
                </span>
                {smsLogs.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic px-1">
                    {lang === 'mr' ? 'कोणत्याही ताज्या नोंदी नाहीत.' : 'No recent automated SMS logs.'}
                  </p>
                ) : (
                  smsLogs.map(s => (
                    <div key={s.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-bold text-slate-700">{s.recipientName} ({s.recipientRole})</span>
                        <span>{s.timestamp}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2">{s.messageText}</p>
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
              <button
                onClick={() => {
                  reminderService.runAutoReminders();
                  refreshAlerts();
                  alert(lang === 'mr' ? 'स्वयंचलित स्मरणपत्रे व तपासणी पूर्ण झाली.' : 'Automated overdue check & reminders dispatched.');
                }}
                className="text-[11px] font-bold text-[#1A4B8C] hover:underline"
              >
                {lang === 'mr' ? 'आत्ता स्मरणपत्रे तपासा (Run Reminder Engine)' : 'Trigger Auto-Reminders Now'}
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
