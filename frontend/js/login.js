document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('error-msg');
  errorBox.style.display = 'none';

  try {
    const payload = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };

    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    window.location.href = 'index.html';
  } catch (err) {
    errorBox.style.display = 'block';
    errorBox.textContent = err.message;
  }
});
