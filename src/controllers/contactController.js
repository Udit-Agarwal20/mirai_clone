const Enquiry = require('../models/Enquiry');
const Campus = require('../models/Campus');
const Program = require('../models/Program');

exports.getContactPage = async (req, res, next) => {
  try {
    const [campuses, programs] = await Promise.all([
      Campus.find(),
      Program.find({ isActive: true }),
    ]);

    res.render('contact/index', {
      pageTitle: 'Contact & Admissions Support | NOVA Institute of Technology',
      pageDescription:
        'Get in touch with our admissions advisors, schedule a campus visit, or connect with faculty in Bengaluru, Hyderabad, and Pune.',
      campuses,
      programs,
      formData: {},
    });
  } catch (err) {
    next(err);
  }
};

exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, programInterest, campusInterest } = req.body;

    // Validation
    const errors = [];
    if (!name || name.trim() === '') errors.push('Please enter your full name.');
    if (!email || !email.includes('@')) errors.push('Please enter a valid email address.');
    if (!phone || phone.trim().length < 8) errors.push('Please enter a valid phone number.');
    if (!subject || subject.trim() === '') errors.push('Please specify a subject.');
    if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters long.');

    if (errors.length > 0) {
      req.flash('error_msg', errors.join(' '));
      const [campuses, programs] = await Promise.all([
        Campus.find(),
        Program.find({ isActive: true }),
      ]);
      return res.status(400).render('contact/index', {
        pageTitle: 'Contact Admissions | NOVA Institute of Technology',
        pageDescription: 'Get in touch with admissions.',
        campuses,
        programs,
        formData: req.body,
      });
    }

    await Enquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      programInterest: programInterest || null,
      campusInterest: campusInterest || null,
      status: 'NEW',
    });

    req.flash('success_msg', 'Thank you! Your inquiry has been submitted. An admissions advisor will connect with you within 24 hours.');
    res.redirect('/contact');
  } catch (err) {
    next(err);
  }
};
