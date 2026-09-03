const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const programController = require('../controllers/programController');
const campusController = require('../controllers/campusController');
const projectController = require('../controllers/projectController');
const mentorController = require('../controllers/mentorController');
const scholarshipController = require('../controllers/scholarshipController');
const feeController = require('../controllers/feeController');
const careerPlannerController = require('../controllers/careerPlannerController');
const admissionController = require('../controllers/admissionController');
const aboutController = require('../controllers/aboutController');
const contactController = require('../controllers/contactController');

// 1. Homepage
router.get('/', homeController.getHomePage);

// 2. Academic Programs & Curriculum
router.get('/programs', programController.getPrograms);
router.get('/programs/:slug', programController.getProgramDetail);
router.get('/curriculum', programController.getCurriculumOverview);

// 3. Campuses
router.get('/campuses', campusController.getCampuses);
router.get('/campuses/:slug', campusController.getCampusDetail);

// 4. Student Projects
router.get('/projects', projectController.getProjects);
router.get('/projects/:slug', projectController.getProjectDetail);

// 5. Mentors & Faculty Directory
router.get('/mentors', mentorController.getMentors);

// 6. Scholarships & Eligibility
router.get('/scholarships', scholarshipController.getScholarships);
router.post('/scholarships/calculate', scholarshipController.calculateEligibility);

// 7. Cost & Scholarship Planner
router.get('/fees', feeController.getFeePlanner);
router.post('/fees/calculate', feeController.calculateFeesSSR);
router.post('/fees/save', feeController.saveCalculation);

// 8. Career & Roadmap Planner
router.get('/career-planner', careerPlannerController.getCareerPlanner);
router.post('/career-planner', careerPlannerController.generateCareerPlan);

// 9. Admissions Process
router.get('/admissions', admissionController.getAdmissionsPage);

// 10. About & Pedagogy
router.get('/about', aboutController.getAboutPage);

// 11. Contact & Inquiries
router.get('/contact', contactController.getContactPage);
router.post('/contact', contactController.submitContactForm);

module.exports = router;
