const mongoose = require('mongoose');

const yearCurriculumSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  title: { type: String, required: true },
  theme: { type: String, required: true },
  focus: { type: String, required: true },
  courses: [{ type: String }],
  projects: [{ type: String }],
  outcomes: { type: String },
});

const careerPathSchema = new mongoose.Schema({
  role: { type: String, required: true },
  avgSalary: { type: String, required: true },
  topHiringCompanies: [{ type: String }],
  description: { type: String },
});

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Program name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    degree: {
      type: String,
      default: 'B.Tech',
      trim: true,
    },
    duration: {
      type: String,
      default: '4 Years (8 Semesters)',
    },
    tagline: {
      type: String,
      default: '',
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
    },
    description: {
      type: String,
      required: [true, 'Full description is required'],
    },
    whoShouldChoose: [{ type: String }],
    skills: [{ type: String }],
    curriculumHighlights: [{ type: String }],
    yearWiseCurriculum: [yearCurriculumSchema],
    careerPaths: [careerPathSchema],
    fees: {
      tuitionPerYear: { type: Number, required: true },
      labFeePerYear: { type: Number, default: 40000 },
      oneTimeAdmissionFee: { type: Number, default: 50000 },
    },
    campuses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campus',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    seatsTotal: {
      type: Number,
      default: 120,
    },
    badge: {
      type: String,
      default: 'AI-First',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for calculating 4-year base cost
programSchema.virtual('totalTuitionFourYears').get(function () {
  return (this.fees.tuitionPerYear + this.fees.labFeePerYear) * 4 + this.fees.oneTimeAdmissionFee;
});

module.exports = mongoose.model('Program', programSchema);
