const Program = require('../models/Program');
const Campus = require('../models/Campus');
const Project = require('../models/Project');
const Scholarship = require('../models/Scholarship');

exports.getPrograms = async (req, res, next) => {
  try {
    const { search, degree, campus } = req.query;
    const query = { isActive: true };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { skills: searchRegex }, { shortDescription: searchRegex }];
    }

    if (degree && degree !== 'all') {
      query.degree = degree;
    }

    if (campus && campus !== 'all') {
      const targetCampus = await Campus.findOne({ slug: campus });
      if (targetCampus) {
        query.campuses = targetCampus._id;
      }
    }

    const [programs, allCampuses] = await Promise.all([
      Program.find(query).populate('campuses').sort({ featured: -1, createdAt: 1 }),
      Campus.find(),
    ]);

    res.render('programs/index', {
      pageTitle: 'Academic Programs | NOVA Institute of Technology',
      pageDescription:
        'Explore our AI-first B.Tech engineering programs designed for real-world product engineering and industry leadership.',
      programs,
      campuses: allCampuses,
      filters: {
        search: search || '',
        degree: degree || 'all',
        campus: campus || 'all',
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getProgramDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const program = await Program.findOne({ slug, isActive: true }).populate('campuses');

    if (!program) {
      return res.status(404).render('errors/404', {
        pageTitle: 'Program Not Found | NOVA Institute of Technology',
        pageDescription: 'The requested degree program could not be found.',
      });
    }

    const [projects, relatedScholarships] = await Promise.all([
      Project.find({ program: program._id }).limit(4),
      Scholarship.find({ isActive: true }).limit(3),
    ]);

    res.render('programs/show', {
      pageTitle: `${program.name} | NOVA Institute of Technology`,
      pageDescription: program.shortDescription,
      program,
      projects,
      relatedScholarships,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCurriculumOverview = async (req, res, next) => {
  try {
    const programs = await Program.find({ isActive: true });

    res.render('curriculum/index', {
      pageTitle: '4-Year Build-First Curriculum | NOVA Institute of Technology',
      pageDescription:
        'Detailed breakdown of our project-based 4-year engineering curriculum. From first products in Year 1 to venture incubation in Year 4.',
      programs,
    });
  } catch (err) {
    next(err);
  }
};
