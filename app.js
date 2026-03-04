/* ════════════════════════════════════════════════════════
   PUNTO ELÉCTRICO CR — app.js
   Open Charge Map API — Costa Rica EV charging map
   ════════════════════════════════════════════════════════ */

const OCM_KEY  = '190289c8-6d89-4f42-97f2-57a3d608465d';
const OCM_URL  = 'https://api.openchargemap.io/v3/poi/';

const CR_CENTER = [9.9340, -84.0870];

// ── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  es: {
    appName:'Punto Eléctrico CR', statStations:'estaciones',
    statOperational:'operativas', statConnectors:'conectores',
    addStation:'Agregar', searchPh:'Buscar estación…',
    allProvinces:'Todas las provincias', allStatus:'Todos los estados',
    statusOp:'Operativo', statusPlanned:'Planeado',
    loading:'Cargando estaciones…', all:'Todos',
    addModalTitle:'Agregar Estación', addHint:'Completa los datos de la nueva estación.',
    fName:'Nombre *', fLat:'Latitud *', fLon:'Longitud *',
    fAddress:'Dirección', fProvince:'Provincia', fPoints:'Puntos de carga',
    fConnType:'Tipo de conector', fPower:'Potencia máx (kW)',
    fCost:'Costo', fNetwork:'Red / Operador', fHours:'Horario', fNotes:'Notas',
    free:'Gratuito', paid:'De pago', unknown:'Desconocido',
    cancel:'Cancelar', submitAdd:'Agregar estación',
    detailConnectors:'Conectores', detailInfo:'Información',
    detailOpenMaps:'Abrir en Google Maps',
    connPoints:'Puntos de carga', access:'Acceso', cost:'Costo',
    network:'Operador', hours:'Horario', source:'Fuente', updated:'Actualizado',
    statusOp2:'Operativo', statusPl:'Planeado',
    statusUn:'Sin verificar', statusOff:'Fuera de línea',
    userBadge:'★ Agregado por usuario',
    noResults:'Sin resultados', noResultsHint:'Intenta con otro filtro.',
    toastAdded:'✓ Estación agregada al mapa',
    toastLocating:'Localizando…',
    toastLocErr:'No se pudo obtener la ubicación',
    toastApiErr:'Error al cargar datos de la API',
    na:'N/D', freeLabel:'Gratuito', paidLabel:'De pago', unknownLabel:'Desconocido',
    publicLabel:'Público', restrictedLabel:'Restringido',
    ocmSource:'Open Charge Map', userSource:'Usuario local',
    connCount:'conectores', kw:'kW',
  },
  en: {
    appName:'Punto Eléctrico CR', statStations:'stations',
    statOperational:'operational', statConnectors:'connectors',
    addStation:'Add', searchPh:'Search station…',
    allProvinces:'All provinces', allStatus:'All statuses',
    statusOp:'Operational', statusPlanned:'Planned',
    loading:'Loading stations…', all:'All',
    addModalTitle:'Add Station', addHint:'Fill in the new station details.',
    fName:'Name *', fLat:'Latitude *', fLon:'Longitude *',
    fAddress:'Address', fProvince:'Province', fPoints:'Charging points',
    fConnType:'Connector type', fPower:'Max power (kW)',
    fCost:'Cost', fNetwork:'Network / Operator', fHours:'Hours', fNotes:'Notes',
    free:'Free', paid:'Paid', unknown:'Unknown',
    cancel:'Cancel', submitAdd:'Add station',
    detailConnectors:'Connectors', detailInfo:'Information',
    detailOpenMaps:'Open in Google Maps',
    connPoints:'Charging points', access:'Access', cost:'Cost',
    network:'Operator', hours:'Hours', source:'Source', updated:'Updated',
    statusOp2:'Operational', statusPl:'Planned',
    statusUn:'Unverified', statusOff:'Offline',
    userBadge:'★ User submitted',
    noResults:'No results', noResultsHint:'Try a different filter.',
    toastAdded:'✓ Station added to map',
    toastLocating:'Locating…',
    toastLocErr:'Could not get your location',
    toastApiErr:'Error loading API data',
    na:'N/A', freeLabel:'Free', paidLabel:'Paid', unknownLabel:'Unknown',
    publicLabel:'Public', restrictedLabel:'Restricted',
    ocmSource:'Open Charge Map', userSource:'Local user',
    connCount:'connectors', kw:'kW',
  }
};

