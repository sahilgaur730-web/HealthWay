import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  PhoneCall
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  return (
    <footer className="bg-[#1C2B3A] text-white pt-16 pb-12 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1 & 2: Brand & Govt Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1A4B8C] text-white flex items-center justify-center font-black text-lg shadow-xs">
                HW
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                  HealthWay
                </span>
                <p className="text-[10px] text-blue-200 tracking-wider">
                  <span className="lang-content mr">निरोगी उद्या, एकत्र</span>
                  <span className="lang-content hi">स्वस्थ कल, एक साथ</span>
                  <span className="lang-content en">A HEALTHIER TOMORROW, TOGETHER</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pr-4">
              <span className="lang-block mr">
                महाराष्ट्र शासन सार्वजनिक आरोग्य विभाग आणि राष्ट्रीय आरोग्य अभियान (NHM) यांच्या संयुक्त विद्यमाने ग्रामीण भागासाठी विकसित एकात्मिक आरोग्य प्रणाली.
              </span>
              <span className="lang-block hi">
                महाराष्ट्र शासन सार्वजनिक स्वास्थ्य विभाग और राष्ट्रीय स्वास्थ्य मिशन (NHM) द्वारा ग्रामीण क्षेत्रों के लिए विकसित एकीकृत डिजिटल स्वास्थ्य प्रणाली।
              </span>
              <span className="lang-block en">
                Government of Maharashtra, Public Health Department & National Health Mission integrated digital health platform for rural healthcare access.
              </span>
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                <span className="lang-content mr">आयुष्मान भारत डिजिटल मिशन (ABDM) प्रमाणित</span>
                <span className="lang-content hi">आयुष्मान भारत डिजिटल मिशन (ABDM) प्रमाणित</span>
                <span className="lang-content en">ABDM & NDHM Compliant Architecture</span>
              </span>
            </div>
          </div>

          {/* Col 3: Portal Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              <span className="lang-content mr">आरोग्य पोर्टल्स</span>
              <span className="lang-content hi">स्वास्थ्य पोर्टल</span>
              <span className="lang-content en">Healthcare Portals</span>
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <button onClick={() => navigate('/patient')} className="hover:text-white transition text-left cursor-pointer">
                  <span className="lang-content mr">रुग्ण पोर्टल (Patient)</span>
                  <span className="lang-content hi">मरीज़ पोर्टल (Patient)</span>
                  <span className="lang-content en">Patient Portal</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/asha')} className="hover:text-white transition text-left cursor-pointer">
                  <span className="lang-content mr">आशा कार्यकर्ती (ASHA)</span>
                  <span className="lang-content hi">आशा कार्यकर्ता (ASHA)</span>
                  <span className="lang-content en">ASHA Worker Portal</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/doctor')} className="hover:text-white transition text-left cursor-pointer">
                  <span className="lang-content mr">डॉक्टर टेलीकन्सल्ट (Doctor)</span>
                  <span className="lang-content hi">डॉक्टर टेलीकंसल्ट (Doctor)</span>
                  <span className="lang-content en">Doctor Teleconsult</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin')} className="hover:text-white transition text-left cursor-pointer">
                  <span className="lang-content mr">जिल्हा प्रशासन (Admin)</span>
                  <span className="lang-content hi">जिला प्रशासन (Admin)</span>
                  <span className="lang-content en">District Admin Dashboard</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Public Programs */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              <span className="lang-content mr">शासकीय कार्यक्रम</span>
              <span className="lang-content hi">सरकारी योजनाएं</span>
              <span className="lang-content en">Key Programs</span>
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <span className="lang-content mr">प्रधानमंत्री सुरक्षित मातृत्व (PMSMA)</span>
                <span className="lang-content hi">प्रधानमंत्री सुरक्षित मातृत्व (PMSMA)</span>
                <span className="lang-content en">Pradhan Mantri Surakshit Matritva (PMSMA)</span>
              </li>
              <li>
                <span className="lang-content mr">राष्ट्रीय क्षयरोग निर्मूलन (NTEP)</span>
                <span className="lang-content hi">राष्ट्रीय क्षयरोग उन्मूलन (NTEP)</span>
                <span className="lang-content en">National Tuberculosis Elimination (NTEP)</span>
              </li>
              <li>
                <span className="lang-content mr">असंगर्गजन्य रोग नियंत्रण (NP-NCD)</span>
                <span className="lang-content hi">गैर-संचारी रोग नियंत्रण (NP-NCD)</span>
                <span className="lang-content en">Non-Communicable Diseases (NP-NCD)</span>
              </li>
              <li>
                <span className="lang-content mr">मिशन इंद्रधनुष्य लसीकरण (IMI)</span>
                <span className="lang-content hi">मिशन इंद्रधनुष टीकाकरण (IMI)</span>
                <span className="lang-content en">Intensified Mission Indradhanush (IMI)</span>
              </li>
              <li>
                <span className="lang-content mr">जननी शिशु सुरक्षा कार्यक्रम (JSSK)</span>
                <span className="lang-content hi">जननी शिशु सुरक्षा कार्यक्रम (JSSK)</span>
                <span className="lang-content en">Janani Shishu Suraksha Karyakram (JSSK)</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Emergency Helplines */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              <span className="lang-content mr">शासकीय हेल्पलाईन</span>
              <span className="lang-content hi">सरकारी हेल्पलाइन</span>
              <span className="lang-content en">Emergency Numbers</span>
            </h4>
            <div className="space-y-2">
              <a 
                href="tel:108"
                className="flex items-center justify-between p-2 rounded-lg bg-red-900/40 border border-red-700/50 hover:bg-red-900/70 transition"
              >
                <div>
                  <div className="font-bold text-white">
                    <span className="lang-content mr">१०८ आपत्कालीन</span>
                    <span className="lang-content hi">१०८ आपातकालीन</span>
                    <span className="lang-content en">108 Emergency</span>
                  </div>
                  <div className="text-[10px] text-red-200">
                    <span className="lang-content mr">मोफत रुग्णवाहिका</span>
                    <span className="lang-content hi">निःशुल्क एम्बुलेंस</span>
                    <span className="lang-content en">Free Ambulance</span>
                  </div>
                </div>
                <PhoneCall className="w-4 h-4 text-red-400" />
              </a>

              <a 
                href="tel:102"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
              >
                <div>
                  <div className="font-bold text-white">
                    <span className="lang-content mr">१०२ जननी एक्सप्रेस</span>
                    <span className="lang-content hi">१०२ जननी एक्सप्रेस</span>
                    <span className="lang-content en">102 Janani Express</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    <span className="lang-content mr">माता व बाल वाहतूक</span>
                    <span className="lang-content hi">मातृ एवं शिशु परिवहन</span>
                    <span className="lang-content en">Maternal Transit</span>
                  </div>
                </div>
                <PhoneCall className="w-4 h-4 text-blue-400" />
              </a>

              <a 
                href="tel:104"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
              >
                <div>
                  <div className="font-bold text-white">
                    <span className="lang-content mr">१०४ आरोग्य सल्ला</span>
                    <span className="lang-content hi">१०४ स्वास्थ्य परामर्श</span>
                    <span className="lang-content en">104 Health Helpline</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    <span className="lang-content mr">२४/७ वैद्यकीय मदत</span>
                    <span className="lang-content hi">२४/७ चिकित्सीय सहायता</span>
                    <span className="lang-content en">24/7 Medical Advice</span>
                  </div>
                </div>
                <PhoneCall className="w-4 h-4 text-emerald-400" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            <span className="lang-content mr">© २०२४ महाराष्ट्र शासन · सार्वजनिक आरोग्य विभाग. सर्व हक्क राखीव.</span>
            <span className="lang-content hi">© २०२४ महाराष्ट्र शासन · सार्वजनिक स्वास्थ्य विभाग. सर्वाधिकार सुरक्षित.</span>
            <span className="lang-content en">© 2024 Government of Maharashtra · Public Health Department. All rights reserved.</span>
          </p>
          <div className="flex items-center gap-6">
            <span>
              <span className="lang-content mr">गोपनीयता धोरण</span>
              <span className="lang-content hi">गोपनीयता नीति</span>
              <span className="lang-content en">Privacy Policy</span>
            </span>
            <span>
              <span className="lang-content mr">अटी व शर्ती</span>
              <span className="lang-content hi">उपयोग की शर्तें</span>
              <span className="lang-content en">Terms of Service</span>
            </span>
            <span>
              <span className="lang-content mr">सुरक्षा ऑडिट</span>
              <span className="lang-content hi">सुरक्षा ऑडिट</span>
              <span className="lang-content en">Security Audited</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
