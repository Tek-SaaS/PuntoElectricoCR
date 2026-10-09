/* home.js — carga news.json y renderiza cards */
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('newsGrid');
  const lang = window.PE.getLang();

  try {
    const res = await fetch('assets/data/news.json');
    const data = await res.json();
    const items = data.items || [];

    if (!items.length) {
      grid.innerHTML = '<div class="news-loading">Sin novedades por ahora.</div>';
      return;
    }

    grid.innerHTML = items.map(n => `
      <a class="news-card" href="#">
        <span class="news-tag">${n.tag}</span>
        <h2 class="news-title">${n.title}</h2>
        <p class="news-excerpt">${n.excerpt}</p>
        <span class="news-date">${new Date(n.date).toLocaleDateString(lang === 'es' ? 'es-CR' : 'en-US', { year:'numeric', month:'long', day:'numeric' })}</span>
      </a>
    `).join('');
  } catch (e) {
    console.error(e);
    grid.innerHTML = '<div class="news-loading">No se pudieron cargar las novedades.</div>';
  }
});