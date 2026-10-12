import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../lib/api.js';
import { apiError, money } from '../lib/helpers.js';
import { Card, btnGhost, td, th } from './ui.jsx';

const METRICS = [
  ['Page views', 'pageViews'],
  ['Product views', 'productViews'],
  ['Add to cart', 'addToCarts'],
  ['Checkout starts', 'checkouts'],
  ['Purchases', 'purchases'],
];

export default function AdminPixelStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/analytics/stats');
      setStats(data);
    } catch (e) {
      setError(apiError(e, 'Could not load analytics.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h1 className="text-2xl font-bold">Pixel Stats</h1><p className="mt-1 text-sm text-gray-500">First-party store analytics from the last 30 days. No Meta account or paid service is used.</p></div>
        <button type="button" onClick={load} disabled={loading} className={btnGhost}><RefreshCw size={15} className={`mr-1 inline ${loading ? 'animate-spin' : ''}`} />{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {!stats && !error && <p className="text-gray-500">Loading analytics…</p>}
      {stats && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {METRICS.map(([label, key]) => <div key={key} className="rounded-xl border bg-white p-4"><p className="text-2xl font-bold text-brand">{stats.summary[key]}</p><p className="text-sm text-gray-500">{label}</p></div>)}
            <div className="rounded-xl border bg-white p-4"><p className="text-2xl font-bold text-brand">{money(stats.summary.revenue)}</p><p className="text-sm text-gray-500">Recorded order revenue</p></div>
          </div>
          <Card className="p-0">
            <div className="border-b p-4 font-bold">Daily activity</div>
            <table className="w-full">
              <thead><tr><th className={th}>Date</th><th className={th}>Views</th><th className={th}>Products</th><th className={th}>Cart</th><th className={th}>Checkout</th><th className={th}>Purchases</th><th className={th}>Revenue</th></tr></thead>
              <tbody>{stats.daily.slice().reverse().map((day) => (
                <tr key={day.date}>
                  <td className={td}>{day.date}</td><td className={td}>{day.pageViews}</td><td className={td}>{day.productViews}</td>
                  <td className={td}>{day.addToCarts}</td><td className={td}>{day.checkouts}</td><td className={td}>{day.purchases}</td><td className={td}>{money(day.revenue)}</td>
                </tr>
              ))}</tbody>
            </table>
          </Card>
          <p className="text-xs text-gray-500">Analytics stores event type, product ID when relevant, and page path only. It does not store customer names, phone numbers, addresses, or IP addresses.</p>
        </>
      )}
    </div>
  );
}
