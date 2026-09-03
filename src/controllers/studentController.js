const mongoose = require('mongoose');
const Application = require('../models/Application');
const Program = require('../models/Program');
const Campus = require('../models/Campus');
const Scholarship = require('../models/Scholarship');
const Project = require('../models/Project');
const User = require('../models/User');
const SavedCalculation = require('../models/SavedCalculation');

exports.getDashboard = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id).populate('savedPrograms savedCampuses savedProjects');

    // Fetch user application
    const application = await Application.findOne({ student: student._id })
      .populate('preferences.program preferences.campus preferences.claimedScholarship')
      .sort({ createdAt: -1 });

    // Fetch saved fee calculations
    const savedCalculations = await SavedCalculation.find({ user: student._id })
      .populate('program campus scholarship')
      .sort({ createdAt: -1 })
      .limit(3);

    // Compute progress stage and next action
    let progressStep = 0;
    let nextAction = {
      title: 'Complete Admission Application',
      description: 'Submit your personal details, academic scores, and project portfolio to reserve your seat.',
      buttonText: 'Start Application',
      buttonUrl: '/student/application',
      statusType: 'info',
    };

    if (application) {
      switch (application.status) {
        case 'DRAFT':
          progressStep = 1;
          nextAction = {
            title: 'Submit Application Draft',
            description: 'Your application is currently in draft. Complete and submit for evaluation.',
            buttonText: 'Resume Application',
            buttonUrl: '/student/application',
            statusType: 'warning',
          };
          break;
        case 'SUBMITTED':
          progressStep = 2;
          nextAction = {
            title: 'Application Under Initial Review',
            description: 'Our admissions committee is verifying your academic transcripts and GitHub portfolio.',
            buttonText: 'View Status Timeline',
            buttonUrl: '/student/application/status',
            statusType: 'info',
          };
          break;
        case 'UNDER_REVIEW':
          progressStep = 3;
          nextAction = {
            title: 'Faculty Portfolio Assessment',
            description: 'Your technical projects and scores are being evaluated by our engineering mentors.',
            buttonText: 'View Status Timeline',
            buttonUrl: '/student/application/status',
            statusType: 'info',
          };
          break;
        case 'ASSESSMENT':
          progressStep = 4;
          nextAction = {
            title: 'Complete NOVA Logic Assessment',
            description: 'Your 60-minute technical problem-solving assessment is scheduled. Check your inbox for link.',
            buttonText: 'Assessment Details',
            buttonUrl: '/student/application/status',
            statusType: 'action',
          };
          break;
        case 'INTERVIEW':
          progressStep = 5;
          nextAction = {
            title: 'Attend Faculty 1-on-1 Interview',
            description: 'Discuss your engineering ambitions with a senior researcher or tech founder.',
            buttonText: 'View Meeting Details',
            buttonUrl: '/student/application/status',
            statusType: 'action',
          };
          break;
        case 'OFFERED':
          progressStep = 6;
          nextAction = {
            title: 'Congratulations! Admission Offer Issued',
            description: 'You have been awarded a provisional seat. Review your offer letter and scholarship grant.',
            buttonText: 'View Offer & Accept',
            buttonUrl: '/student/application/status',
            statusType: 'success',
          };
          break;
        case 'ENROLLED':
          progressStep = 7;
          nextAction = {
            title: 'Formally Enrolled for Fall 2026',
            description: 'Welcome to NOVA! Orientation details and pre-matriculation Git repository links will be sent soon.',
            buttonText: 'View Student Hub',
            buttonUrl: '/student/application/status',
            statusType: 'success',
          };
          break;
        case 'REJECTED':
          progressStep = 2;
          nextAction = {
            title: 'Application Status Updated',
            description: 'Thank you for your interest. You may request feedback or re-apply for next term.',
            buttonText: 'View Feedback',
            buttonUrl: '/student/application/status',
            statusType: 'danger',
          };
          break;
        default:
          progressStep = 1;
      }
    }

    res.render('student/dashboard', {
      pageTitle: 'Student Dashboard | NOVA Institute of Technology',
      student,
      application,
      savedCalculations,
      progressStep,
      nextAction,
    });
  } catch (err) {
    next(err);
  }
};

