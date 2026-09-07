import React from 'react';
import { useNavigate } from 'react-router-dom';
import TeleconsultationRoom from '../../components/teleconsultation/TeleconsultationRoom';
import { CURRENT_PATIENT } from '../../data/mockData';

export default function PatientConsultation() {
  const navigate = useNavigate();

  return (
    <TeleconsultationRoom 
      userRole="patient" 
      roomId="tele_mh_phc_402"
      patientName={CURRENT_PATIENT.nameEn}
      patientAge={CURRENT_PATIENT.age}
      onExit={() => navigate('/patient/dashboard')}
    />
  );
}
