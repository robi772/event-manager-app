function showTab(tab, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).style.display = 'block';
  if (btn) btn.classList.add('active');
}

async function updateEventStatus(id, status) {
  try {
    await apiRequest(`/admin/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    loadAdminData();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteEvent(id) {
  if (!confirm('Biztosan torlod ezt az esemenyt?')) return;
  try {
    await apiRequest(`/admin/events/${id}`, { method: 'DELETE' });
    loadAdminData();
  } catch (err) {
    alert(err.message);
  }
}

async function loadAdminData() {
  requireAuth();
  const user = getCurrentUser();
  if (user?.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  try {
    const [events, users] = await Promise.all([
      apiRequest('/admin/events'),
      apiRequest('/admin/users')
    ]);

    const pending = events.filter(e => e.status === 'pending');
    document.getElementById('pending-events').innerHTML = pending.length
      ? pending.map(e => `
        <div class="event-card">
          <h3>${e.title}</h3>
          <p><strong>Helyszin:</strong> ${e.location}</p>
          <p><strong>Datum:</strong> ${new Date(e.event_date).toLocaleString('hu-HU')}</p>
          <p><strong>Szervezo:</strong> ${e.organizer_name}</p>
          <button class="btn btn-primary" onclick="updateEventStatus(${e.id}, 'approved')">Jovahagyas</button>
          <button class="btn btn-secondary" onclick="updateEventStatus(${e.id}, 'rejected')">Elutasitas</button>
        </div>
      `).join('')
      : '<p>Nincs fuggőben levo esemeny.</p>';

    document.getElementById('all-events').innerHTML = events.length
      ? events.map(e => `
        <div class="event-card">
          <h3>${e.title}</h3>
          <p><strong>Statusz:</strong> ${e.status}</p>
          <p><strong>Szervezo:</strong> ${e.organizer_name}</p>
          <button class="btn btn-secondary" onclick="deleteEvent(${e.id})">Torles</button>
        </div>
      `).join('')
      : '<p>Nincs esemeny.</p>';

    document.getElementById('users-list').innerHTML = users.length
      ? users.map(u => `
        <div class="event-card">
          <h3>${u.username}</h3>
          <p>${u.email}</p>
          <p><strong>Szerep:</strong> ${u.role}</p>
          <p><strong>Regisztralt:</strong> ${new Date(u.created_at).toLocaleDateString('hu-HU')}</p>
        </div>
      `).join('')
      : '<p>Nincs felhasznalo.</p>';
  } catch (err) {
    document.getElementById('pending-events').innerHTML = `<div class="alert alert-error">${err.message}</div>`;
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
