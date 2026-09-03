const CareerPlannerService = require('../services/careerPlannerService');
const Campus = require('../models/Campus');

exports.getCareerPlanner = async (req, res, next) => {
  try {
    const campuses = await Campus.find();

    res.render('career-planner/index', {
      pageTitle: 'AI Career Path & Curriculum Planner | NOVA Institute of Technology',
      pageDescription:
        'Get a deterministic, personalized 4-year curriculum trajectory, tech stack roadmap, and estimated cost tailored to your ambitions.',
      campuses,
      plan: null,
      formData: {},
    });
  } catch (err) {
    next(err);
  }
};

exports.generateCareerPlan = async (req, res, next) => {
  try {
    const {
      academicScore,
      primaryInterest,
      careerGoal,
      codingExperience,
      budgetRange,
      preferredCampusCity,
      hostelNeeded,
    } = req.body;

    const [campuses, plan] = await Promise.all([
      Campus.find(),
      CareerPlannerService.generatePlan({
        academicScore: Number(academicScore) || 85,
        primaryInterest,
        careerGoal,
        codingExperience,
        budgetRange,
        preferredCampusCity,
        hostelNeeded: hostelNeeded === 'true' || hostelNeeded === true || hostelNeeded === 'on',
      }),
    ]);

    res.render('career-planner/result', {
      pageTitle: `Your Personalized Roadmap: ${plan.recommendedTrack} | NOVA Career Planner`,
      pageDescription: `Tailored 4-year engineering trajectory for ${plan.recommendedProgram.name}.`,
      campuses,
      plan,
      formData: req.body,
    });
  } catch (err) {
    next(err);
  }
};
