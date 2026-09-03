const Announcement = require('../models/Announcement');
const FeeCalculatorService = require('../services/feeCalculatorService');

const globalVarsMiddleware = async (req, res, next) => {
  try {
    // Flash messages
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.info_msg = req.flash('info_msg');

    // Current navigation path
    res.locals.currentPath = req.path;
    res.locals.currentUrl = req.originalUrl;

    // Site Identity
    res.locals.siteName = 'NOVA Institute of Technology';
    res.locals.siteTagline = 'Build first. Learn deeply. Ship relentlessly.';
    res.locals.currentYear = new Date().getFullYear();

    // Helper utilities
    res.locals.formatCurrency = FeeCalculatorService.formatCurrency;
    res.locals.formatDate = (date) => {
      if (!date) return 'N/A';
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(date));
    };

    // Active announcement query (cached/retrieved with fallback)
    const now = new Date();
    const activeAnnouncement = await Announcement.findOne({
      isActive: true,
      $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
    }).sort({ priority: -1, createdAt: -1 });

    res.locals.activeAnnouncement = activeAnnouncement;

    next();
  } catch (err) {
    console.error('[GlobalVarsMiddleware] Error setting global variables:', err.message);
    res.locals.activeAnnouncement = null;
    next();
  }
};

module.exports = globalVarsMiddleware;
