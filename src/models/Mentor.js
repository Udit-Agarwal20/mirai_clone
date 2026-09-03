const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Mentor name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role/Designation is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company/Organization is required'],
      trim: true,
    },
    expertise: [{ type: String }],
    bio: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '/images/mentors/default-mentor.jpg',
    },
    linkedin: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },
    previousCompanies: [{ type: String }],
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Mentor', mentorSchema);
