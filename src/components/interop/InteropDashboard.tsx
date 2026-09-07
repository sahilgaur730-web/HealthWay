import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCode,
  FileSpreadsheet,
  Lock,
  Building2,
  Users,
  ArrowRightLeft,
  Server,
  Activity,
  CheckCircle2,
  BookOpen,
  Share2,
  CreditCard,
  Layers,
  Database
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import ABDMConnect from './ABDMConnect';
import ConsentManager from './ConsentManager';
import FHIRRecordViewer from './FHIRRecordViewer';
import SystemLinker from './SystemLinker';
import DataExportPanel from './DataExportPanel';
import { ABDM_STANDARDS } from '../../services/interopStandards';

interface InteropDashboardProps {
  initialTab?: 'abdm' | 'consent' | 'fhir' | 'systems' | 'export' | 'standards';
}

export default function InteropDashboard({ initialTab = 'abdm' }: InteropDashboardProps) {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'abdm' | 'consent' | 'fhir' | 'systems' | 'export' | 'standards'>(initialTab);

  const abdmMilestones = [
    {
      milestone: 'M1',
      titleEn: 'ABHA Creation & Authentication',
      titleMr: 'ABHA ओळखपत्र निर्मिती व पडताळणी',
      descEn: 'Aadhaar OTP and demographic biometric linkage creating universal 14-digit ABHA ID and @abdm PHR address.',
      descMr: 'आधार ओटीपी व मोबाईल पडताळणीद्वारे १४ अंकी डिजिटल ABHA क्रमांक आणि @abdm पत्ता तयार करणे.',
      statusEn: '100% Certified (Production Active)',
      statusMr: '१००% प्रमाणित (उत्पादन सक्रिय)',
      testsPassed: 38,
      totalTests: 38,
    },
    {
      milestone: 'M2',
      titleEn: 'Health Facility & Professional Registry (HFR/HPR)',
      titleMr: 'आरोग्य संस्था व डॉक्टर्स अधिकृत नोंदणी (HFR/HPR)',
      descEn: 'Onboarding 847 public facilities (SC, PHC, CHC, DH) and registered MBBS/MD medical officers with digital signature keys.',
      descMr: '८४७ शासकीय आरोग्य संस्था आणि सर्व वैद्यकीय अधिकाऱ्यांची राष्ट्रीय नोंदणी व डिजिटल स्वाक्षरी प्रमाणीकरण.',
      statusEn: '100% Certified (HFR Node Live)',
      statusMr: '१००% प्रमाणित (HFR नोड लाइव्ह)',
      testsPassed: 42,
      totalTests: 42,
    },
    {
      milestone: 'M3',
      titleEn: 'Health Information Provider & User (HIP/HIU Bridge)',
      titleMr: 'आरोग्य माहिती देवाणघेवाण प्रणाली (HIP/HIU)',
      descEn: 'Decentralized encrypted health record exchange, FHIR bundle push/pull, consent manager artifact verification.',
      descMr: 'सुरक्षित कूटबद्ध आरोग्य नोंदींची देवाणघेवाण, FHIR बंडल ट्रान्सफर आणि डिजिटल संमती व्यवस्थापन.',
      statusEn: '100% Certified (Federated Exchange)',
      statusMr: '१००% प्रमाणित (फेडरेटेड देवाणघेवाण)',
      testsPassed: 54,
      totalTests: 54,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#CFD8DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1A4B8C]">
              Demand 13 · Interoperability
            </span>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ABDM Sandbox v4.0 Active
            </span>
            <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 hidden sm:inline-block">
              HL7 FHIR R4
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1C2B3A] mt-1">
            {lang === 'mr' ? 'आंतरकार्यक्षमता व शासकीय मानके केंद्र' : 'Interoperability & Open Standards Command Center'}
          </h1>
          <p className="text-xs text-[#546E7A] mt-0.5">
            {lang === 'mr'
              ? 'आयुष्मान भारत डिजिटल मिशन (ABDM M1/M2/M3), HL7 FHIR R4 बंडल, NHM HMIS, आणि DPDP संमती व्यवस्थापन'
              : 'Ayushman Bharat Digital Mission (M1-M3), HL7 FHIR R4 Bundle Exchange, NHM HMIS Reporting & DPDP Consent Engine'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">HIP/HIU Node</span>
            <span className="text-xs font-bold font-mono text-[#1A4B8C]">MH-PUNE-GW-01</span>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{lang === 'mr' ? 'ABHA जोडणी' : 'ABHA Verified'}</span>
            <CreditCard className="w-4 h-4 text-[#1A4B8C]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#1C2B3A]">142,847</div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {lang === 'mr' ? '१००% आधार प्रमाणित' : '100% Aadhaar Verified'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{lang === 'mr' ? 'HFR नोंदणी' : 'HFR Facilities'}</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-[#1C2B3A]">847 / 847</div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {lang === 'mr' ? 'सर्व संस्था समाविष्ट' : '100% District Coverage'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{lang === 'mr' ? 'FHIR बंडल्स' : 'FHIR Exchanges'}</span>
            <ArrowRightLeft className="w-4 h-4 text-[#F57C00]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#1C2B3A]">89,234</div>
          <p className="text-[11px] text-[#1A4B8C] font-semibold">
            {lang === 'mr' ? 'NRCES मानकीकृत' : 'NRCES India Profile'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{lang === 'mr' ? 'सक्रिय संमती' : 'Active Consents'}</span>
            <Lock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black font-mono text-[#1C2B3A]">1,420</div>
          <p className="text-[11px] text-purple-700 font-semibold">
            {lang === 'mr' ? 'DPDP सुरक्षित ऑडिट' : 'DPDP Cryptographic'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#CFD8DC] overflow-x-auto pb-1 text-xs">
        {[
          { id: 'abdm', labelMr: 'ABDM गेटवे व ABHA', labelEn: 'ABDM & ABHA Connect', icon: ShieldCheck },
          { id: 'consent', labelMr: 'इलेक्ट्रॉनिक संमती व्यवस्थापक', labelEn: 'Consent Manager (DPDP)', icon: Lock },
          { id: 'fhir', labelMr: 'HL7 FHIR R4 नोंदी', labelEn: 'FHIR R4 Records', icon: FileCode },
          { id: 'systems', labelMr: 'शासकीय प्रणाली जोडणी', labelEn: 'External Gateways', icon: Server },
          { id: 'export', labelMr: 'डेटा निर्यात व अहवाल', labelEn: 'Data Export & Reports', icon: FileSpreadsheet },
          { id: 'standards', labelMr: 'शासकीय मानके संदर्भ', labelEn: 'Standards & Registry', icon: BookOpen }
        ].map((tab) => {
          const IconComp = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-2xl font-bold flex items-center gap-2 border-t-2 transition shrink-0 whitespace-nowrap ${
                active
                  ? 'border-[#1A4B8C] bg-white text-[#1A4B8C] shadow-xs'
                  : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A] hover:bg-slate-100'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{lang === 'mr' ? tab.labelMr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="pt-2">
        {/* TAB 1: ABDM CONNECT */}
        {activeTab === 'abdm' && (
          <ABDMConnect />
        )}

        {/* TAB 2: CONSENT MANAGER */}
        {activeTab === 'consent' && (
          <ConsentManager />
        )}

        {/* TAB 3: FHIR R4 RECORD VIEWER */}
        {activeTab === 'fhir' && (
          <FHIRRecordViewer />
        )}

        {/* TAB 4: EXTERNAL SYSTEMS GATEWAY */}
        {activeTab === 'systems' && (
          <SystemLinker />
        )}

        {/* TAB 5: DATA EXPORT & NHM HMIS REPORTING */}
        {activeTab === 'export' && (
          <DataExportPanel />
        )}

        {/* TAB 6: STANDARDS & REGISTRY MATRIX */}
        {activeTab === 'standards' && (
          <div className="space-y-6">
            {/* ABDM Milestones Grid */}
            <div className="bg-white p-6 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#1C2B3A]">
                    {lang === 'mr' ? 'राष्ट्रीय आरोग्य प्राधिकरण (NHA) ABDM अधिकृत प्रमाणीकरण टप्पे' : 'National Health Authority (NHA) ABDM Certification Milestones'}
                  </h3>
                  <p className="text-xs text-[#546E7A] mt-0.5">
                    HealthWay Platform Official Production Certification Status (v4.0)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Certified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {abdmMilestones.map((m) => (
                  <div
                    key={m.milestone}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#1A4B8C] font-black text-sm flex items-center justify-center font-mono">
                          {m.milestone}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          PASSED
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#1C2B3A]">
                        {lang === 'mr' ? m.titleMr : m.titleEn}
                      </h4>
                      <p className="text-xs text-[#546E7A] leading-relaxed">
                        {lang === 'mr' ? m.descMr : m.descEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Compliance Score:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {m.testsPassed} / {m.totalTests} (100%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Standard Terminologies Matrix */}
            <div className="bg-white p-6 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-4">
              <h3 className="font-bold text-base text-[#1C2B3A]">
                {lang === 'mr' ? 'मानकीकृत क्लिनिकल शब्दावली (Terminology Standards)' : 'Standard Clinical Terminologies & Code Systems'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="font-mono font-bold text-[#1A4B8C] text-sm block">SNOMED CT</span>
                  <p className="text-slate-600">Clinical terms, findings, diagnoses, procedures and anatomy</p>
                  <span className="font-mono text-[10px] text-slate-400 block">{ABDM_STANDARDS.terminologies.SNOMED_CT}</span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="font-mono font-bold text-emerald-700 text-sm block">LOINC</span>
                  <p className="text-slate-600">Laboratory observations, diagnostic tests and clinical measurements</p>
                  <span className="font-mono text-[10px] text-slate-400 block">{ABDM_STANDARDS.terminologies.LOINC}</span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="font-mono font-bold text-purple-700 text-sm block">ICD-10 / ICD-11</span>
                  <p className="text-slate-600">International statistical classification of diseases and health problems</p>
                  <span className="font-mono text-[10px] text-slate-400 block">{ABDM_STANDARDS.terminologies.ICD_10}</span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="font-mono font-bold text-amber-700 text-sm block">NRCES Profiles</span>
                  <p className="text-slate-600">National Resource Centre for EHR Standards India FHIR R4 Profiles</p>
                  <span className="font-mono text-[10px] text-slate-400 block">nrces.in/ndhm/fhir/r4</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
