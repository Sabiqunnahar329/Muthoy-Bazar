import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

// Step 1: request a reset code (POST /auth/forgot-password { identifier }).
// Step 2: enter the code and a new password (POST /auth/reset-password { identifier, code, password }).
export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [devCode, setDevCode] = useState('');

  const run = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch (err) { setError(err.response?.data?.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  };

  const sendCode = (e) => {
    e.preventDefault();
    if (!identifier.trim()) return setError('Enter the email or phone number you registered with.');
    run(async () => { const { data } = await api.post('/auth/forgot-password', { identifier: identifier.trim() }); setDevCode(data.devCode || ''); setStep(2); });
  };

  const reset = (e) => {
    e.preventDefault();
    if (code.trim().length < 4) return setError('Enter the code we sent you.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');
    run(async () => { await api.post('/auth/reset-password', { identifier: identifier.trim(), code: code.trim(), password }); setStep(3); });
  };

  const input = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';
  const btn = 'w-full rounded-lg bg-cta py-3 font-bold text-white hover:bg-cta-dark disabled:opacity-60';

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <img src="/logo.png" alt="Muthoy Bazar" className="mx-auto h-20 w-20 object-contain" />
        <h1 className="mt-2 text-center text-2xl font-bold text-brand">Reset password</h1>

        {step === 1 && (
          <form onSubmit={sendCode} className="mt-6 space-y-4" noValidate>
            <p className="text-sm text-gray-600">Enter your email or phone number and we will send you a reset code.</p>
            <div>
              <label htmlFor="fp-id" className="mb-1 block text-sm font-medium">Email or phone</label>
              <input id="fp-id" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className={input} />
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={busy} className={btn}>{busy ? 'Sending…' : 'Send reset code'}</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={reset} className="mt-6 space-y-4" noValidate>
            <p className="text-sm text-gray-600">We sent a code to <b>{identifier}</b>. Enter it below with your new password.</p>
            {devCode && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Development mode: your code is <b>{devCode}</b></p>}
            <div>
              <label htmlFor="fp-code" className="mb-1 block text-sm font-medium">Reset code</label>
              <input id="fp-code" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="fp-pw" className="mb-1 block text-sm font-medium">New password</label>
              <input id="fp-pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="fp-pw2" className="mb-1 block text-sm font-medium">Confirm new password</label>
              <input id="fp-pw2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={busy} className={btn}>{busy ? 'Saving…' : 'Reset password'}</button>
            <button type="button" onClick={() => { setStep(1); setError(''); }} className="w-full text-sm text-brand hover:underline">Use a different email or phone</button>
          </form>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-4 text-center">
            <p className="rounded-lg bg-green-50 px-3 py-3 text-green-800">Your password has been changed.</p>
            <Link to="/login" className={`${btn} block`}>Back to login</Link>
          </div>
        )}

        {step !== 3 && <p className="mt-5 text-center text-sm"><Link to="/login" className="font-medium text-brand hover:underline">Back to login</Link></p>}
      </div>
    </main>
  );
}
