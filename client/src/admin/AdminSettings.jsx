import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { Card, field, btnPrimary } from './ui.jsx';

export default function AdminSettings() {
  const [f, setF] = useState(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/settings').then((r) => setF(r.data)).catch(() => setError('Could not load settings.')); }, []);

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setOk(''); };
  const save = async (e) => {
    e.preventDefault(); setError(''); setOk('');
    setBusy(true);
    try { const { data } = await api.put('/settings', f); setF(data); setOk('Settings saved.'); } catch (er) { setError(apiError(er)); } finally { setBusy(false); }
  };
  if (!f) return error ? <p className="text-red-600">{error}</p> : <p className="text-gray-500">Loading…</p>;

  return (
    <form onSubmit={save} noValidate className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Configurations</h1>
      <Card className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">Store name<input value={f.storeName} onChange={set('storeName')} className={`${field} mt-1`} /></label>
        <label className="text-sm font-medium">Currency symbol<input value={f.currency} onChange={set('currency')} maxLength={5} className={`${field} mt-1`} /></label>
        <label className="text-sm font-medium">Tax rate (%)<input type="number" min="0" max="100" step="0.01" value={f.taxRate} onChange={set('taxRate')} className={`${field} mt-1`} /></label>
        <label className="text-sm font-medium">Phone<input value={f.phone} onChange={set('phone')} className={`${field} mt-1`} /></label>
        <label className="text-sm font-medium">WhatsApp<input value={f.whatsapp} onChange={set('whatsapp')} className={`${field} mt-1`} /></label>
        <label className="text-sm font-medium sm:col-span-2">Email<input type="email" value={f.email} onChange={set('email')} className={`${field} mt-1`} /></label>
        <label className="text-sm font-medium sm:col-span-2">Address<textarea rows={2} value={f.address} onChange={set('address')} className={`${field} mt-1`} /></label>
      </Card>
      <p className="text-xs text-gray-500">These details are stored and served at /api/settings. Checkout does not add tax or change the currency symbol yet.</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {ok && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{ok}</p>}
      <button disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}
