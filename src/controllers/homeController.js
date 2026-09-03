const StatsService = require('../services/statsService');
const EventService = require('../services/eventService');
const Program = require('../models/Program');
const Project = require('../models/Project');
const Mentor = require('../models/Mentor');
const Campus = require('../models/Campus');
const Scholarship = require('../models/Scholarship');

exports.getHomePage = async (req, res, next) => {
  try {
    const [stats, eventCountdown, programs, featuredProjects, mentors, campuses, scholarships] =
      await Promise.all([
        StatsService.getPlatformStats(),
        EventService.getNearestUpcomingEvent(),
        Program.find({ isActive: true }).populate('campuses').sort({ featured: -1, createdAt: 1 }).limit(4),
        Project.find({ featured: true }).populate('program').limit(4),
        Mentor.find({ featured: true }).sort({ order: 1 }).limit(6),
        Campus.find().limit(3),
        Scholarship.find({ isActive: true, featured: true }).limit(3),
      ]);

    res.render('home/index', {
      pageTitle: 'NOVA Institute of Technology | Build First. Learn Deeply. Ship Relentlessly.',
      pageDescription:
        'An engineering education designed around AI, real products and real-world experience. Graduate with a degree AND a portfolio of things you actually built.',
      stats,
      eventCountdown,
      programs,
      featuredProjects,
      mentors,
      campuses,
      scholarships,
    });
  } catch (err) {
    next(err);
  }
};
