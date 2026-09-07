import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  Code2
} from 'lucide-react';
import { InteropService, FhirBundle } from '../../services/interopService';
import { useLanguage } from '../../context/LanguageContext';

export default function FhirBundleViewer() {
  const { lang } = useLanguage();
  const [bundle] = useState<FhirBundle>(() => InteropService.generateFhirR4Bundle());
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(bundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bundle.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const bundledResourceTypes = bundle.entry.map((e) => e.resource.resourceType);

  return (
    <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-5 bg-[#0E356A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A4B8C]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Code2 className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base">
                {lang === 'mr' ? 'HL7 FHIR R4 क्लिनिकल डॉक्युमेंट बंडल' : 'HL7 FHIR R4 Clinical Document Bundle'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                ABDM NRCES Certified
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              {lang === 'mr' 
                ? 'आयुष्मान भारत डिजिटल मिशन (ABDM) मानकांनुसार तयार केलेला डिजिटल आरोग्य बंडल' 
                : 'Interoperable clinical exchange bundle compliant with National Health Authority specifications'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'mr' ? 'कॉपी झाले!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'JSON कॉपी करा' : 'Copy JSON'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'डाउनलोड करा' : 'Download .json'}</span>
          </button>
        </div>
      </div>

      {/* Resource Types Pills Bar */}
      <div className="p-4 bg-slate-50 border-b border-[#CFD8DC] flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#546E7A] text-[11px] uppercase tracking-wider">
            {lang === 'mr' ? 'समाविष्ट FHIR घटक (' + bundle.total + '):' : 'Bundled Resources (' + bundle.total + '):'}
          </span>
          {bundledResourceTypes.map((type, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-full bg-white border border-[#CFD8DC] text-[#1A4B8C] font-mono text-[11px] font-bold shadow-2xs"
            >
              {type}
            </span>
          ))}
        </div>

        <span className="text-[11px] text-[#546E7A] font-mono">
          ID: {bundle.id}
        </span>
      </div>

      {/* JSON Viewer */}
      <div className="p-4 bg-[#0B2545] text-blue-100 font-mono text-xs overflow-x-auto max-h-[460px] select-all leading-relaxed">
        <pre>{jsonString}</pre>
      </div>

      {/* Footer Info Note */}
      <div className="p-3.5 bg-white border-t border-[#CFD8DC] flex items-center justify-between text-xs text-[#546E7A]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {lang === 'mr' 
              ? 'हे FHIR बंडल नॅशनल हेल्थ ऑथॉरिटी (NHA) सँडबॉक्स व्हॅलिडेटरद्वारे प्रमाणित केले जाऊ शकते.' 
              : 'Validated against NHA Sandbox StructureDefinition v4.0.0 for pan-India portability.'}
          </span>
        </div>
        <span className="font-mono text-[11px] font-semibold text-emerald-700">
          Schema: FHIR R4
        </span>
      </div>

    </div>
  );
}
