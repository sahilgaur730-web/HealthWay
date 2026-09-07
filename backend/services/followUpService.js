/**
 * Follow-Up Service & Escalation Engine (Backend Spec)
 * Automated evaluation of overdue visits across high-risk maternal, NCD, and TB cohorts
 */

const FollowUpService = {
  evaluateDailySchedules: async () => {
    // Check all registered high-risk patients
    return {
      evaluatedAt: new Date().toISOString(),
      overdueFound: 2,
      alertsDispatched: 2
    };
  },

  triggerDay1AshaAlert: async (patient, asha) => {
    // Send SMS to ASHA worker
    return {
      recipient: asha.phone,
      messageType: 'DAY_1_OVERDUE_ASHA_ALERT',
      sent: true
    };
  },

  triggerDay3SupervisorEscalation: async (patient, phcDoctor) => {
    // Escalate to PHC Medical Officer
    return {
      recipient: phcDoctor.phone,
      messageType: 'DAY_3_MO_ESCALATION',
      sent: true
    };
  },

  triggerDay7DistrictIntervention: async (patient) => {
    // Critical alert to District Health Officer & 108 Emergency
    return {
      messageType: 'DAY_7_DHO_CRITICAL_INTERVENTION',
      dispatched: true
    };
  }
};

module.exports = FollowUpService;
