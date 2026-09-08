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

      // 5. Invalid credentials rejection
      const badLogin = await request('POST', '/api/auth/login', { username: 'prachi-ashaworker', password: 'WrongPassword!' });
      assert(badLogin.statusCode === 401 && badLogin.data.success === false, 'POST /api/auth/login - Reject invalid password (401)');

      // 6. Test GET /api/auth/me with JWT Token
      const meRes = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${prachiToken}` });
      assert(
        meRes.statusCode === 200 && meRes.data.success && meRes.data.user.username === 'prachi-ashaworker',
        'GET /api/auth/me - Authenticated profile retrieval verified'
      );

      // 7. Test GET /api/auth/users
      const usersRes = await request('GET', '/api/auth/users');
      assert(usersRes.statusCode === 200 && usersRes.data.count >= 7, 'GET /api/auth/users - Returns 7+ registered users');

      // 8. Test POST /api/auth/signup
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

      // 9. Test POST /api/auth/verify-permission
      const permRes = await request('POST', '/api/auth/verify-permission', {
        role: 'asha',
        portalPath: '/asha/patients'
      });
      assert(permRes.statusCode === 200 && permRes.data.allowed === true, 'POST /api/auth/verify-permission - ASHA allowed on /asha/patients');

      const permDenyRes = await request('POST', '/api/auth/verify-permission', {
        role: 'asha',
        portalPath: '/admin/finances'
      });
      assert(permDenyRes.statusCode === 200 && permDenyRes.data.allowed === false, 'POST /api/auth/verify-permission - ASHA denied on /admin/finances');

      // 10. Referrals route check
      const refRes = await request('GET', '/api/referrals');
      assert(refRes.statusCode === 200 && refRes.data.success, 'GET /api/referrals - Active');

      // 11. Diagnostics route check
      const diagRes = await request('GET', '/api/diagnostics/orders');
      assert(diagRes.statusCode === 200 && diagRes.data.success, 'GET /api/diagnostics/orders - Active');

      // 12. Medicines route check
      const medRes = await request('GET', '/api/medicines');
      assert(medRes.statusCode === 200 && medRes.data.success, 'GET /api/medicines - Active');

      // 13. High-Risk route check
      const hrRes = await request('GET', '/api/highrisk/patients');
      assert(hrRes.statusCode === 200 && hrRes.data.success, 'GET /api/highrisk/patients - Active');

      // 14. Dashboard route check
      const dashRes = await request('GET', '/api/dashboard/facilities');
      assert(dashRes.statusCode === 200 && Array.isArray(dashRes.data), 'GET /api/dashboard/facilities - Active');

      // 15. Sync route check
      const syncRes = await request('GET', '/api/sync/status');
      assert(syncRes.statusCode === 200 && syncRes.data.success, 'GET /api/sync/status - Active');

      // 16. Emergency route check
      const emgRes = await request('POST', '/api/emergency/dispatch', {
        type: 'CRITICAL_TRAUMA',
        location: { lat: 18.5614, lng: 73.9838 }
      });
      assert(
        (emgRes.statusCode === 200 || emgRes.statusCode === 201) && emgRes.data.success,
        'POST /api/emergency/dispatch - Active'
      );

      // 17. ABDM route check
      const abdmRes = await request('GET', '/api/abdm/status');
      assert(abdmRes.statusCode === 200 && abdmRes.data.success, 'GET /api/abdm/status - Active');

      // 18. FHIR route check
      const fhirRes = await request('GET', '/api/fhir/metadata');
      assert(fhirRes.statusCode === 200 && fhirRes.data.resourceType === 'CapabilityStatement', 'GET /api/fhir/metadata - Conforms to FHIR R4');

      // 19. Interop route check
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
