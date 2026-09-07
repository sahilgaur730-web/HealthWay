import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PortalSwitcher from './components/common/PortalSwitcher';
import OfflineIndicator from './components/offline/OfflineIndicator';

// Public
import LandingPage from './pages/public/LandingPage';

// Patient Portal
import PatientLogin from './pages/patient/PatientLogin';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientConsultation from './pages/patient/PatientConsultation';
import BookAppointment from './pages/patient/BookAppointment';
import MyRecords from './pages/patient/MyRecords';
import MedicineCheck from './pages/patient/MedicineCheck';
import ReferralStatus from './pages/patient/ReferralStatus';
import Triage from './pages/patient/Triage';
import EmergencyPage from './pages/patient/EmergencyPage';

// ASHA Portal
import AshaDashboard from './pages/asha/AshaDashboard';
import AshaConsultation from './pages/asha/AshaConsultation';
import AshaPatients from './pages/asha/AshaPatients';
import AshaRegister from './pages/asha/AshaRegister';
import AshaTriage from './pages/asha/AshaTriage';
import ASHAWorkerMode from './components/language/ASHAWorkerMode';
import AmbulanceTracker from './components/emergency/AmbulanceTracker';
import EmergencyContacts from './components/emergency/EmergencyContacts';

// Doctor Portal
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorCall from './pages/doctor/DoctorCall';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorReferrals from './pages/doctor/DoctorReferrals';

// Dedicated Referral & Diagnostic Hubs (Demand 5 & 6)
import ReferralPage from './pages/ReferralPage';
import DiagnosticPage from './pages/DiagnosticPage';

// Universal Teleconsultation
import UniversalConsultation from './pages/teleconsultation/UniversalConsultation';

// Queue & Appointment System
import QueueDisplay from './pages/queue/QueueDisplay';
import HealthCenterDashboard from './pages/queue/HealthCenterDashboard';

// Admin Portal & Facility Dashboards (Demand 9 & 13)
import AdminOverview from './pages/admin/AdminOverview';
import FacilitiesPage from './pages/admin/FacilitiesPage';
import DistrictDashboardPage from './pages/admin/DistrictDashboardPage';
import MedicineStock from './pages/admin/MedicineStock';
import HighRiskTracker from './pages/admin/HighRiskTracker';
import InteroperabilityPage from './pages/admin/InteroperabilityPage';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans antialiased text-[#1C2B3A] selection:bg-[#1A4B8C] selection:text-white flex flex-col">
      {/* Persistent Evaluator Portal Switcher Bar */}
      <PortalSwitcher />

      {/* Global Offline / Low-Connectivity PWA Indicator Bar (Demand 10) */}
      <OfflineIndicator />

      {/* Main Application Routes */}
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public Showcase & Gateway */}
          <Route path="/" element={<LandingPage />} />

          {/* Universal Teleconsultation Room */}
          <Route path="/consultation" element={<UniversalConsultation />} />

          {/* Queue & Appointment Management Routes */}
          <Route path="/queue" element={<QueueDisplay />} />
          <Route path="/queue-display" element={<QueueDisplay />} />
          <Route path="/staff/queue" element={<HealthCenterDashboard />} />
          <Route path="/health-center/queue" element={<HealthCenterDashboard />} />

          {/* Patient Portal */}
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/consultation" element={<PatientConsultation />} />
          
          <Route path="/patient/book" element={<BookAppointment />} />
          <Route path="/patient/book-appointment" element={<BookAppointment />} />
          
          <Route path="/patient/records" element={<MyRecords />} />
          <Route path="/patient/my-records" element={<MyRecords />} />
          
          <Route path="/patient/medicines" element={<MedicineCheck />} />
          <Route path="/patient/medicine-check" element={<MedicineCheck />} />
          
          <Route path="/patient/referral" element={<ReferralStatus />} />
          <Route path="/patient/referral-status" element={<ReferralStatus />} />
          
          <Route path="/patient/triage" element={<Triage />} />
          <Route path="/patient/emergency" element={<EmergencyPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/sos" element={<EmergencyPage />} />
          <Route path="/emergency/tracker" element={<div className="max-w-4xl mx-auto p-4 sm:p-6 w-full"><AmbulanceTracker /></div>} />
          <Route path="/ambulance" element={<div className="max-w-4xl mx-auto p-4 sm:p-6 w-full"><AmbulanceTracker /></div>} />
          <Route path="/emergency/contacts" element={<div className="max-w-6xl mx-auto p-4 sm:p-6 w-full"><EmergencyContacts /></div>} />
          <Route path="/helplines" element={<div className="max-w-6xl mx-auto p-4 sm:p-6 w-full"><EmergencyContacts /></div>} />

          {/* ASHA Worker Portal */}
          <Route path="/asha" element={<AshaDashboard />} />
          <Route path="/asha/dashboard" element={<AshaDashboard />} />
          <Route path="/asha/consultation" element={<AshaConsultation />} />
          <Route path="/asha/patients" element={<AshaPatients />} />
          <Route path="/asha/register" element={<AshaRegister />} />
          <Route path="/asha/triage" element={<AshaTriage />} />
          <Route path="/asha/mode" element={<ASHAWorkerMode />} />
          <Route path="/asha-mode" element={<ASHAWorkerMode />} />
          <Route path="/voice" element={<ASHAWorkerMode />} />
          <Route path="/voice-input" element={<ASHAWorkerMode />} />

          {/* Doctor Teleconsultation Portal */}
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/call" element={<DoctorCall />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/referrals" element={<DoctorReferrals />} />

          {/* Dedicated Referral & Diagnostic Pipeline Routes (Demand 5 & 6) */}
          <Route path="/referral" element={<ReferralPage />} />
          <Route path="/referrals" element={<ReferralPage />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/diagnostics" element={<DiagnosticPage />} />
          <Route path="/patient/diagnostics" element={<DiagnosticPage />} />
          <Route path="/doctor/diagnostics" element={<DiagnosticPage />} />

          {/* District Admin Dashboard & Facility Dashboards (Demand 9) */}
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/dashboard" element={<AdminOverview />} />
          <Route path="/admin/facilities" element={<FacilitiesPage />} />
          <Route path="/admin/district-dashboard" element={<DistrictDashboardPage />} />
          <Route path="/facility-dashboard" element={<DistrictDashboardPage />} />
          <Route path="/district-dashboard" element={<DistrictDashboardPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/admin/medicines" element={<MedicineStock />} />
          <Route path="/admin/high-risk" element={<HighRiskTracker />} />
          <Route path="/admin/interop" element={<InteroperabilityPage />} />
          <Route path="/interoperability" element={<InteroperabilityPage />} />
          <Route path="/abdm" element={<InteroperabilityPage />} />
          <Route path="/fhir" element={<InteroperabilityPage />} />
          <Route path="/hmis" element={<InteroperabilityPage />} />

          {/* Direct Pipeline & Alias Routes (Demands 7 & 8) */}
          <Route path="/medicines" element={<MedicineCheck />} />
          <Route path="/medicine-stock" element={<MedicineStock />} />
          <Route path="/high-risk" element={<HighRiskTracker />} />
          <Route path="/asha/high-risk" element={<HighRiskTracker />} />
          <Route path="/doctor/high-risk" element={<HighRiskTracker />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
