/**
 * HealthWay Secure Session & Authentication Test Harness
 * Implements AuthContext contract from PROJECT.md
 */

export type UserRole = 'patient' | 'asha' | 'doctor' | 'admin';

export interface UserSession {
  role: UserRole;
  token?: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    abhaId?: string;
    phone?: string;
    facilityId?: string;
    facilityName?: string;
    registrationNo?: string;
  };
}

export class MockAuthService {
  private session: UserSession | null = null;
  private secureStore: Map<string, string> = new Map();
  private otpStore: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map();

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.session = null;
    this.secureStore.clear();
    this.otpStore.clear();
  }

  public getSession(): UserSession | null {
    return this.session ? JSON.parse(JSON.stringify(this.session)) : null;
  }

  public isAuthenticated(): boolean {
    return this.session !== null && !!this.session.token;
  }

  public async setRole(role: UserRole): Promise<void> {
    if (!this.session) {
      this.session = {
        role,
        token: `MOCK-TOKEN-${role.toUpperCase()}-${Date.now()}`,
        user: {
          id: `USR-${role.toUpperCase()}-001`,
          name: `Default ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        },
      };
    } else {
      this.session.role = role;
    }
  }

  public validateAbhaId(abhaId: string): boolean {
    if (!abhaId) return false;
    const clean = abhaId.replace(/-/g, '').trim();
    return /^\d{14}$/.test(clean);
  }

  public async generateOtp(identifier: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(identifier, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min TTL
      attempts: 0,
    });
    return code;
  }

  public async verifyOtp(identifier: string, inputOtp: string): Promise<{ success: boolean; error?: string }> {
    const record = this.otpStore.get(identifier);
    if (!record) {
      return { success: false, error: 'OTP_NOT_FOUND' };
    }
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(identifier);
      return { success: false, error: 'OTP_EXPIRED' };
    }
    if (record.attempts >= 3) {
      return { success: false, error: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    if (record.code !== inputOtp) {
      record.attempts += 1;
      return { success: false, error: 'INVALID_OTP' };
    }

    // Success
    this.otpStore.delete(identifier);
    return { success: true };
  }

  public async loginWithAbha(abhaId: string, otp: string): Promise<boolean> {
    if (!this.validateAbhaId(abhaId)) {
      return false;
    }
    // Hardcoded test override OTP: '123456'
    let otpValid = otp === '123456';
    if (!otpValid) {
      const result = await this.verifyOtp(abhaId, otp);
      otpValid = result.success;
    }

    if (!otpValid) return false;

    const token = `JWT-ABHA-${Date.now()}`;
    await this.secureStore.set('authToken', token);
    await this.secureStore.set('abhaId', abhaId);

    this.session = {
      role: 'patient',
      token,
      user: {
        id: `PT-${abhaId.replace(/-/g, '').slice(-6)}`,
        name: 'Sunita Ramchandra Jadhav',
        abhaId,
        phone: '+91 98220 12345',
        facilityId: 'FAC001',
        facilityName: 'District Hospital Satara',
      },
    };
    return true;
  }

  public async authenticateBiometric(userWantsSuccess: boolean = true): Promise<boolean> {
    if (!userWantsSuccess) return false;
    const token = `BIOMETRIC-TOKEN-${Date.now()}`;
    await this.secureStore.set('authToken', token);
    this.session = {
      role: 'patient',
      token,
      user: {
        id: 'PT-BIO-001',
        name: 'Sunita Ramchandra Jadhav',
        abhaId: '14-4821-9876-5432',
      },
    };
    return true;
  }

  public async logout(): Promise<void> {
    this.session = null;
    this.secureStore.clear();
  }

  public async getSecureItem(key: string): Promise<string | null> {
    return this.secureStore.get(key) || null;
  }

  public async setSecureItem(key: string, value: string): Promise<void> {
    this.secureStore.set(key, value);
  }
}
