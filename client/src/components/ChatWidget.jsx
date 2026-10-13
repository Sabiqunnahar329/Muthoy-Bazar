import { useCallback, useEffect, useState } from 'react';
import { Facebook, MessageCircle, RefreshCw, Send, X } from 'lucide-react';
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
const emptyMessage = { name: '', phone: '', message: '' };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [form, setForm] = useState(emptyMessage);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [unreadReplies, setUnreadReplies] = useState(0);
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
        setInboxMessages((current) => (current || data).map((message) => readIds.has(message._id) ? { ...message, unreadReply: false } : message));
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

  useEffect(() => {
    if (!open || !showInbox) return undefined;
    const interval = setInterval(loadInbox, 15000);
    return () => clearInterval(interval);
  }, [loadInbox, open, showInbox]);

  const openInbox = () => {
    setShowInbox(true);
    setError('');
    if (inboxMessages === null) loadInbox();
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (inboxMessages?.length) {
        const latest = inboxMessages[0];
        const { data } = await api.post(`/support/inbox/${latest._id}/reply`, {
          accessCodes: getSupportAccessCodes(),
          message: replyText,
        });
        setInboxMessages((current) => current.map((item) => item._id === data._id ? data : item));
        setReplyText('');
      } else {
        const { data } = await api.post('/support', { ...form, source: 'support' });
        saveSupportAccessCode(data.accessCode);
        setForm(emptyMessage);
        setInboxMessages(null);
        await loadInbox();
      }
      refreshUnread().catch((refreshError) => console.error('Could not refresh support inbox:', refreshError.message));
    } catch (sendError) {
      setError(apiError(sendError, t('messageSendError')));
    } finally {
      setBusy(false);
    }
  };

  const conversations = inboxMessages || [];

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div role="dialog" aria-label={t('chatTitle')} className="mb-3 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex items-start justify-between bg-brand p-4 text-white">
            <div>
              <p className="font-bold">{t('chatTitle')}</p>
              <p className="text-sm text-white/85">{t('chatSub')}</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t('close')} className="rounded p-1 hover:bg-white/10"><X size={18} /></button>
          </div>
          {showInbox ? (
            <div className="max-h-[70vh] overflow-y-auto bg-surface p-3">
              <div className="mb-3 flex items-center justify-between">
                <button type="button" onClick={() => setShowInbox(false)} className="text-sm font-medium text-brand hover:underline">{t('messageBack')}</button>
                <button type="button" onClick={loadInbox} aria-label={t('inboxRefresh')} className="rounded p-1 text-brand hover:bg-white"><RefreshCw size={16} /></button>
              </div>
              {inboxError && <p role="alert" className="mb-3 rounded bg-red-50 p-2 text-xs text-red-700">{inboxError}</p>}
              {inboxMessages === null ? <p className="text-sm text-gray-500">{t('inboxLoading')}</p> : conversations.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {conversations.map((message) => {
                      const thread = message.thread || [
                        { sender: 'customer', text: message.message, createdAt: message.createdAt },
                        ...(message.reply ? [{ sender: 'admin', text: message.reply, createdAt: message.repliedAt }] : []),
                      ];
                      const waiting = thread[thread.length - 1]?.sender === 'customer';
                      return (
                        <article key={message._id} className="rounded-lg border bg-white p-3">
                          <p className="mb-2 text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
                          {message.subject && <p className="mb-2 text-sm font-semibold">{message.subject}</p>}
                          <div className="space-y-2">
                            {thread.map((entry, index) => (
                              <div key={`${entry.sender}-${entry.createdAt || index}`} className={`rounded p-2 ${entry.sender === 'admin' ? 'border-l-2 border-brand bg-brand-light' : 'bg-surface'}`}>
                                <p className={`mb-1 text-[11px] font-semibold ${entry.sender === 'admin' ? 'text-brand' : 'text-gray-600'}`}>
                                  {entry.sender === 'admin' ? t('inboxReply') : t('inboxSent')} · {new Date(entry.createdAt).toLocaleString()}
                                </p>
                                <p className="whitespace-pre-wrap text-xs">{entry.text}</p>
                              </div>
                            ))}
                          </div>
                          {waiting && <p className="mt-2 text-xs text-gray-500">{t('inboxWaiting')}</p>}
                        </article>
                      );
                    })}
                  </div>
                  <form onSubmit={sendMessage} className="mt-3 space-y-2">
                    <label htmlFor="chat-reply" className="sr-only">{t('messageText')}</label>
                    <textarea id="chat-reply" value={replyText} onChange={(event) => setReplyText(event.target.value)} rows={2} minLength={2} maxLength={2000} required placeholder={t('messageText')} className={input} />
                    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                    <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cta py-2.5 text-sm font-bold text-white hover:bg-cta-dark disabled:opacity-60">
                      <Send size={15} />{busy ? t('sendingMessage') : t('sendMessage')}
                    </button>
                  </form>
                </>
              ) : (
                <form onSubmit={sendMessage} className="space-y-3">
                  <label className="block text-sm font-medium">{t('messageName')}
                    <input value={form.name} onChange={update('name')} maxLength={80} required className={`${input} mt-1`} />
                  </label>
                  <label className="block text-sm font-medium">{t('messagePhone')}
                    <input value={form.phone} onChange={update('phone')} inputMode="tel" autoComplete="tel" pattern="01[3-9][0-9]{8}" maxLength={11} placeholder="01XXXXXXXXX" required className={`${input} mt-1`} />
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
              <button type="button" onClick={openInbox} className={`${row} relative w-full justify-between text-left`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white"><MessageCircle size={18} /></span>
                <span className="flex-1">{t('websiteMessage')}</span>
                {unreadReplies > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{unreadReplies}</span>}
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
        onClick={() => setOpen((value) => !value)}
        aria-label={t('chatTitle')} aria-expanded={open}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-cta text-white shadow-lg transition hover:scale-105 hover:bg-cta-dark"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}
