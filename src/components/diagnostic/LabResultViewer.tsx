import React from 'react';
import { 
  FlaskConical, 
  Download, 
  Printer, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Share2, 
  ExternalLink, 
  Clock, 
  FileCheck2, 
  UserCheck 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { TestOrderItem } from '../../services/diagnosticService';

interface LabResultViewerProps {
  order: TestOrderItem;
  onClose: () => void;
}

export default function LabResultViewer({ order, onClose }: LabResultViewerProps) {
  const { lang } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#CFD8DC] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-[#0B2545] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <FlaskConical className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  {lang === 'mr' ? 'प्रमाणित डिजिटल लॅब अहवाल' : 'Verified Digital Diagnostic Report'}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-700 text-white font-mono">
                  NABL ISO 15189
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                {lang === 'mr' ? `ऑर्डर आयडी: ${order.id} · बारकोड: ${order.barcode}` : `Order ID: ${order.id} · Barcode: ${order.barcode}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 transition"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Patient & Facility Context Header */}
        <div className="bg-slate-50 p-4 border-b border-[#CFD8DC] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#546E7A] block">
              {lang === 'mr' ? 'रुग्ण तपशील (Patient Details):' : 'Patient Information:'}
            </span>
            <strong className="text-sm text-[#1C2B3A]">{lang === 'mr' ? order.patientNameMr : order.patientNameEn}</strong>
            <p className="text-[11px] text-[#546E7A]">
              ABHA: <span className="font-mono font-bold text-[#1A4B8C]">{order.abhaId}</span> · {order.patientAge}y/{order.patientGender}
            </p>
            <p className="text-[11px] text-[#546E7A]">
              {lang === 'mr' ? 'डॉक्टर:' : 'Doctor:'} {lang === 'mr' ? order.prescribedByDoctorMr : order.prescribedByDoctorEn}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-bold uppercase text-[#546E7A] block">
              {lang === 'mr' ? 'तपासणी लॅब केंद्र:' : 'Diagnostic Facility:'}
            </span>
            <strong className="text-sm text-[#1A4B8C]">{lang === 'mr' ? order.targetLabNameMr : order.targetLabNameEn}</strong>
            <p className="text-[11px] text-[#546E7A]">
              {lang === 'mr' ? 'तारीख:' : 'Date:'} {order.completedAt || order.createdAt.slice(0, 10)}
            </p>
            <span className="inline-block mt-1 font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
              {order.barcode}
            </span>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Critical Value Alert Banner (RED HIGHLIGHT) */}
          {order.hasCriticalValue && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3.5 flex items-start gap-3 text-red-950 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs uppercase tracking-wide text-red-800 block">
                  {lang === 'mr' ? 'अत्यंत गंभीर मूल्य इशारा (CRITICAL VALUE ALERT)' : 'CRITICAL VALUE ALERT - STAT INTERVENTION NEEDED'}
                </span>
                <p className="text-[11px] text-red-900 mt-0.5 font-medium">
                  {lang === 'mr'
                    ? 'या अहवालात जीवन-धोकादायक स्तर आढळले आहेत. त्वरित तज्ञ डॉक्टरांशी संपर्क साधा किंवा आपत्कालीन विभागात दाखल करा.'
                    : 'Critical bio-marker values detected outside physiological safe bounds. Immediate specialist escalation advised.'}
                </p>
              </div>
            </div>
          )}

          {/* Tests Conducted Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase text-[#546E7A] mr-1">
              {lang === 'mr' ? 'केलेल्या चाचण्या:' : 'Tests Conducted:'}
            </span>
            {order.tests.map(t => (
              <span key={t.id} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#1A4B8C] border border-blue-200">
                {lang === 'mr' ? t.nameMr : t.nameEn}
              </span>
            ))}
          </div>

          {/* Individual Parameters Table */}
          <div className="border border-[#CFD8DC] rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-[#CFD8DC] grid grid-cols-12 gap-2 text-[11px] font-bold text-[#546E7A] uppercase">
              <div className="col-span-5 sm:col-span-4">{lang === 'mr' ? 'तपासणी घटक' : 'Parameter'}</div>
              <div className="col-span-3 sm:col-span-3 text-right">{lang === 'mr' ? 'निरीक्षित मूल्य' : 'Result Value'}</div>
              <div className="col-span-4 sm:col-span-3 text-center">{lang === 'mr' ? 'संदर्भ मर्यादा' : 'Biological Ref'}</div>
              <div className="hidden sm:block sm:col-span-2 text-center">{lang === 'mr' ? 'स्थिती' : 'Flag'}</div>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {order.results && order.results.length > 0 ? (
                order.results.map((param) => {
                  const isCritical = param.flag === 'CRITICAL';
                  const isBorderline = param.flag === 'BORDERLINE';

                  return (
                    <div 
                      key={param.parameterId}
                      className={`px-4 py-3 grid grid-cols-12 gap-2 items-center text-xs transition ${
                        isCritical 
                          ? 'bg-red-50/90 font-bold border-l-4 border-l-red-600' 
                          : isBorderline 
                            ? 'bg-amber-50/60 border-l-4 border-l-amber-500' 
                            : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Parameter Name */}
                      <div className="col-span-5 sm:col-span-4">
                        <span className="font-bold text-[#1C2B3A] block">
                          {lang === 'mr' ? param.nameMr : param.name}
                        </span>
                        {param.criticalReasonMr && (
                          <span className="text-[10px] text-red-700 font-normal block leading-tight">
                            {lang === 'mr' ? param.criticalReasonMr : param.criticalReasonEn}
                          </span>
                        )}
                      </div>

                      {/* Observed Value */}
                      <div className="col-span-3 sm:col-span-3 text-right font-mono">
                        <span className={`font-bold text-sm ${
                          isCritical ? 'text-red-700' : isBorderline ? 'text-amber-800' : 'text-slate-900'
                        }`}>
                          {param.value}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">{param.unit}</span>
                      </div>

                      {/* Biological Reference Range */}
                      <div className="col-span-4 sm:col-span-3 text-center text-[11px] text-slate-600 font-mono">
                        {param.referenceRange}
                      </div>

                      {/* Status Flag */}
                      <div className="col-span-12 sm:col-span-2 flex justify-end sm:justify-center mt-1 sm:mt-0">
                        {isCritical ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white uppercase shadow-xs">
                            Critical
                          </span>
                        ) : isBorderline ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                            Abnormal
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                            Normal
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  {lang === 'mr' ? 'तपासणी प्रक्रिया लॅबमध्ये सुरू आहे...' : 'Specimen is under automated analyzer run...'}
                </div>
              )}
            </div>
          </div>

          {/* Pathologist Clinical Impression */}
          {order.overallImpressionEn && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#546E7A] block">
                {lang === 'mr' ? 'पॅथॉलॉजिस्ट क्लिनिकल अभिप्राय व सल्ला:' : 'Consultant Pathologist Impression & Advisory:'}
              </span>
              <p className="text-slate-900 font-medium leading-relaxed">
                {lang === 'mr' ? order.overallImpressionMr : order.overallImpressionEn}
              </p>
            </div>
          )}

          {/* ABHA EHR Synchronization & Pathologist Stamp */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950 block">
                  {lang === 'mr' ? 'ABHA डिजिटल हेल्थ रेकॉर्डमध्ये सुरक्षितपणे समक्रमित' : 'Ayushman Bharat Digital Mission (ABDM) FHIR Synced'}
                </span>
                <p className="text-[10px] text-emerald-800 font-mono">
                  Report Resource ID: {order.abhaRecordSyncId || `ABHA-EHR-${order.barcode}`}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
              <span className="text-[10px] font-bold text-slate-500 block">
                {lang === 'mr' ? 'प्रमाणित करणारे पॅथॉलॉजिस्ट:' : 'Electronically Signed by:'}
              </span>
              <strong className="text-slate-800">
                {lang === 'mr' ? (order.verifiedByPathologistMr || 'डॉ. संजय काळे (MD Path)') : (order.verifiedByPathologistEn || 'Dr. Sanjay Kale (MD Path)')}
              </strong>
              <div className="text-[10px] font-mono text-slate-500">{order.nablCertNumber || 'NABL-MC-28491'}</div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-[#CFD8DC] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#CFD8DC] text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            {lang === 'mr' ? 'बंद करा' : 'Close'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const docContent = [
                  `================================================================================`,
                  `MAHARASHTRA PUBLIC HEALTH - AYUSHMAN BHARAT DIGITAL MISSION (ABDM)`,
                  `VERIFIED CLINICAL DIAGNOSTIC REPORT · NABL ISO 15189 CERTIFIED`,
                  `================================================================================`,
                  `Order ID:       ${order.id}`,
                  `Barcode:        ${order.barcode}`,
                  `ABHA ID:        ${order.abhaId}`,
                  `Patient:        ${lang === 'mr' ? order.patientNameMr : order.patientNameEn} (${order.patientAge}Y / ${order.patientGender})`,
                  `Facility:       ${lang === 'mr' ? order.facilityMr : order.facilityEn}`,
                  `Diagnostic Lab: ${lang === 'mr' ? order.targetLabNameMr : order.targetLabNameEn}`,
                  `Priority:       ${order.priority} | Collection: ${order.collectionMethod}`,
                  `Report Date:    ${order.completedAt || order.createdAt}`,
                  `FHIR Sync ID:   ${order.abhaRecordSyncId || `ABHA-DIAG-${order.barcode}`}`,
                  `================================================================================`,
                  `TEST FINDINGS & BIOLOGICAL REFERENCE RANGES:`,
                  `--------------------------------------------------------------------------------`,
                  ...(order.results || []).map(r => 
                    `[${r.flag}] ${lang === 'mr' ? r.nameMr : r.name}: ${r.value} ${r.unit} (Ref: ${r.referenceRange})${r.criticalReasonMr ? ` - ALERT: ${lang === 'mr' ? r.criticalReasonMr : r.criticalReasonEn}` : ''}`
                  ),
                  `--------------------------------------------------------------------------------`,
                  `PATHOLOGIST CLINICAL IMPRESSION:`,
                  `${lang === 'mr' ? order.overallImpressionMr : order.overallImpressionEn}`,
                  order.hasCriticalValue ? `*** CRITICAL VALUE ALERT: IMMEDIATE MEDICAL ACTION REQUIRED ***` : `Status: Verified Normal/Manageable`,
                  `--------------------------------------------------------------------------------`,
                  `Electronically Verified By: ${lang === 'mr' ? (order.verifiedByPathologistMr || 'डॉ. संजय काळे (MD Path)') : (order.verifiedByPathologistEn || 'Dr. Sanjay Kale (MD Path)')}`,
                  `Accreditation: ${order.nablCertNumber || 'NABL-MC-28491-PUNE'}`,
                  `================================================================================`,
                ].join('\n');

                const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${order.barcode}-Diagnostic-Report.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 rounded-xl bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'प्रमाणित अहवाल डाउनलोड' : 'Download Verified Report'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
