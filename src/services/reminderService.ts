import { referralService, ReferralItem } from './referralService';
import { smsService } from './smsService';

export interface EscalationTicket {
  ticketId: string;
  referralId: string;
  patientName: string;
  urgency: string;
  overdueHours: number;
  escalatedTo: string;
  actionTakenMr: string;
  actionTakenEn: string;
  timestamp: string;
  status: 'OPEN' | 'RESOLVED';
}

class ReminderService {
  private escalationTickets: EscalationTicket[] = [];

  constructor() {
    this.loadTickets();
  }

  private loadTickets() {
    try {
      const stored = localStorage.getItem('hw_escalation_tickets_v1');
      if (stored) {
        this.escalationTickets = JSON.parse(stored);
      }
    } catch {
      this.escalationTickets = [];
    }
  }

  private saveTickets() {
    try {
      localStorage.setItem('hw_escalation_tickets_v1', JSON.stringify(this.escalationTickets));
    } catch {
      // storage fallback
    }
  }

  public runAutoReminders(): { dispatched: number; overdueCount: number } {
    const all = referralService.getAllReferrals();
    let dispatched = 0;
    let overdueCount = 0;

    all.forEach((ref) => {
      if (ref.isOverdue && ref.stage !== 'COMPLETED' && ref.stage !== 'CANCELLED') {
        overdueCount++;
        // Trigger alert to ASHA if not already reminded recently
        const recentReminder = ref.reminders.find(r => r.recipient === 'ASHA');
        if (!recentReminder) {
          referralService.triggerReminder(
            ref.id,
            'ASHA',
            `तातडीचा इशारा: रुग्ण ${ref.patientNameMr} यांचा रेफरल वेळ ${ref.overdueHours || 1} तासाने ओलांडला आहे. कृपया तातडीने पाठपुरावा करा.`,
            `URGENT ALERT: Referral for ${ref.patientNameEn} is overdue by ${ref.overdueHours || 1} hours. Please follow up immediately.`
          );
          if (ref.ashaPhone) {
            smsService.sendAshaAlert(
              ref.ashaPhone,
              ref.ashaName || 'आशा कार्यकर्ती',
              ref.patientNameMr,
              ref.id,
              ref.urgency,
              'mr'
            );
          }
          dispatched++;
        }
      }
    });

    return { dispatched, overdueCount };
  }

  public escalateToDho(referral: ReferralItem, notes: string = ''): EscalationTicket {
    const ticket: EscalationTicket = {
      ticketId: `ESC-DHO-${Date.now().toString().slice(-6)}`,
      referralId: referral.id,
      patientName: referral.patientNameMr,
      urgency: referral.urgency,
      overdueHours: referral.overdueHours || 1,
      escalatedTo: 'जिल्हा आरोग्य अधिकारी (DHO, Pune Zone)',
      actionTakenMr: notes || 'रेफरल मुदत संपल्याने जिल्हा समन्वय पथकाला आपत्कालीन पाठपुरावा आदेश देण्यात आला.',
      actionTakenEn: notes || 'Emergency escalation logged to District Health Command Center for immediate intervention.',
      timestamp: new Date().toLocaleTimeString(),
      status: 'OPEN',
    };

    this.escalationTickets.unshift(ticket);
    this.saveTickets();

    // Also log reminder into referral
    referralService.triggerReminder(
      referral.id,
      'HOSPITAL',
      `जिल्हा प्रशासन एस्कलेशन (DHO Ticket: ${ticket.ticketId}): रुग्णालय समन्वयक तातडीने रुग्ण स्वीकृती नोंदवावी.`,
      `District Command Escalation (Ticket: ${ticket.ticketId}): Priority intake requested by DHO.`
    );

    return ticket;
  }

  public getEscalationTickets(): EscalationTicket[] {
    return [...this.escalationTickets];
  }
}

export const reminderService = new ReminderService();
