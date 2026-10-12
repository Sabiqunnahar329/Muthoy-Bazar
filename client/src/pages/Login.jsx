import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth, STAFF_ROLES } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

// One login for admins, staff and customers. Staff roles go to /admin, customers go back to where they came from.
export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || password.length < 6) {
      setError('Enter your email or phone and a password of at least 6 characters.');
      return;
    }
    setBusy(true); setError('');
    try {
      const user = await login(identifier.trim(), password);
      navigate(STAFF_ROLES.includes(user.role) ? '/admin' : params.get('redirect') || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Email, phone or password is incorrect.');
    } finally { setBusy(false); }
  };

  const input = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <img src="/logo.png" alt="Muthoy Bazar" className="mx-auto h-24 w-24 object-contain" />
          <h1 className="mt-2 text-2xl font-bold text-brand">{t('login')}</h1>
          <p className="text-sm text-gray-500">{t('tagline')}</p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="identifier" className="mb-1 block text-sm font-medium">Email or phone</label>
            <input id="identifier" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} pr-11`} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-3 text-gray-500">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="text-right text-sm"><Link to="/forgot-password" className="font-medium text-brand hover:underline">Forgot password?</Link></div>
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cta py-3 font-bold text-white hover:bg-cta-dark disabled:opacity-60">
            <LogIn size={18} /> {busy ? 'Signing in…' : t('login')}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          New here? <Link to="/register" className="font-semibold text-brand hover:underline">Create an account</Link> or{' '}
          <Link to="/" className="font-semibold text-brand hover:underline">continue as a guest</Link>.
        </p>
      </div>
    </main>
  );
}
