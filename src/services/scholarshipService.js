const Scholarship = require('../models/Scholarship');

class ScholarshipService {
  /**
   * Evaluate eligibility for scholarships based on input parameters
   * @param {Object} criteria
   * @param {Number} criteria.pcmPercentage - 12th PCM / Science score (0-100)
   * @param {String} criteria.gender - Male, Female, Non-Binary, etc.
   * @param {Number} criteria.familyAnnualIncome - in INR
   * @param {Boolean} criteria.isDefenseWard - True if child of armed forces personnel
   * @param {Boolean} criteria.hasCodingPortfolio - Has GitHub or verified projects
   * @param {String} criteria.entranceScore - JEE Main percentile or state CET score
   */
  static async evaluateEligibility({
    pcmPercentage = 0,
    gender = '',
    familyAnnualIncome = 1200000,
    isDefenseWard = false,
    hasCodingPortfolio = false,
    entranceScore = 0,
  }) {
    const allScholarships = await Scholarship.find({ isActive: true }).sort({ percentage: -1 });

    const pcm = Number(pcmPercentage) || 0;
    const income = Number(familyAnnualIncome) || 1200000;
    const isFemale = gender.toLowerCase() === 'female';
    const hasDefense = Boolean(isDefenseWard);
    const hasProjects = Boolean(hasCodingPortfolio);

    const evaluated = allScholarships.map((sch) => {
      let isEligible = true;
      const reasons = [];
      const disqualifications = [];

      // PCM check
      if (sch.eligibilityRules.minPcm > 0) {
        if (pcm >= sch.eligibilityRules.minPcm) {
          reasons.push(`Score of ${pcm}% exceeds minimum requirement of ${sch.eligibilityRules.minPcm}% PCM`);
        } else {
          isEligible = false;
          disqualifications.push(`Requires minimum ${sch.eligibilityRules.minPcm}% in PCM (current: ${pcm}%)`);
        }
      }

      // Gender check (Women in Tech)
      if (sch.eligibilityRules.isWomenOnly) {
        if (isFemale) {
          reasons.push('Meets Women in Tech initiative eligibility');
        } else {
          isEligible = false;
          disqualifications.push('Reserved for female applicants to bridge the tech gender gap');
        }
      }

      // Need-based / Income ceiling
      if (sch.eligibilityRules.isNeedBased || (sch.eligibilityRules.familyIncomeCeiling && sch.eligibilityRules.familyIncomeCeiling > 0)) {
        const ceiling = sch.eligibilityRules.familyIncomeCeiling || 800000;
        if (income <= ceiling) {
          reasons.push(`Annual family income is within the ₹${(ceiling / 100000).toFixed(1)} Lakhs threshold`);
        } else {
          isEligible = false;
          disqualifications.push(`Annual family income exceeds ₹${(ceiling / 100000).toFixed(1)} Lakhs threshold`);
        }
      }

      // Defense Ward
      if (sch.eligibilityRules.isDefenseWard) {
        if (hasDefense) {
          reasons.push('Eligible under Armed Forces & Paramilitary quota');
        } else {
          isEligible = false;
          disqualifications.push('Reserved for wards of Armed Forces and Paramilitary veterans/serving personnel');
        }
      }

      // Coding portfolio requirement
      if (sch.eligibilityRules.hasCodingPortfolio) {
        if (hasProjects) {
          reasons.push('Verified technical project portfolio / GitHub profile');
        } else {
          // If high PCM, can still qualify provisionally
          if (pcm >= 90) {
            reasons.push('High academic performance qualifies for provisional fellowship review');
          } else {
            isEligible = false;
            disqualifications.push('Requires demonstrable code portfolio, GitHub repositories, or robotics build');
          }
        }
      }

      return {
        scholarship: sch,
        isEligible,
        percentage: sch.percentage,
        reasons,
        disqualifications,
      };
    });

    const eligibleList = evaluated.filter((item) => item.isEligible);
    const inEligibleList = evaluated.filter((item) => !item.isEligible);

    // Calculate maximum scholarship achievable (non-stackable by default; best single applies)
    const maxScholarship = eligibleList.length > 0 ? eligibleList[0] : null;
    const maxDiscountPercentage = maxScholarship ? maxScholarship.percentage : 0;

    return {
      inputs: {
        pcmPercentage: pcm,
        gender,
        familyAnnualIncome: income,
        isDefenseWard: hasDefense,
        hasCodingPortfolio: hasProjects,
      },
      eligibleCount: eligibleList.length,
      maxDiscountPercentage,
      bestMatch: maxScholarship ? maxScholarship.scholarship : null,
      eligibleScholarships: eligibleList,
      otherScholarships: inEligibleList,
      disclaimer:
        'This calculation is an automated estimate for planning purposes. Final scholarship awards are granted following academic document verification and the NOVA Technical Admissions Review.',
    };
  }
}

module.exports = ScholarshipService;
