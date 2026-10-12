import { useEffect, useState } from 'react';
import { GripVertical, ArrowUp, ArrowDown, Eye, EyeOff, Pencil, Trash2, Plus } from 'lucide-react';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { Modal, Card, field, btnPrimary } from './ui.jsx';

export default function AdminMenu() {
  const [loc, setLoc] = useState('header');
  const [all, setAll] = useState([]);
  const [add, setAdd] = useState({ label: '', url: '' });
  const [edit, setEdit] = useState(null);
  const [drag, setDrag] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/menus/all').then((r) => setAll(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  const items = all.filter((i) => i.location === loc);
  const run = async (fn) => { setError(''); try { await fn(); await load(); } catch (e) { setError(apiError(e)); } };

  const persist = (list) => { setAll((a) => [...a.filter((i) => i.location !== loc), ...list]); return api.put('/menus/reorder', { location: loc, ids: list.map((i) => i._id) }).catch((e) => setError(apiError(e))); };
  const move = (from, to) => { if (to < 0 || to >= items.length || from === to) return; const l = [...items]; const [m] = l.splice(from, 1); l.splice(to, 0, m); persist(l); };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Menu Builder</h1>
      <p className="text-sm text-gray-600">Drag items (or use the arrows) to change their order. Hidden items stay saved but do not show on the website. The storefront uses this list when it has at least one visible item.</p>
      <div className="flex gap-2">{['header', 'footer'].map((l) => <button key={l} onClick={() => { setLoc(l); setError(''); }} className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize ${loc === l ? 'border-brand bg-brand text-white' : 'bg-white'}`}>{l} menu</button>)}</div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Card>
        <form onSubmit={(e) => { e.preventDefault(); if (!add.label.trim() || !add.url.trim()) return setError('Enter a label and a link'); run(async () => { await api.post('/menus', { ...add, location: loc }); setAdd({ label: '', url: '' }); }); }} className="flex flex-wrap gap-2">
          <input value={add.label} onChange={(e) => setAdd({ ...add, label: e.target.value })} placeholder="Label, e.g. Honey" aria-label="Label" className={`${field} max-w-48`} />
          <input value={add.url} onChange={(e) => setAdd({ ...add, url: e.target.value })} placeholder="Link, e.g. /shop?category=Honey" aria-label="Link" className={`${field} max-w-xs`} />
          <button className={btnPrimary}><Plus size={14} className="mr-1 inline" />Add item</button>
        </form>
      </Card>

      <Card className="p-2">
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-600">This menu is empty, so the website shows its built-in links.<br />
            <button onClick={() => run(() => api.post('/menus/defaults', { location: loc }))} className="mt-3 rounded-lg border-2 border-brand px-4 py-2 font-semibold text-brand hover:bg-brand-light">Start from the default {loc} links</button></div>
        ) : (
          <ul>{items.map((m, i) => (
            <li key={m._id} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }} onDragEnd={() => setDrag(null)}
              className={`flex items-center gap-2 border-b px-2 py-2.5 last:border-0 ${drag === i ? 'opacity-40' : ''} ${m.visible ? '' : 'bg-gray-50 text-gray-400'}`}>
              <GripVertical size={18} className="cursor-grab text-gray-400" aria-hidden="true" />
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{m.label}</p><p className="truncate text-xs text-gray-500">{m.url}</p></div>
              <button onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${m.label} up`} className="rounded border p-1.5 disabled:opacity-30"><ArrowUp size={14} /></button>
              <button onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label={`Move ${m.label} down`} className="rounded border p-1.5 disabled:opacity-30"><ArrowDown size={14} /></button>
              <button onClick={() => run(() => api.put(`/menus/${m._id}`, { visible: !m.visible }))} aria-label={m.visible ? `Hide ${m.label}` : `Show ${m.label}`} className="rounded border p-1.5">{m.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
              <button onClick={() => setEdit({ ...m })} aria-label={`Edit ${m.label}`} className="rounded border p-1.5"><Pencil size={14} /></button>
              <button onClick={() => run(() => api.delete(`/menus/${m._id}`))} aria-label={`Delete ${m.label}`} className="rounded border p-1.5 text-red-600"><Trash2 size={14} /></button>
            </li>))}</ul>
        )}
      </Card>

      {edit && (
        <Modal title="Edit menu item" onClose={() => setEdit(null)}>
          <form onSubmit={(e) => { e.preventDefault(); run(async () => { await api.put(`/menus/${edit._id}`, { label: edit.label, url: edit.url }); setEdit(null); }); }} className="space-y-3">
            <label className="block text-sm font-medium">Label<input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} className={`${field} mt-1`} /></label>
            <label className="block text-sm font-medium">Link<input value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} className={`${field} mt-1`} /></label>
            <div className="flex gap-2"><button className={btnPrimary}>Save</button><button type="button" onClick={() => setEdit(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
