import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { money, fmtDate, statusStyle } from '../lib/helpers.js';
import { Card, th, td } from './ui.jsx';
import OrderDetail from './OrderDetail.jsx';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const load = () => {
    setError('');
    api.get('/admin/stats')
      .then((r) => setS(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Could not reach the API. Check that the server and database are running.'));
  };
  useEffect(() => { load(); }, []);
  if (error) return (
    <div className="space-y-3">
      <p role="alert" className="text-red-600">{error}</p>
      <button type="button" onClick={load} className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50">Try again</button>
    </div>
  );
  if (!s) return <p className="text-gray-500">Loading…</p>;
  const max = Math.max(...s.last7.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Revenue', money(s.revenue)], ['Total orders', s.orders], ['Pending orders', s.pending], ['Low stock items', s.lowStockCount]].map(([l, v]) => (
          <div key={l} className="rounded-xl border bg-white p-5"><p className="text-3xl font-bold text-brand">{v}</p><p className="text-sm text-gray-500">{l}</p></div>
        ))}
      </div>
      <Card>
        <h2 className="mb-3 font-bold">Revenue, last 7 days</h2>
        <div className="flex h-40 items-end gap-3">
          {s.last7.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${d.date}: ${money(d.revenue)}`}>
              <span className="text-xs text-gray-500">{d.revenue ? money(d.revenue) : ''}</span>
              <div className="w-full rounded-t-md bg-brand" style={{ height: `${Math.max((d.revenue / max) * 100, 2)}%` }} />
              <span className="text-xs text-gray-500">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-1 font-bold">Recent orders</h2>
          <p className="mb-2 text-xs text-gray-500">Click an order to see its full details.</p>
          <table className="w-full"><thead><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Total</th><th className={th}>Status</th><th className={th}></th></tr></thead>
            <tbody>{s.recent.map((o) => <tr key={o._id} onClick={() => setOpen(o)} className="cursor-pointer hover:bg-brand-light"><td className={td}><b>{o.orderNumber}</b><br /><span className="text-xs text-gray-500">{fmtDate(o.createdAt)}</span></td><td className={td}>{o.customer.name}</td><td className={td}>{money(o.total)}</td><td className={td}><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle[o.status]}`}>{o.status}</span></td><td className={td}><button className="rounded border px-2 py-1 text-xs font-semibold text-brand hover:bg-white">View details</button></td></tr>)}
              {!s.recent.length && <tr><td className={td} colSpan={5}>No orders yet.</td></tr>}</tbody></table>
        </Card>
        <Card>
          <h2 className="mb-2 font-bold">Low stock</h2>
          <table className="w-full"><tbody>{s.lowStock.map((p) => <tr key={p._id}><td className={td}>{p.name}</td><td className={td}><span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{p.stock} left</span></td></tr>)}
            {!s.lowStock.length && <tr><td className={td}>All items are well stocked.</td></tr>}</tbody></table>
        </Card>
      </div>
      {open && <OrderDetail order={open} onClose={() => setOpen(null)} onChanged={load} />}
    </div>
  );
}
