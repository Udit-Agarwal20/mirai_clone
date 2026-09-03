/**
 * Dynamic event countdown ticker with second-by-second updates
 */

document.addEventListener('DOMContentLoaded', () => {
  const countdownContainers = document.querySelectorAll('[data-countdown-target]');

  countdownContainers.forEach((container) => {
    const targetIso = container.getAttribute('data-countdown-target');
    if (!targetIso) return;

    const targetDate = new Date(targetIso).getTime();
    const daysEl = container.querySelector('[data-unit="days"]');
    const hoursEl = container.querySelector('[data-unit="hours"]');
    const minutesEl = container.querySelector('[data-unit="minutes"]');
    const secondsEl = container.querySelector('[data-unit="seconds"]');
    const statusTextEl = container.querySelector('[data-countdown-status]');

    const updateTicker = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';
        if (statusTextEl) statusTextEl.textContent = 'WINDOW CLOSED';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
      if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
      if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
      if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    };

    updateTicker();
    setInterval(updateTicker, 1000);
  });
});
