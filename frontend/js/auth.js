function getCurrentUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function updateNav() {
  const navAuth = document.getElementById('nav-auth');
  const navUser = document.getElementById('nav-user');
  const navAdmin = document.getElementById('nav-admin');
  const user = getCurrentUser();

  if (navAuth && navUser) {
    if (user) {
      navAuth.style.display = 'none';
      navUser.style.display = 'inline-flex';
    } else {
      navAuth.style.display = 'inline-flex';
      navUser.style.display = 'none';
    }
  }

  if (navAdmin && user?.role === 'admin') {
    navAdmin.style.display = 'inline-flex';
  }
}

document.addEventListener('DOMContentLoaded', updateNav);
