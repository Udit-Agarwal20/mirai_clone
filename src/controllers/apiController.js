const Program = require('../models/Program');
const Campus = require('../models/Campus');
const Scholarship = require('../models/Scholarship');
const FeeCalculatorService = require('../services/feeCalculatorService');
const ScholarshipService = require('../services/scholarshipService');

exports.calculateFeeLive = async (req, res) => {
  try {
    const { programId, campusId, hostelOptionName, includeHostel, scholarshipId, tenure } = req.body;

    const [program, campus, scholarship] = await Promise.all([
      Program.findById(programId),
      Campus.findById(campusId),
      scholarshipId && scholarshipId !== 'none' ? Scholarship.findById(scholarshipId) : null,
    ]);

    if (!program || !campus) {
      return res.status(400).json({ success: false, message: 'Invalid program or campus selection' });
    }

    const calculation = FeeCalculatorService.calculate({
      program,
      campus,
      hostelOptionName,
      includeHostel: includeHostel === true || includeHostel === 'true' || includeHostel === 'on',
      scholarship,
      financingTenureMonths: Number(tenure) || 48,
    });

    res.json({
      success: true,
      calculation,
      formatted: {
        registrationFee: FeeCalculatorService.formatCurrency(calculation.breakdown.registrationFee),
        tuitionFourYears: FeeCalculatorService.formatCurrency(calculation.breakdown.tuitionFourYears),
        labFeesFourYears: FeeCalculatorService.formatCurrency(calculation.breakdown.labFeesFourYears),
        hostelFourYears: FeeCalculatorService.formatCurrency(calculation.breakdown.hostelFourYears),
        grossSubtotal: FeeCalculatorService.formatCurrency(calculation.breakdown.grossSubtotal),
        scholarshipWaiver: FeeCalculatorService.formatCurrency(calculation.breakdown.scholarshipWaiver),
        netTotalEstimated: FeeCalculatorService.formatCurrency(calculation.breakdown.netTotalEstimated),
        monthlyEstimate: FeeCalculatorService.formatCurrency(calculation.financing.monthlyEstimate),
      },
    });
  } catch (err) {
    console.error('[API] Live fee calculation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.evaluateScholarshipLive = async (req, res) => {
  try {
    const { pcmPercentage, gender, familyAnnualIncome, isDefenseWard, hasCodingPortfolio } = req.body;

    const result = await ScholarshipService.evaluateEligibility({
      pcmPercentage: Number(pcmPercentage) || 0,
      gender: gender || '',
      familyAnnualIncome: Number(familyAnnualIncome) || 1200000,
      isDefenseWard: isDefenseWard === true || isDefenseWard === 'true',
      hasCodingPortfolio: hasCodingPortfolio === true || hasCodingPortfolio === 'true',
    });

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    console.error('[API] Live scholarship evaluation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
