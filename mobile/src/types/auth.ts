/**
 * HealthWay Mobile Authentication & Session Types
 * Complies with PROJECT.md § Interface Contracts (1. AuthContext)
 */

export type UserRole = 'patient' | 'asha' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  nameMr?: string;
  abhaId?: string;
  phone?: string;
  facilityId?: string;
  facilityName?: string;
  registrationNo?: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface UserSession {
  role: UserRole;
  token?: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    nameMr?: string;
    nameHi?: string;
    abhaId?: string;
    phone?: string;
    facilityId?: string;
    facilityName?: string;
    registrationNo?: string;
    avatar?: string;
  };
  expiresAt?: number;
}

export interface AuthContextType {
  session: UserSession;
  user: UserSession['user'];
  setRole: (role: UserRole) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  loginWithAbha: (abhaId: string, otp: string) => Promise<boolean>;
  loginWithBiometrics?: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading?: boolean;
  isBiometricSupported?: boolean;
  availableBiometrics?: string[];
}
