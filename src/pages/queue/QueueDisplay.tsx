import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  Bell, 
  Users, 
  CheckCircle2, 
  Hourglass, 
  AlertTriangle, 
  Flame, 
  PauseCircle, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  ArrowLeft,
  Settings,
  Info,
  ShieldAlert
} from 'lucide-react';
import { 
  queueEngine, 
  SEED_HEALTH_CENTERS, 
  ClientQueueData 
} from '../../services/queueEngine';
import { queueNotificationService } from '../../services/queueNotificationService';

export default function QueueDisplay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Settings / Center & Dept selection
  const centerId = searchParams.get('centerId') || 'phc_baramati';
  const dept = searchParams.get('department') || 'General Medicine';

  const [selectedCenterId, setSelectedCenterId] = useState<string>(centerId);
  const [selectedDept, setSelectedDept] = useState<string>(dept);
  const [queueData, setQueueData] = useState<ClientQueueData>(() => 
    queueEngine.getLiveQueueStatus(centerId, dept)
  );

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const prevTokenRef = useRef<number>(queueData.currentToken);

  const activeCenter = SEED_HEALTH_CENTERS.find(c => c._id === selectedCenterId) || SEED_HEALTH_CENTERS[0];

  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Queue subscription & real-time updates
  useEffect(() => {
    const update = () => {
      const data = queueEngine.getLiveQueueStatus(selectedCenterId, selectedDept);
      setQueueData(data);

      // Trigger audio & visual chime when token changes
      if (data.currentToken && data.currentToken !== prevTokenRef.current) {
        if (audioEnabled) {
          queueNotificationService.playCallChime();
        }
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 800);
        prevTokenRef.current = data.currentToken;
      }
    };

    update();
    const unsubscribe = queueEngine.subscribe(() => {
      update();
    });

    return () => {
      unsubscribe();
    };
  }, [selectedCenterId, selectedDept, audioEnabled]);

  // Toggle Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className={`min-h-screen bg-[#070D1E] text-white flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-300 ${
      isFlashing ? 'ring-8 ring-blue-500/50 bg-[#0c1836]' : ''
    }`}>
      
      {/* ========================================================== */}
      {/* TOP CLINIC HEADER */}
      {/* ========================================================== */}
      <header className="bg-gradient-to-r from-[#0B2545] via-[#133E7C] to-[#0B2545] border-b-2 border-blue-600/40 px-6 py-4 flex items-center justify-between shadow-lg">
        
        {/* Left: Emblem & Facility */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/patient/book')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-blue-200"
            title="Back to Booking"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-xl text-white shadow-md">
            HW
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {activeCenter.name}
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                GOVT OF MAHARASHTRA
              </span>
            </div>
            <p className="text-xs text-blue-200 font-semibold tracking-wide mt-0.5 flex items-center gap-2">
              <span className="text-amber-400 font-bold uppercase">{selectedDept}</span>
              <span>·</span>
              <span>{activeCenter.location.village}, {activeCenter.location.district}</span>
            </p>
          </div>
        </div>

        {/* Right: Real-time Live Clock & Controls */}
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-blue-100 tabular-nums">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-blue-300/80 font-medium mt-0.5">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2.5 rounded-xl border transition ${
                audioEnabled 
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
              }`}
              title={audioEnabled ? 'Sound Chime On' : 'Sound Chime Off'}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleFullScreen}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition text-blue-200"
              title="Fullscreen Mode"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition text-blue-200"
              title="Screen Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Operator Settings Bar (Toggled) */}
      {showConfig && (
        <div className="bg-[#0e1d3b] border-b border-blue-500/30 p-4 flex flex-wrap items-center gap-4 text-xs animate-fadeIn">
          <span className="font-bold text-blue-300 flex items-center gap-1.5">
            <Settings className="w-4 h-4" />
            Display Configuration:
          </span>
          <select
            value={selectedCenterId}
            onChange={(e) => setSelectedCenterId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#070D1E] border border-blue-500/40 text-white font-medium focus:outline-none"
          >
            {SEED_HEALTH_CENTERS.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#070D1E] border border-blue-500/40 text-white font-medium focus:outline-none"
          >
            <option value="General Medicine">General Medicine / OPD</option>
            <option value="Maternal & Antenatal">Maternal & Antenatal (ANC)</option>
            <option value="Pediatrics & Immunization">Pediatrics & Immunization</option>
            <option value="NCD Clinic">NCD Clinic</option>
          </select>
          <button
            onClick={() => queueNotificationService.playCallChime()}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-white transition"
          >
            Test Audio Chime
          </button>
        </div>
      )}

      {/* ========================================================== */}
      {/* MAIN SCREEN STAGE */}
      {/* ========================================================== */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* LEFT COLUMN: NOW SERVING (60%) */}
        <section className="lg:col-span-7 bg-gradient-to-b from-[#09152f] to-[#060c1c] p-6 sm:p-10 flex flex-col justify-between items-center text-center border-b lg:border-b-0 lg:border-r border-blue-900/50 relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 font-extrabold text-sm tracking-widest uppercase">
              <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>NOW SERVING / सध्या बोलावलेले टोकन</span>
            </div>
          </div>

          {/* Giant Animated Token Box */}
          <div className="my-6 sm:my-10 relative flex items-center justify-center z-10">
            {/* Concentric Pulse Rings */}
            <div className="absolute w-72 h-72 rounded-full border border-amber-400/20 animate-ping opacity-25 pointer-events-none" />
            <div className="absolute w-84 h-84 rounded-full border border-blue-400/20 pointer-events-none" />

            <div className="relative z-10 px-10 py-6">
              <div className="text-[120px] sm:text-[160px] font-black leading-none text-amber-400 tracking-tight drop-shadow-[0_0_40px_rgba(251,191,36,0.45)] tabular-nums">
                {queueData.currentToken ? String(queueData.currentToken).padStart(2, '0') : '--'}
              </div>
            </div>
          </div>

          {/* Patient Details & Room Instruction */}
          <div className="space-y-3 z-10 max-w-md">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              {queueData.currentPatient?.name 
                ? `${queueData.currentPatient.name.split(' ')[0]} ${queueData.currentPatient.name.split(' ')[1]?.charAt(0) || ''}***` 
                : (queueData.waitingCount > 0 ? 'Calling Next Patient...' : 'Waiting for patients...')}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs space-y-1">
              <div className="text-sm font-bold text-blue-200">
                Please proceed directly to Consultation Room #1
              </div>
              <div className="text-xs text-blue-300/80 font-medium">
                कृपया थेट वैद्यकीय अधिकारी यांच्या दालन क्रमांक १ मध्ये जावे
              </div>
            </div>
          </div>

          {/* Live Metrics Bar */}
          <div className="w-full max-w-xl grid grid-cols-3 gap-3 mt-6 z-10 bg-[#0b1733] border border-blue-900/60 rounded-2xl p-4 shadow-md">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-blue-400 tabular-nums">
                {queueData.waitingCount}
              </div>
              <div className="text-[11px] font-bold text-blue-200/70 uppercase tracking-wider mt-0.5">
                Waiting / प्रतीक्षा
              </div>
            </div>

            <div className="text-center border-x border-blue-900/60">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                {queueData.completedCount}
              </div>
              <div className="text-[11px] font-bold text-emerald-200/70 uppercase tracking-wider mt-0.5">
                Completed / पूर्ण
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
                ~{queueData.avgWaitTime}m
              </div>
              <div className="text-[11px] font-bold text-amber-200/70 uppercase tracking-wider mt-0.5">
                Avg Wait / वेळ
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: NEXT IN QUEUE (40%) */}
        <section className="lg:col-span-5 bg-[#0a1226] p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-300 tracking-wider uppercase">
                <Users className="w-4 h-4 text-blue-400" />
                <span>NEXT IN QUEUE / पुढील प्रतीक्षा यादी</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30">
                {queueData.waitingCount} {queueData.waitingCount === 1 ? 'Patient' : 'Patients'}
              </span>
            </div>

            {/* Queue Paused Notification */}
            {queueData.isPaused && (
              <div className="bg-amber-500/20 border-2 border-amber-500/50 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                <PauseCircle className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-amber-300">
                    Queue Temporarily Paused / कतार तात्पुरती थांबवली आहे
                  </div>
                  <div className="text-xs text-amber-200/80">
                    {queueData.pauseReason || 'Doctor attending emergency case. Please wait.'}
                  </div>
                </div>
              </div>
            )}

            {/* Next Patients List */}
            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
              {queueData.waitingList.length === 0 ? (
                <div className="text-center py-16 text-blue-300/40 space-y-2">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/40" />
                  <p className="text-base font-bold text-blue-200/60">No patients waiting</p>
                  <p className="text-xs text-blue-300/40">सध्या कोणतीही प्रतीक्षा शिल्लक नाही</p>
                </div>
              ) : (
                queueData.waitingList.slice(0, 7).map((item, idx) => {
                  const isEmergency = item.priority === 'emergency';
                  const isUrgent = item.priority === 'urgent';
                  const isNextUp = idx === 0;

                  return (
                    <div
                      key={item.tokenNumber}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                        isEmergency 
                          ? 'bg-rose-950/40 border-rose-500/50 text-white animate-pulse' 
                          : isUrgent 
                            ? 'bg-amber-950/40 border-amber-500/50 text-white' 
                            : isNextUp 
                              ? 'bg-blue-900/40 border-blue-400/60 text-white' 
                              : 'bg-white/5 border-white/10 text-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                          isEmergency ? 'bg-rose-600 text-white' :
                          isUrgent ? 'bg-amber-600 text-white' :
                          isNextUp ? 'bg-blue-600 text-white' : 'bg-white/10 text-blue-200'
                        }`}>
                          #{item.position}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-amber-300 tracking-wider">
                              #{item.tokenNumber}
                            </span>
                            {isEmergency && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white uppercase flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" />
                                Emergency
                              </span>
                            )}
                            {isUrgent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-600 text-white uppercase flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Urgent
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-blue-200 font-medium mt-0.5">
                            {item.patientName || `Patient #${item.tokenNumber}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-blue-300">
                          ~{item.estimatedWait} min
                        </div>
                        <div className="text-[10px] text-blue-400/60 font-medium">
                          {isNextUp ? 'Be Ready' : 'Estimated'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Info Box at Right Bottom */}
          <div className="mt-4 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200/80 space-y-1">
            <div className="font-bold text-blue-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Token Verification:</span>
            </div>
            <p className="text-[11px] text-blue-200/70">
              When your token is called, keep your Aadhaar/ABHA card ready. Emergency cases are prioritized automatically by medical triage.
            </p>
          </div>
        </section>
      </main>

      {/* ========================================================== */}
      {/* FOOTER SCROLLING TICKER */}
      {/* ========================================================== */}
      <footer className="bg-[#0B2545] border-t border-blue-600/40 py-2.5 px-4 flex items-center overflow-hidden">
        <div className="px-3 py-1 rounded bg-blue-600 text-white font-extrabold text-xs shrink-0 flex items-center gap-1.5 tracking-wider shadow-xs">
          <Info className="w-3.5 h-3.5" />
          <span>HEALTHWAY INFO</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap ml-4 text-xs font-semibold text-blue-100/90 flex-1">
          <div className="inline-block animate-marquee">
            मोफत आरोग्य सेवा सर्व नागरिकांसाठी उपलब्ध • नोंदणीसाठी आधार कार्ड किंवा आभा हेल्थ आयडी सोबत आणा • तातडीच्या रुग्णवाहिकेसाठी १०८ क्रमांकावर मोफत संपर्क करा • आरोग्य केंद्रात स्वच्छता राखा • Free generic medicines available at Jan Aushadhi Kendra • Dial 108 for Emergency • Ayushman Bharat Digital Mission compliant
          </div>
        </div>
      </footer>

    </div>
  );
}
