import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Search, 
  MapPin, 
  Hospital, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  PhoneCall, 
  Bell, 
  Filter, 
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  MedicineEngineService, 
  FacilityStockItem, 
  MedicineMaster, 
  MedicineCategory, 
  StockStatusTier 
} from '../../services/medicineEngine';

export default function MedicineSearch() {
  const { lang } = useLanguage();

  const [allStock, setAllStock] = useState<FacilityStockItem[]>(() => MedicineEngineService.getAllStock());
  const catalog = useMemo(() => MedicineEngineService.getMedicinesCatalog(), []);
  const facilities = useMemo(() => MedicineEngineService.getFacilities(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [subscribedMeds, setSubscribedMeds] = useState<Record<string, boolean>>({});
  const [showNotifyModal, setShowNotifyModal] = useState<{ medId: string; medName: string; facId: string } | null>(null);
  const [patientPhoneInput, setPatientPhoneInput] = useState('9822304912');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState<string | null>(null);

  const categories: { id: string; nameEn: string; nameMr: string }[] = [
    { id: 'ALL', nameEn: 'All Medicines', nameMr: 'सर्व औषधे' },
    { id: 'ESSENTIAL', nameEn: 'Essential Drugs', nameMr: 'अत्यावश्यक औषधे' },
    { id: 'MATERNAL_CHILD', nameEn: 'Maternal & Child (ANC/PNC)', nameMr: 'माता व बाल पोषण' },
    { id: 'CHRONIC_NCD', nameEn: 'Chronic / Diabetes / BP', nameMr: 'मधुमेह व रक्तदाब (NCD)' },
    { id: 'ANTIBIOTIC', nameEn: 'Antibiotics', nameMr: 'अँटीबायोटिक्स' },
    { id: 'VACCINE', nameEn: 'Vaccines', nameMr: 'लसी व कोल्ड चेन' },
    { id: 'EMERGENCY', nameEn: 'Emergency & Critical Care', nameMr: 'तातडीची जीवनरक्षक औषधे' },
    { id: 'OTC', nameEn: 'General & Drops', nameMr: 'सामान्य व डोळ्यांचे थेंब' },
  ];

  // Filter stock items
  const filteredStock = useMemo(() => {
    return allStock.filter(item => {
      const medMeta = catalog.find(m => m.id === item.medicineId);
      if (!medMeta) return false;

      // Category match
      if (selectedCategory !== 'ALL' && medMeta.category !== selectedCategory) {
        return false;
      }

      // Facility match
      if (selectedFacilityId !== 'ALL' && item.facilityId !== selectedFacilityId) {
        return false;
      }

      // Availability filter
      if (onlyAvailable && (item.status === 'OUT_OF_STOCK')) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = medMeta.nameEn.toLowerCase().includes(q) || medMeta.nameMr.toLowerCase().includes(q);
        const matchGeneric = medMeta.genericName.toLowerCase().includes(q);
        const matchFac = item.facilityName.toLowerCase().includes(q) || item.facilityNameMr.toLowerCase().includes(q);
        const matchCode = medMeta.code.toLowerCase().includes(q);
        if (!matchName && !matchGeneric && !matchFac && !matchCode) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [allStock, catalog, selectedCategory, selectedFacilityId, onlyAvailable, searchQuery]);

  const handleSubscribeNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showNotifyModal) return;
    MedicineEngineService.subscribeStockNotification(patientPhoneInput, showNotifyModal.medId, showNotifyModal.facId);
    setSubscribedMeds(prev => ({ ...prev, [`${showNotifyModal.facId}_${showNotifyModal.medId}`]: true }));
    setSubscriptionSuccess(showNotifyModal.medName);
    setShowNotifyModal(null);
    setTimeout(() => setSubscriptionSuccess(null), 5000);
  };

  const getStatusBadge = (status: StockStatusTier, qty: number, unit: string, unitMr: string, daysSupply: number) => {
    switch (status) {
      case 'ADEQUATE':
        return (
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {lang === 'mr' ? 'उपलब्ध (साठा पूर्ण)' : 'In Stock'}
            </span>
            <span className="text-[10px] text-green-800 font-mono mt-0.5">
              {qty} {lang === 'mr' ? unitMr : unit} ({daysSupply} {lang === 'mr' ? 'दिवसांचा साठा' : 'days buffer'})
            </span>
          </div>
        );
      case 'LOW':
        return (
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              {lang === 'mr' ? 'मर्यादित साठा' : 'Low Stock'}
            </span>
            <span className="text-[10px] text-amber-800 font-mono mt-0.5">
              {qty} {lang === 'mr' ? unitMr : unit} ({daysSupply} {lang === 'mr' ? 'दिवस शिल्लक' : 'days left'})
            </span>
          </div>
        );
      case 'CRITICAL':
        return (
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
              <AlertCircle className="w-3.5 h-3.5" />
              {lang === 'mr' ? 'अति-कमी साठा' : 'Critical Low'}
            </span>
            <span className="text-[10px] text-orange-800 font-mono mt-0.5">
              {qty} {lang === 'mr' ? unitMr : unit} ({daysSupply} {lang === 'mr' ? 'दिवस' : 'days'})
            </span>
          </div>
        );
      case 'EXPIRING_SOON':
        return (
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <Clock className="w-3.5 h-3.5" />
              {lang === 'mr' ? 'कालबाह्य जवळ (३० दिवस)' : 'Expiring Soon'}
            </span>
            <span className="text-[10px] text-purple-800 font-mono mt-0.5">
              {qty} {lang === 'mr' ? unitMr : unit}
            </span>
          </div>
        );
      case 'OUT_OF_STOCK':
      default:
        return (
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              <XCircle className="w-3.5 h-3.5" />
              {lang === 'mr' ? 'साठा संपला (Out of Stock)' : 'Out of Stock'}
            </span>
            <span className="text-[10px] text-red-700 font-mono mt-0.5">
              0 {lang === 'mr' ? unitMr : unit}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alert confirmation toast if subscribed */}
      {subscriptionSuccess && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-[#1A4B8C]" />
            <span>
              {lang === 'mr' 
                ? `धन्यवाद! '${subscriptionSuccess}' औषधाचा साठा उपलब्ध होताच आपल्या मोबाईलवर मोफत एसएमएस पाठवला जाईल.` 
                : `SMS alert registered! You will receive a free text notification as soon as '${subscriptionSuccess}' is restocked.`}
            </span>
          </div>
          <button 
            onClick={() => setSubscriptionSuccess(null)}
            className="text-[#1A4B8C] font-bold hover:underline"
          >
            {lang === 'mr' ? 'ठीक आहे' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Free Government Medicines Guarantee Banner */}
      <div className="bg-gradient-to-r from-[#1A4B8C]/10 via-[#1A4B8C]/5 to-transparent border-l-4 border-[#1A4B8C] p-4 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#1A4B8C] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-[#1C2B3A]">
            {lang === 'mr' ? 'शासकीय मोफत औषध हमी योजना' : 'Government Essential Drug Guarantee'}
          </h4>
          <p className="text-[11px] text-[#546E7A] mt-0.5 leading-relaxed">
            {lang === 'mr'
              ? 'महाराष्ट्र शासनाच्या सर्व प्राथमिक आरोग्य केंद्रे, उपकेंद्रे आणि ग्रामीण रुग्णालयांमध्ये नमूद केलेली सर्व औषधे रुग्णांना मोफत दिली जातात. जाण्यापूर्वी साठा तपासून खात्री करा.'
              : 'All medicines listed in the Maharashtra Essential Drug List (EDL) are dispensed 100% free of charge to rural citizens. Check real-time stock levels before visiting.'}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-4">
        
        {/* Search input bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#546E7A] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={
              lang === 'mr'
                ? 'औषधाचे नाव, जेनेरिक फॉर्म्युला किंवा आजार शोधा (उदा. Paracetamol, Metformin, IFA, ORS)...'
                : 'Search by medicine brand, generic salt, or condition (e.g., Paracetamol, Metformin, Iron Folic, ORS)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#CFD8DC] focus:outline-none focus:border-[#1A4B8C] focus:ring-1 focus:ring-[#1A4B8C] bg-[#F8FAFC]"
          />
        </div>

        {/* Facility Dropdown and Availability Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-8">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#546E7A] mb-1">
              {lang === 'mr' ? 'आरोग्य केंद्र निवडा (Facility)' : 'Filter by Health Center'}
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#546E7A] absolute left-3 top-2.5" />
              <select
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#CFD8DC] rounded-xl text-[#1C2B3A] bg-white focus:outline-none focus:border-[#1A4B8C]"
              >
                <option value="ALL">
                  {lang === 'mr' ? 'सर्व आरोग्य केंद्रे (जवळच्या क्रमाने)' : 'All Health Facilities (Sorted by Distance)'}
                </option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {lang === 'mr' ? `${fac.nameMr} (${fac.distanceKm} किमी)` : `${fac.nameEn} (${fac.distanceKm} km)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-4 flex items-end">
            <label className="w-full flex items-center gap-2 p-2 rounded-xl border border-[#CFD8DC] bg-[#F8FAFC] cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-[#1A4B8C] rounded border-[#CFD8DC] focus:ring-[#1A4B8C]"
              />
              <span className="text-xs font-semibold text-[#1C2B3A]">
                {lang === 'mr' ? 'फक्त उपलब्ध औषधे दाखवा' : 'In-Stock Only'}
              </span>
            </label>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#546E7A] mb-1.5">
            {lang === 'mr' ? 'औषध वर्गवारी निवडा' : 'Select Medicine Category'}
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition text-xs ${
                  selectedCategory === cat.id
                    ? 'bg-[#1A4B8C] text-white shadow-sm'
                    : 'bg-slate-50 text-[#546E7A] hover:bg-slate-100 border border-[#CFD8DC]'
                }`}
              >
                {lang === 'mr' ? cat.nameMr : cat.nameEn}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#546E7A] px-1">
        <span className="font-semibold">
          {lang === 'mr' 
            ? `एकूण उपलब्ध नोंदी: ${filteredStock.length}` 
            : `Showing ${filteredStock.length} inventory records`}
        </span>
        <span className="text-[11px] flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#1A4B8C]" />
          {lang === 'mr' ? 'थेट डेटाबेस सिंक' : 'Live Inventory Sync'}
        </span>
      </div>

      {/* Medicine Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStock.map((item) => {
          const medMeta = catalog.find(m => m.id === item.medicineId);
          if (!medMeta) return null;

          const isSubscribed = subscribedMeds[`${item.facilityId}_${item.medicineId}`] || 
            MedicineEngineService.isSubscribed(patientPhoneInput, item.medicineId, item.facilityId);

          return (
            <div 
              key={`${item.facilityId}-${item.medicineId}`}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                item.status === 'OUT_OF_STOCK'
                  ? 'border-red-200 bg-red-50/10'
                  : item.status === 'LOW' || item.status === 'CRITICAL'
                    ? 'border-amber-200'
                    : 'border-[#CFD8DC] hover:border-[#1A4B8C]/40'
              }`}
            >
              {/* Top Header: Medicine info & Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.status === 'OUT_OF_STOCK' 
                      ? 'bg-red-50 text-red-600'
                      : item.status === 'LOW' || item.status === 'CRITICAL'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-[#E8F0FE] text-[#1A4B8C]'
                  }`}>
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C2B3A] leading-snug">
                      {lang === 'mr' ? medMeta.nameMr : medMeta.nameEn}
                    </h3>
                    <p className="text-[11px] text-[#546E7A] font-medium mt-0.5">
                      {medMeta.genericName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#546E7A] uppercase">
                        {lang === 'mr' ? medMeta.formMr : medMeta.form} · {medMeta.strength}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1A4B8C] border border-blue-100">
                        {medMeta.program}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {getStatusBadge(item.status, item.currentStock, item.unit, item.unitMr, item.daysOfSupplyRemaining)}
                </div>
              </div>

              {/* Dosage Guideline */}
              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-[#546E7A] flex items-start gap-2 border border-[#CFD8DC]/60">
                <Info className="w-3.5 h-3.5 text-[#1A4B8C] shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'mr' ? 'वापर मार्गदर्शन: ' : 'Dosage Guide: '}</strong>
                  {lang === 'mr' ? medMeta.dosageGuidelineMr : medMeta.dosageGuidelineEn}
                </span>
              </div>

              {/* Facility details box */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#CFD8DC]/70 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-[#1C2B3A]">
                  <div className="flex items-center gap-1.5">
                    <Hospital className="w-3.5 h-3.5 text-[#1A4B8C]" />
                    <span>{lang === 'mr' ? item.facilityNameMr : item.facilityName}</span>
                  </div>
                  <span className="text-[11px] text-[#546E7A] font-bold flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#CFD8DC]">
                    <MapPin className="w-3 h-3 text-[#1A4B8C]" />
                    {item.distanceKm} {lang === 'mr' ? 'किमी' : 'km'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#546E7A]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lang === 'mr' ? item.dispensaryHoursMr : item.dispensaryHoursEn}
                  </span>
                  <a 
                    href={`tel:${item.phone}`}
                    className="inline-flex items-center gap-1 text-[#1A4B8C] font-bold hover:underline"
                  >
                    <PhoneCall className="w-3 h-3" />
                    {item.phone}
                  </a>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#78909C] pt-1 border-t border-[#CFD8DC]/50">
                  <span>{lang === 'mr' ? 'बॅच क्र:' : 'Batch:'} <strong className="font-mono text-[#546E7A]">{item.batchNumber}</strong></span>
                  <span>{lang === 'mr' ? 'कालबाह्यता:' : 'Expiry:'} <strong className="font-mono text-[#546E7A]">{item.expiryDate}</strong></span>
                </div>
              </div>

              {/* Out of Stock Alternatives or Actions */}
              {item.status === 'OUT_OF_STOCK' ? (
                <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {lang === 'mr' 
                        ? 'पर्याय: ग्रामीण रुग्णालय खेड येथे मुबलक साठा उपलब्ध (१४ किमी)' 
                        : 'Alternative: Available in stock at RH Khed (14 km)'}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowNotifyModal({
                      medId: item.medicineId,
                      medName: lang === 'mr' ? medMeta.nameMr : medMeta.nameEn,
                      facId: item.facilityId
                    })}
                    disabled={isSubscribed}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isSubscribed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-[#1A4B8C] hover:bg-[#0D3470] text-white shadow-sm'
                    }`}
                  >
                    <Bell className="w-3 h-3" />
                    {isSubscribed 
                      ? (lang === 'mr' ? 'एसएमएस नोंदणी झाली' : 'Alert Registered')
                      : (lang === 'mr' ? 'साठा आल्यावर कळवा (SMS)' : 'Notify When Restocked')}
                  </button>
                </div>
              ) : (
                <div className="pt-1 flex items-center justify-between text-xs text-[#546E7A]">
                  <span className="text-[11px] text-green-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'mr' ? 'प्रत्यक्ष खिडकीवर मोफत उपलब्ध' : 'Available for immediate walk-in collection'}
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(item.facilityName + ' Pune Maharashtra')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A4B8C] hover:underline"
                  >
                    <span>{lang === 'mr' ? 'नकाशा दिशा' : 'Get Directions'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Empty Search State */}
      {filteredStock.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-12 text-center text-[#546E7A] space-y-2">
          <Pill className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="font-bold text-sm text-[#1C2B3A]">
            {lang === 'mr' ? 'कोणतेही औषध सापडले नाही' : 'No matching medicines found'}
          </h3>
          <p className="text-xs max-w-md mx-auto">
            {lang === 'mr'
              ? 'कृपया औषधाचे नाव किंवा स्पेलिंग तपासून पहा, किंवा फिल्टर सर्व औषधे वर सेट करा.'
              : 'Try searching with generic salt names (e.g., Paracetamol, Metformin) or reset filters.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedFacilityId('ALL');
              setOnlyAvailable(false);
            }}
            className="mt-3 px-4 py-2 bg-[#1A4B8C] text-white rounded-xl text-xs font-bold hover:bg-[#0D3470] transition"
          >
            {lang === 'mr' ? 'सर्व फिल्टर रीसेट करा' : 'Reset All Filters'}
          </button>
        </div>
      )}

      {/* Notify Me Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#CFD8DC] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#CFD8DC]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#1A4B8C]" />
                <h3 className="font-bold text-sm text-[#1C2B3A]">
                  {lang === 'mr' ? 'मोफत औषध साठा एसएमएस अलर्ट' : 'Free Stock Arrival SMS Alert'}
                </h3>
              </div>
              <button 
                onClick={() => setShowNotifyModal(null)}
                className="text-[#546E7A] hover:text-[#1C2B3A] p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#546E7A] leading-relaxed">
              {lang === 'mr'
                ? `जेव्हा '${showNotifyModal.medName}' चा नवीन साठा प्राथमिक आरोग्य केंद्रात दाखल होईल, तेव्हा आम्ही तात्काळ खालील मोबाईल क्रमांकावर सूचना पाठवू.`
                : `We will send a free automated SMS notification to your mobile number as soon as fresh stock of '${showNotifyModal.medName}' arrives at the facility.`}
            </p>

            <form onSubmit={handleSubscribeNotification} className="space-y-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                  {lang === 'mr' ? 'मोबाईल नंबर (१० अंकी)' : 'Mobile Phone Number (10 digits)'}
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-[#CFD8DC] rounded-l-xl text-xs font-mono text-[#546E7A]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={patientPhoneInput}
                    onChange={(e) => setPatientPhoneInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-r-xl focus:outline-none focus:border-[#1A4B8C]"
                    placeholder="9822304912"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(null)}
                  className="px-4 py-2 border border-[#CFD8DC] text-xs font-bold text-[#546E7A] hover:bg-slate-50 rounded-xl transition"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {lang === 'mr' ? 'अलर्ट सुरू करा' : 'Confirm SMS Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
