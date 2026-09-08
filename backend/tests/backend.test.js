/**
 * Comprehensive Backend Route & Authentication Verification Test Suite
 * Government of Maharashtra - Integrated Rural Health Platform (HealthWay)
 * Strictly zero unicode emojis.
 */

process.env.NODE_ENV = 'test';
process.env.PORT = '5099';

const http = require('http');
const app = require('../server');

const TEST_PORT = 5099;
let server;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${testName}`);
  }
}

async function runTests() {
  console.log('[START] Running HealthWay Backend Test Suite...\n');

  server = app.listen(TEST_PORT, async () => {
    try {
      // 1. Health check test
      const healthRes = await request('GET', '/api/health');
      assert(healthRes.statusCode === 200 && healthRes.data.status === 'OK', 'GET /api/health returns 200 OK');

      // 2. Ping test
      const pingRes = await request('GET', '/api/ping');
      assert(pingRes.statusCode === 200 && pingRes.data.status === 'pong', 'GET /api/ping returns 200 pong');

      // 3. Authenticate 4 ASHA workers
      const ashaAccounts = [
        { u: 'prachi-ashaworker', p: 'Asha@Prachi2026', name: 'Prachi Patil', village: 'Wagholi' },
        { u: 'rohit-ashaworker', p: 'Asha@Rohit2026', name: 'Rohit Kamble', village: 'Kharadi' },
        { u: 'anjali-ashaworker', p: 'Asha@Anjali2026', name: 'Anjali Shinde', village: 'Lohegaon' },
        { u: 'jaya-ashaworker', p: 'Asha@Jaya2026', name: 'Jaya Deshmukh', village: 'Vadgaon' }
      ];

      let prachiToken = null;
      for (const asha of ashaAccounts) {
        const loginRes = await request('POST', '/api/auth/login', { username: asha.u, password: asha.p });
        assert(
          loginRes.statusCode === 200 && loginRes.data.success && loginRes.data.user.role === 'asha',
          `POST /api/auth/login - ASHA Worker (${asha.u}) login verified`
        );
        if (asha.u === 'prachi-ashaworker') {
          prachiToken = loginRes.data.token;
        }
      }

      // 4. Authenticate Doctor, Patient, Admin
      const otherAccounts = [
        { u: 'dr.shinde', p: 'Doctor@123', role: 'doctor' },
        { u: 'sunita.patil', p: 'Patient@123', role: 'patient' },
        { u: 'dho.pune', p: 'Admin@123', role: 'admin' }
      ];

      for (const acc of otherAccounts) {
        const loginRes = await request('POST', '/api/auth/login', { username: acc.u, password: acc.p });
        assert(
          loginRes.statusCode === 200 && loginRes.data.success && loginRes.data.user.role === acc.role,
          `POST /api/auth/login - ${acc.role.toUpperCase()} (${acc.u}) login verified`
        );
      }

      // 5. Invalid credentials rejection (401)
      const badLogin = await request('POST', '/api/auth/login', { username: 'prachi-ashaworker', password: 'WrongPassword!' });
      assert(badLogin.statusCode === 401 && badLogin.data.success === false, 'POST /api/auth/login - Reject invalid password (401)');

      // 6. Non-string inputs edge case on login (must return 400, NOT crash with 500)
      const nonStringLogin = await request('POST', '/api/auth/login', { username: 12345, password: { nested: true } });
      assert(nonStringLogin.statusCode === 400 && nonStringLogin.data.success === false, 'POST /api/auth/login - Reject non-string input safely (400 Bad Request)');

      // 7. Non-string inputs edge case on signup (must return 400, NOT crash with 500)
      const nonStringSignup = await request('POST', '/api/auth/signup', { username: 123, password: null, role: 'asha', name: [] });
      assert(nonStringSignup.statusCode === 400 && nonStringSignup.data.success === false, 'POST /api/auth/signup - Reject non-string input safely (400 Bad Request)');

      // 8. Test GET /api/auth/me with JWT Token
      const meRes = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${prachiToken}` });
      assert(
        meRes.statusCode === 200 && meRes.data.success && meRes.data.user.username === 'prachi-ashaworker',
        'GET /api/auth/me - Authenticated profile retrieval verified'
      );

      // 9. Test GET /api/auth/users
      const usersRes = await request('GET', '/api/auth/users');
      assert(usersRes.statusCode === 200 && usersRes.data.count >= 7, 'GET /api/auth/users - Returns 7+ registered users');

      // 10. Test POST /api/auth/signup
      const testSignupUsername = `test-worker-${Date.now()}`;
      const signupRes = await request('POST', '/api/auth/signup', {
        username: testSignupUsername,
        password: 'Password@123',
        role: 'asha',
        name: 'Savita Pawar',
        nameMr: 'सविता पवार',
        phone: '9822998877',
        village: 'Koregaon Bhima',
        subCentre: 'Koregaon SC',
        facility: 'PHC Wagholi'
      });
      assert(signupRes.statusCode === 201 && signupRes.data.success, 'POST /api/auth/signup - New registration created');

      // 11. Role Permission checks for ASHA
      const ashaPatientRes = await request('POST', '/api/auth/verify-permission', { role: 'asha', portalPath: '/asha/patients' });
      assert(ashaPatientRes.statusCode === 200 && ashaPatientRes.data.allowed === true, 'POST /api/auth/verify-permission - ASHA allowed on /asha/patients');

      const ashaModeRes = await request('POST', '/api/auth/verify-permission', { role: 'asha', portalPath: '/asha-mode' });
      assert(ashaModeRes.statusCode === 200 && ashaModeRes.data.allowed === true, 'POST /api/auth/verify-permission - ASHA allowed on /asha-mode');

      const ashaIntakeRes = await request('POST', '/api/auth/verify-permission', { role: 'asha', portalPath: '/patient/intake' });
      assert(ashaIntakeRes.statusCode === 200 && ashaIntakeRes.data.allowed === true, 'POST /api/auth/verify-permission - ASHA allowed on /patient/intake');

      const ashaRegisterRes = await request('POST', '/api/auth/verify-permission', { role: 'asha', portalPath: '/patient/register' });
      assert(ashaRegisterRes.statusCode === 200 && ashaRegisterRes.data.allowed === true, 'POST /api/auth/verify-permission - ASHA allowed on /patient/register');

      const ashaVoiceRes = await request('POST', '/api/auth/verify-permission', { role: 'asha', portalPath: '/voice' });
      assert(ashaVoiceRes.statusCode === 200 && ashaVoiceRes.data.allowed === true, 'POST /api/auth/verify-permission - ASHA allowed on /voice');

      const permDenyRes = await request('POST', '/api/auth/verify-permission', { role: 'asha', portalPath: '/admin/finances' });
      assert(permDenyRes.statusCode === 200 && permDenyRes.data.allowed === false, 'POST /api/auth/verify-permission - ASHA denied on /admin/finances');

      // 12. Role Permission checks for Doctor
      const docRefRes = await request('POST', '/api/auth/verify-permission', { role: 'doctor', portalPath: '/referral' });
      assert(docRefRes.statusCode === 200 && docRefRes.data.allowed === true, 'POST /api/auth/verify-permission - Doctor allowed on /referral');

      const docDiagRes = await request('POST', '/api/auth/verify-permission', { role: 'doctor', portalPath: '/diagnostic' });
      assert(docDiagRes.statusCode === 200 && docDiagRes.data.allowed === true, 'POST /api/auth/verify-permission - Doctor allowed on /diagnostic');

      const docDenyRes = await request('POST', '/api/auth/verify-permission', { role: 'doctor', portalPath: '/asha/mode' });
      assert(docDenyRes.statusCode === 200 && docDenyRes.data.allowed === false, 'POST /api/auth/verify-permission - Doctor denied on /asha/mode');

      // 13. Referrals route check
      const refRes = await request('GET', '/api/referrals');
      assert(
        refRes.statusCode === 200 && refRes.data.success && refRes.data.count >= 5 && Array.isArray(refRes.data.data),
        'GET /api/referrals - Active with 5+ referral records'
      );

      // 14. Diagnostics route check
      const diagRes = await request('GET', '/api/diagnostics/orders');
      assert(
        diagRes.statusCode === 200 && diagRes.data.success && diagRes.data.count >= 4 && Array.isArray(diagRes.data.orders),
        'GET /api/diagnostics/orders - Active with 4+ diagnostic test orders'
      );

      const diagLabsRes = await request('GET', '/api/diagnostics/labs');
      assert(diagLabsRes.statusCode === 200 && diagLabsRes.data.count >= 6, 'GET /api/diagnostics/labs - Returns 6 empanelled labs');

      const diagTestsRes = await request('GET', '/api/diagnostics/tests');
      assert(diagTestsRes.statusCode === 200 && diagTestsRes.data.totalTests >= 18, 'GET /api/diagnostics/tests - Returns tests directory');

      // 15. Medicines route check
      const medRes = await request('GET', '/api/medicines');
      assert(
        medRes.statusCode === 200 && medRes.data.success && medRes.data.count >= 18 && Array.isArray(medRes.data.medicines),
        'GET /api/medicines - Active with 18 Essential EDL Medicines'
      );

      const medSearchRes = await request('GET', '/api/medicines?search=paracetamol');
      assert(
        medSearchRes.statusCode === 200 && medSearchRes.data.count >= 1,
        'GET /api/medicines?search=paracetamol - Search filtering active'
      );

      const medStockRes = await request('GET', '/api/medicines/stock?facilityId=FAC001');
      assert(
        medStockRes.statusCode === 200 && medStockRes.data.count >= 1,
        'GET /api/medicines/stock - Facility inventory ledger query verified'
      );

      // 16. High-Risk route check
      const hrRes = await request('GET', '/api/highrisk/patients');
      assert(
        hrRes.statusCode === 200 && hrRes.data.success && hrRes.data.count >= 8 && Array.isArray(hrRes.data.patients),
        'GET /api/highrisk/patients - Active with 8+ registered high-risk cohort'
      );

      const hrAnalyticsRes = await request('GET', '/api/highrisk/analytics');
      assert(
        hrAnalyticsRes.statusCode === 200 && hrAnalyticsRes.data.analytics.totalCohort >= 8,
        'GET /api/highrisk/analytics - Live analytics computed successfully'
      );

      // 17. Dashboard route check
      const dashRes = await request('GET', '/api/dashboard/facilities');
      assert(dashRes.statusCode === 200 && Array.isArray(dashRes.data), 'GET /api/dashboard/facilities - Active');

      // 18. Sync route check
      const syncRes = await request('GET', '/api/sync/status');
      assert(syncRes.statusCode === 200 && syncRes.data.success, 'GET /api/sync/status - Active');

      // 19. Emergency route check
      const emgRes = await request('POST', '/api/emergency/dispatch', {
        type: 'CRITICAL_TRAUMA',
        location: { lat: 18.5614, lng: 73.9838 }
      });
      assert(
        (emgRes.statusCode === 200 || emgRes.statusCode === 201) && emgRes.data.success,
        'POST /api/emergency/dispatch - Active'
      );

      // 20. ABDM route check
      const abdmRes = await request('GET', '/api/abdm/status');
      assert(abdmRes.statusCode === 200 && abdmRes.data.success, 'GET /api/abdm/status - Active');

      // 21. FHIR route check
      const fhirRes = await request('GET', '/api/fhir/metadata');
      assert(fhirRes.statusCode === 200 && fhirRes.data.resourceType === 'CapabilityStatement', 'GET /api/fhir/metadata - Conforms to FHIR R4');

      // 22. Interop route check
      const interopRes = await request('GET', '/api/interop/systems');
      assert(
        interopRes.statusCode === 200 && (Array.isArray(interopRes.data) || Array.isArray(interopRes.data.systems)),
        'GET /api/interop/systems - Active'
      );

      console.log(`\n========================================`);
      console.log(`TEST SUMMARY: ${passedTests} passed, ${failedTests} failed`);
      console.log(`========================================\n`);

      server.close(() => {
        process.exit(failedTests > 0 ? 1 : 0);
      });
    } catch (err) {
      console.error('[TEST ERROR]', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests();