exports.getApplicationForm = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    let application = await Application.findOne({ student: student._id }).populate('preferences.program preferences.campus preferences.claimedScholarship');

    let [programs, campuses, scholarships] = await Promise.all([
      Program.find({ isActive: true }),
      Campus.find(),
      Scholarship.find({ isActive: true }).sort({ percentage: -1 }),
    ]);

    // If database is completely fresh, automatically populate options on the fly
    if (!programs || programs.length === 0 || !campuses || campuses.length === 0) {
      try {
        const { seedDatabase } = require('../../scripts/seed');
        await seedDatabase(false);
        [programs, campuses, scholarships] = await Promise.all([
          Program.find({ isActive: true }),
          Campus.find(),
          Scholarship.find({ isActive: true }).sort({ percentage: -1 }),
        ]);
      } catch (e) {
        console.warn('[StudentController] Auto-seed fallback warning:', e.message);
      }
    }

    res.render('student/application', {
      pageTitle: 'Admission Application | NOVA Institute of Technology',
      pageDescription: 'Complete your official B.Tech undergraduate application for NOVA.',
      student,
      application: application || {},
      programs: programs || [],
      campuses: campuses || [],
      scholarships: scholarships || [],
    });
  } catch (err) {
    next(err);
  }
};

exports.submitApplication = async (req, res, next) => {
  try {
    const {
      isDraft,
      fullName,
      email,
      phone,
      dob,
      gender,
      guardianName,
      guardianPhone,
      address,
      city,
      state,
      pincode,
      highSchool,
      board,
      yearOfPassing,
      pcmPercentage,
      mathMarks,
      physicsMarks,
      csMarks,
      entranceExam,
      entranceScore,
      githubUrl,
      portfolioUrl,
      codingExperience,
      programId,
      alternateProgramId,
      campusId,
      alternateCampusId,
      hostelRequired,
      scholarshipOptIn,
      scholarshipId,
      statementOfPurpose,
      careerGoal,
    } = req.body;

    const student = await User.findById(req.user._id);

    // Check if application already exists
    let application = await Application.findOne({ student: student._id });

    // Generate unique Application ID if new
    let appId = application ? application.applicationId : null;
    if (!appId) {
      const year = new Date().getFullYear();
      const randomSixDigit = Math.floor(100000 + Math.random() * 900000);
      appId = `NOVA-${year}-${randomSixDigit}`;
    }

    const applicationStatus = isDraft === 'true' || isDraft === true ? 'DRAFT' : 'SUBMITTED';

    const timelineEntry = {
      stage: applicationStatus,
      timestamp: new Date(),
      note: applicationStatus === 'DRAFT' ? 'Application draft saved by student.' : 'Application officially submitted for review.',
      updatedBy: 'Student',
    };

    const payload = {
      applicationId: appId,
      student: student._id,
      personalInfo: {
        fullName: fullName || student.name,
        email: email || student.email,
        phone: phone || student.phone,
        dob: dob ? new Date(dob) : undefined,
        gender: gender || '',
        guardianName: guardianName || '',
        guardianPhone: guardianPhone || '',
        address: address || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
      },
      academicInfo: {
        highSchool: highSchool || '',
        board: board || '',
        yearOfPassing: Number(yearOfPassing) || 2026,
        pcmPercentage: Number(pcmPercentage) || 0,
        mathMarks: Number(mathMarks) || 0,
        physicsMarks: Number(physicsMarks) || 0,
        csMarks: Number(csMarks) || 0,
        entranceExam: entranceExam || '',
        entranceScore: entranceScore || '',
        githubUrl: githubUrl || '',
        portfolioUrl: portfolioUrl || '',
        codingExperience: codingExperience || 'Beginner (Basic Python/JS)',
      },
      preferences: {
        program: mongoose.isValidObjectId(programId) ? programId : (await Program.findOne({ slug: programId }))?._id || (await Program.findOne())?._id,
        alternateProgram: alternateProgramId && mongoose.isValidObjectId(alternateProgramId) ? alternateProgramId : null,
        campus: mongoose.isValidObjectId(campusId) ? campusId : (await Campus.findOne({ slug: campusId }))?._id || (await Campus.findOne())?._id,
        alternateCampus: alternateCampusId && mongoose.isValidObjectId(alternateCampusId) ? alternateCampusId : null,
        hostelRequired: hostelRequired === 'true' || hostelRequired === true || hostelRequired === 'on',
        scholarshipOptIn: scholarshipOptIn === 'true' || scholarshipOptIn === true || scholarshipOptIn === 'on',
        claimedScholarship: scholarshipId && mongoose.isValidObjectId(scholarshipId) ? scholarshipId : null,
      },
      statementOfPurpose: statementOfPurpose || '',
      careerGoal: careerGoal || '',
      status: applicationStatus,
      ...(applicationStatus === 'SUBMITTED' && { submittedAt: new Date() }),
    };

    if (application) {
      application.set(payload);
      application.timeline.push(timelineEntry);
      await application.save();
    } else {
      payload.timeline = [timelineEntry];
      application = await Application.create(payload);
    }

    // Sync student profile
    await User.findByIdAndUpdate(student._id, {
      phone: payload.personalInfo.phone,
      'profile.dob': payload.personalInfo.dob,
      'profile.gender': payload.personalInfo.gender,
      'profile.address': payload.personalInfo.address,
      'profile.city': payload.personalInfo.city,
      'profile.state': payload.personalInfo.state,
      'profile.pincode': payload.personalInfo.pincode,
      'profile.highSchool': payload.academicInfo.highSchool,
      'profile.board': payload.academicInfo.board,
      'profile.pcmPercentage': payload.academicInfo.pcmPercentage,
      'profile.entranceExam': payload.academicInfo.entranceExam,
      'profile.entranceScore': payload.academicInfo.entranceScore,
      'profile.githubUsername': payload.academicInfo.githubUrl,
    });

    if (applicationStatus === 'DRAFT') {
      req.flash('info_msg', 'Application draft saved successfully. You can return anytime to submit.');
      return res.redirect('/student/dashboard');
    }

    req.flash('success_msg', `Application ${appId} submitted successfully! You can track your progress here.`);
    res.redirect('/student/application/status');
  } catch (err) {
    next(err);
  }
};

