const ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Access restricted. Administrator privileges required.');
  res.status(403).render('errors/403', {
    pageTitle: 'Access Denied | NOVA Institute of Technology',
    message: 'You do not have permission to view the administrative control portal.',
    layout: 'layouts/main',
  });
};

const ensureStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  // Admins can also inspect student pages if needed or redirect
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Student access required.');
  res.redirect('/auth/login');
};

module.exports = {
  ensureAdmin,
  ensureStudent,
};
