import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Bell, Facebook, MessageCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { getSupportAccessCodes, saveSupportAccessCode } from '../lib/supportInbox.js';

const WHATSAPP = '8801612633433';
const LINKS = {
  messenger: 'https://m.me/MuthoyBazaar',
  whatsapp: `https://wa.me/${WHATSAPP}`,
};
const emptyMessage = { name: '', phone: '', email: '', message: '' };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyMessage);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [unreadReplies, setUnreadReplies] = useState(0);
  const { t } = useLang();
  const { user } = useAuth();

  const row = 'flex items-center gap-3 rounded-xl border bg-white px-4 py-3 font-medium text-gray-800 transition hover:border-cta hover:bg-brand-light';
  const input = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const refreshUnread = useCallback(async () => {
    const { data } = await api.post('/support/inbox', { accessCodes: getSupportAccessCodes() });
    setUnreadReplies(data.filter((message) => message.unreadReply).length);
  }, []);

  useEffect(() => {
    const refresh = () => refreshUnread().catch((error) => console.error('Could not check support inbox:', error.message));
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refreshUnread, user]);

  const sendMessage = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.phone.trim() && !form.email.trim()) {
      setError(t('messageRequiredContact'));
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/support', { ...form, source: 'support' });
      saveSupportAccessCode(data.accessCode);
      setAccessCode(data.accessCode);
      setSent(true);
      setForm(emptyMessage);
      refreshUnread().catch((refreshError) => console.error('Could not refresh support inbox:', refreshError.message));
    } catch (sendError) {
      setError(apiError(sendError, t('messageSendError')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div role="dialog" aria-label={t('chatTitle')} className="mb-3 w-72 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex items-start justify-between bg-brand p-4 text-white">
            <div>
              <p className="font-bold">{t('chatTitle')}</p>
              <p className="text-sm text-white/85">{t('chatSub')}</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t('close')} className="rounded p-1 hover:bg-white/10"><X size={18} /></button>
          </div>
          {showForm ? (
            <div className="max-h-[70vh] overflow-y-auto bg-surface p-3">
              <button type="button" onClick={() => { setShowForm(false); setSent(false); setError(''); }} className="mb-3 flex items-center gap-1 text-sm text-brand hover:underline">
                <ArrowLeft size={16} />{t('messageBack')}
              </button>
              {sent ? (
                <div role="status" className="space-y-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                  <p>{t('messageSent')}</p>
                  <p className="font-medium">{t('inboxCodeSaved')}</p>
                  <code className="block break-all rounded bg-white p-2 text-xs">{accessCode}</code>
                  <Link to="/messages" onClick={() => setOpen(false)} className="inline-block font-semibold text-brand underline">{t('messageInbox')}</Link>
                </div>
              ) : (
                <form onSubmit={sendMessage} className="space-y-3">
                  <label className="block text-sm font-medium">{t('messageName')}
                    <input value={form.name} onChange={update('name')} maxLength={80} required className={`${input} mt-1`} />
                  </label>
                  <label className="block text-sm font-medium">{t('messagePhone')}
                    <input value={form.phone} onChange={update('phone')} inputMode="tel" className={`${input} mt-1`} />
                  </label>
                  <label className="block text-sm font-medium">{t('messageEmail')}
                    <input type="email" value={form.email} onChange={update('email')} className={`${input} mt-1`} />
                  </label>
                  <label className="block text-sm font-medium">{t('messageText')}
                    <textarea value={form.message} onChange={update('message')} rows={3} minLength={5} maxLength={2000} required className={`${input} mt-1`} />
                  </label>
                  {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                  <button type="submit" disabled={busy} className="w-full rounded-lg bg-cta py-2.5 text-sm font-bold text-white hover:bg-cta-dark disabled:opacity-60">
                    {busy ? t('sendingMessage') : t('sendMessage')}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-2 bg-surface p-3">
              <Link to="/messages" onClick={() => setOpen(false)} className={`${row} justify-between`}>
                <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-cta text-white"><Bell size={18} /></span>{t('messageInbox')}</span>
                {unreadReplies > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{unreadReplies}</span>}
              </Link>
              <button type="button" onClick={() => setShowForm(true)} className={`${row} w-full text-left`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white"><MessageCircle size={18} /></span>
                {t('websiteMessage')}
              </button>
              <a href={LINKS.messenger} target="_blank" rel="noreferrer" className={row}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white"><Facebook size={18} /></span>
                {t('messenger')}
              </a>
              <a href={LINKS.whatsapp} target="_blank" rel="noreferrer" className={row}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white"><MessageCircle size={18} /></span>
                <span>{t('whatsapp')}<small className="block text-xs font-normal text-gray-500">+880 1612-633433</small></span>
              </a>
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('chatTitle')} aria-expanded={open}
        className="relative ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-cta text-white shadow-lg transition hover:scale-105 hover:bg-cta-dark"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
        {!open && unreadReplies > 0 && <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">{unreadReplies}</span>}
      </button>
    </div>
  );
}
