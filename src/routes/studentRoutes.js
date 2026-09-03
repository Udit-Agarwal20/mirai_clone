const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { ensureStudent } = require('../middleware/roleMiddleware');

// All student routes require authentication
router.use(ensureAuthenticated, ensureStudent);

router.get('/dashboard', studentController.getDashboard);

router.get('/application', studentController.getApplicationForm);
router.post('/application', studentController.submitApplication);
router.get('/application/status', studentController.getApplicationStatus);

router.get('/saved', studentController.getSavedItems);
router.post('/saved/toggle', studentController.toggleBookmark);

router.get('/profile', studentController.getProfile);
router.post('/profile', studentController.updateProfile);

module.exports = router;
