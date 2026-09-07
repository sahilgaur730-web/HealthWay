/**
 * Queue Notification & Audio Chime Service
 * Handles Web Audio API chime sounds, printable tickets, and simulated SMS/WhatsApp dispatch
 */

import { AppointmentModel } from './queueEngine';

class QueueNotificationService {
  private audioCtx: AudioContext | null = null;

  // Web Audio API Hospital Calling Chime
  public playCallChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const frequencies = [587.33, 880.0, 1174.66]; // D5, A5, D6 melodious clinical chime

      frequencies.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.22);

        gain.gain.setValueAtTime(0.2, now + idx * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.22 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.22);
        osc.stop(now + idx * 0.22 + 0.35);
      });
    } catch (e) {
      console.warn('Audio chime playback notice:', e);
    }
  }

  // Generate downloadable text ticket
  public downloadTicket(appointment: AppointmentModel, lang: 'mr' | 'en' | 'hi' = 'en') {
    const isMr = lang === 'mr';
    const isHi = lang === 'hi';
    const content = `
=====================================================
      HEALTHWAY - GOVT OF MAHARASHTRA
      INTEGRATED RURAL HEALTHCARE ACCESS
=====================================================
${isMr ? 'अपॉइंटमेंट पावती / APPOINTMENT TICKET' : 'APPOINTMENT BOOKING TICKET'}
-----------------------------------------------------
${isMr ? 'अपॉइंटमेंट आयडी' : 'Appointment ID'} : ${appointment.appointmentId}
${isMr ? 'टोकन क्रमांक' : 'Token Number'}   : ${appointment.tokenNumber ? '#' + appointment.tokenNumber : isMr ? 'केंद्रावर दिला जाईल' : 'Assigned at Check-in'}
${isMr ? 'रुग्णाचे नाव' : 'Patient Name'}   : ${appointment.patient.name}
${isMr ? 'वय / लिंग' : 'Age / Gender'}     : ${appointment.patient.age} yrs / ${appointment.patient.gender}
${isMr ? 'मोबाईल' : 'Mobile'}             : +91 ${appointment.patient.phone}
${appointment.patient.abhaId ? (isMr ? 'आभा आयडी' : 'ABHA ID') + '           : ' + appointment.patient.abhaId + '\n' : ''}
-----------------------------------------------------
${isMr ? 'आरोग्य केंद्र' : 'Health Center'}   : ${appointment.healthCenterName}
${isMr ? 'विभाग' : 'Department'}          : ${appointment.department}
${appointment.doctorName ? (isMr ? 'डॉक्टर' : 'Doctor') + '              : ' + appointment.doctorName + '\n' : ''}
${isMr ? 'दिनांक' : 'Date'}                : ${new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
${isMr ? 'वेळ' : 'Time Slot'}            : ${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}
${isMr ? 'प्राधान्य' : 'Priority'}          : ${appointment.priority.toUpperCase()}
-----------------------------------------------------
${isMr ? 'सूचना' : 'INSTRUCTIONS'}:
1. Please arrive 15 minutes before your scheduled slot.
2. Bring your Aadhaar Card or ABHA Health Card.
3. Show this ticket or appointment SMS at the reception counter.
4. Emergency assistance: Dial 108 (24x7 Free Service).
=====================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HealthWay_${appointment.appointmentId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Simulated SMS dispatcher for demo feedback
  public logSimulatedSMS(type: string, phone: string, text: string) {
    console.log(`[HealthWay SMS Service] [${type}] To: +91-${phone} => ${text}`);
  }
}

export const queueNotificationService = new QueueNotificationService();
