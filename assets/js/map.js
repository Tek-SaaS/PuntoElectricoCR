/* ════════════════════════════════════════════════════════
   PUNTO ELÉCTRICO CR — map.js
   Lógica completa del mapa. Usa shared.js para auth, tema e i18n.
   ════════════════════════════════════════════════════════ */

const { toast, API_URL, ENV } = window.PE;

const CR_CENTER = [9.9340, -84.0870];

/* ── DATASET LOCAL CR ─────────────────────────────────── */
const LOCAL_CR = [
  { id: 'lcr_001', name: 'ICE Centro Nacional - La Sabana', address: 'Sabana Norte, San José', province: 'San José', lat: 9.9387, lon: -84.1050, status: 50, points: 4, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }, { name: 'CCS (Type 2)', kw: 50 }], cost: 'De pago', network: 'ICE', hours: 'L-V 7:00-17:00' },
  { id: 'lcr_002', name: 'JASEC - Cartago Centro', address: 'Frente al estadio, Cartago', province: 'Cartago', lat: 9.8643, lon: -83.9191, status: 50, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }, { name: 'CCS (Type 2)', kw: 50 }], cost: 'De pago', network: 'JASEC', hours: '24/7' },
  { id: 'lcr_003', name: 'Multiplaza Escazú', address: 'Escazú, San José', province: 'San José', lat: 9.9180, lon: -84.1417, status: 50, points: 4, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }, { name: 'CCS (Type 2)', kw: 50 }, { name: 'CHAdeMO', kw: 50 }], cost: 'De pago', network: 'EV Connect', hours: '7:00-22:00' },
  { id: 'lcr_004', name: 'Mall San Pedro', address: 'San Pedro de Montes de Oca, San José', province: 'San José', lat: 9.9349, lon: -84.0490, status: 50, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }, { name: 'CCS (Type 2)', kw: 50 }], cost: 'De pago', network: 'Privado', hours: '9:00-21:00' },
  { id: 'lcr_005', name: 'Aeropuerto Juan Santamaría', address: 'Terminal de pasajeros, Alajuela', province: 'Alajuela', lat: 9.9983, lon: -84.2088, status: 50, points: 3, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }, { name: 'CCS (Type 2)', kw: 50 }], cost: 'De pago', network: 'ICE', hours: '24/7' },
  { id: 'lcr_006', name: 'CNFL - Ave 10 San José', address: 'Av 10, San José Centro', province: 'San José', lat: 9.9305, lon: -84.0751, status: 50, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }], cost: 'De pago', network: 'CNFL', hours: 'L-V 7:00-17:00' },
  { id: 'lcr_007', name: 'Walmart Tibás', address: 'Tibás, San José', province: 'San José', lat: 9.9675, lon: -84.0770, status: 50, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }, { name: 'CCS (Type 2)', kw: 50 }], cost: 'De pago', network: 'Privado', hours: '7:00-22:00' },
  { id: 'lcr_008', name: 'Universidad de Costa Rica', address: 'Ciudad Universitaria Rodrigo Facio, San Pedro', province: 'San José', lat: 9.9373, lon: -84.0510, status: 50, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 7.4 }], cost: 'Gratuito', network: 'UCR', hours: 'L-V 7:00-20:00' },
  { id: 'lcr_009', name: 'ICE Liberia - Guanacaste', address: 'Liberia, Guanacaste', province: 'Guanacaste', lat: 10.6338, lon: -85.4365, status: 50, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }, { name: 'CCS (Type 2)', kw: 50 }], cost: 'De pago', network: 'ICE', hours: 'L-V 7:00-17:00' },
  { id: 'lcr_010', name: 'Automercado La Colonia Tres Ríos', address: 'Tres Ríos, Cartago', province: 'Cartago', lat: 9.8996, lon: -83.9958, status: 50, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }, { name: 'CCS (Type 2)', kw: 50 }], cost: 'De pago', network: 'Privado', hours: '8:00-20:00' },
  { id: 'lcr_011', name: 'La Colonia Heredia', address: 'Centro de Heredia', province: 'Heredia', lat: 9.9985, lon: -84.1169, status: 50, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }], cost: 'De pago', network: 'Privado', hours: '8:00-20:00' },
  { id: 'lcr_012', name: 'ICE Puerto Limón', address: 'Limón Centro', province: 'Limón', lat: 10.0037, lon: -83.0780, status: 50, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }, { name: 'CCS (Type 2)', kw: 50 }], cost: 'De pago', network: 'ICE', hours: 'L-V 7:00-17:00' },
  { id: 'lcr_013', name: 'Multiplaza del Este', address: 'Curridabat, San José', province: 'San José', lat: 9.9108, lon: -84.0230, status: 50, points: 4, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }, { name: 'CCS (Type 2)', kw: 50 }, { name: 'CHAdeMO', kw: 50 }], cost: 'De pago', network: 'EV Connect', hours: '10:00-21:00' },
  { id: 'lcr_014', name: 'Puntarenas Puerto - INCOP', address: 'Puntarenas Centro', province: 'Puntarenas', lat: 9.9789, lon: -84.8346, status: 75, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 22 }], cost: 'De pago', network: 'ICE', hours: 'L-V 7:00-17:00' },
  { id: 'lcr_015', name: 'TEC Cartago - Campus Central', address: 'Cartago, Instituto Tecnológico', province: 'Cartago', lat: 9.8561, lon: -83.9143, status: 50, points: 2, connections: [{ name: 'Type 2 (Mennekes)', kw: 7.4 }], cost: 'Gratuito', network: 'TEC', hours: 'L-V 7:00-21:00' },
];

