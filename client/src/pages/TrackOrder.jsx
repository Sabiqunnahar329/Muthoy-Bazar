import { useState } from 'react';
import api from '../lib/api.js';
import { STATUSES, statusStyle, fmtDate, apiError } from '../lib/helpers.js';

export default function TrackOrder() {
  const [no, setNo] = useState('');
  const [res, setRes] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setRes(null); setError('');
    if (!no.trim()) return setError('Enter your order ID');
    try { setRes((await api.get(`/orders/track/${encodeURIComponent(no.trim())}`)).data); } catch (er) { setError(apiError(er, 'No order found with this ID')); }
  };
  const idx = res ? STATUSES.indexOf(res.status) : 0;

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold">Track your order</h1>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input value={no} onChange={(e) => setNo(e.target.value)} placeholder="e.g. MB1001" aria-label="Order ID" className="min-w-0 flex-1 rounded-lg border px-4 py-2.5" />
        <button className="rounded-lg bg-cta px-6 font-semibold text-white hover:bg-cta-dark">Track</button>
      </form>
      {error && <p role="alert" className="mt-3 text-red-600">{error}</p>}
      {res && (
        <div className="mt-6 rounded-2xl border bg-white p-5">
          <p>Order <b>{res.orderNumber}</b> · placed {fmtDate(res.createdAt)}</p>
          <p className="mt-2"><span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyle[res.status]}`}>{res.status}</span></p>
          {res.status !== 'Cancelled' && (
            <ol className="mt-4 flex gap-2 text-xs">{STATUSES.slice(0, 4).map((s, i) => <li key={s} className={`flex-1 rounded-full py-1 text-center ${i <= idx ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'}`}>{s}</li>)}</ol>
          )}
        </div>
      )}
    </main>
  );
}
