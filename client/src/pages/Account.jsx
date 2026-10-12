import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { money, fmtDate, statusStyle } from '../lib/helpers.js';

export default function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState(null);
  useEffect(() => { if (user) api.get('/orders/my').then((r) => setOrders(r.data)).catch(() => setOrders([])); }, [user]);
  if (!user) return <Navigate to="/login?redirect=/account" replace />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">{user.name}</h1><p className="text-gray-500">{user.email || user.phone}</p></div>
        <button onClick={logout} className="rounded-lg border px-4 py-2 hover:bg-gray-50">Logout</button>
      </div>
      <h2 className="mb-3 mt-8 text-lg font-bold">My orders</h2>
      {orders === null ? <p className="text-gray-500">Loading…</p> : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet. <Link to="/shop" className="text-brand underline">Start shopping</Link></p>
      ) : (
        <ul className="space-y-3">{orders.map((o) => (
          <li key={o._id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><b>{o.orderNumber}</b><span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${statusStyle[o.status]}`}>{o.status}</span></div>
            <p className="text-sm text-gray-500">{fmtDate(o.createdAt)} · {o.items.length} item(s) · <b className="text-gray-800">{money(o.total)}</b></p>
          </li>))}
        </ul>
      )}
    </main>
  );
}
