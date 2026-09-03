const Campus = require('../models/Campus');
const Program = require('../models/Program');

exports.getCampuses = async (req, res, next) => {
  try {
    const { city } = req.query;
    const query = {};

    if (city && city !== 'all') {
      query.city = new RegExp(city, 'i');
    }

    const [campuses, allPrograms] = await Promise.all([
      Campus.find(query).populate('programs'),
      Program.find({ isActive: true }),
    ]);

    res.render('campuses/index', {
      pageTitle: 'Innovation Campuses | NOVA Institute of Technology',
      pageDescription:
        'Explore our state-of-the-art innovation campuses located in India’s leading technology hubs: Bengaluru, Hyderabad, and Pune.',
      campuses,
      allPrograms,
      selectedCity: city || 'all',
    });
  } catch (err) {
    next(err);
  }
};

exports.getCampusDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const campus = await Campus.findOne({ slug }).populate('programs');

    if (!campus) {
      return res.status(404).render('errors/404', {
        pageTitle: 'Campus Not Found | NOVA Institute of Technology',
        pageDescription: 'The requested campus could not be found.',
      });
    }

    res.render('campuses/show', {
      pageTitle: `${campus.name} | NOVA Institute of Technology`,
      pageDescription: campus.description,
      campus,
    });
  } catch (err) {
    next(err);
  }
};
