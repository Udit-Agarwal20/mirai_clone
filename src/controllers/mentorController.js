const Mentor = require('../models/Mentor');

exports.getMentors = async (req, res, next) => {
  try {
    const { expertise, search } = req.query;
    const query = {};

    if (expertise && expertise !== 'all') {
      query.expertise = new RegExp(expertise, 'i');
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { company: searchRegex }, { role: searchRegex }, { bio: searchRegex }];
    }

    const mentors = await Mentor.find(query).sort({ featured: -1, order: 1 });

    // Collect unique expertise areas
    const allMentors = await Mentor.find();
    const expertiseSet = new Set();
    allMentors.forEach((m) => {
      if (m.expertise && Array.isArray(m.expertise)) {
        m.expertise.forEach((exp) => expertiseSet.add(exp));
      }
    });

    res.render('mentors/index', {
      pageTitle: 'Industry Mentors & Faculty | NOVA Institute of Technology',
      pageDescription:
        'Learn directly from Staff Engineers, AI Researchers, and Founders from Google DeepMind, OpenAI, NVIDIA, Stripe, and leading global startups.',
      mentors,
      expertiseList: Array.from(expertiseSet).sort(),
      currentExpertise: expertise || 'all',
      searchQuery: search || '',
    });
  } catch (err) {
    next(err);
  }
};
