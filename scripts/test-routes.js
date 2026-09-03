require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');

async function runTests() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING SYSTEMATIC ROUTE & LOGIC INTEGRATION TEST');
  console.log('==================================================\n');

  await connectDB();

  const TEST_PORT = 3088;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`✓ Test server started on http://127.0.0.1:${TEST_PORT}`);

  let passed = 0;
  let failed = 0;

  async function checkRoute(path, expectedStatus = 200, options = {}) {
    const method = options.method || 'GET';
    const body = options.body
      ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
      : null;
    const headers = options.headers || {};
    if (body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    return new Promise((resolve) => {
      const req = http.request(
        `http://127.0.0.1:${TEST_PORT}${path}`,
        { method, headers },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            const isMatch = res.statusCode === expectedStatus;
            if (isMatch) {
              console.log(`  ✅ [${res.statusCode}] ${method} ${path}`);
              passed++;
            } else {
              console.error(`  ❌ [${res.statusCode} != expected ${expectedStatus}] ${method} ${path}`);
              failed++;
            }
            resolve({ statusCode: res.statusCode, headers: res.headers, data });
          });
        }
      );

      req.on('error', (err) => {
        console.error(`  ❌ [ERROR] ${method} ${path}:`, err.message);
        failed++;
        resolve({ error: err });
      });

      if (body) req.write(body);
      req.end();
    });
  }

  console.log('\n--- 1. Testing Public SSR Pages ---');
  await checkRoute('/', 200);
  await checkRoute('/programs', 200);
  await checkRoute('/programs/btech-cse-ai', 200);
  await checkRoute('/campuses', 200);
  await checkRoute('/campuses/bengaluru-innovation-campus', 200);
  await checkRoute('/curriculum', 200);
  await checkRoute('/projects', 200);
  await checkRoute('/projects/novakv-distributed-raft-engine', 200);
  await checkRoute('/mentors', 200);
  await checkRoute('/scholarships', 200);
  await checkRoute('/fees', 200);
  await checkRoute('/career-planner', 200);
  await checkRoute('/admissions', 200);
  await checkRoute('/about', 200);
  await checkRoute('/contact', 200);
  await checkRoute('/auth/login', 200);
  await checkRoute('/auth/register', 200);

  console.log('\n--- 2. Testing Unauthenticated Route Protection ---');
  await checkRoute('/student/dashboard', 302); // Redirect to login
  await checkRoute('/student/application', 302); // Redirect to login
  await checkRoute('/admin', 302); // Redirect unauthenticated to login

  console.log('\n--- 3. Testing 404 Error Handling ---');
  await checkRoute('/non-existent-random-page-12345', 404);

  console.log('\n--- 4. Testing Live API Endpoints ---');
  const Program = require('../src/models/Program');
  const Campus = require('../src/models/Campus');
  const testProgram = await Program.findOne();
  const testCampus = await Campus.findOne();

  if (testProgram && testCampus) {
    const feeRes = await checkRoute('/api/fees/calculate', 200, {
      method: 'POST',
      body: {
        programId: testProgram._id,
        campusId: testCampus._id,
        includeHostel: true,
        tenure: 48,
      },
    });
    try {
      const parsed = JSON.parse(feeRes.data);
      if (parsed.success && parsed.calculation && parsed.calculation.breakdown.netTotalEstimated > 0) {
        console.log(`    ✓ Fee Calculation API returned valid total: ₹${parsed.calculation.breakdown.netTotalEstimated}`);
      } else {
        console.error('    ❌ Fee Calculation API payload missing expected fields');
        failed++;
      }
    } catch (e) {
      console.error('    ❌ Failed to parse JSON from Fee API');
      failed++;
    }

    const schRes = await checkRoute('/api/scholarships/evaluate', 200, {
      method: 'POST',
      body: {
        pcmPercentage: 96,
        gender: 'Female',
        familyAnnualIncome: 600000,
        hasCodingPortfolio: true,
      },
    });
    try {
      const parsed = JSON.parse(schRes.data);
      if (parsed.success && parsed.result.maxDiscountPercentage >= 50) {
        console.log(`    ✓ Scholarship API returned discount: ${parsed.result.maxDiscountPercentage}% (${parsed.result.eligibleCount} eligible)`);
      } else {
        console.error('    ❌ Scholarship evaluation API result unexpected');
        failed++;
      }
    } catch (e) {
      console.error('    ❌ Failed to parse JSON from Scholarship API');
      failed++;
    }
  }

  console.log('\n--- 5. Testing Contact Form Submission ---');
  const contactParams = new URLSearchParams({
    name: 'Test Student User',
    email: 'test.student@example.com',
    phone: '+91 99999 88888',
    subject: 'Automated Test Query',
    message: 'This is an automated test message to verify enquiry persistence.',
  }).toString();

  const contactRes = await checkRoute('/contact', 302, {
    method: 'POST',
    body: contactParams,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  if (contactRes.statusCode === 302) {
    const Enquiry = require('../src/models/Enquiry');
    const enq = await Enquiry.findOne({ email: 'test.student@example.com' });
    if (enq) {
      console.log(`    ✓ Contact Enquiry successfully stored in MongoDB: ID ${enq._id}`);
      await Enquiry.findByIdAndDelete(enq._id);
    }
  }

  console.log('\n==================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  server.close();
  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
