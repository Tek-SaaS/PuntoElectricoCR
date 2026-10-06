/* ════════════════════════════════════════════════════════
   UTILS — helpers puros sin estado
   ════════════════════════════════════════════════════════ */

export const $ = (id) => document.getElementById(id);

/* Distancia Haversine en km */
export function distKm(la1, lo1, la2, lo2) {
  const R = 6371;
  const dLa = (la2 - la1) * Math.PI / 180;
  const dLo = (lo2 - lo1) * Math.PI / 180;
  const a =
    Math.sin(dLa / 2) ** 2 +
    Math.cos(la1 * Math.PI / 180) *
    Math.cos(la2 * Math.PI / 180) *
    Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* Escape HTML — usar antes de innerHTML (Fase 1) */
export function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

/* Normaliza para búsqueda: minúsculas + sin acentos */
export function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/* Debounce */
export function debounce(fn, ms = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* Status OCM → key + clase CSS */
export function statusInfo(id) {
  if (id === 50)  return { key: 'op',  cls: 'd-op' };
  if (id === 75)  return { key: 'pl',  cls: 'd-pl' };
  if (id === 150) return { key: 'off', cls: 'd-off' };
  return { key: 'un', cls: 'd-un' };
}

/* Categoría de conector desde el título OCM */
export function connCategory(title) {
  const s = String(title || '').toLowerCase();
  if (s.includes('type 2') || s.includes('mennekes')) return 'type2';
  if (s.includes('type 1') || s.includes('j1772'))    return 'type1';
  if (s.includes('ccs'))     return 'ccs';
  if (s.includes('chademo')) return 'chademo';
  if (s.includes('tesla'))   return 'tesla';
  return 'other';
}

/* Pin Leaflet con color y emoji */
export function pinIcon(color, emoji = '⚡') {
  return L.divIcon({
    className: '',
    html: `<div class="ev-pin" style="background:${color}"><div class="ev-pin-inner">${emoji}</div></div>`,
    iconSize:    [34, 34],
    iconAnchor:  [17, 34],
    popupAnchor: [0, -36],
  });
}