/**
 * NHM & HMIS Government Reporting Service (Backend Spec)
 * National Health Mission (NHM) Monthly Indicators, MCTS, Nikshay TB & NCD Registries
 * Strictly zero unicode emojis.
 */

class NhmReporter {
  constructor() {
    this.failedQueue = [];
    this.submissionHistory = [];
  }

  /**
   * National Health Mission HMIS Monthly Indicator Report (Forms 1-12)
   */
  getHmisMonthlyReport(month = 'June 2024') {
    return [
      {
        code: 'HMIS-M1',
        formNumber: 'Form 1.1',
        nameEn: 'Total Antenatal Care (ANC) Registrations',
        nameMr: 'एकूण नोंदणीकृत गरोदर माता (ANC)',
        category: 'Maternal Health',
        target: 1200,
        achieved: 1142,
        performancePercent: 95.2,
        status: 'OPTIMAL',
        reportingMonth: month
      },
      {
        code: 'HMIS-M2',
        formNumber: 'Form 1.4',
        nameEn: 'High-Risk Pregnancies Tracked & Escorted',
        nameMr: 'शोधलेल्या व पाठपुरावा केलेल्या उच्च जोखीम माता',
        category: 'Maternal Health',
        target: 180,
        achieved: 168,
        performancePercent: 93.3,
        status: 'OPTIMAL',
        reportingMonth: month
      },
      {
        code: 'HMIS-M3',
        formNumber: 'Form 2.1',
        nameEn: 'Institutional Deliveries at Public Health Facilities',
        nameMr: 'शासकीय रुग्णालयांमधील संस्थात्मक प्रसूती',
        category: 'Maternal Health',
        target: 450,
        achieved: 438,
        performancePercent: 97.3,
        status: 'OPTIMAL',
        reportingMonth: month
      },
      {
        code: 'HMIS-M4',
        formNumber: 'Form 3.2',
        nameEn: 'Full Immunization Coverage (Infants 9-11 Months)',
        nameMr: 'संपूर्ण लसीकरण झालेले बालके (० ते १ वर्ष)',
        category: 'Immunization',
        target: 950,
        achieved: 924,
        performancePercent: 97.2,
        status: 'OPTIMAL',
        reportingMonth: month
      },
      {
        code: 'HMIS-M5',
        formNumber: 'Form 6.1',
        nameEn: 'Outpatient Attendance (Total OPD Consultations)',
        nameMr: 'बाह्यरुग्ण तपासणी (एकूण ओपीडी संख्या)',
        category: 'OPD & Telehealth',
        target: 15000,
        achieved: 14820,
        performancePercent: 98.8,
        status: 'OPTIMAL',
        reportingMonth: month
      },
      {
        code: 'HMIS-M6',
        formNumber: 'Form 6.5',
        nameEn: 'Teleconsultations via HealthWay / eSanjeevani',
        nameMr: 'हेल्थवे द्वारे यशस्वी दूर सल्लामसलत (Teleconsults)',
        category: 'OPD & Telehealth',
        target: 3000,
        achieved: 3421,
        performancePercent: 114.0,
        status: 'OPTIMAL',
        reportingMonth: month
      },
      {
        code: 'HMIS-M7',
        formNumber: 'Form 7.2',
        nameEn: 'NCD Universal Screening (Hypertension & Diabetes)',
        nameMr: 'असंगर्गजन्य रोग तपासणी (३०+ वयोगट)',
        category: 'Communicable Diseases',
        target: 5200,
        achieved: 4890,
        performancePercent: 94.0,
        status: 'ACCEPTABLE',
        reportingMonth: month
      },
      {
        code: 'HMIS-M8',
        formNumber: 'Form 8.1',
        nameEn: 'TB Notifications on Nikshay Portal with DBT Linking',
        nameMr: 'निक्षय पोर्टलवर नोंदणीकृत व पोषण सहाय्य जोडलेले क्षयरुग्ण',
        category: 'Communicable Diseases',
        target: 65,
        achieved: 62,
        performancePercent: 95.4,
        status: 'OPTIMAL',
        reportingMonth: month
      }
    ];
  }

