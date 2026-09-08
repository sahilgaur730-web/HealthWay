/**
 * HealthWay Authentication & User Database Service
 * Government of Maharashtra - Integrated Rural Health Platform
 * Supports live backend REST API with seamless IndexedDB / localStorage offline fallback.
 * Strictly zero unicode emojis, 100% Lucide React icons.
 */

import offlineDB, { UserRecord, SessionRecord, UserRole } from './offlineDB';

const LOCAL_STORAGE_USERS_KEY = 'hw_auth_users_cache_v1';
const LOCAL_STORAGE_SESSION_KEY = 'hw_auth_active_session_v1';
const AUTH_EVENT_NAME = 'healthway:auth-change';

// Backend API Base URL with fallback configuration
const API_BASE_URL =
  (typeof window !== 'undefined' && (window as any).__HEALTHWAY_API_URL__) ||
  (import.meta as any).env?.VITE_API_URL ||
  'http://localhost:5000/api/auth';

export const DEFAULT_USERS: UserRecord[] = [
  {
    id: 'user-asha-prachi',
    username: 'prachi-ashaworker',
    password: 'Asha@Prachi2026',
    role: 'asha',
    name: 'Prachi Patil',
    nameMr: 'प्राची पाटील',
    phone: '9822101001',
    village: 'Wagholi',
    villageMr: 'वाघोली',
    subCentre: 'Wagholi SC',
    subCentreMr: 'उपकेंद्र वाघोली',
    facility: 'PHC Wagholi',
    designation: 'Senior ASHA Field Worker',
    designationMr: 'वरिष्ठ आशा कार्यकर्ती',
    createdAt: '2024-01-15T08:00:00.000Z',
    avatar: 'PP'
  },
  {
    id: 'user-asha-rohit',
    username: 'rohit-ashaworker',
    password: 'Asha@Rohit2026',
    role: 'asha',
    name: 'Rohit Kamble',
    nameMr: 'रोहित कांबळे',
    phone: '9822101002',
    village: 'Kharadi',
    villageMr: 'खराडी',
    subCentre: 'Kharadi SC',
    subCentreMr: 'उपकेंद्र खराडी',
    facility: 'PHC Kharadi',
    designation: 'Community Health ASHA Facilitator',
    designationMr: 'समुदाय आरोग्य आशा समन्वयक',
    createdAt: '2024-02-10T08:00:00.000Z',
    avatar: 'RK'
  },
  {
    id: 'user-asha-anjali',
    username: 'anjali-ashaworker',
    password: 'Asha@Anjali2026',
    role: 'asha',
    name: 'Anjali Shinde',
    nameMr: 'अंजली शिंदे',
    phone: '9822101003',
    village: 'Lohegaon',
    villageMr: 'लोहगाव',
    subCentre: 'Lohegaon SC',
    subCentreMr: 'उपकेंद्र लोहगाव',
    facility: 'PHC Lohegaon',
    designation: 'ASHA Health Worker',
    designationMr: 'आशा कार्यकर्ती',
    createdAt: '2024-03-01T08:00:00.000Z',
    avatar: 'AS'
  },
  {
    id: 'user-asha-jaya',
    username: 'jaya-ashaworker',
    password: 'Asha@Jaya2026',
    role: 'asha',
    name: 'Jaya Deshmukh',
    nameMr: 'जया देशमुख',
    phone: '9822101004',
    village: 'Vadgaon',
    villageMr: 'वडगाव',
    subCentre: 'Vadgaon SC',
    subCentreMr: 'उपकेंद्र वडगाव',
    facility: 'PHC Shirur',
    designation: 'Lead ASHA Worker - Maternal Health',
    designationMr: 'प्रमुख आशा कार्यकर्ती',
    createdAt: '2024-03-20T08:00:00.000Z',
    avatar: 'JD'
  },
  {
    id: 'user-doc-shinde',
    username: 'dr.shinde',
    password: 'Doctor@123',
    role: 'doctor',
    name: 'Dr. Anand Shinde',
    nameMr: 'डॉ. आनंद शिंदे',
    phone: '9822202001',
    registrationNo: 'MMC-2016-08492',
    facility: 'PHC Shirur & Telemedicine Node',
    designation: 'Chief Medical Officer & Teleconsult Specialist',
    designationMr: 'वैद्यकीय अधिकारी',
    createdAt: '2023-11-01T08:00:00.000Z',
    avatar: 'AS'
  },
  {
    id: 'user-pat-sunita',
    username: 'sunita.patil',
    password: 'Patient@123',
    role: 'patient',
    name: 'Sunita Patil',
    nameMr: 'सुनीता पाटील',
    phone: '9822304912',
    abhaId: 'MH-PN-24-00000001',
    village: 'Vadgaon',
    villageMr: 'वडगाव',
    facility: 'PHC Shirur',
    designation: 'Registered Citizen Beneficiary',
    designationMr: 'नोंदणीकृत नागरिक (आभा)',
    createdAt: '2024-04-12T08:00:00.000Z',
    avatar: 'SP'
  },
  {
    id: 'user-adm-dho',
    username: 'dho.pune',
    password: 'Admin@123',
    role: 'admin',
    name: 'Dr. R. K. Chavan',
    nameMr: 'डॉ. आर. के. चव्हाण',
    phone: '9822404001',
    facility: 'District Health Directorate, Pune Zilla Parishad',
    designation: 'District Health Officer (DHO Pune)',
    designationMr: 'जिल्हा आरोग्य अधिकारी',
    createdAt: '2023-01-01T08:00:00.000Z',
    avatar: 'RC'
  }
];

