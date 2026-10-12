import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { money, fmtDate, statusStyle, STATUSES } from '../lib/helpers.js';
import { Card, th, td, field } from './ui.jsx';
import OrderDetail from './OrderDetail.jsx';

export default function AdminOrders() {
  const [data, setData] = useState({ orders: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [zone, setZone] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);

  const load = () => api.get('/orders', { params: { search, status, zone, page, limit: 15 } }).then((r) => setData(r.data)).catch(() => {});
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [search, status, zone, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const show = (o) => setOpen(o);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sales / Orders</h1>
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search order ID, name, phone or city" className={`${field} max-w-xs`} />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={`${field} w-auto`}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select value={zone} onChange={(e) => { setZone(e.target.value); setPage(1); }} aria-label="Delivery area" className={`${field} w-auto`}><option value="">All delivery areas</option><option value="inside">Dhaka (৳80)</option><option value="outside">Outside Dhaka (৳150)</option></select>
      </div>
      <Card>
        <table className="w-full"><thead><tr>{['Order', 'Date', 'Customer', 'Phone', 'Delivery', 'Total', 'Payment', 'Status'].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody>{data.orders.map((o) => (
            <tr key={o._id} onClick={() => show(o)} className="cursor-pointer hover:bg-brand-light">
              <td className={td}><b>{o.orderNumber}</b>{o.flagged && <span className="ml-2 rounded bg-red-100 px-1.5 text-xs font-semibold text-red-700">Risky</span>}</td>
              <td className={td}>{fmtDate(o.createdAt)}</td><td className={td}>{o.customer.name}{o.customer.city && <><br /><span className="text-xs text-gray-500">{o.customer.city}</span></>}</td><td className={td}>{o.customer.phone}</td>
              <td className={td}>{money(o.shippingFee)}<br /><span className="text-xs text-gray-500">{o.zone === 'inside' ? 'Dhaka' : 'Outside Dhaka'}</span></td>
              <td className={td}>{money(o.total)}</td><td className={td}>{o.paymentMethod}</td>
              <td className={td}><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle[o.status]}`}>{o.status}</span></td>
            </tr>))}
            {!data.orders.length && <tr><td className={td} colSpan={8}>No orders found.</td></tr>}</tbody></table>
      </Card>
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button>
          <span>Page {data.page} of {data.pages}</span>
          <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
        </div>
      )}

      {open && <OrderDetail order={open} onClose={() => setOpen(null)} onChanged={load} />}
    </div>
  );
}
