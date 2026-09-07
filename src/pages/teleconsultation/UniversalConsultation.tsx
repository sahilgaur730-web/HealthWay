import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TeleconsultationRoom from '../../components/teleconsultation/TeleconsultationRoom';
import { CURRENT_PATIENT } from '../../data/mockData';

export default function UniversalConsultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const room = searchParams.get('room') || 'tele_mh_phc_402';
  const rawRole = searchParams.get('role') || 'patient';
  const role: 'doctor' | 'asha' | 'patient' = 
    rawRole === 'doctor' || rawRole === 'asha' ? rawRole : 'patient';
  const name = searchParams.get('name') || (role === 'doctor' ? 'Dr. Rajesh Kulkarni' : role === 'asha' ? 'ASHA Priya' : CURRENT_PATIENT.nameEn);
  const age = searchParams.get('age') || CURRENT_PATIENT.age;

  const handleExit = () => {
    if (role === 'doctor') navigate('/doctor/dashboard');
    else if (role === 'asha') navigate('/asha/dashboard');
    else navigate('/patient/dashboard');
  };

  return (
    <TeleconsultationRoom
      roomId={room}
      userRole={role}
      patientName={name}
      patientAge={age}
      onExit={handleExit}
    />
  );
}
