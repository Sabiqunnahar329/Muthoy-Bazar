import api from './api.js';

export function trackEvent(event, details = {}) {
  api.post('/analytics/events', { event, ...details }).catch((error) => {
    console.warn('Store analytics event could not be recorded:', error.response?.data?.message || error.message);
  });
}
