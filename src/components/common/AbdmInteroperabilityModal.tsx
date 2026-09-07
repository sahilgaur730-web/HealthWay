import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCode, 
  CheckCircle2, 
  Download, 
  Copy, 
  ExternalLink, 
  X,
  Database,
  ArrowRightLeft,
  Server
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CURRENT_PATIENT, PAST_VISITS } from '../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AbdmInteroperabilityModal({ isOpen, onClose }: Props) {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'fhir' | 'standards' | 'hmis'>('standards');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fhirBundle = {
    resourceType: "Bundle",
    id: "abdm-bundle-mh-2024-00192",
    meta: {
      lastUpdated: new Date().toISOString(),
      profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
    },
    identifier: {
      system: "https://healthid.ndhm.gov.in",
      value: CURRENT_PATIENT.abhaId
    },
    type: "document",
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `urn:uuid:patient-${CURRENT_PATIENT.id}`,
        resource: {
          resourceType: "Patient",
          id: CURRENT_PATIENT.id,
          identifier: [
            { system: "https://healthid.ndhm.gov.in", value: CURRENT_PATIENT.abhaId },
            { system: "https://uidai.gov.in", value: "XXXX-XXXX-8921" }
          ],
          name: [{ text: CURRENT_PATIENT.nameEn }],
          gender: "female",
          birthDate: "1996-04-12",
          address: [{ state: "Maharashtra", district: "Pune", village: "Vadgaon", postalCode: "412208" }]
        }
      },
      {
        fullUrl: "urn:uuid:encounter-enc-001",
        resource: {
          resourceType: "Encounter",
          status: "finished",
          class: { code: "AMB", display: "ambulatory" },
          serviceProvider: { display: "PHC Shirur, Pune" },
          diagnosis: [{ condition: { display: "Antenatal Care - 3rd Trimester (Mild Anemia)" } }]
        }
      },
      {
        fullUrl: "urn:uuid:medication-req-001",
        resource: {
          resourceType: "MedicationRequest",
          status: "active",
          intent: "order",
          medicationCodeableConcept: { text: "Iron Folic Acid (IFA) Tablets 100mg" },
          dosageInstruction: [{ text: "1 tablet daily after food for 30 days" }]
        }
      }
    ]
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#CFD8DC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">
                  {lang === 'mr' ? 'ABDM व FHIR R4 आंतरकार्यक्षमता मानक' : 'ABDM & FHIR R4 Interoperability Gateway'}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  Demand 13
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                {lang === 'mr' 
                  ? 'आयुष्मान भारत डिजिटल मिशन आणि NHM-HMIS एकात्मता' 
                  : 'Ayushman Bharat Digital Mission (M1/M2/M3) & HMIS open data standards'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-2 flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('standards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'standards' ? 'bg-white text-[#1A4B8C] shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            {lang === 'mr' ? 'शासकीय मानके (Compliance)' : 'ABDM Milestones'}
          </button>
          <button
            onClick={() => setActiveTab('fhir')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'fhir' ? 'bg-white text-[#1A4B8C] shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>FHIR R4 JSON Bundle</span>
          </button>
          <button
            onClick={() => setActiveTab('hmis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'hmis' ? 'bg-white text-[#1A4B8C] shadow-xs' : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            {lang === 'mr' ? 'NHM / HMIS समक्रमण' : 'NHM & HMIS Sync'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-[#1C2B3A]">
          
          {activeTab === 'standards' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ABDM Milestone 1</span>
                  </div>
                  <p className="text-[11px] text-emerald-950 mt-1 font-semibold">ABHA Creation & Capture</p>
                  <p className="text-[10px] text-emerald-800/80 mt-0.5">Aadhaar/Mobile OTP verified 14-digit ABHA creation operational.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ABDM Milestone 2</span>
                  </div>
                  <p className="text-[11px] text-emerald-950 mt-1 font-semibold">HIP (Info Provider)</p>
                  <p className="text-[10px] text-emerald-800/80 mt-0.5">OPD visits, prescriptions, & diagnostic results linked to ABHA gateway.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ABDM Milestone 3</span>
                  </div>
                  <p className="text-[11px] text-emerald-950 mt-1 font-semibold">HIU (Info User)</p>
                  <p className="text-[10px] text-emerald-800/80 mt-0.5">Doctor view consent-driven longitudinal records across all facilities.</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-xs text-[#1A4B8C] flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  <span>National Interoperability Architecture Specifications</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><strong className="text-slate-700">Standards Body:</strong> National Resource Centre for EHR Standards (NRCeS)</div>
                  <div><strong className="text-slate-700">Data Format:</strong> HL7 FHIR Release 4 (JSON / REST API)</div>
                  <div><strong className="text-slate-700">Terminology:</strong> SNOMED CT, LOINC (Diagnostic tests), ICD-10</div>
                  <div><strong className="text-slate-700">Security:</strong> End-to-end ECDH Diffie-Hellman encryption</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fhir' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#546E7A] font-medium">
                  NRCeS Compliant Diagnostic & Encounter FHIR R4 Bundle
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-64 border border-slate-800">
                {JSON.stringify(fhirBundle, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'hmis' && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[#1A4B8C] font-bold">
                  <Database className="w-4 h-4" />
                  <span>National Health Mission (NHM) Monthly HMIS Sync</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  HealthWay automatically aggregates rural clinical data (OPD footfall, antenatal registrations, institutional deliveries, infant immunizations, and NCD screenings) into official HMIS Form formats ready for submission to the central Ministry of Health portal.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">HMIS Facility Code</span>
                  <span className="font-mono font-bold text-xs text-slate-800 mt-1 block">MH-PUN-08472</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Sync Protocol</span>
                  <span className="font-mono font-bold text-xs text-emerald-700 mt-1 block">REST JSON / HTTPS</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Last HMIS Export</span>
                  <span className="font-mono font-bold text-xs text-slate-800 mt-1 block">01-06-2024 (Auto)</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-[#546E7A] font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ABDM Sandbox Certified (Production Ready)</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1A4B8C] text-white text-xs font-bold hover:bg-[#0D3470]"
          >
            {lang === 'mr' ? 'बंद करा' : 'Close Gateway'}
          </button>
        </div>

      </div>
    </div>
  );
}
