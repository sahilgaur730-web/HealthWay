import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Building2, 
  Hospital, 
  Users, 
  Stethoscope, 
  Activity, 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronRight, 
  AlertOctagon, 
  ShieldCheck, 
  BarChart3, 
  Download, 
  Printer, 
  Layers,
  Award
} from 'lucide-react';
import { 
  fetchDistrictData, 
  calculateFacilityScore, 
  getPerformanceGrade, 
  DistrictData, 
  Facility, 
  FACILITY_TYPES, 
  PERFORMANCE_GRADES, 
  GradeKey, 
  FacilityTypeKey,
  MOCK_DISTRICT_DATA,
  AlertItem
} from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext';
import FacilityCard from './FacilityCard';
import MetricChart from './MetricChart';
import AlertsPanel from './AlertsPanel';
import LeaderBoard from './LeaderBoard';
import FacilityDetailModal from './FacilityDetailModal';
import StaffAttendance from './StaffAttendance';

interface DistrictDashboardProps {
  onExportReport?: () => void;
}

export default function DistrictDashboard({ onExportReport }: DistrictDashboardProps) {
  const { lang } = useLanguage();
  const [data, setData] = useState<DistrictData>(() => MOCK_DISTRICT_DATA);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'facilities' | 'attendance' | 'alerts' | 'trends'>('overview');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlock, setFilterBlock] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score_asc' | 'score_desc' | 'name' | 'alerts'>('score_asc');

  // Drilldown facility
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    const districtData = await fetchDistrictData();
    setData(districtData);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Enrich facilities with calculated scores & grades
  const enrichedFacilities = useMemo(() => {
    return data.facilities.map((fac) => {
      const score = calculateFacilityScore(fac);
      const grade = getPerformanceGrade(score);
      return {
        ...fac,
        calculatedScore: score,
        grade
      };
    });
  }, [data.facilities]);

  // Aggregate all district alerts
  const allAlerts: AlertItem[] = useMemo(() => {
    const alerts: AlertItem[] = [];
    enrichedFacilities.forEach((fac) => {
      if (fac.alerts && fac.alerts.length > 0) {
        fac.alerts.forEach((al) => {
          alerts.push({
            ...al,
            facilityId: fac.id,
            facilityName: lang === 'mr' ? fac.nameMr : fac.name
          });
        });
      }
    });
    return alerts;
  }, [enrichedFacilities, lang]);

  // Critical and below average facilities (Grade F or D)
  const criticalFacilities = useMemo(() => {
    return enrichedFacilities.filter(
      (f) => f.grade?.grade === 'F' || f.grade?.grade === 'D'
    );
  }, [enrichedFacilities]);

  // Unique Blocks for filter dropdown
  const blockOptions = useMemo(() => {
    const blocks = Array.from(new Set(data.facilities.map((f) => f.block)));
    return ['ALL', ...blocks];
  }, [data.facilities]);

  // Filtered and sorted facilities
  const filteredFacilities = useMemo(() => {
    return enrichedFacilities
      .filter((fac) => {
        const matchesBlock = filterBlock === 'ALL' || fac.block === filterBlock;
        const matchesType = filterType === 'ALL' || fac.type === filterType;
        const matchesGrade = filterGrade === 'ALL' || fac.grade?.grade === filterGrade;
        const matchesSearch = 
          searchQuery.trim() === '' ||
          fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fac.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fac.inCharge.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fac.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fac.block.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesBlock && matchesType && matchesGrade && matchesSearch;
      })
      .sort((a, b) => {
        const scoreA = a.calculatedScore || 0;
        const scoreB = b.calculatedScore || 0;
        switch (sortBy) {
          case 'score_asc':
            return scoreA - scoreB;
          case 'score_desc':
            return scoreB - scoreA;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'alerts':
            return (b.alerts?.length || 0) - (a.alerts?.length || 0);
          default:
            return 0;
        }
      });
  }, [enrichedFacilities, filterBlock, filterType, filterGrade, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      
      {/* 1. District Overview Header */}
      <div className="bg-[#1A4B8C] rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#F57C00] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {lang === 'mr' ? data.district.stateMr : data.district.state}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {lang === 'mr' ? data.district.nameMr : data.district.name}
                </h1>
              </div>

              <p className="text-blue-100 text-xs sm:text-sm font-medium mt-1">
                {lang === 'mr'
                  ? 'सार्वजनिक आरोग्य विभाग · राष्ट्रीय आरोग्य अभियान (NHM) महाराष्ट्र'
                  : 'Directorate of Health Services · Integrated Rural Facility Command'}
              </p>

              <div className="flex items-center gap-3 text-xs text-blue-200 mt-3 flex-wrap">
                <span>{lang === 'mr' ? `लोकसंख्या: ${data.district.population.toLocaleString('en-IN')}` : `Pop: ${data.district.population.toLocaleString('en-IN')}`}</span>
                <span>·</span>
                <span>{lang === 'mr' ? `${data.district.blocks} तालुके` : `${data.district.blocks} Blocks`}</span>
                <span>·</span>
                <span>{lang === 'mr' ? `${data.district.totalFacilities} एकूण आरोग्य केंद्रे` : `${data.district.totalFacilities} Facilities`}</span>
                <span>·</span>
                <span>{lang === 'mr' ? `नोडल अधिकारी: ${data.district.officerInCharge}` : `Officer: ${data.district.officerInCharge} (DHO)`}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-blue-200 block">
                {lang === 'mr' ? 'माहिती अद्ययावत:' : 'Last Synced:'}
              </span>
              <strong className="text-xs font-mono text-white">
                {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </strong>
            </div>

            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-bold text-white transition flex items-center gap-2 disabled:opacity-60 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? (lang === 'mr' ? 'अद्ययावत करत आहे...' : 'Refreshing...') : (lang === 'mr' ? 'रीफ्रेश करा' : 'Refresh Live')}</span>
            </button>

            <button
              onClick={() => {
                if (onExportReport) onExportReport();
                else window.print();
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-[#1A4B8C] hover:bg-blue-50 text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'अहवाल मुद्रित करा' : 'Export Report'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Critical Facilities Alert Banner (Highlighted if any F or D grade) */}
      {criticalFacilities.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-md">
                  {lang === 'mr' ? 'तातडीचा इशारा' : 'Immediate Attention Required'}
                </span>
                <strong className="text-sm font-bold text-rose-950">
                  {lang === 'mr' 
                    ? `${criticalFacilities.length} आरोग्य केंद्रांची कामगिरी अत्यंत खालावली आहे (D किंवा F श्रेणी)` 
                    : `${criticalFacilities.length} facilities flagged with critical/below-average performance (Grade D / F)`}
                </strong>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {criticalFacilities.map((fac) => (
                  <button
                    key={fac.id}
                    onClick={() => setSelectedFacility(fac)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-rose-300 text-rose-900 text-xs font-bold hover:bg-rose-100 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{lang === 'mr' ? fac.nameMr : fac.name}</span>
                    <span className="font-mono text-[11px] font-black text-rose-700">({fac.calculatedScore}/100)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 self-end md:self-auto">
            <button
              onClick={() => {
                setFilterGrade('F');
                setActiveTab('facilities');
              }}
              className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span>{lang === 'mr' ? 'गंभीर केंद्रे तपासा' : 'Review Deficits'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. 6 District Core KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Patients */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm space-y-1.5 hover:border-[#1A4B8C] transition">
          <div className="flex items-center justify-between text-[#546E7A]">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {lang === 'mr' ? 'नोंदणीकृत नागरिक' : 'Total Enrolled'}
            </span>
            <Users className="w-4 h-4 text-[#1A4B8C]" />
          </div>
          <div className="text-2xl font-black text-[#1C2B3A] font-mono">
            {data.summary.totalPatients.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#546E7A]">{lang === 'mr' ? 'आभा प्रणालीशी संलग्न' : 'ABDM linked'}</span>
            <span className="text-emerald-700 font-bold">{lang === 'mr' ? '+१२.४% मागील महिना' : '+12.4% vs last mo.'}</span>
          </div>
        </div>

        {/* KPI 2: Consultations Today */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm space-y-1.5 hover:border-[#1A4B8C] transition">
          <div className="flex items-center justify-between text-[#546E7A]">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {lang === 'mr' ? 'आजच्या तपासण्या' : "Today's Consults"}
            </span>
            <Stethoscope className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {data.summary.consultationsToday.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#546E7A]">{lang === 'mr' ? 'दैनिक ओपीडी' : 'Daily OPD'}</span>
            <span className="text-emerald-700 font-bold">{lang === 'mr' ? '+८% कालच्या तुलनेत' : '+8% vs yesterday'}</span>
          </div>
        </div>

        {/* KPI 3: Active Referrals */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm space-y-1.5 hover:border-[#1A4B8C] transition">
          <div className="flex items-center justify-between text-[#546E7A]">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {lang === 'mr' ? 'सक्रिय रेफरल्स' : 'Active Referrals'}
            </span>
            <Activity className="w-4 h-4 text-[#F57C00]" />
          </div>
          <div className="text-2xl font-black text-[#F57C00] font-mono">
            {data.summary.activeReferrals}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#546E7A]">{lang === 'mr' ? `${data.summary.pendingReferrals} प्रलंबित` : `${data.summary.pendingReferrals} in transit`}</span>
            <span className="text-blue-700 font-bold">{lang === 'mr' ? '-५% कालच्या तुलनेत' : '-5% vs yesterday'}</span>
          </div>
        </div>

        {/* KPI 4: Out of Stock */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm space-y-1.5 hover:border-[#1A4B8C] transition">
          <div className="flex items-center justify-between text-[#546E7A]">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {lang === 'mr' ? 'औषध तुटवडा' : 'Stockouts'}
            </span>
            <Pill className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {data.summary.medicinesOutOfStock}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#546E7A]">{lang === 'mr' ? 'साठा संपलेली' : 'Depleted items'}</span>
            <span className="text-rose-700 font-bold">{lang === 'mr' ? '+३ कालच्या तुलनेत' : '+3 vs yesterday'}</span>
          </div>
        </div>

        {/* KPI 5: High Risk Cohort */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm space-y-1.5 hover:border-[#1A4B8C] transition">
          <div className="flex items-center justify-between text-[#546E7A]">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {lang === 'mr' ? 'उच्च जोखीम रुग्ण' : 'High-Risk Cohort'}
            </span>
            <AlertTriangle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-800 font-mono">
            {data.summary.highRiskPatients.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-amber-800 font-semibold">{lang === 'mr' ? `${data.summary.overdueFollowUps} प्रलंबित` : `${data.summary.overdueFollowUps} overdue`}</span>
            <span className="text-emerald-700 font-bold">{lang === 'mr' ? '-१८ मागील आठवडा' : '-18 vs last week'}</span>
          </div>
        </div>

        {/* KPI 6: Staff Attendance */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm space-y-1.5 hover:border-[#1A4B8C] transition">
          <div className="flex items-center justify-between text-[#546E7A]">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {lang === 'mr' ? 'कर्मचारी उपस्थिती' : 'Staff Attendance'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#1A4B8C] font-mono">
            {data.summary.attendanceRate}%
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#546E7A]">{lang === 'mr' ? `${data.summary.staffPresent}/${data.summary.staffTotal} हजर` : `${data.summary.staffPresent}/${data.summary.staffTotal} on duty`}</span>
            <span className="text-emerald-700 font-bold">{lang === 'mr' ? '+२.१% सरासरीपेक्षा' : '+2.1% vs avg'}</span>
          </div>
        </div>
      </div>

      {/* 4. Grade Distribution Section */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#1A4B8C]" />
            <h3 className="text-sm font-bold text-[#1C2B3A] uppercase tracking-wider">
              {lang === 'mr' ? 'जिल्हा आरोग्य केंद्र श्रेणी वितरण (A–F Performance Grades)' : 'Facility Performance Distribution'}
            </h3>
          </div>

          {filterGrade !== 'ALL' && (
            <button
              onClick={() => setFilterGrade('ALL')}
              className="text-xs font-bold text-[#1A4B8C] hover:underline"
            >
              {lang === 'mr' ? 'फिल्टर काढा' : 'Clear Grade Filter'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['A', 'B', 'C', 'D', 'F'] as GradeKey[]).map((gradeKey) => {
            const config = PERFORMANCE_GRADES[gradeKey];
            const count = enrichedFacilities.filter((f) => f.grade?.grade === gradeKey).length;
            const isSelected = filterGrade === gradeKey;

            return (
              <button
                key={gradeKey}
                onClick={() => {
                  setFilterGrade(isSelected ? 'ALL' : gradeKey);
                  setActiveTab('facilities');
                }}
                className={`p-3.5 rounded-xl border text-left transition relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-offset-1'
                    : 'hover:shadow-xs'
                }`}
                style={{
                  backgroundColor: config.bgColor,
                  borderColor: config.borderColor,
                  outlineColor: config.color
                }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs font-black uppercase tracking-wider"
                    style={{ color: config.color }}
                  >
                    Grade {gradeKey}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    &gt;={config.minScore}
                  </span>
                </div>

                <div className="my-2">
                  <span 
                    className="text-2xl font-black font-mono"
                    style={{ color: config.color }}
                  >
                    {count}
                  </span>
                  <span className="text-xs text-slate-600 ml-1.5 font-medium">
                    {lang === 'mr' ? 'केंद्रे' : 'facilities'}
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-slate-700 truncate">
                  {lang === 'mr' ? config.labelMr : config.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Navigation View Tabs */}
      <div className="flex items-center gap-2 border-b border-[#CFD8DC] pb-2 overflow-x-auto">
        {[
          { id: 'overview', labelEn: 'Overview & Leaderboard', labelMr: 'आढावा व क्रमवारी', icon: Layers },
          { id: 'facilities', labelEn: `Facilities Directory (${filteredFacilities.length})`, labelMr: `सर्व केंद्रे (${filteredFacilities.length})`, icon: Hospital },
          { id: 'attendance', labelEn: 'Staff Attendance', labelMr: 'कर्मचारी उपस्थिती', icon: Users },
          { id: 'alerts', labelEn: `Alerts Stream (${allAlerts.length})`, labelMr: `इशारे व सूचना (${allAlerts.length})`, icon: AlertTriangle },
          { id: 'trends', labelEn: 'Trends & Analysis', labelMr: 'कल व विश्लेषण', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#1A4B8C] text-white shadow-xs'
                  : 'bg-white text-[#546E7A] hover:bg-slate-100 border border-[#CFD8DC]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? tab.labelMr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeaderBoard
              facilities={enrichedFacilities}
              onSelectFacility={(fac) => setSelectedFacility(fac)}
            />
            <MetricChart
              consultationTrends={data.trends.consultations}
              referralTrends={data.trends.referrals}
              stockAlertTrends={data.trends.stockAlerts}
            />
          </div>

          <AlertsPanel
            alerts={allAlerts}
            facilities={enrichedFacilities}
            onSelectFacility={(facId) => {
              const f = enrichedFacilities.find((x) => x.id === facId);
              if (f) setSelectedFacility(f);
            }}
          />
        </div>
      )}

      {/* TAB 1: OVERVIEW (Complete Command View) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Facilities Matrix Grid on Command Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hospital className="w-4 h-4 text-[#1A4B8C]" />
                <h3 className="text-sm font-bold text-[#1C2B3A] uppercase tracking-wider">
                  {lang === 'mr' ? 'आरोग्य केंद्र संचलन ग्रिड' : 'Facility Command Matrix'}
                </h3>
              </div>
              <span className="text-xs text-[#546E7A]">
                {lang === 'mr' ? `${filteredFacilities.length} पैकी ${enrichedFacilities.length} केंद्रे` : `Showing ${filteredFacilities.length} of ${enrichedFacilities.length} facilities`}
              </span>
            </div>

            {/* Filter Bar with Chips */}
            <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm space-y-3">
              {/* Row 1: Search, Block & Sort */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#546E7A] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder={lang === 'mr' ? 'केंद्राचे नाव, तालुका, आयडी किंवा डॉक्टरांच्या नावाने शोधा...' : 'Search facility name, block, ID or in-charge...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C] bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-[#546E7A] whitespace-nowrap">
                    {lang === 'mr' ? 'तालुका:' : 'Block:'}
                  </span>
                  <select
                    value={filterBlock}
                    onChange={(e) => setFilterBlock(e.target.value)}
                    className="px-3 py-2 text-xs font-bold border border-[#CFD8DC] rounded-xl bg-white text-[#1C2B3A] focus:outline-none focus:border-[#1A4B8C]"
                  >
                    {blockOptions.map((b) => (
                      <option key={b} value={b}>
                        {b === 'ALL' ? (lang === 'mr' ? 'सर्व तालुके (All)' : 'All Blocks') : b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <ArrowUpDown className="w-4 h-4 text-[#546E7A]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 text-xs font-bold border border-[#CFD8DC] rounded-xl bg-white text-[#1C2B3A] focus:outline-none focus:border-[#1A4B8C]"
                  >
                    <option value="score_asc">{lang === 'mr' ? 'कमी गुण पहिले (Worst First)' : 'Worst Score First'}</option>
                    <option value="score_desc">{lang === 'mr' ? 'अधिक गुण पहिले (Best First)' : 'Best Score First'}</option>
                    <option value="alerts">{lang === 'mr' ? 'सर्वाधिक इशारे (Most Alerts)' : 'Most Alerts'}</option>
                    <option value="name">{lang === 'mr' ? 'नावाप्रमाणे (A-Z)' : 'Name (A-Z)'}</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Facility Type Chips and Grade Filter Chips */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[#546E7A] whitespace-nowrap mr-1">
                    {lang === 'mr' ? 'प्रकार:' : 'Type:'}
                  </span>
                  {[
                    { id: 'ALL', labelEn: 'All Types', labelMr: 'सर्व' },
                    { id: 'DH', labelEn: 'DH', labelMr: 'DH' },
                    { id: 'SDH', labelEn: 'SDH', labelMr: 'SDH' },
                    { id: 'CHC', labelEn: 'CHC', labelMr: 'CHC' },
                    { id: 'PHC', labelEn: 'PHC', labelMr: 'PHC' },
                    { id: 'SC', labelEn: 'SC', labelMr: 'SC' }
                  ].map((chip) => {
                    const isSelected = filterType === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setFilterType(chip.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          isSelected
                            ? 'bg-[#1A4B8C] text-white shadow-xs'
                            : 'bg-slate-100 text-[#546E7A] hover:bg-slate-200 border border-[#CFD8DC]'
                        }`}
                      >
                        {lang === 'mr' ? chip.labelMr : chip.labelEn}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[#546E7A] whitespace-nowrap mr-1">
                    {lang === 'mr' ? 'श्रेणी:' : 'Grade:'}
                  </span>
                  {['ALL', 'A', 'B', 'C', 'D', 'F'].map((g) => {
                    const isSelected = filterGrade === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFilterGrade(g)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          isSelected
                            ? 'bg-[#1A4B8C] text-white shadow-xs'
                            : 'bg-slate-100 text-[#546E7A] hover:bg-slate-200 border border-[#CFD8DC]'
                        }`}
                      >
                        {g === 'ALL' ? (lang === 'mr' ? 'सर्व' : 'All') : `Grade ${g}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Facilities Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFacilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  onSelect={(fac) => setSelectedFacility(fac)}
                />
              ))}
            </div>

            {filteredFacilities.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#CFD8DC] space-y-2">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-[#1C2B3A]">
                  {lang === 'mr' ? 'कोणतेही आरोग्य केंद्र सापडले नाही' : 'No facilities match your search criteria'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterBlock('ALL');
                    setFilterType('ALL');
                    setFilterGrade('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1A4B8C] text-white text-xs font-bold"
                >
                  {lang === 'mr' ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset Filters'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeaderBoard
              facilities={enrichedFacilities}
              onSelectFacility={(fac) => setSelectedFacility(fac)}
            />
            <MetricChart
              consultationTrends={data.trends.consultations}
              referralTrends={data.trends.referrals}
              stockAlertTrends={data.trends.stockAlerts}
            />
          </div>

          <AlertsPanel
            alerts={allAlerts}
            facilities={enrichedFacilities}
            onSelectFacility={(facId) => {
              const f = enrichedFacilities.find((x) => x.id === facId);
              if (f) setSelectedFacility(f);
            }}
          />
        </div>
      )}

      {/* TAB 2: ALL FACILITIES (Grid with Filter & Search Bar) */}
      {activeTab === 'facilities' && (
        <div className="space-y-4">
          
          {/* Filter Bar with Chips */}
          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm space-y-3">
            {/* Row 1: Search, Block & Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#546E7A] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={lang === 'mr' ? 'केंद्राचे नाव, तालुका, आयडी किंवा डॉक्टरांच्या नावाने शोधा...' : 'Search facility name, block, ID or in-charge...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C] bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-[#546E7A] whitespace-nowrap">
                  {lang === 'mr' ? 'तालुका:' : 'Block:'}
                </span>
                <select
                  value={filterBlock}
                  onChange={(e) => setFilterBlock(e.target.value)}
                  className="px-3 py-2 text-xs font-bold border border-[#CFD8DC] rounded-xl bg-white text-[#1C2B3A] focus:outline-none focus:border-[#1A4B8C]"
                >
                  {blockOptions.map((b) => (
                    <option key={b} value={b}>
                      {b === 'ALL' ? (lang === 'mr' ? 'सर्व तालुके (All)' : 'All Blocks') : b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <ArrowUpDown className="w-4 h-4 text-[#546E7A]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs font-bold border border-[#CFD8DC] rounded-xl bg-white text-[#1C2B3A] focus:outline-none focus:border-[#1A4B8C]"
                >
                  <option value="score_asc">{lang === 'mr' ? 'कमी गुण पहिले (Worst First)' : 'Worst Score First'}</option>
                  <option value="score_desc">{lang === 'mr' ? 'अधिक गुण पहिले (Best First)' : 'Best Score First'}</option>
                  <option value="alerts">{lang === 'mr' ? 'सर्वाधिक इशारे (Most Alerts)' : 'Most Alerts'}</option>
                  <option value="name">{lang === 'mr' ? 'नावाप्रमाणे (A-Z)' : 'Name (A-Z)'}</option>
                </select>
              </div>
            </div>

            {/* Row 2: Facility Type Chips and Grade Filter Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-[#546E7A] whitespace-nowrap mr-1">
                  {lang === 'mr' ? 'प्रकार:' : 'Type:'}
                </span>
                {[
                  { id: 'ALL', labelEn: 'All Types', labelMr: 'सर्व' },
                  { id: 'DH', labelEn: 'DH', labelMr: 'DH' },
                  { id: 'SDH', labelEn: 'SDH', labelMr: 'SDH' },
                  { id: 'CHC', labelEn: 'CHC', labelMr: 'CHC' },
                  { id: 'PHC', labelEn: 'PHC', labelMr: 'PHC' },
                  { id: 'SC', labelEn: 'SC', labelMr: 'SC' }
                ].map((chip) => {
                  const isSelected = filterType === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setFilterType(chip.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        isSelected
                          ? 'bg-[#1A4B8C] text-white shadow-xs'
                          : 'bg-slate-100 text-[#546E7A] hover:bg-slate-200 border border-[#CFD8DC]'
                      }`}
                    >
                      {lang === 'mr' ? chip.labelMr : chip.labelEn}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-[#546E7A] whitespace-nowrap mr-1">
                  {lang === 'mr' ? 'श्रेणी:' : 'Grade:'}
                </span>
                {['ALL', 'A', 'B', 'C', 'D', 'F'].map((g) => {
                  const isSelected = filterGrade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFilterGrade(g)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        isSelected
                          ? 'bg-[#1A4B8C] text-white shadow-xs'
                          : 'bg-slate-100 text-[#546E7A] hover:bg-slate-200 border border-[#CFD8DC]'
                      }`}
                    >
                      {g === 'ALL' ? (lang === 'mr' ? 'सर्व' : 'All') : `Grade ${g}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Facilities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFacilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                onSelect={(fac) => setSelectedFacility(fac)}
              />
            ))}
          </div>

          {filteredFacilities.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#CFD8DC] space-y-2">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'कोणतेही आरोग्य केंद्र सापडले नाही' : 'No facilities match your search criteria'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterBlock('ALL');
                  setFilterType('ALL');
                  setFilterGrade('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-[#1A4B8C] text-white text-xs font-bold"
              >
                {lang === 'mr' ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset Filters'}
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB: STAFF ATTENDANCE */}
      {activeTab === 'attendance' && (
        <StaffAttendance />
      )}

      {/* TAB 3: ALERTS STREAM */}
      {activeTab === 'alerts' && (
        <AlertsPanel
          alerts={allAlerts}
          facilities={enrichedFacilities}
          onSelectFacility={(facId) => {
            const f = enrichedFacilities.find((x) => x.id === facId);
            if (f) setSelectedFacility(f);
          }}
        />
      )}

      {/* TAB 4: TRENDS & ANALYTICS */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <MetricChart
            consultationTrends={data.trends.consultations}
            referralTrends={data.trends.referrals}
            stockAlertTrends={data.trends.stockAlerts}
          />
          <LeaderBoard
            facilities={enrichedFacilities}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
          />
        </div>
      )}

      {/* Drilldown Modal View */}
      <FacilityDetailModal
        facility={selectedFacility}
        onClose={() => setSelectedFacility(null)}
      />

    </div>
  );
}
