const notFoundHandler = (req, res, next) => {
  res.status(404).render('errors/404', {
    pageTitle: 'Page Not Found | NOVA Institute of Technology',
    pageDescription: 'The page you are looking for does not exist or has been moved.',
    layout: 'layouts/main',
  });
};

const globalErrorHandler = (err, req, res, next) => {
  // Handle invalid Mongoose ObjectId gracefully as 404
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).render('errors/404', {
      pageTitle: 'Resource Not Found | NOVA Institute of Technology',
      pageDescription: 'The requested resource could not be found with the provided identifier.',
      layout: 'layouts/main',
    });
  }

  // Handle Mongoose Validation Error as 400
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    req.flash('error_msg', messages.join('. '));
    return res.status(400).redirect(req.header('Referer') || '/');
  }

  console.error('[Error] Uncaught application exception:', err);

  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'An internal server error occurred.',
      ...(isDev && { stack: err.stack }),
    });
  }

  res.status(statusCode).render('errors/500', {
    pageTitle: 'System Error | NOVA Institute of Technology',
    pageDescription: 'An unexpected error occurred while processing your request.',
    error: isDev ? err : {},
    layout: 'layouts/main',
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
