import React, { useState } from 'react';
import { 
  Building2, 
  Hospital, 
  X, 
  ArrowLeft, 
  PhoneCall, 
  Truck, 
  FileText, 
  ShieldAlert, 
  Users, 
  Pill, 
  Stethoscope, 
  CheckCircle2, 
  Activity, 
  Clock, 
  AlertTriangle,
  Send,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { Facility, FACILITY_TYPES, dispatchFacilityAction } from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext';

interface FacilityDetailModalProps {
  facility: Facility | null;
  onClose: () => void;
}

export default function FacilityDetailModal({ facility, onClose }: FacilityDetailModalProps) {
  const { lang } = useLanguage();
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!facility) return null;

  const typeConfig = FACILITY_TYPES[facility.type] || FACILITY_TYPES.PHC;
  const grade = facility.grade;
  const score = facility.calculatedScore ?? 0;
  const m = facility.metrics;

  const handleAction = async (actionType: 'DISPATCH_STOCK' | 'SEND_NOTICE' | 'DISPATCH_INSPECTOR') => {
    setIsSubmitting(true);
    const res = await dispatchFacilityAction(facility.id, actionType);
    setIsSubmitting(false);
    setActionSuccess(lang === 'mr' ? res.messageMr : res.messageEn);
    setTimeout(() => {
      setActionSuccess(null);
    }, 5000);
  };

  const consultPct = Math.round((m.consultationsToday / (m.consultationsTarget || 1)) * 100);
  const staffPct = Math.round((facility.staffPresent / (facility.staffTotal || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-6 bg-[#1A4B8C] text-white flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
              {facility.type === 'DH' || facility.type === 'SDH' ? (
                <Hospital className="w-7 h-7" />
              ) : (
                <Building2 className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight">
                  {lang === 'mr' ? facility.nameMr : facility.name}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 uppercase tracking-wider">
                  {typeConfig.labelEn}
                </span>
              </div>

              <p className="text-blue-100 text-xs mt-1">
                {lang === 'mr' ? `तालुका: ${facility.blockMr} | जिल्हा: पुणे, महाराष्ट्र` : `Block: ${facility.block} | District: Pune, Maharashtra`}
                <span className="ml-2 font-mono text-[11px] text-blue-200">ID: {facility.id}</span>
              </p>

              <div className="flex items-center gap-3 text-xs text-blue-100 mt-2.5">
                <span>
                  {lang === 'mr' ? 'प्रभारी: ' : 'In-Charge: '}
                  <strong>{facility.inCharge}</strong> ({facility.inChargeRole})
                </span>
                <span>·</span>
                <a 
                  href={`tel:${facility.phone}`} 
                  className="flex items-center gap-1 text-white hover:underline font-mono font-bold"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{facility.phone}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span 
                className="text-xs font-black px-2.5 py-1 rounded-lg border font-mono shadow-xs block"
                style={{
                  backgroundColor: grade?.bgColor || '#FFF',
                  color: grade?.color || '#1C2B3A',
                  borderColor: grade?.borderColor || '#CFD8DC'
                }}
              >
                Grade {grade?.grade} ({score}/100)
              </span>
              <span className="text-[10px] text-blue-200 mt-1 block">
                {lang === 'mr' ? grade?.labelMr : grade?.labelEn}
              </span>
            </div>

            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Intervention Buttons */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-bold text-[#1C2B3A] block">
                {lang === 'mr' ? 'प्रशासकीय जलद हस्तक्षेप (Administrative Quick Actions)' : 'Direct Administrative Interventions'}
              </span>
              <span className="text-[#546E7A] text-[11px]">
                {lang === 'mr' ? 'केंद्रातील त्रुटींवर तत्काळ उपाययोजना आदेश काढा' : 'Dispatch immediate relief or compliance notices'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`tel:${facility.phone}`}
                className="px-3 py-2 rounded-xl bg-white border border-[#CFD8DC] hover:border-[#1A4B8C] text-xs font-bold text-[#1C2B3A] transition flex items-center gap-1.5 shadow-2xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'mr' ? 'प्रमुखांना कॉल' : 'Call In-Charge'}</span>
              </a>

              <button
                onClick={() => handleAction('DISPATCH_STOCK')}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl bg-[#1A4B8C] hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'औषध साठा पाठवा' : 'Dispatch Stock'}</span>
              </button>

              <button
                onClick={() => handleAction('DISPATCH_INSPECTOR')}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'निरीक्षक पाठवा' : 'Dispatch Inspector'}</span>
              </button>

              <button
                onClick={() => handleAction('SEND_NOTICE')}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'स्पष्टीकरण नोटीस' : 'Issue Notice'}</span>
              </button>
            </div>
          </div>

          {/* Active Alerts if any */}
          {facility.alerts && facility.alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#1C2B3A] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{lang === 'mr' ? 'केंद्राशी संबंधित सक्रिय इशारे' : 'Active Operational Flags'} ({facility.alerts.length})</span>
              </h4>
              <div className="space-y-2">
                {facility.alerts.map((al, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <span className="font-bold mr-1.5">[{al.type}]</span>
                        <span>{lang === 'mr' ? al.messageMr : al.messageEn}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 uppercase">
                      {al.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operational Metrics Breakdown (6 Core Weighted Parameters) */}
          <div>
            <h4 className="text-xs font-bold text-[#1C2B3A] uppercase tracking-wider mb-3">
              {lang === 'mr' ? '६ मुख्य कामगिरी निर्देशांक (Weighted KPI Parameters)' : 'Weighted Performance Dimensions'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              {/* 1. Consultations */}
              <div className="p-4 rounded-2xl bg-white border border-[#CFD8DC] space-y-2">
                <div className="flex items-center justify-between text-[#546E7A] text-xs">
                  <span className="font-bold uppercase text-[10px]">{lang === 'mr' ? '१. ओपीडी उद्दिष्ट (२०%)' : '1. OPD Consults (20%)'}</span>
                  <Stethoscope className="w-4 h-4 text-[#1A4B8C]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#1C2B3A]">
                  {m.consultationsToday} <span className="text-xs text-[#546E7A] font-normal">/ {m.consultationsTarget} लक्ष्य</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${consultPct >= 80 ? 'bg-emerald-600' : consultPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(consultPct, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? `साध्य: ${consultPct}% | चालू महिना: ${m.consultationsMonth.toLocaleString()}` : `Achieved: ${consultPct}% | Month: ${m.consultationsMonth.toLocaleString()}`}
                </p>
              </div>

              {/* 2. Staff Attendance */}
              <div className="p-4 rounded-2xl bg-white border border-[#CFD8DC] space-y-2">
                <div className="flex items-center justify-between text-[#546E7A] text-xs">
                  <span className="font-bold uppercase text-[10px]">{lang === 'mr' ? '२. कर्मचारी उपस्थिती (२०%)' : '2. Staff Attendance (20%)'}</span>
                  <Users className="w-4 h-4 text-[#1A4B8C]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#1C2B3A]">
                  {facility.staffPresent} <span className="text-xs text-[#546E7A] font-normal">/ {facility.staffTotal} एकूण</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${staffPct >= 85 ? 'bg-emerald-600' : staffPct >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(staffPct, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? `उपस्थिती दर: ${staffPct}%` : `Present Rate: ${staffPct}%`}
                </p>
              </div>

              {/* 3. Medicine Stock Availability */}
              <div className="p-4 rounded-2xl bg-white border border-[#CFD8DC] space-y-2">
                <div className="flex items-center justify-between text-[#546E7A] text-xs">
                  <span className="font-bold uppercase text-[10px]">{lang === 'mr' ? '३. औषध उपलब्धता (२०%)' : '3. Drug Stock (20%)'}</span>
                  <Pill className="w-4 h-4 text-[#1A4B8C]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#1C2B3A]">
                  {m.medicinesOutOfStock === 0 ? (
                    <span className="text-emerald-700">१००% उपलब्ध</span>
                  ) : (
                    <span className="text-rose-700">{m.medicinesOutOfStock} तुटवडा</span>
                  )}
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${Math.max(0, 100 - (m.medicinesOutOfStock * 10))}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#546E7A]">
                  {m.medicinesOutOfStock === 0 
                    ? (lang === 'mr' ? 'सर्व अत्यावश्यक औषधे साठ्यात' : 'All essential drugs in buffer')
                    : (lang === 'mr' ? 'तातडीने वखार मागणी आवश्यक' : 'Emergency warehouse indent required')}
                </p>
              </div>

              {/* 4. Referral Completion Rate */}
              <div className="p-4 rounded-2xl bg-white border border-[#CFD8DC] space-y-2">
                <div className="flex items-center justify-between text-[#546E7A] text-xs">
                  <span className="font-bold uppercase text-[10px]">{lang === 'mr' ? '४. रेफरल पूर्तता (१५%)' : '4. Referral Rate (15%)'}</span>
                  <Activity className="w-4 h-4 text-[#F57C00]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#1C2B3A]">
                  {m.referralsSent > 0 ? Math.round((m.referralsCompleted / m.referralsSent) * 100) : 100}%
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[#F57C00]"
                    style={{ width: `${m.referralsSent > 0 ? (m.referralsCompleted / m.referralsSent) * 100 : 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? `${m.referralsCompleted}/${m.referralsSent} रेफरल्स पूर्ण` : `${m.referralsCompleted}/${m.referralsSent} completed transit`}
                </p>
              </div>

              {/* 5. High-Risk Follow-up Compliance */}
              <div className="p-4 rounded-2xl bg-white border border-[#CFD8DC] space-y-2">
                <div className="flex items-center justify-between text-[#546E7A] text-xs">
                  <span className="font-bold uppercase text-[10px]">{lang === 'mr' ? '५. उच्च जोखीम तपासणी (१५%)' : '5. High-Risk Followup (15%)'}</span>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black font-mono text-[#1C2B3A]">
                  {m.overdueFollowUps > 0 ? (
                    <span className="text-amber-700">{m.overdueFollowUps} प्रलंबित</span>
                  ) : (
                    <span className="text-emerald-700">पूर्ण अद्ययावत</span>
                  )}
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${m.highRiskPatients > 0 ? Math.max(0, 100 - (m.overdueFollowUps / m.highRiskPatients) * 100) : 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? `एकूण ${m.highRiskPatients} नोंदणीकृत रुग्ण` : `Total ${m.highRiskPatients} cohort registered`}
                </p>
              </div>

              {/* 6. TB Compliance */}
              <div className="p-4 rounded-2xl bg-white border border-[#CFD8DC] space-y-2">
                <div className="flex items-center justify-between text-[#546E7A] text-xs">
                  <span className="font-bold uppercase text-[10px]">{lang === 'mr' ? '६. टीबी उपचार पूर्तता (१०%)' : '6. TB DOTS Compliance (10%)'}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black font-mono text-emerald-700">
                  {m.tbCompliance}%
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${m.tbCompliance}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#546E7A]">
                  {lang === 'mr' ? `${m.tbPatientsActive} सक्रिय क्षयरोग रुग्ण` : `${m.tbPatientsActive} active patients under treatment`}
                </p>
              </div>

            </div>
          </div>

          {/* Staff Attendance Breakdown by Cadre */}
          {facility.staffBreakdown && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-[#1C2B3A] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#1A4B8C]" />
                <span>{lang === 'mr' ? 'संवर्गनिहाय कर्मचारी उपस्थिती तक्ता' : 'Staff Attendance Breakdown by Cadre'}</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-[#546E7A] uppercase block">
                    {lang === 'mr' ? 'वैद्यकीय अधिकारी' : 'Medical Officer'}
                  </span>
                  <div className="text-base font-black font-mono text-[#1C2B3A] mt-1">
                    {facility.staffBreakdown.medicalOfficers.present} / {facility.staffBreakdown.medicalOfficers.total}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-[#546E7A] uppercase block">
                    {lang === 'mr' ? 'परिचारिका (Nurse)' : 'Staff Nurse'}
                  </span>
                  <div className="text-base font-black font-mono text-[#1C2B3A] mt-1">
                    {facility.staffBreakdown.staffNurses.present} / {facility.staffBreakdown.staffNurses.total}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-[#546E7A] uppercase block">
                    {lang === 'mr' ? 'ए.एन.एम.' : 'ANM'}
                  </span>
                  <div className="text-base font-black font-mono text-[#1C2B3A] mt-1">
                    {facility.staffBreakdown.anmWorkers.present} / {facility.staffBreakdown.anmWorkers.total}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-[#546E7A] uppercase block">
                    {lang === 'mr' ? 'औषध निर्माता' : 'Pharmacist'}
                  </span>
                  <div className="text-base font-black font-mono text-[#1C2B3A] mt-1">
                    {facility.staffBreakdown.pharmacists.present} / {facility.staffBreakdown.pharmacists.total}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-[#546E7A] uppercase block">
                    {lang === 'mr' ? 'प्रयोगशाळा तंत्रज्ञ' : 'Lab Tech'}
                  </span>
                  <div className="text-base font-black font-mono text-[#1C2B3A] mt-1">
                    {facility.staffBreakdown.labTechnicians.present} / {facility.staffBreakdown.labTechnicians.total}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deliveries & Vaccinations info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-emerald-900">
                {lang === 'mr' ? 'आजच्या प्रसूती (Deliveries Today):' : "Today's Deliveries:"}
              </span>
              <strong className="font-mono text-base text-emerald-900">{m.deliveries}</strong>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-blue-900">
                {lang === 'mr' ? 'आजचे लसीकरण (Vaccinations Today):' : "Today's Vaccinations:"}
              </span>
              <strong className="font-mono text-base text-blue-900">{m.vaccinationsToday}</strong>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#CFD8DC] flex items-center justify-between">
          <span className="text-xs text-[#546E7A]">
            {lang === 'mr' ? 'माहिती अद्ययावत: ' : 'Last Data Sync: '}
            <strong className="text-[#1C2B3A] font-mono">{new Date(facility.lastDataSync).toLocaleTimeString()}</strong>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1C2B3A] text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            {lang === 'mr' ? 'बंद करा' : 'Close Details'}
          </button>
        </div>

      </div>
    </div>
  );
}
