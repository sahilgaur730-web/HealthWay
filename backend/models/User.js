/**
 * User Model & Authentication Schema Specification
 * Government of Maharashtra - Integrated Rural Health Platform (HealthWay)
 * Strictly zero unicode emojis.
 */

const bcrypt = require('bcryptjs');

const UserRoleEnum = ['patient', 'asha', 'doctor', 'admin'];

const RolePermissions = {
  asha: [
    'asha:access',
    'patient:intake',
    'patient:view',
    'surveillance:log',
    'referral:create',
    'referral:view',
    'sync:upload',
    'emergency:sos'
  ],
  doctor: [
    'doctor:access',
    'consultation:conduct',
    'prescription:issue',
    'referral:review',
    'referral:feedback',
    'diagnostics:order',
    'diagnostics:verify',
    'patient:view'
  ],
  admin: [
    'admin:access',
    'facility:manage',
    'analytics:view',
    'inventory:oversight',
    'interop:configure',
    'user:manage',
    'escalation:manage'
  ],
  patient: [
    'patient:access',
    'records:view',
    'appointment:book',
    'medicine:search',
    'emergency:sos',
    'consent:manage'
  ]
};

const RolePortals = {
  asha: [
    '/asha',
    '/asha-mode',
    '/voice',
    '/voice-input',
    '/patient/triage',
    '/patient/register',
    '/patient/intake',
    '/asha/register',
    '/consultation',
    '/emergency',
    '/sos'
  ],
  doctor: [
    '/doctor',
    '/consultation',
    '/diagnostics',
    '/diagnostic',
    '/referrals',
    '/referral',
    '/emergency',
    '/sos'
  ],
  admin: [
    '/admin',
    '/facility-dashboard',
    '/district-dashboard',
    '/facilities',
    '/medicine-stock',
    '/medicines',
    '/high-risk',
    '/interoperability',
    '/abdm',
    '/fhir',
    '/hmis',
    '/emergency',
    '/sos'
  ],
  patient: [
    '/patient',
    '/consultation',
    '/emergency',
    '/sos',
    '/referral',
    '/medicines'
  ]
};

const UserSchemaDefinition = {
  id: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: UserRoleEnum, required: true, index: true },
  name: { type: String, required: true },
  nameMr: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  village: { type: String },
  villageMr: { type: String },
  subCentre: { type: String },
  subCentreMr: { type: String },
  facility: { type: String },
  designation: { type: String },
  designationMr: { type: String },
  abhaId: { type: String },
  registrationNo: { type: String },
  avatar: { type: String },
  permissions: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Initial Seed Users with standard passwords
const RAW_SEED_USERS = [
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

// In-Memory Database Store for Users
const usersStore = new Map();

function initializeUserStore() {
  RAW_SEED_USERS.forEach((raw) => {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(raw.password, salt);
    const permissions = RolePermissions[raw.role] || [];
    
    usersStore.set(raw.username.toLowerCase(), {
      ...raw,
      password: raw.password, // cached for direct fast comparison
      passwordHash,
      permissions
    });
  });
}

// Initialize on module load
initializeUserStore();

function findUserByUsername(username) {
  if (!username) return null;
  return usersStore.get(username.trim().toLowerCase()) || null;
}

function findUserById(id) {
  if (!id) return null;
  for (const user of usersStore.values()) {
    if (user.id === id) return user;
  }
  return null;
}

function getAllUsers(sanitize = true) {
  const list = Array.from(usersStore.values());
  if (sanitize) {
    return list.map(({ password, passwordHash, ...safe }) => safe);
  }
  return list;
}

function verifyPassword(inputPassword, user) {
  if (!inputPassword || !user) return false;
  if (user.password && user.password === inputPassword) {
    return true;
  }
  if (user.passwordHash) {
    try {
      return bcrypt.compareSync(inputPassword, user.passwordHash);
    } catch {
      return false;
    }
  }
  return false;
}

function createUser(userData) {
  const username = userData.username.trim().toLowerCase();
  if (usersStore.has(username)) {
    throw new Error('Username already exists');
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(userData.password.trim(), salt);
  const permissions = RolePermissions[userData.role] || [];

  const initials = userData.name
    ? userData.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0].toUpperCase())
        .slice(0, 2)
        .join('') || 'HW'
    : 'HW';

  const newUser = {
    id: userData.id || `user-${userData.role}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    username,
    password: userData.password.trim(),
    passwordHash,
    role: userData.role,
    name: userData.name.trim(),
    nameMr: userData.nameMr ? userData.nameMr.trim() : userData.name.trim(),
    phone: userData.phone ? userData.phone.trim() : '',
    email: userData.email ? userData.email.trim() : '',
    village: userData.village ? userData.village.trim() : '',
    villageMr: userData.villageMr ? userData.villageMr.trim() : '',
    subCentre: userData.subCentre ? userData.subCentre.trim() : '',
    subCentreMr: userData.subCentreMr ? userData.subCentreMr.trim() : '',
    facility: userData.facility ? userData.facility.trim() : '',
    designation: userData.designation ? userData.designation.trim() : '',
    designationMr: userData.designationMr ? userData.designationMr.trim() : '',
    abhaId: userData.abhaId ? userData.abhaId.trim() : '',
    registrationNo: userData.registrationNo ? userData.registrationNo.trim() : '',
    avatar: userData.avatar || initials,
    permissions,
    createdAt: new Date().toISOString()
  };

  usersStore.set(username, newUser);
  return newUser;
}

function canAccessPortal(role, portalPath) {
  if (!role || !portalPath) return false;
  if (role === 'admin') return true; // District Health Officer has administrative oversight
  const allowed = RolePortals[role] || [];
  const normalized = portalPath.split('?')[0].replace(/\/+$/, '') || '/';
  return allowed.some((prefix) => {
    const cleanPrefix = prefix.replace(/\/+$/, '');
    return normalized === cleanPrefix || normalized.startsWith(cleanPrefix + '/');
  });
}

module.exports = {
  UserRoleEnum,
  RolePermissions,
  RolePortals,
  UserSchemaDefinition,
  RAW_SEED_USERS,
  findUserByUsername,
  findUserById,
  getAllUsers,
  verifyPassword,
  createUser,
  canAccessPortal
};
