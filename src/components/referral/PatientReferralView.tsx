import React from 'react';
import { 
  Hospital, 
  MapPin, 
  PhoneCall, 
  Printer, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Share2, 
  Copy, 
  ShieldCheck, 
  ArrowLeft, 
  QrCode, 
  ExternalLink 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ReferralItem } from '../../services/referralService';
import StatusTimeline from '../shared/StatusTimeline';

interface PatientReferralViewProps {
  referral: ReferralItem;
  onBack?: () => void;
}

export default function PatientReferralView({ referral, onBack }: PatientReferralViewProps) {
  const { lang } = useLanguage();

  const copyToken = () => {
    navigator.clipboard.writeText(referral.id);
    alert(lang === 'mr' ? 'रेफरल टोकन कॉपी केले!' : 'Referral token copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#546E7A] hover:text-[#1A4B8C] transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'mr' ? 'मागे जा' : 'Back to List'}</span>
            </button>
          )}
          <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
            {lang === 'mr' ? 'माझा डिजिटल संदर्भ व प्रवास ट्रॅकर' : 'My Digital Referral & Journey Tracker'}
          </h1>
          <p className="text-xs text-[#546E7A] mt-0.5">
            {lang === 'mr'
              ? 'प्राथमिक आरोग्य केंद्रावरून उच्च रुग्णालयात पाठवलेल्या संदर्भ सेवेची सद्यस्थिती'
              : 'Real-time progress, transport tracking and digital referral token'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white border border-[#CFD8DC] rounded-xl text-xs font-bold text-[#1C2B3A] hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'mr' ? 'रेफरल स्लिप प्रिंट' : 'Print Slip'}</span>
          </button>
        </div>
      </div>

      {/* Digital Referral Token Hero Card */}
      <div className="bg-gradient-to-br from-[#1A4B8C] to-[#0B2545] rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              {lang === 'mr' ? 'अधिकृत डिजिटल रेफरल टोकन' : 'Government Digital Referral Token'}
            </span>
            <div className="flex items-center gap-2.5">
              <h2 className="font-mono text-2xl sm:text-3xl font-black tracking-wide text-amber-300">
                {referral.id}
              </h2>
              <button
                onClick={copyToken}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition"
                title="Copy Token"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-blue-100">
              ABHA ID: <span className="font-mono font-bold text-white">{referral.abhaId}</span> · {lang === 'mr' ? referral.patientNameMr : referral.patientNameEn}
            </p>
          </div>

          {/* QR Code Graphic Box */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20 shrink-0 self-start md:self-auto">
            <div className="w-16 h-16 bg-white rounded-xl p-1 flex items-center justify-center text-slate-900 shadow-xs">
              {/* Scalable QR Visual */}
              <div className="w-full h-full border-2 border-slate-900 rounded p-0.5 grid grid-cols-3 gap-0.5">
                <div className="bg-slate-900 rounded-xs" />
                <div className="border border-slate-900" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="border border-slate-900" />
                <div className="bg-slate-900" />
                <div className="border border-slate-900" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="border border-slate-900" />
                <div className="bg-slate-900 rounded-xs" />
              </div>
            </div>
            <div className="text-[10px] text-blue-100 space-y-0.5">
              <span className="font-bold block text-white">QR Verification</span>
              <p className="max-w-[130px] leading-tight">
                {lang === 'mr' ? 'रुग्णालय काऊंटरवर दाखवण्यासाठी स्कॅन करा' : 'Scan at hospital desk for instant intake'}
              </p>
            </div>
          </div>

        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/15 text-xs">
          <div>
            <span className="text-[10px] text-blue-200 uppercase font-bold block">{lang === 'mr' ? 'रेफर करणारे केंद्र' : 'Originating PHC'}</span>
            <strong className="text-white">{lang === 'mr' ? referral.referringFacilityMr : referral.referringFacilityEn}</strong>
            <p className="text-[11px] text-blue-200">{lang === 'mr' ? referral.referringDoctorMr : referral.referringDoctorEn}</p>
          </div>

          <div className="sm:border-x sm:border-white/15 sm:px-3">
            <span className="text-[10px] text-blue-200 uppercase font-bold block">{lang === 'mr' ? 'रेफर केलेले रुग्णालय' : 'Referred Hospital'}</span>
            <strong className="text-amber-200">{lang === 'mr' ? referral.targetHospitalNameMr : referral.targetHospitalNameEn}</strong>
            <p className="text-[11px] text-blue-200">{lang === 'mr' ? referral.departmentMr : referral.departmentEn}</p>
          </div>

          <div>
            <span className="text-[10px] text-blue-200 uppercase font-bold block">{lang === 'mr' ? 'निकड स्तर' : 'Urgency Level'}</span>
            <strong className="text-white">{referral.urgency}</strong>
            <p className="text-[11px] text-blue-200">{lang === 'mr' ? 'तातडीचे क्लिनिकल ट्रॅकिंग' : 'Fast-track protocol'}</p>
          </div>
        </div>
      </div>

      {/* 7-Stage Milestone Journey Tracker */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#546E7A]">
            {lang === 'mr' ? 'रेफरल प्रगती टप्पे (७ टप्पे)' : 'Referral Milestone Timeline (7-Stages)'}
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-[#1A4B8C] rounded-full border border-blue-200">
            {referral.stage}
          </span>
        </div>

        <StatusTimeline
          currentStage={referral.stage}
          stageHistory={referral.stageHistory}
          isOverdue={referral.isOverdue}
        />
      </div>

      {/* Live Transport Status Card (if transport requested) */}
      {referral.transportNeeded && referral.transportStatus && (
        <div className="bg-[#E8F0FE] rounded-2xl border border-blue-200 p-5 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#1A4B8C] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#1A4B8C]">
                  {lang === 'mr' ? 'मोफत १०२ जननी / १०८ आपत्कालीन रुग्णवाहिका' : 'Free Government Emergency Transport'}
                </span>
                <h4 className="text-base font-bold text-[#1C2B3A]">
                  {referral.transportStatus.vehicleNumber}
                </h4>
                <p className="text-xs text-[#546E7A]">
                  {lang === 'mr' ? 'चालक:' : 'Driver:'} {referral.transportStatus.driverName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${referral.transportStatus.driverPhone}`}
                className="px-4 py-2 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'चालकास कॉल करा' : 'Call Driver'}</span>
              </a>
              <a
                href="tel:108"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>SOS 108</span>
              </a>
            </div>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-blue-200/80 text-xs flex items-center justify-between">
            <span className="font-semibold text-blue-900">
              {lang === 'mr' ? referral.transportStatus.liveStatusMr : referral.transportStatus.liveStatusEn}
            </span>
            <span className="font-bold text-[#1A4B8C] font-mono">
              ETA: {referral.transportStatus.etaMinutes} mins
            </span>
          </div>
        </div>
      )}

      {/* Target Hospital Contact Details Card */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
          {lang === 'mr' ? 'रुग्णालय संपर्क व मदत केंद्र' : 'Destination Hospital Contact Desk'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <strong className="text-sm text-[#1C2B3A] block">{lang === 'mr' ? referral.targetHospitalNameMr : referral.targetHospitalNameEn}</strong>
            <p className="text-slate-600 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>औंध छावणी परिसर, पुणे - ४११०२७ (OPD Room 14 / Triage Desk)</span>
            </p>
          </div>

          <div className="flex flex-col justify-between sm:items-end gap-2">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-500 font-bold block">{lang === 'mr' ? 'हेल्पलाईन क्रमांक' : 'Desk Helpline'}</span>
              <span className="font-mono text-xs font-bold text-[#1A4B8C]">+91 20 2727 3400</span>
            </div>
            <a
              href="tel:02027273400"
              className="px-4 py-2 rounded-xl border border-blue-200 text-[#1A4B8C] hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'रुग्णालयास थेट कॉल करा' : 'Call Hospital Desk'}</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
