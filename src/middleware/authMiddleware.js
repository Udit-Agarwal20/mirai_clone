const User = require('../models/User');

const fetchCurrentUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).populate('savedPrograms savedCampuses savedProjects');
      if (user) {
        req.user = user;
        res.locals.currentUser = user;
        res.locals.isAuthenticated = true;
        res.locals.isAdmin = user.role === 'admin';
        res.locals.isStudent = user.role === 'student';
      } else {
        req.session.userId = null;
        res.locals.currentUser = null;
        res.locals.isAuthenticated = false;
        res.locals.isAdmin = false;
        res.locals.isStudent = false;
      }
    } catch (err) {
      console.error('[AuthMiddleware] Error fetching user:', err.message);
      res.locals.currentUser = null;
      res.locals.isAuthenticated = false;
      res.locals.isAdmin = false;
      res.locals.isStudent = false;
    }
  } else {
    res.locals.currentUser = null;
    res.locals.isAuthenticated = false;
    res.locals.isAdmin = false;
    res.locals.isStudent = false;
  }
  next();
};

const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId && req.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  req.flash('error_msg', 'Please sign in to access this page.');
  res.redirect('/auth/login');
};

const ensureGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    if (req.user && req.user.role === 'admin') {
      return res.redirect('/admin');
    }
    return res.redirect('/student/dashboard');
  }
  next();
};

module.exports = {
  fetchCurrentUser,
  ensureAuthenticated,
  ensureGuest,
};
