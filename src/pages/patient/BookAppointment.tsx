import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Stethoscope, 
  CheckCircle2, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  Tv, 
  AlertCircle, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Thermometer, 
  Activity, 
  Heart, 
  Baby, 
  Syringe, 
  Sparkles, 
  QrCode, 
  X, 
  Star, 
  Info, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  queueEngine, 
  SEED_HEALTH_CENTERS, 
  SEED_DOCTORS, 
  HealthCenterModel, 
  DoctorModel, 
  AppointmentModel 
} from '../../services/queueEngine';
import { queueNotificationService } from '../../services/queueNotificationService';

export default function BookAppointment() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  // 4-step wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Selection state
  const [selectedCenter, setSelectedCenter] = useState<HealthCenterModel | null>(SEED_HEALTH_CENTERS[0]);
  const [centerFilterType, setCenterFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('General Medicine');

  // Step 2: Calendar & Time Slots
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorModel | null>(SEED_DOCTORS[0]);
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string; availableSeats: number; maxPatients: number } | null>(null);

  // Step 3: Patient Form
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [abhaId, setAbhaId] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<AppointmentModel['type']>('regular');
  const [address, setAddress] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [isAshaAssisted, setIsAshaAssisted] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Modals & Confirmation
  const [bookingResult, setBookingResult] = useState<AppointmentModel | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showTrackModal, setShowTrackModal] = useState<boolean>(false);
  const [trackQuery, setTrackQuery] = useState<string>('');
  const [trackResults, setTrackResults] = useState<AppointmentModel[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync default slot on mount
  useEffect(() => {
    if (selectedDoctor && selectedDoctor.schedule[0]?.slots[0]) {
      const s = selectedDoctor.schedule[0].slots[0];
      setSelectedSlot({
        startTime: s.startTime,
        endTime: s.endTime,
        availableSeats: s.maxPatients - s.bookedPatients,
        maxPatients: s.maxPatients
      });
    }
  }, [selectedDoctor]);

  // Filter Centers
  const filteredCenters = SEED_HEALTH_CENTERS.filter(center => {
    const matchesType = centerFilterType === 'all' || center.type === centerFilterType;
    const matchesQuery = !searchQuery || 
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.location.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.location.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.location.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  // Calendar helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const now = new Date();
    if (prev.getMonth() >= now.getMonth() || prev.getFullYear() > now.getFullYear()) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  // Symptoms list with Lucide icon references
  const SYMPTOM_OPTIONS = [
    { label: isMr ? 'ताप (Fever)' : 'Fever', icon: Thermometer },
    { label: isMr ? 'खोकला (Cough)' : 'Cough', icon: Activity },
    { label: isMr ? 'अंगदुखी (Body Pain)' : 'Body Pain', icon: Heart },
    { label: isMr ? 'उलटी (Vomiting)' : 'Vomiting', icon: AlertCircle },
    { label: isMr ? 'डोकेदुखी (Headache)' : 'Headache', icon: AlertTriangle },
    { label: isMr ? 'प्रसूतीपूर्व (Antenatal)' : 'Antenatal Checkup', icon: Baby },
    { label: isMr ? 'बाल लसीकरण (Vaccine)' : 'Child Vaccination', icon: Syringe },
    { label: isMr ? 'रक्तदाब तपासणी (BP Check)' : 'Hypertension / BP', icon: Stethoscope },
  ];

  const toggleSymptom = (label: string) => {
    if (selectedSymptoms.includes(label)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== label));
    } else {
      setSelectedSymptoms([...selectedSymptoms, label]);
    }
  };

  // Validation before step transition
  const validateAndNext = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!selectedCenter) {
        setErrorMessage(isMr ? 'कृपया एक आरोग्य केंद्र निवडा' : 'Please select a health center');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedSlot) {
        setErrorMessage(isMr ? 'कृपया उपलब्ध वेळ निवडा' : 'Please select an appointment time slot');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!patientName.trim()) {
        setErrorMessage(isMr ? 'कृपया रुग्णाचे नाव प्रविष्ट करा' : 'Please enter patient full name');
        return;
      }
      if (!patientPhone.trim() || patientPhone.replace(/\D/g, '').length !== 10) {
        setErrorMessage(isMr ? 'कृपया वैध १० अंकी मोबाईल क्रमांक टाका' : 'Please enter a valid 10-digit mobile number');
        return;
      }
      if (!patientAge || parseInt(patientAge) <= 0) {
        setErrorMessage(isMr ? 'कृपया रुग्णाचे वय प्रविष्ट करा' : 'Please enter patient age');
        return;
      }
      setCurrentStep(4);
    }
  };

  // Submit Booking
  const handleConfirmBooking = () => {
    if (!agreeTerms) {
      setErrorMessage(isMr ? 'कृपया नियमावली मान्य करा' : 'Please agree to the appointment terms');
      return;
    }
    if (!selectedCenter || !selectedSlot) return;

    const newApt = queueEngine.bookAppointment({
      patient: {
        name: patientName.trim(),
        phone: patientPhone.trim(),
        age: parseInt(patientAge) || 30,
        gender: patientGender,
        abhaId: abhaId.trim() || undefined,
        address: address.trim() || undefined
      },
      healthCenterId: selectedCenter._id,
      healthCenterName: selectedCenter.name,
      doctorId: selectedDoctor?._id,
      doctorName: selectedDoctor?.name,
      department: selectedDepartment,
      appointmentDate: selectedDate.toISOString(),
      timeSlot: {
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      },
      type: appointmentType,
      priority: appointmentType === 'emergency' ? 'emergency' : 'normal',
      symptoms: selectedSymptoms,
      chiefComplaint: chiefComplaint.trim() || undefined,
      isAshaAssisted
    });

    setBookingResult(newApt);
    setShowSuccessModal(true);

    // Simulated SMS dispatch
    queueNotificationService.logSimulatedSMS(
      'BOOKING_CONFIRMATION',
      patientPhone,
      `Your appointment ${newApt.appointmentId} at ${selectedCenter.name} is confirmed for ${new Date(selectedDate).toLocaleDateString()} at ${selectedSlot.startTime}.`
    );
  };

  // Track appointments handler
  const handleSearchTracking = () => {
    if (!trackQuery.trim()) return;
    const results = queueEngine.getAppointments(undefined, trackQuery);
    setTrackResults(results);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* Top Header & Fast Action Bar */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#1A4B8C] text-white flex items-center justify-center font-bold shadow-xs">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1C2B3A]">
                {isMr ? 'अपॉइंटमेंट व रांग व्यवस्थापन प्रणाली' : 'Appointment & Queue Management'}
              </h1>
              <p className="text-xs text-[#546E7A] mt-0.5">
                {isMr ? 'वेळ निश्चित करा · रांगेत तासनतास थांबणे टाळा · थेट टोकन मिळवा' : 'Book in Advance · Avoid 4-Hour Queues · Live Token Tracking'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowTrackModal(true)}
              className="px-4 py-2 rounded-xl border border-[#1A4B8C] text-[#1A4B8C] hover:bg-blue-50 text-xs font-bold transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{isMr ? 'अपॉइंटमेंट शोधा' : 'Track Booking'}</span>
            </button>
            <button
              onClick={() => navigate('/queue-display')}
              className="px-4 py-2 rounded-xl bg-[#0B2545] text-white hover:bg-[#1A4B8C] text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Tv className="w-4 h-4" />
              <span>{isMr ? 'थेट क्लिनिक टीव्ही स्क्रीन' : 'Live Clinic TV'}</span>
            </button>
            <button
              onClick={() => navigate('/health-center/queue')}
              className="px-4 py-2 rounded-xl bg-[#10B981] text-white hover:bg-emerald-600 text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{isMr ? 'स्टाफ डॅशबोर्ड' : 'Staff Queue'}</span>
            </button>
          </div>
        </div>

        {/* 4-Step Progress Indicator Bar */}
        <div className="bg-white rounded-2xl border border-[#CFD8DC] p-4 shadow-xs">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {[
              { num: 1, titleMr: 'केंद्र निवडा', titleEn: 'Select Center' },
              { num: 2, titleMr: 'तारीख व वेळ', titleEn: 'Date & Time' },
              { num: 3, titleMr: 'रुग्ण तपशील', titleEn: 'Patient Info' },
              { num: 4, titleMr: 'खात्री करा', titleEn: 'Confirm' }
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                    currentStep === step.num 
                      ? 'bg-[#1A4B8C] text-white ring-4 ring-blue-100' 
                      : currentStep > step.num 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#ECEFF1] text-[#78909C]'
                  }`}>
                    {currentStep > step.num ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap ${
                    currentStep === step.num ? 'text-[#1A4B8C]' : 'text-[#78909C]'
                  }`}>
                    {isMr ? step.titleMr : step.titleEn}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 mx-3 -mt-4 transition ${
                    currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-[#CFD8DC]'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================== */}
        {/* STEP 1: SELECT HEALTH CENTER */}
        {/* ========================================================== */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1A4B8C]" />
                <span>{isMr ? '१. आरोग्य केंद्र निवडा' : '1. Select Health Center'}</span>
              </h2>
              <p className="text-xs text-[#546E7A] mt-1">
                {isMr ? 'तुमच्या जवळील उपकेंद्र, प्राथमिक आरोग्य केंद्र किंवा ग्रामीण रुग्णालय निवडा' : 'Choose the medical facility closest to your village or town'}
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', mr: 'सर्व (All)', en: 'All' },
                { id: 'sub-centre', mr: 'उपकेंद्र (Sub-Centre)', en: 'Sub-Centre' },
                { id: 'phc', mr: 'प्राथमिक आरोग्य केंद्र (PHC)', en: 'PHC' },
                { id: 'rural-hospital', mr: 'ग्रामीण रुग्णालय (RH)', en: 'Rural Hospital' },
                { id: 'district-hospital', mr: 'जिल्हा रुग्णालय (DH)', en: 'District Hospital' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCenterFilterType(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                    centerFilterType === f.id
                      ? 'bg-[#1A4B8C] border-[#1A4B8C] text-white shadow-xs'
                      : 'bg-white border-[#CFD8DC] text-[#546E7A] hover:bg-slate-50'
                  }`}
                >
                  {isMr ? f.mr : f.en}
                </button>
              ))}
            </div>

            {/* Search Bar & Department Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-[#78909C] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isMr ? 'गाव, तालुका, जिल्हा किंवा केंद्राचे नाव शोधा...' : 'Search by village, block, district or health center name...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:outline-none focus:border-[#1A4B8C] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8DC] text-xs font-semibold text-[#1C2B3A] bg-white focus:outline-none focus:border-[#1A4B8C]"
                >
                  <option value="General Medicine">{isMr ? 'सामान्य बाह्यरुग्ण (General OPD)' : 'General Medicine / OPD'}</option>
                  <option value="Maternal & Antenatal">{isMr ? 'प्रसूती व माता आरोग्य (Maternity/ANC)' : 'Maternal & Antenatal'}</option>
                  <option value="Pediatrics & Immunization">{isMr ? 'बालरोग व लसीकरण (Pediatrics)' : 'Pediatrics & Immunization'}</option>
                  <option value="NCD Clinic">{isMr ? 'मधुमेह व रक्तदाब (NCD Clinic)' : 'NCD Clinic (Diabetes/BP)'}</option>
                </select>
              </div>
            </div>

            {/* Centers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCenters.map(center => {
                const isSelected = selectedCenter?._id === center._id;
                const queuePercent = (center.currentQueueCount / center.totalDailyCapacity) * 100;
                const queueBadgeClass = queuePercent < 30 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  queuePercent < 70 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200';
                const queueText = queuePercent < 30 ? (isMr ? 'कमी गर्दी (Low)' : 'Low Wait') :
                  queuePercent < 70 ? (isMr ? 'मध्यम गर्दी (Moderate)' : 'Moderate Wait') : (isMr ? 'जास्त गर्दी (High)' : 'Busy Queue');

                return (
                  <div
                    key={center._id}
                    onClick={() => setSelectedCenter(center)}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer relative ${
                      isSelected 
                        ? 'border-[#1A4B8C] bg-[#E8F0FE]/40 shadow-xs' 
                        : 'border-[#E0E0E0] hover:border-blue-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1A4B8C]">
                          {isMr ? center.typeLabelMr : center.typeLabel}
                        </span>
                        <h3 className="text-sm font-bold text-[#1C2B3A] mt-1.5">{center.name}</h3>
                        <p className="text-xs text-[#546E7A] flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#78909C] shrink-0" />
                          <span>{center.location.village}, {center.location.block}, {center.location.district}</span>
                        </p>
                      </div>

                      <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold shrink-0 text-center ${queueBadgeClass}`}>
                        <div>{queueText}</div>
                        <div className="text-[10px] font-normal opacity-90">{center.currentQueueCount} {isMr ? 'रांगेत' : 'in queue'}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                      {center.facilities.slice(0, 4).map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-[#546E7A] rounded-md font-medium">
                          {f}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-1">
                      <span className="flex items-center gap-1 text-[#546E7A]">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-semibold">{center.rating}</span>
                        <span className="text-[10px] text-slate-400">({center.totalReviews})</span>
                      </span>
                      <span className="text-[#1A4B8C] font-bold text-xs flex items-center gap-1">
                        {isSelected ? (isMr ? 'निवडलेले' : 'Selected') : (isMr ? 'निवड करा' : 'Select')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* STEP 2: DATE & TIME SELECTION */}
        {/* ========================================================== */}
        {currentStep === 2 && selectedCenter && (
          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#1A4B8C]" />
                  <span>{isMr ? '२. तारीख व वेळ निवडा' : '2. Choose Date & Time Slot'}</span>
                </h2>
                <p className="text-xs text-[#546E7A] mt-1">
                  {selectedCenter.name} · {selectedDepartment}
                </p>
              </div>

              <div className="text-xs font-semibold px-3 py-1 bg-blue-50 text-[#1A4B8C] rounded-lg">
                {isMr ? 'अंदाजे वेळ: १०-१५ मिनिटे / रुग्ण' : 'Avg Time: 10-15 min / patient'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left: Interactive Month Calendar */}
              <div className="md:col-span-6 bg-slate-50 p-4 rounded-xl border border-[#E0E0E0]">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-white border border-[#CFD8DC]">
                    <ChevronLeft className="w-4 h-4 text-[#546E7A]" />
                  </button>
                  <span className="text-xs font-bold text-[#1C2B3A]">
                    {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={handleNextMonth} className="p-1 rounded hover:bg-white border border-[#CFD8DC]">
                    <ChevronRight className="w-4 h-4 text-[#546E7A]" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <span key={d} className="text-[10px] font-bold text-[#78909C] py-1">{d}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-9" />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                    const dayNumber = i + 1;
                    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
                    const isToday = isSameDay(dateObj, new Date());
                    const isSelected = isSameDay(dateObj, selectedDate);
                    const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
                    const isSunday = dateObj.getDay() === 0;

                    return (
                      <button
                        key={dayNumber}
                        disabled={isPast || isSunday}
                        onClick={() => setSelectedDate(dateObj)}
                        className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition relative ${
                          isSelected
                            ? 'bg-[#1A4B8C] text-white shadow-xs'
                            : isToday
                              ? 'border-2 border-[#1A4B8C] text-[#1A4B8C] bg-white'
                              : isPast || isSunday
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'hover:bg-blue-100 bg-white text-[#1C2B3A]'
                        }`}
                      >
                        {dayNumber}
                        {!isPast && !isSunday && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-emerald-500 absolute bottom-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Doctor & Time Slots */}
              <div className="md:col-span-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#1C2B3A] block mb-2">
                    {isMr ? 'उपलब्ध वैद्यकीय अधिकारी (Doctor)' : 'Available Doctor'}
                  </label>
                  <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1A4B8C] text-white flex items-center justify-center font-bold">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1C2B3A]">
                        {isMr ? selectedDoctor?.nameMr : selectedDoctor?.name}
                      </div>
                      <div className="text-[11px] text-[#546E7A]">
                        {isMr ? selectedDoctor?.specializationMr : selectedDoctor?.specialization} · Reg: {selectedDoctor?.registrationNumber}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1C2B3A] block mb-2">
                    {isMr ? 'वेळ निवडा (Select Time Slot)' : 'Select Time Slot'}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {selectedDoctor?.schedule[0]?.slots.map((slot, i) => {
                      const isSlotSelected = selectedSlot?.startTime === slot.startTime;
                      const available = slot.maxPatients - slot.bookedPatients;
                      const isFull = available <= 0;

                      return (
                        <button
                          key={i}
                          disabled={isFull}
                          onClick={() => setSelectedSlot({
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            availableSeats: available,
                            maxPatients: slot.maxPatients
                          })}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            isSlotSelected 
                              ? 'bg-[#1A4B8C] border-[#1A4B8C] text-white shadow-xs' 
                              : isFull 
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                                : 'bg-white border-[#CFD8DC] hover:border-blue-300 text-[#1C2B3A]'
                          }`}
                        >
                          <div className="text-xs font-bold">{slot.startTime} - {slot.endTime}</div>
                          <div className={`text-[10px] mt-0.5 font-medium ${
                            isSlotSelected ? 'text-blue-100' : isFull ? 'text-slate-400' : 'text-emerald-600'
                          }`}>
                            {isFull ? (isMr ? 'जागा पूर्ण' : 'Full') : `${available} ${isMr ? 'जागा शिल्लक' : 'slots left'}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* STEP 3: PATIENT DETAILS */}
        {/* ========================================================== */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                <User className="w-5 h-5 text-[#1A4B8C]" />
                <span>{isMr ? '३. रुग्ण तपशील व लक्षणे' : '3. Patient Details & Symptoms'}</span>
              </h2>
              <p className="text-xs text-[#546E7A] mt-1">
                {isMr ? 'अपॉइंटमेंट एसएमएस व टोकन माहिती या क्रमांकावर पाठवली जाईल' : 'SMS confirmation and real-time token alerts will be dispatched to this phone'}
              </p>
            </div>

            {/* Quick Summary Strip */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#1C2B3A]">
              <div>
                <span className="text-[#546E7A]">{isMr ? 'केंद्र: ' : 'Center: '}</span>
                <span className="font-bold">{selectedCenter?.name}</span>
              </div>
              <div>
                <span className="text-[#546E7A]">{isMr ? 'दिनांक: ' : 'Date: '}</span>
                <span className="font-bold">{selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>
              <div>
                <span className="text-[#546E7A]">{isMr ? 'वेळ: ' : 'Time: '}</span>
                <span className="font-bold">{selectedSlot?.startTime}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#1C2B3A] block mb-1.5">
                  {isMr ? 'रुग्णाचे पूर्ण नाव *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder={isMr ? 'उदा. रमेश विठ्ठल शिंदे' : 'e.g. Ramesh Vitthal Shinde'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:outline-none focus:border-[#1A4B8C]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C2B3A] block mb-1.5">
                  {isMr ? '१०-अंकी मोबाईल नंबर *' : 'Mobile Number (10 Digits) *'}
                </label>
                <div className="flex">
                  <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-[#CFD8DC] rounded-l-xl text-xs font-bold text-[#546E7A]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-r-xl border border-[#CFD8DC] text-xs font-medium focus:outline-none focus:border-[#1A4B8C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C2B3A] block mb-1.5">
                  {isMr ? 'वय *' : 'Age *'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:outline-none focus:border-[#1A4B8C]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C2B3A] block mb-1.5">
                  {isMr ? 'लिंग *' : 'Gender *'}
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as 'male' | 'female' | 'other')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8DC] text-xs font-semibold text-[#1C2B3A] bg-white focus:outline-none focus:border-[#1A4B8C]"
                >
                  <option value="male">{isMr ? 'पुरुष (Male)' : 'Male'}</option>
                  <option value="female">{isMr ? 'महिला (Female)' : 'Female'}</option>
                  <option value="other">{isMr ? 'इतर (Other)' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C2B3A] block mb-1.5">
                  {isMr ? 'आभा आयडी (ABHA ID - ऐच्छिक)' : 'ABHA Health ID (Optional)'}
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="91-XXXX-XXXX-XXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:outline-none focus:border-[#1A4B8C]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C2B3A] block mb-1.5">
                  {isMr ? 'अपॉइंटमेंट प्रकार' : 'Appointment Type'}
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as AppointmentModel['type'])}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8DC] text-xs font-semibold text-[#1C2B3A] bg-white focus:outline-none focus:border-[#1A4B8C]"
                >
                  <option value="regular">{isMr ? 'सामान्य तपासणी (Regular OPD)' : 'Regular Consultation'}</option>
                  <option value="follow-up">{isMr ? 'पुढील तपासणी (Follow-up)' : 'Follow-up Visit'}</option>
                  <option value="emergency">{isMr ? 'तातडीचे / गंभीर (Urgent Triage)' : 'Emergency / Urgent Triage'}</option>
                  <option value="antenatal">{isMr ? 'प्रसूतीपूर्व तपासणी (ANC)' : 'Antenatal Checkup'}</option>
                  <option value="immunization">{isMr ? 'लसीकरण (Immunization)' : 'Immunization'}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-[#1C2B3A] block mb-1.5">
                  {isMr ? 'पत्ता / गाव' : 'Address / Village'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isMr ? 'उदा. वाडी/वस्ती, गाव, तालुका' : 'e.g. Ward 4, Baramati Rural, Pune'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:outline-none focus:border-[#1A4B8C]"
                />
              </div>
            </div>

            {/* Quick Symptom Chips */}
            <div>
              <label className="text-xs font-bold text-[#1C2B3A] block mb-2">
                {isMr ? 'लक्षणे निवडा (Quick Select Symptoms)' : 'Select Symptoms (Quick Select)'}
              </label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map((item, idx) => {
                  const active = selectedSymptoms.includes(item.label);
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleSymptom(item.label)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                        active
                          ? 'bg-[#1A4B8C] border-[#1A4B8C] text-white'
                          : 'bg-slate-50 border-[#CFD8DC] text-[#546E7A] hover:bg-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1C2B3A] block mb-1.5">
                {isMr ? 'मुख्य तक्रार किंवा माहिती (Chief Complaint)' : 'Chief Complaint / Details'}
              </label>
              <textarea
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder={isMr ? 'आजाराबद्दल थोडक्यात सांगा...' : 'Describe main symptoms or medical issue in brief...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:outline-none focus:border-[#1A4B8C]"
              />
            </div>

            {/* ASHA Assistance Toggle */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    {isMr ? 'आशा कार्यकर्ती साहाय्य (ASHA Worker Assisted)' : 'ASHA Worker Assisted Booking'}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    {isMr ? 'गाव पातळीवरील आशा कार्यकर्तीने नोंदणीस मदत केली असल्यास सुरू ठेवा' : 'Enable if frontline ASHA worker assisted in this appointment'}
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAshaAssisted} 
                  onChange={(e) => setIsAshaAssisted(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* STEP 4: CONFIRMATION & REVIEW */}
        {/* ========================================================== */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl border border-[#CFD8DC] p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{isMr ? '४. माहितीची खात्री करा व पुष्टी द्या' : '4. Review & Confirm Appointment'}</span>
              </h2>
              <p className="text-xs text-[#546E7A] mt-1">
                {isMr ? 'कृपया नोंदणी पूर्ण करण्यापूर्वी खालील सर्व तपशील तपासून घ्या' : 'Please review the appointment details before final confirmation'}
              </p>
            </div>

            {/* Summary Card */}
            <div className="border border-[#CFD8DC] rounded-xl overflow-hidden">
              <div className="bg-[#1A4B8C] text-white p-4">
                <div className="text-xs uppercase tracking-wider text-blue-200 font-bold">
                  {isMr ? 'आरोग्य केंद्र' : 'Medical Facility'}
                </div>
                <div className="text-base font-bold mt-0.5">{selectedCenter?.name}</div>
                <div className="text-xs text-blue-100">{selectedCenter?.location.village}, {selectedCenter?.location.district}</div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50/50">
                <div>
                  <span className="text-[#78909C] block font-medium">{isMr ? 'दिनांक व वेळ' : 'Date & Slot'}</span>
                  <span className="font-bold text-[#1C2B3A] text-sm mt-0.5 block">
                    {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                  <span className="text-xs font-semibold text-[#1A4B8C]">{selectedSlot?.startTime} - {selectedSlot?.endTime}</span>
                </div>

                <div>
                  <span className="text-[#78909C] block font-medium">{isMr ? 'विभाग व डॉक्टर' : 'Department & Doctor'}</span>
                  <span className="font-bold text-[#1C2B3A] text-sm mt-0.5 block">{selectedDepartment}</span>
                  <span className="text-xs text-[#546E7A]">{selectedDoctor?.name}</span>
                </div>

                <div>
                  <span className="text-[#78909C] block font-medium">{isMr ? 'रुग्णाचे नाव' : 'Patient Name'}</span>
                  <span className="font-bold text-[#1C2B3A] text-sm mt-0.5 block">{patientName}</span>
                  <span className="text-xs text-[#546E7A]">{patientAge} yrs · {patientGender}</span>
                </div>

                <div>
                  <span className="text-[#78909C] block font-medium">{isMr ? 'मोबाईल नंबर' : 'Phone Number'}</span>
                  <span className="font-bold text-[#1C2B3A] text-sm mt-0.5 block">+91 {patientPhone}</span>
                  <span className="text-xs text-emerald-600 font-semibold">{isMr ? 'एसएमएस द्वारे टोकन पाठवले जाईल' : 'SMS confirmation active'}</span>
                </div>

                {selectedSymptoms.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="text-[#78909C] block font-medium mb-1">{isMr ? 'नोंदवलेली लक्षणे' : 'Reported Symptoms'}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSymptoms.map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-blue-100 text-[#1A4B8C] rounded-md font-semibold text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Important Instructions Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-xs text-amber-900">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Info className="w-4 h-4" />
                <span>{isMr ? 'महत्त्वाच्या शासकीय सूचना:' : 'Important Instructions for Patients:'}</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-800/90">
                <li>{isMr ? 'कृपया आपल्या वेळेच्या किमान १५ मिनिटे आधी केंद्रावर उपस्थित राहा.' : 'Arrive 15 minutes before your scheduled appointment time.'}</li>
                <li>{isMr ? 'येताना आपले आधार कार्ड किंवा आभा हेल्थ कार्ड व जुनी औषधांची कागदपत्रे सोबत आणा.' : 'Bring your Aadhaar Card, ABHA Card, and previous prescription slips.'}</li>
                <li>{isMr ? 'केंद्रावरील नोंदणी खिडकीवर आपला टोकन नंबर दाखवून थेट डॉक्टरांच्या दालनाकडे जावे.' : 'Present your token or SMS at the reception counter for instant queue check-in.'}</li>
                <li>{isMr ? 'तातडीच्या रुग्णसेवेसाठी १०८ रुग्णवाहिका विनामूल्य २४ तास उपलब्ध आहे.' : 'For medical emergencies, dial 108 for 24x7 free government ambulance service.'}</li>
              </ul>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-[#CFD8DC] text-[#1A4B8C] focus:ring-blue-100"
              />
              <label htmlFor="terms" className="text-xs text-[#546E7A] cursor-pointer">
                {isMr 
                  ? 'मी सर्व माहिती अचूक भरली असून ठरलेल्या वेळेत आरोग्य केंद्रात उपस्थित राहण्याची हमी देतो/देते.' 
                  : 'I confirm that the above information is accurate and I agree to arrive at the health facility at the scheduled time.'}
              </label>
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between pt-2">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-5 py-2.5 rounded-xl border border-[#CFD8DC] text-[#546E7A] hover:bg-white text-xs font-bold transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isMr ? 'मागे जा' : 'Back'}</span>
            </button>
          ) : <div />}

          {currentStep < totalSteps ? (
            <button
              onClick={validateAndNext}
              className="px-6 py-2.5 rounded-xl bg-[#1A4B8C] text-white hover:bg-blue-800 text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <span>{isMr ? 'पुढील टप्पा' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirmBooking}
              className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isMr ? 'अपॉइंटमेंट निश्चित करा' : 'Confirm & Book Token'}</span>
            </button>
          )}
        </div>

        {/* ========================================================== */}
        {/* SUCCESS MODAL */}
        {/* ========================================================== */}
        {showSuccessModal && bookingResult && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-[#1C2B3A]">
                  {isMr ? 'अपॉइंटमेंट यशस्वीरीत्या आरक्षित!' : 'Appointment Booked Successfully!'}
                </h3>
                <p className="text-xs text-[#546E7A]">
                  {isMr ? 'आपल्या मोबाईलवर एसएमएस व पुष्टीकरण पाठवले आहे' : 'SMS confirmation has been dispatched to your mobile number'}
                </p>
              </div>

              {/* Token Display Banner */}
              <div className="bg-[#1A4B8C] text-white p-4 rounded-xl text-center shadow-xs">
                <div className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">
                  {isMr ? 'अपॉइंटमेंट आयडी' : 'APPOINTMENT ID'}
                </div>
                <div className="text-2xl font-black tracking-wider mt-0.5">
                  {bookingResult.appointmentId}
                </div>
                <div className="text-xs text-blue-100 mt-1">
                  {bookingResult.healthCenterName} · {bookingResult.department}
                </div>
              </div>

              {/* Details List */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#78909C]">{isMr ? 'रुग्ण:' : 'Patient:'}</span>
                  <span className="font-bold text-[#1C2B3A]">{bookingResult.patient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78909C]">{isMr ? 'दिनांक:' : 'Date:'}</span>
                  <span className="font-bold text-[#1C2B3A]">
                    {new Date(bookingResult.appointmentDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78909C]">{isMr ? 'वेळ:' : 'Slot:'}</span>
                  <span className="font-bold text-[#1A4B8C]">{bookingResult.timeSlot.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78909C]">{isMr ? 'मोबाईल:' : 'Phone:'}</span>
                  <span className="font-bold text-[#1C2B3A]">+91 {bookingResult.patient.phone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => queueNotificationService.downloadTicket(bookingResult, lang)}
                  className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#1A4B8C] font-bold text-xs hover:bg-blue-100 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isMr ? 'पावती डाउनलोड करा' : 'Download Ticket'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/queue-display');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#1A4B8C] text-white font-bold text-xs hover:bg-blue-800 transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Tv className="w-4 h-4" />
                  <span>{isMr ? 'थेट रांग पहा' : 'Track Queue TV'}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentStep(1);
                }}
                className="w-full py-2 text-center text-xs font-semibold text-[#546E7A] hover:text-[#1C2B3A]"
              >
                {isMr ? 'नवीन अपॉइंटमेंट नोंदवा' : 'Book Another Appointment'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TRACK APPOINTMENT MODAL */}
        {/* ========================================================== */}
        {showTrackModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-[#1C2B3A] flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#1A4B8C]" />
                  <span>{isMr ? 'अपॉइंटमेंट शोधा व रांग तपासा' : 'Track Appointment & Queue'}</span>
                </h3>
                <button onClick={() => setShowTrackModal(false)} className="p-1 rounded hover:bg-slate-100">
                  <X className="w-5 h-5 text-[#78909C]" />
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder={isMr ? '१०-अंकी मोबाईल किंवा APT आयडी टाका...' : 'Enter 10-digit mobile or APT-XXXX ID...'}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#CFD8DC] text-xs font-medium focus:outline-none focus:border-[#1A4B8C]"
                />
                <button
                  onClick={handleSearchTracking}
                  className="px-4 py-2.5 rounded-xl bg-[#1A4B8C] text-white text-xs font-bold hover:bg-blue-800 transition"
                >
                  {isMr ? 'शोधा' : 'Search'}
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {trackResults.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#78909C]">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p>{isMr ? 'आपला मोबाईल नंबर किंवा अपॉइंटमेंट आयडी शोधून रांग तपासा' : 'Search with your mobile number or ID to track queue status'}</p>
                  </div>
                ) : (
                  trackResults.map(item => (
                    <div key={item.appointmentId} className="p-3.5 rounded-xl border border-[#CFD8DC] bg-slate-50 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A4B8C]">{item.appointmentId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                          {item.status}
                        </span>
                      </div>
                      <div className="font-semibold text-[#1C2B3A]">{item.patient.name}</div>
                      <div className="text-[#546E7A] text-[11px]">
                        {item.healthCenterName} · {item.department}
                      </div>
                      <div className="text-[11px] text-[#546E7A]">
                        {new Date(item.appointmentDate).toLocaleDateString()} · {item.timeSlot.startTime}
                      </div>
                      {item.tokenNumber && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-amber-700">Token #{item.tokenNumber}</span>
                          {item.queuePosition && (
                            <span className="text-emerald-700 font-semibold">Position #{item.queuePosition}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
