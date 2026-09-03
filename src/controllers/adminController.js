const User = require('../models/User');
const Application = require('../models/Application');
const Program = require('../models/Program');
const Campus = require('../models/Campus');
const Scholarship = require('../models/Scholarship');
const Project = require('../models/Project');
const Mentor = require('../models/Mentor');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Enquiry = require('../models/Enquiry');

// ================= ADMIN DASHBOARD =================
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalApplications,
      underReviewApplications,
      offeredApplications,
      enrolledApplications,
      totalStudents,
      totalPrograms,
      totalCampuses,
      unreadEnquiries,
      recentApplications,
      recentEnquiries,
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'ASSESSMENT', 'INTERVIEW'] } }),
      Application.countDocuments({ status: 'OFFERED' }),
      Application.countDocuments({ status: 'ENROLLED' }),
      User.countDocuments({ role: 'student' }),
      Program.countDocuments(),
      Campus.countDocuments(),
      Enquiry.countDocuments({ status: 'NEW' }),
      Application.find()
        .populate('student preferences.program preferences.campus')
        .sort({ createdAt: -1 })
        .limit(6),
      Enquiry.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.render('admin/dashboard', {
      pageTitle: 'Admin Portal | NOVA Institute of Technology',
      layout: 'layouts/admin',
      stats: {
        totalApplications,
        underReviewApplications,
        offeredApplications,
        enrolledApplications,
        totalStudents,
        totalPrograms,
        totalCampuses,
        unreadEnquiries,
      },
      recentApplications,
      recentEnquiries,
    });
  } catch (err) {
    next(err);
  }
};

// ================= APPLICATION MANAGEMENT =================
exports.getApplications = async (req, res, next) => {
  try {
    const { status, program, search } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (program && program !== 'ALL') {
      query['preferences.program'] = program;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { applicationId: searchRegex },
        { 'personalInfo.fullName': searchRegex },
        { 'personalInfo.email': searchRegex },
      ];
    }

    const [applications, programs] = await Promise.all([
      Application.find(query)
        .populate('student preferences.program preferences.campus preferences.claimedScholarship')
        .sort({ createdAt: -1 }),
      Program.find(),
    ]);

    res.render('admin/applications/index', {
      pageTitle: 'Manage Applications | Admin Portal',
      layout: 'layouts/admin',
      applications,
      programs,
      currentStatus: status || 'ALL',
      currentProgram: program || 'ALL',
      searchQuery: search || '',
    });
  } catch (err) {
    next(err);
  }
};

exports.getApplicationDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id)
      .populate('student preferences.program preferences.alternateProgram preferences.campus preferences.alternateCampus preferences.claimedScholarship');

    if (!application) {
      req.flash('error_msg', 'Application not found.');
      return res.redirect('/admin/applications');
    }

    res.render('admin/applications/show', {
      pageTitle: `Application: ${application.applicationId} | Admin Portal`,
      layout: 'layouts/admin',
      application,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      adminNotes,
      assessmentScheduledDate,
      assessmentScore,
      interviewScheduledDate,
      interviewMeetingLink,
      scholarshipGrantedPercentage,
    } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      req.flash('error_msg', 'Application not found.');
      return res.redirect('/admin/applications');
    }

    const previousStatus = application.status;
    application.status = status;
    if (adminNotes) application.adminNotes = adminNotes;

    if (assessmentScheduledDate) {
      application.assessmentDetails.scheduledDate = new Date(assessmentScheduledDate);
      application.assessmentDetails.status = 'Scheduled';
    }
    if (assessmentScore) application.assessmentDetails.score = Number(assessmentScore);

    if (interviewScheduledDate) {
      application.interviewDetails.scheduledDate = new Date(interviewScheduledDate);
      application.interviewDetails.meetingLink = interviewMeetingLink || '';
      application.interviewDetails.status = 'Scheduled';
    }

    if (scholarshipGrantedPercentage) {
      application.offerDetails.scholarshipGrantedPercentage = Number(scholarshipGrantedPercentage);
    }

    // Add timeline record if status changed
    if (previousStatus !== status) {
      application.timeline.push({
        stage: status,
        timestamp: new Date(),
        note: adminNotes || `Status updated from ${previousStatus} to ${status} by Administrator.`,
        updatedBy: req.user.name || 'Admissions Officer',
      });
    }

    await application.save();

    req.flash('success_msg', `Application ${application.applicationId} updated to ${status}.`);
    res.redirect(`/admin/applications/${application._id}`);
  } catch (err) {
    next(err);
  }
};

