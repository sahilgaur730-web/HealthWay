/**
 * Backend Reminder & Overdue Chron Service
 * Monitors active referrals against SLA limits and triggers reminders/escalations
 */

const smsService = require('./smsService');

const URGENCY_SLA_HOURS = {
  EMERGENCY: 2,
  URGENT: 24,
  ROUTINE: 72,
  ELECTIVE: 168
};

class BackendReminderService {
  /**
   * Evaluates if a referral has exceeded its SLA timeline
   * @param {Object} referral 
   * @returns {Object} status analysis
   */
  evaluateReferralSla(referral) {
    if (referral.stage === 'COMPLETED' || referral.stage === 'CANCELLED') {
      return { isOverdue: false, overdueHours: 0, slaMet: true };
    }

    const urgency = referral.urgency || 'ROUTINE';
    const maxHours = URGENCY_SLA_HOURS[urgency] || 72;
    const createdAtTime = new Date(referral.createdAt || Date.now()).getTime();
    const elapsedHours = (Date.now() - createdAtTime) / (3600 * 1000);

    if (elapsedHours > maxHours) {
      const overdueHours = Math.round((elapsedHours - maxHours) * 10) / 10;
      return {
        isOverdue: true,
        overdueHours,
        maxHours,
        elapsedHours: Math.round(elapsedHours * 10) / 10,
        slaMet: false,
        recommendedAction: urgency === 'EMERGENCY' ? 'ALERT_DHO_AND_108' : 'NOTIFY_ASHA_AND_PATIENT'
      };
    }

    return {
      isOverdue: false,
      overdueHours: 0,
      maxHours,
      elapsedHours: Math.round(elapsedHours * 10) / 10,
      slaMet: true,
      recommendedAction: 'NONE'
    };
  }

  /**
   * Dispatches automated reminder SMS to patient / ASHA
   */
  async dispatchOverdueAlert(referral) {
    const sla = this.evaluateReferralSla(referral);
    if (!sla.isOverdue) return null;

    const patientMsg = `महाराष्ट्र आरोग्य विभाग: आपला रेफरल टोकन ${referral.id || referral.token} नियोजित वेळेत पूर्ण झालेला नाही. मदतीसाठी १०८ वर संपर्क करा.`;
    const ashaMsg = `तातडीचा इशारा: रुग्ण ${referral.patientNameMr || referral.patientNameEn} यांचा रेफरल वेळ (${sla.overdueHours} तास) ओलांडला आहे. कृपया तातडीने पाठपुरावा करा.`;

    const tasks = [];
    if (referral.patientPhone) {
      tasks.push(smsService.sendSms(referral.patientPhone, patientMsg));
    }
    if (referral.ashaPhone) {
      tasks.push(smsService.sendSms(referral.ashaPhone, ashaMsg));
    }

    const results = await Promise.all(tasks);
    return {
      success: true,
      referralId: referral.id || referral.token,
      overdueHours: sla.overdueHours,
      notificationsSent: results.length
    };
  }

  /**
   * Starts overdue background polling cron
   */
  startOverduePolling(intervalMs = 60000) {
    console.log(`[REMINDER CRON] Polling overdue referrals every ${intervalMs / 1000}s`);
    return setInterval(() => {
      // In production, queries DB for active referrals and evaluates SLA
    }, intervalMs);
  }
}

module.exports = new BackendReminderService();
