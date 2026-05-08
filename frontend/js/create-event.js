document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  document.getElementById('create-event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorBox = document.getElementById('error-msg');
    const successBox = document.getElementById('success-msg');
    errorBox.style.display = 'none';
    successBox.style.display = 'none';

    try {
      const payload = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        event_date: document.getElementById('event_date').value.replace('T', ' ') + ':00',
        location: document.getElementById('location').value,
        max_participants: document.getElementById('max_participants').value || null
      };

      await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      successBox.style.display = 'block';
      successBox.textContent = 'Esemeny letrehozva! Jovahagyasra var.';
      e.target.reset();
    } catch (err) {
      errorBox.style.display = 'block';
      errorBox.textContent = err.message;
    }
  });
});
