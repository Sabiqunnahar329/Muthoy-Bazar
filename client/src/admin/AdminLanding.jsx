import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, X, ExternalLink } from 'lucide-react';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { Modal, Card, th, td, field, btnPrimary, btnCta } from './ui.jsx';

const blank = { title: '', slug: '', headline: '', subheadline: '', bannerUrl: '', ctaText: 'Order now', ctaLink: '#products', sections: [], products: [], published: false };

export default function AdminLanding() {
  const [pages, setPages] = useState([]);
  const [ed, setEd] = useState(null);
  const [del, setDel] = useState(null);
  const [q, setQ] = useState('');
  const [found, setFound] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/landing').then((r) => setPages(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (q.trim().length < 2) { setFound([]); return; }
    const id = setTimeout(() => api.get('/products', { params: { search: q.trim(), limit: 6 } }).then((r) => setFound(r.data.products)).catch(() => {}), 250);
    return () => clearTimeout(id);
  }, [q]);

  const set = (k, v) => setEd((s) => ({ ...s, [k]: v }));
  const setSection = (i, k, v) => setEd((s) => ({ ...s, sections: s.sections.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const moveSection = (i, d) => setEd((s) => { const a = [...s.sections]; const j = i + d; if (j < 0 || j >= a.length) return s; [a[i], a[j]] = [a[j], a[i]]; return { ...s, sections: a }; });
  const open = (p) => { setError(''); setQ(''); setEd(p ? { ...p, id: p._id } : { ...blank }); };

  const save = async (e) => {
    e.preventDefault(); setError('');
    if (!ed.title.trim()) return setError('Enter a page title');
    setBusy(true);
    try {
      const body = { ...ed, products: ed.products.map((p) => p._id) };
      ed.id ? await api.put(`/landing/${ed.id}`, body) : await api.post('/landing', body);
      setEd(null); load();
    } catch (er) { setError(apiError(er)); } finally { setBusy(false); }
  };
  const remove = async () => { await api.delete(`/landing/${del._id}`).catch(() => {}); setDel(null); load(); };

  if (ed) {
    return (
      <form onSubmit={save} noValidate className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">{ed.id ? 'Edit landing page' : 'New landing page'}</h1>
          <div className="flex gap-2"><button disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save page'}</button><button type="button" onClick={() => setEd(null)} className="rounded-lg border px-4 py-2 text-sm">Back to list</button></div>
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Card className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">Page title<input value={ed.title} onChange={(e) => set('title', e.target.value)} className={`${field} mt-1`} /></label>
          <label className="text-sm font-medium">Page address<div className="mt-1 flex items-center gap-1 text-sm text-gray-500">/lp/<input value={ed.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from title" className={field} /></div></label>
          <label className="text-sm font-medium sm:col-span-2">Banner image URL<input value={ed.bannerUrl} onChange={(e) => set('bannerUrl', e.target.value)} placeholder="https://… or /banners/my-banner.jpg" className={`${field} mt-1`} /></label>
          {ed.bannerUrl && <img src={ed.bannerUrl} alt="Banner preview" onError={(e) => (e.currentTarget.style.display = 'none')} className="h-32 w-full rounded-lg object-cover sm:col-span-2" />}
          <label className="text-sm font-medium">Headline<input value={ed.headline} onChange={(e) => set('headline', e.target.value)} className={`${field} mt-1`} /></label>
          <label className="text-sm font-medium">Sub headline<input value={ed.subheadline} onChange={(e) => set('subheadline', e.target.value)} className={`${field} mt-1`} /></label>
          <label className="text-sm font-medium">Button text<input value={ed.ctaText} onChange={(e) => set('ctaText', e.target.value)} className={`${field} mt-1`} /></label>
          <label className="text-sm font-medium">Button link<input value={ed.ctaLink} onChange={(e) => set('ctaLink', e.target.value)} placeholder="#products, /checkout or https://…" className={`${field} mt-1`} /></label>
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2"><input type="checkbox" checked={ed.published} onChange={(e) => set('published', e.target.checked)} />Published (visible to customers)</label>
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between"><h2 className="font-bold">Sections</h2><button type="button" onClick={() => set('sections', [...ed.sections, { heading: '', body: '' }])} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"><Plus size={14} className="mr-1 inline" />Add section</button></div>
          {!ed.sections.length && <p className="text-sm text-gray-500">No sections yet. Add a heading and a short text, such as "Why you will love it".</p>}
          <div className="space-y-3">{ed.sections.map((s, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex gap-2"><input value={s.heading} onChange={(e) => setSection(i, 'heading', e.target.value)} placeholder="Section heading" aria-label="Section heading" className={field} />
                <button type="button" onClick={() => moveSection(i, -1)} aria-label="Move up" className="rounded border p-2"><ArrowUp size={14} /></button>
                <button type="button" onClick={() => moveSection(i, 1)} aria-label="Move down" className="rounded border p-2"><ArrowDown size={14} /></button>
                <button type="button" onClick={() => set('sections', ed.sections.filter((_, j) => j !== i))} aria-label="Remove section" className="rounded border p-2 text-red-600"><Trash2 size={14} /></button></div>
              <textarea rows={2} value={s.body} onChange={(e) => setSection(i, 'body', e.target.value)} placeholder="Section text" aria-label="Section text" className={`${field} mt-2`} />
            </div>))}</div>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">Highlighted products</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {ed.products.map((p) => <span key={p._id} className="flex items-center gap-1 rounded-full bg-brand-light px-3 py-1 text-sm">{p.name} <span className="text-xs text-gray-500">#{p._id.slice(-6)}</span><button type="button" aria-label={`Remove ${p.name}`} onClick={() => set('products', ed.products.filter((x) => x._id !== p._id))}><X size={14} /></button></span>)}
            {!ed.products.length && <span className="text-sm text-gray-500">No products picked yet.</span>}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a product to add" aria-label="Search products" className={`${field} max-w-sm`} />
          {found.length > 0 && <ul className="mt-2 max-w-sm divide-y rounded-lg border bg-white">{found.filter((p) => !ed.products.some((x) => x._id === p._id)).map((p) => <li key={p._id}><button type="button" onClick={() => { set('products', [...ed.products, { _id: p._id, name: p.name }]); setQ(''); }} className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-brand-light"><span>{p.name}</span><Plus size={14} /></button></li>)}</ul>}
        </Card>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold">Landing Page</h1><button onClick={() => open(null)} className={btnCta}><Plus size={16} className="mr-1 inline" />New page</button></div>
      <Card>
        <table className="w-full"><thead><tr>{['Title', 'Address', 'Products', 'Status', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
          <tbody>{pages.map((p) => (
            <tr key={p._id}>
              <td className={td}><b>{p.title}</b></td>
              <td className={td}>{p.published ? <a href={`/lp/${p.slug}`} target="_blank" rel="noreferrer" className="text-brand underline">/lp/{p.slug} <ExternalLink size={12} className="inline" /></a> : `/lp/${p.slug}`}</td>
              <td className={td}>{p.products.length}</td>
              <td className={td}><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{p.published ? 'Published' : 'Draft'}</span></td>
              <td className={td}><button onClick={() => open(p)} className="mr-1 rounded border px-3 py-1 text-sm hover:bg-gray-50">Edit</button><button onClick={() => setDel(p)} aria-label="Delete" className="rounded border p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></td>
            </tr>))}
            {!pages.length && <tr><td className={td} colSpan={5}>No landing pages yet. Create one for a Facebook ad campaign.</td></tr>}</tbody></table>
      </Card>
      {del && <Modal title="Delete landing page?" onClose={() => setDel(null)}><p className="text-sm">"{del.title}" will be removed and its link will stop working.</p><div className="mt-4 flex gap-2"><button onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Delete</button><button onClick={() => setDel(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div></Modal>}
    </div>
  );
}
