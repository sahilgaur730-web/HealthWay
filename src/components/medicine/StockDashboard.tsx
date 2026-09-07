import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Search, 
  Truck, 
  Hospital, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Filter, 
  Plus, 
  RefreshCw, 
  FileText, 
  ArrowUpDown, 
  Building2, 
  Calendar,
  Layers,
  ChevronRight,
  Send,
  Package,
  Check,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  MedicineEngineService, 
  FacilityStockItem, 
  MedicineMaster, 
  StockStatusTier,
  StockIndentRequest 
} from '../../services/medicineEngine';

export default function StockDashboard() {
  const { lang } = useLanguage();

  const [stockList, setStockList] = useState<FacilityStockItem[]>(() => MedicineEngineService.getAllStock());
  const [indents, setIndents] = useState<StockIndentRequest[]>(() => MedicineEngineService.getIndents());
  const catalog = useMemo(() => MedicineEngineService.getMedicinesCatalog(), []);
  const facilities = useMemo(() => MedicineEngineService.getFacilities(), []);

  const [activeTab, setActiveTab] = useState<'inventory' | 'indents'>('inventory');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stock update modal state
  const [editingItem, setEditingItem] = useState<FacilityStockItem | null>(null);
  const [newQty, setNewQty] = useState<number>(0);
  const [newBatch, setNewBatch] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [reasonOption, setReasonOption] = useState('received');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Indent creation state
  const [showNewIndentModal, setShowNewIndentModal] = useState(false);
  const [selectedIndentFacility, setSelectedIndentFacility] = useState<string>('FAC-01');
  const [indentUrgency, setIndentUrgency] = useState<'ROUTINE' | 'URGENT' | 'CRITICAL_EMERGENCY'>('URGENT');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    return stockList.filter(item => {
      const medMeta = catalog.find(m => m.id === item.medicineId);
      if (!medMeta) return false;

      if (selectedFacilityId !== 'ALL' && item.facilityId !== selectedFacilityId) {
        return false;
      }

      if (filterStatus !== 'ALL' && item.status !== filterStatus) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = medMeta.nameEn.toLowerCase().includes(q) || medMeta.nameMr.toLowerCase().includes(q);
        const matchGeneric = medMeta.genericName.toLowerCase().includes(q);
        const matchBatch = item.batchNumber.toLowerCase().includes(q);
        const matchFac = item.facilityName.toLowerCase().includes(q) || item.facilityNameMr.toLowerCase().includes(q);
        if (!matchName && !matchGeneric && !matchBatch && !matchFac) {
          return false;
        }
      }

      return true;
    });
  }, [stockList, catalog, selectedFacilityId, filterStatus, searchQuery]);

  // Key KPI stats
  const kpiStats = useMemo(() => {
    const totalItems = stockList.length;
    const adequate = stockList.filter(s => s.status === 'ADEQUATE').length;
    const low = stockList.filter(s => s.status === 'LOW').length;
    const critical = stockList.filter(s => s.status === 'CRITICAL').length;
    const stockout = stockList.filter(s => s.status === 'OUT_OF_STOCK').length;
    const expiring = stockList.filter(s => s.status === 'EXPIRING_SOON').length;
    return { totalItems, adequate, low, critical, stockout, expiring };
  }, [stockList]);

  // Critical items needing reorder
  const criticalItems = useMemo(() => {
    return stockList.filter(s => s.status === 'CRITICAL' || s.status === 'OUT_OF_STOCK');
  }, [stockList]);

  // Open Edit Modal
  const openEditModal = (item: FacilityStockItem) => {
    setEditingItem(item);
    setNewQty(item.currentStock);
    setNewBatch(item.batchNumber);
    setNewExpiry(item.expiryDate);
    setReasonOption('received');
  };

  // Submit Stock Update
  const handleSaveStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = MedicineEngineService.updateStockLevel(
      editingItem.facilityId,
      editingItem.medicineId,
      Number(newQty),
      newBatch,
      newExpiry
    );

    if (updated) {
      setStockList(MedicineEngineService.getAllStock());
      showToast(lang === 'mr' ? 'औषध साठा यशस्वीरित्या अद्ययावत केला!' : 'Stock inventory updated successfully!');
      setEditingItem(null);
    }
  };

  // Auto-generate Emergency Indent for all critical items in selected facility
  const handleGenerateEmergencyIndent = (facilityId: string) => {
    const facCrit = stockList.filter(s => s.facilityId === facilityId && (s.status === 'CRITICAL' || s.status === 'OUT_OF_STOCK'));
    if (facCrit.length === 0) {
      showToast(lang === 'mr' ? 'या केंद्रात तातडीची औषध टंचाई नाही.' : 'No critical stockouts found in this facility.');
      return;
    }

    const itemsToOrder = facCrit.map(item => {
      const med = catalog.find(m => m.id === item.medicineId);
      const targetBuffer = (med?.minBufferThreshold || 100) * 2;
      return {
        medicineId: item.medicineId,
        requestedQuantity: targetBuffer,
        reason: item.status === 'OUT_OF_STOCK' ? 'Zero stock emergency' : 'Buffer stock below critical threshold'
      };
    });

    const newInd = MedicineEngineService.createIndent(facilityId, 'CRITICAL_EMERGENCY', itemsToOrder);
    setIndents(MedicineEngineService.getIndents());
    setActiveTab('indents');
    showToast(
      lang === 'mr'
        ? `तातडीचे मागणीपत्रक ${newInd.indentNumber} राज्य वखार केंद्राकडे पाठवले गेले!`
        : `Emergency Indent ${newInd.indentNumber} dispatched to State Central Warehouse!`
    );
  };

  // Mark Indent as Delivered
  const handleMarkIndentDelivered = (indentId: string) => {
    const allIndents = MedicineEngineService.getIndents();
    const ind = allIndents.find(i => i.id === indentId);
    if (!ind) return;

    ind.status = 'DELIVERED';
    // Replenish stock items in that facility
    ind.items.forEach(req => {
      const allStock = MedicineEngineService.getAllStock();
      const current = allStock.find(s => s.facilityId === ind.facilityId && s.medicineId === req.medicineId);
      const newStockVal = (current ? current.currentStock : 0) + req.requestedQuantity;
      MedicineEngineService.updateStockLevel(ind.facilityId, req.medicineId, newStockVal);
    });

    try {
      localStorage.setItem('healthway_stock_indents_v2', JSON.stringify(allIndents));
    } catch {
      // ignore
    }
    setIndents(MedicineEngineService.getIndents());
    setStockList(MedicineEngineService.getAllStock());
    showToast(
      lang === 'mr'
        ? 'साठा केंद्रावर प्राप्त झाला व इन्व्हेंटरीमध्ये समाविष्ट केला गेला!'
        : 'Stock shipment received and replenished into local inventory!'
    );
  };

  return (
    <div className="space-y-6">

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between text-xs text-green-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="font-bold underline text-green-900"
          >
            {lang === 'mr' ? 'बंद करा' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Critical Stock Alert Banner if any items are out of stock or critical */}
      {criticalItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-900">
                {lang === 'mr' 
                  ? `तातडीचा इशारा: ${criticalItems.length} औषधांचा साठा संपला किंवा अति-कमी आहे!` 
                  : `Urgent Alert: ${criticalItems.length} essential medicines are at critical levels or out of stock!`}
              </h4>
              <p className="text-[11px] text-red-700 mt-0.5">
                {lang === 'mr'
                  ? 'शिरूर व टाकळी उपकेंद्रात रुग्णांची गैरसोय टाळण्यासाठी तातडीने राज्य मध्यवर्ती वखारीकडून पुरवठा मागवा.'
                  : 'Replenishment indents should be dispatched immediately to prevent rural patient hardship.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleGenerateEmergencyIndent(selectedFacilityId === 'ALL' ? 'FAC-01' : selectedFacilityId)}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>
              {lang === 'mr' 
                ? 'मध्यवर्ती वखारीला तातडीचे मागणीपत्रक पाठवा' 
                : 'Dispatch Auto Indent to Central Warehouse'}
            </span>
          </button>
        </div>
      )}

      {/* Top 5 KPI Metrics Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-[#CFD8DC] p-3.5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#546E7A] block">
            {lang === 'mr' ? 'एकूण औषध फॉर्म्युला' : 'Total Formulations'}
          </span>
          <div className="text-2xl font-black text-[#1C2B3A] font-mono">{catalog.length}</div>
          <span className="text-[10px] text-[#78909C]">EDL / PMSMA / NCD</span>
        </div>

        <div className="bg-white rounded-xl border border-green-200 bg-green-50/20 p-3.5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-green-700 block">
            {lang === 'mr' ? 'पूर्ण साठा (Adequate)' : 'Adequate (>30d)'}
          </span>
          <div className="text-2xl font-black text-green-700 font-mono">{kpiStats.adequate}</div>
          <span className="text-[10px] text-green-800 font-medium">सुरक्षित पातळी</span>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-3.5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-700 block">
            {lang === 'mr' ? 'मर्यादित साठा (Low)' : 'Low Stock (7-29d)'}
          </span>
          <div className="text-2xl font-black text-amber-700 font-mono">{kpiStats.low}</div>
          <span className="text-[10px] text-amber-800 font-medium">पुनर्नोंदणी आवश्यक</span>
        </div>

        <div className="bg-white rounded-xl border border-red-200 bg-red-50/20 p-3.5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-red-700 block">
            {lang === 'mr' ? 'टंचाई / संपलेला' : 'Critical / Stockout'}
          </span>
          <div className="text-2xl font-black text-red-700 font-mono">{kpiStats.critical + kpiStats.stockout}</div>
          <span className="text-[10px] text-red-800 font-medium">तातडीची कृती</span>
        </div>

        <div className="bg-white rounded-xl border border-purple-200 bg-purple-50/20 p-3.5 shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase text-purple-700 block">
            {lang === 'mr' ? 'कालबाह्य जवळ (Expiry)' : 'Expiring <30 Days'}
          </span>
          <div className="text-2xl font-black text-purple-700 font-mono">{kpiStats.expiring}</div>
          <span className="text-[10px] text-purple-800 font-medium">प्रथम वापर प्राधान्य</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#CFD8DC]">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-[#1A4B8C] text-[#1A4B8C]'
              : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A]'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>{lang === 'mr' ? 'थेट साठा नोंदवही (Live Inventory)' : 'Facility Stock Registry'}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-[#546E7A]">
            {filteredStock.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('indents')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'indents'
              ? 'border-[#1A4B8C] text-[#1A4B8C]'
              : 'border-transparent text-[#546E7A] hover:text-[#1C2B3A]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{lang === 'mr' ? 'पुरवठा मागणीपत्रके (Requisition Indents)' : 'Reorder Indents & Supply Chain'}</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[10px] text-[#1A4B8C] font-mono">
            {indents.length}
          </span>
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          
          {/* Search and Facility Select Header */}
          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#546E7A] absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder={lang === 'mr' ? 'औषधाचे नाव किंवा बॅच नंबर शोधा...' : 'Search by medicine, salt, or batch...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C] bg-[#F8FAFC]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
              <div className="relative w-full sm:w-auto">
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="w-full sm:w-60 px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl text-[#1C2B3A] bg-white focus:outline-none focus:border-[#1A4B8C]"
                >
                  <option value="ALL">{lang === 'mr' ? 'सर्व आरोग्य केंद्रे (All)' : 'All Network Facilities'}</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>
                      {lang === 'mr' ? f.nameMr : f.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                {[
                  { id: 'ALL', mr: 'सर्व', en: 'All' },
                  { id: 'ADEQUATE', mr: 'उपलब्ध', en: 'Adequate' },
                  { id: 'LOW', mr: 'मर्यादित', en: 'Low' },
                  { id: 'CRITICAL', mr: 'अति-कमी', en: 'Critical' },
                  { id: 'OUT_OF_STOCK', mr: 'संपलेला', en: 'Out' },
                  { id: 'EXPIRING_SOON', mr: 'कालबाह्य', en: 'Expiring' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setFilterStatus(s.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      filterStatus === s.id
                        ? 'bg-[#1A4B8C] text-white'
                        : 'bg-slate-50 text-[#546E7A] hover:bg-slate-100 border border-[#CFD8DC]'
                    }`}
                  >
                    {lang === 'mr' ? s.mr : s.en}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-2xl border border-[#CFD8DC] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-[#CFD8DC] text-[#546E7A] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">{lang === 'mr' ? 'औषध व घटक' : 'Medicine & Generic Salt'}</th>
                    <th className="py-3 px-4">{lang === 'mr' ? 'आरोग्य केंद्र' : 'Facility'}</th>
                    <th className="py-3 px-4">{lang === 'mr' ? 'बॅच व कालबाह्यता' : 'Batch / Expiry'}</th>
                    <th className="py-3 px-4">{lang === 'mr' ? 'शिल्लक साठा' : 'Current Stock'}</th>
                    <th className="py-3 px-4">{lang === 'mr' ? 'दैनिक वापर / दिवस शिल्लक' : 'Daily Rate & Days Buffer'}</th>
                    <th className="py-3 px-4">{lang === 'mr' ? 'स्थिती' : 'Stock Tier'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'mr' ? 'कृती' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CFD8DC] text-[#1C2B3A]">
                  {filteredStock.map((item) => {
                    const med = catalog.find(m => m.id === item.medicineId);
                    if (!med) return null;

                    const daysBuffer = item.daysOfSupplyRemaining;
                    const bufferPercent = Math.min(100, Math.round((daysBuffer / 45) * 100));

                    return (
                      <tr key={`${item.facilityId}-${item.medicineId}`} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#1C2B3A]">
                            {lang === 'mr' ? med.nameMr : med.nameEn}
                          </div>
                          <div className="text-[11px] text-[#546E7A] mt-0.5">
                            {med.genericName} · <span className="font-semibold text-[#1A4B8C]">{med.program}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-[#546E7A]">
                          <div>{lang === 'mr' ? item.facilityNameMr : item.facilityName}</div>
                          <span className="text-[10px] text-[#78909C] uppercase">{item.facilityType}</span>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div className="text-[#1C2B3A] font-bold">{item.batchNumber}</div>
                          <div className={`text-[10px] ${
                            item.daysUntilExpiry <= 30 ? 'text-purple-700 font-bold' : 'text-[#78909C]'
                          }`}>
                            Exp: {item.expiryDate} ({item.daysUntilExpiry}d)
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold">
                          <div className="text-sm">
                            {item.currentStock} <span className="text-xs font-normal text-[#546E7A]">{lang === 'mr' ? item.unitMr : item.unit}</span>
                          </div>
                          <div className="text-[10px] text-[#78909C] font-normal">
                            Min Buffer: {med.minBufferThreshold}
                          </div>
                        </td>

                        <td className="py-3 px-4 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-[#546E7A]">~{med.dailyConsumptionEstimate}/day</span>
                            <span className={`font-mono font-bold ${
                              daysBuffer < 7 ? 'text-red-700' : daysBuffer < 30 ? 'text-amber-700' : 'text-green-700'
                            }`}>
                              {daysBuffer} {lang === 'mr' ? 'दिवस' : 'days'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                daysBuffer < 7 ? 'bg-red-500' : daysBuffer < 30 ? 'bg-amber-500' : 'bg-green-600'
                              }`}
                              style={{ width: `${bufferPercent}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1 ${
                            item.status === 'ADEQUATE' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : item.status === 'LOW'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : item.status === 'CRITICAL'
                                  ? 'bg-orange-50 text-orange-800 border border-orange-200'
                                  : item.status === 'EXPIRING_SOON'
                                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {item.status === 'ADEQUATE' && <CheckCircle2 className="w-3 h-3" />}
                            {item.status === 'LOW' && <AlertTriangle className="w-3 h-3" />}
                            {item.status === 'CRITICAL' && <AlertCircle className="w-3 h-3" />}
                            {item.status === 'EXPIRING_SOON' && <Clock className="w-3 h-3" />}
                            {item.status === 'OUT_OF_STOCK' && <XCircle className="w-3 h-3" />}
                            <span>{item.status.replace('_', ' ')}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2.5 py-1 bg-[#E8F0FE] hover:bg-blue-100 text-[#1A4B8C] font-bold rounded-lg text-xs transition"
                            >
                              {lang === 'mr' ? 'साठा नोंदवा' : 'Update'}
                            </button>
                            {(item.status === 'CRITICAL' || item.status === 'OUT_OF_STOCK' || item.status === 'LOW') && (
                              <button
                                onClick={() => handleGenerateEmergencyIndent(item.facilityId)}
                                className="p-1 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                title={lang === 'mr' ? 'मागणी करा' : 'Reorder Indent'}
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredStock.length === 0 && (
              <div className="p-8 text-center text-[#546E7A] space-y-1">
                <Pill className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-xs text-[#1C2B3A]">
                  {lang === 'mr' ? 'निवडलेल्या फिल्टरनुसार कोणताही साठा आढळला नाही.' : 'No medicine records match current filters.'}
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Indents Tab: Supply Chain and Requisitions */}
      {activeTab === 'indents' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#CFD8DC]">
            <div>
              <h3 className="text-sm font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'राज्य वखार मध्यवर्ती पुरवठा मागणीपत्रके' : 'Central Warehouse Replenishment Pipeline'}
              </h3>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {lang === 'mr' 
                  ? 'जिल्हा मध्यवर्ती औषध भांडार (औंध, पुणे) कडून थेट औषध पुरवठा ट्रॅकिंग' 
                  : 'Direct dispatch tracking from District Central Medical Store (Aundh, Pune)'}
              </p>
            </div>

            <button
              onClick={() => handleGenerateEmergencyIndent(selectedFacilityId === 'ALL' ? 'FAC-01' : selectedFacilityId)}
              className="px-4 py-2 bg-[#1A4B8C] hover:bg-[#0D3470] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'mr' ? 'नवीन मागणीपत्रक तयार करा' : 'Create New Indent'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {indents.map((indent) => (
              <div 
                key={indent.id}
                className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#CFD8DC]/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A4B8C] flex items-center justify-center font-mono font-bold text-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#1C2B3A]">{indent.indentNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          indent.urgency === 'CRITICAL_EMERGENCY'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {indent.urgency.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#546E7A] mt-0.5">
                        {indent.facilityName} · {indent.dateCreated}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1.5 ${
                      indent.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-[#1A4B8C]'
                    }`}>
                      <Package className="w-3.5 h-3.5" />
                      {indent.status}
                    </span>

                    {indent.status !== 'DELIVERED' && (
                      <button
                        onClick={() => handleMarkIndentDelivered(indent.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'साठा प्राप्त झाला (Replenish)' : 'Confirm Receipt'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Warehouse & Route Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-[#CFD8DC]/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#78909C] block">
                      {lang === 'mr' ? 'पुरवठादार वखार केंद्र' : 'Origin Warehouse'}
                    </span>
                    <strong className="text-[#1C2B3A]">{indent.warehouseDestination}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#78909C] block">
                      {lang === 'mr' ? 'वाहतूक व ट्रॅकिंग क्र.' : 'Transit & Tracking ID'}
                    </span>
                    <span className="font-mono text-[#1A4B8C] font-bold">{indent.trackingNumber || 'PENDING DISPATCH'}</span>
                  </div>
                </div>

                {/* Requested Items List */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase text-[#546E7A]">
                    {lang === 'mr' ? 'मागणी केलेली औषधे' : 'Requisitioned Items'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {indent.items.map((it, idx) => (
                      <div key={idx} className="p-2.5 bg-[#F8FAFC] border border-[#CFD8DC]/60 rounded-xl text-xs flex items-center justify-between">
                        <div>
                          <strong className="text-[#1C2B3A] block">{it.medicineName}</strong>
                          <span className="text-[10px] text-[#78909C]">
                            {lang === 'mr' ? 'सध्या शिल्लक:' : 'Current Stock:'} {it.currentStock} {it.unit}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-sm text-[#1A4B8C]">
                            +{it.requestedQuantity}
                          </span>
                          <span className="text-[10px] text-[#546E7A] block">{it.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* Stock Update Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#CFD8DC] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#CFD8DC]">
              <div>
                <h3 className="font-bold text-sm text-[#1C2B3A]">
                  {lang === 'mr' ? 'औषध साठा नोंद व अद्यतन' : 'Update Stock & Batch Registry'}
                </h3>
                <p className="text-xs text-[#546E7A] mt-0.5">
                  {editingItem.facilityName} · {editingItem.medicineId}
                </p>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-[#546E7A] hover:text-[#1C2B3A] p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStockUpdate} className="space-y-4">
              
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-[#1A4B8C] block">
                  {lang === 'mr' ? 'औषध:' : 'Medicine:'}
                </span>
                <strong className="text-sm text-[#1C2B3A]">
                  {catalog.find(m => m.id === editingItem.medicineId)?.nameEn}
                </strong>
                <p className="text-[11px] text-[#546E7A] mt-0.5">
                  {catalog.find(m => m.id === editingItem.medicineId)?.genericName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                    {lang === 'mr' ? 'नवीन साठा प्रमाण (Quantity)' : 'New Current Stock'}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      required
                      min={0}
                      value={newQty}
                      onChange={(e) => setNewQty(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono font-bold focus:outline-none focus:border-[#1A4B8C]"
                    />
                    <span className="ml-2 text-xs text-[#546E7A]">{editingItem.unit}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                    {lang === 'mr' ? 'बॅच नंबर (Batch No)' : 'Batch Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono focus:outline-none focus:border-[#1A4B8C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                    {lang === 'mr' ? 'कालबाह्य दिनांक (Expiry Date)' : 'Expiry Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl text-xs focus:outline-none focus:border-[#1A4B8C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                    {lang === 'mr' ? 'अद्यतनाचा प्रकार' : 'Adjustment Reason'}
                  </label>
                  <select
                    value={reasonOption}
                    onChange={(e) => setReasonOption(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl text-[#1C2B3A] bg-white focus:outline-none focus:border-[#1A4B8C]"
                  >
                    <option value="received">{lang === 'mr' ? 'नवीन साठा प्राप्त झाला (Receipt)' : 'Received New Batch'}</option>
                    <option value="dispensed">{lang === 'mr' ? 'रुग्णांना वाटप झाले (Dispensed)' : 'Prescription Dispensed'}</option>
                    <option value="audit">{lang === 'mr' ? 'प्रत्यक्ष साठा तपासणी (Reconciliation)' : 'Physical Inventory Count'}</option>
                    <option value="discard">{lang === 'mr' ? 'खराब / कालबाह्य नष्ट केले (Discard)' : 'Damaged / Discarded'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#CFD8DC]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-[#CFD8DC] text-xs font-bold text-[#546E7A] hover:bg-slate-50 rounded-xl transition"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'mr' ? 'नोंद साठवा' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
