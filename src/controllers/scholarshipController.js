const Scholarship = require('../models/Scholarship');
const ScholarshipService = require('../services/scholarshipService');

exports.getScholarships = async (req, res, next) => {
  try {
    const scholarships = await Scholarship.find({ isActive: true }).sort({ percentage: -1 });

    res.render('scholarships/index', {
      pageTitle: 'Scholarships & Fellowships | NOVA Institute of Technology',
      pageDescription:
        'Explore up to 100% merit fellowships, Women in Tech grants, and need-based financial aid. Use our interactive eligibility calculator to check your estimate.',
      scholarships,
      calculationResult: null,
      formData: {},
    });
  } catch (err) {
    next(err);
  }
};

exports.calculateEligibility = async (req, res, next) => {
  try {
    const { pcmPercentage, gender, familyAnnualIncome, isDefenseWard, hasCodingPortfolio, entranceScore } = req.body;

    const [scholarships, evaluation] = await Promise.all([
      Scholarship.find({ isActive: true }).sort({ percentage: -1 }),
      ScholarshipService.evaluateEligibility({
        pcmPercentage: Number(pcmPercentage),
        gender,
        familyAnnualIncome: Number(familyAnnualIncome),
        isDefenseWard: isDefenseWard === 'true' || isDefenseWard === true || isDefenseWard === 'on',
        hasCodingPortfolio: hasCodingPortfolio === 'true' || hasCodingPortfolio === true || hasCodingPortfolio === 'on',
        entranceScore,
      }),
    ]);

    res.render('scholarships/index', {
      pageTitle: 'Scholarship Eligibility Result | NOVA Institute of Technology',
      pageDescription: 'Automated estimate of applicable scholarships and fee waivers at NOVA.',
      scholarships,
      calculationResult: evaluation,
      formData: req.body,
    });
  } catch (err) {
    next(err);
  }
};
