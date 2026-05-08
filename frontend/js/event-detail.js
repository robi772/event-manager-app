function getEventId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function registerForEvent(eventId) {
  try {
    await apiRequest('/registrations', {
      method: 'POST',
      body: JSON.stringify({ event_id: Number(eventId) })
    });
    alert('Sikeres jelentkezes!');
    loadEvent();
  } catch (err) {
    alert(err.message);
  }
}

async function loadEvent() {
  const container = document.getElementById('event-detail');
  const eventId = getEventId();

  if (!eventId) {
    container.innerHTML = '<div class="alert alert-error">Nem talalhato az esemeny azonositoja.</div>';
    return;
  }

  try {
    const event = await apiRequest(`/events/${eventId}`);
    const loggedIn = isLoggedIn();

    container.innerHTML = `
      <h1>${event.title}</h1>
      <p>${event.description || 'Nincs leiras.'}</p>
      <p><strong>Datum:</strong> ${new Date(event.event_date).toLocaleString('hu-HU')}</p>
      <p><strong>Helyszin:</strong> ${event.location}</p>
      <p><strong>Szervezo:</strong> ${event.organizer_name}</p>
      <p><strong>Jelentkezok:</strong> ${event.registration_count}${event.max_participants ? ' / ' + event.max_participants : ''}</p>
      ${loggedIn
        ? `<button class="btn btn-primary" onclick="registerForEvent(${event.id})">Jelentkezem</button>`
        : `<a class="btn btn-primary" href="login.html">Bejelentkezes a jelentkezeshez</a>`
      }
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadEvent);
