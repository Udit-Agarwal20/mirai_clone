const mongoose = require('mongoose');

const studentContributorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  github: { type: String, default: '' },
  batch: { type: String, default: 'Class of 2026' },
  avatar: { type: String, default: '' },
});

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    problemStatement: {
      type: String,
      default: '',
    },
    solutionArchitecture: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['AI', 'WEB', 'MOBILE', 'ROBOTICS', 'STARTUP', 'OPEN SOURCE', 'OPEN_SOURCE'],
      default: 'AI',
    },
    technology: [{ type: String }],
    students: [studentContributorSchema],
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
      default: 2,
    },
    thumbnail: {
      type: String,
      default: '/images/projects/default-project.jpg',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    liveUrl: {
      type: String,
      default: '',
    },
    stats: {
      highlight: { type: String, default: '' },
      metricLabel: { type: String, default: '' },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