// ================= STUDENT ROSTER =================
exports.getStudents = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { role: 'student' };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const students = await User.find(query).sort({ createdAt: -1 });

    // Attach application summary for each student
    const studentIds = students.map((s) => s._id);
    const applications = await Application.find({ student: { $in: studentIds } }).populate('preferences.program');
    const appMap = {};
    applications.forEach((a) => {
      appMap[a.student.toString()] = a;
    });

    res.render('admin/students/index', {
      pageTitle: 'Student Roster | Admin Portal',
      layout: 'layouts/admin',
      students,
      appMap,
      searchQuery: search || '',
    });
  } catch (err) {
    next(err);
  }
};

// ================= CRUD: PROGRAMS =================
exports.getPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find().populate('campuses').sort({ createdAt: 1 });
    res.render('admin/programs/index', {
      pageTitle: 'Manage Programs | Admin Portal',
      layout: 'layouts/admin',
      programs,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProgramCreateForm = async (req, res, next) => {
  try {
    const campuses = await Campus.find();
    res.render('admin/programs/form', {
      pageTitle: 'Create Academic Program | Admin Portal',
      layout: 'layouts/admin',
      program: {},
      campuses,
      isEdit: false,
    });
  } catch (err) {
    next(err);
  }
};

exports.postProgramCreate = async (req, res, next) => {
  try {
    const { name, slug, degree, duration, shortDescription, description, tuitionPerYear, labFeePerYear, oneTimeAdmissionFee, skills, whoShouldChoose, campuses, badge, isActive, featured } = req.body;

    const program = await Program.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      degree: degree || 'B.Tech',
      duration: duration || '4 Years (8 Semesters)',
      shortDescription,
      description,
      badge: badge || 'AI-First',
      fees: {
        tuitionPerYear: Number(tuitionPerYear) || 300000,
        labFeePerYear: Number(labFeePerYear) || 40000,
        oneTimeAdmissionFee: Number(oneTimeAdmissionFee) || 50000,
      },
      skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      whoShouldChoose: whoShouldChoose ? whoShouldChoose.split('\n').map((s) => s.trim()).filter(Boolean) : [],
      campuses: Array.isArray(campuses) ? campuses : (campuses ? [campuses] : []),
      isActive: isActive === 'on' || isActive === 'true' || isActive === true,
      featured: featured === 'on' || featured === 'true' || featured === true,
    });

    req.flash('success_msg', `Program "${program.name}" created successfully.`);
    res.redirect('/admin/programs');
  } catch (err) {
    next(err);
  }
};

exports.getProgramEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [program, campuses] = await Promise.all([
      Program.findById(id),
      Campus.find(),
    ]);

    if (!program) {
      req.flash('error_msg', 'Program not found.');
      return res.redirect('/admin/programs');
    }

    res.render('admin/programs/form', {
      pageTitle: `Edit Program: ${program.name} | Admin Portal`,
      layout: 'layouts/admin',
      program,
      campuses,
      isEdit: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.postProgramUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, degree, duration, shortDescription, description, tuitionPerYear, labFeePerYear, oneTimeAdmissionFee, skills, whoShouldChoose, campuses, badge, isActive, featured } = req.body;

    const program = await Program.findByIdAndUpdate(
      id,
      {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        degree,
        duration,
        shortDescription,
        description,
        badge,
        fees: {
          tuitionPerYear: Number(tuitionPerYear),
          labFeePerYear: Number(labFeePerYear),
          oneTimeAdmissionFee: Number(oneTimeAdmissionFee),
        },
        skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        whoShouldChoose: whoShouldChoose ? whoShouldChoose.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        campuses: Array.isArray(campuses) ? campuses : (campuses ? [campuses] : []),
        isActive: isActive === 'on' || isActive === 'true' || isActive === true,
        featured: featured === 'on' || featured === 'true' || featured === true,
      },
      { new: true }
    );

    req.flash('success_msg', `Program "${program.name}" updated successfully.`);
    res.redirect('/admin/programs');
  } catch (err) {
    next(err);
  }
};

