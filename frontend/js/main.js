async function loadEvents() {
  const grid = document.getElementById('events-grid');

  try {
    const events = await apiRequest('/events');
    if (!events.length) {
      grid.innerHTML = '<p>Nincs elerheto esemeny.</p>';
      return;
    }

    grid.innerHTML = events.map(event => `
      <div class="event-card">
        <h3>${event.title}</h3>
        <p>${event.description || 'Nincs leiras.'}</p>
        <p><strong>Datum:</strong> ${new Date(event.event_date).toLocaleString('hu-HU')}</p>
        <p><strong>Helyszin:</strong> ${event.location}</p>
        <p><strong>Szervezo:</strong> ${event.organizer_name}</p>
        <p><strong>Jelentkezok:</strong> ${event.registration_count}</p>
        <a class="btn btn-primary" href="event-detail.html?id=${event.id}">Reszletek</a>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadEvents);
