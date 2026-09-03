const Program = require('../models/Program');
const Campus = require('../models/Campus');
const Scholarship = require('../models/Scholarship');
const SavedCalculation = require('../models/SavedCalculation');
const FeeCalculatorService = require('../services/feeCalculatorService');

exports.getFeePlanner = async (req, res, next) => {
  try {
    const { programId, campusId, hostel, scholarshipId, tenure } = req.query;

    const [programs, campuses, scholarships] = await Promise.all([
      Program.find({ isActive: true }).sort({ createdAt: 1 }),
      Campus.find().sort({ createdAt: 1 }),
      Scholarship.find({ isActive: true }).sort({ percentage: -1 }),
    ]);

    // Defaults
    const selectedProgram = programId
      ? programs.find((p) => p._id.toString() === programId || p.slug === programId) || programs[0]
      : programs[0];

    const selectedCampus = campusId
      ? campuses.find((c) => c._id.toString() === campusId || c.slug === campusId) || campuses[0]
      : campuses[0];

    const selectedScholarship = scholarshipId && scholarshipId !== 'none'
      ? scholarships.find((s) => s._id.toString() === scholarshipId || s.slug === scholarshipId) || null
      : null;

    const includeHostel = hostel !== 'false' && hostel !== 'none' && hostel !== 'off';
    const financingTenure = Number(tenure) || 48;

    let calculation = null;
    if (selectedProgram && selectedCampus) {
      calculation = FeeCalculatorService.calculate({
        program: selectedProgram,
        campus: selectedCampus,
        hostelOptionName: hostel && hostel !== 'true' && hostel !== 'false' ? hostel : undefined,
        includeHostel,
        scholarship: selectedScholarship,
        financingTenureMonths: financingTenure,
      });
    }

    res.render('fees/index', {
      pageTitle: 'Cost & Scholarship Planner | NOVA Institute of Technology',
      pageDescription:
        'Transparent multi-year tuition, campus residency, scholarship discount, and low-cost financing planner.',
      programs,
      campuses,
      scholarships,
      selectedProgram,
      selectedCampus,
      selectedScholarship,
      includeHostel,
      financingTenure,
      calculation,
    });
  } catch (err) {
    next(err);
  }
};

exports.calculateFeesSSR = async (req, res, next) => {
  try {
    const { programId, campusId, hostel, hostelOptionName, scholarshipId, tenure } = req.body;

    const queryParams = new URLSearchParams({
      programId: programId || '',
      campusId: campusId || '',
      hostel: hostel ? (hostelOptionName || 'true') : 'false',
      scholarshipId: scholarshipId || 'none',
      tenure: tenure || '48',
    });

    res.redirect(`/fees?${queryParams.toString()}`);
  } catch (err) {
    next(err);
  }
};

exports.saveCalculation = async (req, res, next) => {
  try {
    if (!req.user) {
      req.flash('error_msg', 'Please log in to save fee calculations to your dashboard.');
      return res.redirect('/auth/login');
    }

    const { programId, campusId, includeHostel, hostelOptionName, scholarshipId, tenure, notes } = req.body;

    const [program, campus, scholarship] = await Promise.all([
      Program.findById(programId),
      Campus.findById(campusId),
      scholarshipId && scholarshipId !== 'none' ? Scholarship.findById(scholarshipId) : null,
    ]);

    if (!program || !campus) {
      req.flash('error_msg', 'Invalid program or campus selected.');
      return res.redirect('/fees');
    }

    const calcResult = FeeCalculatorService.calculate({
      program,
      campus,
      hostelOptionName,
      includeHostel: includeHostel === 'true' || includeHostel === true || includeHostel === 'on',
      scholarship,
      financingTenureMonths: Number(tenure) || 48,
    });

    await SavedCalculation.create({
      user: req.user._id,
      program: program._id,
      campus: campus._id,
      hostelOptionName: calcResult.campus?.roomType || 'Day Scholar',
      includeHostel: calcResult.hostelIncluded,
      scholarship: scholarship ? scholarship._id : null,
      financingTenureMonths: Number(tenure) || 48,
      breakdown: {
        registrationFee: calcResult.breakdown.registrationFee,
        tuitionFourYears: calcResult.breakdown.tuitionFourYears,
        labFeesFourYears: calcResult.breakdown.labFeesFourYears,
        hostelFourYears: calcResult.breakdown.hostelFourYears,
        subtotal: calcResult.breakdown.grossSubtotal,
        scholarshipPercentage: calcResult.scholarship.percentage,
        scholarshipWaiver: calcResult.breakdown.scholarshipWaiver,
        netTotalEstimated: calcResult.breakdown.netTotalEstimated,
        monthlyFinancingEstimate: calcResult.financing.monthlyEstimate,
      },
      notes: notes || `Custom estimate for ${program.name} at ${campus.city}`,
    });

    req.flash('success_msg', 'Fee calculation successfully saved to your Student Dashboard!');
    res.redirect('/student/dashboard');
  } catch (err) {
    next(err);
  }
};
