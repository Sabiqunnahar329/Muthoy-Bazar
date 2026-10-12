import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal, Card, th, td, field, btnPrimary, btnCta } from './ui.jsx';

const ROLE_LABEL = { super_admin: 'Super Admin', admin: 'Admin', inventory_manager: 'Manager', delivery_operator: 'Staff' };
const ROLE_NOTE = { admin: 'Full access to every module', inventory_manager: 'Products, stock, sales and reports', delivery_operator: 'Orders, customers and support' };
const PERM = { dashboard: 'Dashboard', products: 'Products', sales: 'Sales and orders', stock: 'Stock', customers: 'Customers', expenses: 'Expenses', coupons: 'Coupons', landing: 'Landing pages', staff: 'Staff management', reports: 'Reports', security: 'Fraud and IP block', menu: 'Menu builder', notifications: 'Notifications', support: 'Support mailbox', settings: 'Settings and server' };

export default function AdminStaff() {
  const { user } = useAuth();
  const [data, setData] = useState({ staff: [], modules: [], roleDefaults: {} });
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/staff').then((r) => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const roles = user.role === 'super_admin' ? ['admin', 'inventory_manager', 'delivery_operator'] : ['inventory_manager', 'delivery_operator'];
  const permsOf = (u) => (u.permissions?.length ? u.permissions : data.roleDefaults[u.role] || []);

  const openForm = (u) => {
    setError('');
    setForm(u ? { id: u._id, name: u.name, identifier: u.email || u.phone, password: '', role: u.role, permissions: permsOf(u), active: u.active !== false }
      : { name: '', identifier: '', password: '', role: 'delivery_operator', permissions: data.roleDefaults.delivery_operator || [], active: true });
  };
  const pickRole = (role) => setForm((f) => ({ ...f, role, permissions: data.roleDefaults[role] || [] }));
  const toggle = (m) => setForm((f) => ({ ...f, permissions: f.permissions.includes(m) ? f.permissions.filter((x) => x !== m) : [...f.permissions, m] }));

  const save = async (e) => {
    e.preventDefault(); setError('');
    if (!form.name.trim()) return setError('Enter a name');
    if (!form.id && !form.identifier.trim()) return setError('Enter an email or phone number');
    if (!form.id && form.password.length < 6) return setError('Password must be at least 6 characters');
    if (!form.permissions.length) return setError('Choose at least one module');
    setBusy(true);
    try { form.id ? await api.put(`/staff/${form.id}`, form) : await api.post('/staff', form); setForm(null); load(); }
    catch (er) { setError(apiError(er)); } finally { setBusy(false); }
  };
  const setActive = async (u) => { setMsg(''); try { await api.put(`/staff/${u._id}`, { active: u.active === false }); load(); } catch (e) { setMsg(apiError(e)); } };
  const remove = async () => { try { await api.delete(`/staff/${del._id}`); load(); } catch (e) { setMsg(apiError(e)); } setDel(null); };
  const locked = (u) => u.role === 'super_admin' && user.role !== 'super_admin';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold">Staff Management</h1><button onClick={() => openForm(null)} className={btnCta}><Plus size={16} className="mr-1 inline" />Add staff</button></div>
      {msg && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p>}
      <Card>
        <table className="w-full"><thead><tr>{['Name', 'Login', 'Role', 'Access', 'Status', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
          <tbody>{data.staff.map((u) => (
            <tr key={u._id}>
              <td className={td}><b>{u.name}</b>{u._id === user._id && <span className="ml-2 text-xs text-gray-500">(you)</span>}</td>
              <td className={td}>{u.email || u.phone}</td>
              <td className={td}><span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand">{ROLE_LABEL[u.role]}</span></td>
              <td className={td}>{u.role === 'super_admin' ? 'Everything' : `${permsOf(u).length} of ${data.modules.length} modules`}</td>
              <td className={td}><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.active === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{u.active === false ? 'Disabled' : 'Active'}</span></td>
              <td className={td}>{!locked(u) && <>
                <button onClick={() => openForm(u)} aria-label="Edit" className="mr-1 rounded border p-1.5 hover:bg-gray-50"><Pencil size={15} /></button>
                {u.role !== 'super_admin' && <button onClick={() => setActive(u)} className="mr-1 rounded border px-2 py-1 text-xs hover:bg-gray-50">{u.active === false ? 'Enable' : 'Disable'}</button>}
                {u.role !== 'super_admin' && <button onClick={() => setDel(u)} aria-label="Delete" className="rounded border p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>}</>}</td>
            </tr>))}</tbody></table>
      </Card>

      {form && (
        <Modal title={form.id ? 'Edit staff member' : 'Add staff member'} onClose={() => setForm(null)} wide>
          <form onSubmit={save} noValidate className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${field} mt-1`} /></label>
              <label className="text-sm font-medium">Email or phone<input value={form.identifier} disabled={!!form.id} onChange={(e) => setForm({ ...form, identifier: e.target.value })} className={`${field} mt-1 disabled:bg-gray-100`} /></label>
              <label className="text-sm font-medium">{form.id ? 'New password (leave empty to keep)' : 'Password'}<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" className={`${field} mt-1`} /></label>
              <label className="text-sm font-medium">Role
                <select value={form.role} onChange={(e) => pickRole(e.target.value)} disabled={form.role === 'super_admin'} className={`${field} mt-1`}>
                  {(form.role === 'super_admin' ? ['super_admin'] : roles).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select><span className="text-xs text-gray-500">{ROLE_NOTE[form.role]}</span></label>
            </div>
            <fieldset><legend className="mb-1 text-sm font-medium">Module access</legend>
              <div className="grid gap-2 sm:grid-cols-3">{data.modules.map((m) => (
                <label key={m} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${form.permissions.includes(m) ? 'border-brand bg-brand-light' : ''}`}>
                  <input type="checkbox" checked={form.permissions.includes(m)} onChange={() => toggle(m)} />{PERM[m]}</label>))}</div>
            </fieldset>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Account is active (can log in)</label>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="flex gap-2"><button disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save'}</button><button type="button" onClick={() => setForm(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div>
          </form>
        </Modal>
      )}
      {del && <Modal title="Delete staff member?" onClose={() => setDel(null)}><p className="text-sm">{del.name} will lose access immediately. This cannot be undone.</p><div className="mt-4 flex gap-2"><button onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Delete</button><button onClick={() => setDel(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div></Modal>}
    </div>
  );
}