  /**
   * MCTS (Mother and Child Tracking System) Data Feed
   */
  getMctsReport(month = 'June 2024') {
    return {
      reportingMonth: month,
      facilityId: 'MH-PN-WAG-01',
      totalMothersTracked: 1142,
      highRiskMothers: 168,
      ancCheckupsCompleted: {
        anc1: 1142,
        anc2: 1084,
        anc3: 1020,
        anc4: 980
      },
      infantsRegistered: 890,
      immunizationDueList: 42,
      dropoutRatePercent: 1.8
    };
  }

  /**
   * Nikshay TB Surveillance & DBT Linking Report
   */
  getNikshayReport(month = 'June 2024') {
    return {
      reportingMonth: month,
      presumptiveCasesTested: 240,
      confirmedTbCases: 62,
      cbnaatDone: 198,
      dotsAdherenceRate: 96.4,
      dbtBeneficiaryLinkedCount: 60,
      monthlyPoshanDisbursedInr: 30000,
      treatmentCompletedCount: 48
    };
  }

  /**
   * NCD Universal Population Screening Report
   */
  getNcdReport(month = 'June 2024') {
    return {
      reportingMonth: month,
      targetPopulation30Plus: 5200,
      screenedCount: 4890,
      hypertensionSuspected: 412,
      diabetesSuspected: 320,
      cancerScreeningCompleted: 850,
      referralLinkageRatePercent: 91.5
    };
  }

  /**
   * Submit Report to NHM Portal with retry logic
   */
  async submitHmisReport(reportData) {
    const submissionId = `SUB-HMIS-${Date.now()}`;
    const isSuccess = Math.random() > 0.05; // 95% simulated success rate

    if (!isSuccess) {
      const queueItem = {
        id: `FAIL-${Date.now()}`,
        system: 'HMIS',
        type: 'MONTHLY_INDICATORS',
        payload: reportData,
        queuedAt: new Date().toISOString(),
        retryAttempts: 1,
        lastError: 'HTTP 503 Gateway Timeout - NHM National Server Busy'
      };
      this.failedQueue.push(queueItem);
      return {
        success: false,
        status: 'QUEUED_FOR_RETRY',
        error: queueItem.lastError,
        queueId: queueItem.id
      };
    }

    const record = {
      submissionId,
      system: 'HMIS',
      status: 'ACKNOWLEDGED',
      timestamp: new Date().toISOString(),
      ackNumber: `NHM-ACK-2024-${Math.floor(100000 + Math.random() * 900000)}`
    };
    this.submissionHistory.push(record);

    return {
      success: true,
      submissionId,
      status: 'ACKNOWLEDGED',
      ackNumber: record.ackNumber,
      message: 'HMIS Monthly Indicators successfully verified and ingested into NHM Central Gateway'
    };
  }

  /**
   * Get all queued failed submissions
   */
  getFailedQueue() {
    return this.failedQueue;
  }

  /**
   * Retry all failed submissions
   */
  async retryFailedQueue() {
    const total = this.failedQueue.length;
    if (total === 0) {
      return { success: true, processedCount: 0, message: 'Queue is clean. No pending retries.' };
    }

    const successfulRetries = [];
    const remainingFailed = [];

    for (const item of this.failedQueue) {
      // Simulate success on retry
      item.retryAttempts += 1;
      if (item.retryAttempts >= 2) {
        successfulRetries.push({
          queueId: item.id,
          system: item.system,
          ackNumber: `RETRY-ACK-${Date.now()}`
        });
      } else {
        remainingFailed.push(item);
      }
    }

    this.failedQueue = remainingFailed;
    return {
      success: true,
      recoveredCount: successfulRetries.length,
      remainingFailedCount: remainingFailed.length,
      recoveredItems: successfulRetries
    };
  }
}

module.exports = new NhmReporter();
