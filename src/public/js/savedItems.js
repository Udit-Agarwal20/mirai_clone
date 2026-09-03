/**
 * Asynchronous bookmarking handlers for programs, campuses, and projects
 */

document.addEventListener('DOMContentLoaded', () => {
  const bookmarkButtons = document.querySelectorAll('[data-bookmark-btn]');

  bookmarkButtons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const itemType = button.getAttribute('data-item-type');
      const itemId = button.getAttribute('data-item-id');

      if (!itemType || !itemId) return;

      try {
        const response = await fetch('/student/saved/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ itemType, itemId }),
        });

        if (response.status === 401 || response.redirected) {
          window.location.href = '/auth/login';
          return;
        }

        const data = await response.json();
        if (data.success) {
          if (data.isSaved) {
            button.classList.add('bookmarked');
            button.setAttribute('title', 'Saved');
            button.innerHTML = '★ Saved';
          } else {
            button.classList.remove('bookmarked');
            button.setAttribute('title', 'Save for later');
            button.innerHTML = '☆ Save';
          }
        }
      } catch (err) {
        console.error('[Bookmark] Error toggling bookmark:', err);
      }
    });
  });
});