// ── STATUS ────────────────────────────────────────────────────────────────────
function statusInfo(id) {
  if (id === 50)  return { key:'op',  cls:'d-op',  hex: null };
  if (id === 75)  return { key:'pl',  cls:'d-pl',  hex: null };
  if (id === 150) return { key:'off', cls:'d-off', hex: null };
  return { key:'un', cls:'d-un', hex: null };
}
function statusLabel(key) {
  return { op: t('statusOp2'), pl: t('statusPl'), un: t('statusUn'), off: t('statusOff') }[key] || t('statusUn');
}
function statusColor(key) {
  return { op: '#1b6b3a', pl: '#c87c0a', un: '#8a8570', off: '#c0392b' }[key] || '#8a8570';
}

// ── CONNECTOR CATEGORY ────────────────────────────────────────────────────────
function connCategory(title) {
  const t2 = title.toLowerCase();
  if (t2.includes('type 2') || t2.includes('mennekes')) return 'type2';
  if (t2.includes('type 1') || t2.includes('j1772'))    return 'type1';
  if (t2.includes('ccs'))     return 'ccs';
  if (t2.includes('chademo')) return 'chademo';
  if (t2.includes('tesla'))   return 'tesla';
  return 'other';
}

// ── STATE ─────────────────────────────────────────────────────────────────────
const S = {
  lang:    'es',
  theme:   'day',
  ocm:     [],
  user:    JSON.parse(localStorage.getItem('pe_user_stations') || '[]'),
  all:     [],
  filtered:[],
  activeId: null,
  search:  '',
  province:'',
  status:  '',
  conn:    'all',
  map:     null,
  cluster: null,
  markerOf:{},
};

// ── TILES ─────────────────────────────────────────────────────────────────────
const TILES = {
  day:   'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  night: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};
const ATTR = '&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

let tileLayer = null;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const t  = k  => T[S.lang][k] || k;
const pad = n => '#' + String(n).padStart(3,'0');

function toast(msg, ms = 3000) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}

function saveUser() {
  localStorage.setItem('pe_user_stations', JSON.stringify(S.user));
}

// ── APPLY I18N ────────────────────────────────────────────────────────────────
function applyI18n() {
  document.documentElement.lang = S.lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = T[S.lang][el.dataset.i18n];
    if (v) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const v = T[S.lang][el.dataset.i18nPh];
    if (v) el.placeholder = v;
  });
  // Re-render if data loaded
  if (S.all.length) { renderList(); if (S.activeId) { const s = S.all.find(x=>x._id===S.activeId); if(s) renderDetail(s); } }
}

// ── MAP INIT ─────────────────────────────────────────────────────────────────
function initMap() {
  S.map = L.map('map', { center: CR_CENTER, zoom: 8, zoomControl: true });

  tileLayer = L.tileLayer(TILES[S.theme], { attribution: ATTR, maxZoom: 19 });
  tileLayer.addTo(S.map);

  S.cluster = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 55,
    iconCreateFunction(cluster) {
      const n = cluster.getChildCount();
      const sz = n < 10 ? 'small' : n < 50 ? 'medium' : 'large';
      return L.divIcon({
        html: `<div><span>${n}</span></div>`,
        className: `marker-cluster marker-cluster-${sz}`,
        iconSize: L.point(40, 40),
      });
    }
  });
  S.map.addLayer(S.cluster);
}

function switchTile() {
  if (tileLayer) { S.map.removeLayer(tileLayer); }
  tileLayer = L.tileLayer(TILES[S.theme], { attribution: ATTR, maxZoom: 19 });
  tileLayer.addTo(S.map);
  tileLayer.bringToBack();
}

// ── PIN ICON ──────────────────────────────────────────────────────────────────
function pinIcon(color, emoji = '⚡') {
  return L.divIcon({
    className: '',
    html: `<div class="ev-pin" style="background:${color}"><div class="ev-pin-inner">${emoji}</div></div>`,
    iconSize:   [34, 34],
    iconAnchor: [17, 34],
    popupAnchor:[0, -36],
  });
}

