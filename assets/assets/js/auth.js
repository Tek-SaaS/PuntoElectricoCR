/* auth.js — maneja login y register */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn = loginForm.querySelector('button[type=submit]');
      btn.disabled = true;

      try {
        const data = await window.PE.api('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        window.PE.setSession(data.token, data.user);
        window.PE.toast(window.PE.t('toastLoginOk'));
        setTimeout(() => {
          const next = new URLSearchParams(location.search).get('next');
          location.href = next || 'index.html';
        }, 500);
      } catch (err) {
        window.PE.toast(window.PE.t('toastLoginErr'), 4000);
        btn.disabled = false;
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn = registerForm.querySelector('button[type=submit]');
      btn.disabled = true;

      try {
        const data = await window.PE.api('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        window.PE.setSession(data.token, data.user);
        window.PE.toast(window.PE.t('toastRegisterOk'));
        setTimeout(() => location.href = 'index.html', 500);
      } catch (err) {
        window.PE.toast(err.message || window.PE.t('toastRegisterErr'), 4000);
        btn.disabled = false;
      }
    });
  }
});