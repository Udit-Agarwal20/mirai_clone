const Mentor = require('../models/Mentor');
const StatsService = require('../services/statsService');

exports.getAboutPage = async (req, res, next) => {
  try {
    const [stats, leadershipMentors] = await Promise.all([
      StatsService.getPlatformStats(),
      Mentor.find().limit(6),
    ]);

    res.render('about/index', {
      pageTitle: 'About NOVA Institute of Technology | Build First. Learn Deeply.',
      pageDescription:
        'Why we founded NOVA: To replace outdated, rote-learning engineering academia with production-grade engineering, AI-first curriculums, and venture incubation.',
      stats,
      mentors: leadershipMentors,
    });
  } catch (err) {
    next(err);
  }
};
