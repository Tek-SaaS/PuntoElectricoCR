/* ════════════════════════════════════════════════════════
   CONFIG — entorno, API, constantes globales, feature flags
   ════════════════════════════════════════════════════════ */

function detectEnv() {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'local';
  if (host.includes('staging')) return 'staging';
  if (host.includes('dev'))     return 'development';
  return 'production';
}

export const ENV = detectEnv();

export const BACKEND_URLS = {
  production:  'https://punto-electrico-cr-backend.onrender.com',
  staging:     'https://punto-electrico-cr-staging.onrender.com',
  development: 'https://punto-electrico-cr-dev.onrender.com',
  local:       'http://localhost:5000',
};

export const API_URL = BACKEND_URLS[ENV] || BACKEND_URLS.production;

export const CR_CENTER = [9.9340, -84.0870];

/* Feature flags — se activan al terminar cada fase */
export const FEATURES = {
  backendCache:       false,  // Fase 3
  userStationsRemote: false,  // Fase 3
  pwa:                false,  // Fase 5
  distanceSort:       false,  // Fase 5
  sanitizeHTML:       false,  // Fase 1
};

if (ENV !== 'production') {
  console.log(`🔧 Entorno: ${ENV}`);
  console.log(`🔗 API_URL: ${API_URL}`);
}