/* ── TRANSLATIONS (solo para el mapa) ─────────────────── */
const T = {
  es: {
    statStations:'estaciones', statOperational:'operativas', statConnectors:'conectores',
    searchPh:'Buscar estación…', allProvinces:'Todas las provincias', allStatus:'Todos los estados',
    statusOp:'Operativo', statusPlanned:'Planeado', loading:'Cargando estaciones…', all:'Todos',
    addModalTitle:'Agregar Estación',
    placementHint:'Toca el mapa para marcar la ubicación',
    fName:'Nombre *', fAddress:'Dirección', fProvince:'Provincia', fPoints:'Puntos de carga',
    fConnType:'Tipo de conector', fPower:'Potencia máx (kW)',
    fCost:'Costo', fNetwork:'Red / Operador', fNotes:'Notas',
    free:'Gratuito', paid:'De pago', unknown:'Desconocido',
    cancel:'Cancelar', submitAdd:'Agregar estación',
    detailConnectors:'Conectores', detailInfo:'Información',
    detailOpenMaps:'Abrir en Google Maps',
    connPoints:'Puntos de carga', cost:'Costo', network:'Operador', hours:'Horario',
    source:'Fuente', updated:'Actualizado',
    statusOp2:'Operativo', statusPl:'Planeado', statusUn:'Sin verificar', statusOff:'Fuera de línea',
    userBadge:'★ Agregado por usuario',
    noResults:'Sin resultados', noResultsHint:'Intenta con otro filtro.',
    toastAdded:'✓ Estación agregada al mapa',
    toastLocating:'Localizando…', toastLocErr:'No se pudo obtener la ubicación',
    toastApiErr:'Error al cargar API — usando datos locales',
    toastPinSet:'📍 Ubicación marcada — completa los datos',
    toastSelectPoint:'📍 Toca el mapa para marcar la ubicación',
    na:'N/D', unknownLabel:'Desconocido', restrictedLabel:'Restringido',
    ocmSource:'Open Charge Map', userSource:'Usuario', localSource:'Base CR Local',
    mergedSource:'Fusionado',
    connCount:'conectores', kw:'kW',
    toastLoginRequired:'Inicia sesión para guardar tu aporte en la nube',
  },
  en: {
    statStations:'stations', statOperational:'operational', statConnectors:'connectors',
    searchPh:'Search station…', allProvinces:'All provinces', allStatus:'All statuses',
    statusOp:'Operational', statusPlanned:'Planned', loading:'Loading stations…', all:'All',
    addModalTitle:'Add Station',
    placementHint:'Tap the map to mark the location',
    fName:'Name *', fAddress:'Address', fProvince:'Province', fPoints:'Charging points',
    fConnType:'Connector type', fPower:'Max power (kW)',
    fCost:'Cost', fNetwork:'Network / Operator', fNotes:'Notes',
    free:'Free', paid:'Paid', unknown:'Unknown',
    cancel:'Cancel', submitAdd:'Add station',
    detailConnectors:'Connectors', detailInfo:'Information',
    detailOpenMaps:'Open in Google Maps',
    connPoints:'Charging points', cost:'Cost', network:'Operator', hours:'Hours',
    source:'Source', updated:'Updated',
    statusOp2:'Operational', statusPl:'Planned', statusUn:'Unverified', statusOff:'Offline',
    userBadge:'★ User submitted',
    noResults:'No results', noResultsHint:'Try a different filter.',
    toastAdded:'✓ Station added to map',
    toastLocating:'Locating…', toastLocErr:'Could not get your location',
    toastApiErr:'API error — using local data',
    toastPinSet:'📍 Location set — fill in the details',
    toastSelectPoint:'📍 Tap the map to mark the location',
    na:'N/A', unknownLabel:'Unknown', restrictedLabel:'Restricted',
    ocmSource:'Open Charge Map', userSource:'User', localSource:'CR Local DB',
    mergedSource:'Merged',
    connCount:'connectors', kw:'kW',
    toastLoginRequired:'Sign in to save your contribution to the cloud',
  }
};

