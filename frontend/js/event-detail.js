function getEventId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function registerForEvent(eventId) {
  const btn = document.getElementById('reg-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Jelentkezés...'; }

  try {
    await apiRequest('/registrations', {
      method: 'POST',
      body: JSON.stringify({ event_id: Number(eventId) })
    });
    alert('Sikeres jelentkezés! Viszlát az eseményen.');
    loadEvent();
  } catch (err) {
    const msg = err.message === 'Already registered for this event'
      ? 'Már jelentkeztél erre az eseményre.'
      : err.message === 'Event is full'
      ? 'Az esemény betelt, sajnos nem tudsz jelentkezni.'
      : err.message;
    alert(msg);
    if (btn) { btn.disabled = false; btn.textContent = 'Jelentkezem'; }
  }
}

async function loadEvent() {
  const container = document.getElementById('event-detail');
  const eventId = getEventId();

  if (!eventId) {
    container.innerHTML = '<div class="alert alert-error">Nem található az esemény azonosítója.</div>';
    return;
  }

  try {
    const event = await apiRequest(`/events/${eventId}`);
    const loggedIn = isLoggedIn();

    const statusLabels = { approved: 'Jóváhagyott', pending: 'Függőben', rejected: 'Elutasított' };

    container.innerHTML = `
      <h1>${event.title}</h1>
      <p class="event-desc">${event.description || 'Nincs leírás.'}</p>
      <div class="detail-grid">
        <p><span class="label">📅 Dátum:</span> ${new Date(event.event_date).toLocaleString('hu-HU')}</p>
        <p><span class="label">📍 Helyszín:</span> ${event.location}</p>
        <p><span class="label">👤 Szervező:</span> ${event.organizer_name}</p>
        <p><span class="label">👥 Jelentkezők:</span> ${event.registration_count}${event.max_participants ? ' / ' + event.max_participants + ' fő' : ''}</p>
        <p><span class="label">📌 Státusz:</span> ${statusLabels[event.status] || event.status}</p>
      </div>
      <div style="margin-top:1.5rem">
        ${loggedIn
          ? `<button id="reg-btn" class="btn btn-primary" onclick="registerForEvent(${event.id})">Jelentkezem</button>`
          : `<a class="btn btn-primary" href="login.html">Bejelentkezés a jelentkezéshez</a>`
        }
        <a class="btn btn-secondary" href="index.html">← Vissza</a>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">Hiba: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadEvent);
