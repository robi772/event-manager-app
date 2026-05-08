document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('error-msg');
  const submitBtn = e.target.querySelector('button[type=submit]');
  errorBox.style.display = 'none';
  submitBtn.textContent = 'Bejelentkezés...';
  submitBtn.disabled = true;

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
    errorBox.textContent = err.message === 'Invalid credentials'
      ? 'Hibás e-mail cím vagy jelszó.'
      : err.message;
    submitBtn.textContent = 'Bejelentkezés';
    submitBtn.disabled = false;
  }
});
