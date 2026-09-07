export interface SmsDispatchRecord {
  id: string;
  recipientPhone: string;
  recipientName: string;
  recipientRole: 'PATIENT' | 'ASHA' | 'DOCTOR' | 'HOSPITAL';
  channel: 'SMS' | 'WHATSAPP';
  messageText: string;
  language: 'mr' | 'en';
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  timestamp: string;
  deliveryLatencyMs: number;
  templateType: 
    | 'REFERRAL_CREATED' 
    | 'REFERRAL_OVERDUE_ALERT' 
    | 'AMBULANCE_DISPATCH' 
    | 'TEST_ORDER_CREATED' 
    | 'TEST_RESULT_READY'
    | 'CRITICAL_VALUE_ALERT';
}

const SMS_LOGS_KEY = 'hw_sms_logs_v1';

class SmsService {
  private logs: SmsDispatchRecord[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(SMS_LOGS_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      } else {
        this.logs = [];
      }
    } catch {
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(SMS_LOGS_KEY, JSON.stringify(this.logs));
    } catch {
      // storage fallback
    }
  }

  public sendReferralSms(
    patientPhone: string,
    patientName: string,
    referralToken: string,
    targetHospital: string,
    ambulanceDetails?: string,
    lang: 'mr' | 'en' = 'mr'
  ): SmsDispatchRecord {
    const text = lang === 'mr'
      ? `महाराष्ट्र शासन आरोग्य विभाग: ${patientName} यांचा रेफरल टोकन ${referralToken} तयार झाला आहे. रुग्णालय: ${targetHospital}.${ambulanceDetails ? ` रुग्णवाहिका: ${ambulanceDetails}.` : ''} १०८/१०४ मोफत मदत.`
      : `Govt of Maharashtra Health Dept: Referral token ${referralToken} generated for ${patientName}. Hospital: ${targetHospital}.${ambulanceDetails ? ` Transport: ${ambulanceDetails}.` : ''} Helpline 108/104.`;

    const record: SmsDispatchRecord = {
      id: `SMS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      recipientPhone: patientPhone,
      recipientName: patientName,
      recipientRole: 'PATIENT',
      channel: 'SMS',
      messageText: text,
      language: lang,
      status: 'DELIVERED',
      timestamp: new Date().toLocaleTimeString(),
      deliveryLatencyMs: Math.floor(400 + Math.random() * 600),
      templateType: 'REFERRAL_CREATED',
    };

    this.logs.unshift(record);
    this.saveLogs();
    return record;
  }

  public sendAshaAlert(
    ashaPhone: string,
    ashaName: string,
    patientName: string,
    referralToken: string,
    urgency: string,
    lang: 'mr' | 'en' = 'mr'
  ): SmsDispatchRecord {
    const text = lang === 'mr'
      ? `आशा अलर्ट (तातडीचे): ${ashaName}, रुग्ण ${patientName} यांचा आपत्कालीन रेफरल (${urgency}) टोकन ${referralToken} तयार झाला आहे. कृपया त्वरित सोबत जा व समन्वय करा.`
      : `ASHA ALERT (URGENT): ${ashaName}, urgent referral (${urgency}) token ${referralToken} issued for patient ${patientName}. Please escort/coordinate immediately.`;

    const record: SmsDispatchRecord = {
      id: `SMS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      recipientPhone: ashaPhone,
      recipientName: ashaName,
      recipientRole: 'ASHA',
      channel: 'SMS',
      messageText: text,
      language: lang,
      status: 'DELIVERED',
      timestamp: new Date().toLocaleTimeString(),
      deliveryLatencyMs: 380,
      templateType: 'REFERRAL_OVERDUE_ALERT',
    };

    this.logs.unshift(record);
    this.saveLogs();
    return record;
  }

  public sendTestReadySms(
    patientPhone: string,
    patientName: string,
    testNames: string,
    barcode: string,
    lang: 'mr' | 'en' = 'mr'
  ): SmsDispatchRecord {
    const text = lang === 'mr'
      ? `महाराष्ट्र आरोग्य सेतू: ${patientName} यांचा लॅब अहवाल (${testNames}) तयार असून ABHA रेकॉर्डमध्ये अपलोड झाला आहे. बारकोड: ${barcode}.`
      : `Govt HealthWay: Diagnostic report (${testNames}) for ${patientName} is verified and synced to ABHA record. Barcode: ${barcode}.`;

    const record: SmsDispatchRecord = {
      id: `SMS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      recipientPhone: patientPhone,
      recipientName: patientName,
      recipientRole: 'PATIENT',
      channel: 'SMS',
      messageText: text,
      language: lang,
      status: 'DELIVERED',
      timestamp: new Date().toLocaleTimeString(),
      deliveryLatencyMs: 520,
      templateType: 'TEST_RESULT_READY',
    };

    this.logs.unshift(record);
    this.saveLogs();
    return record;
  }

  public getRecentLogs(): SmsDispatchRecord[] {
    return [...this.logs];
  }
}

export const smsService = new SmsService();
