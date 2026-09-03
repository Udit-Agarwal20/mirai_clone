const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide your contact number'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please write your message or query'],
    },
    programInterest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
    },
    campusInterest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'RESOLVED', 'ARCHIVED'],
      default: 'NEW',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