// ── FETCH OCM ─────────────────────────────────────────────────────────────────
async function fetchOCM() {
  const params = new URLSearchParams({
    output: 'json', countrycode: 'CR',
    maxresults: '500', compact: 'false', verbose: 'true',
    key: OCM_KEY,
  });
  try {
    const res = await fetch(`${OCM_URL}?${params}`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    S.ocm = await res.json();
  } catch(e) {
    toast(t('toastApiErr'), 5000);
    S.ocm = [];
  }
  buildAll();
}

// ── NORMALIZE ─────────────────────────────────────────────────────────────────
function buildAll() {
  // Normalize OCM stations
  const ocm = S.ocm.map(s => {
    const info = s.AddressInfo || {};
    return {
      _id:       'ocm_' + s.ID,
      _user:     false,
      _raw:      s,
      name:      info.Title || 'Sin nombre',
      address:   [info.AddressLine1, info.Town].filter(Boolean).join(', '),
      province:  info.StateOrProvince || '',
      lat:       +info.Latitude,
      lon:       +info.Longitude,
      statusId:  s.StatusType?.ID || 0,
      points:    s.NumberOfPoints || 1,
      connections: (s.Connections || []).map(c => ({
        name:  c.ConnectionType?.Title || '—',
        kw:    c.PowerKW || null,
        cat:   connCategory(c.ConnectionType?.Title || ''),
      })),
      cost:      s.UsageCost || null,
      network:   s.OperatorInfo?.Title || null,
      hours:     s.UsageType?.IsAccessKeyRequired ? t('restrictedLabel') : null,
      updated:   s.DateLastVerified || null,
      notes:     null,
    };
  });

  // Normalize user stations
  const user = S.user.map(u => ({
    _id:       'usr_' + u.id,
    _user:     true,
    name:      u.name,
    address:   u.address || '',
    province:  u.province || '',
    lat:       +u.lat,
    lon:       +u.lon,
    statusId:  50,
    points:    +u.points || 1,
    connections: (u.connTypes || []).map(n => ({
      name: n, kw: u.power ? +u.power : null, cat: connCategory(n)
    })),
    cost:      u.cost || null,
    network:   u.network || null,
    hours:     u.hours || null,
    updated:   u.added || null,
    notes:     u.notes || null,
  }));

  S.all = [...ocm, ...user];
  updateStats();
  applyFilters();
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function updateStats() {
  const total = S.all.length;
  const op    = S.all.filter(s => s.statusId === 50).length;
  const conns = S.all.reduce((n, s) => n + s.points, 0);
  $('statTotal').textContent = total;
  $('statOp').textContent    = op;
  $('statConn').textContent  = conns;
}

// ── FILTER ────────────────────────────────────────────────────────────────────
function applyFilters() {
  const q = S.search.toLowerCase();
  S.filtered = S.all.filter(s => {
    if (!s.lat || !s.lon) return false;
    if (q && !s.name.toLowerCase().includes(q) && !s.address.toLowerCase().includes(q)) return false;
    if (S.province && s.province !== S.province) return false;
    if (S.status) {
      const sid = statusInfo(s.statusId).key;
      if (S.status === '50' && sid !== 'op')  return false;
      if (S.status === '75' && sid !== 'pl')  return false;
    }
    if (S.conn !== 'all') {
      if (!s.connections.some(c => c.cat === S.conn)) return false;
    }
    return true;
  });
  renderList();
  renderMarkers();
}

// ── LIST ──────────────────────────────────────────────────────────────────────
function renderList() {
  const el = $('stationList');
  if (!S.filtered.length) {
    el.innerHTML = `<div class="no-results"><strong>${t('noResults')}</strong>${t('noResultsHint')}</div>`;
    return;
  }
  el.innerHTML = S.filtered.map(s => {
    const st  = statusInfo(s.statusId);
    const maxKw = Math.max(0, ...s.connections.map(c => c.kw || 0));
    const connNames = [...new Set(s.connections.map(c => c.name))].slice(0,3);
    return `
      <div class="st-item${S.activeId===s._id?' active':''}" data-id="${s._id}">
        <div class="st-dot ${st.cls}"></div>
        <div class="st-info">
          <div class="st-name">${s.name}</div>
          <div class="st-addr">${s.address || s.province || '—'}</div>
          <div class="st-tags">
            ${s.province ? `<span class="stag">${s.province}</span>` : ''}
            ${s.points   ? `<span class="stag stag-g">${s.points} ${t('connCount')}</span>` : ''}
            ${maxKw      ? `<span class="stag stag-g">${maxKw}${t('kw')}</span>` : ''}
            ${connNames.map(n=>`<span class="stag">${n}</span>`).join('')}
            ${s._user    ? `<span class="stag stag-a">★</span>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  el.querySelectorAll('.st-item').forEach(el => {
    el.addEventListener('click', () => select(el.dataset.id));
  });
}

// ── MARKERS ───────────────────────────────────────────────────────────────────
function renderMarkers() {
  S.cluster.clearLayers();
  S.markerOf = {};
  S.filtered.forEach(s => {
    const st    = statusInfo(s.statusId);
    const color = s._user ? '#c87c0a' : statusColor(st.key);
    const emoji = s._user ? '★' : '⚡';
    const m = L.marker([s.lat, s.lon], { icon: pinIcon(color, emoji) });
    m.on('click', () => select(s._id));
    S.cluster.addLayer(m);
    S.markerOf[s._id] = m;
  });
}

// ── SELECT ────────────────────────────────────────────────────────────────────
function select(id) {
  S.activeId = id;
  document.querySelectorAll('.st-item').forEach(el =>
    el.classList.toggle('active', el.dataset.id === id)
  );
  const item = document.querySelector(`.st-item[data-id="${id}"]`);
  if (item) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

  const m = S.markerOf[id];
  if (m) S.map.flyTo(m.getLatLng(), 15, { duration: .8 });

  const s = S.all.find(x => x._id === id);
  if (s) renderDetail(s);
}

// ── DETAIL ────────────────────────────────────────────────────────────────────
function renderDetail(s) {
  const panel = $('detailPanel');
  const body  = $('detailBody');
  const st    = statusInfo(s.statusId);
  const color = statusColor(st.key);
  const label = statusLabel(st.key);
  const maxKw = Math.max(0, ...s.connections.map(c => c.kw || 0));

  const connHtml = s.connections.length
    ? s.connections.map(c => `
        <div class="d-conn-row">
          <span class="d-conn-name">${c.name}</span>
          <span class="d-conn-kw">${c.kw ? c.kw + ' ' + t('kw') : t('na')}</span>
        </div>`).join('')
    : `<div class="d-conn-row"><span class="d-conn-name">${t('na')}</span></div>`;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lon}`;

  const updatedStr = s.updated
    ? new Date(s.updated).toLocaleDateString(S.lang === 'es' ? 'es-CR' : 'en-US')
    : t('na');

  const costStr = s.cost || t('unknownLabel');
  const networkStr = s.network || t('na');
  const hoursStr   = s.hours || '24/7';
  const sourceStr  = s._user ? t('userSource') : t('ocmSource');

  body.innerHTML = `
    <div class="d-status-row">
      <div class="d-status-dot" style="background:${color}"></div>
      <span class="d-status-txt" style="color:${color}">${label}</span>
      ${s._user ? `<span class="d-user-badge">${t('userBadge')}</span>` : ''}
    </div>
    <div class="d-name">${s.name}</div>
    <div class="d-addr">${s.address}${s.province ? ' · ' + s.province : ''}</div>

    <div class="d-section">
      <div class="d-label">${t('detailConnectors')}</div>
      <div class="d-grid" style="margin-bottom:.6rem">
        <div class="d-metric">
          <div class="d-metric-val">${s.points}</div>
          <div class="d-metric-key">${t('connPoints')}</div>
        </div>
        <div class="d-metric">
          <div class="d-metric-val">${maxKw ? maxKw + ' ' + t('kw') : t('na')}</div>
          <div class="d-metric-key">Potencia máx</div>
        </div>
      </div>
      <div class="d-conn-list">${connHtml}</div>
    </div>

    <div class="d-section">
      <div class="d-label">${t('detailInfo')}</div>
      <div class="d-info-list">
        <div class="d-info-row"><span class="d-info-key">${t('cost')}</span><span class="d-info-val">${costStr}</span></div>
        <div class="d-info-row"><span class="d-info-key">${t('network')}</span><span class="d-info-val">${networkStr}</span></div>
        <div class="d-info-row"><span class="d-info-key">${t('hours')}</span><span class="d-info-val">${hoursStr}</span></div>
        ${s.notes ? `<div class="d-info-row"><span class="d-info-key">Notas</span><span class="d-info-val">${s.notes}</span></div>` : ''}
        <div class="d-info-row"><span class="d-info-key">${t('source')}</span><span class="d-info-val">${sourceStr}</span></div>
        <div class="d-info-row"><span class="d-info-key">${t('updated')}</span><span class="d-info-val">${updatedStr}</span></div>
      </div>
    </div>

    <a href="${mapsUrl}" target="_blank" rel="noopener" class="d-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      ${t('detailOpenMaps')}
    </a>
  `;

  panel.classList.add('open');
}

// ── ADD STATION ───────────────────────────────────────────────────────────────
function openModal() {
  $('modalOverlay').classList.add('open');
  $('modalOverlay').setAttribute('aria-hidden','false');
}
function closeModal() {
  $('modalOverlay').classList.remove('open');
  $('modalOverlay').setAttribute('aria-hidden','true');
}

$('addForm').addEventListener('submit', e => {
  e.preventDefault();
  const connTypes = [...document.querySelectorAll('.check-group input:checked')].map(c => c.value);
  const entry = {
    id:       Date.now(),
    name:     $('f_name').value.trim(),
    lat:      parseFloat($('f_lat').value),
    lon:      parseFloat($('f_lon').value),
    address:  $('f_address').value.trim(),
    province: $('f_province').value,
    points:   parseInt($('f_points').value) || 1,
    connTypes,
    power:    $('f_power').value || null,
    cost:     $('f_cost').value,
    network:  $('f_network').value.trim(),
    hours:    $('f_hours').value.trim(),
    notes:    $('f_notes').value.trim(),
    added:    new Date().toISOString(),
  };

  if (!entry.name || isNaN(entry.lat) || isNaN(entry.lon)) return;

  S.user.push(entry);
  saveUser();
  buildAll();
  closeModal();
  toast(t('toastAdded'));
  $('addForm').reset();

  // Auto-select the new station
  setTimeout(() => {
    const id = 'usr_' + entry.id;
    select(id);
  }, 400);
});

// ── LOCATE ────────────────────────────────────────────────────────────────────
function locate() {
  toast(t('toastLocating'));
  navigator.geolocation.getCurrentPosition(
    pos => {
      S.map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { duration: 1 });
    },
    () => toast(t('toastLocErr'), 4000)
  );
}

// ── THEME TOGGLE ──────────────────────────────────────────────────────────────
function toggleTheme() {
  S.theme = S.theme === 'day' ? 'night' : 'day';
  document.documentElement.setAttribute('data-theme', S.theme);
  switchTile();
}

// ── LANG TOGGLE ───────────────────────────────────────────────────────────────
function toggleLang() {
  S.lang = S.lang === 'es' ? 'en' : 'es';
  document.documentElement.setAttribute('data-lang', S.lang);
  applyI18n();
}

// ── FILTER EVENTS ─────────────────────────────────────────────────────────────
function initFilters() {
  let searchTimer;
  $('searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { S.search = e.target.value.trim(); applyFilters(); }, 220);
  });
  $('filterProvince').addEventListener('change', e => { S.province = e.target.value; applyFilters(); });
  $('filterStatus').addEventListener('change',   e => { S.status   = e.target.value; applyFilters(); });
  document.querySelectorAll('.conn-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.conn-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.conn = btn.dataset.conn;
      applyFilters();
    });
  });
}

// ── SIDEBAR TOGGLE ────────────────────────────────────────────────────────────
function initSidebar() {
  $('fabSidebar').addEventListener('click', () => {
    $('sidebar').classList.toggle('hidden');
    S.map.invalidateSize();
  });
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initFilters();
  initSidebar();

  // Show initial loading state
  $('stationList').innerHTML = `<div class="list-state" id="listLoading"><div class="spin-ring"></div><p>${t('loading')}</p></div>`;

  // Top bar buttons
  $('btnAdd').addEventListener('click', openModal);
  $('btnLocate').addEventListener('click', locate);
  $('btnTheme').addEventListener('click', toggleTheme);
  $('btnLang').addEventListener('click', toggleLang);
  $('modalClose').addEventListener('click', closeModal);
  $('btnCancelForm').addEventListener('click', closeModal);
  $('modalOverlay').addEventListener('click', e => { if (e.target === $('modalOverlay')) closeModal(); });
  $('detailClose').addEventListener('click', () => {
    $('detailPanel').classList.remove('open');
    S.activeId = null;
    document.querySelectorAll('.st-item').forEach(el => el.classList.remove('active'));
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); $('detailPanel').classList.remove('open'); }
    if (e.key === '/' && document.activeElement !== $('searchInput')) {
      e.preventDefault(); $('searchInput').focus();
    }
  });

  // Load data
  fetchOCM();
});
