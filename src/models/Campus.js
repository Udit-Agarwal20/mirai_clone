const mongoose = require('mongoose');

const hostelOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomType: { type: String, required: true }, // e.g. 'Single AC', 'Twin Sharing AC', 'Triple Sharing Non-AC'
  annualFee: { type: Number, required: true },
  mealsIncluded: { type: Boolean, default: true },
  description: { type: String, default: '' },
});

const campusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campus name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Campus description is required'],
    },
    facilities: [{ type: String }],
    labs: [{ type: String }],
    programs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
      },
    ],
    hostelOptions: [hostelOptionSchema],
    annualHostelFeeDefault: {
      type: Number,
      default: 180000,
    },
    securityDeposit: {
      type: Number,
      default: 25000,
    },
    image: {
      type: String,
      default: '/images/campuses/default-campus.jpg',
    },
    mapUrl: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      default: 'admissions@novatech.edu',
    },
    contactPhone: {
      type: String,
      default: '+91 80 4920 1800',
    },
    availableSeats: {
      type: Number,
      default: 240,
    },
    status: {
      type: String,
      enum: ['Admissions Open', 'Limited Seats', 'Waitlist Open', 'Applications Closed'],
      default: 'Admissions Open',
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

module.exports = mongoose.model('Campus', campusSchema);
