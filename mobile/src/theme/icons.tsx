/**
 * HealthWay Vector Icon Mapping Layer
 * Strict rule: ZERO unicode emojis. All icons map to @expo/vector-icons.
 */
import React from 'react';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';

export type IconFamily = 'Ionicons' | 'MaterialCommunityIcons' | 'MaterialIcons' | 'Feather';

export interface IconDefinition {
  family: IconFamily;
  name: string;
}

export const APP_ICONS = {
  // Navigation & Core Roles
  home: { family: 'Ionicons', name: 'home-outline' },
  homeFilled: { family: 'Ionicons', name: 'home' },
  patient: { family: 'MaterialCommunityIcons', name: 'account-heart-outline' },
  asha: { family: 'MaterialCommunityIcons', name: 'mother-nurse' },
  doctor: { family: 'MaterialCommunityIcons', name: 'doctor' },
  admin: { family: 'MaterialCommunityIcons', name: 'shield-account-outline' },
  settings: { family: 'Ionicons', name: 'settings-outline' },
  profile: { family: 'Ionicons', name: 'person-circle-outline' },

  // Emergency & SOS
  emergency: { family: 'MaterialCommunityIcons', name: 'alert-octagon' },
  ambulance: { family: 'MaterialCommunityIcons', name: 'ambulance' },
  siren: { family: 'MaterialCommunityIcons', name: 'alarm-light-outline' },
  hospital: { family: 'MaterialCommunityIcons', name: 'hospital-building' },
  phoneEmergency: { family: 'Ionicons', name: 'call' },

  // Clinical & Vitals
  stethoscope: { family: 'MaterialCommunityIcons', name: 'stethoscope' },
  heartPulse: { family: 'MaterialCommunityIcons', name: 'heart-pulse' },
  bloodPressure: { family: 'MaterialCommunityIcons', name: 'water-percent' },
  sugar: { family: 'MaterialCommunityIcons', name: 'blood-bag' },
  thermometer: { family: 'MaterialCommunityIcons', name: 'thermometer' },
  lungs: { family: 'MaterialCommunityIcons', name: 'lungs' },
  weight: { family: 'MaterialCommunityIcons', name: 'scale-bathroom' },
  triage: { family: 'MaterialCommunityIcons', name: 'clipboard-pulse-outline' },

  // Diagnostics & Pharmacy
  diagnostic: { family: 'MaterialCommunityIcons', name: 'flask-outline' },
  testTube: { family: 'MaterialCommunityIcons', name: 'test-tube' },
  medicine: { family: 'MaterialCommunityIcons', name: 'pill' },
  prescription: { family: 'MaterialCommunityIcons', name: 'file-document-edit-outline' },
  records: { family: 'MaterialCommunityIcons', name: 'folder-account-outline' },
  referral: { family: 'MaterialCommunityIcons', name: 'transit-connection-variant' },
  queue: { family: 'MaterialCommunityIcons', name: 'human-queue' },

  // Media & Hardware
  camera: { family: 'Ionicons', name: 'camera-outline' },
  mic: { family: 'Ionicons', name: 'mic-outline' },
  micOff: { family: 'Ionicons', name: 'mic-off-outline' },
  volumeHigh: { family: 'Ionicons', name: 'volume-high-outline' },
  volumeMute: { family: 'Ionicons', name: 'volume-mute-outline' },
  video: { family: 'Ionicons', name: 'videocam-outline' },
  fingerprint: { family: 'MaterialIcons', name: 'fingerprint' },
  qrCode: { family: 'MaterialCommunityIcons', name: 'qrcode-scan' },

  // Networking & Sync
  wifi: { family: 'Ionicons', name: 'wifi' },
  wifiOff: { family: 'Ionicons', name: 'wifi-outline' },
  sync: { family: 'Ionicons', name: 'sync-outline' },
  syncAlert: { family: 'MaterialCommunityIcons', name: 'sync-alert' },
  cloudDone: { family: 'Ionicons', name: 'cloud-done-outline' },

  // UI Actions & Indicators
  search: { family: 'Ionicons', name: 'search-outline' },
  filter: { family: 'Ionicons', name: 'filter-outline' },
  check: { family: 'Ionicons', name: 'checkmark' },
  checkCircle: { family: 'Ionicons', name: 'checkmark-circle' },
  close: { family: 'Ionicons', name: 'close' },
  closeCircle: { family: 'Ionicons', name: 'close-circle-outline' },
  chevronRight: { family: 'Ionicons', name: 'chevron-forward' },
  chevronLeft: { family: 'Ionicons', name: 'chevron-back' },
  chevronDown: { family: 'Ionicons', name: 'chevron-down' },
  chevronUp: { family: 'Ionicons', name: 'chevron-up' },
  arrowRight: { family: 'Ionicons', name: 'arrow-forward' },
  arrowLeft: { family: 'Ionicons', name: 'arrow-back' },
  alertTriangle: { family: 'Ionicons', name: 'warning-outline' },
  info: { family: 'Ionicons', name: 'information-circle-outline' },
  lock: { family: 'Ionicons', name: 'lock-closed-outline' },
  eye: { family: 'Ionicons', name: 'eye-outline' },
  eyeOff: { family: 'Ionicons', name: 'eye-off-outline' },
  language: { family: 'MaterialIcons', name: 'translate' },
  download: { family: 'Ionicons', name: 'download-outline' },
  upload: { family: 'Ionicons', name: 'cloud-upload-outline' },
  share: { family: 'Ionicons', name: 'share-social-outline' },
  calendar: { family: 'Ionicons', name: 'calendar-outline' },
  clock: { family: 'Ionicons', name: 'time-outline' },
  location: { family: 'Ionicons', name: 'location-outline' },
  call: { family: 'Ionicons', name: 'call-outline' },
  success: { family: 'Ionicons', name: 'checkmark-circle' },
  warning: { family: 'Ionicons', name: 'warning-outline' },
  refresh: { family: 'Ionicons', name: 'sync-outline' },
  vitals: { family: 'MaterialCommunityIcons', name: 'heart-pulse' },
} as const;

export type AppIconName = keyof typeof APP_ICONS;

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function AppIcon({ name, size = 22, color = '#1C2B3A', style }: AppIconProps) {
  const iconDef: IconDefinition = (APP_ICONS[name] as IconDefinition) || APP_ICONS.info;

  switch (iconDef.family) {
    case 'Ionicons':
      return <Ionicons name={iconDef.name as any} size={size} color={color} style={style} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={iconDef.name as any} size={size} color={color} style={style} />;
    case 'MaterialIcons':
      return <MaterialIcons name={iconDef.name as any} size={size} color={color} style={style} />;
    case 'Feather':
      return <Feather name={iconDef.name as any} size={size} color={color} style={style} />;
    default:
      return <Ionicons name="help-circle-outline" size={size} color={color} style={style} />;
  }
}

export const Icon = AppIcon;
export type IconName = AppIconName;