/* ── STATE ───────────────────────────────────────────── */
const S = {
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
  addMode:    false,
  tempMarker: null,
  pendingLat: null,
  pendingLon: null,
};

const TILES = {
  day:   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  night: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
let tileLayer = null;

/* ── HELPERS ─────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const t  = k  => (T[window.PE.getLang()] && T[window.PE.getLang()][k]) || k;
const lang = () => window.PE.getLang();

function saveUser() {
  localStorage.setItem('pe_user_stations', JSON.stringify(S.user));
}

/* ── STATUS ──────────────────────────────────────────── */
function statusInfo(id) {
  if (id === 50)  return { key:'op',  cls:'d-op' };
  if (id === 75)  return { key:'pl',  cls:'d-pl' };
  if (id === 150) return { key:'off', cls:'d-off' };
  return { key:'un', cls:'d-un' };
}
function statusLabel(key) {
  return { op: t('statusOp2'), pl: t('statusPl'), un: t('statusUn'), off: t('statusOff') }[key] || t('statusUn');
}
function statusColor(key) {
  return { op: '#1b6b3a', pl: '#c87c0a', un: '#8a8570', off: '#c0392b' }[key] || '#8a8570';
}

function connCategory(title) {
  const s = title.toLowerCase();
  if (s.includes('type 2') || s.includes('mennekes')) return 'type2';
  if (s.includes('type 1') || s.includes('j1772'))    return 'type1';
  if (s.includes('ccs'))     return 'ccs';
  if (s.includes('chademo')) return 'chademo';
  if (s.includes('tesla'))   return 'tesla';
  return 'other';
}

/* ── MOBILE HELPERS ──────────────────────────────────── */
function isMobile() {
  return window.matchMedia('(max-width: 900px)').matches;
}

function updateLayoutClass() {
  const layout = $('layout');
  if ($('sidebar').classList.contains('hidden')) layout.classList.add('sidebar-collapsed');
  else layout.classList.remove('sidebar-collapsed');
}

function closeDetailPanel() {
  $('detailPanel').classList.remove('open');
  S.activeId = null;
  document.querySelectorAll('.st-item').forEach(el => el.classList.remove('active'));
}

function openSidebar() {
  $('sidebar').classList.remove('hidden');
  if (isMobile()) $('sidebarBackdrop').classList.add('visible');
  updateLayoutClass();
  setTimeout(() => S.map && S.map.invalidateSize(), 400);
}
function closeSidebar() {
  $('sidebar').classList.add('hidden');
  $('sidebarBackdrop').classList.remove('visible');
  updateLayoutClass();
  setTimeout(() => S.map && S.map.invalidateSize(), 400);
}
function toggleSidebar() {
  if ($('sidebar').classList.contains('hidden')) openSidebar();
  else closeSidebar();
}

/* ── DISTANCE ────────────────────────────────────────── */
function distKm(la1, lo1, la2, lo2) {
  const R = 6371, dLa = (la2-la1)*Math.PI/180, dLo = (lo2-lo1)*Math.PI/180;
  const a = Math.sin(dLa/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ── APLICAR TRADUCCIONES AL DOM ─────────────────────── */
function applyMapI18n() {
  // Buscar elementos con data-i18n cuyo texto esté en T de map.js
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.dataset.i18n);
    if (v && v !== el.dataset.i18n) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const v = t(el.dataset.i18nPh);
    if (v) el.placeholder = v;
  });
  // Re-render lista y detalle con el nuevo idioma
  if (S.all.length) {
    renderList();
    if (S.activeId) {
      const s = S.all.find(x => x._id === S.activeId);
      if (s) renderDetail(s);
    }
  }
}

