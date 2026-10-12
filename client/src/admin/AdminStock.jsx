import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { Card, th, td, field, btnPrimary } from './ui.jsx';

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState({});
  const [msg, setMsg] = useState('');

  const load = () => api.get('/products', { params: { search, sort: 'stock', limit: 100 } }).then((r) => setProducts(r.data.products)).catch(() => {});
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (p) => {
    try { await api.patch(`/products/${p._id}/stock`, { stock: Number(draft[p._id]) }); setDraft((d) => { const n = { ...d }; delete n[p._id]; return n; }); setMsg(`${p.name} updated`); load(); }
    catch (e) { setMsg(apiError(e)); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Stock Management</h1>
      <p className="text-sm text-gray-600">Lowest stock first. Items under 10 are shown in red.</p>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className={`${field} max-w-xs`} />
      {msg && <p role="status" className="text-sm text-green-700">{msg}</p>}
      <Card>
        <table className="w-full"><thead><tr>{['Product', 'Brand', 'Current stock', 'Set new stock', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p._id}>
              <td className={td}>{p.name}</td><td className={td}>{p.brand}</td>
              <td className={td}><span className={p.stock < 10 ? 'font-bold text-red-600' : ''}>{p.stock}</span></td>
              <td className={td}><input type="number" min="0" value={draft[p._id] ?? ''} onChange={(e) => setDraft({ ...draft, [p._id]: e.target.value })} className={`${field} w-28`} /></td>
              <td className={td}><button disabled={draft[p._id] === undefined || draft[p._id] === ''} onClick={() => save(p)} className={btnPrimary}>Save</button></td>
            </tr>))}</tbody></table>
      </Card>
    </div>
  );
}
