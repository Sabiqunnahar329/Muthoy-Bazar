import { useEffect, useState } from 'react';
import api from '../lib/api.js';

const uptime = (s) => { const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60); return `${d ? `${d}d ` : ''}${h}h ${m}m ${s % 60}s`; };

export default function AdminServerStats() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  const load = () => api.get('/admin/server-stats')
    .then((r) => { setS(r.data); setError(''); })
    .catch((e) => setError(e.response?.data?.message || 'Could not reach the API. Check that the server and database are running.'));
  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, []);

  if (!s) return error ? (
    <div className="space-y-3">
      <p role="alert" className="text-red-600">{error}</p>
      <button type="button" onClick={load} className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50">Try again</button>
    </div>
  ) : <p className="text-gray-500">Loading…</p>;
  const ok = s.database.state === 'Connected';
  const cards = [
    ['Database', s.database.state, `${s.database.name || ''}${s.database.host ? ` · ${s.database.host}` : ''}`, ok ? 'text-green-700' : 'text-red-600'],
    ['Uptime', uptime(s.uptimeSeconds), `Server time ${new Date(s.serverTime).toLocaleTimeString()}`, 'text-brand'],
    ['Memory', `${s.memoryMb.rss} MB`, `${s.memoryMb.heap} MB heap in use`, 'text-brand'],
    ['Runtime', s.node, `${s.platform} · ${s.environment}`, 'text-brand'],
    ['Products', s.counts.products, 'in the catalog', 'text-gray-900'],
    ['Orders', s.counts.orders, 'placed so far', 'text-gray-900'],
    ['Users', s.counts.users, 'customers and staff', 'text-gray-900'],
    ['Blocked', s.counts.blocked, 'phones and IP addresses', 'text-gray-900'],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Server Stats</h1><span className="text-xs text-gray-500">Refreshes every 10 seconds</span></div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error} Showing the last known values.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([l, v, sub, c]) => (
          <div key={l} className="rounded-xl border bg-white p-5"><p className="text-sm text-gray-500">{l}</p><p className={`mt-1 text-2xl font-bold ${c}`}>{v}</p><p className="mt-1 truncate text-xs text-gray-500">{sub}</p></div>
        ))}
      </div>
    </div>
  );
}
