import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import api from '../lib/api.js';
import { money } from '../lib/helpers.js';
import { Card, th, td, field } from './ui.jsx';

const label = (m) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' });
const short = (n) => (n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n);

export default function AdminReports() {
  const [months, setMonths] = useState(6);
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api.get('/admin/reports', { params: { months } }).then((r) => setD({ ...r.data, monthly: r.data.monthly.map((m) => ({ ...m, label: label(m.month) })) })).catch(() => setError('Could not load reports.'));
  }, [months]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!d) return <p className="text-gray-500">Loading…</p>;
  const t = d.totals;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Report</h1>
        <label className="flex items-center gap-2 text-sm font-medium">Period<select value={months} onChange={(e) => setMonths(+e.target.value)} className={`${field} w-auto`}><option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option></select></label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Sales', money(t.sales), 'text-brand'], ['Expenses', money(t.expenses), 'text-red-600'], ['Profit', `${t.profit < 0 ? '−' : ''}${money(Math.abs(t.profit))}`, t.profit < 0 ? 'text-red-600' : 'text-green-700'], ['Orders', t.orders, 'text-gray-900']].map(([l, v, c]) => (
          <div key={l} className="rounded-xl border bg-white p-5"><p className={`text-2xl font-bold ${c}`}>{v}</p><p className="text-sm text-gray-500">{l}</p></div>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 font-bold">Sales vs expenses</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={d.monthly}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" /><YAxis tickFormatter={short} /><Tooltip formatter={(v) => money(v)} /><Legend />
              <Bar dataKey="sales" name="Sales" fill="#0b4d3c" radius={[4, 4, 0, 0]} /><Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-bold">Monthly trend</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={d.monthly}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" /><YAxis yAxisId="money" tickFormatter={short} /><YAxis yAxisId="orders" orientation="right" allowDecimals={false} />
              <Tooltip formatter={(v, name) => (name === 'Orders' ? v : money(v))} /><Legend />
              <Line yAxisId="money" type="monotone" dataKey="sales" name="Sales" stroke="#0b4d3c" strokeWidth={2} dot />
              <Line yAxisId="money" type="monotone" dataKey="profit" name="Profit" stroke="#16a34a" strokeWidth={2} dot strokeDasharray="5 3" />
              <Line yAxisId="orders" type="monotone" dataKey="orders" name="Orders" stroke="#f97316" strokeWidth={2} dot /></LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-bold">Top performing products</h2>
        {d.topProducts.length === 0 ? <p className="text-sm text-gray-500">No sales in this period yet.</p> : (
          <>
            <div style={{ width: '100%', height: Math.max(220, d.topProducts.length * 34) }}>
              <ResponsiveContainer>
                <BarChart data={d.topProducts} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tickFormatter={short} /><YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => money(v)} />
                  <Bar dataKey="revenue" name="Revenue" fill="#0b4d3c" radius={[0, 4, 4, 0]} /></BarChart>
              </ResponsiveContainer>
            </div>
            <table className="mt-4 w-full"><thead><tr>{['#', 'Product', 'Units sold', 'Revenue'].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody>{d.topProducts.map((p, i) => <tr key={p.name}><td className={td}>{i + 1}</td><td className={td}>{p.name}</td><td className={td}>{p.qty}</td><td className={td}>{money(p.revenue)}</td></tr>)}</tbody></table>
          </>
        )}
      </Card>
    </div>
  );
}
