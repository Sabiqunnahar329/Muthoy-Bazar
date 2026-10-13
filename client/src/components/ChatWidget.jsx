import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Bell, Facebook, MessageCircle, RefreshCw, X } from 'lucide-react';
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
  const [showInbox, setShowInbox] = useState(false);
  const [inboxMessages, setInboxMessages] = useState(null);
  const [inboxError, setInboxError] = useState('');
  const { t } = useLang();
  const { user } = useAuth();

  const row = 'flex items-center gap-3 rounded-xl border bg-white px-4 py-3 font-medium text-gray-800 transition hover:border-cta hover:bg-brand-light';
  const input = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const refreshUnread = useCallback(async () => {
    const { data } = await api.post('/support/inbox', { accessCodes: getSupportAccessCodes() });
    setUnreadReplies(data.filter((message) => message.unreadReply).length);
  }, []);

  const loadInbox = useCallback(async () => {
    setInboxError('');
    try {
      const { data } = await api.post('/support/inbox', { accessCodes: getSupportAccessCodes() });
      setInboxMessages(data);
      const unread = data.filter((message) => message.unreadReply);
      if (unread.length) {
        const results = await Promise.allSettled(unread.map((message) => api.patch(`/support/inbox/${message._id}/read`, {
          accessCodes: getSupportAccessCodes(),
        })));
        const readIds = new Set(unread.filter((_, index) => results[index].status === 'fulfilled').map((message) => message._id));
        setInboxMessages((current) => current.map((message) => readIds.has(message._id) ? { ...message, unreadReply: false } : message));
        setUnreadReplies(unread.length - readIds.size);
        if (results.some((result) => result.status === 'rejected')) setInboxError(t('inboxError'));
      } else {
        setUnreadReplies(0);
      }
    } catch (loadError) {
      setInboxError(apiError(loadError, t('inboxError')));
    }
  }, [t]);

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

  const openInbox = () => {
    setShowInbox(true);
    setShowForm(false);
    loadInbox();
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
                  <button type="button" onClick={openInbox} className="font-semibold text-brand underline">{t('messageInbox')}</button>
                  <details className="text-xs">
                    <summary className="cursor-pointer">{t('inboxRecovery')}</summary>
                    <p className="mt-2">{t('inboxCodeSaved')}</p>
                    <code className="mt-1 block break-all rounded bg-white p-2">{accessCode}</code>
                  </details>
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
          ) : showInbox ? (
            <div className="max-h-[70vh] overflow-y-auto bg-surface p-3">
              <div className="mb-3 flex items-center justify-between">
                <button type="button" onClick={() => setShowInbox(false)} className="flex items-center gap-1 text-sm text-brand hover:underline">
                  <ArrowLeft size={16} />{t('messageBack')}
                </button>
                <button type="button" onClick={loadInbox} aria-label={t('inboxRefresh')} className="rounded p-1 text-brand hover:bg-white"><RefreshCw size={16} /></button>
              </div>
              <h2 className="mb-3 font-bold">{t('inboxTitle')}</h2>
              {inboxError && <p role="alert" className="mb-3 rounded bg-red-50 p-2 text-xs text-red-700">{inboxError}</p>}
              {inboxMessages === null ? <p className="text-sm text-gray-500">{t('inboxLoading')}</p> : inboxMessages.length === 0 ? (
                <p className="rounded-lg bg-white p-3 text-sm text-gray-600">{t('inboxEmpty')}</p>
              ) : (
                <ul className="space-y-3">
                  {inboxMessages.map((message) => (
                    <li key={message._id} className="rounded-lg border bg-white p-3">
                      <p className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
                      {message.subject && <p className="mt-1 text-sm font-semibold">{message.subject}</p>}
                      <div className="mt-2 space-y-2">
                        {(message.thread || [
                          { sender: 'customer', text: message.message, createdAt: message.createdAt },
                          ...(message.reply ? [{ sender: 'admin', text: message.reply, createdAt: message.repliedAt }] : []),
                        ]).map((entry, index) => (
                          <div key={`${entry.sender}-${entry.createdAt || index}`} className={`rounded p-2 ${entry.sender === 'admin' ? 'border-l-2 border-brand bg-brand-light' : 'bg-surface'}`}>
                            <p className={`mb-1 text-[11px] font-semibold ${entry.sender === 'admin' ? 'text-brand' : 'text-gray-600'}`}>
                              {entry.sender === 'admin' ? t('inboxReply') : t('inboxSent')} · {new Date(entry.createdAt).toLocaleString()}
                            </p>
                            <p className="whitespace-pre-wrap text-xs">{entry.text}</p>
                          </div>
                        ))}
                      </div>
                      {!message.reply && <p className="mt-2 text-xs text-gray-500">{t('inboxWaiting')}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/messages" onClick={() => setOpen(false)} className="mt-3 inline-block text-xs font-medium text-brand underline">{t('inboxFullPage')}</Link>
            </div>
          ) : (
            <div className="space-y-2 bg-surface p-3">
              <button type="button" onClick={openInbox} className={`${row} w-full justify-between text-left`}>
                <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-cta text-white"><Bell size={18} /></span>{t('messageInbox')}</span>
                {unreadReplies > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{unreadReplies}</span>}
              </button>
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
