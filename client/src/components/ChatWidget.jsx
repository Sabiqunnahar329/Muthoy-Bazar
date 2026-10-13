import { useState } from 'react';
import { ArrowLeft, MessageCircle, X, Phone } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';

const WHATSAPP = '8801612633433';
const LINKS = {
  whatsapp: `https://wa.me/${WHATSAPP}`,
  call: `tel:+${WHATSAPP}`,
};
const emptyMessage = { name: '', phone: '', email: '', message: '' };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyMessage);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const { t } = useLang();

  const row = 'flex items-center gap-3 rounded-xl border bg-white px-4 py-3 font-medium text-gray-800 transition hover:border-cta hover:bg-brand-light';
  const input = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const sendMessage = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.phone.trim() && !form.email.trim()) {
      setError(t('messageRequiredContact'));
      return;
    }
    setBusy(true);
    try {
      await api.post('/support', { ...form, source: 'support' });
      setSent(true);
      setForm(emptyMessage);
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
                <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{t('messageSent')}</p>
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
              <button type="button" onClick={() => setShowForm(true)} className={`${row} w-full text-left`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white"><MessageCircle size={18} /></span>
                {t('messenger')}
              </button>
              <a href={LINKS.whatsapp} target="_blank" rel="noreferrer" className={row}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white"><MessageCircle size={18} /></span>
                <span>{t('whatsapp')}<small className="block text-xs font-normal text-gray-500">+880 1612-633433</small></span>
              </a>
              <a href={LINKS.call} className={row}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cta text-white"><Phone size={18} /></span>
                {t('helpline')}
              </a>
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('chatTitle')} aria-expanded={open}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-cta text-white shadow-lg transition hover:scale-105 hover:bg-cta-dark"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}
