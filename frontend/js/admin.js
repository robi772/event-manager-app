function showTab(tab, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).style.display = 'block';
  if (btn) btn.classList.add('active');
}

async function updateEventStatus(id, status) {
  const label = status === 'approved' ? 'jóváhagyod' : 'elutasítod';
  if (!confirm(`Biztosan ${label} ezt az eseményt?`)) return;
  try {
    await apiRequest(`/admin/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    loadAdminData();
  } catch (err) {
    alert('Hiba: ' + err.message);
  }
}

async function deleteEvent(id) {
  if (!confirm('Biztosan törlöd ezt az eseményt? Ez a művelet nem vonható vissza.')) return;
  try {
    await apiRequest(`/admin/events/${id}`, { method: 'DELETE' });
    loadAdminData();
  } catch (err) {
    alert('Hiba: ' + err.message);
  }
}

async function loadAdminData() {
  requireAuth();
  const user = getCurrentUser();
  if (user?.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const statusLabels = { approved: '✓ Jóváhagyott', pending: '⏳ Függőben', rejected: '✗ Elutasított' };
  const statusClass = { approved: 'success', pending: 'warning', rejected: 'error' };

  try {
    const [events, users] = await Promise.all([
      apiRequest('/admin/events'),
      apiRequest('/admin/users')
    ]);

    const pending = events.filter(e => e.status === 'pending');

    document.getElementById('pending-events').innerHTML = pending.length
      ? pending.map(e => `
        <div class="event-card">
          <div class="event-card-body">
            <h3>${e.title}</h3>
            <p><span class="label">📍 Helyszín:</span> ${e.location}</p>
            <p><span class="label">📅 Dátum:</span> ${new Date(e.event_date).toLocaleString('hu-HU')}</p>
            <p><span class="label">👤 Szervező:</span> ${e.organizer_name}</p>
          </div>
          <div class="event-card-footer">
            <button class="btn btn-primary" onclick="updateEventStatus(${e.id}, 'approved')">✓ Jóváhagyás</button>
            <button class="btn btn-secondary" onclick="updateEventStatus(${e.id}, 'rejected')">✗ Elutasítás</button>
          </div>
        </div>
      `).join('')
      : '<p class="muted">Nincs függőben lévő esemény.</p>';

    document.getElementById('all-events').innerHTML = events.length
      ? events.map(e => `
        <div class="event-card">
          <div class="event-card-body">
            <h3>${e.title}</h3>
            <p><span class="label">📌 Státusz:</span> <span class="badge badge-${statusClass[e.status]}">${statusLabels[e.status] || e.status}</span></p>
            <p><span class="label">👤 Szervező:</span> ${e.organizer_name}</p>
            <p><span class="label">📅 Dátum:</span> ${new Date(e.event_date).toLocaleString('hu-HU')}</p>
          </div>
          <div class="event-card-footer">
            <button class="btn btn-danger" onclick="deleteEvent(${e.id})">🗑 Törlés</button>
          </div>
        </div>
      `).join('')
      : '<p class="muted">Nincs esemény.</p>';

    document.getElementById('users-list').innerHTML = users.length
      ? users.map(u => `
        <div class="event-card">
          <div class="event-card-body">
            <h3>${u.username}</h3>
            <p>${u.email}</p>
            <p><span class="label">Szerep:</span> ${u.role}</p>
            <p><span class="label">Regisztrált:</span> ${new Date(u.created_at).toLocaleDateString('hu-HU')}</p>
          </div>
        </div>
      `).join('')
      : '<p class="muted">Nincs felhasználó.</p>';

  } catch (err) {
    document.getElementById('pending-events').innerHTML = `<div class="alert alert-error">Hiba: ${err.message}</div>`;
    document.getElementById('all-events').innerHTML = '';
    document.getElementById('users-list').innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab, btn));
  });
  loadAdminData();
});
