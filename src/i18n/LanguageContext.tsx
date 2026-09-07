/**
 * HealthWay Multilingual System - Global Language Context
 * Government of Maharashtra - Integrated Rural Health Platform
 * Supports English (en), Marathi (mr), and Hindi (hi) with Web Speech API codes.
 * Strictly zero unicode emojis.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import en from './translations/en';
import mr from './translations/mr';
import hi from './translations/hi';

export type Language = 'en' | 'mr' | 'hi';

export interface LanguageMeta {
  code: Language;
  name: string;
  nativeName: string;
  flagText: string;
  speechCode: string;
  dir: 'ltr' | 'rtl';
  font: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flagText: 'EN',
    speechCode: 'en-IN',
    dir: 'ltr',
    font: 'system-ui, -apple-system, sans-serif'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flagText: 'म',
    speechCode: 'mr-IN',
    dir: 'ltr',
    font: 'Noto Sans Devanagari, system-ui, sans-serif'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flagText: 'हि',
    speechCode: 'hi-IN',
    dir: 'ltr',
    font: 'Noto Sans Devanagari, system-ui, sans-serif'
  }
];

const TRANSLATIONS: Record<Language, any> = { en, mr, hi };

// Comprehensive Hindi Lookup Map for UI strings, headings, navigation & common terms
const HINDI_LOOKUP_MAP: Record<string, string> = {
  // Navigation & Header
  'Home': 'होम',
  'मुख्यपृष्ठ': 'होम',
  'Patient Portal': 'मरीज़ पोर्टल',
  'रुग्ण पोर्टल': 'मरीज़ पोर्टल',
  'ASHA Portal': 'आशा पोर्टल',
  'आशा पोर्टल': 'आशा पोर्टल',
  'Doctor Portal': 'डॉक्टर पोर्टल',
  'डॉक्टर पोर्टल': 'डॉक्टर पोर्टल',
  'District Admin': 'जिला प्रशासन',
  'जिल्हा प्रशासन': 'जिला प्रशासन',
  'Portal Access': 'पोर्टल प्रवेश',
  'पोर्टल प्रवेश': 'पोर्टल प्रवेश',
  'Portal Access (Login)': 'पोर्टल प्रवेश (लॉगिन)',
  'पोर्टल प्रवेश (Login)': 'पोर्टल प्रवेश (लॉगिन)',
  'INTEGRATED RURAL HEALTHCARE': 'एकीकृत ग्रामीण स्वास्थ्य सेवा',
  'एकात्मिक ग्रामीण आरोग्य प्रणाली': 'एकीकृत ग्रामीण स्वास्थ्य सेवा',

  // Common Portals & Views
  'Dashboard': 'डैशबोर्ड',
  'डॅशबोर्ड': 'डैशबोर्ड',
  'मुख्य डॅशबोर्ड': 'मुख्य डैशबोर्ड',
  'Emergency': 'आपातकाल',
  'आपत्कालीन': 'आपातकाल',
  'आणीबाणी १०८': 'आपातकाल १०८',
  '१०८ रुग्णवाहिका': '१०८ एम्बुलेंस',
  'Records': 'रिकॉर्ड',
  'नोंदी': 'रिकॉर्ड',
  'माझ्या आरोग्य नोंदी': 'मेरे स्वास्थ्य रिकॉर्ड',
  'Health Records': 'स्वास्थ्य रिकॉर्ड',
  'Referrals': 'रेफरल',
  'रेफरल': 'रेफरल',
  'रेफरल स्थिती': 'रेफरल स्थिति',
  'Referral Status': 'रेफरल स्थिति',
  'रेफरल सेतू': 'रेफरल सेतु',
  'Medicines': 'दवाइयाँ',
  'औषधे': 'दवाइयाँ',
  'औषध साठा तपासणी': 'दवा स्टॉक जाँच',
  'Medicine Stock': 'दवा स्टॉक',
  'औषध पुरवठा साखळी': 'दवा आपूर्ति श्रृंखला',
  'Medicine Supply': 'दवा आपूर्ति',
  'Settings': 'सेटिंग्स',
  'सेटिंग्ज': 'सेटिंग्स',
  'Triage': 'ट्रिआज',
  'त्रिआज': 'ट्रिआज',
  'लक्षण तपासणी': 'लक्षण जाँच (ट्रिआज)',
  'Symptom Triage': 'लक्षण ट्रिआज',
  'Lab Diagnostics': 'लैब जाँच व रिपोर्ट',
  'निदान व लॅब अहवाल': 'लैब जाँच व रिपोर्ट',
  'निदान केंद्र': 'जाँच केंद्र',
  'Diagnostics': 'जाँच केंद्र',
  'Facility Matrix': 'सुविधा मैट्रिक्स',
  'कमांड डॅशबोर्ड': 'सुविधा मैट्रिक्स',
  '३६ केंद्रे संचलन': '३६ केंद्र संचालन',
  '36 Facilities Matrix': '३६ केंद्र संचालन',
  'High-Risk Cohort': 'उच्च जोखिम मरीज़',
  'उच्च जोखीम रुग्ण ट्रॅकर': 'उच्च जोखिम मरीज़ ट्रैकर',
  'ABDM & FHIR Standards': 'आभा व FHIR मानक',
  'ABDM / FHIR मानके': 'आभा व FHIR मानक',
  'Daily Field Tasks': 'दैनिक कार्यसूची',
  'दैनिक कार्यसूची': 'दैनिक कार्यसूची',
  'Village Registry': 'गाँव मरीज़ सूची',
  'गाव रुग्ण यादी': 'गाँव मरीज़ सूची',
  'Register Patient': 'नया मरीज़ पंजीकरण',
  'नवीन रुग्ण नोंदणी': 'नया मरीज़ पंजीकरण',
  'Field Teleconsult': 'फील्ड ट्रिआज व टेलीकंसल्ट',
  'फील्ड ट्रायज व डॉक्टर': 'फील्ड ट्रिआज व टेलीकंसल्ट',
  'Consult Queue': 'परामर्श कतार',
  'टेलीकन्सल्ट यादी': 'परामर्श कतार',
  'Video Room': 'वीडियो कंसल्ट रूम',
  'व्हिडिओ कन्सल्ट रूम': 'वीडियो कंसल्ट रूम',
  'Patient EHR Archive': 'मरीज़ ईएचआर रिकॉर्ड',
  'PHC रुग्ण रेकॉर्ड्स': 'पीएचसी मरीज़ रिकॉर्ड',
  'Specialist Referrals': 'विशेषज्ञ रेफरल',
  'तज्ञ रेफरल ट्रॅकर': 'विशेषज्ञ रेफरल ट्रैकर',
  'Overview & Trends': 'जिला विहंगावलोकन',
  'जिल्हा विहंगावलोकन': 'जिला विहंगावलोकन',

  // Actions & Buttons
  'Submit': 'सबमिट करें',
  'सबमिट करा': 'सबमिट करें',
  'Cancel': 'रद्द करें',
  'रद्द करा': 'रद्द करें',
  'Back': 'वापस',
  'मागे': 'वापस',
  'Save': 'सहेजें',
  'जतन करा': 'सहेजें',
  'Exit': 'बाहर निकलें',
  'बाहेर पडा': 'बाहर निकलें',
  'Return Home': 'मुख्य पृष्ठ पर लौटें',
  'मुख्यपृष्ठावर जा': 'मुख्य पृष्ठ पर लौटें',
  'Navigation Menu': 'नेविगेशन मेनू',
  'मेनू': 'नेविगेशन मेनू',
  'Access Portals': 'पोर्टल प्रवेश करें',
  'पोर्टल प्रवेश करा': 'पोर्टल प्रवेश करें',
  '108 Emergency SOS': '१०८ आपातकालीन सेवा',
  '१०८ आणीबाणी सेवा': '१०८ आपातकालीन सेवा',
  'Voice Assistant': 'आवाज़ सहायक',
  'व्हॉइस सहाय्यक': 'आवाज़ सहायक',
  'Listen Overview': 'जानकारी सुनें',
  'माहिती ऐका': 'जानकारी सुनें',
  'Open Portal': 'पोर्टल खोलें',
  'प्रवेश करा': 'पोर्टल खोलें',
  'Try Live Simulation': 'लाइव सिमुलेशन देखें',
  'थेट अनुभव घ्या': 'लाइव सिमुलेशन देखें',
  'Book Appointment': 'अपॉइंटमेंट बुक करें',
  'अपॉइंटमेंट बुक करा': 'अपॉइंटमेंट बुक करें',

  // KPIs & Badges
  'Active PHCs': 'सक्रिय प्राथमिक स्वास्थ्य केंद्र',
  'कार्यरत PHC': 'सक्रिय प्राथमिक स्वास्थ्य केंद्र',
  'Total Facilities': 'कुल स्वास्थ्य केंद्र',
  'एकूण केंद्रे': 'कुल स्वास्थ्य केंद्र',
  'ABHA Patients': 'पंजीकृत आभा नागरिक',
  'ABHA नागरिक': 'पंजीकृत आभा नागरिक',
  '108 Dispatch': '१०८ एम्बुलेंस सेवा',
  'Govt of Maharashtra · Health Dept': 'महाराष्ट्र शासन · स्वास्थ्य विभाग',
  'महाराष्ट्र शासन · आरोग्य विभाग': 'महाराष्ट्र शासन · स्वास्थ्य विभाग',
  'Govt of Maharashtra · National Health Mission (NHM)': 'महाराष्ट्र शासन · राष्ट्रीय स्वास्थ्य मिशन (NHM)',
  'महाराष्ट्र शासन · राष्ट्रीय आरोग्य अभियान (NHM)': 'महाराष्ट्र शासन · राष्ट्रीय स्वास्थ्य मिशन (NHM)',
  'Online': 'ऑनलाइन',
  'Offline Sync': 'ऑफलाइन सिंक',
  'Queue TV': 'कतार टीवी',
  'रांग टीव्ही': 'कतार टीवी',

  // Clinical, Patient & Portal Terms
  'Active': 'सक्रिय',
  'सक्रिय': 'सक्रिय',
  'Age': 'उम्र',
  'वय': 'उम्र',
  'Yrs': 'वर्ष',
  'वर्षे': 'वर्ष',
  'Blood': 'रक्त समूह',
  'रक्तगट': 'रक्त समूह',
  'Last Visit:': 'पिछली भेंट:',
  'शेवटची भेट:': 'पिछली भेंट:',
  'Last Visit': 'पिछली भेंट',
  'Upcoming Appointment': 'आगामी जाँच अपॉइंटमेंट',
  'उद्याची तपासणी अपॉइंटमेंट': 'आगामी जाँच अपॉइंटमेंट',
  'Scheduled': 'नियोजित',
  'नियोजित': 'नियोजित',
  'Tomorrow at 10:30 AM · Token #07': 'कल सुबह १०:३० बजे · टोकन क्र. ०७',
  'उद्या सकाळी १०:३० वाजता · टोकन क्र. ०७': 'कल सुबह १०:३० बजे · टोकन क्र. ०७',
  'View Details': 'विवरण देखें',
  'तपशील पहा': 'विवरण देखें',
  'Quick Services': 'त्वरित सेवाएं',
  'त्वरित सेवा (Quick Services)': 'त्वरित सेवाएं (Quick Services)',
  'Teleconsultation': 'दूर परामर्श',
  'दूर सल्लामसलत': 'दूर परामर्श',
  'Live Doctor Call': 'लाइव डॉक्टर परामर्श',
  'थेट व्हिडिओ/ऑडिओ डॉक्टर': 'सीधा वीडियो/ऑडियो डॉक्टर',
  'PHC or District Hospital': 'PHC या जिला अस्पताल',
  'PHC किंवा जिल्हा रुग्णालय': 'PHC या जिला अस्पताल',
  'Live Queue TV': 'लाइव कतार टीवी',
  'थेट रांग टीव्ही': 'लाइव कतार टीवी',
  'Now Serving & Wait Time': 'वर्तमान टोकन व प्रतीक्षा समय',
  'चालू टोकन व प्रतीक्षा वेळ': 'वर्तमान टोकन व प्रतीक्षा समय',
  'ABHA Linked Diagnostic Lab Reports': 'आभा अनुसार जाँच व रिपोर्ट',
  'ABHA नुसार तपासण्या व अहवाल': 'आभा अनुसार जाँच व रिपोर्ट',
  'Medicine Check': 'दवा स्टॉक जाँचें',
  'औषध साठा तपासा': 'दवा स्टॉक जाँचें',
  'Government Drug Inventory Status': 'PHC में निःशुल्क दवा भंडार',
  'PHC मधील मोफत औषध साठा': 'PHC में निःशुल्क दवा भंडार',
  'Tertiary Hospital Tracking': 'जिला अस्पताल में रेफरल स्थिति',
  'जिल्हा रुग्णालयातील संदर्भ': 'जिला अस्पताल में रेफरल स्थिति',
  'Referral Journey Tracker': 'रेफरल प्रगति ट्रैकर',
  'रेफरल प्रगती ट्रॅकर': 'रेफरल प्रगति ट्रैकर',
  'Referred': 'रेफर किया गया',
  'रेफर केले': 'रेफर किया गया',
  'Reached Hospital': 'अस्पताल पहुंचे',
  'रुग्णालय पोहोचले': 'अस्पताल पहुंचे',
  'Specialist Consult': 'विशेषज्ञ परामर्श',
  'तज्ञ सल्ला': 'विशेषज्ञ परामर्श',
  'Treatment Complete': 'उपचार पूर्ण',
  'उपचार पूर्ण': 'उपचार पूर्ण',
  'लक्षण तपासणी (त्रिआज)': 'लक्षण जाँच (ट्रिआज)',
  'Assess Severity': 'गंभीरता पहचानें',
  'गंभीरता ओळखा': 'गंभीरता पहचानें',
  '108 Emergency Service': '१०८ आपातकालीन सेवा',
  'Ambulance SOS': 'त्वरित एम्बुलेंस',
  'तात्काळ रुग्णवाहिका': 'त्वरित एम्बुलेंस',

  // ASHA & Doctor Terms
  'Online Mode — Real-time synchronization active': 'ऑनलाइन — समस्त डेटा क्लाउड सर्वर से सीधे सिंक है',
  'ऑनलाइन — सर्व डेटा क्लाउड सर्व्हरशी थेट समक्रमित आहे': 'ऑनलाइन — समस्त डेटा क्लाउड सर्वर से सीधे सिंक है',
  'Offline Mode — Records saved locally; auto-sync upon connectivity': 'ऑफलाइन मोड — डेटा स्थानीय रूप से सुरक्षित है; नेटवर्क आने पर सिंक होगा',
  'ऑफलाइन मोड — डेटा स्थानिक पातळीवर सुरक्षित आहे; नेटवर्क आल्यावर सिंक होईल': 'ऑफलाइन मोड — डेटा स्थानीय रूप से सुरक्षित है; नेटवर्क आने पर सिंक होगा',
  'Simulate Offline': 'ऑफलाइन सिमुलेशन',
  'ऑफलाइन सिम्युलेट करा': 'ऑफलाइन सिमुलेशन',
  'Connect Online': 'ऑनलाइन हों',
  'ऑनलाइन व्हा': 'ऑनलाइन हों',
  'National Health Mission · Accredited Social Health Activist': 'राष्ट्रीय स्वास्थ्य मिशन · मान्यताप्राप्त सामाजिक स्वास्थ्य कार्यकर्ता (ASHA)',
  'राष्ट्रीय आरोग्य अभियान · मान्यताप्राप्त सामाजिक आरोग्य कार्यकर्ती': 'राष्ट्रीय स्वास्थ्य मिशन · मान्यताप्राप्त सामाजिक स्वास्थ्य कार्यकर्ता (ASHA)',
  'Vadgaon Sub-Centre · Shirur Block · Pune': 'वडगांव उपकेंद्र · शिरूर ब्लॉक · पुणे',
  'वडगाव उपकेंद्र · शिरूर ब्लॉक · पुणे': 'वडगांव उपकेंद्र · शिरूर ब्लॉक · पुणे',
  'Today Tasks': 'आज के कार्य',
  'आजचे कार्य': 'आज के कार्य',
  'Completed': 'पूर्ण कार्य',
  'पूर्ण कार्ये': 'पूर्ण कार्य',
  'Pending': 'लंबित कार्य',
  'प्रलंबित': 'लंबित कार्य',
  'High Risk': 'उच्च जोखिम मरीज़',
  'उच्च जोखीम': 'उच्च जोखिम',
  'उच्च जोखीम रुग्ण': 'उच्च जोखिम मरीज़',
  'Register New Patient': 'नया मरीज़ जोड़ें',
  'नवीन रुग्ण जोडा': 'नया मरीज़ जोड़ें',
  'Daily Tasks': 'दैनिक कार्यसूची',
  'All': 'सभी',
  'सर्व': 'सभी',
  'High Priority': 'उच्च प्राथमिकता',
  'उच्च प्राधान्य': 'उच्च प्राथमिकता',
  'Home Visit': 'घर-घर दौरा',
  'घरोघरी भेट': 'घर-घर दौरा',
  'Immunization Follow-up': 'टीकाकरण फॉलो-अप',
  'लसीकरण पाठपुरावा': 'टीकाकरण फॉलो-अप',
  'ANC Checkup': 'एएनसी जाँच',
  'ANC तपासणी': 'एएनसी जाँच',
  'TB DOTS Dispense': 'टीबी दवा वितरण',
  'टीबी औषध वितरण': 'टीबी दवा वितरण',
  'On Duty': 'ड्यूटी पर उपस्थित (Active)',
  'कर्तव्यावर उपस्थित (Active)': 'ड्यूटी पर उपस्थित (Active)',
  'Medical Officer (MBBS, DGO) · Primary Health Centre Shirur': 'चिकित्सा अधिकारी · प्राथमिक स्वास्थ्य केंद्र शिरूर',
  'वैद्यकीय अधिकारी (Medical Officer) · प्राथमिक आरोग्य केंद्र शिरूर': 'चिकित्सा अधिकारी · प्राथमिक स्वास्थ्य केंद्र शिरूर',
  'Teleconsult Queue': 'टेलीकंसल्ट प्रतीक्षा',
  'टेलीकन्सल्ट प्रतीक्षा': 'टेलीकंसल्ट प्रतीक्षा',
  'Urgent Cases': 'आपातकालीन मामले',
  'तातडीच्या केसेस': 'आपातकालीन मामले',
  'Start Consult': 'परामर्श शुरू करें',
  'परामर्श सुरू करा': 'परामर्श शुरू करें',
  'Generate Rx': 'प्रिस्क्रिप्शन बनाएं',
  'प्रिस्क्रिप्शन जनरेट करा': 'प्रिस्क्रिप्शन बनाएं',
  'Send Referral': 'रेफरल भेजें',
  'रेफरल पाठवा': 'रेफरल भेजें',

  // Admin & Facility Terms
  'District Health Administration': 'जिला स्वास्थ्य प्रशासन डैशबोर्ड',
  'जिल्हा आरोग्य प्रशासन डॅशबोर्ड': 'जिला स्वास्थ्य प्रशासन डैशबोर्ड',
  'Directorate of Health Services · Government of Maharashtra': 'सार्वजनिक स्वास्थ्य विभाग · राष्ट्रीय स्वास्थ्य मिशन (NHM) महाराष्ट्र',
  'सार्वजनिक आरोग्य विभाग · राष्ट्रीय आरोग्य अभियान (NHM) महाराष्ट्र': 'सार्वजनिक स्वास्थ्य विभाग · राष्ट्रीय स्वास्थ्य मिशन (NHM) महाराष्ट्र',
  'Executive Overview & HMIS Trends': 'प्रशासनिक समीक्षा व रुझान',
  'प्रशासकीय आढावा व कल': 'प्रशासनिक समीक्षा व रुझान',
  'Facility Command Dashboard': 'सुविधा कमांड डैशबोर्ड',
  'सुविधा कमांड डॅशबोर्ड': 'सुविधा कमांड डैशबोर्ड',
  'Export Report': 'रिपोर्ट प्रिंट करें',
  'अहवाल प्रिंट करा': 'रिपोर्ट प्रिंट करें',
  'Total OPD Footfall': 'कुल ओपीडी मरीज़ संख्या',
  'एकूण OPD रुग्णसंख्या': 'कुल ओपीडी मरीज़ संख्या',
  'Teleconsultations Done': 'पूर्ण टेलीकंसल्टेशन',
  'टेलीकन्सल्टेशन पूर्ण': 'पूर्ण टेलीकंसल्टेशन',
  'Active Referrals': 'सक्रिय रेफरल',
  'सक्रिय रेफरल्स': 'सक्रिय रेफरल',
  'Essential Drug Availability': 'आवश्यक दवा उपलब्धता',
  'आवश्यक औषध उपलब्धता': 'आवश्यक दवा उपलब्धता',
  'High-Risk Compliance': 'उच्च जोखिम फॉलो-अप',
  'उच्च जोखीम पाठपुरावा': 'उच्च जोखिम फॉलो-अप',
  'Village Patient Registry (Vadgaon)': 'गाँव मरीज़ पंजीका (वडगांव कार्यक्षेत्र)',
  'गाव रुग्ण नोंदवही (वडगाव कार्यक्षेत्र)': 'गाँव मरीज़ पंजीका (वडगांव कार्यक्षेत्र)',
  'Risk Level:': 'जोखिम स्तर:',
  'जोखीम स्तर:': 'जोखिम स्तर:',
  'Conditions': 'स्वास्थ्य स्थिति / निदान',
  'आरोग्य स्थिती / निदान': 'स्वास्थ्य स्थिति / निदान',
  'Follow-up:': 'आगामी भेंट:',
  'पुढील भेट:': 'आगामी भेंट:',
  'Call': 'कॉल करें',
  'कॉल करा': 'कॉल करें',
  'Examine': 'जाँच करें',
  'तपासा': 'जाँच करें',
  'Search by name, ABHA ID, or phone...': 'नाम, आभा आईडी या फोन नंबर से खोजें...',
  'नाव, ABHA ID किंवा फोन नंबरने शोधा...': 'नाम, आभा आईडी या फोन नंबर से खोजें...',
  'Search test or barcode...': 'जाँच नाम या बारकोड से खोजें...',
  'तपासणी नाव किंवा बारकोड...': 'जाँच नाम या बारकोड से खोजें...',
  'Filter by urgency, facility, or status...': 'गंभीरता, केंद्र या स्थिति अनुसार फ़िल्टर करें...'
};

// Ordered phrase replacements for dynamic deep Hindi translation (longest phrases first)
const HINDI_PHRASE_RULES: [RegExp, string][] = [
  // Multi-word phrases (English -> Hindi)
  [/\bIntegrated Rural Healthcare\b/gi, 'एकीकृत ग्रामीण स्वास्थ्य सेवा'],
  [/\bPrimary Health Centres?\b/gi, 'प्राथमिक स्वास्थ्य केंद्र'],
  [/\bPrimary Health Center\b/gi, 'प्राथमिक स्वास्थ्य केंद्र'],
  [/\bDistrict Hospitals?\b/gi, 'जिला अस्पताल'],
  [/\bSub-Centres?\b/gi, 'उपकेंद्र'],
  [/\bSub-Center\b/gi, 'उपकेंद्र'],
  [/\bCommunity Health Centres?\b/gi, 'सामुदायिक स्वास्थ्य केंद्र'],
  [/\bNational Health Mission\b/gi, 'राष्ट्रीय स्वास्थ्य मिशन'],
  [/\bPublic Health Department\b/gi, 'सार्वजनिक स्वास्थ्य विभाग'],
  [/\bPublic Health Dept\b/gi, 'सार्वजनिक स्वास्थ्य विभाग'],
  [/\bGovt of Maharashtra\b/gi, 'महाराष्ट्र शासन'],
  [/\bGovernment of Maharashtra\b/gi, 'महाराष्ट्र शासन'],
  [/\bTeleconsultation Room\b/gi, 'वीडियो कंसल्ट रूम'],
  [/\bTeleconsult Room\b/gi, 'वीडियो कंसल्ट रूम'],
  [/\bTeleconsultations?\b/gi, 'टेलीकंसल्टेशन (दूर परामर्श)'],
  [/\bTeleconsults?\b/gi, 'टेलीकंसल्ट'],
  [/\bEmergency SOS\b/gi, 'आपातकालीन SOS'],
  [/\bEmergency Ambulances?\b/gi, 'आपातकालीन एम्बुलेंस'],
  [/\bAmbulance SOS\b/gi, 'त्वरित एम्बुलेंस'],
  [/\bEmergency Service\b/gi, 'आपातकालीन सेवा'],
  [/\bBook Appointments?\b/gi, 'अपॉइंटमेंट बुक करें'],
  [/\bView Records?\b/gi, 'स्वास्थ्य रिकॉर्ड देखें'],
  [/\bHealth Records?\b/gi, 'स्वास्थ्य रिकॉर्ड'],
  [/\bMedicine Stocks?\b/gi, 'दवा उपलब्धता'],
  [/\bMedicine Supply Chain\b/gi, 'दवा आपूर्ति श्रृंखला'],
  [/\bMedicine Supply\b/gi, 'दवा आपूर्ति'],
  [/\bSymptom Triage\b/gi, 'लक्षण ट्रिआज'],
  [/\bClinical Visit History\b/gi, 'नैदानिक भेंट इतिहास'],
  [/\bVisit History\b/gi, 'भेंट इतिहास'],
  [/\bActive Referral Cases?\b/gi, 'सक्रिय रेफरल मामला'],
  [/\bActive Referrals?\b/gi, 'सक्रिय रेफरल'],
  [/\bReferral Trackers?\b/gi, 'रेफरल ट्रैकर'],
  [/\bFull Referral Tracker\b/gi, 'पूरा रेफरल ट्रैकर'],
  [/\bReferrals?\b/gi, 'रेफरल'],
  [/\bPatient Portals?\b/gi, 'मरीज़ पोर्टल'],
  [/\bASHA Portals?\b/gi, 'आशा पोर्टल'],
  [/\bDoctor Portals?\b/gi, 'डॉक्टर पोर्टल'],
  [/\bDistrict Admin\b/gi, 'जिला प्रशासन'],
  [/\bPortal Access \(Login\)\b/gi, 'पोर्टल प्रवेश (लॉगिन)'],
  [/\bPortal Access\b/gi, 'पोर्टल प्रवेश'],
  [/\bAccess Portals\b/gi, 'पोर्टल प्रवेश करें'],
  [/\bView All Records\b/gi, 'सभी रिकॉर्ड देखें'],
  [/\bView All\b/gi, 'सभी देखें'],
  [/\bUpcoming Appointments?\b/gi, 'आगामी अपॉइंटमेंट'],
  [/\bChief Complaint\b/gi, 'मुख्य लक्षण / शिकायत'],
  [/\bLogged Vitals\b/gi, 'दर्ज महत्वपूर्ण संकेत'],
  [/\bOn Duty\b/gi, 'ड्यूटी पर उपस्थित'],
  [/\bMedical Officers?\b/gi, 'चिकित्सा अधिकारी'],
  [/\bUrgent Cases?\b/gi, 'आपातकालीन मामले'],
  [/\bStart Video Consult\b/gi, 'वीडियो कंसल्ट शुरू करें'],
  [/\bSpecialist Referrals?\b/gi, 'विशेषज्ञ रेफरल'],
  [/\bDistrict Command Center\b/gi, 'जिला नियंत्रण कक्ष'],
  [/\bCommand Dashboard\b/gi, 'कमांड डैशबोर्ड'],
  [/\bCommand Center\b/gi, 'कमांड सेंटर'],
  [/\bFacility Command Center\b/gi, 'सुविधा कमांड सेंटर'],
  [/\bFacility Matrix\b/gi, 'स्वास्थ्य केंद्र मैट्रिक्स'],
  [/\bExecutive Overview\b/gi, 'प्रशासनिक समीक्षा'],
  [/\bOperational Status\b/gi, 'संचालन स्थिति'],
  [/\bOperational Matrix\b/gi, 'संचालन मैट्रिक्स'],
  [/\bStaff Attendance\b/gi, 'कर्मचारी उपस्थिति'],
  [/\bExport Report\b/gi, 'रिपोर्ट प्रिंट करें'],
  [/\bDrug Availability\b/gi, 'दवा उपलब्धता'],
  [/\bActive Facilities\b/gi, 'सक्रिय केंद्र'],
  [/\bHigh-Risk Cases?\b/gi, 'उच्च जोखिम मामले'],
  [/\bHigh-Risk Cohort\b/gi, 'उच्च जोखिम मरीज़'],
  [/\bHigh-Risk Patients?\b/gi, 'उच्च जोखिम मरीज़'],
  [/\bHigh Risk\b/gi, 'उच्च जोखिम'],
  [/\bHigh Priority\b/gi, 'उच्च प्राथमिकता'],
  [/\bVillage Registry\b/gi, 'गाँव मरीज़ सूची'],
  [/\bRegister Patient\b/gi, 'नया मरीज़ पंजीकरण'],
  [/\bRegister New Patient\b/gi, 'नया मरीज़ जोड़ें'],
  [/\bField Triage & Doctor\b/gi, 'फील्ड ट्रिआज व डॉक्टर'],
  [/\bField Triage\b/gi, 'फील्ड ट्रिआज'],
  [/\bLive Queue TV\b/gi, 'लाइव कतार टीवी'],
  [/\bQueue TV\b/gi, 'कतार टीवी'],
  [/\bNow Serving\b/gi, 'वर्तमान टोकन'],
  [/\bWait Time\b/gi, 'प्रतीक्षा समय'],
  [/\bAll Calls\b/gi, 'सभी कॉल्स'],
  [/\bCompleted\b/gi, 'पूर्ण'],
  [/\bPending\b/gi, 'लंबित'],
  [/\bScheduled\b/gi, 'नियोजित'],
  [/\bPatients Tracked\b/gi, 'ट्रैक किए गए मरीज़'],
  [/\bPatients Seen\b/gi, 'उपचारित मरीज़'],
  [/\bTotal Consults\b/gi, 'कुल परामर्श'],
  [/\bTotal Patients\b/gi, 'कुल मरीज़'],
  [/\bTotal Facilities\b/gi, 'कुल स्वास्थ्य केंद्र'],
  [/\bActive PHCs\b/gi, 'सक्रिय प्राथमिक स्वास्थ्य केंद्र'],
  [/\bOnline Mode\b/gi, 'ऑनलाइन मोड'],
  [/\bOffline Mode\b/gi, 'ऑफलाइन मोड'],
  [/\bSimulate Offline\b/gi, 'ऑफलाइन सिमुलेट करें'],
  [/\bConnect Online\b/gi, 'ऑनलाइन कनेक्ट करें'],
  [/\bVoice Assistant\b/gi, 'आवाज़ सहायक'],
  [/\bListen Overview\b/gi, 'जानकारी सुनें'],
  [/\bTry Live Simulation\b/gi, 'लाइव सिमुलेशन देखें'],
  [/\bPrescribe Lab Test\b/gi, 'लैब जाँच लिखें'],
  [/\bDiagnostic Lab Hub\b/gi, 'डिजिटल लैब व जाँच केंद्र'],
  [/\bDiagnostic Findings\b/gi, 'जाँच निष्कर्ष'],
  [/\bNABL Verified\b/gi, 'NABL प्रमाणित'],
  [/\bSample collection\b/gi, 'सैंपल कलेक्शन'],
  [/\bBlood Group\b/gi, 'रक्त समूह'],
  [/\bBlood\b/gi, 'रक्त'],
  [/\bWeight\b/gi, 'वजन'],
  [/\bAge\b/gi, 'उम्र'],
  [/\bGender\b/gi, 'लिंग'],
  [/\bMale\b/gi, 'पुरुष'],
  [/\bFemale\b/gi, 'महिला'],
  [/\bDone\b/gi, 'पूर्ण'],
  [/\bCancel\b/gi, 'रद्द करें'],
  [/\bSubmit\b/gi, 'सबमिट करें'],
  [/\bSave\b/gi, 'सहेजें'],
  [/\bBack\b/gi, 'वापस'],
  [/\bNext\b/gi, 'आगे'],
  [/\bClose\b/gi, 'बंद करें'],
  [/\bSearch\b/gi, 'खोजें'],
  [/\bFilter\b/gi, 'फ़िल्टर'],
  [/\bPrint\b/gi, 'प्रिंट करें'],
  [/\bDownload\b/gi, 'डाउनलोड करें'],
  [/\bUpload\b/gi, 'अपलोड करें'],
  [/\bCall\b/gi, 'कॉल करें'],
  [/\bDetails\b/gi, 'विवरण'],
  [/\bStatus\b/gi, 'स्थिति'],
  [/\bSettings\b/gi, 'सेटिंग्स'],
  [/\bOverview\b/gi, 'विहंगावलोकन'],
  [/\bHistory\b/gi, 'इतिहास'],
  [/\bVitals\b/gi, 'महत्वपूर्ण संकेत'],
  [/\bSymptoms\b/gi, 'लक्षण'],
  [/\bDiagnosis\b/gi, 'निदान'],
  [/\bPrescriptions?\b/gi, 'पर्चा (Rx)'],
  [/\bMedicines?\b/gi, 'दवाइयाँ'],
  [/\bDoctors?\b/gi, 'डॉक्टर'],
  [/\bHospitals?\b/gi, 'अस्पताल'],
  [/\bAmbulances?\b/gi, 'एम्बुलेंस'],
  [/\bPatients?\b/gi, 'मरीज़'],

  // Multi-word phrases (Marathi -> Hindi)
  [/सार्वजनिक आरोग्य विभाग/g, 'सार्वजनिक स्वास्थ्य विभाग'],
  [/राष्ट्रीय आरोग्य अभियान/g, 'राष्ट्रीय स्वास्थ्य मिशन'],
  [/महाराष्ट्र शासन/g, 'महाराष्ट्र शासन'],
  [/प्राथमिक आरोग्य केंद्र/g, 'प्राथमिक स्वास्थ्य केंद्र'],
  [/जिल्हा रुग्णालय/g, 'जिला अस्पताल'],
  [/उपजिल्हा रुग्णालय/g, 'उप-जिला अस्पताल'],
  [/ग्रामीण रुग्णालय/g, 'ग्रामीण अस्पताल'],
  [/आरोग्य केंद्र/g, 'स्वास्थ्य केंद्र'],
  [/वैद्यकीय अधिकारी/g, 'चिकित्सा अधिकारी'],
  [/मान्यताप्राप्त सामाजिक आरोग्य कार्यकर्ती/g, 'मान्यताप्राप्त सामाजिक स्वास्थ्य कार्यकर्ता'],
  [/आशा कार्यकर्ती/g, 'आशा कार्यकर्ता'],
  [/आशा कार्यकर्त्या/g, 'आशा कार्यकर्ताएँ'],
  [/आशा कार्यकर्त्यांनी/g, 'आशा कार्यकर्ताओं ने'],
  [/रुग्ण नोंदणी/g, 'मरीज़ पंजीकरण'],
  [/नवीन रुग्ण नोंदणी/g, 'नया मरीज़ पंजीकरण'],
  [/नवीन रुग्ण/g, 'नया मरीज़'],
  [/गाव रुग्ण यादी/g, 'गाँव मरीज़ सूची'],
  [/गाव रुग्ण नोंदवही/g, 'गाँव मरीज़ पंजीका'],
  [/रुग्ण यादी/g, 'मरीज़ सूची'],
  [/रुग्ण रेकॉर्ड्स/g, 'मरीज़ रिकॉर्ड्स'],
  [/माझ्या आरोग्य नोंदी/g, 'मेरे स्वास्थ्य रिकॉर्ड'],
  [/आरोग्य नोंदी/g, 'स्वास्थ्य रिकॉर्ड'],
  [/मागील तपासणी इतिहास/g, 'नैदानिक भेंट इतिहास'],
  [/तपासणी इतिहास/g, 'जाँच इतिहास'],
  [/प्रसूतीपूर्व तपासणी/g, 'प्रसवपूर्व जाँच'],
  [/औषध पुरवठा साखळी/g, 'दवा आपूर्ति श्रृंखला'],
  [/औषध उपलब्धता/g, 'दवा उपलब्धता'],
  [/औषध साठा/g, 'दवा स्टॉक'],
  [/औषध साठा तपासणी/g, 'दवा स्टॉक जाँच'],
  [/मोफत औषध साठा/g, 'निःशुल्क दवा भंडार'],
  [/मोफत औषध/g, 'निःशुल्क दवा'],
  [/सक्रिय रेफरल केस/g, 'सक्रिय रेफरल मामला'],
  [/सक्रिय रेफरल्स/g, 'सक्रिय रेफरल'],
  [/सक्रिय रेफरल/g, 'सक्रिय रेफरल'],
  [/रेफरल सेतू ट्रॅकर/g, 'रेफरल सेतु ट्रैकर'],
  [/रेफरल सेतू/g, 'रेफरल सेतु'],
  [/रेफरल स्थिती/g, 'रेफरल स्थिति'],
  [/रेफरल प्रगती ट्रॅकर/g, 'रेफरल प्रगति ट्रैकर'],
  [/संपूर्ण ट्रॅकर पहा/g, 'पूरा ट्रैकर देखें'],
  [/रुग्णालय संदर्भ/g, 'अस्पताल संदर्भ'],
  [/रुग्णवाहिका ट्रॅकिंग/g, 'एम्बुलेंस ट्रैकिंग'],
  [/१०८ रुग्णवाहिका/g, '१०८ एम्बुलेंस'],
  [/रुग्णवाहिका/g, 'एम्बुलेंस'],
  [/आणीबाणी सेवा/g, 'आपातकालीन सेवा'],
  [/आणीबाणी १०८/g, 'आपातकाल १०८'],
  [/आणीबाणी/g, 'आपातकाल'],
  [/आपत्कालीन/g, 'आपातकालीन'],
  [/तातडीच्या केसेस/g, 'आपातकालीन मामले'],
  [/तातडीने कॉल करा/g, 'तुरंत कॉल करें'],
  [/तातडीने/g, 'तुरंत'],
  [/तातडीचे/g, 'उच्च प्राथमिकता'],
  [/उच्च जोखीम रुग्ण ट्रॅकर/g, 'उच्च जोखिम मरीज़ ट्रैकर'],
  [/उच्च जोखीम रुग्ण/g, 'उच्च जोखिम मरीज़'],
  [/उच्च जोखीम/g, 'उच्च जोखिम'],
  [/जोखीम स्तर/g, 'जोखिम स्तर'],
  [/जोखीम यादी पहा/g, 'जोखिम सूची देखें'],
  [/जोखीम यादी/g, 'जोखिम सूची'],
  [/लक्षण तपासणी \(त्रिआज\)/g, 'लक्षण जाँच (ट्रिआज)'],
  [/लक्षण तपासणी/g, 'लक्षण जाँच'],
  [/दूर सल्लामसलत/g, 'दूर परामर्श'],
  [/सल्लामसलत/g, 'परामर्श'],
  [/व्हिडिओ कन्सल्ट रूम/g, 'वीडियो कंसल्ट रूम'],
  [/टेलीकन्सल्टेशन सुरू करा/g, 'टेलीकंसल्टेशन शुरू करें'],
  [/टेलीकन्सल्टेशन पूर्ण/g, 'पूर्ण टेलीकंसल्टेशन'],
  [/टेलीकन्सल्टेशन/g, 'टेलीकंसल्टेशन'],
  [/टेलीकन्सल्ट प्रतीक्षा/g, 'टेलीकंसल्ट प्रतीक्षा'],
  [/टेलीकन्सल्ट यादी/g, 'टेलीकंसल्ट सूची'],
  [/थेट रांग टीव्ही/g, 'लाइव कतार टीवी'],
  [/रांग टीव्ही/g, 'कतार टीवी'],
  [/प्रतीक्षा वेळ/g, 'प्रतीक्षा समय'],
  [/प्रतीक्षा यादी/g, 'प्रतीक्षा सूची'],
  [/चालू टोकन/g, 'वर्तमान टोकन'],
  [/घरोघरी/g, 'घर-घर'],
  [/वेळापत्रक/g, 'समय-सारणी'],
  [/लसीकरण पाठपुरावा/g, 'टीकाकरण फॉलो-अप'],
  [/लसीकरण/g, 'टीकाकरण'],
  [/पाठपुरावा/g, 'फॉलो-अप'],
  [/कर्मचारी उपस्थिती/g, 'कर्मचारी उपस्थिति'],
  [/प्रशासकीय आढावा व कल/g, 'प्रशासनिक समीक्षा व रुझान'],
  [/प्रशासकीय आढावा/g, 'प्रशासनिक समीक्षा'],
  [/एकूण तपासण्या/g, 'कुल परामर्श'],
  [/एकूण रुग्णसंख्या/g, 'कुल मरीज़ संख्या'],
  [/एकूण रुग्ण/g, 'कुल मरीज़'],
  [/आजचे रुग्ण/g, 'आज के मरीज़'],
  [/आजच्या एकूण तपासण्या/g, 'आज के कुल परामर्श'],
  [/आजच्या तपासण्या/g, 'आज के परामर्श'],
  [/कार्यरत केंद्रे/g, 'सक्रिय केंद्र'],
  [/सर्व केंद्रे/g, 'सभी केंद्र'],
  [/सर्व नोंदी पहा/g, 'सभी रिकॉर्ड देखें'],
  [/सर्व नोंदी/g, 'सभी रिकॉर्ड'],
  [/सर्व कॉल्स/g, 'सभी कॉल्स'],
  [/तपशील पहा/g, 'विवरण देखें'],
  [/माहिती ऐका/g, 'जानकारी सुनें'],
  [/पोर्टल प्रवेश करा/g, 'पोर्टल प्रवेश करें'],
  [/पोर्टल प्रवेश/g, 'पोर्टल प्रवेश'],
  [/सबमिट करा/g, 'सबमिट करें'],
  [/रद्द करा/g, 'रद्द करें'],
  [/जतन करा/g, 'सहेजें'],
  [/बाहेर पडा/g, 'बाहर निकलें'],
  [/मुख्यपृष्ठावर जा/g, 'मुख्य पृष्ठ पर लौटें'],
  [/मुख्यपृष्ठ/g, 'होम'],
  [/प्रलंबित/g, 'लंबित'],
  [/पूर्ण झाले/g, 'पूर्ण'],
  [/नोंद करा/g, 'चिह्नित करें'],
  [/कॉल करा/g, 'कॉल करें'],
  [/तपासा/g, 'जाँचें'],
  [/वर्षे/g, 'वर्ष'],
  [/रक्तगट/g, 'रक्त समूह'],
  [/शेवटची भेट:/g, 'पिछली भेंट:'],
  [/शेवटची भेट/g, 'पिछली भेंट'],
  [/पुढील भेट:/g, 'अगली भेंट:'],
  [/पुढील भेट/g, 'अगली भेंट'],
  [/उद्या सकाळी/g, 'कल सुबह'],
  [/उद्या/g, 'कल'],
  [/सकाळी/g, 'सुबह'],
  [/दुपारी/g, 'दोपहर'],
  [/वाजता/g, 'बजे'],
  [/शिल्लक/g, 'शेष'],
  [/नोंदवही/g, 'पंजीका'],
  [/नोंदी/g, 'रिकॉर्ड'],
  [/नोंदणी/g, 'पंजीकरण'],
  [/तपासणी/g, 'जाँच'],
  [/चाचणी/g, 'जाँच'],
  [/चाचण्या/g, 'जाँचें'],
  [/अहवाल/g, 'रिपोर्ट'],
  [/औषधे/g, 'दवाइयाँ'],
  [/औषध/g, 'दवा'],
  [/साठा/g, 'स्टॉक'],
  [/केंद्रे/g, 'केंद्र'],
  [/रुग्ण/g, 'मरीज़']
];

export interface LanguageContextType {
  language: Language;
  lang: Language; // Backward compatibility alias
  langConfig: LanguageMeta;
  changeLanguage: (code: Language) => void;
  setLang: (code: Language) => void; // Backward compatibility alias
  t: (key: string, replacements?: Record<string, string | number>) => string;
  tr: (enText: string, mrText?: string, hiText?: string) => string;
  pick: <T>(options: { en: T; mr?: T; hi?: T }) => T;
  isRTL: boolean;
  supportedLanguages: LanguageMeta[];
  speechCode: string;
  isHindi: boolean;
  isMarathi: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  lang: 'en',
  langConfig: SUPPORTED_LANGUAGES[0],
  changeLanguage: () => {},
  setLang: () => {},
  t: (key: string) => key,
  tr: (en: string) => en,
  pick: <T,>(options: { en: T; mr?: T; hi?: T }) => options.en,
  isRTL: false,
  supportedLanguages: SUPPORTED_LANGUAGES,
  speechCode: 'en-IN',
  isHindi: false,
  isMarathi: false,
  isEnglish: true
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferredLanguage') || localStorage.getItem('hw_lang');
      if (saved === 'mr' || saved === 'en' || saved === 'hi') {
        return saved;
      }
    }
    return 'mr'; // Default to Marathi for Maharashtra state
  });

  const langConfig = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[1];
  }, [language]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', language);
      localStorage.setItem('hw_lang', language);

      document.documentElement.lang = language;
      document.documentElement.dir = langConfig.dir;

      document.body.classList.remove('lang-en', 'lang-mr', 'lang-hi');
      document.body.classList.add('lang-' + language);

      if (language === 'hi') {
        const translateDom = () => {
          // 1. Translate text nodes
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null
          );
          let node = walker.nextNode();
          while (node) {
            const val = node.nodeValue;
            if (val) {
              const trimmed = val.trim();
              if (trimmed) {
                if (HINDI_LOOKUP_MAP[trimmed]) {
                  const target = HINDI_LOOKUP_MAP[trimmed];
                  if (target && target !== trimmed) {
                    node.nodeValue = val.replace(trimmed, target);
                  }
                } else {
                  let updated = val;
                  for (let i = 0; i < HINDI_PHRASE_RULES.length; i++) {
                    const [rule, repl] = HINDI_PHRASE_RULES[i];
                    rule.lastIndex = 0;
                    if (rule.test(updated)) {
                      rule.lastIndex = 0;
                      updated = updated.replace(rule, repl);
                    }
                  }
                  if (updated !== val) {
                    node.nodeValue = updated;
                  }
                }
              }
            }
            node = walker.nextNode();
          }

          // 2. Translate input & textarea placeholders
          const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
          inputs.forEach((el) => {
            const ph = el.getAttribute('placeholder');
            if (ph) {
              const trimmedPh = ph.trim();
              if (HINDI_LOOKUP_MAP[trimmedPh]) {
                el.setAttribute('placeholder', HINDI_LOOKUP_MAP[trimmedPh]);
              }
            }
          });

          // 3. Translate element titles
          const titled = document.querySelectorAll('[title]');
          titled.forEach((el) => {
            const t = el.getAttribute('title');
            if (t) {
              const trimmedT = t.trim();
              if (HINDI_LOOKUP_MAP[trimmedT]) {
                el.setAttribute('title', HINDI_LOOKUP_MAP[trimmedT]);
              }
            }
          });
        };

        const timer = setTimeout(translateDom, 30);

        let isObserving = true;
        const observer = new MutationObserver(() => {
          if (!isObserving) return;
          isObserving = false;
          translateDom();
          setTimeout(() => { isObserving = true; }, 80);
        });

        observer.observe(document.body, { childList: true, subtree: true, characterData: true });

        return () => {
          clearTimeout(timer);
          observer.disconnect();
        };
      }
    }
  }, [language, langConfig]);

  const changeLanguage = useCallback((langCode: Language) => {
    if (TRANSLATIONS[langCode]) {
      setLanguage(langCode);
    }
  }, []);

  const setLang = useCallback((langCode: Language) => {
    changeLanguage(langCode);
  }, [changeLanguage]);

  // Deep get with dot notation e.g. t('triage.title') or flat t('govt_name') with Hindi fallback lookup
  const t = useCallback((key: string, replacements: Record<string, string | number> = {}): string => {
    if (!key) return '';

    const keys = key.split('.');
    let value: any = TRANSLATIONS[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    // Flat key lookup in current language
    if (value === undefined) {
      value = TRANSLATIONS[language]?.[key];
    }

    // If Hindi and not found yet, check comprehensive Hindi map
    if (value === undefined && language === 'hi') {
      value = HINDI_LOOKUP_MAP[key];
    }

    // Fallback to English dictionary
    if (value === undefined) {
      value = TRANSLATIONS.en;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
    }

    // Flat key lookup in English
    if (value === undefined) {
      value = TRANSLATIONS.en?.[key];
    }

    // If Hindi and we resolved an English string, check if English string has Hindi translation
    if (language === 'hi' && typeof value === 'string' && HINDI_LOOKUP_MAP[value]) {
      value = HINDI_LOOKUP_MAP[value];
    }

    if (typeof value === 'string' && Object.keys(replacements).length > 0) {
      return Object.entries(replacements).reduce(
        (str, [k, val]) => str.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), String(val)),
        value
      );
    }

    if (typeof value === 'string') {
      return value;
    }

    // Final fallback to Hindi map for key itself
    if (language === 'hi' && HINDI_LOOKUP_MAP[key]) {
      return HINDI_LOOKUP_MAP[key];
    }

    return key;
  }, [language]);

  // tr helper: resolves text across English, Marathi, Hindi with automatic fallbacks
  const tr = useCallback((enText: string, mrText?: string, hiText?: string): string => {
    if (language === 'hi') {
      return hiText || (mrText ? HINDI_LOOKUP_MAP[mrText] : undefined) || HINDI_LOOKUP_MAP[enText] || mrText || enText;
    }
    if (language === 'mr') {
      return mrText || enText;
    }
    return enText;
  }, [language]);

  // pick helper: select object property based on active language
  const pick = useCallback(<T,>(options: { en: T; mr?: T; hi?: T }): T => {
    if (language === 'hi' && options.hi !== undefined) {
      return options.hi;
    }
    if (language === 'mr' && options.mr !== undefined) {
      return options.mr;
    }
    return options.en;
  }, [language]);

  const value = useMemo(() => ({
    language,
    lang: language,
    langConfig,
    changeLanguage,
    setLang,
    t,
    tr,
    pick,
    isRTL: langConfig.dir === 'rtl',
    supportedLanguages: SUPPORTED_LANGUAGES,
    speechCode: langConfig.speechCode,
    isHindi: language === 'hi',
    isMarathi: language === 'mr',
    isEnglish: language === 'en'
  }), [language, langConfig, changeLanguage, setLang, t, tr, pick]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageContext;
