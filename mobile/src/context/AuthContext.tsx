/**
 * HealthWay Native Authentication & Role-Based Session Context
 * Government of Maharashtra - Integrated Rural Health Platform
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole, UserSession, AuthContextType } from '../types/auth';

export { UserRole, UserSession, AuthContextType };

const STORAGE_SESSION_KEY = 'hw_auth_session_v1';

// Default Institutional Profiles for instant role switching & evaluation
export const ROLE_PROFILES: Record<UserRole, UserSession['user']> = {
  patient: {
    id: 'PT-001',
    name: 'Ramesh Rao Jadhav',
    nameMr: 'रमेश राव जाधव',
    nameHi: 'रमेश राव जाधव',
    abhaId: '91-2345-6789-0123',
    phone: '+91 98201 98201',
    facilityId: 'FAC-003',
    facilityName: 'PHC Karjat',
  },
  asha: {
    id: 'ASHA-7012',
    name: 'Sunita Tai Shinde',
    nameMr: 'सुनीता ताई शिंदे',
    nameHi: 'सुनीता ताई शिंदे',
    phone: '+91 98223 34455',
    facilityId: 'FAC-003-SC',
    facilityName: 'Sub-Center Kashele',
    registrationNo: 'MH-ASHA-2018-7012',
  },
  doctor: {
    id: 'DOC-401',
    name: 'Dr. Anand S. Kulkarni, MD',
    nameMr: 'डॉ. आनंद एस. कुलकर्णी',
    nameHi: 'डॉ. आनंद एस. कुलकर्णी',
    phone: '+91 94220 11223',
    facilityId: 'FAC-001',
    facilityName: 'Rural Hospital Karjat',
    registrationNo: 'MMC-2014-08912',
  },
  admin: {
    id: 'ADM-101',
    name: 'Smt. Prerna Patil, IAS',
    nameMr: 'श्रीमती प्रेरणा पाटील',
    nameHi: 'श्रीमती प्रेरणा पाटील',
    phone: '+91 98210 99887',
    facilityId: 'DIST-RAIGAD',
    facilityName: 'District Health Office, Raigad',
    registrationNo: 'MH-IAS-2016-042',
  },
};

const DEFAULT_SESSION: UserSession = {
  role: 'patient',
  token: 'mock_hw_token_patient_default',
  user: ROLE_PROFILES.patient,
};

// Safe storage wrapper (SecureStore with AsyncStorage fallback)
async function safeSaveSession(session: UserSession): Promise<void> {
  const json = JSON.stringify(session);
  try {
    await SecureStore.setItemAsync(STORAGE_SESSION_KEY, json);
  } catch {
    await AsyncStorage.setItem(STORAGE_SESSION_KEY, json);
  }
}

async function safeGetSession(): Promise<UserSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  try {
    const raw = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  return null;
}

async function safeClearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_SESSION_KEY);
  } catch {
    // Fallback
  }
  try {
    await AsyncStorage.removeItem(STORAGE_SESSION_KEY);
  } catch {
    // Fallback
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(DEFAULT_SESSION);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false);
  const [availableBiometrics, setAvailableBiometrics] = useState<string[]>([]);

  // Initialize biometrics and restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const [hasHardware, isEnrolled, types, savedSession] = await Promise.all([
          LocalAuthentication.hasHardwareAsync().catch(() => false),
          LocalAuthentication.isEnrolledAsync().catch(() => false),
          LocalAuthentication.supportedAuthenticationTypesAsync().catch(() => []),
          safeGetSession(),
        ]);

        setIsBiometricSupported(hasHardware && isEnrolled);
        setAvailableBiometrics(
          types.map(t => {
            if (t === LocalAuthentication.AuthenticationType.FINGERPRINT) return 'FINGERPRINT';
            if (t === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) return 'FACIAL_RECOGNITION';
            if (t === LocalAuthentication.AuthenticationType.IRIS) return 'IRIS';
            return 'BIOMETRIC';
          })
        );

        if (savedSession) {
          setSession(savedSession);
          setIsAuthenticated(!!savedSession.token);
        }
      } catch (err) {
        console.warn('Auth initialization error', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Switch role dynamically
  const setRole = useCallback(async (newRole: UserRole) => {
    const updatedSession: UserSession = {
      role: newRole,
      token: `hw_sec_token_${Date.now()}_${newRole}`,
      user: ROLE_PROFILES[newRole],
    };
    setSession(updatedSession);
    setIsAuthenticated(true);
    await safeSaveSession(updatedSession);
  }, []);

  // 14-digit ABHA login simulation
  const loginWithAbha = useCallback(async (abhaId: string, otp: string): Promise<boolean> => {
    // Clean formatting
    const cleanedAbha = abhaId.replace(/\D/g, '');
    if (cleanedAbha.length !== 14) {
      return false;
    }
    // Accept valid 6-digit OTP in demo mode (default: 123456 or any 6 digits)
    if (!otp || otp.length !== 6) {
      return false;
    }

    const updatedSession: UserSession = {
      role: 'patient',
      token: `hw_abha_auth_${Date.now()}`,
      user: {
        ...ROLE_PROFILES.patient,
        abhaId: `${cleanedAbha.slice(0, 2)}-${cleanedAbha.slice(2, 6)}-${cleanedAbha.slice(6, 10)}-${cleanedAbha.slice(10, 14)}`,
      },
    };

    setSession(updatedSession);
    setIsAuthenticated(true);
    await safeSaveSession(updatedSession);
    return true;
  }, []);

  // Biometric login
  const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'HealthWay Biometric Login',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use ABHA ID & OTP',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Restore or refresh session
        const currentRole = session.role || 'patient';
        const updatedSession: UserSession = {
          role: currentRole,
          token: `hw_bio_token_${Date.now()}`,
          user: ROLE_PROFILES[currentRole],
        };
        setSession(updatedSession);
        setIsAuthenticated(true);
        await safeSaveSession(updatedSession);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Biometric auth failed', err);
      return false;
    }
  }, [session.role]);

  // Logout
  const logout = useCallback(async () => {
    await safeClearSession();
    setIsAuthenticated(false);
    setSession({
      role: 'patient',
      token: undefined,
      user: ROLE_PROFILES.patient,
    });
  }, []);

  const value = useMemo(() => ({
    session,
    user: session.user,
    setRole,
    switchRole: setRole,
    loginWithAbha,
    loginWithBiometrics,
    logout,
    isAuthenticated,
    isLoading,
    isBiometricSupported,
    availableBiometrics,
  }), [session, setRole, loginWithAbha, loginWithBiometrics, logout, isAuthenticated, isLoading, isBiometricSupported, availableBiometrics]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
