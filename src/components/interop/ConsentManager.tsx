import React, { useState } from 'react';
import {
  Shield,
  Lock,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Eye,
  Plus,
  ArrowRight,
  Building2,
  Filter,
  Check,
  Ban,
  Key,
  FileText,
  AlertTriangle,
  RefreshCw,
  Hash
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { InteropService, AbdmConsentArtefact } from '../../services/interopService';

export default function ConsentManager() {
  const { lang } = useLanguage();
  const [consents, setConsents] = useState<AbdmConsentArtefact[]>(() => InteropService.getAbdmConsentArtefacts());
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'GRANTED' | 'REQUESTED' | 'REVOKED' | 'EXPIRED'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<AbdmConsentArtefact | null>(null);

  // New Consent Form State
  const [newAbhaId, setNewAbhaId] = useState('MH-PN-24-00000001');
  const [newPatientName, setNewPatientName] = useState('Sunita Ramchandra Jadhav');
  const [newPurpose, setNewPurpose] = useState<'Care Management / Treatment' | 'Emergency Medical Care' | 'Public Health Research' | 'Insurance / PMJAY Billing'>('Care Management / Treatment');
  const [newHip, setNewHip] = useState('PHC Wagholi (Govt of MH)');
  const [newHiu, setNewHiu] = useState('District Hospital Pune (Tertiary Referral)');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([
    'OPConsultation',
    'DiagnosticReport',
    'Prescription'
  ]);
  const [newExpiryMonths, setNewExpiryMonths] = useState(1);

  const dataTypesList = [
    { id: 'OPConsultation', label: 'OPD Consultation Note' },
    { id: 'DischargeSummary', label: 'Discharge Summary' },
    { id: 'DiagnosticReport', label: 'Diagnostic Lab Reports' },
    { id: 'Prescription', label: 'Electronic Prescription' },
    { id: 'ImmunizationRecord', label: 'Immunization Records' },
    { id: 'WellnessRecord', label: 'Wellness & Vital Signs' }
  ];

  const handleToggleDataType = (typeId: string) => {
    if (selectedDataTypes.includes(typeId)) {
      setSelectedDataTypes(selectedDataTypes.filter((t) => t !== typeId));
    } else {
      setSelectedDataTypes([...selectedDataTypes, typeId]);
    }
  };

  const handleCreateConsent = (e: React.FormEvent) => {
    e.preventDefault();
    const consentId = `CONSENT-MH-${Date.now()}`;
    const now = new Date();
    const expiry = new Date(now.getTime() + newExpiryMonths * 30 * 86400000);

    const hashSample = Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);

    const newArtifact: AbdmConsentArtefact = {
      consentId,
      patientAbhaId: newAbhaId,
      patientName: newPatientName,
      purpose: newPurpose,
      hipName: newHip,
      hiuName: newHiu,
      dataTypes: selectedDataTypes.length > 0 ? selectedDataTypes : ['OPConsultation'],
      status: 'GRANTED',
      grantedAt: `${now.getDate()} ${now.toLocaleString('en', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      expiresAt: `${expiry.getDate()} ${expiry.toLocaleString('en', { month: 'short' })} ${expiry.getFullYear()}, ${expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      digitalSignature: `SHA256:${hashSample}`,
    };

    setConsents([newArtifact, ...consents]);
    setShowCreateModal(false);
  };

  const handleRevokeConsent = (consentId: string) => {
    setConsents(
      consents.map((c) => {
        if (c.consentId === consentId) {
          return { ...c, status: 'REVOKED' };
        }
        return c;
      })
    );
    if (selectedConsent && selectedConsent.consentId === consentId) {
      setSelectedConsent({ ...selectedConsent, status: 'REVOKED' });
    }
  };

  const filteredConsents = consents.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#CFD8DC] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  ABDM Electronic Consent Framework
                </span>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Digital Consent Manager v1.0
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#1C2B3A] mt-1">
                {lang === 'mr' ? 'रुग्ण डिजिटल संमती व्यवस्थापक (Patient Consent Manager)' : 'Patient Digital Consent & Privacy Framework'}
              </h2>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr'
                  ? 'रुग्णाच्या स्पष्ट डिजिटल संमतीवर आधारित आरोग्य माहितीची देवाणघेवाण, क्रिप्टोग्राफिक इलेक्ट्रॉनिक स्वाक्षरी आणि मुदत ट्रॅकिंग'
                  : 'Granular, patient-directed electronic consent artifacts with cryptographic verification and instant revocation rights'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-[#1A4B8C] text-white rounded-xl text-xs font-bold hover:bg-[#153e75] transition shadow-xs flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'mr' ? 'नवीन संमती विनंती' : 'New Consent Request'}</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-[#546E7A]">Total Artefacts</p>
            <p className="text-lg font-black text-[#1C2B3A] mt-0.5">{consents.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-[10px] uppercase font-bold text-emerald-800">Active / Granted</p>
            <p className="text-lg font-black text-emerald-700 mt-0.5">
              {consents.filter((c) => c.status === 'GRANTED').length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-[10px] uppercase font-bold text-amber-800">Pending Review</p>
            <p className="text-lg font-black text-amber-700 mt-0.5">
              {consents.filter((c) => c.status === 'REQUESTED').length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <p className="text-[10px] uppercase font-bold text-rose-800">Revoked / Expired</p>
            <p className="text-lg font-black text-rose-700 mt-0.5">
              {consents.filter((c) => c.status === 'REVOKED' || c.status === 'EXPIRED').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['ALL', 'GRANTED', 'REQUESTED', 'REVOKED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-[#1A4B8C] text-white shadow-xs'
                  : 'bg-white text-[#546E7A] border border-[#CFD8DC] hover:bg-slate-50'
              }`}
            >
              {status === 'ALL'
                ? (lang === 'mr' ? 'सर्व संमती' : 'All Consents')
                : status}
            </button>
          ))}
        </div>
      </div>

      {/* Consents Grid / List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredConsents.map((artefact) => (
          <div
            key={artefact.consentId}
            className="bg-white rounded-2xl p-5 border border-[#CFD8DC] shadow-xs hover:border-blue-300 transition space-y-4"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#1C2B3A]">{artefact.consentId}</span>
                  {artefact.status === 'GRANTED' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      GRANTED
                    </span>
                  ) : artefact.status === 'REVOKED' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                      <Ban className="w-3 h-3" />
                      REVOKED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {artefact.status}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-[#1C2B3A] mt-1">{artefact.patientName}</p>
                <p className="text-[11px] font-mono text-[#546E7A]">ABHA: {artefact.patientAbhaId}</p>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                  {artefact.purpose}
                </span>
              </div>
            </div>

            {/* HIP -> HIU Transfer route */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#546E7A] font-medium">{lang === 'mr' ? 'माहिती प्रदाता (HIP)' : 'Provider (HIP)'}:</span>
                <span className="font-bold text-[#1C2B3A] text-right">{artefact.hipName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#546E7A] font-medium">{lang === 'mr' ? 'माहिती वापरकर्ता (HIU)' : 'Requester (HIU)'}:</span>
                <span className="font-bold text-[#1C2B3A] text-right">{artefact.hiuName}</span>
              </div>
            </div>

            {/* Allowed Data Types */}
            <div>
              <p className="text-[11px] uppercase font-bold text-[#546E7A] mb-1.5">Permitted Health Records</p>
              <div className="flex flex-wrap gap-1.5">
                {artefact.dataTypes.map((dt) => (
                  <span
                    key={dt}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-[#1C2B3A] border border-slate-200"
                  >
                    {dt}
                  </span>
                ))}
              </div>
            </div>

            {/* Cryptographic Signature & Validity */}
            <div className="pt-3 border-t border-slate-100 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-mono text-[#546E7A] truncate max-w-xs" title={artefact.digitalSignature}>
                Sig: {artefact.digitalSignature}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[#546E7A]">Exp: {artefact.expiresAt}</span>
                {artefact.status === 'GRANTED' && (
                  <button
                    onClick={() => handleRevokeConsent(artefact.consentId)}
                    className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                  >
                    {lang === 'mr' ? 'रद्द करा' : 'Revoke'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Consent Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2B3A]">
                    {lang === 'mr' ? 'नवीन ABDM संमती विनंती तयार करा' : 'Initiate ABDM Consent Request'}
                  </h3>
                  <p className="text-[11px] text-[#546E7A]">Electronic Patient Consent Initiation Protocol</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#546E7A]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConsent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#546E7A] uppercase mb-1">Patient ABHA ID</label>
                  <input
                    type="text"
                    value={newAbhaId}
                    onChange={(e) => setNewAbhaId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#546E7A] uppercase mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#546E7A] uppercase mb-1">Purpose of Consent</label>
                <select
                  value={newPurpose}
                  onChange={(e: any) => setNewPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Care Management / Treatment">Care Management / Treatment (OPD/IPD)</option>
                  <option value="Emergency Medical Care">Emergency Medical Care (Trauma / SOS)</option>
                  <option value="Public Health Research">Public Health Research (De-identified)</option>
                  <option value="Insurance / PMJAY Billing">Insurance / PMJAY Billing & Claims</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#546E7A] uppercase mb-1">Health Info Provider (HIP)</label>
                  <input
                    type="text"
                    value={newHip}
                    onChange={(e) => setNewHip(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#546E7A] uppercase mb-1">Health Info User (HIU)</label>
                  <input
                    type="text"
                    value={newHiu}
                    onChange={(e) => setNewHiu(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#546E7A] uppercase mb-1.5">Permitted Health Records Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {dataTypesList.map((dt) => {
                    const isChecked = selectedDataTypes.includes(dt.id);
                    return (
                      <button
                        type="button"
                        key={dt.id}
                        onClick={() => handleToggleDataType(dt.id)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                          isChecked
                            ? 'border-[#1A4B8C] bg-blue-50 text-[#1A4B8C] font-bold'
                            : 'border-slate-200 text-[#546E7A] hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked ? 'bg-[#1A4B8C] border-[#1A4B8C] text-white' : 'border-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{dt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#546E7A] uppercase mb-1">Validity Duration</label>
                <select
                  value={newExpiryMonths}
                  onChange={(e) => setNewExpiryMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value={1}>1 Month (Standard Consult Review)</option>
                  <option value={3}>3 Months (Antenatal Care Cycle)</option>
                  <option value={6}>6 Months (Chronic Disease Monitoring)</option>
                  <option value={12}>1 Year (Long-term Health History)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl font-bold text-[#546E7A] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#1A4B8C] text-white rounded-xl font-bold hover:bg-[#153e75] shadow-xs flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Issue & Sign Consent</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
