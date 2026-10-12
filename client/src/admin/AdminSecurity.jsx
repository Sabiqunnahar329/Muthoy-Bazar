import { useEffect, useState } from 'react';
import { Search, Trash2, ShieldBan } from 'lucide-react';
import api from '../lib/api.js';
import { money, fmtDate, apiError, statusStyle } from '../lib/helpers.js';
import { Card, th, td, field, btnPrimary } from './ui.jsx';

const RISK = { Low: 'bg-green-100 text-green-800', Medium: 'bg-amber-100 text-amber-800', High: 'bg-red-100 text-red-800', Blocked: 'bg-gray-900 text-white' };

export default function AdminSecurity({ initial = 'lookup' }) {
  const [tab, setTab] = useState(initial);
  const [kind, setKind] = useState('phone');
  const [value, setValue] = useState('');
  const [res, setRes] = useState(null);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ type: 'phone', value: '', reason: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => setTab(initial), [initial]);
  const loadList = () => api.get('/security/blacklist').then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { loadList(); }, []);

  const search = async (e) => {
    if (e) { e.preventDefault(); setMsg(''); }
    setError(''); setRes(null);
    if (!value.trim()) return setError(kind === 'phone' ? 'Enter a phone number' : 'Enter an IP address');
    try { const { data } = await api.get('/security/lookup', { params: { [kind]: value.trim() } }); setRes(data); setReason(''); }
    catch (er) { setError(apiError(er)); }
  };
  const block = async (type, val, why) => {
    setMsg(''); setError('');
    try { await api.post('/security/blacklist', { type, value: val, reason: why }); setMsg(`${val} is now blocked.`); loadList(); if (res) search(); setForm({ type: 'phone', value: '', reason: '' }); }
    catch (er) { setError(apiError(er)); }
  };
  const unblock = async (id) => { await api.delete(`/security/blacklist/${id}`).catch(() => {}); loadList(); if (res) search(); };
  const tabBtn = (id, l) => <button onClick={() => { setTab(id); setError(''); setMsg(''); }} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${tab === id ? 'border-brand bg-brand text-white' : 'bg-white'}`}>{l}</button>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Fraud Checker and IP Block</h1>
      <div className="flex gap-2">{tabBtn('lookup', 'Lookup')}{tabBtn('blocklist', `Blacklist (${list.length})`)}</div>
      {msg && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{msg}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {tab === 'lookup' && (
        <>
          <Card>
            <form onSubmit={search} className="flex flex-wrap gap-2">
              <select value={kind} onChange={(e) => { setKind(e.target.value); setRes(null); }} aria-label="Lookup type" className={`${field} w-auto`}><option value="phone">Phone number</option><option value="ip">IP address</option></select>
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={kind === 'phone' ? '01XXXXXXXXX' : 'e.g. 103.25.10.4'} aria-label="Value to check" className={`${field} max-w-xs`} />
              <button className={btnPrimary}><Search size={15} className="mr-1 inline" />Check</button>
            </form>
          </Card>
          {res && (
            <Card className="space-y-4">
              <div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-bold">{res.value}</h2><span className={`rounded-full px-3 py-1 text-sm font-bold ${RISK[res.risk]}`}>{res.risk} risk</span></div>
              <div className="grid gap-3 sm:grid-cols-4">
                {(res.kind === 'phone' ? [['Orders', res.stats.orders], ['Delivered', res.stats.delivered], ['Cancelled', res.stats.cancelled], ['Total spent', money(res.stats.spent)]] : [['Orders', res.stats.orders], ['Different phone numbers', res.stats.phones], ['Cancelled', res.stats.cancelled]]).map(([l, v]) => (
                  <div key={l} className="rounded-lg bg-surface p-3"><p className="text-xl font-bold">{v}</p><p className="text-xs text-gray-500">{l}</p></div>))}
              </div>
              {res.kind === 'ip' && res.stats.orders === 0 && <p className="text-sm text-gray-500">No orders were placed from this IP address. Orders placed before this feature was added have no IP saved.</p>}
              {res.recent.length > 0 && (
                <table className="w-full"><thead><tr>{['Order', 'Date', 'Customer', 'Total', 'Status'].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
                  <tbody>{res.recent.map((o) => <tr key={o._id}><td className={td}><b>{o.orderNumber}</b></td><td className={td}>{fmtDate(o.createdAt)}</td><td className={td}>{o.customer.name} · {o.customer.phone}</td><td className={td}>{money(o.total)}</td><td className={td}><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle[o.status]}`}>{o.status}</span></td></tr>)}</tbody></table>
              )}
              {res.blocked ? (
                <div className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-100 p-3 text-sm"><ShieldBan size={18} /> Blocked {fmtDate(res.blocked.createdAt)}{res.blocked.reason && `: ${res.blocked.reason}`}<button onClick={() => unblock(res.blocked._id)} className="ml-auto rounded-lg border bg-white px-3 py-1.5">Remove block</button></div>
              ) : (
                <div className="flex flex-wrap gap-2"><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" aria-label="Reason" className={`${field} max-w-xs`} /><button onClick={() => block(res.kind, res.value, reason)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Block this {res.kind === 'phone' ? 'phone number' : 'IP address'}</button></div>
              )}
            </Card>
          )}
        </>
      )}

      {tab === 'blocklist' && (
        <>
          <Card>
            <form onSubmit={(e) => { e.preventDefault(); block(form.type, form.value, form.reason); }} className="flex flex-wrap gap-2">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} aria-label="Type" className={`${field} w-auto`}><option value="phone">Phone number</option><option value="ip">IP address</option></select>
              <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'phone' ? '01XXXXXXXXX' : 'IP address'} aria-label="Value" className={`${field} max-w-xs`} />
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason (optional)" aria-label="Reason" className={`${field} max-w-xs`} />
              <button className={btnPrimary}>Add to blacklist</button>
            </form>
            <p className="mt-2 text-xs text-gray-500">Blocked phone numbers and IP addresses cannot place orders, register or send contact messages. Admin login is never blocked.</p>
          </Card>
          <Card>
            <table className="w-full"><thead><tr>{['Type', 'Value', 'Reason', 'Added', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
              <tbody>{list.map((b) => <tr key={b._id}><td className={td}><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase">{b.type}</span></td><td className={td}><b>{b.value}</b></td><td className={td}>{b.reason || '—'}</td><td className={td}>{fmtDate(b.createdAt)}</td><td className={td}><button onClick={() => unblock(b._id)} aria-label="Remove" className="rounded border p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></td></tr>)}
                {!list.length && <tr><td className={td} colSpan={5}>The blacklist is empty.</td></tr>}</tbody></table>
          </Card>
        </>
      )}
    </div>
  );
}
