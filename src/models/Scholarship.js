const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Scholarship name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    percentage: {
      type: Number,
      required: [true, 'Tuition percentage waiver is required'],
      min: 0,
      max: 100,
    },
    maxAmountPerYear: {
      type: Number,
      default: 0, // 0 = calculated from tuition percentage
    },
    criteria: [{ type: String }],
    category: {
      type: String,
      required: true,
      enum: ['Merit', 'Women in Tech', 'Need-Based', 'AI Fellowship', 'Armed Forces', 'Special Talent', 'Other'],
      default: 'Merit',
    },
    eligibilityRules: {
      minPcm: { type: Number, default: 0 },
      isWomenOnly: { type: Boolean, default: false },
      isNeedBased: { type: Boolean, default: false },
      familyIncomeCeiling: { type: Number, default: 0 }, // in INR
      isDefenseWard: { type: Boolean, default: false },
      hasCodingPortfolio: { type: Boolean, default: false },
    },
    applicableDegrees: [{ type: String, default: 'B.Tech' }],
    badge: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Scholarship', scholarshipSchema);
