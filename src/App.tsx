import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PortalSwitcher from './components/common/PortalSwitcher';
import OfflineIndicator from './components/offline/OfflineIndicator';
import RoleGuard from './components/common/RoleGuard';

// Public
import LandingPage from './pages/public/LandingPage';
import AuthPortal from './pages/auth/AuthPortal';

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

          {/* Universal Authentication & Database User Access */}
          <Route path="/login" element={<AuthPortal initialMode="login" />} />
          <Route path="/signup" element={<AuthPortal initialMode="signup" />} />
          <Route path="/register" element={<AuthPortal initialMode="signup" />} />
          <Route path="/auth" element={<AuthPortal initialMode="login" />} />
          <Route path="/asha/login" element={<AuthPortal initialMode="login" initialRole="asha" />} />
          <Route path="/doctor/login" element={<AuthPortal initialMode="login" initialRole="doctor" />} />
          <Route path="/admin/login" element={<AuthPortal initialMode="login" initialRole="admin" />} />

          {/* Patient Portal (Guarded for Patients & Intake) */}
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route
            path="/patient"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="Citizen & Patient Portal"
                requiredPortalNameMr="नागरिक व रुग्ण पोर्टल"
              >
                <PatientDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="Citizen & Patient Portal"
                requiredPortalNameMr="नागरिक व रुग्ण पोर्टल"
              >
                <PatientDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/consultation"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="Patient Teleconsultation"
                requiredPortalNameMr="रुग्ण दूरध्वनी सल्लामसलत"
              >
                <PatientConsultation />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/book"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="Book Appointment"
                requiredPortalNameMr="तपासणी वेळ नोंदवा"
              >
                <BookAppointment />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/book-appointment"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="Book Appointment"
                requiredPortalNameMr="तपासणी वेळ नोंदवा"
              >
                <BookAppointment />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/records"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="My Health Records (ABHA)"
                requiredPortalNameMr="माझ्या आरोग्य नोंदी (आभा)"
              >
                <MyRecords />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/my-records"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="My Health Records (ABHA)"
                requiredPortalNameMr="माझ्या आरोग्य नोंदी (आभा)"
              >
                <MyRecords />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/medicines"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="Medicine Availability"
                requiredPortalNameMr="औषध साठा उपलब्धता"
              >
                <MedicineCheck />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/medicine-check"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="Medicine Availability"
                requiredPortalNameMr="औषध साठा उपलब्धता"
              >
                <MedicineCheck />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/referral"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="Referral Tracking"
                requiredPortalNameMr="रेफरल सद्यस्थिती"
              >
                <ReferralStatus />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/referral-status"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="Referral Tracking"
                requiredPortalNameMr="रेफरल सद्यस्थिती"
              >
                <ReferralStatus />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/triage"
            element={
              <RoleGuard
                allowedRoles={['patient', 'asha']}
                requiredPortalNameEn="Symptom Triage & Intake"
                requiredPortalNameMr="लक्षण तपासणी व ट्रायज"
              >
                <Triage />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/register"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="New Patient Registration & Intake"
                requiredPortalNameMr="नवीन रुग्ण नोंदणी व तपासणी"
              >
                <AshaRegister />
              </RoleGuard>
            }
          />
          <Route
            path="/patient/intake"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="Patient Intake & Frontline Screening"
                requiredPortalNameMr="रुग्ण नोंदणी व तपासणी"
              >
                <AshaRegister />
              </RoleGuard>
            }
          />

          {/* Emergency & SOS Routes (Always Open to Citizens & Frontline) */}
          <Route path="/patient/emergency" element={<EmergencyPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/sos" element={<EmergencyPage />} />
          <Route
            path="/emergency/tracker"
            element={
              <div className="max-w-4xl mx-auto p-4 sm:p-6 w-full">
                <AmbulanceTracker />
              </div>
            }
          />
          <Route
            path="/ambulance"
            element={
              <div className="max-w-4xl mx-auto p-4 sm:p-6 w-full">
                <AmbulanceTracker />
              </div>
            }
          />
          <Route
            path="/emergency/contacts"
            element={
              <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full">
                <EmergencyContacts />
              </div>
            }
          />
          <Route
            path="/helplines"
            element={
              <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full">
                <EmergencyContacts />
              </div>
            }
          />

          {/* ASHA Worker Portal (Role-Guarded for ASHA Workers) */}
          <Route
            path="/asha"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="ASHA Field Worker Portal"
                requiredPortalNameMr="आशा कार्यकर्ती पोर्टल"
              >
                <AshaDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/asha/dashboard"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="ASHA Field Worker Portal"
                requiredPortalNameMr="आशा कार्यकर्ती पोर्टल"
              >
                <AshaDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/asha/consultation"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="ASHA Teleconsultation Hub"
                requiredPortalNameMr="आशा दूरध्वनी सल्लामसलत केंद्र"
              >
                <AshaConsultation />
              </RoleGuard>
            }
          />
          <Route
            path="/asha/patients"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="ASHA Beneficiary Register"
                requiredPortalNameMr="आशा लाभार्थी नोंदवही"
              >
                <AshaPatients />
              </RoleGuard>
            }
          />
          <Route
            path="/asha/register"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="New Patient Registration & Intake"
                requiredPortalNameMr="नवीन रुग्ण नोंदणी व तपासणी"
              >
                <AshaRegister />
              </RoleGuard>
            }
          />
          <Route
            path="/asha/triage"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="Frontline Clinical Triage"
                requiredPortalNameMr="आशा प्राथमिक ट्रायज तपासणी"
              >
                <AshaTriage />
              </RoleGuard>
            }
          />
          <Route
            path="/asha/mode"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="ASHA Voice & Field Mode"
                requiredPortalNameMr="आशा व्हॉइस व फील्ड मोड"
              >
                <ASHAWorkerMode />
              </RoleGuard>
            }
          />
          <Route
            path="/asha-mode"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="ASHA Voice & Field Mode"
                requiredPortalNameMr="आशा व्हॉइस व फील्ड मोड"
              >
                <ASHAWorkerMode />
              </RoleGuard>
            }
          />
          <Route
            path="/voice"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="ASHA Voice & Field Mode"
                requiredPortalNameMr="आशा व्हॉइस व फील्ड मोड"
              >
                <ASHAWorkerMode />
              </RoleGuard>
            }
          />
          <Route
            path="/voice-input"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="ASHA Voice & Field Mode"
                requiredPortalNameMr="आशा व्हॉइस व फील्ड मोड"
              >
                <ASHAWorkerMode />
              </RoleGuard>
            }
          />
          <Route
            path="/asha/high-risk"
            element={
              <RoleGuard
                allowedRoles={['asha']}
                requiredPortalNameEn="High-Risk Maternal & NCD Surveillance"
                requiredPortalNameMr="अतिजोखमीचे रुग्ण सनियंत्रण"
              >
                <HighRiskTracker />
              </RoleGuard>
            }
          />

          {/* Doctor Teleconsultation Portal (Role-Guarded for Doctors) */}
          <Route
            path="/doctor"
            element={
              <RoleGuard
                allowedRoles={['doctor']}
                requiredPortalNameEn="Doctor Teleconsultation Portal"
                requiredPortalNameMr="वैद्यकीय अधिकारी पोर्टल"
              >
                <DoctorDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <RoleGuard
                allowedRoles={['doctor']}
                requiredPortalNameEn="Doctor Teleconsultation Portal"
                requiredPortalNameMr="वैद्यकीय अधिकारी पोर्टल"
              >
                <DoctorDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/doctor/call"
            element={
              <RoleGuard
                allowedRoles={['doctor']}
                requiredPortalNameEn="Doctor Clinical Video Call"
                requiredPortalNameMr="वैद्यकीय व्हिडिओ तपासणी"
              >
                <DoctorCall />
              </RoleGuard>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <RoleGuard
                allowedRoles={['doctor']}
                requiredPortalNameEn="Doctor Patient Caseload"
                requiredPortalNameMr="वैद्यकीय रुग्ण यादी"
              >
                <DoctorPatients />
              </RoleGuard>
            }
          />
          <Route
            path="/doctor/referrals"
            element={
              <RoleGuard
                allowedRoles={['doctor']}
                requiredPortalNameEn="Doctor Clinical Referrals"
                requiredPortalNameMr="वैद्यकीय रेफरल व्यवस्था"
              >
                <DoctorReferrals />
              </RoleGuard>
            }
          />
          <Route
            path="/doctor/high-risk"
            element={
              <RoleGuard
                allowedRoles={['doctor']}
                requiredPortalNameEn="Doctor High-Risk Surveillance"
                requiredPortalNameMr="वैद्यकीय अतिजोखमीचे रुग्ण सनियंत्रण"
              >
                <HighRiskTracker />
              </RoleGuard>
            }
          />

          {/* Dedicated Referral & Diagnostic Pipeline Hubs */}
          <Route path="/referral" element={<ReferralPage />} />
          <Route path="/referrals" element={<ReferralPage />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route
            path="/patient/diagnostics"
            element={
              <RoleGuard
                allowedRoles={['patient']}
                requiredPortalNameEn="Patient Diagnostic Records"
                requiredPortalNameMr="रुग्ण निदान तपासणी"
              >
                <DiagnosticPage />
              </RoleGuard>
            }
          />
          <Route
            path="/doctor/diagnostics"
            element={
              <RoleGuard
                allowedRoles={['doctor']}
                requiredPortalNameEn="Doctor Diagnostics Coordination"
                requiredPortalNameMr="वैद्यकीय निदान समन्वय"
              >
                <DiagnosticPage />
              </RoleGuard>
            }
          />

          {/* District Admin Dashboard & Facility Dashboards (Role-Guarded for Admins) */}
          <Route
            path="/admin"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="District Health Administration"
                requiredPortalNameMr="जिल्हा आरोग्य प्रशासन"
              >
                <AdminOverview />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="District Health Administration"
                requiredPortalNameMr="जिल्हा आरोग्य प्रशासन"
              >
                <AdminOverview />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/facilities"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="District Health Facilities Matrix"
                requiredPortalNameMr="जिल्हा आरोग्य केंद्र संचलन"
              >
                <FacilitiesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/district-dashboard"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="District 36-Facility Command Center"
                requiredPortalNameMr="जिल्हा ३६-केंद्रे कमांड केंद्र"
              >
                <DistrictDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/facility-dashboard"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="Facility Command Matrix"
                requiredPortalNameMr="आरोग्य केंद्र कमांड मॅट्रिक्स"
              >
                <DistrictDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/district-dashboard"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="District 36-Facility Command Center"
                requiredPortalNameMr="जिल्हा ३६-केंद्रे कमांड केंद्र"
              >
                <DistrictDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/facilities"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="District Facilities Network"
                requiredPortalNameMr="जिल्हा आरोग्य केंद्र नेटवर्क"
              >
                <FacilitiesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/medicines"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="District Drug Inventory Oversight"
                requiredPortalNameMr="जिल्हा औषध पुरवठा सनियंत्रण"
              >
                <MedicineStock />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/high-risk"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="District High-Risk Epidemiology Surveillance"
                requiredPortalNameMr="जिल्हा अतिजोखमीचे रुग्ण सनियंत्रण"
              >
                <HighRiskTracker />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/interop"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="National Digital Health Mission (ABDM) Gateway"
                requiredPortalNameMr="राष्ट्रीय डिजिटल आरोग्य अभियान (ABDM)"
              >
                <InteroperabilityPage />
              </RoleGuard>
            }
          />
          <Route
            path="/interoperability"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="National Digital Health Mission (ABDM) Gateway"
                requiredPortalNameMr="राष्ट्रीय डिजिटल आरोग्य अभियान (ABDM)"
              >
                <InteroperabilityPage />
              </RoleGuard>
            }
          />
          <Route
            path="/abdm"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="ABDM Gateway Integration"
                requiredPortalNameMr="आयुष्मान भारत डिजिटल मिशन"
              >
                <InteroperabilityPage />
              </RoleGuard>
            }
          />
          <Route
            path="/fhir"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="HL7 FHIR R4 Interoperability Engine"
                requiredPortalNameMr="HL7 FHIR R4 आंतरप्रणाली"
              >
                <InteroperabilityPage />
              </RoleGuard>
            }
          />
          <Route
            path="/hmis"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                requiredPortalNameEn="NHM & HMIS National Reporting Bridge"
                requiredPortalNameMr="राष्ट्रीय आरोग्य अभियान (NHM/HMIS)"
              >
                <InteroperabilityPage />
              </RoleGuard>
            }
          />

          {/* Shared Clinical Pipelines & Alias Routes */}
          <Route path="/medicines" element={<MedicineCheck />} />
          <Route path="/medicine-stock" element={<MedicineStock />} />
          <Route path="/high-risk" element={<HighRiskTracker />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
