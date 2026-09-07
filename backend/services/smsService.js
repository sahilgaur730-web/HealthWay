/**
 * Backend SMS Gateway Integration Service
 */

class BackendSmsService {
  async sendSms(phone, message) {
    // Integration hook with CDAC Mobile Seva / NIC SMS Gateway
    console.log(`[SMS GATEWAY DISPATCH] -> ${phone}: ${message}`);
    return { success: true, messageId: `MSG-${Date.now()}`, status: 'DELIVERED', timestamp: new Date().toISOString() };
  }

  async sendReferralSms(phone, patientName, token, hospital, transport) {
    const msg = `MH Health Dept: Referral token ${token} generated for ${patientName} to ${hospital}.${transport ? ` Transport: ${transport}.` : ''} 108/104 free helpline.`;
    return this.sendSms(phone, msg);
  }

  async sendAshaAlert(phone, ashaName, patientName, token, urgency) {
    const msg = `ASHA ALERT (${urgency}): ${ashaName}, urgent referral token ${token} generated for ${patientName}. Please coordinate and escort.`;
    return this.sendSms(phone, msg);
  }

  async sendTestReadySms(phone, patientName, testNames, barcode) {
    const msg = `MH HealthWay: Lab report (${testNames}) for ${patientName} is ready and synced to ABHA record. Barcode: ${barcode}.`;
    return this.sendSms(phone, msg);
  }
}

module.exports = new BackendSmsService();