exports.deleteProgram = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Program.findByIdAndDelete(id);
    req.flash('success_msg', 'Program deleted successfully.');
    res.redirect('/admin/programs');
  } catch (err) {
    next(err);
  }
};

// ================= CRUD: CAMPUSES =================
exports.getCampuses = async (req, res, next) => {
  try {
    const campuses = await Campus.find().populate('programs');
    res.render('admin/campuses/index', {
      pageTitle: 'Manage Campuses | Admin Portal',
      layout: 'layouts/admin',
      campuses,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCampusCreateForm = async (req, res, next) => {
  try {
    const programs = await Program.find();
    res.render('admin/campuses/form', {
      pageTitle: 'Create Innovation Campus | Admin Portal',
      layout: 'layouts/admin',
      campus: {},
      programs,
      isEdit: false,
    });
  } catch (err) {
    next(err);
  }
};

exports.postCampusCreate = async (req, res, next) => {
  try {
    const { name, slug, city, state, tagline, description, address, availableSeats, status, annualHostelFeeDefault, programs } = req.body;

    const campus = await Campus.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      city,
      state,
      tagline,
      description,
      address,
      availableSeats: Number(availableSeats) || 200,
      status: status || 'Admissions Open',
      annualHostelFeeDefault: Number(annualHostelFeeDefault) || 180000,
      programs: Array.isArray(programs) ? programs : (programs ? [programs] : []),
    });

    req.flash('success_msg', `Campus "${campus.name}" created successfully.`);
    res.redirect('/admin/campuses');
  } catch (err) {
    next(err);
  }
};

exports.getCampusEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [campus, programs] = await Promise.all([
      Campus.findById(id),
      Program.find(),
    ]);

    if (!campus) {
      req.flash('error_msg', 'Campus not found.');
      return res.redirect('/admin/campuses');
    }

    res.render('admin/campuses/form', {
      pageTitle: `Edit Campus: ${campus.name} | Admin Portal`,
      layout: 'layouts/admin',
      campus,
      programs,
      isEdit: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.postCampusUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, city, state, tagline, description, address, availableSeats, status, annualHostelFeeDefault, programs } = req.body;

    const campus = await Campus.findByIdAndUpdate(
      id,
      {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        city,
        state,
        tagline,
        description,
        address,
        availableSeats: Number(availableSeats),
        status,
        annualHostelFeeDefault: Number(annualHostelFeeDefault),
        programs: Array.isArray(programs) ? programs : (programs ? [programs] : []),
      },
      { new: true }
    );

    req.flash('success_msg', `Campus "${campus.name}" updated successfully.`);
    res.redirect('/admin/campuses');
  } catch (err) {
    next(err);
  }
};

exports.deleteCampus = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Campus.findByIdAndDelete(id);
    req.flash('success_msg', 'Campus deleted successfully.');
    res.redirect('/admin/campuses');
  } catch (err) {
    next(err);
  }
};

// ================= CRUD: SCHOLARSHIPS =================
exports.getScholarships = async (req, res, next) => {
  try {
    const scholarships = await Scholarship.find().sort({ percentage: -1 });
    res.render('admin/scholarships/index', {
      pageTitle: 'Manage Scholarships | Admin Portal',
      layout: 'layouts/admin',
      scholarships,
    });
  } catch (err) {
    next(err);
  }
};

exports.getScholarshipCreateForm = (req, res) => {
  res.render('admin/scholarships/form', {
    pageTitle: 'Create Scholarship | Admin Portal',
    layout: 'layouts/admin',
    scholarship: {},
    isEdit: false,
  });
};