/* ── MAP INIT ────────────────────────────────────────── */
function initMap() {
  S.map = L.map('map', {
    center: CR_CENTER,
    zoom: 8,
    zoomControl: false,
    minZoom: 7,
    maxBounds: [[7.0, -88.0], [12.5, -81.5]],
    maxBoundsViscosity: 1.0,
  });
  tileLayer = L.tileLayer(TILES[S.theme], { attribution: ATTR, maxZoom: 19 });
  tileLayer.addTo(S.map);

  L.control.zoom({ position: 'bottomright' }).addTo(S.map);

  S.cluster = L.markerClusterGroup({
    chunkedLoading: true, maxClusterRadius: 55,
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

  S.map.on('dragstart', () => {
    if (isMobile() && S.activeId) closeDetailPanel();
  });

  S.map.on('click', e => {
    if (S.addMode) {
      const { lat, lng } = e.latlng;
      S.pendingLat = lat;
      S.pendingLon = lng;

      if (S.tempMarker) S.map.removeLayer(S.tempMarker);

      S.tempMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: `<div class="ev-pin ev-pin-temp" style="background:#f0b429"><div class="ev-pin-inner">📍</div></div>`,
          iconSize:   [34, 34],
          iconAnchor: [17, 34],
        }),
        zIndexOffset: 9999,
      }).addTo(S.map);

      $('coordsPillText').textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      $('addForm').querySelector('.btn-pri').disabled = false;

      hidePlacementBanner();
      openModal();
      toast(t('toastPinSet'));
      return;
    }
    if (S.activeId) closeDetailPanel();
  });
}

function pinIcon(color, emoji = '⚡') {
  return L.divIcon({
    className: '',
    html: `<div class="ev-pin" style="background:${color}"><div class="ev-pin-inner">${emoji}</div></div>`,
    iconSize:   [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -36],
  });
}

