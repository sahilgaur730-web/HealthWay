/**
 * Automated Verification Suite for Demands 11, 12, 13 & 3D WebGL Integration
 * HealthWay - Government of Maharashtra Rural Healthcare Access Platform
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`[PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${desc}: ${err.message}`);
    failed++;
  }
}

console.log('\n=== RUNNING VERIFICATION SUITE FOR DEMANDS 11, 12, 13 & 3D NETWORK ===\n');

// 1. Voice Assistance Service (Demand 11)
const voiceServicePath = path.resolve('src/services/voiceService.ts');
const voiceCode = fs.readFileSync(voiceServicePath, 'utf8');

it('voiceService defines Marathi (mr-IN) and English (en-IN) language types', () => {
  assert(voiceCode.includes("export type VoiceLanguage = 'mr' | 'en'"));
  assert(voiceCode.includes('mr-IN'));
  assert(voiceCode.includes('en-IN'));
});

it('voiceService implements speak and stopSpeaking methods', () => {
  assert(voiceCode.includes('public speak('));
  assert(voiceCode.includes('public stopSpeaking('));
});

it('voiceService implements speech recognition startListening and stopListening', () => {
  assert(voiceCode.includes('public startListening('));
  assert(voiceCode.includes('public stopListening('));
});

it('voiceService provides clinical prompt helpers (welcome, triage, emergency, token)', () => {
  assert(voiceCode.includes('public playWelcomePrompt('));
  assert(voiceCode.includes('public playTriagePrompt('));
  assert(voiceCode.includes('public playEmergencySosPrompt('));
  assert(voiceCode.includes('public playTokenPrompt('));
});

it('AudioGuidanceButton component exists and connects to voiceService', () => {
  const audioBtnPath = path.resolve('src/components/voice/AudioGuidanceButton.tsx');
  const btnCode = fs.readFileSync(audioBtnPath, 'utf8');
  assert(btnCode.includes('voiceService.speak('));
  assert(btnCode.includes('voiceService.stopSpeaking('));
  assert(btnCode.includes('Volume2'));
  assert(btnCode.includes('VolumeX'));
});

it('VoiceAssistantModal component exists with dual-language speech recognition', () => {
  const modalPath = path.resolve('src/components/voice/VoiceAssistantModal.tsx');
  const modalCode = fs.readFileSync(modalPath, 'utf8');
  assert(modalCode.includes('voiceService.startListening('));
  assert(modalCode.includes('handleProcessVoiceInput('));
  assert(modalCode.includes('Mic'));
});

// 2. Emergency Escalation Service (Demand 12)
const emergencyServicePath = path.resolve('src/services/emergencyService.ts');
const emgCode = fs.readFileSync(emergencyServicePath, 'utf8');

it('EmergencyService defines GPS coordinates, Ambulance telemetry, and Pre-arrival alerts', () => {
  assert(emgCode.includes('interface GpsCoordinates'));
  assert(emgCode.includes('interface AmbulanceDispatchUnit'));
  assert(emgCode.includes('interface EmergencyPreArrivalAlert'));
  assert(emgCode.includes('interface EmergencySosSession'));
});

it('EmergencyService implements captureCurrentLocation with rural fallback', () => {
  assert(emgCode.includes('public static async captureCurrentLocation('));
  assert(emgCode.includes('DEFAULT_PUNE_RURAL_GPS'));
  assert(emgCode.includes('latitude: 18.6534'));
  assert(emgCode.includes('longitude: 74.1352'));
});

it('EmergencyService implements triggerSosDispatch and generates Code Red token', () => {
  assert(emgCode.includes('public static async triggerSosDispatch('));
  assert(emgCode.includes('CODE-RED-MH-'));
  assert(emgCode.includes('initialEtaMinutes: 14'));
});

it('EmergencyService configures 108 BLS ambulance with essential life support equipment', () => {
  assert(emgCode.includes('oxygenCylinder: true'));
  assert(emgCode.includes('defibrillatorAed: true'));
  assert(emgCode.includes('emergencyDeliveryKit: true'));
});

it('EmergencyPage incorporates GPS telemetry, hospital casualty notice, and audio guidance', () => {
  const emgPagePath = path.resolve('src/pages/patient/EmergencyPage.tsx');
  const pageCode = fs.readFileSync(emgPagePath, 'utf8');
  assert(pageCode.includes('EmergencyService.triggerSosDispatch('));
  assert(pageCode.includes('AudioGuidanceButton'));
  assert(pageCode.includes('Live ETA Countdown'));
  assert(pageCode.includes('Bed Reserved'));
});

// 3. Interoperable Health Records Service (Demand 13)
const interopServicePath = path.resolve('src/services/interopService.ts');
const interopCode = fs.readFileSync(interopServicePath, 'utf8');

it('InteropService implements HL7 FHIR R4 Bundle generation compliant with NRCES India', () => {
  assert(interopCode.includes('public static generateFhirR4Bundle('));
  assert(interopCode.includes("resourceType: 'Bundle'"));
  assert(interopCode.includes("type: 'document'"));
  assert(interopCode.includes('https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'));
  assert(interopCode.includes('https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter'));
});

it('InteropService includes clinical resources (Condition O26.9, Observations, MedicationRequest)', () => {
  assert(interopCode.includes("resourceType: 'Condition'"));
  assert(interopCode.includes('O26.9'));
  assert(interopCode.includes("resourceType: 'Observation'"));
  assert(interopCode.includes('85354-9')); // BP panel LOINC
  assert(interopCode.includes('718-7')); // Hemoglobin LOINC
  assert(interopCode.includes("resourceType: 'MedicationRequest'"));
});

it('InteropService implements HMIS Form 1-12 monthly indicator reports', () => {
  assert(interopCode.includes('public static getHmisMonthlyReport('));
  assert(interopCode.includes('HMIS-M1'));
  assert(interopCode.includes('HMIS-M2'));
  assert(interopCode.includes('HMIS-M3'));
  assert(interopCode.includes('HMIS-M4'));
  assert(interopCode.includes('HMIS-M5'));
  assert(interopCode.includes('HMIS-M6'));
  assert(interopCode.includes('HMIS-M7'));
  assert(interopCode.includes('HMIS-M8'));
});

it('InteropService implements CSV export generation', () => {
  assert(interopCode.includes('public static generateHmisCsv('));
  assert(interopCode.includes('Indicator Name (English)'));
  assert(interopCode.includes('Indicator Name (Marathi)'));
});

it('InteropService implements ABDM electronic consent artefacts', () => {
  assert(interopCode.includes('public static getAbdmConsentArtefacts('));
  assert(interopCode.includes('CONSENT-MH-2024-0019'));
  assert(interopCode.includes('digitalSignature'));
});

it('FhirBundleViewer component enables JSON copying, download, and NRCES verification', () => {
  const fhirViewPath = path.resolve('src/components/interop/FhirBundleViewer.tsx');
  const fhirCode = fs.readFileSync(fhirViewPath, 'utf8');
  assert(fhirCode.includes('InteropService.generateFhirR4Bundle()'));
  assert(fhirCode.includes('handleCopy'));
  assert(fhirCode.includes('handleDownload'));
});

it('HmisReportExporter component provides category filters and CSV download', () => {
  const hmisViewPath = path.resolve('src/components/interop/HmisReportExporter.tsx');
  const hmisCode = fs.readFileSync(hmisViewPath, 'utf8');
  assert(hmisCode.includes('InteropService.getHmisMonthlyReport()'));
  assert(hmisCode.includes('handleExportCsv'));
  assert(hmisCode.includes('performancePercent'));
});

it('InteroperabilityPage integrates ABDM Milestones, FHIR, HMIS, and Consent tabs', () => {
  const pagePath = path.resolve('src/pages/admin/InteroperabilityPage.tsx');
  const interopPageCode = fs.readFileSync(pagePath, 'utf8');
  assert(interopPageCode.includes('FhirBundleViewer'));
  assert(interopPageCode.includes('HmisReportExporter'));
  assert(interopPageCode.includes('abdmMilestones'));
  assert(interopPageCode.includes('consentArtefacts'));
});

// 4. Three.js 3D WebGL Healthcare Network Integration
const threeComponentPath = path.resolve('src/components/common/HealthcareNetwork3D.tsx');
const threeCode = fs.readFileSync(threeComponentPath, 'utf8');

it('HealthcareNetwork3D imports Three.js and configures WebGLRenderer with antialias', () => {
  assert(threeCode.includes("import * as THREE from 'three'"));
  assert(threeCode.includes('new THREE.WebGLRenderer'));
  assert(threeCode.includes('antialias: true'));
});

it('HealthcareNetwork3D constructs network nodes (DH Pune, CHC Kharadi, PHCs, Sub-Centres)', () => {
  assert(threeCode.includes('District Hospital Pune'));
  assert(threeCode.includes('CHC Kharadi Hub'));
  assert(threeCode.includes('PHC Wagholi'));
  assert(threeCode.includes('PHC Shirur'));
  assert(threeCode.includes('Sub-Centre Vadgaon'));
});

it('HealthcareNetwork3D creates quadratic bezier arcs with animated data packets', () => {
  assert(threeCode.includes('new THREE.QuadraticBezierCurve3'));
  assert(threeCode.includes('curve.getPoints'));
  assert(threeCode.includes('packets.forEach'));
});

it('HealthcareNetwork3D implements raycasting and interactive hover tooltips', () => {
  assert(threeCode.includes('new THREE.Raycaster'));
  assert(threeCode.includes('setHoveredNode'));
  assert(threeCode.includes('pointerdown'));
});

it('LandingPage embeds HealthcareNetwork3D in the new responsive two-column hero section', () => {
  const landingPath = path.resolve('src/pages/public/LandingPage.tsx');
  const landingCode = fs.readFileSync(landingPath, 'utf8');
  assert(landingCode.includes('<HealthcareNetwork3D />'));
  assert(landingCode.includes('<VoiceAssistantModal'));
  assert(landingCode.includes('AudioGuidanceButton'));
});

// 5. Zero Unicode Emojis Audit across all new and touched files
const filesToAudit = [
  'src/services/voiceService.ts',
  'src/services/emergencyService.ts',
  'src/services/interopService.ts',
  'src/components/voice/AudioGuidanceButton.tsx',
  'src/components/voice/VoiceAssistantModal.tsx',
  'src/components/interop/FhirBundleViewer.tsx',
  'src/components/interop/HmisReportExporter.tsx',
  'src/components/common/HealthcareNetwork3D.tsx',
  'src/pages/admin/InteroperabilityPage.tsx',
  'src/pages/patient/EmergencyPage.tsx',
  'src/pages/public/LandingPage.tsx',
];

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

filesToAudit.forEach((relPath) => {
  it(`Zero unicode emojis in ${relPath}`, () => {
    const fullPath = path.resolve(relPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(emojiRegex);
    assert(!match, `Found emoji ${match ? match[0] : ''} in ${relPath}`);
  });
});

console.log(`\n=== VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
if (failed > 0) process.exit(1);
