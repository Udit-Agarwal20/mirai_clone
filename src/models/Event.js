const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'APPLICATION_OPENS',
        'APPLICATION_DEADLINE',
        'ASSESSMENT',
        'INTERVIEW',
        'ENROLLMENT',
        'CAMPUS_OPEN_HOUSE',
        'WEBINAR',
      ],
      default: 'APPLICATION_DEADLINE',
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
    },
    campusName: {
      type: String,
      default: 'All Campuses (Online)',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    actionUrl: {
      type: String,
      default: '/admissions',
    },
    actionText: {
      type: String,
      default: 'View Details',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
