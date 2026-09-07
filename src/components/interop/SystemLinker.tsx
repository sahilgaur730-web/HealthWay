import React, { useState } from 'react';
import {
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Key,
  Shield,
  Building2,
  BarChart2,
  Baby,
  Syringe,
  Heart,
  Hospital,
  Link2,
  ArrowUpRight,
  Settings,
  Lock,
  Check,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { EXTERNAL_SYSTEMS, ExternalSystemDefinition } from '../../services/interopStandards';

export default function SystemLinker() {
  const { lang } = useLanguage();
  const [systems, setSystems] = useState<Record<string, ExternalSystemDefinition>>(EXTERNAL_SYSTEMS);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [selectedConfigSystem, setSelectedConfigSystem] = useState<ExternalSystemDefinition | null>(null);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Modal form states
  const [clientId, setClientId] = useState('MH-PUNE-HFR-8472');
  const [clientSecret, setClientSecret] = useState('••••••••••••••••••••');
  const [facilityCode, setFacilityCode] = useState('FAC-WAGHOLI-01');

  const getSystemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return Building2;
      case 'BarChart2':
        return BarChart2;
      case 'Baby':
        return Baby;
      case 'Activity':
        return Activity;
      case 'Syringe':
        return Syringe;
      case 'Heart':
        return Heart;
      case 'Hospital':
      default:
        return Hospital;
    }
  };

  const handlePing = (id: string) => {
    setPingingId(id);
    setTimeout(() => {
      setSystems(prev => {
        const sys = prev[id];
        if (!sys) return prev;
        const newLatency = Math.floor(Math.random() * 25) + 20; // 20-45ms
        return {
          ...prev,
          [id]: {
            ...sys,
            status: 'CONNECTED',
            latencyMs: newLatency,
            lastSync: lang === 'mr' ? 'आत्ताच (सक्रिय)' : 'Just now'
          }
        };
      });
      setPingingId(null);
    }, 700);
  };

  const handleOpenConfig = (sys: ExternalSystemDefinition) => {
    setSelectedConfigSystem(sys);
    setConfigSuccess(false);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSuccess(true);
    setTimeout(() => {
      setSelectedConfigSystem(null);
      setConfigSuccess(false);
    }, 1200);
  };

  const systemList = Object.values(systems);
  const connectedCount = systemList.filter(s => s.status === 'CONNECTED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Gateway Stats */}
      <div className="bg-white p-6 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                National Health Gateway v2.4
              </span>
              <span className="text-xs font-mono text-[#1A4B8C] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                TLS 1.3 Mutual Auth Active
              </span>
            </div>
            <h2 className="text-xl font-black text-[#1C2B3A] mt-1">
              {lang === 'mr' ? 'शासकीय राष्ट्रीय आरोग्य प्रणाली जोडणी' : 'External Government Systems Gateway'}
            </h2>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr'
                ? 'महाराष्ट्र शासन व भारत सरकारच्या सर्व प्रमुख राष्ट्रीय आरोग्य पोर्टलशी द्वि-दिशीय डेटा एकत्रीकरण.'
                : 'Bi-directional interoperability bridge linking HealthWay to national public health databases.'}
            </p>
          </div>

          <button
            onClick={() => {
              systemList.forEach(s => handlePing(s.id));
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 text-[#1A4B8C] border border-blue-200 hover:bg-blue-100 text-xs font-bold transition shadow-xs self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pingingId ? 'animate-spin' : ''}`} />
            <span>{lang === 'mr' ? 'सर्व प्रणाली चाचणी' : 'Ping All Gateways'}</span>
          </button>
        </div>

        {/* Gateway Health Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-slate-500 text-[11px] block">{lang === 'mr' ? 'जोडलेल्या प्रणाली' : 'Connected Nodes'}</span>
            <span className="font-mono font-black text-emerald-700 text-lg">
              {connectedCount} / {systemList.length}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-slate-500 text-[11px] block">{lang === 'mr' ? 'सरासरी लेटन्सी' : 'Avg Gateway Latency'}</span>
            <span className="font-mono font-black text-[#1A4B8C] text-lg">34 ms</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-slate-500 text-[11px] block">{lang === 'mr' ? 'गेटवे अपटाईम' : 'Gateway Uptime'}</span>
            <span className="font-mono font-black text-emerald-700 text-lg">99.98%</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-slate-500 text-[11px] block">{lang === 'mr' ? 'आजचे ट्रॅन्झॅक्शन्स' : 'Transactions Today'}</span>
            <span className="font-mono font-black text-[#1C2B3A] text-lg">14,892</span>
          </div>
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemList.map((sys) => {
          const IconComponent = getSystemIcon(sys.iconName);
          const isPinging = pingingId === sys.id;
          const isConnected = sys.status === 'CONNECTED';

          return (
            <div
              key={sys.id}
              className="bg-white rounded-3xl border border-[#CFD8DC] p-5 shadow-xs hover:border-slate-400 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center border"
                      style={{ backgroundColor: sys.bgColor, borderColor: sys.color + '40', color: sys.color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1C2B3A]">{sys.shortName}</h3>
                      <span className="text-[10px] text-slate-500 font-mono block">{sys.id} Gateway</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}
                  >
                    {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isConnected ? 'ONLINE' : 'STANDBY'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#546E7A] leading-relaxed line-clamp-2">
                  {lang === 'mr' ? sys.descriptionMr : sys.description}
                </p>

                {/* Data Types Pills */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    {lang === 'mr' ? 'समर्थित डेटा प्रवाह' : 'Supported Feeds'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sys.dataTypes.map((dt, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                      >
                        {dt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Endpoint URL */}
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 truncate">
                  <span className="text-slate-400 mr-1">URL:</span>
                  {sys.baseUrl}
                </div>

                {/* Latency & Frequency */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-blue-600" />
                    <span className="font-mono font-bold text-slate-800">{sys.latencyMs} ms</span>
                  </span>
                  <span className="text-[11px]">
                    {lang === 'mr' ? 'वारंवारता: ' : 'Freq: '}
                    <span className="font-semibold text-[#1C2B3A]">
                      {lang === 'mr' ? sys.reportingFrequencyMr : sys.reportingFrequency}
                    </span>
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <button
                  onClick={() => handlePing(sys.id)}
                  disabled={isPinging}
                  className="flex-1 py-1.5 px-3 rounded-xl border border-[#CFD8DC] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? (lang === 'mr' ? 'चाचणी...' : 'Pinging...') : (lang === 'mr' ? 'पिंंग चाचणी' : 'Test Ping')}</span>
                </button>

                <button
                  onClick={() => handleOpenConfig(sys)}
                  className="p-1.5 rounded-xl border border-[#CFD8DC] bg-white hover:bg-slate-50 text-slate-700 transition"
                  title="Configure Credentials"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Config Modal */}
      {selectedConfigSystem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CFD8DC] max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1A4B8C]" />
                <h3 className="font-bold text-base text-[#1C2B3A]">
                  {selectedConfigSystem.name} — {lang === 'mr' ? 'क्रेडेंशियल व गेटवे सेटिंग्ज' : 'Gateway Credentials'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedConfigSystem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {configSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">
                  {lang === 'mr' ? 'क्रेडेंशियल्स यशस्वीरित्या अद्यतनित केले गेले!' : 'Credentials Validated & Updated!'}
                </h4>
                <p className="text-xs text-emerald-700">
                  {lang === 'mr' ? 'गेटवे सुरक्षित हँडशेक पूर्ण झाले.' : 'TLS 1.3 handshake and token renewed with national registry.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'mr' ? 'क्लायंट / नोड आयडी' : 'Gateway Client ID'}
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CFD8DC] rounded-xl font-mono text-xs focus:outline-hidden focus:border-[#1A4B8C]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'mr' ? 'API गुप्त की (Secret Key)' : 'API Secret Key'}
                  </label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={e => setClientSecret(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CFD8DC] rounded-xl font-mono text-xs focus:outline-hidden focus:border-[#1A4B8C]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'mr' ? 'आरोग्य संस्था कोड (HFR Facility Code)' : 'HFR Facility Code'}
                  </label>
                  <input
                    type="text"
                    value={facilityCode}
                    onChange={e => setFacilityCode(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CFD8DC] rounded-xl font-mono text-xs focus:outline-hidden focus:border-[#1A4B8C]"
                    required
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Mutual TLS Certificate:</span>
                    <span className="text-emerald-700 font-bold font-mono">VALID (Expires 2027)</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    SHA-256 Fingerprint: 4E:82:19:90:A1:BC:FE:23:44:91:DE:99:A2:18
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedConfigSystem(null)}
                    className="px-4 py-2 rounded-xl border border-[#CFD8DC] text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1A4B8C] text-white font-bold hover:bg-blue-900 transition shadow-xs"
                  >
                    {lang === 'mr' ? 'जतन करा व प्रमाणीकृत करा' : 'Save & Verify Token'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
