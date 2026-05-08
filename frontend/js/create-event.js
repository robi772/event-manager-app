document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  document.getElementById('create-event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorBox = document.getElementById('error-msg');
    const successBox = document.getElementById('success-msg');
    const submitBtn = e.target.querySelector('button[type=submit]');
    errorBox.style.display = 'none';
    successBox.style.display = 'none';
    submitBtn.textContent = 'Létrehozás...';
    submitBtn.disabled = true;

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
      successBox.textContent = '✓ Esemény sikeresen létrehozva! Jóváhagyásra vár.';
      e.target.reset();
    } catch (err) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Hiba: ' + err.message;
    } finally {
      submitBtn.textContent = 'Esemény létrehozása';
      submitBtn.disabled = false;
    }
  });
});
