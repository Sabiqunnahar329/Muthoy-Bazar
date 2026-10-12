import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../lib/api.js';
import { money, fmtDate, apiError } from '../lib/helpers.js';
import { Modal, Card, th, td, field, btnPrimary, btnCta } from './ui.jsx';

const CATEGORIES = ['Delivery', 'Packaging', 'Salary', 'Rent', 'Marketing', 'Utilities', 'Inventory purchase', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ type: 'expense', category: 'Delivery', amount: '', date: today(), note: '' });

export default function AdminExpenses() {
  const [filters, setFilters] = useState({ from: '', to: '', type: '', category: '' });
  const [data, setData] = useState({ items: [], totals: { income: 0, expense: 0, net: 0 } });
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/expenses', { params: Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }).then((r) => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const setF = (k) => (e) => setFilters((s) => ({ ...s, [k]: e.target.value }));
  const thisMonth = () => { const d = new Date(); setFilters((s) => ({ ...s, from: new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString('en-CA'), to: today() })); };

  const openForm = (e) => { setError(''); setForm(e ? { id: e._id, type: e.type, category: e.category, amount: e.amount, date: e.date.slice(0, 10), note: e.note } : blank()); };
  const save = async (ev) => {
    ev.preventDefault(); setError('');
    if (!form.category.trim()) return setError('Enter a category');
    if (!(Number(form.amount) > 0)) return setError('Amount must be above 0');
    setBusy(true);
    try { form.id ? await api.put(`/expenses/${form.id}`, form) : await api.post('/expenses', form); setForm(null); load(); }
    catch (e) { setError(apiError(e)); } finally { setBusy(false); }
  };
  const remove = async () => { await api.delete(`/expenses/${del._id}`).catch(() => {}); setDel(null); load(); };
  const { income, expense, net } = data.totals;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold">Expenses</h1><button onClick={() => openForm(null)} className={btnCta}><Plus size={16} className="mr-1 inline" />Add entry</button></div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5"><p className="text-sm text-gray-500">Income</p><p className="text-2xl font-bold text-green-700">{money(income)}</p></div>
        <div className="rounded-xl border bg-white p-5"><p className="text-sm text-gray-500">Expenses</p><p className="text-2xl font-bold text-red-600">{money(expense)}</p></div>
        <div className="rounded-xl border bg-white p-5"><p className="text-sm text-gray-500">Net</p><p className={`text-2xl font-bold ${net < 0 ? 'text-red-600' : 'text-brand'}`}>{net < 0 ? '−' : ''}{money(Math.abs(net))}</p></div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs font-medium">From<input type="date" value={filters.from} onChange={setF('from')} className={`${field} mt-1`} /></label>
        <label className="text-xs font-medium">To<input type="date" value={filters.to} onChange={setF('to')} className={`${field} mt-1`} /></label>
        <label className="text-xs font-medium">Type<select value={filters.type} onChange={setF('type')} className={`${field} mt-1`}><option value="">All</option><option value="income">Income</option><option value="expense">Expense</option></select></label>
        <label className="text-xs font-medium">Category<select value={filters.category} onChange={setF('category')} className={`${field} mt-1`}><option value="">All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <button onClick={thisMonth} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">This month</button>
        <button onClick={() => setFilters({ from: '', to: '', type: '', category: '' })} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Clear</button>
      </div>

      <Card>
        <table className="w-full"><thead><tr>{['Date', 'Type', 'Category', 'Note', 'Amount', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
          <tbody>{data.items.map((e) => (
            <tr key={e._id}>
              <td className={td}>{fmtDate(e.date)}</td>
              <td className={td}><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{e.type}</span></td>
              <td className={td}>{e.category}</td><td className={`${td} max-w-xs truncate`}>{e.note}</td>
              <td className={`${td} font-semibold ${e.type === 'income' ? 'text-green-700' : 'text-red-600'}`}>{e.type === 'income' ? '+' : '−'}{money(e.amount)}</td>
              <td className={td}><button onClick={() => openForm(e)} aria-label="Edit" className="mr-1 rounded border p-1.5 hover:bg-gray-50"><Pencil size={15} /></button><button onClick={() => setDel(e)} aria-label="Delete" className="rounded border p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></td>
            </tr>))}
            {!data.items.length && <tr><td className={td} colSpan={6}>No entries for this filter. Use "Add entry" to record income or an expense.</td></tr>}</tbody></table>
      </Card>

      {form && (
        <Modal title={form.id ? 'Edit entry' : 'Add entry'} onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {['expense', 'income'].map((t) => <label key={t} className={`cursor-pointer rounded-lg border px-4 py-2 text-center text-sm font-semibold capitalize ${form.type === t ? 'border-brand bg-brand-light text-brand' : ''}`}><input type="radio" className="sr-only" checked={form.type === t} onChange={() => setForm({ ...form, type: t })} />{t}</label>)}
            </div>
            <label className="block text-sm font-medium">Category<input list="exp-cats" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`${field} mt-1`} /><datalist id="exp-cats">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm font-medium">Amount (৳)<input type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={`${field} mt-1`} /></label>
              <label className="block text-sm font-medium">Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={`${field} mt-1`} /></label>
            </div>
            <label className="block text-sm font-medium">Note<input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={`${field} mt-1`} /></label>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="flex gap-2"><button disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save'}</button><button type="button" onClick={() => setForm(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div>
          </form>
        </Modal>
      )}
      {del && (
        <Modal title="Delete this entry?" onClose={() => setDel(null)}>
          <p className="text-sm">{del.category}, {money(del.amount)} on {fmtDate(del.date)} will be removed.</p>
          <div className="mt-4 flex gap-2"><button onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Delete</button><button onClick={() => setDel(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div>
        </Modal>
      )}
    </div>
  );
}
