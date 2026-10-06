/* ════════════════════════════════════════════════════════
   STATE — estado global + persistencia
   ════════════════════════════════════════════════════════ */

const USER_KEY = 'pe_user_stations';

function loadUserStations() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[state] localStorage corrupto, reseteando', e);
    try { localStorage.removeItem(USER_KEY); } catch {}
    return [];
  }
}

export const S = {
  lang:     'es',
  theme:    'day',
  ocm:      [],
  user:     loadUserStations(),
  all:      [],
  filtered: [],
  activeId: null,
  search:   '',
  province: '',
  status:   '',
  conn:     'all',

  /* Mapa */
  map:      null,
  cluster:  null,
  markerOf: {},

  /* Flujo agregar estación */
  addMode:    false,
  tempMarker: null,
  pendingLat: null,
  pendingLon: null,
};

export function saveUserStations() {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(S.user));
  } catch (e) {
    console.warn('[state] no se pudo guardar en localStorage', e);
  }
}