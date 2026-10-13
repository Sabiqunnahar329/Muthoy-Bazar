import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { useLang } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getSupportAccessCodes, saveSupportAccessCode } from '../lib/supportInbox.js';

export default function Messages() {
  const { t } = useLang();
  const { user } = useAuth();
  const [messages, setMessages] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadMessages = useCallback(async () => {
    setError('');
    try {
      const { data } = await api.post('/support/inbox', { accessCodes: getSupportAccessCodes() });
      const unread = data.filter((message) => message.unreadReply);
      setMessages(data);
      if (unread.length) {
        const results = await Promise.allSettled(unread.map((message) => api.patch(`/support/inbox/${message._id}/read`, {
          accessCodes: getSupportAccessCodes(),
        })));
        const readIds = new Set(unread.filter((_, index) => results[index].status === 'fulfilled').map((message) => message._id));
        setMessages((current) => current.map((message) => readIds.has(message._id) ? { ...message, unreadReply: false } : message));
        if (results.some((result) => result.status === 'rejected')) setError(t('inboxError'));
      }
    } catch (requestError) {
      setError(apiError(requestError, t('inboxError')));
    }
  }, [t]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, [loadMessages, user]);

  const addCode = async (event) => {
    event.preventDefault();
    const code = accessCode.trim();
    if (!/^[a-f\d]{64}$/i.test(code)) {
      setError(t('inboxCodeInvalid'));
      return;
    }
    saveSupportAccessCode(code);
    setAccessCode('');
    setBusy(true);
    await loadMessages();
    setBusy(false);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('inboxTitle')}</h1>
        <Link to="/" className="text-sm font-medium text-brand hover:underline">{t('inboxBack')}</Link>
      </div>
      <p className="mt-2 text-sm text-gray-600">{t('inboxHelp')}</p>

      <form onSubmit={addCode} className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} aria-label={t('inboxCodeLabel')} placeholder={t('inboxCodeLabel')} className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
        <button disabled={busy} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{t('inboxAddCode')}</button>
      </form>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {messages === null ? <p className="mt-6 text-gray-500">{t('inboxLoading')}</p> : messages.length === 0 ? (
        <p className="mt-6 rounded-xl border bg-white p-5 text-gray-600">{t('inboxEmpty')}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {messages.map((message) => (
            <li key={message._id} className="rounded-xl border bg-white p-5">
              <p className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
              {message.subject && <h2 className="mt-1 font-semibold">{message.subject}</h2>}
              <div className="mt-3 space-y-3">
                {(message.thread || [
                  { sender: 'customer', text: message.message, createdAt: message.createdAt },
                  ...(message.reply ? [{ sender: 'admin', text: message.reply, createdAt: message.repliedAt }] : []),
                ]).map((entry, index) => (
                  <div key={`${entry.sender}-${entry.createdAt || index}`} className={`rounded-lg p-3 ${entry.sender === 'admin' ? 'border-l-4 border-brand bg-brand-light' : 'bg-surface'}`}>
                    <p className={`mb-1 text-xs font-semibold ${entry.sender === 'admin' ? 'text-brand' : 'text-gray-600'}`}>
                      {entry.sender === 'admin' ? t('inboxReply') : t('inboxSent')} · {new Date(entry.createdAt).toLocaleString()}
                    </p>
                    <p className="whitespace-pre-wrap text-sm">{entry.text}</p>
                  </div>
                ))}
              </div>
              {!message.reply && <p className="mt-3 text-sm text-gray-500">{t('inboxWaiting')}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
