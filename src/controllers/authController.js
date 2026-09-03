const User = require('../models/User');

exports.getRegister = (req, res) => {
  res.render('auth/register', {
    pageTitle: 'Create Student Account | NOVA Institute of Technology',
    pageDescription: 'Register to start your admission application and track your status.',
    formData: {},
  });
};

exports.postRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    const errors = [];
    if (!name || name.trim() === '') errors.push('Full name is required.');
    if (!email || !email.includes('@')) errors.push('A valid email address is required.');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
    if (password !== confirmPassword) errors.push('Passwords do not match.');

    if (errors.length > 0) {
      req.flash('error_msg', errors.join(' '));
      return res.status(400).render('auth/register', {
        pageTitle: 'Create Student Account | NOVA Institute of Technology',
        pageDescription: 'Register to start your application.',
        formData: { name, email, phone },
      });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      req.flash('error_msg', 'An account with this email already exists. Please log in.');
      return res.status(400).render('auth/register', {
        pageTitle: 'Create Student Account | NOVA Institute of Technology',
        pageDescription: 'Register to start your application.',
        formData: { name, email, phone },
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password,
      role: 'student',
    });

    req.session.userId = user._id;
    req.flash('success_msg', `Welcome to NOVA, ${user.name}! Your account has been created.`);
    res.redirect('/student/dashboard');
  } catch (err) {
    next(err);
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Sign In | NOVA Institute of Technology',
    pageDescription: 'Sign in to your NOVA student or administrator portal.',
    formData: {},
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error_msg', 'Please provide both email and password.');
      return res.status(400).render('auth/login', {
        pageTitle: 'Sign In | NOVA Institute of Technology',
        pageDescription: 'Sign in to your account.',
        formData: { email },
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.status(401).render('auth/login', {
        pageTitle: 'Sign In | NOVA Institute of Technology',
        pageDescription: 'Sign in to your account.',
        formData: { email },
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.status(401).render('auth/login', {
        pageTitle: 'Sign In | NOVA Institute of Technology',
        pageDescription: 'Sign in to your account.',
        formData: { email },
      });
    }

    req.session.userId = user._id;

    const returnUrl = req.session.returnTo;
    delete req.session.returnTo;

    req.flash('success_msg', `Welcome back, ${user.name}!`);

    if (user.role === 'admin') {
      return res.redirect(returnUrl || '/admin');
    }

    res.redirect(returnUrl || '/student/dashboard');
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[Auth] Logout session destruction error:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
};
