const Project = require('../models/Project');
const Program = require('../models/Program');

exports.getProjects = async (req, res, next) => {
  try {
    const { category, search, year } = req.query;
    const query = {};

    if (category && category !== 'all') {
      // Allow case-insensitive or hyphen match
      const formattedCategory = category.replace(/-/g, ' ').toUpperCase();
      query.category = new RegExp(`^${formattedCategory}$`, 'i');
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { tagline: searchRegex }, { technology: searchRegex }, { description: searchRegex }];
    }

    if (year && year !== 'all') {
      query.year = Number(year);
    }

    const projects = await Project.find(query).populate('program').sort({ featured: -1, createdAt: -1 });

    const categories = ['ALL', 'AI', 'WEB', 'MOBILE', 'ROBOTICS', 'STARTUP', 'OPEN SOURCE'];

    res.render('projects/index', {
      pageTitle: 'Student Project Showcase | NOVA Institute of Technology',
      pageDescription:
        'Discover production systems, open-source engines, autonomous drones, and funded startups engineered by NOVA undergraduate students.',
      projects,
      categories,
      currentCategory: category || 'all',
      searchQuery: search || '',
      currentYear: year || 'all',
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjectDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await Project.findOne({ slug }).populate('program');

    if (!project) {
      return res.status(404).render('errors/404', {
        pageTitle: 'Project Not Found | NOVA Institute of Technology',
        pageDescription: 'The requested student project case study could not be found.',
      });
    }

    const relatedProjects = await Project.find({
      _id: { $ne: project._id },
      category: project.category,
    }).limit(3);

    res.render('projects/show', {
      pageTitle: `${project.title} | Student Project Showcase`,
      pageDescription: project.tagline || project.description,
      project,
      relatedProjects,
    });
  } catch (err) {
    next(err);
  }
};
