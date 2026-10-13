import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Facebook } from 'lucide-react';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { saveSupportAccessCode } from '../lib/supportInbox.js';
import { useLang } from '../context/LanguageContext.jsx';

const blank = { name: '', phone: '', email: '', subject: '', message: '' };

export default function Contact() {
  const { t } = useLang();
  const [f, setF] = useState(blank);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setDone('');
    if (!f.name.trim()) return setError('Enter your name');
    if (!f.phone.trim() && !f.email.trim()) return setError('Enter a phone number or an email so we can reply');
    if (f.message.trim().length < 5) return setError('Write your message');
    setBusy(true);
    try {
      const { data } = await api.post('/support', { ...f, source: 'contact' });
      setDone(data.message);
      setAccessCode(data.accessCode);
      saveSupportAccessCode(data.accessCode);
      setF(blank);
    }
    catch (er) { setError(apiError(er)); } finally { setBusy(false); }
  };
  const input = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold">Contact us</h1>
        <p className="mt-2 text-gray-600">Questions about an order or a product? Reach us any of these ways, or send a message.</p>
        <ul className="mt-6 space-y-4">
          <li className="flex gap-3 rounded-xl border bg-white p-4"><Phone className="shrink-0 text-brand" /><span>WhatsApp and helpline: <a className="font-semibold text-brand" href="https://wa.me/8801612633433">+880 1612-633433</a></span></li>
          <li className="flex gap-3 rounded-xl border bg-white p-4"><Facebook className="shrink-0 text-brand" /><a className="font-semibold text-brand" href="https://www.facebook.com/MuthoyBazaar" target="_blank" rel="noreferrer">facebook.com/MuthoyBazaar</a></li>
          <li className="flex gap-3 rounded-xl border bg-white p-4"><MapPin className="shrink-0 text-brand" /><a className="font-semibold text-brand hover:underline" href="https://www.google.com/maps?q=23.7036629,90.4141469" target="_blank" rel="noreferrer">মেসার্স আব্দুল লতিফ স্টোর, শ্যামবাজার, ঢাকা, বাংলাদেশ · Google Maps-এ দেখুন</a></li>
        </ul>
      </div>
      <form onSubmit={submit} noValidate className="space-y-3 rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-bold">Send us a message</h2>
        <div><label htmlFor="c-name" className="mb-1 block text-sm font-medium">Name</label><input id="c-name" value={f.name} onChange={set('name')} className={input} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label htmlFor="c-phone" className="mb-1 block text-sm font-medium">Phone</label><input id="c-phone" value={f.phone} onChange={set('phone')} inputMode="numeric" placeholder="01XXXXXXXXX" className={input} /></div>
          <div><label htmlFor="c-email" className="mb-1 block text-sm font-medium">Email</label><input id="c-email" type="email" value={f.email} onChange={set('email')} className={input} /></div>
        </div>
        <div><label htmlFor="c-subject" className="mb-1 block text-sm font-medium">Subject</label><input id="c-subject" value={f.subject} onChange={set('subject')} className={input} /></div>
        <div><label htmlFor="c-msg" className="mb-1 block text-sm font-medium">Message</label><textarea id="c-msg" rows={4} value={f.message} onChange={set('message')} className={input} /></div>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {done && <div role="status" className="space-y-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          <p>{done}</p>
          <details className="text-xs">
            <summary className="cursor-pointer">{t('inboxRecovery')}</summary>
            <p className="mt-2">{t('inboxCodeSaved')}</p>
            <code className="mt-1 block break-all rounded bg-white p-2">{accessCode}</code>
          </details>
          <Link to="/messages" className="inline-block font-semibold text-brand underline">View your messages</Link>
        </div>}
        <button disabled={busy} className="w-full rounded-lg bg-cta py-3 font-bold text-white hover:bg-cta-dark disabled:opacity-60">{busy ? 'Sending…' : 'Send message'}</button>
      </form>
    </main>
  );
}
