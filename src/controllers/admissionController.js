const EventService = require('../services/eventService');
const Program = require('../models/Program');
const Scholarship = require('../models/Scholarship');

exports.getAdmissionsPage = async (req, res, next) => {
  try {
    const [eventCountdown, allEvents, programs, scholarships] = await Promise.all([
      EventService.getNearestUpcomingEvent(),
      EventService.getAllActiveEvents(),
      Program.find({ isActive: true }),
      Scholarship.find({ isActive: true, featured: true }).limit(4),
    ]);

    res.render('admissions/index', {
      pageTitle: 'Admissions 2026 Process & Deadlines | NOVA Institute of Technology',
      pageDescription:
        'A transparent 4-stage admissions pathway evaluating problem-solving agility, projects, and potential. Apply for the 2026 Fall Batch.',
      eventCountdown,
      events: allEvents,
      programs,
      scholarships,
    });
  } catch (err) {
    next(err);
  }
};
