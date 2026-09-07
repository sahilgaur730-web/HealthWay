import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  CheckCircle2,
  Calendar,
  Building2,
  Filter,
  Check,
  RefreshCw,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ExportRecord {
  id: string;
  nameEn: string;
  nameMr: string;
  format: 'CSV' | 'JSON' | 'XML';
  facility: string;
  period: string;
  recordCount: number;
  timestamp: string;
  status: 'COMPLETED' | 'GENERATING';
}

export default function DataExportPanel() {
  const { lang } = useLanguage();
  const [selectedFormat, setSelectedFormat] = useState<'HMIS' | 'MCTS' | 'NIKSHAY' | 'FHIR'>('HMIS');
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-11');
  const [fileType, setFileType] = useState<'CSV' | 'JSON' | 'XML'>('CSV');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([
    {
      id: 'EXP-HMIS-2024-1101',
      nameEn: 'NHM HMIS Monthly Indicators (All Blocks)',
      nameMr: 'NHM HMIS मासिक कामकाज निर्देशांक अहवाल',
      format: 'CSV',
      facility: 'All Pune District Facilities (847)',
      period: 'October 2024',
      recordCount: 847,
      timestamp: '2024-11-05 14:30',
      status: 'COMPLETED'
    },
    {
      id: 'EXP-MCTS-2024-1089',
      nameEn: 'MCTS / RCH Beneficiary Registration Batch',
      nameMr: 'MCTS / RCH माता-बाल लाभार्थी नोंदणी बॅच',
      format: 'JSON',
      facility: 'PHC Wagholi (Haveli Block)',
      period: 'October 2024',
      recordCount: 1420,
      timestamp: '2024-11-04 11:15',
      status: 'COMPLETED'
    },
    {
      id: 'EXP-TB-2024-0941',
      nameEn: 'Nikshay TB Case Notification Export (XML)',
      nameMr: 'निक्षय क्षयरोग रुग्ण अधिसूचना अहवाल',
      format: 'XML',
      facility: 'District Hospital Pune',
      period: 'Q2 2024',
      recordCount: 384,
      timestamp: '2024-11-01 09:40',
      status: 'COMPLETED'
    },
    {
      id: 'EXP-FHIR-2024-0822',
      nameEn: 'ABDM FHIR R4 Longitudinal Bundles Export',
      nameMr: 'ABDM FHIR R4 इलेक्ट्रॉनिक आरोग्य बंडल्स',
      format: 'JSON',
      facility: 'All Pune District Facilities (847)',
      period: 'September 2024',
      recordCount: 12400,
      timestamp: '2024-10-28 16:50',
      status: 'COMPLETED'
    }
  ]);

  const handleTriggerExport = () => {
    setIsExporting(true);
    setDownloadSuccess(null);

    setTimeout(() => {
      let content = '';
      let mimeType = 'text/plain';
      let filename = `export-${selectedFormat.toLowerCase()}-${selectedPeriod}.${fileType.toLowerCase()}`;

      if (fileType === 'CSV') {
        mimeType = 'text/csv';
        if (selectedFormat === 'HMIS') {
          content = 'Facility_ID,Facility_Name,Block,Total_OPD,Total_IPD,ANC_Registrations,Institutional_Deliveries,High_Risk_Flagged,Stock_Out_Count\n' +
            'FAC001,PHC Wagholi,Haveli,342,18,48,14,7,0\n' +
            'FAC002,CHC Kharadi,Haveli,589,45,82,31,12,1\n' +
            'FAC003,Sub-Centre Vadgaon,Haveli,124,0,22,0,4,0\n' +
            'FAC005,District Hospital Pune,Pune City,1840,320,190,88,45,0\n';
        } else {
          content = 'Beneficiary_ID,Name,Type,ABHA_ID,Facility,LMP_Date,EDD_Date,Risk_Category\n' +
            'BEN-2024-001,Sunita Ramchandra Jadhav,ANC,14-8842-1928-3011,PHC Wagholi,2024-05-10,2025-02-14,HIGH_RISK_HYPERTENSION\n' +
            'BEN-2024-002,Priya Suresh Kulkarni,ANC,14-2536-7890-1234,CHC Kharadi,2024-06-01,2025-03-08,NORMAL\n';
        }
      } else if (fileType === 'JSON') {
        mimeType = 'application/json';
        content = JSON.stringify({
          exportStandard: selectedFormat,
          generatedAt: new Date().toISOString(),
          facilityScope: selectedFacility,
          reportingPeriod: selectedPeriod,
          totalRecords: 4,
          data: [
            { id: 1, facility: 'PHC Wagholi', status: 'VALIDATED', complianceScore: 98 },
            { id: 2, facility: 'CHC Kharadi', status: 'VALIDATED', complianceScore: 94 }
          ]
        }, null, 2);
      } else {
        mimeType = 'application/xml';
        content = '<?xml version="1.0" encoding="UTF-8"?>\n' +
          `<NikshayNotificationBatch xmlns="http://nikshay.in/schema/v2" period="${selectedPeriod}">\n` +
          '  <Notification id="NOTIF-MH-2024-912">\n' +
          '    <PatientAbha>14-9982-1002-4411</PatientAbha>\n' +
          '    <DiagnosisDate>2024-10-15</DiagnosisDate>\n' +
          '    <TbSite>Pulmonary</TbSite>\n' +
          '    <DrugSensitivity>Sensitive</DrugSensitivity>\n' +
          '    <DotsRegimen>Category-1 4FDC</DotsRegimen>\n' +
          '  </Notification>\n' +
          '</NikshayNotificationBatch>';
      }

      // Trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Add to history
      const newExp: ExportRecord = {
        id: `EXP-${selectedFormat}-${Date.now().toString().slice(-4)}`,
        nameEn: `${selectedFormat} Report (${fileType})`,
        nameMr: `${selectedFormat} अहवाल निर्यात (${fileType})`,
        format: fileType,
        facility: selectedFacility === 'ALL' ? 'All District Facilities' : selectedFacility,
        period: selectedPeriod,
        recordCount: Math.floor(Math.random() * 500) + 150,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'COMPLETED'
      };

      setExportHistory(prev => [newExp, ...prev]);
      setIsExporting(false);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1A4B8C]">
            Government Data Export Engine
          </span>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Compliant with MoHFW Standards
          </span>
        </div>
        <h2 className="text-xl font-black text-[#1C2B3A]">
          {lang === 'mr' ? 'राष्ट्रीय मानकांनुसार डेटा निर्यात पॅनेल' : 'Standards-Compliant Data Export & Reporting'}
        </h2>
        <p className="text-xs text-[#546E7A]">
          {lang === 'mr'
            ? 'NHM HMIS, MCTS/RCH, निक्षय (Nikshay TB) आणि ABDM FHIR R4 आवश्यकतेनुसार शासकीय अहवाल त्वरित तयार करा आणि डाउनलोड करा.'
            : 'Generate verified dataset packages formatted for NHM HMIS, MCTS/RCH, Nikshay TB, and ABDM interoperability pipelines.'}
        </p>
      </div>

      {/* Export Configurator Card */}
      <div className="bg-white rounded-3xl border border-[#CFD8DC] p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-sm text-[#1C2B3A] border-b pb-2">
          {lang === 'mr' ? 'नवीन अहवाल तयार करा' : 'Configure Export Parameters'}
        </h3>

        {/* Step 1: Select Export Pipeline */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            1. {lang === 'mr' ? 'शासकीय पोर्टल अहवाल निवडा:' : 'Select Target Government Program:'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'HMIS',
                title: 'NHM HMIS Report',
                descEn: 'Monthly facility health indicators (OPD, ANC, Deliveries)',
                descMr: 'मासिक रुग्णालय कामकाज निर्देशांक अहवाल',
                icon: FileSpreadsheet
              },
              {
                id: 'MCTS',
                title: 'MCTS / RCH Batch',
                descEn: 'Maternal & child tracking beneficiary registers',
                descMr: 'माता व बाल आरोग्य लाभार्थी ट्रॅकिंग यादी',
                icon: FileText
              },
              {
                id: 'NIKSHAY',
                title: 'Nikshay TB Portal',
                descEn: 'TB case notifications, treatment adherence & outcomes',
                descMr: 'क्षयरोग रुग्ण नोंदणी व औषधोपचार अहवाल',
                icon: FileCode
              },
              {
                id: 'FHIR',
                title: 'ABDM FHIR R4 Bundle',
                descEn: 'NRCES India clinical composition bundles',
                descMr: 'ABDM प्रमाणित FHIR R4 इलेक्ट्रॉनिक आरोग्य बंडल्स',
                icon: ShieldCheck
              }
            ].map(item => {
              const IconComp = item.icon;
              const isSelected = selectedFormat === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedFormat(item.id as any);
                    if (item.id === 'NIKSHAY') setFileType('XML');
                    else if (item.id === 'FHIR') setFileType('JSON');
                    else setFileType('CSV');
                  }}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'border-[#1A4B8C] bg-blue-50/40 ring-2 ring-blue-100'
                      : 'border-[#CFD8DC] bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1A4B8C] flex items-center justify-center border border-blue-100">
                      <IconComp className="w-4 h-4" />
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#1A4B8C]" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#1C2B3A]">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {lang === 'mr' ? item.descMr : item.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          {/* Facility Scope */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'mr' ? 'आरोग्य संस्था व्याप्ती' : 'Facility Scope'}</span>
            </label>
            <select
              value={selectedFacility}
              onChange={e => setSelectedFacility(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#CFD8DC] rounded-xl text-xs text-[#1C2B3A] focus:outline-hidden focus:border-[#1A4B8C]"
            >
              <option value="ALL">{lang === 'mr' ? 'सर्व पुणे जिल्हा संस्था (८४७)' : 'All Pune District Facilities (847)'}</option>
              <option value="PHC-WAGHOLI">PHC Wagholi (Haveli Block)</option>
              <option value="CHC-KHARADI">CHC Kharadi (Haveli Block)</option>
              <option value="SC-VADGAON">Sub-Centre Vadgaon</option>
              <option value="DH-PUNE">District Hospital Pune</option>
            </select>
          </div>

          {/* Reporting Period */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'mr' ? 'अहवाल कालावधी' : 'Reporting Period'}</span>
            </label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#CFD8DC] rounded-xl text-xs text-[#1C2B3A] focus:outline-hidden focus:border-[#1A4B8C]"
            >
              <option value="2024-11">{lang === 'mr' ? 'नोव्हेंबर २०२४ (चालू महिना)' : 'November 2024 (Current Month)'}</option>
              <option value="2024-10">{lang === 'mr' ? 'ऑक्टोबर २०२४' : 'October 2024'}</option>
              <option value="2024-Q2">{lang === 'mr' ? 'दुसरी तिमाही (Q2 FY 2024-25)' : 'Q2 FY 2024-25'}</option>
              <option value="2024-FY">{lang === 'mr' ? 'संपूर्ण वर्ष २०२४' : 'Full Year 2024'}</option>
            </select>
          </div>

          {/* File Format */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'mr' ? 'फाइल फॉरमॅट' : 'File Format'}</span>
            </label>
            <div className="flex items-center gap-2">
              {(['CSV', 'JSON', 'XML'] as const).map(fmt => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFileType(fmt)}
                  className={`flex-1 py-2 rounded-xl font-bold border transition text-xs ${
                    fileType === fmt
                      ? 'bg-[#1A4B8C] text-white border-[#1A4B8C]'
                      : 'bg-white border-[#CFD8DC] text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {lang === 'mr'
                ? `अहवाल यशस्वीरित्या तयार झाला आणि डाउनलोड झाला: ${downloadSuccess}`
                : `Export package generated and downloaded successfully: ${downloadSuccess}`}
            </span>
          </div>
        )}

        {/* Trigger Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-mono">
            Output: <span className="font-bold text-slate-800">{selectedFormat}_{selectedPeriod}.{fileType.toLowerCase()}</span>
          </span>

          <button
            onClick={handleTriggerExport}
            disabled={isExporting}
            className="px-6 py-2.5 rounded-full bg-[#1A4B8C] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{lang === 'mr' ? 'डेटा संकलित करत आहे...' : 'Compiling Dataset...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{lang === 'mr' ? 'अहवाल तयार करा व डाउनलोड करा' : 'Generate & Download Package'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export History Audit Table */}
      <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#CFD8DC] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#1C2B3A]">
              {lang === 'mr' ? 'मागील निर्यात अहवाल इतिहास (ऑडिट ट्रेल)' : 'Export Audit Trail & History'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'mr'
                ? 'माहिती अधिकृतता व ऑडिट नियमांचे पालन करणाऱ्या ऐतिहासिक निर्यातींचा नोंदवही.'
                : 'Cryptographically hashed history of generated government export packages.'}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {exportHistory.length} {lang === 'mr' ? 'नोंदी' : 'Entries'}
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {exportHistory.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-[#1A4B8C] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {item.id}
                  </span>
                  <span className="font-bold text-[#1C2B3A]">
                    {lang === 'mr' ? item.nameMr : item.nameEn}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                  <span>Scope: <strong className="text-slate-700">{item.facility}</strong></span>
                  <span>·</span>
                  <span>Period: <strong className="text-slate-700">{item.period}</strong></span>
                  <span>·</span>
                  <span>Count: <strong className="text-slate-700">{item.recordCount.toLocaleString()}</strong> records</span>
                  <span>·</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border">
                  {item.format}
                </span>

                <button
                  onClick={() => {
                    const dummyBlob = new Blob([`Export ID: ${item.id}\nFacility: ${item.facility}\nPeriod: ${item.period}`], { type: 'text/plain' });
                    const url = URL.createObjectURL(dummyBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${item.id}.${item.format.toLowerCase()}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="p-1.5 rounded-lg border border-[#CFD8DC] bg-white hover:bg-slate-50 text-slate-700 transition"
                  title="Re-download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