exports.postScholarshipCreate = async (req, res, next) => {
  try {
    const { name, slug, percentage, category, description, criteria, minPcm, isWomenOnly, isNeedBased, familyIncomeCeiling, badge, isActive } = req.body;

    const scholarship = await Scholarship.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      percentage: Number(percentage) || 50,
      category: category || 'Merit',
      description,
      badge: badge || `${percentage}% Waiver`,
      criteria: criteria ? criteria.split('\n').map((c) => c.trim()).filter(Boolean) : [],
      eligibilityRules: {
        minPcm: Number(minPcm) || 0,
        isWomenOnly: isWomenOnly === 'on' || isWomenOnly === 'true' || isWomenOnly === true,
        isNeedBased: isNeedBased === 'on' || isNeedBased === 'true' || isNeedBased === true,
        familyIncomeCeiling: Number(familyIncomeCeiling) || 0,
      },
      isActive: isActive === 'on' || isActive === 'true' || isActive === true,
    });

    req.flash('success_msg', `Scholarship "${scholarship.name}" created successfully.`);
    res.redirect('/admin/scholarships');
  } catch (err) {
    next(err);
  }
};

exports.getScholarshipEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scholarship = await Scholarship.findById(id);

    if (!scholarship) {
      req.flash('error_msg', 'Scholarship not found.');
      return res.redirect('/admin/scholarships');
    }

    res.render('admin/scholarships/form', {
      pageTitle: `Edit Scholarship: ${scholarship.name} | Admin Portal`,
      layout: 'layouts/admin',
      scholarship,
      isEdit: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.postScholarshipUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, percentage, category, description, criteria, minPcm, isWomenOnly, isNeedBased, familyIncomeCeiling, badge, isActive } = req.body;

    const scholarship = await Scholarship.findByIdAndUpdate(
      id,
      {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        percentage: Number(percentage),
        category,
        description,
        badge,
        criteria: criteria ? criteria.split('\n').map((c) => c.trim()).filter(Boolean) : [],
        eligibilityRules: {
          minPcm: Number(minPcm) || 0,
          isWomenOnly: isWomenOnly === 'on' || isWomenOnly === 'true' || isWomenOnly === true,
          isNeedBased: isNeedBased === 'on' || isNeedBased === 'true' || isNeedBased === true,
          familyIncomeCeiling: Number(familyIncomeCeiling) || 0,
        },
        isActive: isActive === 'on' || isActive === 'true' || isActive === true,
      },
      { new: true }
    );

    req.flash('success_msg', `Scholarship "${scholarship.name}" updated successfully.`);
    res.redirect('/admin/scholarships');
  } catch (err) {
    next(err);
  }
};

exports.deleteScholarship = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Scholarship.findByIdAndDelete(id);
    req.flash('success_msg', 'Scholarship deleted successfully.');
    res.redirect('/admin/scholarships');
  } catch (err) {
    next(err);
  }
};

// ================= CRUD: PROJECTS =================
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().populate('program').sort({ createdAt: -1 });
    res.render('admin/projects/index', {
      pageTitle: 'Manage Student Projects | Admin Portal',
      layout: 'layouts/admin',
      projects,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjectCreateForm = async (req, res, next) => {
  try {
    const programs = await Program.find();
    res.render('admin/projects/form', {
      pageTitle: 'Add Student Project | Admin Portal',
      layout: 'layouts/admin',
      project: {},
      programs,
      isEdit: false,
    });
  } catch (err) {
    next(err);
  }
};

exports.postProjectCreate = async (req, res, next) => {
  try {
    const { title, slug, tagline, description, category, technology, year, githubUrl, liveUrl, thumbnail, program, featured } = req.body;

    const project = await Project.create({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      tagline,
      description,
      category: category || 'AI',
      technology: technology ? technology.split(',').map((t) => t.trim()).filter(Boolean) : [],
      year: Number(year) || 2,
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      program: program || null,
      featured: featured === 'on' || featured === 'true' || featured === true,
    });

    req.flash('success_msg', `Project "${project.title}" added successfully.`);
    res.redirect('/admin/projects');
  } catch (err) {
    next(err);
  }
};

exports.getProjectEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [project, programs] = await Promise.all([
      Project.findById(id),
      Program.find(),
    ]);

    if (!project) {
      req.flash('error_msg', 'Project not found.');
      return res.redirect('/admin/projects');
    }

    res.render('admin/projects/form', {
      pageTitle: `Edit Project: ${project.title} | Admin Portal`,
      layout: 'layouts/admin',
      project,
      programs,
      isEdit: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.postProjectUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, tagline, description, category, technology, year, githubUrl, liveUrl, thumbnail, program, featured } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tagline,
        description,
        category,
        technology: technology ? technology.split(',').map((t) => t.trim()).filter(Boolean) : [],
        year: Number(year),
        githubUrl,
        liveUrl,
        thumbnail,
        program: program || null,
        featured: featured === 'on' || featured === 'true' || featured === true,
      },
      { new: true }
    );

    req.flash('success_msg', `Project "${project.title}" updated successfully.`);
    res.redirect('/admin/projects');
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    req.flash('success_msg', 'Project deleted successfully.');
    res.redirect('/admin/projects');
  } catch (err) {
    next(err);
  }
};

