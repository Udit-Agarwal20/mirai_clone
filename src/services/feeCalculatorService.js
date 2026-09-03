/**
 * Service to calculate complete 4-year educational investment and financing options.
 */

class FeeCalculatorService {
  /**
   * Calculate 4-year fee breakdown
   * @param {Object} params
   * @param {Object} params.program - Program Mongoose document or object
   * @param {Object} params.campus - Campus Mongoose document or object
   * @param {String} [params.hostelOptionName] - Name of chosen hostel room type
   * @param {Boolean} [params.includeHostel=true] - Whether hostel is included
   * @param {Object} [params.scholarship] - Scholarship document or object
   * @param {Number} [params.financingTenureMonths=48] - Tenure in months (36, 48, 60)
   * @param {Number} [params.annualInterestRate=8.5] - Annual financing interest rate %
   */
  static calculate({
    program,
    campus,
    hostelOptionName,
    includeHostel = true,
    scholarship = null,
    financingTenureMonths = 48,
    annualInterestRate = 8.5,
  }) {
    if (!program) {
      throw new Error('Program is required for fee calculation');
    }

    const tuitionPerYear = Number(program.fees?.tuitionPerYear) || 275000;
    const labFeePerYear = Number(program.fees?.labFeePerYear) || 40000;
    const registrationFee = Number(program.fees?.oneTimeAdmissionFee) || 50000;

    const fourYearTuition = tuitionPerYear * 4;
    const fourYearLabFees = labFeePerYear * 4;

    // Determine annual hostel fee
    let annualHostelFee = 0;
    let selectedHostelName = 'None';
    let selectedRoomType = 'Day Scholar';

    if (includeHostel && campus) {
      if (campus.hostelOptions && campus.hostelOptions.length > 0) {
        const found = campus.hostelOptions.find(
          (h) => h.name === hostelOptionName || h.roomType === hostelOptionName
        );
        if (found) {
          annualHostelFee = Number(found.annualFee);
          selectedHostelName = found.name;
          selectedRoomType = found.roomType;
        } else {
          annualHostelFee = Number(campus.hostelOptions[0].annualFee);
          selectedHostelName = campus.hostelOptions[0].name;
          selectedRoomType = campus.hostelOptions[0].roomType;
        }
      } else {
        annualHostelFee = Number(campus.annualHostelFeeDefault) || 180000;
        selectedHostelName = 'Standard Campus Residence';
        selectedRoomType = 'Twin Sharing AC';
      }
    }

    const fourYearHostel = includeHostel ? annualHostelFee * 4 : 0;
    const grossSubtotal = registrationFee + fourYearTuition + fourYearLabFees + fourYearHostel;

    // Scholarship calculation
    let scholarshipPercentage = 0;
    let scholarshipWaiver = 0;
    let scholarshipName = 'None Applied';

    if (scholarship) {
      scholarshipPercentage = Number(scholarship.percentage) || 0;
      scholarshipName = scholarship.name;

      // Scholarship applies to Tuition portion across 4 years
      const rawWaiver = (fourYearTuition * scholarshipPercentage) / 100;
      
      // If scholarship has a max annual amount cap
      if (scholarship.maxAmountPerYear && scholarship.maxAmountPerYear > 0) {
        const cappedWaiver = scholarship.maxAmountPerYear * 4;
        scholarshipWaiver = Math.min(rawWaiver, cappedWaiver);
      } else {
        scholarshipWaiver = rawWaiver;
      }
    }

    const netTotalEstimated = Math.max(0, grossSubtotal - scholarshipWaiver);

    // Yearly Breakdown
    const yearlyBreakdown = [1, 2, 3, 4].map((year) => {
      const yearTuition = tuitionPerYear;
      const yearLab = labFeePerYear;
      const yearHostel = includeHostel ? annualHostelFee : 0;
      const yearReg = year === 1 ? registrationFee : 0;
      const yearScholarship = (scholarshipWaiver / 4);
      const yearTotal = Math.max(0, yearReg + yearTuition + yearLab + yearHostel - yearScholarship);

      return {
        year,
        registrationFee: yearReg,
        tuitionFee: yearTuition,
        labFee: yearLab,
        hostelFee: yearHostel,
        scholarshipDiscount: yearScholarship,
        netPayable: yearTotal,
        semesterPayable: Math.round(yearTotal / 2),
      };
    });

    // Monthly financing / EMI calculation (Principal = Net Total, monthly rate = r / 12)
    const validTenure = [36, 48, 60].includes(Number(financingTenureMonths))
      ? Number(financingTenureMonths)
      : 48;
    const monthlyRate = annualInterestRate / 100 / 12;
    const numerator = netTotalEstimated * monthlyRate * Math.pow(1 + monthlyRate, validTenure);
    const denominator = Math.pow(1 + monthlyRate, validTenure) - 1;
    const monthlyFinancingEstimate =
      denominator > 0 ? Math.round(numerator / denominator) : Math.round(netTotalEstimated / validTenure);

    return {
      program: {
        id: program._id,
        name: program.name,
        slug: program.slug,
        degree: program.degree,
        tuitionPerYear,
        labFeePerYear,
        registrationFee,
      },
      campus: campus
        ? {
            id: campus._id,
            name: campus.name,
            slug: campus.slug,
            city: campus.city,
            hostelOptionName: selectedHostelName,
            roomType: selectedRoomType,
            annualHostelFee,
          }
        : null,
      hostelIncluded: includeHostel,
      scholarship: {
        name: scholarshipName,
        percentage: scholarshipPercentage,
        waiverAmount: Math.round(scholarshipWaiver),
      },
      breakdown: {
        registrationFee,
        tuitionFourYears: fourYearTuition,
        labFeesFourYears: fourYearLabFees,
        hostelFourYears: fourYearHostel,
        grossSubtotal,
        scholarshipWaiver: Math.round(scholarshipWaiver),
        netTotalEstimated: Math.round(netTotalEstimated),
        yearlyBreakdown,
      },
      financing: {
        tenureMonths: validTenure,
        annualInterestRate,
        monthlyEstimate: monthlyFinancingEstimate,
        totalWithFinancing: Math.round(monthlyFinancingEstimate * validTenure),
      },
    };
  }

  /**
   * Helper to format numbers in Indian Rupee representation (e.g. ₹12,50,000)
   */
  static formatCurrency(amount) {
    if (typeof amount !== 'number') return '₹0';
    return '₹' + amount.toLocaleString('en-IN');
  }
}

module.exports = FeeCalculatorService;
