async function cancelRegistration(regId) {
  if (!confirm('Biztosan lemondod a jelentkezést?')) return;
  try {
    await apiRequest(`/registrations/${regId}`, { method: 'DELETE' });
    loadMyEvents();
  } catch (err) {
    alert('Hiba: ' + err.message);
  }
}

async function loadMyEvents() {
  requireAuth();

  const eventsBox = document.getElementById('my-events-list');
  const regsBox = document.getElementById('my-registrations-list');

  const statusLabels = { approved: '✓ Jóváhagyott', pending: '⏳ Függőben', rejected: '✗ Elutasított' };
  const statusClass = { approved: 'success', pending: 'warning', rejected: 'error' };

  try {
    const [events, regs] = await Promise.all([
      apiRequest('/events/my/events'),
      apiRequest('/registrations/my')
    ]);

    eventsBox.innerHTML = events.length
      ? events.map(e => `
        <div class="event-card">
          <div class="event-card-body">
            <h3>${e.title}</h3>
            <p><span class="label">📅 Dátum:</span> ${new Date(e.event_date).toLocaleString('hu-HU')}</p>
            <p><span class="label">📍 Helyszín:</span> ${e.location}</p>
            <p><span class="label">📌 Státusz:</span> <span class="badge badge-${statusClass[e.status]}">${statusLabels[e.status] || e.status}</span></p>
            <p><span class="label">👥 Jelentkezők:</span> ${e.registration_count}${e.max_participants ? ' / ' + e.max_participants : ''}</p>
          </div>
          <div class="event-card-footer">
            <a class="btn btn-secondary" href="edit-event.html?id=${e.id}">✎ Szerkesztés</a>
            <a class="btn btn-secondary" href="event-detail.html?id=${e.id}">Megtekintés</a>
          </div>
        </div>
      `).join('')
      : '<p class="muted">Még nincs saját eseményed. <a href="create-event.html">Hozz létre egyet!</a></p>';

    regsBox.innerHTML = regs.length
      ? regs.map(r => `
        <div class="event-card">
          <div class="event-card-body">
            <h3>${r.title}</h3>
            <p><span class="label">📅 Dátum:</span> ${new Date(r.event_date).toLocaleString('hu-HU')}</p>
            <p><span class="label">📍 Helyszín:</span> ${r.location}</p>
          </div>
          <div class="event-card-footer">
            <a class="btn btn-secondary" href="event-detail.html?id=${r.event_id}">Megtekintés</a>
            <button class="btn btn-danger" onclick="cancelRegistration(${r.id})">Lemondás</button>
          </div>
        </div>
      `).join('')
      : '<p class="muted">Még nincs jelentkezésed.</p>';
  } catch (err) {
    eventsBox.innerHTML = `<div class="alert alert-error">Hiba: ${err.message}</div>`;
    regsBox.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', loadMyEvents);
