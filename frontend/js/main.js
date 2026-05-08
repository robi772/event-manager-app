async function loadEvents() {
  const grid = document.getElementById('events-grid');

  try {
    const events = await apiRequest('/events');
    if (!events.length) {
      grid.innerHTML = '<p class="muted">Nincs elérhető esemény.</p>';
      return;
    }

    grid.innerHTML = events.map(event => `
      <div class="event-card">
        <div class="event-card-body">
          <h3>${event.title}</h3>
          <p class="event-desc">${event.description || 'Nincs leírás.'}</p>
          <p><span class="label">📅 Dátum:</span> ${new Date(event.event_date).toLocaleString('hu-HU')}</p>
          <p><span class="label">📍 Helyszín:</span> ${event.location}</p>
          <p><span class="label">👤 Szervező:</span> ${event.organizer_name}</p>
          <p><span class="label">👥 Jelentkezők:</span> ${event.registration_count}${event.max_participants ? ' / ' + event.max_participants : ''}</p>
        </div>
        <div class="event-card-footer">
          <a class="btn btn-primary" href="event-detail.html?id=${event.id}">Részletek →</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<div class="alert alert-error">Hiba: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadEvents);