/* ── FETCH backend ───────────────────────────────────── */
async function fetchOCM() {
  try {
    const res = await fetch(`${API_URL}/api/estaciones`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    S.ocm = await res.json();
    console.log(`✅ ${S.ocm.length} estaciones cargadas desde el backend (${ENV})`);
  } catch (e) {
    console.warn('Error al cargar desde el backend:', e);
    toast(t('toastApiErr'), 5000);
    S.ocm = [];
  }
  buildAll();
}

/* ── NORMALIZE + MERGE ───────────────────────────────── */
function buildAll() {
  const ocmList = S.ocm.map(s => {
    const info = s.AddressInfo || {};
    return {
      _id:      'ocm_' + s.ID,
      _source:  'ocm',
      _user:    false,
      name:     info.Title || 'Sin nombre',
      address:  [info.AddressLine1, info.Town].filter(Boolean).join(', '),
      province: info.StateOrProvince || '',
      lat:      +info.Latitude,
      lon:      +info.Longitude,
      statusId: s.StatusType?.ID || 0,
      points:   s.NumberOfPoints || 1,
      connections: (s.Connections || []).map(c => ({
        name: c.ConnectionType?.Title || '—',
        kw:   c.PowerKW || null,
        cat:  connCategory(c.ConnectionType?.Title || ''),
      })),
      cost:    s.UsageCost || null,
      network: s.OperatorInfo?.Title || null,
      hours:   s.UsageType?.IsAccessKeyRequired ? t('restrictedLabel') : null,
      updated: s.DateLastVerified || null,
      notes:   null,
      _sources: ['ocm'],
    };
  });

  const localList = LOCAL_CR.map(s => ({
    _id:      s.id,
    _source:  'local_cr',
    _user:    false,
    name:     s.name,
    address:  s.address || '',
    province: s.province || '',
    lat:      s.lat,
    lon:      s.lon,
    statusId: s.status || 50,
    points:   s.points || 1,
    connections: (s.connections || []).map(c => ({
      name: c.name, kw: c.kw || null, cat: connCategory(c.name),
    })),
    cost:    s.cost || null,
    network: s.network || null,
    hours:   s.hours || null,
    updated: null,
    notes:   null,
    _sources: ['local_cr'],
  }));

  const userList = S.user.map(u => ({
    _id:      'usr_' + u.id,
    _source:  'user',
    _user:    true,
    name:     u.name,
    address:  u.address || '',
    province: u.province || '',
    lat:      +u.lat,
    lon:      +u.lon,
    statusId: 50,
    points:   +u.points || 1,
    connections: (u.connTypes || []).map(n => ({
      name: n, kw: u.power ? +u.power : null, cat: connCategory(n),
    })),
    cost:    u.cost || null,
    network: u.network || null,
    hours:   u.hours || null,
    updated: u.added || null,
    notes:   u.notes || null,
    _sources: ['user'],
  }));

  const ENRICH_RADIUS = 0.15;
  const enriched = ocmList.map(ocm => {
    const nearby = localList.find(loc =>
      distKm(ocm.lat, ocm.lon, loc.lat, loc.lon) < ENRICH_RADIUS
    );
    if (!nearby) return ocm;

    const e = { ...ocm, _sources: ['ocm', 'local_cr'] };
    if (!e.network  && nearby.network)  e.network  = nearby.network;
    if (!e.cost     && nearby.cost)     e.cost     = nearby.cost;
    if (!e.hours    && nearby.hours)    e.hours    = nearby.hours;
    if (!e.address  && nearby.address)  e.address  = nearby.address;
    if (!e.province && nearby.province) e.province = nearby.province;
    if (nearby.points > e.points)       e.points   = nearby.points;
    nearby.connections.forEach(conn => {
      if (!e.connections.find(c => c.name === conn.name)) {
        e.connections.push(conn);
      }
    });
    return e;
  });

  const localGaps = localList.filter(loc =>
    !ocmList.some(ocm => distKm(loc.lat, loc.lon, ocm.lat, ocm.lon) < ENRICH_RADIUS)
  );

  S.all = [...enriched, ...localGaps, ...userList].filter(s => s.lat && s.lon);
  updateStats();
  applyFilters();
}

function updateStats() {
  const elTotal = $('statTotal');
  const elOp    = $('statOp');
  const elConn  = $('statConn');
  if (elTotal) elTotal.textContent = S.all.length;
  if (elOp)    elOp.textContent    = S.all.filter(s => s.statusId === 50).length;
  if (elConn)  elConn.textContent  = S.all.reduce((n, s) => n + s.points, 0);
}

/* ── FILTER ──────────────────────────────────────────── */
function applyFilters() {
  const q = S.search.toLowerCase();
  S.filtered = S.all.filter(s => {
    if (q && !s.name.toLowerCase().includes(q) && !s.address.toLowerCase().includes(q)) return false;
    if (S.province && s.province !== S.province) return false;
    if (S.status) {
      const key = statusInfo(s.statusId).key;
      if (S.status === '50' && key !== 'op') return false;
      if (S.status === '75' && key !== 'pl') return false;
    }
    if (S.conn !== 'all' && !s.connections.some(c => c.cat === S.conn)) return false;
    return true;
  });
  renderList();
  renderMarkers();
}

/* ── LIST ────────────────────────────────────────────── */
function renderList() {
  const el = $('stationList');
  if (!S.filtered.length) {
    el.innerHTML = `<div class="no-results"><strong>${t('noResults')}</strong>${t('noResultsHint')}</div>`;
    return;
  }
  el.innerHTML = S.filtered.map(s => {
    const st    = statusInfo(s.statusId);
    const maxKw = Math.max(0, ...s.connections.map(c => c.kw || 0));
    const connNames = [...new Set(s.connections.map(c => c.name))].slice(0, 3);
    const isMerged = s._sources && s._sources.length > 1;
    return `
      <div class="st-item${S.activeId === s._id ? ' active' : ''}" data-id="${s._id}">
        <div class="st-dot ${st.cls}"></div>
        <div class="st-info">
          <div class="st-name">${s.name}</div>
          <div class="st-addr">${s.address || s.province || '—'}</div>
          <div class="st-tags">
            ${s.province   ? `<span class="stag">${s.province}</span>` : ''}
            ${s.points     ? `<span class="stag stag-g">${s.points} ${t('connCount')}</span>` : ''}
            ${maxKw        ? `<span class="stag stag-g">${maxKw}${t('kw')}</span>` : ''}
            ${connNames.map(n => `<span class="stag">${n}</span>`).join('')}
            ${s._user      ? `<span class="stag stag-a">★</span>` : ''}
            ${isMerged     ? `<span class="stag" title="Datos fusionados">🔗</span>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  el.querySelectorAll('.st-item').forEach(item =>
    item.addEventListener('click', () => select(item.dataset.id))
  );
}

/* ── MARKERS ─────────────────────────────────────────── */
function renderMarkers() {
  S.cluster.clearLayers();
  S.markerOf = {};
  S.filtered.forEach(s => {
    const st    = statusInfo(s.statusId);
    const color = s._user ? '#c87c0a' : statusColor(st.key);
    const emoji = s._user ? '★' : '⚡';
    const m     = L.marker([s.lat, s.lon], { icon: pinIcon(color, emoji) });
    m.on('click', ev => {
      if (ev && ev.originalEvent && L.DomEvent) L.DomEvent.stopPropagation(ev);
      select(s._id);
    });
    S.cluster.addLayer(m);
    S.markerOf[s._id] = m;
  });
}

/* ── SELECT ──────────────────────────────────────────── */
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

/* ── DETAIL ──────────────────────────────────────────── */
function renderDetail(s) {
  const body  = $('detailBody');
  const st    = statusInfo(s.statusId);
  const color = statusColor(st.key);
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
    ? new Date(s.updated).toLocaleDateString(lang() === 'es' ? 'es-CR' : 'en-US')
    : t('na');

  const sourceLabels = {
    ocm: t('ocmSource'), local_cr: t('localSource'), user: t('userSource'),
  };
  let sourceStr;
  if (s._sources && s._sources.length > 1) {
    const unique = [...new Set(s._sources)];
    sourceStr = `${t('mergedSource')}: ${unique.map(k => sourceLabels[k] || k).join(' + ')}`;
  } else {
    sourceStr = sourceLabels[s._source] || t('ocmSource');
  }

  body.innerHTML = `
    <div class="d-status-row">
      <div class="d-status-dot" style="background:${color}"></div>
      <span class="d-status-txt" style="color:${color}">${statusLabel(st.key)}</span>
    </div>
    ${s._user ? `<span class="d-user-badge">${t('userBadge')}</span>` : ''}
    <div class="d-name">${s.name}</div>
    <div class="d-addr">${s.address}${s.province ? ' · ' + s.province : ''}</div>

    <div class="d-section">
      <div class="d-label">${t('detailConnectors')}</div>
      <div class="d-grid" style="margin-bottom:.5rem">
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
        <div class="d-info-row"><span class="d-info-key">${t('cost')}</span><span class="d-info-val">${s.cost || t('unknownLabel')}</span></div>
        <div class="d-info-row"><span class="d-info-key">${t('network')}</span><span class="d-info-val">${s.network || t('na')}</span></div>
        <div class="d-info-row"><span class="d-info-key">${t('hours')}</span><span class="d-info-val">${s.hours || '24/7'}</span></div>
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
  $('detailPanel').classList.add('open');
}

/* ── ADD STATION ─────────────────────────────────────── */
function enterPlacementMode() {
  S.addMode = true;
  S.pendingLat = null;
  S.pendingLon = null;

  $('addForm').querySelector('.btn-pri').disabled = true;
  $('coordsPillText').textContent = '—';
  $('addForm').reset();
  $('addForm').querySelector('.btn-pri').disabled = true;

  document.getElementById('map').classList.add('placement-mode');
  showPlacementBanner();
  toast(t('toastSelectPoint'), 4000);
}

function showPlacementBanner() { $('placementBanner').classList.add('visible'); }
function hidePlacementBanner() { $('placementBanner').classList.remove('visible'); }

function openModal() {
  $('modalOverlay').classList.add('open');
  $('modalOverlay').setAttribute('aria-hidden', 'false');
  setTimeout(() => $('f_name')?.focus(), 350);
}

function closeAll() {
  S.addMode = false;
  S.pendingLat = null;
  S.pendingLon = null;
  document.getElementById('map').classList.remove('placement-mode');
  hidePlacementBanner();

  $('modalOverlay').classList.remove('open');
  $('modalOverlay').setAttribute('aria-hidden', 'true');

  if (S.tempMarker) {
    S.map.removeLayer(S.tempMarker);
    S.tempMarker = null;
  }
  $('addForm').reset();
}

$('addForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!S.pendingLat || !S.pendingLon) return;

  const connTypes = [...document.querySelectorAll('.check-group input:checked')].map(c => c.value);
  const entry = {
    id:       Date.now(),
    name:     $('f_name').value.trim(),
    lat:      S.pendingLat,
    lon:      S.pendingLon,
    address:  $('f_address').value.trim(),
    province: $('f_province').value,
    points:   parseInt($('f_points').value) || 1,
    connTypes,
    power:    $('f_power').value || null,
    cost:     $('f_cost').value,
    network:  $('f_network').value.trim(),
    notes:    $('f_notes').value.trim(),
    added:    new Date().toISOString(),
  };

  if (!entry.name) { $('f_name').focus(); return; }

  S.user.push(entry);
  saveUser();
  buildAll();
  closeAll();
  toast(t('toastAdded'));

  // Si está logueado, avisamos que la persistencia en la nube llega pronto
  if (window.PE.isLoggedIn()) {
    // (en la próxima fase: subir al backend)
  }

  setTimeout(() => select('usr_' + entry.id), 450);
});

/* ── LOCATE ──────────────────────────────────────────── */
function locate() {
  toast(t('toastLocating'));
  navigator.geolocation.getCurrentPosition(
    pos => S.map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { duration: 1 }),
    ()  => toast(t('toastLocErr'), 4000)
  );
}

/* ── FILTERS UI ──────────────────────────────────────── */
function initFilters() {
  let timer;
  $('searchInput').addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => { S.search = e.target.value.trim(); applyFilters(); }, 220);
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

/* ── SIDEBAR ─────────────────────────────────────────── */
function initSidebar() {
  $('sidebarCollapse').addEventListener('click', closeSidebar);
  $('sidebarBackdrop').addEventListener('click', closeSidebar);
  $('fabSidebar').addEventListener('click', toggleSidebar);
}

/* ── BOOT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  S.theme = window.PE.getTheme();
  initMap();
  initFilters();
  initSidebar();

  if (isMobile()) $('sidebar').classList.add('hidden');
  updateLayoutClass();

  let prevMobile = isMobile();
  window.addEventListener('resize', () => {
    const nowMobile = isMobile();
    if (nowMobile !== prevMobile) {
      if (nowMobile) closeSidebar();
      else {
        $('sidebarBackdrop').classList.remove('visible');
        updateLayoutClass();
        S.map.invalidateSize();
      }
      prevMobile = nowMobile;
    }
  });

  // Traducir textos del mapa
  applyMapI18n();

  // Escuchar cambios de idioma desde shared.js
  window.addEventListener('pe:lang-changed', () => {
    applyMapI18n();
  });

  // Escuchar cambios de tema desde shared.js (no afecta los tiles, son CSS)
  window.addEventListener('pe:theme-changed', () => {
    S.theme = window.PE.getTheme();
  });

  $('stationList').innerHTML = `<div class="list-state"><div class="spin-ring"></div><p>${t('loading')}</p></div>`;

  $('btnAdd').addEventListener('click', enterPlacementMode);
  $('btnLocate').addEventListener('click', locate);

  $('placementCancel').addEventListener('click', closeAll);

  $('modalClose').addEventListener('click', closeAll);
  $('btnCancelForm').addEventListener('click', closeAll);
  $('modalOverlay').addEventListener('click', e => {
    if (e.target === $('modalOverlay')) closeAll();
  });

  $('detailClose').addEventListener('click', closeDetailPanel);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll();
    if (e.key === '/' && document.activeElement !== $('searchInput')) {
      e.preventDefault(); $('searchInput').focus();
    }
  });

  fetchOCM();
});