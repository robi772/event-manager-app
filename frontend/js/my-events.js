async function cancelRegistration(regId) {
  if (!confirm('Biztosan lemondod a jelentkezest?')) return;
  try {
    await apiRequest(`/registrations/${regId}`, { method: 'DELETE' });
    loadMyEvents();
  } catch (err) {
    alert(err.message);
  }
}

async function loadMyEvents() {
  requireAuth();

  const eventsBox = document.getElementById('my-events-list');
  const regsBox = document.getElementById('my-registrations-list');

  try {
    const [events, regs] = await Promise.all([
      apiRequest('/events/my/events'),
      apiRequest('/registrations/my')
    ]);

    eventsBox.innerHTML = events.length
      ? events.map(e => `
        <div class="event-card">
          <h3>${e.title}</h3>
          <p><strong>Datum:</strong> ${new Date(e.event_date).toLocaleString('hu-HU')}</p>
          <p><strong>Helyszin:</strong> ${e.location}</p>
          <p><strong>Statusz:</strong> <span class="badge badge-${e.status}">${e.status}</span></p>
          <p><strong>Jelentkezok:</strong> ${e.registration_count}</p>
          <a class="btn btn-secondary" href="edit-event.html?id=${e.id}">Szerkesztes</a>
          <a class="btn btn-secondary" href="event-detail.html?id=${e.id}">Megtekintes</a>
        </div>
      `).join('')
      : '<p>Meg nincs sajat esemeny. <a href="create-event.html">Hozz letre egyet!</a></p>';

    regsBox.innerHTML = regs.length
      ? regs.map(r => `
        <div class="event-card">
          <h3>${r.title}</h3>
          <p><strong>Datum:</strong> ${new Date(r.event_date).toLocaleString('hu-HU')}</p>
          <p><strong>Helyszin:</strong> ${r.location}</p>
          <a class="btn btn-secondary" href="event-detail.html?id=${r.event_id}">Megtekintes</a>
          <button class="btn btn-logout" onclick="cancelRegistration(${r.id})">Lemondas</button>
        </div>
      `).join('')
      : '<p>Meg nincs jelentkezes.</p>';
  } catch (err) {
    eventsBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    regsBox.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', loadMyEvents);