exports.getApplicationStatus = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    const application = await Application.findOne({ student: student._id })
      .populate('preferences.program preferences.alternateProgram preferences.campus preferences.alternateCampus preferences.claimedScholarship');

    if (!application) {
      req.flash('info_msg', 'You have not started an application yet.');
      return res.redirect('/student/application');
    }

    // Pipeline stages for visual tracker
    const stages = [
      { key: 'SUBMITTED', label: 'Application Submitted', desc: 'Application received and logged' },
      { key: 'UNDER_REVIEW', label: 'Under Review', desc: 'Academic and portfolio verification' },
      { key: 'ASSESSMENT', label: 'Aptitude Assessment', desc: 'Logic and problem-solving evaluation' },
      { key: 'INTERVIEW', label: 'Faculty Interview', desc: '1-on-1 portfolio review' },
      { key: 'OFFERED', label: 'Admission Offer', desc: 'Provisional seat and scholarship grant' },
      { key: 'ENROLLED', label: 'Formally Enrolled', desc: 'Seat confirmed for Fall 2026' },
    ];

    const stageOrder = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ASSESSMENT', 'INTERVIEW', 'OFFERED', 'ENROLLED'];
    const currentStageIndex = stageOrder.indexOf(application.status);

    res.render('student/status', {
      pageTitle: `Application Status: ${application.applicationId} | NOVA`,
      student,
      application,
      stages,
      currentStageIndex,
      isRejected: application.status === 'REJECTED',
    });
  } catch (err) {
    next(err);
  }
};

exports.getSavedItems = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id)
      .populate('savedPrograms')
      .populate('savedCampuses')
      .populate('savedProjects');

    const savedCalculations = await SavedCalculation.find({ user: student._id })
      .populate('program campus scholarship')
      .sort({ createdAt: -1 });

    res.render('student/saved', {
      pageTitle: 'Saved Programs & Projects | NOVA Institute of Technology',
      student,
      savedPrograms: student.savedPrograms || [],
      savedCampuses: student.savedCampuses || [],
      savedProjects: student.savedProjects || [],
      savedCalculations: savedCalculations || [],
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleBookmark = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.body; // itemType: 'program', 'campus', 'project'
    const user = await User.findById(req.user._id);

    let listField = '';
    if (itemType === 'program') listField = 'savedPrograms';
    else if (itemType === 'campus') listField = 'savedCampuses';
    else if (itemType === 'project') listField = 'savedProjects';
    else {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    const currentList = user[listField] || [];
    const index = currentList.findIndex((id) => id.toString() === itemId);

    let isSaved = false;
    if (index > -1) {
      currentList.splice(index, 1);
      isSaved = false;
    } else {
      currentList.push(itemId);
      isSaved = true;
    }

    user[listField] = currentList;
    await user.save();

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, isSaved, count: currentList.length });
    }

    req.flash('success_msg', isSaved ? 'Item saved to your bookmarks.' : 'Item removed from bookmarks.');
    res.redirect(req.header('Referer') || '/student/saved');
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    res.render('student/profile', {
      pageTitle: 'Student Profile | NOVA Institute of Technology',
      student,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, dob, gender, address, city, state, pincode, highSchool, board, pcmPercentage, githubUsername } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      'profile.dob': dob ? new Date(dob) : undefined,
      'profile.gender': gender || '',
      'profile.address': address || '',
      'profile.city': city || '',
      'profile.state': state || '',
      'profile.pincode': pincode || '',
      'profile.highSchool': highSchool || '',
      'profile.board': board || '',
      'profile.pcmPercentage': Number(pcmPercentage) || 0,
      'profile.githubUsername': githubUsername || '',
    });

    req.flash('success_msg', 'Your profile details have been successfully updated.');
    res.redirect('/student/profile');
  } catch (err) {
    next(err);
  }
};
