import React, { useState } from 'react';
import { 
  ShieldAlert, 
  User, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  HeartPulse, 
  Baby, 
  AlertTriangle,
  Building2,
  PhoneCall
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  RiskEngineService, 
  ClinicalRiskCategory, 
  HighRiskPatient 
} from '../../services/riskEngine';

interface RiskFlagFormProps {
  onSuccess?: (patient: HighRiskPatient) => void;
  onCancel?: () => void;
}

export default function RiskFlagForm({ onSuccess, onCancel }: RiskFlagFormProps) {
  const { lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Demographics
  const [nameMr, setNameMr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [phone, setPhone] = useState('9822304912');
  const [village, setVillage] = useState('वडगाव रासाई (Vadgaon)');
  const [abhaId, setAbhaId] = useState(`MH-PN-24-${Math.floor(10000000 + Math.random() * 90000000)}`);

  // Step 2: Risk Classification
  const [category, setCategory] = useState<ClinicalRiskCategory>('PREGNANT');
  const [severity, setSeverity] = useState<'MODERATE' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [riskFactorTextMr, setRiskFactorTextMr] = useState('');
  const [riskFactorTextEn, setRiskFactorTextEn] = useState('');
  const [dangerSignTextMr, setDangerSignTextMr] = useState('');
  const [dangerSignTextEn, setDangerSignTextEn] = useState('');
  const [bp, setBp] = useState('134/88');
  const [sugar, setSugar] = useState('');
  const [hb, setHb] = useState('10.2');
  const [weight, setWeight] = useState('56');
  const [muac, setMuac] = useState('');

  // Step 3: Assignment & Care Plan
  const [assignedAshaName, setAssignedAshaName] = useState('सुमन ताई पाटील (Suman Tai)');
  const [assignedAshaPhone, setAssignedAshaPhone] = useState('9423180912');
  const [assignedPhcName, setAssignedPhcName] = useState('PHC Shirur');
  const [assignedPhcNameMr, setAssignedPhcNameMr] = useState('प्राथमिक आरोग्य केंद्र शिरूर');
  const [assignedDoctorName, setAssignedDoctorName] = useState('डॉ. मीरा देशमुख (Medical Officer)');
  const [followUpDays, setFollowUpDays] = useState<number>(7);
  const [nextDate, setNextDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const categoriesList: { id: ClinicalRiskCategory; mr: string; en: string }[] = [
    { id: 'PREGNANT', mr: 'गर्भवती माता (High-Risk ANC)', en: 'Maternal ANC' },
    { id: 'NEWBORN', mr: 'नवजात बालक व कमी वजन (Neonatal)', en: 'High-Risk Infant' },
    { id: 'DIABETES', mr: 'अनियंत्रित मधुमेह (Type 2 Diabetes)', en: 'Diabetes' },
    { id: 'HYPERTENSION', mr: 'तीव्र उच्च रक्तदाब (Hypertension)', en: 'Hypertension' },
    { id: 'TUBERCULOSIS', mr: 'क्षयरोग (TB DOTS Program)', en: 'Tuberculosis' },
    { id: 'MENTAL_HEALTH', mr: 'मानसोपचार व फेफरे (Mental Health)', en: 'Mental Health' },
    { id: 'MALNUTRITION', mr: 'अति-तीव्र बाल कुपोषण (SAM / MAM)', en: 'Malnutrition' },
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!nameMr && !nameEn) {
        alert(lang === 'mr' ? 'कृपया रुग्णाचे नाव प्रविष्ट करा.' : 'Please enter patient name.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const catObj = categoriesList.find(c => c.id === category);

    const newPt = RiskEngineService.flagNewPatient({
      abhaId,
      nameEn: nameEn || nameMr,
      nameMr: nameMr || nameEn,
      age: Number(age),
      gender,
      phone,
      village,
      block: 'शिरूर (Shirur)',
      district: 'पुणे (Pune)',
      category,
      categoryLabelEn: catObj?.en || 'High-Risk',
      categoryLabelMr: catObj?.mr || 'उच्च जोखीम',
      severity,
      clinicalRiskFactorsEn: riskFactorTextEn ? [riskFactorTextEn] : ['High clinical risk verified during OPD'],
      clinicalRiskFactorsMr: riskFactorTextMr ? [riskFactorTextMr] : ['बाह्यरुग्ण तपासणीत उच्च जोखीम नोंदवली'],
      dangerSignsEn: dangerSignTextEn ? [dangerSignTextEn] : ['Monitor daily symptoms'],
      dangerSignsMr: dangerSignTextMr ? [dangerSignTextMr] : ['दररोज लक्षणांची पाहणी आवश्यक'],
      assignedAshaName,
      assignedAshaPhone,
      assignedPhcName,
      assignedPhcNameMr,
      assignedDoctorName,
      registrationDate: new Date().toISOString().split('T')[0],
      lastVisitDate: new Date().toISOString().split('T')[0],
      nextFollowUpDate: nextDate,
      adherencePercentage: 100,
      status: 'ACTIVE',
      vitalsSnapshot: {
        bp: bp ? `${bp} mmHg` : undefined,
        bloodSugar: sugar ? `${sugar} mg/dL` : undefined,
        hb: hb ? `${hb} g/dL` : undefined,
        weight: weight ? `${weight} kg` : undefined,
        muacMm: muac ? Number(muac) : undefined
      }
    });

    if (onSuccess) onSuccess(newPt);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#CFD8DC] p-6 shadow-sm max-w-3xl mx-auto space-y-6">
      
      {/* Wizard Step Progress */}
      <div className="border-b border-[#CFD8DC] pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-[#1C2B3A]">
              {lang === 'mr' ? 'नवीन उच्च जोखीम रुग्ण नोंदणी (Flag Patient)' : 'Flag New High-Risk Patient'}
            </h3>
            <p className="text-xs text-[#546E7A] mt-0.5">
              {lang === 'mr' 
                ? 'क्लिनिकल मार्गदर्शक तत्त्वांच्या आधारे रुग्णास सक्रिय दक्षता यादीत समाविष्ट करा' 
                : 'Enroll patient into active surveillance with automated ASHA & PHC follow-up protocols'}
            </p>
          </div>

          <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 text-[#1A4B8C] rounded-lg">
            {lang === 'mr' ? `टप्पा ${currentStep} पैकी ३` : `Step ${currentStep} of 3`}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? 'bg-[#1A4B8C]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? 'bg-[#1A4B8C]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full transition-all ${currentStep >= 3 ? 'bg-[#1A4B8C]' : 'bg-slate-200'}`} />
        </div>
      </div>

      {/* Step 1: Patient Demographics */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
            {lang === 'mr' ? '१. रुग्ण ओळख व लोकसंख्याशास्त्रीय माहिती' : '1. Patient Identity & Demographics'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'रुग्णाचे नाव (मराठीत)' : 'Patient Name (Marathi)'}
              </label>
              <input
                type="text"
                required
                placeholder="उदा. मंदाकिनी सुरेश शिंदे"
                value={nameMr}
                onChange={(e) => setNameMr(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'रुग्णाचे नाव (इंग्रजीत)' : 'Patient Name (English)'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mandakini Suresh Shinde"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'वय (वर्षे)' : 'Age (Years)'}
              </label>
              <input
                type="number"
                min={0}
                max={110}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'लिंग (Gender)' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl bg-white focus:outline-none focus:border-[#1A4B8C]"
              >
                <option value="Female">{lang === 'mr' ? 'स्त्री (Female)' : 'Female'}</option>
                <option value="Male">{lang === 'mr' ? 'पुरुष (Male)' : 'Male'}</option>
                <option value="Other">{lang === 'mr' ? 'इतर (Other)' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'मोबाईल नंबर' : 'Phone Number'}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'गाव / पाडा (Village)' : 'Village'}
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'आभा ओळख क्रमांक (ABHA ID)' : 'ABHA ID'}
              </label>
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>
          </div>

        </div>
      )}

      {/* Step 2: Clinical Risk Classification */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
            {lang === 'mr' ? '२. क्लिनिकल जोखीम वर्ग व तीव्रता' : '2. Clinical Risk Cohort & Severity'}
          </h4>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-2">
              {lang === 'mr' ? 'जोखीम प्रवर्ग निवडा' : 'Select High-Risk Cohort'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoriesList.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                    category === cat.id
                      ? 'bg-[#E8F0FE] border-[#1A4B8C] text-[#1A4B8C] ring-1 ring-[#1A4B8C]'
                      : 'bg-white border-[#CFD8DC] text-[#1C2B3A] hover:bg-slate-50'
                  }`}
                >
                  <span>{lang === 'mr' ? cat.mr : cat.en}</span>
                  {category === cat.id && <CheckCircle2 className="w-4 h-4 text-[#1A4B8C]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1.5">
              {lang === 'mr' ? 'तीव्रता पातळी (Severity Grading)' : 'Clinical Severity'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'MODERATE', mr: 'मध्यम (Moderate)', en: 'Moderate', color: 'border-yellow-300' },
                { id: 'HIGH', mr: 'उच्च (High)', en: 'High', color: 'border-amber-400' },
                { id: 'CRITICAL', mr: 'अति-तीव्र (Critical)', en: 'Critical', color: 'border-red-500' },
              ].map(sev => (
                <button
                  key={sev.id}
                  type="button"
                  onClick={() => setSeverity(sev.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    severity === sev.id
                      ? sev.id === 'CRITICAL' ? 'bg-red-600 text-white border-red-600' : 'bg-[#1A4B8C] text-white border-[#1A4B8C]'
                      : 'bg-white text-[#546E7A] border-[#CFD8DC] hover:bg-slate-50'
                  }`}
                >
                  {lang === 'mr' ? sev.mr : sev.en}
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Risk Factors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'जोखीम कारण (मराठीत)' : 'Risk Factor (Marathi)'}
              </label>
              <input
                type="text"
                placeholder="उदा. गरोदरपण ७वा महिना, अशक्तपणा Hb 10.2"
                value={riskFactorTextMr}
                onChange={(e) => setRiskFactorTextMr(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'जोखीम कारण (इंग्रजीत)' : 'Risk Factor (English)'}
              </label>
              <input
                type="text"
                placeholder="e.g. 7th Month Gestation, Mild Anemia"
                value={riskFactorTextEn}
                onChange={(e) => setRiskFactorTextEn(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>
          </div>

          {/* Measured Vitals Row */}
          <div className="p-3 bg-slate-50 rounded-xl border border-[#CFD8DC] space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#546E7A] block">
              {lang === 'mr' ? 'सध्याची शारीरिक मापे (Vitals Snapshot):' : 'Current Vitals Snapshot:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-[#78909C] block">BP (mmHg)</label>
                <input
                  type="text"
                  placeholder="130/84"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full p-1.5 text-xs border border-[#CFD8DC] rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#78909C] block">Blood Sugar</label>
                <input
                  type="text"
                  placeholder="mg/dL"
                  value={sugar}
                  onChange={(e) => setSugar(e.target.value)}
                  className="w-full p-1.5 text-xs border border-[#CFD8DC] rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#78909C] block">Hb (g/dL)</label>
                <input
                  type="text"
                  placeholder="10.2"
                  value={hb}
                  onChange={(e) => setHb(e.target.value)}
                  className="w-full p-1.5 text-xs border border-[#CFD8DC] rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#78909C] block">Weight (kg)</label>
                <input
                  type="text"
                  placeholder="56"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-1.5 text-xs border border-[#CFD8DC] rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Step 3: Assignment & Care Plan */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
            {lang === 'mr' ? '३. आशा कार्यकर्ती वाटप व भेटीचे नियोजन' : '3. ASHA Worker Assignment & Care Plan'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'नियुक्त आशा कार्यकर्ती' : 'Assigned ASHA Worker'}
              </label>
              <select
                value={assignedAshaName}
                onChange={(e) => {
                  setAssignedAshaName(e.target.value);
                  if (e.target.value.includes('सुमन')) setAssignedAshaPhone('9423180912');
                  else if (e.target.value.includes('छाया')) setAssignedAshaPhone('9423991200');
                  else setAssignedAshaPhone('9423554411');
                }}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl bg-white focus:outline-none focus:border-[#1A4B8C]"
              >
                <option value="सुमन ताई पाटील (Suman Tai)">सुमन ताई पाटील (वडगाव / Vadgaon)</option>
                <option value="छाया शिंदे (Chhaya Shinde)">छाया शिंदे (टाकळी / Takli)</option>
                <option value="रेखा शिंदे (Rekha Shinde)">रेखा शिंदे (मांडवगण / Mandavgan)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'आशा कार्यकर्तीचा फोन' : 'ASHA Phone'}
              </label>
              <input
                type="tel"
                value={assignedAshaPhone}
                onChange={(e) => setAssignedAshaPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl font-mono focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'संबंधित आरोग्य केंद्र' : 'Attached Health Center'}
              </label>
              <input
                type="text"
                value={lang === 'mr' ? assignedPhcNameMr : assignedPhcName}
                onChange={(e) => setAssignedPhcName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'तपासणारे वैद्यकीय अधिकारी' : 'Attending Medical Officer'}
              </label>
              <input
                type="text"
                value={assignedDoctorName}
                onChange={(e) => setAssignedDoctorName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'गृहभेटीची वारंवारता' : 'Home Visit Frequency'}
              </label>
              <select
                value={followUpDays}
                onChange={(e) => {
                  const days = Number(e.target.value);
                  setFollowUpDays(days);
                  const d = new Date();
                  d.setDate(d.getDate() + days);
                  setNextDate(d.toISOString().split('T')[0]);
                }}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl bg-white focus:outline-none focus:border-[#1A4B8C]"
              >
                <option value={3}>{lang === 'mr' ? 'दर ३ दिवसांनी (अति-दक्षता)' : 'Every 3 Days (Critical)'}</option>
                <option value={7}>{lang === 'mr' ? 'साप्ताहिक (दर ७ दिवसांनी)' : 'Weekly (Every 7 Days)'}</option>
                <option value={14}>{lang === 'mr' ? 'पंधरवड्याला (१४ दिवस)' : 'Bi-Weekly (Every 14 Days)'}</option>
                <option value={30}>{lang === 'mr' ? 'मासिक (३० दिवस)' : 'Monthly (Every 30 Days)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#546E7A] mb-1">
                {lang === 'mr' ? 'पहिल्या भेटीची निश्चित तारीख' : 'First Follow-Up Date'}
              </label>
              <input
                type="date"
                required
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CFD8DC] rounded-xl focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>
          </div>

          {/* Auto escalation notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#1A4B8C] shrink-0 mt-0.5" />
            <span>
              {lang === 'mr' 
                ? 'नियम: भेट तारीख उलटून गेल्यास पहिल्या दिवशी आशा कार्यकर्तीला SMS, ३ऱ्या दिवशी प्राथमिक आरोग्य केंद्राच्या वैद्यकीय अधिकाऱ्यांना, व ७व्या दिवशी जिल्हा शल्यचिकित्सकांना स्वयंचलित अलर्ट जाईल.'
                : 'Escalation Rule: If the visit is missed, automated SMS dispatches to ASHA on Day 1, PHC Medical Officer on Day 3, and District Admin on Day 7.'}
            </span>
          </div>

        </div>
      )}

      {/* Navigation and Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#CFD8DC]">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
            className="px-4 py-2 border border-[#CFD8DC] text-xs font-bold text-[#546E7A] hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'मागील टप्पा' : 'Previous'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[#CFD8DC] text-xs font-bold text-[#546E7A] hover:bg-slate-50 rounded-xl transition"
          >
            {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
          </button>
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 bg-[#1A4B8C] hover:bg-[#0D3470] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <span>{lang === 'mr' ? 'पुढील टप्पा' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'mr' ? 'रुग्ण दक्षता यादीत जोडा' : 'Confirm & Enroll Patient'}</span>
          </button>
        )}
      </div>

    </div>
  );
}