// ================= CRUD: MENTORS =================
exports.getMentors = async (req, res, next) => {
  try {
    const mentors = await Mentor.find().sort({ order: 1 });
    res.render('admin/mentors/index', {
      pageTitle: 'Manage Mentors | Admin Portal',
      layout: 'layouts/admin',
      mentors,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMentorCreateForm = (req, res) => {
  res.render('admin/mentors/form', {
    pageTitle: 'Add Faculty / Industry Mentor | Admin Portal',
    layout: 'layouts/admin',
    mentor: {},
    isEdit: false,
  });
};

exports.postMentorCreate = async (req, res, next) => {
  try {
    const { name, role, company, expertise, bio, image, linkedin, github, featured, order } = req.body;

    const mentor = await Mentor.create({
      name,
      role,
      company,
      bio,
      image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      linkedin: linkedin || '',
      github: github || '',
      expertise: expertise ? expertise.split(',').map((e) => e.trim()).filter(Boolean) : [],
      featured: featured === 'on' || featured === 'true' || featured === true,
      order: Number(order) || 0,
    });

    req.flash('success_msg', `Mentor "${mentor.name}" added successfully.`);
    res.redirect('/admin/mentors');
  } catch (err) {
    next(err);
  }
};

exports.getMentorEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findById(id);

    if (!mentor) {
      req.flash('error_msg', 'Mentor not found.');
      return res.redirect('/admin/mentors');
    }

    res.render('admin/mentors/form', {
      pageTitle: `Edit Mentor: ${mentor.name} | Admin Portal`,
      layout: 'layouts/admin',
      mentor,
      isEdit: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.postMentorUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, company, expertise, bio, image, linkedin, github, featured, order } = req.body;

    const mentor = await Mentor.findByIdAndUpdate(
      id,
      {
        name,
        role,
        company,
        bio,
        image,
        linkedin,
        github,
        expertise: expertise ? expertise.split(',').map((e) => e.trim()).filter(Boolean) : [],
        featured: featured === 'on' || featured === 'true' || featured === true,
        order: Number(order) || 0,
      },
      { new: true }
    );

    req.flash('success_msg', `Mentor "${mentor.name}" updated successfully.`);
    res.redirect('/admin/mentors');
  } catch (err) {
    next(err);
  }
};

exports.deleteMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Mentor.findByIdAndDelete(id);
    req.flash('success_msg', 'Mentor deleted successfully.');
    res.redirect('/admin/mentors');
  } catch (err) {
    next(err);
  }
};

// ================= CRUD: EVENTS =================
exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate('campus').sort({ startDate: 1 });
    res.render('admin/events/index', {
      pageTitle: 'Manage Admission Events & Deadlines | Admin Portal',
      layout: 'layouts/admin',
      events,
    });
  } catch (err) {
    next(err);
  }
};

exports.getEventCreateForm = async (req, res, next) => {
  try {
    const campuses = await Campus.find();
    res.render('admin/events/form', {
      pageTitle: 'Create Admission Event | Admin Portal',
      layout: 'layouts/admin',
      event: {},
      campuses,
      isEdit: false,
    });
  } catch (err) {
    next(err);
  }
};

exports.postEventCreate = async (req, res, next) => {
  try {
    const { title, type, campusName, startDate, endDate, description, actionUrl, actionText, isActive } = req.body;

    const event = await Event.create({
      title,
      type: type || 'APPLICATION_DEADLINE',
      campusName: campusName || 'All Campuses (Online)',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description: description || '',
      actionUrl: actionUrl || '/admissions',
      actionText: actionText || 'View Details',
      isActive: isActive === 'on' || isActive === 'true' || isActive === true,
    });

    req.flash('success_msg', `Event "${event.title}" created successfully.`);
    res.redirect('/admin/events');
  } catch (err) {
    next(err);
  }
};

