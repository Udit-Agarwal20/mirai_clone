const mongoose = require('mongoose');

const savedCalculationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      required: true,
    },
    hostelOptionName: {
      type: String,
      default: 'Twin Sharing AC',
    },
    includeHostel: {
      type: Boolean,
      default: true,
    },
    scholarship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship',
    },
    financingTenureMonths: {
      type: Number,
      default: 48,
    },
    breakdown: {
      registrationFee: { type: Number, default: 0 },
      tuitionFourYears: { type: Number, default: 0 },
      labFeesFourYears: { type: Number, default: 0 },
      hostelFourYears: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      scholarshipPercentage: { type: Number, default: 0 },
      scholarshipWaiver: { type: Number, default: 0 },
      netTotalEstimated: { type: Number, default: 0 },
      monthlyFinancingEstimate: { type: Number, default: 0 },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SavedCalculation', savedCalculationSchema);
