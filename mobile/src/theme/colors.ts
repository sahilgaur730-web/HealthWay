/**
 * HealthWay Mobile Design System - Color Tokens
 * Government of Maharashtra - Integrated Rural Health Platform
 */

export const colors = {
  // Institutional Brand Colors
  primary: {
    DEFAULT: '#1A4B8C', // Maharashtra Navy Blue
    navy: '#1A4B8C',
    navyLight: '#E8F0FE',
    saffron: '#F57C00',
    dark: '#0B2545',    // Deep Header Navy
    light: '#E8F0FE',   // Subtle selection blue
    hover: '#153E75',
  },
  accent: {
    DEFAULT: '#F57C00', // Maharashtra Saffron
    dark: '#E65100',
    light: '#FFF3E0',   // Light saffron tint
  },

  // Neutral Canvas & Surface
  slate: {
    dark: '#1C2B3A',    // High-contrast text primary
    light: '#F8FAFC',
    gray: '#546E7A',    // Body & secondary text
    muted: '#90A4AE',   // Captions & placeholders
    border: '#CFD8DC',  // Component border
    borderLight: '#E2E8F0',
    bg: '#F5F7FA',      // Screen background canvas
    surface: '#FFFFFF', // Card & modal background
    surfaceSubtle: '#EEF2F6',
  },

  // Role-Specific Semantic Colors
  role: {
    patient: '#1A4B8C', // Navy Blue
    patientBg: '#E8F0FE',
    asha: '#7B1FA2',    // Purple
    ashaBg: '#F3E5F5',
    doctor: '#00796B',  // Clinical Teal
    doctorBg: '#E0F2F1',
    admin: '#D84315',   // Rust Red
    adminBg: '#FBE9E7',
  },

  // Clinical Triage Urgency Tiers
  urgency: {
    red: '#D32F2F',     // Emergency (Immediate)
    redBg: '#FFEBEE',
    orange: '#ED6C02',  // Urgent (Within 2 hrs)
    orangeBg: '#FFF4E5',
    yellow: '#F9A825',  // Moderate (Same day)
    yellowBg: '#FFFDE7',
    green: '#2E7D32',   // Mild / Routine
    greenBg: '#E8F5E9',
  },

  // Standard Semantic Feedback
  status: {
    success: '#2E7D32',
    successBg: '#E8F5E9',
    successBorder: '#A5D6A7',
    warning: '#ED6C02',
    warningBg: '#FFF4E5',
    warningBorder: '#FFCC80',
    error: '#D32F2F',
    errorBg: '#FFEBEE',
    errorBorder: '#EF9A9A',
    red: '#D32F2F',
    redBg: '#FFEBEE',
    green: '#2E7D32',
    greenBg: '#E8F5E9',
    amber: '#ED6C02',
    amberBg: '#FFF4E5',
    info: '#0288D1',
    infoBg: '#E1F5FE',
    infoBorder: '#81D4FA',
  },

  // Operational
  emergency: '#D32F2F',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorsType = typeof colors;
