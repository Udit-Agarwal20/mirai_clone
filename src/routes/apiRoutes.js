const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.post('/fees/calculate', apiController.calculateFeeLive);
router.post('/scholarships/evaluate', apiController.evaluateScholarshipLive);

module.exports = router;
