import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Building2, 
  Search, 
  Filter, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_DISTRICT_DATA } from '../../services/dashboardService';

export interface StaffCadreRecord {
  cadre: string;
  cadreMr: string;
  total: number;
  present: number;
  onLeave: number;
  attendancePct: number;
}

export interface FacilityStaffDetail {
  facilityId: string;
  facilityName: string;
  type: string;
  block: string;
  inCharge: string;
  phone: string;
  staffTotal: number;
  staffPresent: number;
  cadres: {
    medicalOfficers: { present: number; total: number };
    staffNurses: { present: number; total: number };
    anmWorkers: { present: number; total: number };
    pharmacists: { present: number; total: number };
    labTechs: { present: number; total: number };
  };
}

export default function StaffAttendance() {
  const { lang } = useLanguage();
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [noticeSentId, setNoticeSentId] = useState<string | null>(null);

  // Cadre-level aggregated summary
  const cadreSummary: StaffCadreRecord[] = [
    { cadre: 'Medical Officers (MBBS/MD)', cadreMr: 'वैद्यकीय अधिकारी (MBBS/MD)', total: 420, present: 392, onLeave: 28, attendancePct: 93.3 },
    { cadre: 'Staff Nurses (GNM/B.Sc)', cadreMr: 'परिचारिका (स्टाफ नर्स)', total: 890, present: 828, onLeave: 62, attendancePct: 93.0 },
    { cadre: 'ANM Health Assistants', cadreMr: 'ए.एन.एम. आरोग्य सहायिका', total: 1150, present: 1048, onLeave: 102, attendancePct: 91.1 },
    { cadre: 'Pharmacists', cadreMr: 'औषध निर्माण अधिकारी', total: 340, present: 312, onLeave: 28, attendancePct: 91.8 },
    { cadre: 'Laboratory Technicians', cadreMr: 'प्रयोगशाळा तंत्रज्ञ', total: 320, present: 267, onLeave: 53, attendancePct: 83.4 },
  ];

  // Facility-level details
  const facilityStaffList: FacilityStaffDetail[] = [
    {
      facilityId: 'FAC001',
      facilityName: 'PHC Wagholi',
      type: 'PHC',
      block: 'Haveli',
      inCharge: 'Dr. Priya Sharma',
      phone: '020-27051234',
      staffTotal: 12,
      staffPresent: 11,
      cadres: {
        medicalOfficers: { present: 2, total: 2 },
        staffNurses: { present: 4, total: 4 },
        anmWorkers: { present: 3, total: 4 },
        pharmacists: { present: 1, total: 1 },
        labTechs: { present: 1, total: 1 },
      },
    },
    {
      facilityId: 'FAC002',
      facilityName: 'CHC Kharadi',
      type: 'CHC',
      block: 'Haveli',
      inCharge: 'Dr. Rahul Desai',
      phone: '020-27051111',
      staffTotal: 28,
      staffPresent: 19,
      cadres: {
        medicalOfficers: { present: 3, total: 5 },
        staffNurses: { present: 8, total: 12 },
        anmWorkers: { present: 5, total: 6 },
        pharmacists: { present: 2, total: 3 },
        labTechs: { present: 1, total: 2 },
      },
    },
    {
      facilityId: 'FAC003',
      facilityName: 'PHC Lohegaon',
      type: 'PHC',
      block: 'Haveli',
      inCharge: 'Dr. Amit Kulkarni',
      phone: '020-27051456',
      staffTotal: 10,
      staffPresent: 10,
      cadres: {
        medicalOfficers: { present: 2, total: 2 },
        staffNurses: { present: 3, total: 3 },
        anmWorkers: { present: 3, total: 3 },
        pharmacists: { present: 1, total: 1 },
        labTechs: { present: 1, total: 1 },
      },
    },
    {
      facilityId: 'FAC004',
      facilityName: 'SC Bhosari',
      type: 'SC',
      block: 'Pimpri-Chinchwad',
      inCharge: 'ANM Sunita Borde',
      phone: '020-27051789',
      staffTotal: 3,
      staffPresent: 1,
      cadres: {
        medicalOfficers: { present: 0, total: 0 },
        staffNurses: { present: 0, total: 1 },
        anmWorkers: { present: 1, total: 2 },
        pharmacists: { present: 0, total: 0 },
        labTechs: { present: 0, total: 0 },
      },
    },
    {
      facilityId: 'FAC005',
      facilityName: 'District Hospital Pune',
      type: 'DH',
      block: 'Pune City',
      inCharge: 'Dr. Sunita Patel',
      phone: '020-26059999',
      staffTotal: 312,
      staffPresent: 287,
      cadres: {
        medicalOfficers: { present: 48, total: 52 },
        staffNurses: { present: 142, total: 154 },
        anmWorkers: { present: 42, total: 46 },
        pharmacists: { present: 28, total: 30 },
        labTechs: { present: 27, total: 30 },
      },
    },
  ];

  const blocks = ['ALL', 'Haveli', 'Pimpri-Chinchwad', 'Pune City', 'Shirur', 'Khed'];

  const filteredFacilities = facilityStaffList.filter((f) => {
    if (selectedBlock !== 'ALL' && f.block !== selectedBlock) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.facilityName.toLowerCase().includes(q) || f.inCharge.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSendNotice = (id: string) => {
    setNoticeSentId(id);
    setTimeout(() => setNoticeSentId(null), 3000);
  };

  const totalPresent = MOCK_DISTRICT_DATA.summary.staffPresent;
  const totalStaff = MOCK_DISTRICT_DATA.summary.staffTotal;
  const overallRate = MOCK_DISTRICT_DATA.summary.attendanceRate;

  return (
    <div className="space-y-6">
      
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#546E7A] text-xs font-semibold">
            <span>{lang === 'mr' ? 'एकूण उपस्थित कर्मचारी' : 'Total Staff Present Today'}</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black font-mono text-[#1C2B3A]">
            {totalPresent.toLocaleString('en-IN')} <span className="text-sm font-bold text-[#546E7A]">/ {totalStaff.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">{lang === 'mr' ? 'उपस्थिती दर:' : 'Attendance Rate:'}</span>
            <span className="font-mono font-bold text-emerald-700">{overallRate}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${overallRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#546E7A] text-xs font-semibold">
            <span>{lang === 'mr' ? 'रजेवर असलेले कर्मचारी' : 'Approved Leave / Deputation'}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-700">
            {totalStaff - totalPresent}
          </div>
          <p className="text-[11px] text-[#546E7A]">
            {lang === 'mr' ? 'पूर्वपरवानगीने रजा किंवा शासकीय प्रशिक्षणावर' : 'Authorized medical, maternity or training leave'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#546E7A] text-xs font-semibold">
            <span>{lang === 'mr' ? 'अल्प उपस्थिती केंद्रे' : 'Critically Low Staffing (<70%)'}</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-black font-mono text-red-600">
            2 <span className="text-xs font-bold text-slate-500">facilities</span>
          </div>
          <p className="text-[11px] text-red-700 font-semibold">
            {lang === 'mr' ? 'SC भोसरी (३३%) व CHC खराडी (६८%)' : 'SC Bhosari (33%) & CHC Kharadi (68%)'}
          </p>
        </div>
      </div>

      {/* Cadre-Based Attendance Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-[#CFD8DC] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#1C2B3A] uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-[#1A4B8C]" />
          <span>{lang === 'mr' ? 'संवर्गनिहाय उपस्थिती अहवाल (Cadre Breakdown)' : 'Staff Attendance by Professional Cadre'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {cadreSummary.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-[#1C2B3A] leading-tight line-clamp-2 h-8">
                {lang === 'mr' ? item.cadreMr : item.cadre}
              </div>
              <div className="text-xl font-black font-mono text-[#1A4B8C]">
                {item.present} <span className="text-xs font-bold text-slate-500">/ {item.total}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-500">Rate:</span>
                <span className={`font-mono ${item.attendancePct >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {item.attendancePct}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.attendancePct >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                  style={{ width: `${item.attendancePct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facility List Filter & Table */}
      <div className="bg-white rounded-3xl border border-[#CFD8DC] shadow-xs overflow-hidden space-y-4">
        <div className="p-5 border-b border-[#CFD8DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-[#1C2B3A]">
              {lang === 'mr' ? 'आरोग्य केंद्रनिहाय प्रत्यक्ष उपस्थिती' : 'Facility-Level Staff Attendance Records'}
            </h3>
            <p className="text-xs text-[#546E7A]">
              {lang === 'mr' ? 'वैद्यकीय अधिकारी, परिचारिका व प्रयोगशाळा तंत्रज्ञांची थेट बायोमेट्रिक हजेरी' : 'Live biometric and duty roster status'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'mr' ? 'केंद्र किंवा डॉक्टर शोधा...' : 'Search facility or MO...'}
                className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-[#CFD8DC] focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>

            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-full border border-[#CFD8DC] bg-white font-medium text-[#1C2B3A]"
            >
              {blocks.map((b) => (
                <option key={b} value={b}>Block: {b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Facilities Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-[#CFD8DC] text-[#546E7A] font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Block</th>
                <th className="py-3 px-4">Medical Officer</th>
                <th className="py-3 px-4 text-center">Nurses</th>
                <th className="py-3 px-4 text-center">ANM</th>
                <th className="py-3 px-4 text-center">Pharm / Lab</th>
                <th className="py-3 px-4 text-right">Attendance</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-[#1C2B3A]">
              {filteredFacilities.map((f) => {
                const pct = Math.round((f.staffPresent / f.staffTotal) * 100);
                const isCritical = pct < 70;
                return (
                  <tr key={f.facilityId} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-[#1C2B3A]">
                      <div>{f.facilityName}</div>
                      <span className="text-[10px] font-bold uppercase text-[#1A4B8C] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {f.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{f.block}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{f.inCharge}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{f.phone}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      {f.cadres.staffNurses.present}/{f.cadres.staffNurses.total}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      {f.cadres.anmWorkers.present}/{f.cadres.anmWorkers.total}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      {f.cadres.pharmacists.present + f.cadres.labTechs.present}/{f.cadres.pharmacists.total + f.cadres.labTechs.total}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`font-mono font-bold ${isCritical ? 'text-red-700' : 'text-emerald-700'}`}>
                          {f.staffPresent}/{f.staffTotal} ({pct}%)
                        </span>
                        <div className="w-12 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isCritical ? 'bg-red-600' : 'bg-emerald-600'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={`tel:${f.phone}`}
                          className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-[#546E7A] hover:text-[#1A4B8C] transition"
                          title="Call In-Charge"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleSendNotice(f.facilityId)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1A4B8C] font-semibold text-[11px] transition flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>{noticeSentId === f.facilityId ? 'Sent!' : 'Notice'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
