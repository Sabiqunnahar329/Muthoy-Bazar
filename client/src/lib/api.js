import axios from 'axios';

// Development: leave REACT_APP_API_URL empty. Requests go to /api and the development proxy (src/setupProxy.js) forwards them.
// On Vercel: leave it empty too. vercel.json forwards /api to your Render server.
// Set REACT_APP_API_URL only if you want the browser to call the API directly (the server must then allow your site in CORS).
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api', timeout: 60000 });

// Send the saved login token, so the admin pages and "My orders" work.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A free Render server goes to sleep and can need up to a minute to wake up.
// Read requests (GET) that fail because the server is not ready are tried again a few times.
const RETRY_DELAYS = [2000, 5000, 10000];
const notReady = (error) => !error.response || [502, 503, 504].includes(error.response.status);

api.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  if (!config || config.method !== 'get' || !notReady(error)) return Promise.reject(error);
  const attempt = config.retryCount || 0;
  if (attempt >= RETRY_DELAYS.length) return Promise.reject(error);
  config.retryCount = attempt + 1;
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
  return api(config);
});

export default api;
