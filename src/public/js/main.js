/**
 * NOVA Institute of Technology — Main Client Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Drawer Toggle
  const navToggleBtn = document.getElementById('navToggleBtn');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavClose = document.getElementById('mobileNavClose');

  if (navToggleBtn && mobileNavOverlay && mobileNavDrawer) {
    const openMobileNav = () => {
      mobileNavOverlay.classList.add('active');
      mobileNavDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeMobileNav = () => {
      mobileNavOverlay.classList.remove('active');
      mobileNavDrawer.classList.remove('active');
      document.body.style.overflow = '';
    };

    navToggleBtn.addEventListener('click', openMobileNav);
    if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
    mobileNavOverlay.addEventListener('click', closeMobileNav);
  }

  // Flash Message Dismissal
  const alertCloseBtns = document.querySelectorAll('.alert-close');
  alertCloseBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const alert = btn.closest('.alert');
      if (alert) {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 200);
      }
    });
  });

  // Auto-dismiss success flash messages after 6 seconds
  const successAlerts = document.querySelectorAll('.alert-success');
  successAlerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.3s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 300);
    }, 6000);
  });
});
