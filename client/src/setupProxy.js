// Development only: /api and /uploads are sent to your LOCAL server (npm run dev in the server folder).
// To use a live server instead, set REACT_APP_PROXY_TARGET in client/.env and restart.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = process.env.REACT_APP_PROXY_TARGET || 'http://localhost:5000';
  const options = { target, changeOrigin: true, proxyTimeout: 90000, timeout: 90000 };
  app.use('/api', createProxyMiddleware(options));
  app.use('/uploads', createProxyMiddleware(options));
};
