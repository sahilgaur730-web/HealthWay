import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  ArrowUpRight, 
  Activity, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { TrendItem } from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext';

interface MetricChartProps {
  consultationTrends: TrendItem[];
  referralTrends?: number[];
  stockAlertTrends?: number[];
}

export default function MetricChart({
  consultationTrends,
  referralTrends = [65, 78, 56, 89, 72, 67],
  stockAlertTrends = [12, 18, 15, 22, 19, 23]
}: MetricChartProps) {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'consultations' | 'referrals' | 'stock'>('consultations');

  // Stats calculation
  const totalConsultations = consultationTrends.reduce((sum, item) => sum + item.value, 0);
  const avgDaily = Math.round(totalConsultations / (consultationTrends.length || 1));
  const maxConsultation = Math.max(...consultationTrends.map(t => t.value));
  const peakDay = consultationTrends.find(t => t.value === maxConsultation);

  // Combine trends for Recharts
  const chartData = consultationTrends.map((item, index) => ({
    date: item.date,
    consultations: item.value,
    target: item.target || 3000,
    referrals: referralTrends[index] || 0,
    stockAlerts: stockAlertTrends[index] || 0
  }));

  return (
    <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header and Toggle Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#1C2B3A]">
              {lang === 'mr' ? '६-दिवसीय दैनंदिन कार्यक्षमता कल' : '6-Day District Operational Trends'}
            </h3>
          </div>
          <p className="text-xs text-[#546E7A] mt-1">
            {lang === 'mr' 
              ? 'पुणे जिल्ह्यातील प्राथमिक केंद्रे व रुग्णालयांमधील प्रत्यक्ष नोंदणी विश्लेषण' 
              : 'Daily OPD consultations, emergency referrals, and warehouse stock alerts'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'consultations'
                ? 'bg-white text-[#1A4B8C] shadow-xs'
                : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'तपासण्या' : 'Consultations'}</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'referrals'
                ? 'bg-white text-[#1A4B8C] shadow-xs'
                : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'रेफरल्स' : 'Referrals'}</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'stock'
                ? 'bg-white text-[#1A4B8C] shadow-xs'
                : 'text-[#546E7A] hover:text-[#1C2B3A]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'साठा इशारे' : 'Stock Alerts'}</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Highlights */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-[#546E7A] block">
            {lang === 'mr' ? '६ दिवसांतील एकूण' : '6-Day Total'}
          </span>
          <div className="text-lg font-black font-mono text-[#1C2B3A] mt-0.5">
            {activeTab === 'consultations'
              ? totalConsultations.toLocaleString()
              : activeTab === 'referrals'
                ? referralTrends.reduce((a, b) => a + b, 0)
                : stockAlertTrends.reduce((a, b) => a + b, 0)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {lang === 'mr' ? 'सर्व ८४७ केंद्रांमधून' : 'Across 847 facilities'}
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-[#546E7A] block">
            {lang === 'mr' ? 'दैनिक सरासरी' : 'Daily Average'}
          </span>
          <div className="text-lg font-black font-mono text-[#1A4B8C] mt-0.5">
            {activeTab === 'consultations'
              ? avgDaily.toLocaleString()
              : activeTab === 'referrals'
                ? Math.round(referralTrends.reduce((a, b) => a + b, 0) / referralTrends.length)
                : Math.round(stockAlertTrends.reduce((a, b) => a + b, 0) / stockAlertTrends.length)}
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{lang === 'mr' ? '+८.४% वाढ' : '+8.4% vs last week'}</span>
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-[#546E7A] block">
            {lang === 'mr' ? 'कमाल दिवस (Peak Day)' : 'Peak Day'}
          </span>
          <div className="text-lg font-black font-mono text-emerald-700 mt-0.5">
            {peakDay ? peakDay.date : '29 Nov'}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {peakDay ? `${peakDay.value.toLocaleString()} ${lang === 'mr' ? 'रुग्ण' : 'patients'}` : ''}
          </p>
        </div>
      </div>

      {/* Chart Visual Container */}
      <div className="h-64 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#546E7A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#546E7A' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: '12px', 
                border: '1px solid #CFD8DC', 
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }} 
            />
            {activeTab === 'consultations' && (
              <>
                <ReferenceLine y={3000} stroke="#F57C00" strokeDasharray="3 3" label={{ value: 'Target 3000', position: 'top', fill: '#F57C00', fontSize: 10 }} />
                <Bar dataKey="consultations" name={lang === 'mr' ? 'तपासण्या' : 'Consultations'} fill="#1A4B8C" radius={[6, 6, 0, 0]} barSize={34} />
              </>
            )}
            {activeTab === 'referrals' && (
              <Bar dataKey="referrals" name={lang === 'mr' ? 'रेफरल्स' : 'Referrals'} fill="#F57C00" radius={[6, 6, 0, 0]} barSize={34} />
            )}
            {activeTab === 'stock' && (
              <Bar dataKey="stockAlerts" name={lang === 'mr' ? 'साठा इशारे' : 'Stock Alerts'} fill="#DC2626" radius={[6, 6, 0, 0]} barSize={34} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend / Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#546E7A] pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A4B8C]" />
            <span>{lang === 'mr' ? 'प्रत्यक्ष साध्य' : 'Achieved Volume'}</span>
          </div>
          {activeTab === 'consultations' && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#F57C00]" />
              <span>{lang === 'mr' ? 'दैनिक लक्ष्य (३,०००)' : 'Daily Target (3,000)'}</span>
            </div>
          )}
        </div>

        <span className="text-[11px] text-slate-400">
          {lang === 'mr' ? 'स्त्रोत: HMIS महाराष्ट्र व आभा पोर्टल' : 'Source: HMIS Maharashtra & ABDM'}
        </span>
      </div>
    </div>
  );
}
