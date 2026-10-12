import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { apiError } from '../lib/helpers.js';

export default function Register() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', identifier: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!f.name.trim() || !f.identifier.trim() || f.password.length < 6) return setError('Fill in your name, email or phone, and a password of at least 6 characters.');
    setBusy(true);
    try { const { data } = await api.post('/auth/register', f); setSession(data); navigate('/', { replace: true }); }
    catch (er) { setError(apiError(er)); } finally { setBusy(false); }
  };
  const input = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <form onSubmit={submit} noValidate className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl">
        <img src="/logo.png" alt="Muthoy Bazar" className="mx-auto h-20 w-20 object-contain" />
        <h1 className="text-center text-2xl font-bold text-brand">Create account</h1>
        <div><label className="mb-1 block text-sm font-medium">Full name</label><input value={f.name} onChange={set('name')} className={input} /></div>
        <div><label className="mb-1 block text-sm font-medium">Email or phone</label><input value={f.identifier} onChange={set('identifier')} autoComplete="username" className={input} /></div>
        <div><label className="mb-1 block text-sm font-medium">Password</label><input type="password" value={f.password} onChange={set('password')} autoComplete="new-password" className={input} /></div>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-cta py-3 font-bold text-white hover:bg-cta-dark disabled:opacity-60">{busy ? 'Creating…' : 'Create account'}</button>
        <p className="text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="font-semibold text-brand hover:underline">Login</Link></p>
      </form>
    </main>
  );
}
