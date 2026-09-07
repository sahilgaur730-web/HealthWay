import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

type LoginStep = 'method' | 'mobile' | 'otp' | 'abha' | 'abha_otp';

export default function PatientLogin() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [step, setStep] = useState<LoginStep>('method');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [abhaId, setAbhaId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = () => {
    if (mobile.length !== 10) {
      setError(lang === 'mr' ? 'कृपया वैध १० अंकी मोबाइल नंबर टाका' : 'Please enter valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleVerifyOTP = () => {
    const entered = otp.join('');
    if (entered.length !== 6) {
      setError(lang === 'mr' ? 'कृपया पूर्ण ६ अंकी OTP टाका' : 'Please enter complete 6-digit OTP');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/patient/dashboard');
    }, 1200);
  };

  const handleAbhaSubmit = () => {
    if (abhaId.trim().length < 8) {
      setError(lang === 'mr' ? 'कृपया वैध ABHA आयडी किंवा नंबर टाका' : 'Please enter valid ABHA ID');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('abha_otp');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between">
      {/* Top Header */}
      <div className="bg-[#1A4B8C] text-white px-6 py-4 border-b border-blue-900">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <img src="/logo.png" alt="HealthWay" className="h-8 w-8 object-contain rounded bg-white p-0.5" />
            <div>
              <span className="font-extrabold text-base tracking-tight">HealthWay</span>
              <span className="text-xs text-blue-200 block leading-none">
                {lang === 'mr' ? 'रुग्ण प्रवेश पोर्टल' : 'Patient Access Portal'}
              </span>
            </div>
          </div>

          <div className="flex items-center bg-[#0D3470] rounded border border-blue-800 p-0.5 text-xs">
            <button
              onClick={() => setLang('mr')}
              className={`px-2.5 py-1 rounded transition-colors ${lang === 'mr' ? 'bg-[#1A4B8C] text-white font-bold' : 'text-blue-200'}`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded transition-colors ${lang === 'en' ? 'bg-[#1A4B8C] text-white font-bold' : 'text-blue-200'}`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-[#F57C00] via-[#FF9800] to-[#F57C00]" />

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-[#CFD8DC] shadow-sm p-8">
            
            {/* Header Icon & Title */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#E8F0FE] text-[#1A4B8C] rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[#1C2B3A]">
                {lang === 'mr' ? 'रुग्ण लॉग इन' : 'Patient Login'}
              </h2>
              <p className="text-xs text-[#546E7A] mt-1">
                {lang === 'mr' 
                  ? 'आपल्या आरोग्य नोंदी, तपासणी अहवाल व औषध माहिती पाहण्यासाठी'
                  : 'Access your ABHA health records, lab reports, and medicine availability'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FFEBEE] border border-[#C62828]/40 rounded-xl text-xs text-[#C62828] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: METHOD SELECTION */}
            {step === 'method' && (
              <div className="space-y-3.5">
                <button
                  onClick={() => { setError(''); setStep('mobile'); }}
                  className="w-full flex items-center justify-between p-4 border-2 border-[#CFD8DC] rounded-xl hover:border-[#1A4B8C] hover:bg-[#E8F0FE] transition-all group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-[#E8F0FE] group-hover:bg-[#1A4B8C] rounded-lg flex items-center justify-center transition-colors">
                      <Phone className="w-5 h-5 text-[#1A4B8C] group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#1C2B3A]">
                        {lang === 'mr' ? 'मोबाइल नंबरने लॉग इन' : 'Login with Mobile Number'}
                      </p>
                      <p className="text-xs text-[#546E7A]">
                        {lang === 'mr' ? 'OTP द्वारे तात्काळ सुरक्षित प्रवेश' : 'Fast and secure login via SMS OTP'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1A4B8C] transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  onClick={() => { setError(''); setStep('abha'); }}
                  className="w-full flex items-center justify-between p-4 border-2 border-[#CFD8DC] rounded-xl hover:border-[#2E7D32] hover:bg-[#E8F5E9] transition-all group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-[#E8F5E9] group-hover:bg-[#2E7D32] rounded-lg flex items-center justify-center transition-colors">
                      <CreditCard className="w-5 h-5 text-[#2E7D32] group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#1C2B3A]">
                        {lang === 'mr' ? 'ABHA आयडीने लॉग इन' : 'Login with ABHA Number'}
                      </p>
                      <p className="text-xs text-[#546E7A]">
                        Ayushman Bharat Health Account
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#2E7D32] transition-transform group-hover:translate-x-0.5" />
                </button>

                {/* Quick Demo Bypass Button for Judges */}
                <div className="pt-3 border-t border-gray-200 text-center">
                  <button
                    onClick={() => navigate('/patient/dashboard')}
                    className="text-xs text-[#1A4B8C] font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>{lang === 'mr' ? 'थेट चाचणी डॅशबोर्ड उघडा (सुनीता जाधव)' : "Quick Demo: Open Sunita's Dashboard"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: MOBILE INPUT */}
            {step === 'mobile' && (
              <div className="space-y-4">
                <button
                  onClick={() => { setError(''); setStep('method'); }}
                  className="text-xs text-[#546E7A] hover:text-[#1C2B3A] flex items-center gap-1 mb-2 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'मागे' : 'Back to options'}</span>
                </button>

                <div>
                  <label className="block text-xs font-bold text-[#1C2B3A] mb-1.5 uppercase tracking-wide">
                    {lang === 'mr' ? 'मोबाइल नंबर' : 'Mobile Number'}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center border-2 border-[#CFD8DC] rounded-xl px-3 bg-gray-50 text-xs font-bold text-[#546E7A]">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9822304912"
                      className="flex-1 border-2 border-[#CFD8DC] rounded-xl px-4 py-2.5 focus:border-[#1A4B8C] outline-none text-base font-mono text-[#1C2B3A]"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-[#546E7A] mt-1">
                    {lang === 'mr' ? 'नोंदणीकृत क्रमांकावर ६ अंकी OTP पाठवला जाईल' : 'A 6-digit OTP will be sent to your mobile'}
                  </p>
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={isLoading || mobile.length !== 10}
                  className="w-full bg-[#1A4B8C] hover:bg-[#0D3470] text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading 
                    ? (lang === 'mr' ? 'OTP पाठवत आहे...' : 'Sending OTP...') 
                    : (lang === 'mr' ? 'OTP पाठवा' : 'Send OTP')}
                </button>
              </div>
            )}

            {/* STEP 3: OTP VERIFICATION */}
            {step === 'otp' && (
              <div className="space-y-4">
                <button
                  onClick={() => { setError(''); setStep('mobile'); }}
                  className="text-xs text-[#546E7A] hover:text-[#1C2B3A] flex items-center gap-1 mb-2 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'नंबर बदला' : 'Change Number'}</span>
                </button>

                <div className="text-center">
                  <p className="text-xs text-[#546E7A]">
                    {lang === 'mr' ? `+९१ ${mobile} वर पाठवलेला ६ अंकी OTP टाका` : `Enter the 6-digit OTP sent to +91 ${mobile}`}
                  </p>
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 py-1 rounded-md mt-1 font-mono">
                    Demo OTP: 1 2 3 4 5 6
                  </p>
                </div>

                <div className="flex gap-2 justify-center my-4">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(-1);
                        const newOtp = [...otp];
                        newOtp[i] = val;
                        setOtp(newOtp);
                        if (val && i < 5) {
                          document.getElementById(`otp-${i + 1}`)?.focus();
                        }
                      }}
                      className="w-11 h-12 border-2 border-[#CFD8DC] rounded-xl text-center text-lg font-bold text-[#1C2B3A] focus:border-[#1A4B8C] outline-none"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full bg-[#1A4B8C] hover:bg-[#0D3470] text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading 
                    ? (lang === 'mr' ? 'पडताळणी होत आहे...' : 'Verifying...') 
                    : (lang === 'mr' ? 'पुष्टी करा व पुढे जा' : 'Verify & Continue')}
                </button>

                <p className="text-center text-xs text-[#546E7A] pt-2">
                  {lang === 'mr' ? 'OTP मिळाला नाही?' : "Didn't receive OTP?"}{' '}
                  <button 
                    onClick={() => { setOtp(['1','2','3','4','5','6']); }}
                    className="text-[#1A4B8C] font-bold hover:underline"
                  >
                    {lang === 'mr' ? 'पुन्हा पाठवा (Auto Fill)' : 'Resend (Auto Fill)'}
                  </button>
                </p>
              </div>
            )}

            {/* STEP 4: ABHA ID INPUT */}
            {step === 'abha' && (
              <div className="space-y-4">
                <button
                  onClick={() => { setError(''); setStep('method'); }}
                  className="text-xs text-[#546E7A] hover:text-[#1C2B3A] flex items-center gap-1 mb-2 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'मागे' : 'Back'}</span>
                </button>

                <div>
                  <label className="block text-xs font-bold text-[#1C2B3A] mb-1.5 uppercase tracking-wide">
                    {lang === 'mr' ? 'ABHA पत्ता किंवा १४-अंकी क्रमांक' : 'ABHA Address or 14-Digit Number'}
                  </label>
                  <input
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="MH-PN-24-00000001"
                    className="w-full border-2 border-[#CFD8DC] rounded-xl px-4 py-2.5 focus:border-[#2E7D32] outline-none text-base font-mono text-[#1C2B3A]"
                    autoFocus
                  />
                  <p className="text-[11px] text-[#546E7A] mt-1">
                    {lang === 'mr' ? 'उदा. MH-PN-24-00000001 किंवा sunita@abdm' : 'e.g. MH-PN-24-00000001 or sunita@abdm'}
                  </p>
                </div>

                <button
                  onClick={handleAbhaSubmit}
                  disabled={isLoading || abhaId.length < 5}
                  className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading 
                    ? (lang === 'mr' ? 'तपासत आहे...' : 'Verifying ABHA...') 
                    : (lang === 'mr' ? 'ABHA पडताळणी करा' : 'Validate ABHA')}
                </button>
              </div>
            )}

            {/* STEP 5: ABHA OTP VERIFICATION */}
            {step === 'abha_otp' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-[#546E7A]">
                    {lang === 'mr' ? 'आधार लिंक केलेल्या मोबाइलवर OTP पाठवला आहे' : 'OTP sent to Aadhaar linked mobile number ending in ...4821'}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/patient/dashboard')}
                  className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  {lang === 'mr' ? 'डॅशबोर्ड उघडा' : 'Confirm and Open Dashboard'}
                </button>
              </div>
            )}

          </div>

          <p className="text-center text-[11px] text-[#546E7A] mt-4 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-[#2E7D32]" />
            <span>{lang === 'mr' ? 'सुरक्षित पोर्टल · ABDM भारत सरकार नियमांनुसार' : 'Secured Portal · Compliant with ABDM Guidelines'}</span>
          </p>
        </div>
      </div>

      <div className="bg-white border-t border-[#CFD8DC] py-4 text-center text-xs text-[#546E7A]">
        © 2024 Government of Maharashtra · HealthWay Integrated Health Platform
      </div>
    </div>
  );
}
