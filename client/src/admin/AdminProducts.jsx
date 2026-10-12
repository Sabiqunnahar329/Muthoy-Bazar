import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../lib/api.js';
import { money, apiError } from '../lib/helpers.js';
import { Modal, Card, th, td, field, btnPrimary, btnCta } from './ui.jsx';

const blank = { name: '', brand: '', category: '', description: '', price: '', discountPrice: 0, stock: '', weight: '', unit: 'kg', isFeatured: false, isBestSeller: false, isNewArrival: false };

export default function AdminProducts() {
  const [data, setData] = useState({ products: [], total: 0, pages: 1, page: 1 });
  const [cats, setCats] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null | { id?, f, existing, files }
  const [del, setDel] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/products', { params: { search, page, limit: 15, sort: 'newest' } }).then((r) => setData(r.data)).catch(() => {});
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)).catch(() => {}); }, []);
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [search, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const openForm = (p) => {
    setError('');
    setForm(p
      ? { id: p._id, f: { name: p.name, brand: p.brand, category: p.category?._id || '', description: p.description, price: p.price, discountPrice: p.discountPrice, stock: p.stock, weight: p.weight ?? '', unit: p.unit, isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, isNewArrival: p.isNewArrival }, existing: p.images, files: [] }
      : { f: { ...blank, category: cats[0]?._id || '' }, existing: [], files: [] });
  };
  const setF = (k, v) => setForm((s) => ({ ...s, f: { ...s.f, [k]: v } }));

  const save = async (e) => {
    e.preventDefault(); setError('');
    const { f } = form;
    if (!f.name.trim()) return setError('Enter a product name');
    if (!(Number(f.price) > 0)) return setError('Enter a price above 0');
    if (Number(f.discountPrice) && Number(f.discountPrice) >= Number(f.price)) return setError('Discount price must be lower than the price');
    const body = new FormData();
    Object.entries(f).forEach(([k, v]) => body.append(k, v));
    body.append('existingImages', JSON.stringify(form.existing));
    form.files.forEach((file) => body.append('images', file));
    setBusy(true);
    try { form.id ? await api.put(`/products/${form.id}`, body) : await api.post('/products', body); setForm(null); load(); }
    catch (er) { setError(apiError(er)); } finally { setBusy(false); }
  };

  const remove = async () => { try { await api.delete(`/products/${del._id}`); setDel(null); load(); } catch (e) { setDel(null); alert(apiError(e)); } };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold">Product</h1><button onClick={() => openForm(null)} className={btnCta}><Plus size={16} className="mr-1 inline" />Add product</button></div>
      <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products or brands" className={`${field} max-w-xs`} />
      <Card>
        <table className="w-full"><thead><tr>{['', 'Product', 'Category', 'Price', 'Stock', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
          <tbody>{data.products.map((p) => (
            <tr key={p._id}>
              <td className={td}><div className="relative h-11 w-11 overflow-hidden rounded-lg bg-brand-light">{p.images?.[0] && <img src={p.images[0]} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} className="absolute inset-0 h-full w-full object-cover" />}</div></td>
              <td className={td}><b>{p.name}</b><br /><span className="text-xs text-gray-500">{p.brand} · {p.weight} {p.unit}</span></td>
              <td className={td}>{p.category?.name}</td>
              <td className={td}>{p.discountPrice > 0 && <s className="mr-1 text-gray-400">{money(p.price)}</s>}{money(p.discountPrice || p.price)}</td>
              <td className={td}><span className={p.stock < 10 ? 'font-semibold text-red-600' : ''}>{p.stock}</span></td>
              <td className={td}><button onClick={() => openForm(p)} aria-label="Edit" className="mr-1 rounded border p-1.5 hover:bg-gray-50"><Pencil size={15} /></button><button onClick={() => setDel(p)} aria-label="Delete" className="rounded border p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></td>
            </tr>))}
            {!data.products.length && <tr><td className={td} colSpan={6}>No products found.</td></tr>}</tbody></table>
      </Card>
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button>
          <span>Page {data.page} of {data.pages}</span>
          <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
        </div>
      )}

      {form && (
        <Modal title={form.id ? 'Edit product' : 'Add product'} onClose={() => setForm(null)} wide>
          <form onSubmit={save} noValidate className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">Product name<input value={form.f.name} onChange={(e) => setF('name', e.target.value)} className={`${field} mt-1`} /></label>
            <label className="text-sm font-medium">Brand<input value={form.f.brand} onChange={(e) => setF('brand', e.target.value)} className={`${field} mt-1`} /></label>
            <label className="text-sm font-medium">Category<select value={form.f.category} onChange={(e) => setF('category', e.target.value)} className={`${field} mt-1`}>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
            <label className="text-sm font-medium">Price (৳)<input type="number" min="1" value={form.f.price} onChange={(e) => setF('price', e.target.value)} className={`${field} mt-1`} /></label>
            <label className="text-sm font-medium">Discount price (৳, 0 for none)<input type="number" min="0" value={form.f.discountPrice} onChange={(e) => setF('discountPrice', e.target.value)} className={`${field} mt-1`} /></label>
            <label className="text-sm font-medium">Stock<input type="number" min="0" value={form.f.stock} onChange={(e) => setF('stock', e.target.value)} className={`${field} mt-1`} /></label>
            <div className="grid grid-cols-2 gap-2"><label className="text-sm font-medium">Weight<input type="number" min="0" step="any" value={form.f.weight} onChange={(e) => setF('weight', e.target.value)} className={`${field} mt-1`} /></label><label className="text-sm font-medium">Unit<input value={form.f.unit} onChange={(e) => setF('unit', e.target.value)} placeholder="kg, g, l, ml, pcs" className={`${field} mt-1`} /></label></div>
            <label className="text-sm font-medium sm:col-span-2">Description<textarea rows={2} value={form.f.description} onChange={(e) => setF('description', e.target.value)} className={`${field} mt-1`} /></label>
            <div className="flex flex-wrap gap-4 text-sm sm:col-span-2">
              {[['isFeatured', 'Featured'], ['isBestSeller', 'Best seller'], ['isNewArrival', 'New arrival']].map(([k, l]) => <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={form.f[k]} onChange={(e) => setF(k, e.target.checked)} />{l}</label>)}
            </div>
            <div className="sm:col-span-2">
              <p className="mb-1 text-sm font-medium">Pictures</p>
              <div className="flex flex-wrap gap-2">
                {form.existing.map((u) => (
                  <div key={u} className="relative h-20 w-20 overflow-hidden rounded-lg border bg-brand-light"><img src={u} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <button type="button" aria-label="Remove picture" onClick={() => setForm((s) => ({ ...s, existing: s.existing.filter((x) => x !== u) }))} className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"><X size={12} /></button></div>
                ))}
                {form.files.map((file, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border"><img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                    <button type="button" aria-label="Remove picture" onClick={() => setForm((s) => ({ ...s, files: s.files.filter((_, j) => j !== i) }))} className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"><X size={12} /></button></div>
                ))}
              </div>
              <input type="file" accept="image/*" multiple onChange={(e) => setForm((s) => ({ ...s, files: [...s.files, ...Array.from(e.target.files)].slice(0, 5) }))} className="mt-2 text-sm" />
              <p className="mt-1 text-xs text-gray-500">JPG, PNG or WebP, up to 3 MB each. Up to 5 pictures.</p>
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
            <div className="flex gap-2 sm:col-span-2"><button disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save product'}</button><button type="button" onClick={() => setForm(null)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Cancel</button></div>
          </form>
        </Modal>
      )}
      {del && (
        <Modal title="Delete product?" onClose={() => setDel(null)}>
          <p className="text-sm">{del.name} will be removed from the store. Past orders keep their details.</p>
          <div className="mt-4 flex gap-2"><button onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button><button onClick={() => setDel(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div>
        </Modal>
      )}
    </div>
  );
}
