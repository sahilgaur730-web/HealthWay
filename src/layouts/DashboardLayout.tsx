import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  FileText, 
  Pill, 
  ArrowRight, 
  Stethoscope, 
  PhoneCall, 
  LogOut, 
  User,
  Users,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Video,
  Building2, 
  AlertTriangle, 
  UserPlus,
  FlaskConical,
  Network
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/language/LanguageSwitcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathname = location.pathname;

  // Determine current portal context
  const isAsha = pathname.startsWith('/asha');
  const isDoctor = pathname.startsWith('/doctor');
  const isAdmin = pathname.startsWith('/admin');
  const isPatient = !isAsha && !isDoctor && !isAdmin;

  // Navigation Items per Portal
  const patientNavItems = [
    { path: '/patient', labelMr: 'मुख्य डॅशबोर्ड', labelHi: 'मुख्य डैशबोर्ड', labelEn: 'Dashboard', icon: Home },
    { path: '/patient/book', labelMr: 'अपॉइंटमेंट बुक करा', labelHi: 'अपॉइंटमेंट बुक करें', labelEn: 'Book Appointment', icon: Calendar },
    { path: '/patient/records', labelMr: 'माझ्या आरोग्य नोंदी', labelHi: 'स्वास्थ्य रिकॉर्ड', labelEn: 'Health Records', icon: FileText },
    { path: '/patient/medicines', labelMr: 'औषध साठा तपासणी', labelHi: 'दवा स्टॉक जाँच', labelEn: 'Medicine Stock', icon: Pill },
    { path: '/patient/referral', labelMr: 'रेफरल स्थिती', labelHi: 'रेफरल स्थिति', labelEn: 'Referral Status', icon: ArrowRight },
    { path: '/diagnostics', labelMr: 'निदान व लॅब अहवाल', labelHi: 'लैब जाँच व रिपोर्ट', labelEn: 'Lab Diagnostics', icon: FlaskConical },
    { path: '/patient/triage', labelMr: 'लक्षण तपासणी', labelHi: 'लक्षण जाँच (ट्रिआज)', labelEn: 'Symptom Triage', icon: Stethoscope },
    { path: '/patient/emergency', labelMr: 'आणीबाणी १०८', labelHi: 'आपातकाल १०८', labelEn: 'Emergency 108', icon: PhoneCall },
  ];

  const ashaNavItems = [
    { path: '/asha', labelMr: 'दैनिक कार्यसूची', labelHi: 'दैनिक कार्यसूची', labelEn: 'Daily Field Tasks', icon: Home },
    { path: '/asha/patients', labelMr: 'गाव रुग्ण यादी', labelHi: 'गाँव मरीज़ सूची', labelEn: 'Village Registry', icon: Users },
    { path: '/asha/register', labelMr: 'नवीन रुग्ण नोंदणी', labelHi: 'नया मरीज़ पंजीकरण', labelEn: 'Register Patient', icon: UserPlus },
    { path: '/asha/triage', labelMr: 'फील्ड ट्रायज व डॉक्टर', labelHi: 'फील्ड ट्रिआज व डॉक्टर', labelEn: 'Field Teleconsult', icon: Stethoscope },
    { path: '/patient/emergency', labelMr: '१०८ रुग्णवाहिका', labelHi: '१०८ एम्बुलेंस', labelEn: '108 Ambulance', icon: PhoneCall },
  ];

  const doctorNavItems = [
    { path: '/doctor', labelMr: 'टेलीकन्सल्ट यादी', labelHi: 'परामर्श कतार', labelEn: 'Consult Queue', icon: Home },
    { path: '/doctor/call', labelMr: 'व्हिडिओ कन्सल्ट रूम', labelHi: 'वीडियो कंसल्ट रूम', labelEn: 'Video Room', icon: Video },
    { path: '/doctor/patients', labelMr: 'PHC रुग्ण रेकॉर्ड्स', labelHi: 'पीएचसी मरीज़ रिकॉर्ड', labelEn: 'Patient EHR Archive', icon: Users },
    { path: '/doctor/referrals', labelMr: 'तज्ञ रेफरल ट्रॅकर', labelHi: 'विशेषज्ञ रेफरल ट्रैकर', labelEn: 'Specialist Referrals', icon: ArrowRight },
    { path: '/diagnostics', labelMr: 'डिजिटल लॅब समन्वय', labelHi: 'डिजिटल लैब समन्वय', labelEn: 'Lab Diagnostics', icon: FlaskConical },
  ];

  const adminNavItems = [
    { path: '/admin', labelMr: 'जिल्हा विहंगावलोकन', labelHi: 'जिला विहंगावलोकन', labelEn: 'Overview & Trends', icon: Home },
    { path: '/admin/facilities', labelMr: '३६ केंद्रे संचलन', labelHi: '३६ केंद्र संचालन', labelEn: '36 Facilities Matrix', icon: Building2 },
    { path: '/admin/medicines', labelMr: 'औषध पुरवठा साखळी', labelHi: 'दवा आपूर्ति श्रृंखला', labelEn: 'Medicine Supply', icon: Pill },
    { path: '/admin/high-risk', labelMr: 'उच्च जोखीम रुग्ण ट्रॅकर', labelHi: 'उच्च जोखिम मरीज़ ट्रैकर', labelEn: 'High-Risk Cohort', icon: AlertTriangle },
    { path: '/admin/interop', labelMr: 'ABDM / FHIR मानके', labelHi: 'आभा / FHIR मानक', labelEn: 'ABDM & FHIR Standards', icon: Network },
  ];

  const navItems = isAsha 
    ? ashaNavItems 
    : isDoctor 
      ? doctorNavItems 
      : isAdmin 
        ? adminNavItems 
        : patientNavItems;

  const getPortalTitle = () => {
    if (isAsha) return { mr: 'आशा कार्यकर्ती पोर्टल', hi: 'आशा कार्यकर्ता पोर्टल', en: 'ASHA Field Worker Portal', color: 'bg-[#2E7D32]' };
    if (isDoctor) return { mr: 'डॉक्टर टेलीकन्सल्टेशन पोर्टल', hi: 'डॉक्टर टेलीकंसल्टेशन पोर्टल', en: 'Doctor Teleconsultation Portal', color: 'bg-[#1A4B8C]' };
    if (isAdmin) return { mr: 'जिल्हा आरोग्य प्रशासन पोर्टल', hi: 'जिला स्वास्थ्य प्रशासन पोर्टल', en: 'District Health Admin Portal', color: 'bg-[#1C2B3A]' };
    return { mr: 'नागरिक आरोग्य पोर्टल', hi: 'नागरिक स्वास्थ्य पोर्टल', en: 'Citizen Health Portal', color: 'bg-[#1A4B8C]' };
  };

  const portalInfo = getPortalTitle();

  const isNavActive = (itemPath: string) => {
    const isPortalRoot = ['/patient', '/asha', '/doctor', '/admin'].includes(itemPath);
    if (isPortalRoot) {
      return pathname === itemPath || pathname === `${itemPath}/dashboard`;
    }
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col text-[#1C2B3A]">
      {/* Portal Top Ribbon */}
      <div className={`${portalInfo.color} text-white px-4 sm:px-6 py-3 border-b border-black/15 shadow-xs`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg bg-white/15 text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="h-8 w-8 rounded-lg bg-white text-[#1A4B8C] flex items-center justify-center font-black text-sm">
                HW
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight">HealthWay</span>
                <span className="text-[11px] text-blue-100 block leading-none">
                  {lang === 'mr' ? portalInfo.mr : lang === 'hi' ? portalInfo.hi : portalInfo.en}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isPatient && (
              <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/15 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-blue-100 font-mono">{user?.abhaId || 'ABHA: MH-PN-24-00000001'}</span>
              </div>
            )}
            {isAsha && (
              <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/15 text-xs">
                <span className="text-blue-100 font-mono">
                  {user ? `${user.username}` : 'ASHA-PN-2024-0847'}
                </span>
              </div>
            )}
            {isDoctor && (
              <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/15 text-xs">
                <span className="text-blue-100 font-mono">
                  {user?.registrationNo || 'MMC-2016-08492'}
                </span>
              </div>
            )}
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/15 text-xs">
                <span className="text-blue-100 font-mono">
                  {user?.facility ? 'DHO-PUNE' : 'DHO-PUNE-ZONE'}
                </span>
              </div>
            )}

            {/* Language Switcher in Dashboard Top Bar */}
            <LanguageSwitcher compact={true} />

            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="flex items-center gap-1.5 text-xs text-blue-100 hover:text-white bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-lg transition cursor-pointer"
              title="Log out and return to login"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'mr' ? 'बाहेर पडा' : lang === 'hi' ? 'बाहर निकलें' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="h-1 bg-[#F57C00]" />

      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        {/* Left Sidebar for Desktop */}
        <aside className="hidden md:block w-64 bg-white border-r border-[#CFD8DC] p-4 shrink-0 flex flex-col justify-between">
          <div>
            {/* User Profile Card in Sidebar */}
            <div className="mb-4 pb-3 border-b border-[#CFD8DC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1A4B8C] flex items-center justify-center font-bold">
                  {isAsha ? <Stethoscope className="w-5 h-5 text-green-700" /> :
                   isDoctor ? <Stethoscope className="w-5 h-5 text-[#1A4B8C]" /> :
                   isAdmin ? <Building2 className="w-5 h-5 text-[#1C2B3A]" /> :
                   <User className="w-5 h-5 text-[#1A4B8C]" />}
                </div>
                <div>
                  <p className="font-bold text-xs text-[#1C2B3A]">
                    {user ? (lang === 'mr' ? user.nameMr || user.name : user.name) :
                     isAsha ? (lang === 'mr' ? 'सुमन ताई पाटील' : lang === 'hi' ? 'सुमन ताई पाटिल' : 'Suman Tai Patil') :
                     isDoctor ? (lang === 'mr' ? 'डॉ. मीरा देशमुख' : lang === 'hi' ? 'डॉ. मीरा देशमुख' : 'Dr. Meera Deshmukh') :
                     isAdmin ? (lang === 'mr' ? 'जिल्हा आरोग्य अधिकारी' : lang === 'hi' ? 'जिला स्वास्थ्य अधिकारी' : 'District Health Officer') :
                     (lang === 'mr' ? 'सुनीता जाधव' : lang === 'hi' ? 'सुनीता जाधव' : 'Sunita Jadhav')}
                  </p>
                  <p className="text-[11px] text-[#546E7A]">
                    {user ? (
                      user.village
                        ? `${lang === 'mr' ? user.villageMr || user.village : user.village} · ${user.subCentre || (lang === 'mr' ? user.designationMr || user.designation : user.designation) || 'ASHA'}`
                        : (lang === 'mr' ? user.designationMr || user.designation : user.designation) || user.facility || 'Maharashtra Health'
                    ) :
                     isAsha ? (lang === 'mr' ? 'आशा कार्यकर्ती · वडगाव' : lang === 'hi' ? 'आशा कार्यकर्ता · वडगांव' : 'ASHA Worker · Vadgaon') :
                     isDoctor ? (lang === 'mr' ? 'वैद्यकीय अधिकारी · PHC शिरूर' : lang === 'hi' ? 'चिकित्सा अधिकारी · PHC शिरूर' : 'Medical Officer · PHC Shirur') :
                     isAdmin ? (lang === 'mr' ? 'पुणे जिल्हा परिषद' : lang === 'hi' ? 'पुणे जिला परिषद' : 'Pune Zilla Parishad') :
                     (lang === 'mr' ? 'वडगाव, शिरूर' : lang === 'hi' ? 'वडगांव, शिरूर' : 'Vadgaon, Shirur')}
                  </p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = isNavActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                      active
                        ? 'bg-[#1A4B8C] text-white shadow-xs font-bold'
                        : 'text-[#546E7A] hover:text-[#1C2B3A] hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{lang === 'mr' ? item.labelMr : lang === 'hi' ? item.labelHi : item.labelEn}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Emergency Helpline Widget in Sidebar */}
          <div className="mt-8 p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs space-y-2">
            <p className="font-bold text-red-900">
              {lang === 'mr' ? '२४/७ मोफत रुग्णवाहिका' : lang === 'hi' ? '२४/७ निःशुल्क एम्बुलेंस' : '24x7 Ambulance Dispatch'}
            </p>
            <p className="text-[11px] text-red-700 leading-relaxed">
              {lang === 'mr' ? 'गंभीर स्थितीत १०८ वर मोफत संपर्क साधा.' : lang === 'hi' ? 'गंभीर स्थिति में १०८ पर निःशुल्क संपर्क करें।' : 'Emergency medical transport under MEMS.'}
            </p>
            <button
              onClick={() => navigate('/patient/emergency')}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS 108</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/60 flex animate-in fade-in">
            <div className="w-64 bg-white p-4 h-full flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#CFD8DC] mb-4">
                  <span className="font-bold text-sm text-[#1C2B3A]">
                    {lang === 'mr' ? 'मेनू' : lang === 'hi' ? 'नेविगेशन मेनू' : 'Navigation Menu'}
                  </span>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map(item => {
                    const active = isNavActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left ${
                          active ? 'bg-[#1A4B8C] text-white font-bold' : 'text-[#546E7A]'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{lang === 'mr' ? item.labelMr : lang === 'hi' ? item.labelHi : item.labelEn}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={() => {
                  setSidebarOpen(false);
                  navigate('/');
                }}
                className="w-full py-2.5 text-xs font-semibold text-[#546E7A] border border-[#CFD8DC] rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                {lang === 'mr' ? 'मुख्यपृष्ठावर जा' : lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Return Home'}
              </button>
            </div>
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
