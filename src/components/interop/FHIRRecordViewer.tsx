import React, { useState } from 'react';
import {
  FileCode,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Check,
  Building2,
  User,
  Stethoscope,
  Hospital,
  Microscope,
  Pill,
  Syringe,
  Sprout,
  ShieldCheck,
  Tag,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Code
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FhirService, FhirResourceSummary } from '../../services/fhirService';
import { ABDM_STANDARDS } from '../../services/interopStandards';

export default function FHIRRecordViewer() {
  const { lang } = useLanguage();
  const [records] = useState<FhirResourceSummary[]>(() => FhirService.getAllRecords());
  const [selectedDocType, setSelectedDocType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'json'>('cards');
  const [selectedRecord, setSelectedRecord] = useState<FhirResourceSummary | null>(records[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; profile: string; errors: string[] } | null>(null);

  const filteredRecords = records.filter(r => {
    const matchType = selectedDocType === 'ALL' || r.documentType === selectedDocType;
    const matchSearch = !searchQuery ||
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientAbhaId.includes(searchQuery) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const getDocTypeIcon = (docType: string) => {
    switch (docType) {
      case 'OPConsultation':
        return Stethoscope;
      case 'DischargeSummary':
        return Hospital;
      case 'DiagnosticReport':
        return Microscope;
      case 'Prescription':
        return Pill;
      case 'ImmunizationRecord':
        return Syringe;
      default:
        return Sprout;
    }
  };

  const handleCopyJson = (record: FhirResourceSummary) => {
    navigator.clipboard.writeText(JSON.stringify(record.rawJson, null, 2));
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadJson = (record: FhirResourceSummary) => {
    const blob = new Blob([JSON.stringify(record.rawJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.id}-FHIR-R4.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleValidate = (record: FhirResourceSummary) => {
    const res = FhirService.validateResource(record.rawJson);
    setValidationResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-white p-5 rounded-3xl border border-[#CFD8DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1A4B8C]">
              HL7 FHIR R4 (4.0.1)
            </span>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              NRCES India Profile Validated
            </span>
          </div>
          <h2 className="text-lg font-black text-[#1C2B3A] mt-1">
            {lang === 'mr' ? 'FHIR R4 क्लिनिकल आरोग्य नोंदी दर्शक' : 'FHIR R4 Clinical Health Records Viewer'}
          </h2>
          <p className="text-xs text-[#546E7A] mt-0.5">
            {lang === 'mr'
              ? 'राष्ट्रीय डिजिटल आरोग्य अभियानाच्या (NRCES) मानकांनुसार तयार केलेली इलेक्ट्रॉनिक आरोग्य बंडल्स.'
              : 'Interoperable clinical summaries structured per National Resource Centre for EHR Standards (NRCES).'}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'cards'
                ? 'bg-white text-[#1A4B8C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'क्लिनिकल कार्ड दृश्य' : 'Clinical Cards'}</span>
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'json'
                ? 'bg-white text-[#1A4B8C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'कच्चा FHIR JSON' : 'Raw FHIR JSON'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Document Type Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', labelEn: 'All Types', labelMr: 'सर्व नोंदी' },
            { id: 'OPConsultation', labelEn: 'OPD Note', labelMr: 'ओपीडी तपासणी' },
            { id: 'DiagnosticReport', labelEn: 'Lab Report', labelMr: 'प्रयोगशाळा अहवाल' },
            { id: 'Prescription', labelEn: 'Prescription', labelMr: 'औषध प्रिस्क्रिप्शन' },
            { id: 'ImmunizationRecord', labelEn: 'Vaccine', labelMr: 'लसीकरण' },
            { id: 'DischargeSummary', labelEn: 'Discharge', labelMr: 'डिस्चार्ज सारांश' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDocType(tab.id)}
              className={`px-3 py-1.5 rounded-full font-bold transition whitespace-nowrap ${
                selectedDocType === tab.id
                  ? 'bg-[#1A4B8C] text-white shadow-xs'
                  : 'bg-white border border-[#CFD8DC] text-[#546E7A] hover:bg-slate-50'
              }`}
            >
              {lang === 'mr' ? tab.labelMr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'mr' ? 'नाव, ABHA किंवा ID शोधा...' : 'Search patient, ABHA or record ID...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#CFD8DC] rounded-full text-xs text-[#1C2B3A] placeholder-slate-400 focus:outline-hidden focus:border-[#1A4B8C]"
          />
        </div>
      </div>

      {/* View Mode 1: Clinical Cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((rec) => {
            const IconComponent = getDocTypeIcon(rec.documentType);
            const isSelected = selectedRecord?.id === rec.id;

            return (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className={`bg-white rounded-3xl border p-5 transition cursor-pointer shadow-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1A4B8C] ring-2 ring-blue-100 bg-blue-50/20'
                    : 'border-[#CFD8DC] hover:border-slate-400'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1A4B8C] flex items-center justify-center border border-blue-100">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono text-[11px] font-bold text-[#1A4B8C] block">
                          {rec.id}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          {rec.resourceType} · {rec.documentType}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>

                  {/* Title & Patient */}
                  <div>
                    <h3 className="font-bold text-sm text-[#1C2B3A]">
                      {lang === 'mr' ? rec.titleMr : rec.title}
                    </h3>
                    <p className="text-xs text-[#546E7A] mt-1 leading-relaxed">
                      {lang === 'mr' ? rec.summaryMr : rec.summary}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">
                        {lang === 'mr' ? 'रुग्णाचे नाव' : 'Patient Name'}:
                      </span>
                      <span className="font-semibold text-[#1C2B3A]">{rec.patientName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">ABHA ID:</span>
                      <span className="font-mono font-bold text-[#1A4B8C]">{rec.patientAbhaId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">
                        {lang === 'mr' ? 'आरोग्य संस्था' : 'Facility'}:
                      </span>
                      <span className="text-slate-700 truncate block">{rec.facility}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">
                        {lang === 'mr' ? 'वैद्यकीय अधिकारी' : 'Clinician'}:
                      </span>
                      <span className="text-slate-700 truncate block">{rec.doctor}</span>
                    </div>
                  </div>

                  {/* Terminology Coding */}
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold">{lang === 'mr' ? 'मानकीकृत कोड:' : 'Standard Coding:'}</span>
                      <span className="font-mono text-[10px]">{rec.coding.system.includes('snomed') ? 'SNOMED CT' : rec.coding.system.includes('loinc') ? 'LOINC' : 'CVX'}</span>
                    </div>
                    <div className="font-mono text-slate-800">
                      <span className="text-blue-700 font-bold">{rec.coding.code}</span> — {rec.coding.display}
                    </div>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    {new Date(rec.date).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyJson(rec);
                      }}
                      className="p-1.5 rounded-lg border border-[#CFD8DC] bg-white hover:bg-slate-50 text-slate-700 transition"
                      title="Copy JSON"
                    >
                      {copiedId === rec.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadJson(rec);
                      }}
                      className="p-1.5 rounded-lg border border-[#CFD8DC] bg-white hover:bg-slate-50 text-slate-700 transition"
                      title="Download JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode 2: Raw FHIR JSON with Inspector */}
      {viewMode === 'json' && selectedRecord && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Records List Column */}
          <div className="space-y-2 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === 'mr' ? 'नोंद निवडा' : 'Select Resource'} ({filteredRecords.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredRecords.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => {
                    setSelectedRecord(rec);
                    setValidationResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                    selectedRecord?.id === rec.id
                      ? 'border-[#1A4B8C] bg-blue-50/50 shadow-xs'
                      : 'border-[#CFD8DC] bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#1A4B8C] truncate">
                        {rec.id}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1C2B3A] truncate">
                      {rec.patientName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {rec.documentType} · {new Date(rec.date).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* JSON Inspector Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-xs overflow-hidden">
              {/* Card Header */}
              <div className="p-4 border-b border-[#CFD8DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1A4B8C]">
                      {selectedRecord.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {selectedRecord.patientName} ({selectedRecord.patientAbhaId})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-md">
                    Profile: <span className="font-mono text-blue-700">{selectedRecord.profile}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleValidate(selectedRecord)}
                    className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-[#1A4B8C] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? 'मानक पडताळणी' : 'Validate R4'}</span>
                  </button>

                  <button
                    onClick={() => handleCopyJson(selectedRecord)}
                    className="px-3 py-1.5 rounded-xl border border-[#CFD8DC] bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    {copiedId === selectedRecord.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">{lang === 'mr' ? 'कॉपी झाले' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'कॉपी' : 'Copy'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadJson(selectedRecord)}
                    className="px-3 py-1.5 rounded-xl bg-[#1A4B8C] text-white hover:bg-blue-900 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? 'डाउनलोड' : 'Download'}</span>
                  </button>
                </div>
              </div>

              {/* Validation Alert (if executed) */}
              {validationResult && (
                <div className={`p-4 border-b text-xs flex items-start gap-3 ${
                  validationResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {validationResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold">
                      {validationResult.valid
                        ? (lang === 'mr' ? 'NRCES India FHIR R4 मानकांनुसार १००% वैध संसाधन' : '100% Valid per NRCES India FHIR R4 Profile')
                        : (lang === 'mr' ? 'मानक प्रमाणीकरण त्रुटी' : 'Validation Errors Detected')}
                    </div>
                    <div className="text-[11px] font-mono opacity-90">
                      Profile: {validationResult.profile}
                    </div>
                    {validationResult.errors.length > 0 && (
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {validationResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Raw JSON Code Block */}
              <div className="p-4 bg-slate-900 overflow-x-auto max-h-[500px]">
                <pre className="text-emerald-400 font-mono text-xs leading-relaxed">
                  {JSON.stringify(selectedRecord.rawJson, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
