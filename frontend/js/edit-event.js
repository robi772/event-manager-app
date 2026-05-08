function getEventId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadEventData() {
  requireAuth();
  const eventId = getEventId();
  const errorBox = document.getElementById('error-msg');

  if (!eventId) {
    errorBox.style.display = 'block';
    errorBox.textContent = 'Hiányzó esemény azonosító.';
    return;
  }

  try {
    const event = await apiRequest(`/events/${eventId}`);

    document.getElementById('title').value = event.title || '';
    document.getElementById('description').value = event.description || '';
    document.getElementById('location').value = event.location || '';
    document.getElementById('max_participants').value = event.max_participants || '';

    if (event.event_date) {
      const dt = new Date(event.event_date);
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      document.getElementById('event_date').value = local;
    }
  } catch (err) {
    errorBox.style.display = 'block';
    errorBox.textContent = 'Nem sikerült betölteni az eseményt: ' + err.message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadEventData();

  document.getElementById('edit-event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById('error-msg');
    const successBox = document.getElementById('success-msg');
    errorBox.style.display = 'none';
    successBox.style.display = 'none';

    const eventId = getEventId();

    try {
      const payload = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        event_date: document.getElementById('event_date').value.replace('T', ' ') + ':00',
        location: document.getElementById('location').value,
        max_participants: document.getElementById('max_participants').value || null
      };

      await apiRequest(`/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      successBox.style.display = 'block';
      successBox.textContent = 'Esemény sikeresen frissítve!';
      setTimeout(() => window.location.href = 'my-events.html', 1200);
    } catch (err) {
      errorBox.style.display = 'block';
      errorBox.textContent = err.message;
    }
  });
});