export interface SignUpData {
  username: string;
  password: string;
  name: string;
  nameMr?: string;
  role: UserRole;
  phone: string;
  email?: string;
  village?: string;
  villageMr?: string;
  subCentre?: string;
  subCentreMr?: string;
  facility?: string;
  abhaId?: string;
  registrationNo?: string;
  designation?: string;
  designationMr?: string;
}

export interface DemoAccount {
  username: string;
  password: string;
  name: string;
  nameMr: string;
  role: UserRole;
  location: string;
  badge: string;
  designation: string;
  assignedArea?: string;
  assignedFacility?: string;
  permissions?: string[];
}

class AuthService {
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAuth();
    }
  }

  /**
   * Initialize and seed database if necessary
   */
  public async initAuth(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 1. Ensure localStorage cache has default users
      const cachedUsers = this.getLocalStorageUsers();
      let updatedCache = [...cachedUsers];

      for (const defUser of DEFAULT_USERS) {
        if (!updatedCache.some((u) => u.username.toLowerCase() === defUser.username.toLowerCase())) {
          updatedCache.push(defUser);
        }
      }
      this.saveLocalStorageUsers(updatedCache);

      // 2. Pre-seed IndexedDB
      for (const defUser of DEFAULT_USERS) {
        const existing = await offlineDB.getUserByUsername(defUser.username);
        if (!existing) {
          await offlineDB.saveUser(defUser);
        }
      }

      this.isInitialized = true;
    } catch (err) {
      console.warn('[AuthService] IndexedDB seeding fallback to localStorage cache:', err);
      this.isInitialized = true;
    }
  }

  /**
   * Helper to get users from localStorage
   */
  private getLocalStorageUsers(): UserRecord[] {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (!data) return [...DEFAULT_USERS];
      return JSON.parse(data) as UserRecord[];
    } catch {
      return [...DEFAULT_USERS];
    }
  }

  /**
   * Helper to save users in localStorage
   */
  private saveLocalStorageUsers(users: UserRecord[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (err) {
      console.warn('[AuthService] Error writing users to localStorage:', err);
    }
  }

  /**
   * Synchronous retrieval of active session from localStorage
   */
  public getActiveSessionSync(): SessionRecord | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as SessionRecord;
    } catch {
      return null;
    }
  }

  /**
   * Save session to both localStorage and IndexedDB
   */
  private async persistSession(session: SessionRecord): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
        window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: session }));
      } catch (err) {
        console.warn('[AuthService] Failed to set session in localStorage:', err);
      }
    }

    try {
      await offlineDB.saveSession(session);
    } catch (err) {
      console.warn('[AuthService] Failed to persist session to IndexedDB:', err);
    }
  }

  /**
   * Login user with live backend verification and automatic IndexedDB offline fallback
   */
  public async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: UserRecord; session?: SessionRecord; error?: string }> {
    await this.initAuth();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return {
        success: false,
        error: 'Please enter both username and password'
      };
    }

    // Step 1: Attempt backend API authentication
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user && data.session) {
          const userWithPass: UserRecord = {
            ...data.user,
            password: cleanPassword
          };

          // Synchronize local database with server profile
          try {
            await offlineDB.saveUser(userWithPass);
          } catch {
            // non-fatal
          }

          const localUsers = this.getLocalStorageUsers();
          const existingIdx = localUsers.findIndex((u) => u.username.toLowerCase() === cleanUsername);
          if (existingIdx >= 0) {
            localUsers[existingIdx] = userWithPass;
          } else {
            localUsers.push(userWithPass);
          }
          this.saveLocalStorageUsers(localUsers);

          await this.persistSession(data.session);

          return {
            success: true,
            user: userWithPass,
            session: data.session
          };
        }
      } else if (res.status === 400 || res.status === 401) {
        // Backend actively responded that credentials are invalid
        const errData = await res.json().catch(() => null);
        return {
          success: false,
          error: errData?.error || 'Invalid credentials'
        };
      }
    } catch {
      // Backend not reachable, proceeding with local offline authentication
    }

    // Step 2: Offline Fallback via IndexedDB & localStorage
    let user: UserRecord | null = null;
    try {
      user = await offlineDB.getUserByUsername(cleanUsername);
    } catch {
      // fallback to localStorage
    }

    if (!user) {
      const localUsers = this.getLocalStorageUsers();
      user = localUsers.find((u) => u.username.toLowerCase() === cleanUsername) || null;
    }

    if (!user) {
      return {
        success: false,
        error: 'User not found. Please check your username or register a new account.'
      };
    }

    // Verify password
    if (user.password !== cleanPassword) {
      return {
        success: false,
        error: 'Invalid password. Please verify your credentials.'
      };
    }

    // Build session record
    const session: SessionRecord = {
      id: 'ACTIVE_SESSION',
      userId: user.id,
      username: user.username,
      name: user.name,
      nameMr: user.nameMr,
      role: user.role,
      token: `hw_tk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginTime: new Date().toISOString(),
      village: user.village,
      villageMr: user.villageMr,
      subCentre: user.subCentre,
      subCentreMr: user.subCentreMr,
      facility: user.facility,
      designation: user.designation,
      designationMr: user.designationMr,
      abhaId: user.abhaId
    };

    await this.persistSession(session);

    return {
      success: true,
      user,
      session
    };
  }

  /**
   * Sign up a new user with live backend replication and IndexedDB persistence
   */
  public async signUp(
    data: SignUpData
  ): Promise<{ success: boolean; user?: UserRecord; session?: SessionRecord; error?: string }> {
    await this.initAuth();
    const cleanUsername = data.username.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3) {
      return {
        success: false,
        error: 'Username must be at least 3 characters long.'
      };
    }

    if (!data.password || data.password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.'
      };
    }

    if (!data.name || data.name.trim().length < 2) {
      return {
        success: false,
        error: 'Please enter your full name.'
      };
    }

    // Step 1: Attempt backend registration
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.user && resData.session) {
          const userWithPass: UserRecord = {
            ...resData.user,
            password: data.password.trim()
          };

          try {
            await offlineDB.saveUser(userWithPass);
          } catch {
            // non-fatal
          }

          const currentUsers = this.getLocalStorageUsers();
          currentUsers.push(userWithPass);
          this.saveLocalStorageUsers(currentUsers);

          await this.persistSession(resData.session);

          return {
            success: true,
            user: userWithPass,
            session: resData.session
          };
        }
      } else if (res.status === 400 || res.status === 409) {
        const errData = await res.json().catch(() => null);
        return {
          success: false,
          error: errData?.error || 'Registration rejected by server.'
        };
      }
    } catch {
      // Backend not reachable, proceed with offline IndexedDB registration
    }

    // Step 2: Offline IndexedDB registration
    let existing: UserRecord | null = null;
    try {
      existing = await offlineDB.getUserByUsername(cleanUsername);
    } catch {
      // continue check in localStorage
    }

    if (!existing) {
      const localUsers = this.getLocalStorageUsers();
      existing = localUsers.find((u) => u.username.toLowerCase() === cleanUsername) || null;
    }

    if (existing) {
      return {
        success: false,
        error: 'This username is already taken. Please choose another username.'
      };
    }

    // Generate Avatar Initials
    const initials = data.name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join('') || 'HW';

    // Create user record
    const newUser: UserRecord = {
      id: `user-${data.role}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      password: data.password.trim(),
      role: data.role,
      name: data.name.trim(),
      nameMr: data.nameMr?.trim() || data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim(),
      village: data.village?.trim(),
      villageMr: data.villageMr?.trim() || data.village?.trim(),
      subCentre: data.subCentre?.trim(),
      subCentreMr: data.subCentreMr?.trim() || data.subCentre?.trim(),
      facility: data.facility?.trim(),
      abhaId: data.abhaId?.trim(),
      registrationNo: data.registrationNo?.trim(),
      designation: data.designation?.trim() || this.getDefaultDesignation(data.role),
      designationMr: data.designationMr?.trim() || this.getDefaultDesignationMr(data.role),
      createdAt: new Date().toISOString(),
      avatar: initials
    };

    // Save to IndexedDB
    try {
      await offlineDB.saveUser(newUser);
    } catch (err: any) {
      if (err?.name === 'ConstraintError' || err?.message?.includes('ConstraintError')) {
        return {
          success: false,
          error: 'This username is already taken. Please choose another username.'
        };
      }
      console.warn('[AuthService] Error saving user to IndexedDB, saving to localStorage cache:', err);
    }

    // Update LocalStorage cache
    const currentUsers = this.getLocalStorageUsers();
    currentUsers.push(newUser);
    this.saveLocalStorageUsers(currentUsers);

    // Create session immediately
    const session: SessionRecord = {
      id: 'ACTIVE_SESSION',
      userId: newUser.id,
      username: newUser.username,
      name: newUser.name,
      nameMr: newUser.nameMr,
      role: newUser.role,
      token: `hw_tk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginTime: new Date().toISOString(),
      village: newUser.village,
      villageMr: newUser.villageMr,
      subCentre: newUser.subCentre,
      subCentreMr: newUser.subCentreMr,
      facility: newUser.facility,
      designation: newUser.designation,
      designationMr: newUser.designationMr,
      abhaId: newUser.abhaId
    };

    await this.persistSession(session);

    return {
      success: true,
      user: newUser,
      session
    };
  }

  /**
   * Log out active user and clear session
   */
  public async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
        window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: null }));
      } catch (err) {
        console.warn('[AuthService] Error clearing localStorage session:', err);
      }
    }

    try {
      await offlineDB.clearSession();
    } catch (err) {
      console.warn('[AuthService] Error clearing IndexedDB session:', err);
    }
  }

  /**
   * Get current authenticated user details
   */
  public async getCurrentUser(): Promise<UserRecord | null> {
    const session = this.getActiveSessionSync();
    if (!session) return null;

    try {
      const user = await offlineDB.getUserById(session.userId);
      if (user) return user;
    } catch {
      // fallback
    }

    const localUsers = this.getLocalStorageUsers();
    return (
      localUsers.find(
        (u) => u.id === session.userId || u.username.toLowerCase() === session.username.toLowerCase()
      ) || null
    );
  }

  /**
   * Synchronous retrieval of active user from cached local storage
   */
  public getCurrentUserSync(): UserRecord | null {
    const session = this.getActiveSessionSync();
    if (!session) return null;

    const localUsers = this.getLocalStorageUsers();
    return (
      localUsers.find(
        (u) => u.id === session.userId || u.username.toLowerCase() === session.username.toLowerCase()
      ) || null
    );
  }

  /**
   * Check if a username is available in real time
   */
  public async checkUsernameAvailable(username: string): Promise<boolean> {
    const clean = username.trim().toLowerCase();
    if (!clean) return false;

    try {
      const user = await offlineDB.getUserByUsername(clean);
      if (user) return false;
    } catch {
      // fallback
    }

    const localUsers = this.getLocalStorageUsers();
    return !localUsers.some((u) => u.username.toLowerCase() === clean);
  }

  /**
   * Get all registered users from database
   */
  public async getAllUsers(): Promise<UserRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          return data.users;
        }
      }
    } catch {
      // offline fallback
    }

    try {
      const users = await offlineDB.getAllUsers();
      if (users && users.length > 0) return users;
    } catch {
      // fallback
    }
    return this.getLocalStorageUsers();
  }

  /**
   * Verify permissions for a specific role and portal
   */
  public verifyRolePortalAccess(role: UserRole, path: string): boolean {
    if (role === 'admin') return true;
    if (role === 'asha') {
      return path.startsWith('/asha') || path === '/patient/triage' || path === '/emergency' || path === '/consultation';
    }
    if (role === 'doctor') {
      return path.startsWith('/doctor') || path === '/consultation' || path.startsWith('/diagnostic') || path.startsWith('/referral');
    }
    if (role === 'patient') {
      return path.startsWith('/patient') || path === '/consultation' || path === '/emergency' || path === '/sos';
    }
    return false;
  }

  /**
   * Return demo accounts list with assigned centers and active permission indicators
   */
  public getDemoAccounts(): DemoAccount[] {
    return [
      {
        username: 'prachi-ashaworker',
        password: 'Asha@Prachi2026',
        name: 'Prachi Patil',
        nameMr: 'प्राची पाटील',
        role: 'asha',
        location: 'Wagholi SC / PHC Wagholi',
        badge: 'ASHA · Wagholi SC',
        designation: 'Senior ASHA Field Worker',
        assignedArea: 'Wagholi SC / PHC Wagholi',
        assignedFacility: 'PHC Wagholi',
        permissions: ['Maternal ANC Care', 'Village Survey', 'Frontline Screening', 'Teleconsult Intake', 'SOS Emergency 108']
      },
      {
        username: 'rohit-ashaworker',
        password: 'Asha@Rohit2026',
        name: 'Rohit Kamble',
        nameMr: 'रोहित कांबळे',
        role: 'asha',
        location: 'Kharadi SC / PHC Kharadi',
        badge: 'ASHA · Kharadi SC',
        designation: 'Community Health ASHA Facilitator',
        assignedArea: 'Kharadi SC / PHC Kharadi',
        assignedFacility: 'PHC Kharadi',
        permissions: ['NCD Screening', 'Community Mobilization', 'Triage Survey', 'Offline Sync Gateway', 'Patient Intake']
      },
      {
        username: 'anjali-ashaworker',
        password: 'Asha@Anjali2026',
        name: 'Anjali Shinde',
        nameMr: 'अंजली शिंदे',
        role: 'asha',
        location: 'Lohegaon SC / PHC Lohegaon',
        badge: 'ASHA · Lohegaon SC',
        designation: 'ASHA Health Worker',
        assignedArea: 'Lohegaon SC / PHC Lohegaon',
        assignedFacility: 'PHC Lohegaon',
        permissions: ['Child Immunization', 'Malnutrition Tracking', 'High-Risk Follow-up', 'Home Visits & Vitals']
      },
      {
        username: 'jaya-ashaworker',
        password: 'Asha@Jaya2026',
        name: 'Jaya Deshmukh',
        nameMr: 'जया देशमुख',
        role: 'asha',
        location: 'Vadgaon SC / PHC Shirur',
        badge: 'ASHA · Vadgaon SC',
        designation: 'Lead ASHA Worker - Maternal Health',
        assignedArea: 'Vadgaon SC / PHC Shirur',
        assignedFacility: 'PHC Shirur',
        permissions: ['High-Risk Maternal Health', 'TB DOTS Surveillance', 'Referral Escalation', 'Patient Intake']
      },
      {
        username: 'dr.shinde',
        password: 'Doctor@123',
        name: 'Dr. Anand Shinde',
        nameMr: 'डॉ. आनंद शिंदे',
        role: 'doctor',
        location: 'PHC Shirur (शिरूर)',
        badge: 'Doctor · PHC Shirur',
        designation: 'Chief Medical Officer & Specialist',
        assignedArea: 'PHC Shirur & Telemedicine Node',
        assignedFacility: 'PHC Shirur',
        permissions: ['Clinical Teleconsultation', 'Digital Prescriptions', 'Referral Review & Feedback', 'Diagnostic Test Orders']
      },
      {
        username: 'sunita.patil',
        password: 'Patient@123',
        name: 'Sunita Patil',
        nameMr: 'सुनीता पाटील',
        role: 'patient',
        location: 'Vadgaon (वडगाव)',
        badge: 'Citizen · ABHA Card',
        designation: 'Registered Rural Beneficiary',
        assignedArea: 'Vadgaon / PHC Shirur',
        assignedFacility: 'PHC Shirur',
        permissions: ['ABHA Health Locker Access', 'Doctor Teleconsultations', 'Medicine Availability Check', 'SOS Emergency 108']
      },
      {
        username: 'dho.pune',
        password: 'Admin@123',
        name: 'Dr. R. K. Chavan',
        nameMr: 'डॉ. आर. के. चव्हाण',
        role: 'admin',
        location: 'Pune Zilla Parishad (पुणे)',
        badge: 'Admin · DHO Pune',
        designation: 'District Health Officer',
        assignedArea: 'District Health Directorate, Pune Zilla Parishad',
        assignedFacility: 'District Health Directorate, Pune',
        permissions: ['All Portals Full Access', '36 Facility Command Dashboards', 'District Supply Chain Oversight', 'ABDM Interoperability']
      }
    ];
  }

  private getDefaultDesignation(role: UserRole): string {
    switch (role) {
      case 'asha':
        return 'ASHA Field Worker';
      case 'doctor':
        return 'Medical Officer';
      case 'admin':
        return 'District Health Official';
      case 'patient':
      default:
        return 'Registered Citizen Beneficiary';
    }
  }

  private getDefaultDesignationMr(role: UserRole): string {
    switch (role) {
      case 'asha':
        return 'आशा कार्यकर्ती';
      case 'doctor':
        return 'वैद्यकीय अधिकारी';
      case 'admin':
        return 'जिल्हा आरोग्य अधिकारी';
      case 'patient':
      default:
        return 'नोंदणीकृत नागरिक';
    }
  }
}

export const authService = new AuthService();
export default authService;
