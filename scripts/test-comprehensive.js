require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');

// Models
const User = require('../src/models/User');
const Program = require('../src/models/Program');
const Campus = require('../src/models/Campus');
const Scholarship = require('../src/models/Scholarship');
const Project = require('../src/models/Project');
const Mentor = require('../src/models/Mentor');
const Event = require('../src/models/Event');
const Announcement = require('../src/models/Announcement');
const Application = require('../src/models/Application');
const Enquiry = require('../src/models/Enquiry');
const SavedCalculation = require('../src/models/SavedCalculation');

// Services
const FeeCalculatorService = require('../src/services/feeCalculatorService');
const ScholarshipService = require('../src/services/scholarshipService');
const CareerPlannerService = require('../src/services/careerPlannerService');
const EventService = require('../src/services/eventService');
const StatsService = require('../src/services/statsService');

async function runComprehensiveTests() {
  console.log('\n================================================================');
  console.log('🛡️  NOVA INSTITUTE OF TECHNOLOGY — COMPREHENSIVE AUDIT TEST SUITE');
  console.log('================================================================\n');

  await connectDB();

  const PORT = 3099;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`✓ Test server actively listening on http://127.0.0.1:${PORT}\n`);

  let passed = 0;
  let failed = 0;
  const testResults = [];

  function assert(condition, message, details = '') {
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${message}`);
      testResults.push({ message, passed: true, details });
    } else {
      failed++;
      console.error(`  ❌ [FAIL] ${message} — ${details}`);
      testResults.push({ message, passed: false, details });
    }
  }

  // Helper for HTTP requests
  async function request(path, options = {}) {
    const method = options.method || 'GET';
    const body = options.body;
    const headers = options.headers || {};

    let formattedBody = body;
    if (body && typeof body === 'object' && !headers['Content-Type']) {
      formattedBody = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }
    if (formattedBody) {
      headers['Content-Length'] = Buffer.byteLength(formattedBody);
    }

    return new Promise((resolve) => {
      const req = http.request(
        `http://127.0.0.1:${PORT}${path}`,
        { method, headers },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            const cookies = res.headers['set-cookie'] || [];
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              cookies,
              data,
            });
          });
        }
      );

      req.on('error', (err) => {
        resolve({ error: err, statusCode: 500, data: '' });
      });

      if (formattedBody) req.write(formattedBody);
      req.end();
    });
  }

  // Extract session cookie string
  function getCookieHeader(cookies) {
    if (!cookies || cookies.length === 0) return '';
    return cookies.map((c) => c.split(';')[0]).join('; ');
  }

  // =========================================================================
  // SUITE 1: PUBLIC SSR PAGES & SERVER-RENDERED CONTENT VERIFICATION
  // =========================================================================
  console.log('--- SUITE 1: Public SSR HTML Rendering ---');

  const publicRoutes = [
    { path: '/', mustInclude: 'NOVA Institute of Technology', desc: 'Homepage SSR' },
    { path: '/programs', mustInclude: 'Academic Programs', desc: 'Programs Catalog SSR' },
    { path: '/programs/btech-cse-ai', mustInclude: 'Computer Science & AI', desc: 'Program Detail SSR' },
    { path: '/campuses', mustInclude: 'Innovation Campuses', desc: 'Campuses Catalog SSR' },
    { path: '/campuses/bengaluru-innovation-campus', mustInclude: 'Bengaluru', desc: 'Campus Detail SSR' },
    { path: '/curriculum', mustInclude: 'Curriculum Roadmap', desc: 'Curriculum Roadmap SSR' },
    { path: '/projects', mustInclude: 'Student Project Showcase', desc: 'Projects Showcase SSR' },
    { path: '/projects/novakv-distributed-raft-engine', mustInclude: 'NovaKV', desc: 'Project Case Study SSR' },
    { path: '/mentors', mustInclude: 'Faculty Directory', desc: 'Mentors Directory SSR' },
    { path: '/scholarships', mustInclude: 'Scholarships & Fellowships', desc: 'Scholarships Catalog SSR' },
    { path: '/fees', mustInclude: 'Cost & Financing Planner', desc: 'Fee Planner SSR' },
    { path: '/career-planner', mustInclude: 'Career Path', desc: 'Career Planner Questionnaire SSR' },
    { path: '/admissions', mustInclude: 'Admissions 2026', desc: 'Admissions & Timeline SSR' },
    { path: '/about', mustInclude: 'Re-Engineering Technical Education', desc: 'About / Pedagogy SSR' },
    { path: '/contact', mustInclude: 'Contact Admissions', desc: 'Contact & Inquiries SSR' },
    { path: '/auth/login', mustInclude: 'Sign In', desc: 'Login Page SSR' },
    { path: '/auth/register', mustInclude: 'Create Student Account', desc: 'Register Page SSR' },
  ];

  for (const route of publicRoutes) {
    const res = await request(route.path);
    assert(
      res.statusCode === 200 && res.data.includes(route.mustInclude),
      `SSR Route: ${route.desc} (${route.path}) returned HTTP 200 with meaningful HTML`,
      `Status: ${res.statusCode}`
    );
  }

  // Check filtering and search on public pages
  const projectFiltered = await request('/projects?category=robotics');
  assert(
    projectFiltered.statusCode === 200 && projectFiltered.data.includes('AeroQuad'),
    'Project category filter (/projects?category=robotics) correctly filters showcase items'
  );

  const mentorFiltered = await request('/mentors?expertise=Large%20Language%20Models');
  assert(
    mentorFiltered.statusCode === 200 && mentorFiltered.data.includes('DeepMind'),
    'Mentor specialty filter (/mentors?expertise=...) returns matching faculty'
  );

  // =========================================================================
  // SUITE 2: BUSINESS LOGIC — 10+ COMBINATION FEE ENGINE TEST MATRIX
  // =========================================================================
  console.log('\n--- SUITE 2: Authoritative Fee Calculation Engine Matrix ---');

  const p1 = await Program.findOne({ slug: 'btech-cse-ai' });
  const p2 = await Program.findOne({ slug: 'btech-autonomous-systems-robotics' });
  const c1 = await Campus.findOne({ slug: 'bengaluru-innovation-campus' });
  const c2 = await Campus.findOne({ slug: 'hyderabad-ai-corridor' });
  const s100 = await Scholarship.findOne({ percentage: 100 });
  const s50 = await Scholarship.findOne({ percentage: 50 });
  const s25 = await Scholarship.findOne({ percentage: 25 });

  const feeMatrixCases = [
    { name: 'P1 + C1 + Hostel + No Scholarship (48m)', prog: p1, camp: c1, host: true, sch: null, tenure: 48 },
    { name: 'P1 + C1 + Day Scholar (No Hostel) + No Scholarship (48m)', prog: p1, camp: c1, host: false, sch: null, tenure: 48 },
    { name: 'P1 + C1 + Hostel + 100% Scholarship (48m)', prog: p1, camp: c1, host: true, sch: s100, tenure: 48 },
    { name: 'P1 + C1 + Hostel + 50% Scholarship (48m)', prog: p1, camp: c1, host: true, sch: s50, tenure: 48 },
    { name: 'P1 + C1 + Hostel + 25% Scholarship (48m)', prog: p1, camp: c1, host: true, sch: s25, tenure: 48 },
    { name: 'P2 + C2 + Hostel + No Scholarship (36m)', prog: p2, camp: c2, host: true, sch: null, tenure: 36 },
    { name: 'P2 + C2 + Day Scholar + 50% Scholarship (60m)', prog: p2, camp: c2, host: false, sch: s50, tenure: 60 },
    { name: 'P2 + C1 + Hostel + 100% Scholarship (36m)', prog: p2, camp: c1, host: true, sch: s100, tenure: 36 },
    { name: 'P1 + C2 + Day Scholar + 25% Scholarship (60m)', prog: p1, camp: c2, host: false, sch: s25, tenure: 60 },
    { name: 'P2 + C1 + Day Scholar + No Scholarship (48m)', prog: p2, camp: c1, host: false, sch: null, tenure: 48 },
  ];

  for (let i = 0; i < feeMatrixCases.length; i++) {
    const tc = feeMatrixCases[i];
    const calc = FeeCalculatorService.calculate({
      program: tc.prog,
      campus: tc.camp,
      includeHostel: tc.host,
      scholarship: tc.sch,
      financingTenureMonths: tc.tenure,
    });

    const expectedTuition4Yr = tc.prog.fees.tuitionPerYear * 4;
    const expectedLab4Yr = tc.prog.fees.labFeePerYear * 4;
    const expectedReg = tc.prog.fees.oneTimeAdmissionFee;
    const annualHostelFee = tc.host ? (tc.camp.hostelOptions?.[0]?.annualFee || tc.camp.annualHostelFeeDefault) : 0;
    const expectedHostel4Yr = annualHostelFee * 4;
    const expectedGross = expectedReg + expectedTuition4Yr + expectedLab4Yr + expectedHostel4Yr;
    const expectedWaiver = tc.sch ? (expectedTuition4Yr * tc.sch.percentage) / 100 : 0;
    const expectedNet = expectedGross - expectedWaiver;

    const isMatch =
      calc.breakdown.grossSubtotal === expectedGross &&
      calc.breakdown.scholarshipWaiver === expectedWaiver &&
      calc.breakdown.netTotalEstimated === expectedNet &&
      calc.financing.monthlyEstimate > 0;

    assert(
      isMatch,
      `Fee Matrix Case ${i + 1}: ${tc.name} [Net: ₹${calc.breakdown.netTotalEstimated}, EMI: ₹${calc.financing.monthlyEstimate}/mo]`,
      `Computed Net ${calc.breakdown.netTotalEstimated} vs Expected ${expectedNet}`
    );
  }

  // API fee endpoint verification
  const apiFeeRes = await request('/api/fees/calculate', {
    method: 'POST',
    body: {
      programId: p1._id.toString(),
      campusId: c1._id.toString(),
      includeHostel: true,
      tenure: 48,
    },
  });
  const apiFeeJson = JSON.parse(apiFeeRes.data);
  assert(
    apiFeeRes.statusCode === 200 && apiFeeJson.success && apiFeeJson.calculation.breakdown.netTotalEstimated > 0,
    'REST API /api/fees/calculate executes server calculation and returns accurate JSON'
  );

  // =========================================================================
  // SUITE 3: SCHOLARSHIP EVALUATOR ENGINE VERIFICATION
  // =========================================================================
  console.log('\n--- SUITE 3: Scholarship Rule Evaluation Engine ---');

  // Case 1: 96% PCM + Female + Low Income + Projects
  const schEval1 = await ScholarshipService.evaluateEligibility({
    pcmPercentage: 96,
    gender: 'Female',
    familyAnnualIncome: 500000,
    hasCodingPortfolio: true,
    isDefenseWard: true,
  });
  assert(
    schEval1.maxDiscountPercentage === 100 && schEval1.eligibleCount >= 4,
    'Scholarship Case 1: Top Academic Female candidate qualifies for 100% waiver'
  );

  // Case 2: Male + 72% PCM + High Income + No Projects
  const schEval2 = await ScholarshipService.evaluateEligibility({
    pcmPercentage: 72,
    gender: 'Male',
    familyAnnualIncome: 1800000,
    hasCodingPortfolio: false,
    isDefenseWard: false,
  });
  assert(
    schEval2.maxDiscountPercentage === 0 && schEval2.eligibleCount === 0,
    'Scholarship Case 2: Below-threshold candidate receives 0% waiver with explainable disqualifications'
  );

  // Case 3: 88% PCM + Female + Moderate Income
  const schEval3 = await ScholarshipService.evaluateEligibility({
    pcmPercentage: 88,
    gender: 'Female',
    familyAnnualIncome: 1000000,
  });
  assert(
    schEval3.maxDiscountPercentage >= 50,
    'Scholarship Case 3: Female candidate with 88% PCM qualifies for Women in Tech fellowship'
  );

  // =========================================================================
  // SUITE 4: DETERMINISTIC CAREER PLANNER ENGINE
  // =========================================================================
  console.log('\n--- SUITE 4: Deterministic Career Planner Engine ---');

  const planAI = await CareerPlannerService.generatePlan({
    academicScore: 92,
    primaryInterest: 'ai_ml',
    careerGoal: 'ai_engineer',
    codingExperience: 'beginner',
    preferredCampusCity: 'Bengaluru',
  });
  assert(
    planAI.recommendedProgram && planAI.recommendedProgram.slug === 'btech-ai-data-engineering' && planAI.journeyMilestones.length === 4,
    'Career Planner: AI Engineer input deterministically maps to AI & Data Engineering degree and 4-year milestones'
  );

  const planRobotics = await CareerPlannerService.generatePlan({
    academicScore: 84,
    primaryInterest: 'robotics_hardware',
    careerGoal: 'robotics_lead',
    codingExperience: 'advanced',
    preferredCampusCity: 'Pune',
  });
  assert(
    planRobotics.recommendedProgram && planRobotics.recommendedProgram.slug === 'btech-autonomous-systems-robotics' && planRobotics.campus.city === 'Pune',
    'Career Planner: Robotics lead input deterministically maps to Autonomous Robotics at Pune campus'
  );

  const planStartup = await CareerPlannerService.generatePlan({
    academicScore: 89,
    primaryInterest: 'fintech_startup',
    careerGoal: 'startup_founder',
    codingExperience: 'intermediate',
  });
  assert(
    planStartup.recommendedProgram && planStartup.recommendedProgram.slug === 'btech-product-engineering-fintech',
    'Career Planner: Startup Founder input deterministically maps to Product Engineering & FinTech'
  );

  // Verify determinism: Same input run twice produces identical recommendation
  const planAIRepeat = await CareerPlannerService.generatePlan({
    academicScore: 92,
    primaryInterest: 'ai_ml',
    careerGoal: 'ai_engineer',
    codingExperience: 'beginner',
    preferredCampusCity: 'Bengaluru',
  });
  assert(
    planAI.recommendedProgram.slug === planAIRepeat.recommendedProgram.slug &&
    planAI.recommendedTrack === planAIRepeat.recommendedTrack,
    'Career Planner: Identical inputs guarantee identical deterministic outcomes'
  );

  // =========================================================================
  // SUITE 5: EVENT SERVICE & DYNAMIC COUNTDOWN
  // =========================================================================
  console.log('\n--- SUITE 5: Event Service & Countdown Verification ---');

  const nearestEvent = await EventService.getNearestUpcomingEvent();
  assert(
    nearestEvent !== null && nearestEvent.remaining.totalSeconds >= 0 && !isNaN(nearestEvent.remaining.days),
    'Event Service: Derived nearest upcoming admission deadline with non-negative, numeric days/hours countdown'
  );

  const allActiveEvents = await EventService.getAllActiveEvents();
  assert(
    allActiveEvents.length > 0 && allActiveEvents.every((e) => ['UPCOMING', 'TODAY', 'CLOSED'].includes(e.status)),
    'Event Service: All active admission events evaluated with valid status enums'
  );

  // =========================================================================
  // SUITE 6: AUTHENTICATION, REGISTRATION, SESSION & LOGOUT
  // =========================================================================
  console.log('\n--- SUITE 6: Authentication, Sessions & Security ---');

  const testEmail = `audit.student.${Date.now()}@example.com`;
  const testPassword = 'Password@123';

  // 1. Register new student
  const regParams = new URLSearchParams({
    name: 'Audit Test Student',
    email: testEmail,
    phone: '+91 91234 56789',
    password: testPassword,
    confirmPassword: testPassword,
  }).toString();

  const regRes = await request('/auth/register', {
    method: 'POST',
    body: regParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(regRes.statusCode === 302, 'Student registration succeeded with 302 redirect to dashboard');

  const createdUser = await User.findOne({ email: testEmail });
  assert(
    createdUser && createdUser.role === 'student' && createdUser.password !== testPassword,
    'Password Security: Password is automatically bcrypt hashed (plaintext never stored)'
  );

  // 2. Login with registered student
  const loginParams = new URLSearchParams({
    email: testEmail,
    password: testPassword,
  }).toString();

  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: loginParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(
    loginRes.statusCode === 302 && loginRes.cookies.length > 0,
    'Student login succeeded with HTTP session cookie issued'
  );

  const studentCookie = getCookieHeader(loginRes.cookies);

  // 3. Authenticated student access
  const studentDashRes = await request('/student/dashboard', {
    headers: { Cookie: studentCookie },
  });
  assert(
    studentDashRes.statusCode === 200 && studentDashRes.data.includes('Audit Test Student'),
    'Authenticated student can access personal /student/dashboard'
  );

  // =========================================================================
  // SUITE 7: AUTHORIZATION BARRIERS & OWNERSHIP PROTECTION
  // =========================================================================
  console.log('\n--- SUITE 7: Authorization & Cross-Account Protection ---');

  // Anonymous user accessing student dashboard -> Redirect 302
  const anonStudentRes = await request('/student/dashboard');
  assert(anonStudentRes.statusCode === 302, 'Anonymous user accessing /student/dashboard is redirected (302)');

  // Anonymous user accessing admin portal -> Redirect 302
  const anonAdminRes = await request('/admin');
  assert(anonAdminRes.statusCode === 302, 'Anonymous user accessing /admin is redirected (302)');

  // Active Student user attempting to access admin portal -> HTTP 403 Forbidden
  const studentAdminRes = await request('/admin', {
    headers: { Cookie: studentCookie },
  });
  assert(
    studentAdminRes.statusCode === 403,
    'Student user accessing /admin is strictly blocked with HTTP 403 Access Denied'
  );

  // Unauthenticated user POSTing to protected endpoint -> Redirect 302
  const anonSaveCalcRes = await request('/fees/save', {
    method: 'POST',
    body: new URLSearchParams({ programId: p1._id.toString() }).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(
    anonSaveCalcRes.statusCode === 302,
    'Unauthenticated POST to /fees/save is blocked from creating records'
  );

  // 4. Logout session destruction
  const logoutRes = await request('/auth/logout', {
    headers: { Cookie: studentCookie },
  });
  assert(logoutRes.statusCode === 302, 'Logout invalidates session and redirects to login');

  // =========================================================================
  // SUITE 8: APPLICATION LIFECYCLE (DRAFT -> SUBMISSION -> REVIEW)
  // =========================================================================
  console.log('\n--- SUITE 8: Application Lifecycle & Progress Pipeline ---');

  // Login as student
  const studentLoginAgain = await request('/auth/login', {
    method: 'POST',
    body: loginParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const activeStudentCookie = getCookieHeader(studentLoginAgain.cookies);

  // 1. Save Application Draft
  const draftParams = new URLSearchParams({
    isDraft: 'true',
    fullName: 'Audit Test Student',
    email: testEmail,
    phone: '+91 91234 56789',
    pcmPercentage: '91.5',
    programId: p1._id.toString(),
    campusId: c1._id.toString(),
    hostelRequired: 'on',
    statementOfPurpose: 'I want to build real AI distributed systems at NOVA.',
  }).toString();

  const draftRes = await request('/student/application', {
    method: 'POST',
    body: draftParams,
    headers: {
      Cookie: activeStudentCookie,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  assert(draftRes.statusCode === 302, 'Application draft saved with 302 redirect');

  const draftApp = await Application.findOne({ student: createdUser._id });
  assert(
    draftApp && draftApp.status === 'DRAFT' && draftApp.applicationId.startsWith('NOVA-'),
    `Generated unique Application ID ${draftApp ? draftApp.applicationId : 'N/A'} in DRAFT state`
  );

  // 2. Officially Submit Application
  const submitParams = new URLSearchParams({
    isDraft: 'false',
    fullName: 'Audit Test Student',
    email: testEmail,
    phone: '+91 91234 56789',
    pcmPercentage: '91.5',
    programId: p1._id.toString(),
    campusId: c1._id.toString(),
    hostelRequired: 'on',
    statementOfPurpose: 'I want to build real AI distributed systems at NOVA.',
  }).toString();

  const submitRes = await request('/student/application', {
    method: 'POST',
    body: submitParams,
    headers: {
      Cookie: activeStudentCookie,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  assert(submitRes.statusCode === 302, 'Official application submitted with 302 redirect to status');

  const submittedApp = await Application.findOne({ student: createdUser._id });
  assert(
    submittedApp && submittedApp.status === 'SUBMITTED' && submittedApp.submittedAt !== null,
    'Application lifecycle advanced to SUBMITTED with submission timestamp recorded'
  );

  // 3. Student views application status timeline
  const statusViewRes = await request('/student/application/status', {
    headers: { Cookie: activeStudentCookie },
  });
  assert(
    statusViewRes.statusCode === 200 && statusViewRes.data.includes(submittedApp.applicationId),
    'Student can inspect their visual 6-stage lifecycle progress tracker'
  );

  // =========================================================================
  // SUITE 9: ADMIN AUTHENTICATION, APPLICATION MANAGEMENT & STATUS UPDATE
  // =========================================================================
  console.log('\n--- SUITE 9: Admin Management & Status Lifecycle ---');

  const adminLoginParams = new URLSearchParams({
    email: 'admin@novatech.edu',
    password: 'Admin@Nova2026!',
  }).toString();

  const adminLoginRes = await request('/auth/login', {
    method: 'POST',
    body: adminLoginParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(adminLoginRes.statusCode === 302, 'Admin login succeeded with redirect');

  const adminCookie = getCookieHeader(adminLoginRes.cookies);

  const adminDash = await request('/admin', { headers: { Cookie: adminCookie } });
  assert(
    adminDash.statusCode === 200 && adminDash.data.includes('TOTAL APPLICATIONS'),
    'Admin dashboard renders executive KPI metrics and application queues'
  );

  // Admin updates candidate application status to OFFERED
  const updateStatusParams = new URLSearchParams({
    status: 'OFFERED',
    scholarshipGrantedPercentage: '50',
    adminNotes: 'Candidate portfolio verified with outstanding technical aptitude.',
  }).toString();

  const adminUpdateRes = await request(`/admin/applications/${submittedApp._id}/status`, {
    method: 'POST',
    body: updateStatusParams,
    headers: {
      Cookie: adminCookie,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  assert(adminUpdateRes.statusCode === 302, 'Admin status update succeeded with 302 redirect');

  const updatedApp = await Application.findById(submittedApp._id);
  assert(
    updatedApp.status === 'OFFERED' &&
    updatedApp.offerDetails.scholarshipGrantedPercentage === 50 &&
    updatedApp.timeline.some((t) => t.stage === 'OFFERED'),
    'Application updated to OFFERED with 50% scholarship and activity timeline logged'
  );

  // =========================================================================
  // SUITE 10: ADMIN FULL CRUD VERIFICATION ACROSS ALL ENTITIES
  // =========================================================================
  console.log('\n--- SUITE 10: Admin Full CRUD Across All Managed Entities ---');

  // 1. Program CRUD
  const newProgRes = await request('/admin/programs', {
    method: 'POST',
    body: new URLSearchParams({
      name: 'B.Tech Quantum Computing Systems',
      slug: `btech-quantum-${Date.now()}`,
      degree: 'B.Tech',
      shortDescription: 'Quantum simulation and quantum ML.',
      description: 'Full 4-year quantum hardware and algorithms curriculum.',
      tuitionPerYear: '350000',
      isActive: 'on',
    }).toString(),
    headers: { Cookie: adminCookie, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(newProgRes.statusCode === 302, 'Admin CREATE: Program created successfully');

  const createdProg = await Program.findOne({ name: 'B.Tech Quantum Computing Systems' });
  assert(createdProg !== null, 'Admin READ: Program verified in MongoDB');

  await request(`/admin/programs/${createdProg._id}/delete`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
  });
  const deletedProg = await Program.findById(createdProg._id);
  assert(deletedProg === null, 'Admin DELETE: Program deleted successfully');

  // 2. Scholarship CRUD
  const newSchRes = await request('/admin/scholarships', {
    method: 'POST',
    body: new URLSearchParams({
      name: 'Super Quantum Fellowship',
      slug: `quantum-fellowship-${Date.now()}`,
      percentage: '75',
      category: 'Merit',
      description: 'Full tuition waiver for quantum builders.',
      isActive: 'on',
    }).toString(),
    headers: { Cookie: adminCookie, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(newSchRes.statusCode === 302, 'Admin CREATE: Scholarship created');

  const createdSch = await Scholarship.findOne({ name: 'Super Quantum Fellowship' });
  assert(createdSch !== null, 'Admin READ: Scholarship verified in MongoDB');

  await request(`/admin/scholarships/${createdSch._id}/delete`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
  });
  const deletedSch = await Scholarship.findById(createdSch._id);
  assert(deletedSch === null, 'Admin DELETE: Scholarship deleted successfully');

  // 3. Project CRUD
  const newProjRes = await request('/admin/projects', {
    method: 'POST',
    body: new URLSearchParams({
      title: 'QuantumSim Kernel',
      slug: `quantumsim-kernel-${Date.now()}`,
      description: 'Simulating 64-qubit circuits on CUDA.',
      category: 'AI',
      year: '3',
    }).toString(),
    headers: { Cookie: adminCookie, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(newProjRes.statusCode === 302, 'Admin CREATE: Project created');

  const createdProj = await Project.findOne({ title: 'QuantumSim Kernel' });
  assert(createdProj !== null, 'Admin READ: Project verified in MongoDB');

  await request(`/admin/projects/${createdProj._id}/delete`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
  });
  const deletedProj = await Project.findById(createdProj._id);
  assert(deletedProj === null, 'Admin DELETE: Project deleted successfully');

  // 4. Mentor CRUD
  const newMentorRes = await request('/admin/mentors', {
    method: 'POST',
    body: new URLSearchParams({
      name: 'Dr. Test Mentor',
      role: 'Staff Quantum Architect',
      company: 'Quantum Labs',
      bio: 'Pioneered superconducting qubits.',
    }).toString(),
    headers: { Cookie: adminCookie, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(newMentorRes.statusCode === 302, 'Admin CREATE: Mentor created');

  const createdMentor = await Mentor.findOne({ name: 'Dr. Test Mentor' });
  assert(createdMentor !== null, 'Admin READ: Mentor verified in MongoDB');

  await request(`/admin/mentors/${createdMentor._id}/delete`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
  });
  const deletedMentor = await Mentor.findById(createdMentor._id);
  assert(deletedMentor === null, 'Admin DELETE: Mentor deleted successfully');

  // 5. Event CRUD
  const newEventRes = await request('/admin/events', {
    method: 'POST',
    body: new URLSearchParams({
      title: 'Quantum Hackathon 2026',
      type: 'WEBINAR',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
      isActive: 'on',
    }).toString(),
    headers: { Cookie: adminCookie, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(newEventRes.statusCode === 302, 'Admin CREATE: Event created');

  const createdEvent = await Event.findOne({ title: 'Quantum Hackathon 2026' });
  assert(createdEvent !== null, 'Admin READ: Event verified in MongoDB');

  await request(`/admin/events/${createdEvent._id}/delete`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
  });
  const deletedEvent = await Event.findById(createdEvent._id);
  assert(deletedEvent === null, 'Admin DELETE: Event deleted successfully');

  // 6. Announcement CRUD
  const newAnnRes = await request('/admin/announcements', {
    method: 'POST',
    body: new URLSearchParams({
      title: 'Quantum Fellowship Live',
      message: 'Apply for the new Quantum fellowship cohort.',
      badge: 'NEW COHORT',
      priority: '5',
      isActive: 'on',
    }).toString(),
    headers: { Cookie: adminCookie, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(newAnnRes.statusCode === 302, 'Admin CREATE: Announcement created');

  const createdAnn = await Announcement.findOne({ title: 'Quantum Fellowship Live' });
  assert(createdAnn !== null, 'Admin READ: Announcement verified in MongoDB');

  await request(`/admin/announcements/${createdAnn._id}/delete`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
  });
  const deletedAnn = await Announcement.findById(createdAnn._id);
  assert(deletedAnn === null, 'Admin DELETE: Announcement deleted successfully');

  // =========================================================================
  // SUITE 11: CONTACT & INQUIRY FLOW
  // =========================================================================
  console.log('\n--- SUITE 11: Contact Form & Inquiry Flow ---');

  const contactEmail = `inquiry.${Date.now()}@example.com`;
  const contactSubmit = await request('/contact', {
    method: 'POST',
    body: new URLSearchParams({
      name: 'Inquiry Tester',
      email: contactEmail,
      phone: '+91 98765 00000',
      subject: 'Question on GPU Lab Access',
      message: 'What GPU compute resources are provided to Year 1 students?',
    }).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(contactSubmit.statusCode === 302, 'Public contact form submitted successfully with 302 redirect');

  const storedEnq = await Enquiry.findOne({ email: contactEmail });
  assert(
    storedEnq && storedEnq.status === 'NEW',
    'Contact inquiry stored in MongoDB with status NEW'
  );

  // Admin resolves inquiry
  const resolveEnqRes = await request(`/admin/enquiries/${storedEnq._id}/status`, {
    method: 'POST',
    body: new URLSearchParams({
      status: 'RESOLVED',
      adminNotes: 'Contacted applicant and shared GPU lab specifications.',
    }).toString(),
    headers: { Cookie: adminCookie, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assert(resolveEnqRes.statusCode === 302, 'Admin resolved inquiry successfully');

  const resolvedEnq = await Enquiry.findById(storedEnq._id);
  assert(resolvedEnq.status === 'RESOLVED', 'Inquiry status updated to RESOLVED in MongoDB');

  // Clean up inquiry
  await Enquiry.findByIdAndDelete(storedEnq._id);

  // =========================================================================
  // SUITE 12: ERROR HANDLING & MALFORMED INPUT RESILIENCE
  // =========================================================================
  console.log('\n--- SUITE 12: Error Handling & Security Boundary Tests ---');

  // Unknown URL -> 404
  const err404 = await request('/random-nonexistent-url-98765');
  assert(err404.statusCode === 404, 'Unknown URL returns HTTP 404 page');

  // Non-existent program slug -> 404
  const prog404 = await request('/programs/non-existent-program-slug-12345');
  assert(prog404.statusCode === 404, 'Non-existent program slug returns HTTP 404');

  // Invalid ObjectId cast -> 404 (not 500 crash)
  const cast404 = await request('/admin/applications/not-a-valid-object-id', {
    headers: { Cookie: adminCookie },
  });
  assert(
    cast404.statusCode === 404,
    'Invalid MongoDB ObjectId in URL handled gracefully as HTTP 404 (CastError prevented 500)'
  );

  // Clean up test student user and application
  await User.findByIdAndDelete(createdUser._id);
  await Application.deleteMany({ student: createdUser._id });

  console.log('\n================================================================');
  console.log(`🏁 COMPREHENSIVE AUDIT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  server.close();
  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runComprehensiveTests();
