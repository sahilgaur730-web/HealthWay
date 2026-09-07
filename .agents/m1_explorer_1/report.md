# Milestone 1: Native Dependencies & Configuration Blueprint

## Executive Summary
This report defines the exact implementation blueprint for Milestone 1 (Mobile Core Architecture & Foundation) covering Expo SDK 57 package dependencies, native permissions, `app.json` configuration, TypeScript path aliases (`tsconfig.json`), and validation scripts in `package.json`.

---

## 1. Expo SDK 57 Package Dependencies

### 1.1 Dependency Inventory & Rationale
All packages have been verified against Expo SDK 57 (`expo@~57.0.20`, `react@19.2.3`, `react-native@0.86.3`):

| Package | SDK 57 Target Version | Purpose in HealthWay Mobile |
|---|---|---|
| `@react-navigation/native` | `^7.3.18` | Core navigation container, linking, navigation themes |
| `@react-navigation/native-stack` | `^7.18.10` | Native UIViewController/Fragment stack transitions |
| `@react-navigation/bottom-tabs` | `^7.18.18` | Role-based bottom navigation bars (Patient, ASHA, Doctor, Admin) |
| `react-native-screens` | `~4.26.0` | Native view management for React Navigation screens |
| `react-native-safe-area-context` | `~5.7.0` | Safe area insets handling (notches, dynamic islands, home bars) |
| `@expo/vector-icons` | `^15.0.2` | Ionicons and MaterialIcons (zero Unicode emojis per specification) |
| `@react-native-async-storage/async-storage` | `2.2.0` | Fast key-value persistence for settings and offline indexes |
| `expo-secure-store` | `~57.0.3` | Hardware-backed encrypted storage for tokens, ABHA credentials |
| `expo-sqlite` | `~57.0.2` | Embedded SQLite database for structured 8-store offline data |
| `expo-camera` | `~57.0.4` | Camera hardware for ASHA beneficiary registration photos and document scanning |
| `expo-location` | `~57.0.16` | GPS hardware for Emergency SOS coordinates and ambulance tracking |
| `expo-speech` | `~57.0.2` | Text-to-Speech audio guidance in English, Marathi, and Hindi |
| `expo-local-authentication` | `~57.0.2` | Biometric authentication (Fingerprint / Face ID) |
| `expo-print` | `~57.0.1` | HTML-to-PDF rendering for lab test reports and digital prescriptions |
| `expo-sharing` | `~57.0.18` | Native system sharing for generated PDF documents and referral slips |
| `expo-file-system` | `~57.0.6` | Filesystem access for local document storage and PDF export caching |

### 1.2 Peer Dependency Compatibility Analysis
All 16 packages declare compatible peer dependencies:
- `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`: declare `"react": ">= 18.2.0"` and `"react-native": "*"` (fully compatible with React 19.2.3 and React Native 0.86.3).
- All Expo modules (`expo-camera`, `expo-location`, etc.) match `expo/bundledNativeModules.json` for SDK 57.

### 1.3 Exact Worker Installation Command
The Worker must execute the following single command from the `mobile` directory:

```powershell
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @expo/vector-icons @react-native-async-storage/async-storage expo-secure-store expo-sqlite expo-camera expo-location expo-speech expo-local-authentication expo-print expo-sharing expo-file-system
```

---

## 2. Configuration Files

### 2.1 `mobile/app.json`

#### Requirements Addressed
- Bundle Identifier: `com.healthway.mobile` (iOS)
- Package Name: `com.healthway.mobile` (Android)
- Scheme: `healthway`
- User Interface Style: `light`
- Permissions: Camera, Microphone/Audio, Location (Fine/Coarse), Biometrics (Fingerprint/FaceID)
- Config Plugins: `expo-camera`, `expo-location`, `expo-local-authentication`, `expo-secure-store`, `expo-sqlite`

#### Exact Content for `mobile/app.json`
```json
{
  "expo": {
    "name": "HealthWay",
    "slug": "healthway",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "healthway",
    "userInterfaceStyle": "light",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.healthway.mobile",
      "infoPlist": {
        "NSCameraUsageDescription": "HealthWay requires camera access for patient photo capture and medical document scanning.",
        "NSMicrophoneUsageDescription": "HealthWay requires microphone access for voice-based clinical intake and teleconsultations.",
        "NSLocationWhenInUseUsageDescription": "HealthWay requires location access to route emergency SOS alerts and identify nearby healthcare facilities.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "HealthWay requires location access to route emergency SOS alerts and track ambulance dispatches.",
        "NSFaceIDUsageDescription": "HealthWay uses biometric authentication for secure patient and clinician logins."
      }
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false,
      "package": "com.healthway.mobile",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.USE_BIOMETRIC",
        "android.permission.USE_FINGERPRINT"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow HealthWay to access your camera for patient photo capture and medical document scanning.",
          "microphonePermission": "Allow HealthWay to access your microphone for voice intake and teleconsultations.",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow HealthWay to access your location for emergency SOS alerts and ambulance dispatch tracking.",
          "locationWhenInUsePermission": "Allow HealthWay to access your location for emergency SOS dispatch and nearest facility routing.",
          "isAndroidBackgroundLocationEnabled": false
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow HealthWay to use Face ID for secure patient and staff authentication."
        }
      ],
      "expo-secure-store",
      "expo-sqlite"
    ]
  }
}
```

---

### 2.2 `mobile/tsconfig.json`

#### Requirements Addressed
- Extends `expo/tsconfig.base`
- Enables TypeScript `strict: true`
- Defines `baseUrl: "."`
- Maps path alias `@/*` to `src/*` for clean cross-module imports

#### Exact Content for `mobile/tsconfig.json`
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  }
}
```

---

### 2.3 `mobile/package.json`

#### Requirements Addressed
- Add `"typecheck": "tsc --noEmit"` to `"scripts"`
- Retain existing scripts (`start`, `android`, `ios`, `web`)

#### Exact Content for `mobile/package.json` (Scripts block)
```json
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "typecheck": "tsc --noEmit"
  }
```

---

## 3. Worker Action Plan (Step-by-Step)

The Worker should follow this strict execution sequence:

1. **Change Directory**:
   Run in `c:\Users\SAHIL GAUR\Desktop\HealthWay\mobile`.

2. **Execute Package Installation**:
   ```powershell
   npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @expo/vector-icons @react-native-async-storage/async-storage expo-secure-store expo-sqlite expo-camera expo-location expo-speech expo-local-authentication expo-print expo-sharing expo-file-system
   ```

3. **Update `mobile/package.json`**:
   Add `"typecheck": "tsc --noEmit"` to `scripts`.

4. **Update `mobile/tsconfig.json`**:
   Write the updated configuration including `baseUrl: "."` and `paths: { "@/*": ["src/*"] }`.

5. **Update `mobile/app.json`**:
   Write the complete updated `app.json` including bundle identifiers, scheme, userInterfaceStyle, permissions, and plugins.

6. **Run Verification Commands**:
   - `npm run typecheck` (must exit code 0)
   - `npx expo config --type public` (must output valid configuration)
   - `npx expo-doctor` (must pass all health checks)
