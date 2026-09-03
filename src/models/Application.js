const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    personalInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      dob: { type: Date },
      gender: { type: String },
      guardianName: { type: String, default: '' },
      guardianPhone: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    academicInfo: {
      highSchool: { type: String, default: '' },
      board: { type: String, default: '' },
      yearOfPassing: { type: Number, default: 2026 },
      pcmPercentage: { type: Number, min: 0, max: 100, default: 0 },
      mathMarks: { type: Number, min: 0, max: 100 },
      physicsMarks: { type: Number, min: 0, max: 100 },
      csMarks: { type: Number, min: 0, max: 100 },
      entranceExam: { type: String, default: '' },
      entranceScore: { type: String, default: '' },
      githubUrl: { type: String, default: '' },
      portfolioUrl: { type: String, default: '' },
      codingExperience: {
        type: String,
        enum: ['None', 'Beginner (Basic Python/JS)', 'Intermediate (Built projects)', 'Advanced (Competitive / Open Source)'],
        default: 'Beginner (Basic Python/JS)',
      },
    },
    preferences: {
      program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true,
      },
      alternateProgram: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
      },
      campus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campus',
        required: true,
      },
      alternateCampus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campus',
      },
      hostelRequired: {
        type: Boolean,
        default: true,
      },
      scholarshipOptIn: {
        type: Boolean,
        default: false,
      },
      claimedScholarship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scholarship',
      },
    },
    statementOfPurpose: {
      type: String,
      default: '',
    },
    careerGoal: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ASSESSMENT', 'INTERVIEW', 'OFFERED', 'ENROLLED', 'REJECTED'],
      default: 'DRAFT',
    },
    assessmentDetails: {
      scheduledDate: { type: Date },
      score: { type: Number },
      status: { type: String, default: 'Pending' },
      feedback: { type: String, default: '' },
    },
    interviewDetails: {
      scheduledDate: { type: Date },
      meetingLink: { type: String, default: '' },
      interviewer: { type: String, default: '' },
      feedback: { type: String, default: '' },
      status: { type: String, default: 'Pending' },
    },
    offerDetails: {
      scholarshipGrantedPercentage: { type: Number, default: 0 },
      annualFeeOffered: { type: Number },
      acceptanceDeadline: { type: Date },
    },
    adminNotes: {
      type: String,
      default: '',
    },
    timeline: [
      {
        stage: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        updatedBy: { type: String, default: 'System' },
      },
    ],
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Application', applicationSchema);
