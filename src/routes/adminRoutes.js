const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { ensureAdmin } = require('../middleware/roleMiddleware');

// All admin routes require authenticated admin
router.use(ensureAuthenticated, ensureAdmin);

// Dashboard
router.get('/', adminController.getDashboard);

// Applications
router.get('/applications', adminController.getApplications);
router.get('/applications/:id', adminController.getApplicationDetail);
router.post('/applications/:id/status', adminController.updateApplicationStatus);

// Students Roster
router.get('/students', adminController.getStudents);

// Programs CRUD
router.get('/programs', adminController.getPrograms);
router.get('/programs/new', adminController.getProgramCreateForm);
router.post('/programs', adminController.postProgramCreate);
router.get('/programs/:id/edit', adminController.getProgramEditForm);
router.post('/programs/:id', adminController.postProgramUpdate);
router.post('/programs/:id/delete', adminController.deleteProgram);

// Campuses CRUD
router.get('/campuses', adminController.getCampuses);
router.get('/campuses/new', adminController.getCampusCreateForm);
router.post('/campuses', adminController.postCampusCreate);
router.get('/campuses/:id/edit', adminController.getCampusEditForm);
router.post('/campuses/:id', adminController.postCampusUpdate);
router.post('/campuses/:id/delete', adminController.deleteCampus);

// Scholarships CRUD
router.get('/scholarships', adminController.getScholarships);
router.get('/scholarships/new', adminController.getScholarshipCreateForm);
router.post('/scholarships', adminController.postScholarshipCreate);
router.get('/scholarships/:id/edit', adminController.getScholarshipEditForm);
router.post('/scholarships/:id', adminController.postScholarshipUpdate);
router.post('/scholarships/:id/delete', adminController.deleteScholarship);

// Projects CRUD
router.get('/projects', adminController.getProjects);
router.get('/projects/new', adminController.getProjectCreateForm);
router.post('/projects', adminController.postProjectCreate);
router.get('/projects/:id/edit', adminController.getProjectEditForm);
router.post('/projects/:id', adminController.postProjectUpdate);
router.post('/projects/:id/delete', adminController.deleteProject);

// Mentors CRUD
router.get('/mentors', adminController.getMentors);
router.get('/mentors/new', adminController.getMentorCreateForm);
router.post('/mentors', adminController.postMentorCreate);
router.get('/mentors/:id/edit', adminController.getMentorEditForm);
router.post('/mentors/:id', adminController.postMentorUpdate);
router.post('/mentors/:id/delete', adminController.deleteMentor);

// Events CRUD
router.get('/events', adminController.getEvents);
router.get('/events/new', adminController.getEventCreateForm);
router.post('/events', adminController.postEventCreate);
router.get('/events/:id/edit', adminController.getEventEditForm);
router.post('/events/:id', adminController.postEventUpdate);
router.post('/events/:id/delete', adminController.deleteEvent);

// Announcements CRUD
router.get('/announcements', adminController.getAnnouncements);
router.get('/announcements/new', adminController.getAnnouncementCreateForm);
router.post('/announcements', adminController.postAnnouncementCreate);
router.get('/announcements/:id/edit', adminController.getAnnouncementEditForm);
router.post('/announcements/:id', adminController.postAnnouncementUpdate);
router.post('/announcements/:id/delete', adminController.deleteAnnouncement);

// Enquiries
router.get('/enquiries', adminController.getEnquiries);
router.get('/enquiries/:id', adminController.getEnquiryDetail);
router.post('/enquiries/:id/status', adminController.updateEnquiryStatus);

module.exports = router;
