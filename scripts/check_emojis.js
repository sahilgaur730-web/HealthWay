import fs from 'fs';

const files = [
  'src/services/dashboardService.ts',
  'src/components/dashboard/FacilityCard.tsx',
  'src/components/dashboard/MetricChart.tsx',
  'src/components/dashboard/AlertsPanel.tsx',
  'src/components/dashboard/LeaderBoard.tsx',
  'src/components/dashboard/FacilityDetailModal.tsx',
  'src/components/dashboard/DistrictDashboard.tsx',
  'public/sw.js',
  'public/manifest.json',
  'public/offline.html',
  'src/serviceWorkerRegistration.ts',
  'src/services/offlineDB.ts',
  'src/services/syncService.ts',
  'src/hooks/useOffline.ts',
  'src/hooks/useSync.ts',
  'src/hooks/useDashboard.ts',
  'src/components/offline/SyncManager.tsx',
  'src/components/offline/OfflineIndicator.tsx',
  'src/components/offline/OfflineNotice.tsx',
  'src/components/offline/OfflineForm.tsx',
  'src/pages/admin/DistrictDashboardPage.tsx',
  'src/pages/admin/FacilitiesPage.tsx',
  'src/components/common/PortalSwitcher.tsx',
  'src/components/common/Header.tsx',
  'src/components/common/HealthcareNetwork3D.tsx',
  'src/services/voiceService.ts',
  'src/components/voice/AudioGuidanceButton.tsx',
  'src/components/voice/VoiceAssistantModal.tsx',
  'src/services/emergencyService.ts',
  'src/pages/patient/EmergencyPage.tsx',
  'src/services/interopService.ts',
  'src/components/interop/FhirBundleViewer.tsx',
  'src/components/interop/HmisReportExporter.tsx',
  'src/pages/admin/InteroperabilityPage.tsx',
  'src/pages/public/LandingPage.tsx',
  'src/App.tsx',
  'src/main.tsx'
];

// Comprehensive Unicode Emoji range matching
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FAFF}]|[\u{2300}-\u{23FF}]/u;

let found = 0;
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error('Missing file:', file);
    found++;
    continue;
  }
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (emojiRegex.test(line)) {
      console.error('EMOJI FOUND:', file, 'Line ' + (i + 1), line.trim());
      found++;
    }
  });
}

if (found === 0) {
  console.log('SUCCESS: Exactly ZERO unicode emojis across all ' + files.length + ' Demand 9 & 10 files!');
} else {
  console.error('FAILURE: Found ' + found + ' emoji instances.');
  process.exit(1);
}
