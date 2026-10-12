import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../lib/api.js';
import { Card, btnGhost, td, th } from './ui.jsx';

export default function AdminActivityLog() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/activity-log');
      setItems(response.data);
    } catch (e) {
      setItems(null);
      setError(e.response?.data?.message || 'Could not load the activity log. Check the server and database connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="mt-1 text-sm text-gray-500">Latest successful changes made by staff. Request contents and customer details are not stored.</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className={btnGhost}>
          <RefreshCw size={15} className={`mr-1 inline ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <Card className="p-0">
        {items === null && !error ? <p className="p-5 text-gray-500">Loading…</p> : items?.length ? (
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>Activity</th>
                <th className={th}>Staff member</th>
                <th className={th}>Date and time</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td className={td}>
                    <p className="font-semibold">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.resource}</p>
                  </td>
                  <td className={td}>
                    <p>{item.actorName}</p>
                    <p className="text-xs capitalize text-gray-500">{item.actorRole.replaceAll('_', ' ')}</p>
                  </td>
                  <td className={td}>{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : !error ? (
          <p className="p-5 text-gray-500">No activity recorded yet. Successful staff changes will appear here.</p>
        ) : null}
      </Card>
    </div>
  );
}
