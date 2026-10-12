import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../lib/api.js';
import { money, fmtDate, apiError } from '../lib/helpers.js';
import { Card, th, td, field, btnPrimary } from './ui.jsx';

const blank = { code: '', type: 'percent', value: '', minCart: '', expiresAt: '' };

export default function AdminCoupons() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(blank);
  const [error, setError] = useState('');
  const load = () => api.get('/coupons').then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault(); setError('');
    try { await api.post('/coupons', f); setF(blank); load(); } catch (er) { setError(apiError(er)); }
  };
  const remove = async (id) => { await api.delete(`/coupons/${id}`).catch(() => {}); load(); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Coupons</h1>
      <Card>
        <form onSubmit={create} noValidate className="grid gap-3 sm:grid-cols-5">
          <input value={f.code} onChange={set('code')} placeholder="Code, e.g. WELCOME10" aria-label="Code" className={field} />
          <select value={f.type} onChange={set('type')} aria-label="Type" className={field}><option value="percent">Percentage (%)</option><option value="fixed">Fixed (৳)</option></select>
          <input type="number" min="1" value={f.value} onChange={set('value')} placeholder="Discount value" aria-label="Value" className={field} />
          <input type="number" min="0" value={f.minCart} onChange={set('minCart')} placeholder="Minimum cart ৳" aria-label="Minimum cart" className={field} />
          <input type="date" value={f.expiresAt} onChange={set('expiresAt')} aria-label="Expiry date" className={field} />
          <div className="sm:col-span-5"><button className={btnPrimary}>Create coupon</button>{error && <span role="alert" className="ml-3 text-sm text-red-600">{error}</span>}</div>
        </form>
      </Card>
      <Card>
        <table className="w-full"><thead><tr>{['Code', 'Discount', 'Min cart', 'Expires', 'Used', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c._id}><td className={td}><b>{c.code}</b></td><td className={td}>{c.type === 'percent' ? `${c.value}%` : money(c.value)}</td><td className={td}>{money(c.minCart)}</td>
              <td className={td}>{c.expiresAt ? fmtDate(c.expiresAt) : 'No expiry'}</td><td className={td}>{c.usedCount}</td>
              <td className={td}><button onClick={() => remove(c._id)} aria-label="Delete coupon" className="rounded border p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></td></tr>))}
            {!list.length && <tr><td className={td} colSpan={6}>No coupons yet.</td></tr>}</tbody></table>
      </Card>
    </div>
  );
}