exports.getEventEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [event, campuses] = await Promise.all([
      Event.findById(id),
      Campus.find(),
    ]);

    if (!event) {
      req.flash('error_msg', 'Event not found.');
      return res.redirect('/admin/events');
    }

    res.render('admin/events/form', {
      pageTitle: `Edit Event: ${event.title} | Admin Portal`,
      layout: 'layouts/admin',
      event,
      campuses,
      isEdit: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.postEventUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, type, campusName, startDate, endDate, description, actionUrl, actionText, isActive } = req.body;

    const event = await Event.findByIdAndUpdate(
      id,
      {
        title,
        type,
        campusName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        actionUrl,
        actionText,
        isActive: isActive === 'on' || isActive === 'true' || isActive === true,
      },
      { new: true }
    );

    req.flash('success_msg', `Event "${event.title}" updated successfully.`);
    res.redirect('/admin/events');
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    req.flash('success_msg', 'Event deleted successfully.');
    res.redirect('/admin/events');
  } catch (err) {
    next(err);
  }
};

// ================= CRUD: ANNOUNCEMENTS =================
exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ priority: -1, createdAt: -1 });
    res.render('admin/announcements/index', {
      pageTitle: 'Manage Announcements | Admin Portal',
      layout: 'layouts/admin',
      announcements,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAnnouncementCreateForm = (req, res) => {
  res.render('admin/announcements/form', {
    pageTitle: 'Create Announcement | Admin Portal',
    layout: 'layouts/admin',
    announcement: {},
    isEdit: false,
  });
};

exports.postAnnouncementCreate = async (req, res, next) => {
  try {
    const { title, message, badge, link, linkText, priority, startDate, endDate, isActive } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      badge: badge || 'ANNOUNCEMENT',
      link: link || '/admissions',
      linkText: linkText || 'Learn More',
      priority: Number(priority) || 1,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      isActive: isActive === 'on' || isActive === 'true' || isActive === true,
    });

    req.flash('success_msg', `Announcement "${announcement.title}" created successfully.`);
    res.redirect('/admin/announcements');
  } catch (err) {
    next(err);
  }
};

exports.getAnnouncementEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      req.flash('error_msg', 'Announcement not found.');
      return res.redirect('/admin/announcements');
    }

    res.render('admin/announcements/form', {
      pageTitle: `Edit Announcement: ${announcement.title} | Admin Portal`,
      layout: 'layouts/admin',
      announcement,
      isEdit: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.postAnnouncementUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, message, badge, link, linkText, priority, startDate, endDate, isActive } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        message,
        badge,
        link,
        linkText,
        priority: Number(priority) || 1,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: isActive === 'on' || isActive === 'true' || isActive === true,
      },
      { new: true }
    );

    req.flash('success_msg', `Announcement "${announcement.title}" updated successfully.`);
    res.redirect('/admin/announcements');
  } catch (err) {
    next(err);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    req.flash('success_msg', 'Announcement deleted successfully.');
    res.redirect('/admin/announcements');
  } catch (err) {
    next(err);
  }
};

// ================= CRUD: ENQUIRIES =================
exports.getEnquiries = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const enquiries = await Enquiry.find(query)
      .populate('programInterest campusInterest')
      .sort({ createdAt: -1 });

    res.render('admin/enquiries/index', {
      pageTitle: 'Manage Inquiries | Admin Portal',
      layout: 'layouts/admin',
      enquiries,
      currentStatus: status || 'ALL',
    });
  } catch (err) {
    next(err);
  }
};

exports.getEnquiryDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id).populate('programInterest campusInterest');

    if (!enquiry) {
      req.flash('error_msg', 'Inquiry not found.');
      return res.redirect('/admin/enquiries');
    }

    res.render('admin/enquiries/show', {
      pageTitle: `Inquiry: ${enquiry.subject} | Admin Portal`,
      layout: 'layouts/admin',
      enquiry,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      {
        status,
        ...(adminNotes && { adminNotes }),
      },
      { new: true }
    );

    req.flash('success_msg', `Inquiry status updated to ${enquiry.status}.`);
    res.redirect('/admin/enquiries');
  } catch (err) {
    next(err);
  }
};
