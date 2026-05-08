document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('error-msg');
  const successBox = document.getElementById('success-msg');
  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  try {
    const payload = {
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };

    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    successBox.style.display = 'block';
    successBox.textContent = 'Sikeres regisztracio!';
    setTimeout(() => window.location.href = 'index.html', 800);
  } catch (err) {
    errorBox.style.display = 'block';
    errorBox.textContent = err.message;
  }
});
