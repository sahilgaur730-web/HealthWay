import React, { useState } from 'react';
import { 
  Hospital, 
  Search, 
  Plus, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Truck, 
  PhoneCall, 
  ArrowLeft, 
  RefreshCw, 
  ShieldAlert, 
  Send,
  X 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { referralService, ReferralItem, ReferralStage } from '../../services/referralService';
import { reminderService } from '../../services/reminderService';
import ReferralCard from './ReferralCard';
import StatusTimeline from '../shared/StatusTimeline';
import CreateReferral from './CreateReferral';
import DoctorFeedback from './DoctorFeedback';

export default function ReferralTracker() {
  const { lang } = useLanguage();

  const [referrals, setReferrals] = useState<ReferralItem[]>(() => referralService.getAllReferrals());
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'OVERDUE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [feedbackReferral, setFeedbackReferral] = useState<ReferralItem | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<ReferralItem | null>(null);

  const reloadData = () => {
    referralService.runOverdueCheck();
    setReferrals(referralService.getAllReferrals());
    if (selectedReferral) {
      setSelectedReferral(referralService.getReferralById(selectedReferral.id) || null);
    }
  };

  const handleUpdateStage = (ref: ReferralItem, nextStage: ReferralStage) => {
    const updated = referralService.updateStage(ref.id, nextStage);
    if (updated) {
      reloadData();
    }
  };

  const handleAlertAsha = (ref: ReferralItem) => {
    referralService.triggerReminder(
      ref.id,
      'ASHA',
      `तातडीचा इशारा: रुग्ण ${ref.patientNameMr} यांचा रेफरल वेळ ओलांडला आहे. कृपया तात्काळ पाठपुरावा करा.`,
      `URGENT ALERT: Referral for ${ref.patientNameEn} is overdue. Please assist.`
    );
    reloadData();
    alert(lang === 'mr' ? 'आशा कार्यकर्तीस एसएमएस पाठवला गेला आहे.' : 'High-priority SMS alert sent to ASHA worker.');
  };

  const handleEscalateDho = (ref: ReferralItem) => {
    const ticket = reminderService.escalateToDho(ref);
    reloadData();
    alert(lang === 'mr' ? `जिल्हा आरोग्य अधिकाऱ्यांना एस्कलेट केले: ${ticket.ticketId}` : `Escalated to District Health Officer. Ticket: ${ticket.ticketId}`);
  };

  // Filter logic
  const filteredReferrals = referrals.filter(r => {
    const matchesFilter = 
      filter === 'ALL' ? true :
      filter === 'ACTIVE' ? (r.stage !== 'COMPLETED' && r.stage !== 'CANCELLED' && !r.isOverdue) :
      filter === 'OVERDUE' ? (r.isOverdue && r.stage !== 'COMPLETED') :
      (r.stage === 'COMPLETED');

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      q === '' ||
      r.patientNameMr.toLowerCase().includes(q) ||
      r.patientNameEn.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.abhaId.toLowerCase().includes(q) ||
      r.targetHospitalNameMr.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const overdueCount = referrals.filter(r => r.isOverdue && r.stage !== 'COMPLETED').length;
  const activeCount = referrals.filter(r => r.stage !== 'COMPLETED' && r.stage !== 'CANCELLED').length;
  const completedCount = referrals.filter(r => r.stage === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#1C2B3A]">
              {lang === 'mr' ? 'तज्ञ रेफरल ट्रॅकिंग व आंतररुग्णालय समन्वय' : 'Specialist Referral Pipeline & Inter-Facility Tracker'}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1A4B8C] border border-blue-200">
              Demand 5
            </span>
          </div>
          <p className="text-xs text-[#546E7A] mt-1">
            {lang === 'mr'
              ? '७-टप्पे स्थिती ट्रॅकिंग (CREATED -> COMPLETED), निकड SLA, ऑटो ओव्हरड्यू अलर्ट्स आणि क्लोज्ड-लूप डॉक्टर फीडबॅक'
              : '7-stage state machine (CREATED to COMPLETED), urgency SLA monitoring, auto overdue alerts & closed-loop counter-referrals'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={reloadData}
            className="p-2.5 rounded-xl border border-[#CFD8DC] hover:bg-slate-50 text-slate-700 transition"
            title="Refresh pipeline status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'mr' ? 'नवीन रेफरल तयार करा' : 'New Referral Slip'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-[#CFD8DC] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#546E7A]">{lang === 'mr' ? 'एकूण रेफरल्स' : 'Total Referrals'}</span>
          <div className="text-2xl font-bold text-[#1C2B3A]">{referrals.length}</div>
          <span className="text-[11px] text-slate-500">Government Network</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#CFD8DC] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#546E7A]">{lang === 'mr' ? 'प्रक्रियेत / सक्रिय' : 'Active Pipeline'}</span>
          <div className="text-2xl font-bold text-[#1A4B8C]">{activeCount}</div>
          <span className="text-[11px] text-blue-600 font-semibold">Under Transport / Review</span>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs space-y-1 ${
          overdueCount > 0 ? 'bg-red-50/80 border-red-300' : 'bg-white border-[#CFD8DC]'
        }`}>
          <span className="text-[10px] font-bold uppercase text-red-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>{lang === 'mr' ? 'मुदत ओलांडलेले' : 'Overdue SLA Alerts'}</span>
          </span>
          <div className="text-2xl font-bold text-red-700">{overdueCount}</div>
          <span className="text-[11px] text-red-600 font-medium">Requires ASHA / DHO Action</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#CFD8DC] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#546E7A]">{lang === 'mr' ? 'उपचार पूर्ण' : 'Completed & Counter-Referred'}</span>
          <div className="text-2xl font-bold text-emerald-700">{completedCount}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Feedback Synchronized</span>
        </div>
      </div>

      {/* Selected Referral Focus Inspector (if open) */}
      {selectedReferral && (
        <div className="bg-white rounded-2xl border-2 border-[#1A4B8C] p-5 sm:p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Hospital className="w-5 h-5 text-[#1A4B8C]" />
              <h3 className="text-sm sm:text-base font-bold text-[#1C2B3A]">
                {lang === 'mr' ? `रेफरल तपशील: ${selectedReferral.patientNameMr} (${selectedReferral.id})` : `Pipeline Detail: ${selectedReferral.patientNameEn} (${selectedReferral.id})`}
              </h3>
            </div>
            <button
              onClick={() => setSelectedReferral(null)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 7-Stage Visual Timeline */}
          <StatusTimeline 
            currentStage={selectedReferral.stage} 
            stageHistory={selectedReferral.stageHistory} 
            isOverdue={selectedReferral.isOverdue}
          />

          {/* Overdue quick action bar if overdue */}
          {selectedReferral.isOverdue && selectedReferral.stage !== 'COMPLETED' && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-red-900 font-semibold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  {lang === 'mr' 
                    ? `हा रेफरल ${selectedReferral.overdueHours || 1} तासाने मुदत ओलांडलेला आहे. त्वरित कृती करा:` 
                    : `This case exceeded urgency SLA by ${selectedReferral.overdueHours || 1} hours. Rapid intervention options:`}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`tel:${selectedReferral.patientPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold flex items-center gap-1.5 shadow-xs"
                  title={lang === 'mr' ? `रुग्णास कॉल करा (${selectedReferral.patientPhone})` : `Call Patient (${selectedReferral.patientPhone})`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'रुग्णास कॉल' : 'Call Patient'}</span>
                </a>
                <button
                  onClick={() => handleAlertAsha(selectedReferral)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'आशा अलर्ट' : 'Alert ASHA Escort'}</span>
                </button>
                <button
                  onClick={() => handleEscalateDho(selectedReferral)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'DHO एस्कलेट करा' : 'Escalate to DHO'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Reminders Log */}
          {selectedReferral.reminders.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold uppercase text-[#546E7A]">
                {lang === 'mr' ? 'स्वयंचलित एसएमएस स्मरणपत्रे (SMS Dispatch Log)' : 'Automated Reminder & Escalation Audit Trail'}
              </span>
              <div className="space-y-1">
                {selectedReferral.reminders.map(rem => (
                  <div key={rem.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-700">{rem.recipientName} ({rem.recipient}): </span>
                      <span className="text-slate-600">{lang === 'mr' ? rem.messageMr : (rem.messageEn || rem.messageMr)}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{rem.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs & Search Row */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl flex-wrap">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'ALL' ? 'bg-white text-[#1A4B8C] shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            {lang === 'mr' ? 'सर्व' : 'All'} ({referrals.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'ACTIVE' ? 'bg-white text-[#1A4B8C] shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            {lang === 'mr' ? 'सक्रिय' : 'Active'} ({activeCount})
          </button>
          <button
            onClick={() => setFilter('OVERDUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filter === 'OVERDUE' ? 'bg-white text-red-700 shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>{lang === 'mr' ? 'मुदत ओलांडलेले' : 'Overdue'} ({overdueCount})</span>
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'COMPLETED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            {lang === 'mr' ? 'पूर्ण' : 'Completed'} ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={lang === 'mr' ? 'रुग्ण, टोकन किंवा रुग्णालय शोधा...' : 'Search patient, token, hospital...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-300 text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#1A4B8C]"
          />
        </div>
      </div>

      {/* Referrals Cards List */}
      <div className="space-y-3">
        {filteredReferrals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            {lang === 'mr' ? 'कोणतेही रेफरल्स आढळले नाहीत.' : 'No referrals found matching current filter.'}
          </div>
        ) : (
          filteredReferrals.map(ref => (
            <ReferralCard
              key={ref.id}
              referral={ref}
              onSelect={(r) => setSelectedReferral(r)}
              onUpdateStage={handleUpdateStage}
              onOpenFeedback={(r) => setFeedbackReferral(r)}
              onAlertAsha={handleAlertAsha}
            />
          ))
        )}
      </div>

      {/* 4-Step Create Referral Modal */}
      {isCreateOpen && (
        <CreateReferral
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(newRef) => {
            setIsCreateOpen(false);
            reloadData();
            setSelectedReferral(newRef);
          }}
        />
      )}

      {/* Doctor Feedback Modal */}
      {feedbackReferral && (
        <DoctorFeedback
          referral={feedbackReferral}
          isOpen={true}
          onClose={() => setFeedbackReferral(null)}
          onFeedbackSaved={() => {
            reloadData();
            setFeedbackReferral(null);
          }}
        />
      )}

    </div>
  );
}
