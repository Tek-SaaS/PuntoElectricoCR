/* profile.js — muestra datos del usuario logueado */
document.addEventListener('DOMContentLoaded', () => {
  if (!window.PE.isLoggedIn()) {
    location.href = 'login.html?next=perfil.html';
    return;
  }
  const user = window.PE.getUser();
  const initial = (user.name || user.email || '?').charAt(0).toUpperCase();

  document.getElementById('profileAvatar').textContent = initial;
  document.getElementById('profileName').textContent = user.name || user.email;
  document.getElementById('profileEmail').textContent = user.email;

  // Estaciones locales guardadas en este navegador
  const localStations = JSON.parse(localStorage.getItem('pe_user_stations') || '[]');
  const el = document.getElementById('myStations');
  if (!localStations.length) {
    el.textContent = 'Aún no has agregado estaciones.';
  } else {
    el.innerHTML = localStations.map(s => `
      <div style="padding:.6rem .8rem; background:var(--surface2); border:1px solid var(--border); border-radius:9px;">
        <strong style="color:var(--text)">${s.name}</strong>
        <div style="font-size:.78rem; color:var(--text-3); margin-top:.15rem;">${s.address || s.province || '—'}</div>
      </div>
    `).join('');
  }
});