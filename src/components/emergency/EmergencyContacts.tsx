/**
 * HealthWay - Emergency Helplines & Contacts Directory (Demand 12)
 * Government of Maharashtra - Integrated Rural Health Platform
 * Strictly zero unicode emojis.
 */

import React, { useState } from 'react';
import { 
  PhoneCall, 
  Search, 
  Copy, 
  Check, 
  Shield, 
  Flame, 
  HeartHandshake, 
  Baby, 
  LifeBuoy, 
  Hospital, 
  User, 
  ExternalLink 
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EMERGENCY_SERVICES } from '../../services/emergencyService';

interface EmergencyContactItem {
  id: string;
  number: string;
  nameEn: string;
  nameMr: string;
  nameHi: string;
  descEn: string;
  descMr: string;
  descHi: string;
  icon: any;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  badge: string;
}

export default function EmergencyContacts() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const CONTACTS: EmergencyContactItem[] = [
    {
      id: '108',
      number: '108',
      nameEn: 'Ambulance Emergency Response (108)',
      nameMr: 'रुग्णवाहिका आणीबाणी सेवा (१०८)',
      nameHi: 'एम्बुलेंस आपातकालीन सेवा (१०८)',
      descEn: '24x7 Free medical ambulance dispatch across Maharashtra',
      descMr: 'महाराष्ट्रभर २४x७ मोफत वैद्यकीय रुग्णवाहिका सेवा',
      descHi: 'महाराष्ट्र भर में २४x७ निःशुल्क एम्बुलेंस सेवा',
      icon: PhoneCall,
      colorBg: 'bg-red-50 hover:bg-red-100/70',
      colorBorder: 'border-red-200',
      colorText: 'text-red-700',
      badge: '24x7 FREE'
    },
    {
      id: '100',
      number: '100',
      nameEn: 'Police Control Room (100)',
      nameMr: 'पोलीस नियंत्रण कक्ष (१००)',
      nameHi: 'पुलिस नियंत्रण कक्ष (१००)',
      descEn: 'Police assistance, crime reporting & emergency security',
      descMr: 'पोलीस मदत, कायदा व सुव्यवस्था आणीबाणी',
      descHi: 'पुलिस सहायता एवं सुरक्षा आपातकाल',
      icon: Shield,
      colorBg: 'bg-blue-50 hover:bg-blue-100/70',
      colorBorder: 'border-blue-200',
      colorText: 'text-[#1A4B8C]',
      badge: 'POLICE'
    },
    {
      id: '101',
      number: '101',
      nameEn: 'Fire Brigade (101)',
      nameMr: 'अग्निशमन दल (१०१)',
      nameHi: 'अग्निशमन विभाग (१०१)',
      descEn: 'Fire outbreak, chemical spill & technical rescue',
      descMr: 'आग, रासायनिक दुर्घटना आणि सुटका कार्य',
      descHi: 'आग व दुर्घटना बचाव कार्य',
      icon: Flame,
      colorBg: 'bg-amber-50 hover:bg-amber-100/70',
      colorBorder: 'border-amber-200',
      colorText: 'text-amber-800',
      badge: 'RESCUE'
    },
    {
      id: '181',
      number: '181',
      nameEn: 'Women Helpline (181)',
      nameMr: 'महिला हेल्पलाइन (१८१)',
      nameHi: 'महिला हेल्पलाइन (१८१)',
      descEn: 'Immediate support for women in distress, domestic violence',
      descMr: 'संकटग्रस्त महिलांसाठी तातडीची मदत व समुपदेशन',
      descHi: 'संकटग्रस्त महिलाओं के लिए त्वरित सहायता',
      icon: HeartHandshake,
      colorBg: 'bg-purple-50 hover:bg-purple-100/70',
      colorBorder: 'border-purple-200',
      colorText: 'text-purple-800',
      badge: 'WOMEN'
    },
    {
      id: '1098',
      number: '1098',
      nameEn: 'Childline Helpline (1098)',
      nameMr: 'बाल हेल्पलाइन (१०९८)',
      nameHi: 'बाल हेल्पलाइन (१०९८)',
      descEn: 'Emergency rescue, nutrition and care for vulnerable children',
      descMr: 'बालकांची सुरक्षा, काळजी व संकटात मदत',
      descHi: 'बच्चों की सुरक्षा एवं सहायता',
      icon: Baby,
      colorBg: 'bg-emerald-50 hover:bg-emerald-100/70',
      colorBorder: 'border-emerald-200',
      colorText: 'text-emerald-800',
      badge: 'CHILD'
    },
    {
      id: '1077',
      number: '1077',
      nameEn: 'Disaster Management (1077)',
      nameMr: 'आपत्ती व्यवस्थापन कक्ष (१०७७)',
      nameHi: 'आपदा प्रबंधन कक्ष (१०७७)',
      descEn: 'Floods, landslides, structural collapse & storm alerts',
      descMr: 'पूर, दरड कोसळणे, वादळ व आपत्ती व्यवस्थापन',
      descHi: 'बाढ़, भूस्खलन एवं प्राकृतिक आपदा सहायता',
      icon: LifeBuoy,
      colorBg: 'bg-teal-50 hover:bg-teal-100/70',
      colorBorder: 'border-teal-200',
      colorText: 'text-teal-800',
      badge: 'DISASTER'
    }
  ];

  const LOCAL_FACILITIES = [
    {
      nameEn: 'PHC Wagholi Emergency Casualty Desk',
      nameMr: 'प्राथमिक आरोग्य केंद्र वाघोली आणीबाणी कक्ष',
      nameHi: 'प्राथमिक स्वास्थ्य केंद्र वाघोली आपातकालीन कक्ष',
      number: '020-27051234',
      type: 'PHC',
      doctor: 'Dr. Vivek Shinde'
    },
    {
      nameEn: 'District Hospital Sassoon Trauma Centre, Pune',
      nameMr: 'ससून सर्वोपचार रुग्णालय ट्रॉमा सेंटर, पुणे',
      nameHi: 'ससून अस्पताल ट्रॉमा सेंटर, पुणे',
      number: '020-26059999',
      type: 'District Hospital (Level 1)',
      doctor: 'Casualty In-Charge'
    },
    {
      nameEn: 'ASHA Worker Meena Jadhav (Wagholi Ward 2)',
      nameMr: 'आशा कार्यकर्ती मीना जाधव (वाघोली वॉर्ड २)',
      nameHi: 'आशा कार्यकर्ता मीना जाधव (वाघोली वार्ड २)',
      number: '+91 98220 12345',
      type: 'Frontline Worker',
      doctor: 'Community Health'
    }
  ];

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const filteredContacts = CONTACTS.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.number.includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.nameMr.toLowerCase().includes(q) ||
      c.nameHi.toLowerCase().includes(q) ||
      c.descEn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C2B3A]">
            {language === 'mr' ? 'शासकीय आणीबाणी हेल्पलाइन' : language === 'hi' ? 'सरकारी आपातकालीन हेल्पलाइन' : 'Government Emergency Helplines'}
          </h2>
          <p className="text-xs text-[#546E7A] mt-0.5">
            {language === 'mr' ? 'महाराष्ट्र शासनाची २४x७ मोफत आणीबाणी संपर्क सेवा' : language === 'hi' ? 'महाराष्ट्र सरकार की २४x७ निःशुल्क आपातकालीन संपर्क सेवा' : 'Government of Maharashtra 24x7 Toll-Free Emergency Dispatch Directory'}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'mr' ? 'हेल्पलाइन शोधा...' : language === 'hi' ? 'हेल्पलाइन खोजें...' : 'Search helpline or service...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#CFD8DC] text-xs focus:ring-2 focus:ring-[#1A4B8C] outline-hidden shadow-xs"
          />
        </div>
      </div>

      {/* Main 6-Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const Icon = contact.icon;
          const isCopied = copiedNumber === contact.number;

          return (
            <div
              key={contact.id}
              className={`p-5 rounded-3xl border transition shadow-xs flex flex-col justify-between ${contact.colorBg} ${contact.colorBorder}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                    <Icon className={`w-5 h-5 ${contact.colorText}`} />
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                    {contact.badge}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-2xl font-black font-mono tracking-tight text-[#1C2B3A]">
                    {contact.number}
                  </div>
                  <h3 className="text-sm font-bold text-[#1C2B3A] mt-1 line-clamp-1">
                    {language === 'mr' ? contact.nameMr : language === 'hi' ? contact.nameHi : contact.nameEn}
                  </h3>
                  <p className="text-xs text-[#546E7A] mt-1 leading-relaxed line-clamp-2">
                    {language === 'mr' ? contact.descMr : language === 'hi' ? contact.descHi : contact.descEn}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center gap-2">
                <a
                  href={`tel:${contact.number}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#1C2B3A] hover:bg-black text-white text-xs font-bold text-center flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'कॉल करा' : language === 'hi' ? 'कॉल करें' : 'Call Now'}</span>
                </a>

                <button
                  onClick={() => handleCopy(contact.number)}
                  className="p-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#546E7A] transition"
                  title="Copy Number"
                  aria-label="Copy Number"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Local Healthcare Contacts */}
      <div className="bg-white rounded-3xl border border-[#CFD8DC] p-6 shadow-xs">
        <h3 className="text-sm font-extrabold text-[#1C2B3A] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Hospital className="w-4 h-4 text-[#1A4B8C]" />
          <span>{language === 'mr' ? 'स्थानिक आरोग्य संस्था व मदतनीस' : language === 'hi' ? 'स्थानीय स्वास्थ्य सुविधाएं एवं सहयोगी' : 'Local Rural Facility & Staff Emergency Desks'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LOCAL_FACILITIES.map((fac, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1A4B8C] border border-blue-200">
                  {fac.type}
                </span>
                <div className="text-sm font-bold text-[#1C2B3A] mt-2">
                  {language === 'mr' ? fac.nameMr : language === 'hi' ? fac.nameHi : fac.nameEn}
                </div>
                <div className="text-xs text-[#546E7A] mt-0.5">
                  {fac.doctor}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#1C2B3A]">{fac.number}</span>
                <a
                  href={`tel:${fac.number.replace(/\s+/g, '')}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

