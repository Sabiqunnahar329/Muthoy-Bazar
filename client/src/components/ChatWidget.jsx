import { useState } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const WHATSAPP = '8801612633433';
const LINKS = {
  messenger: 'https://m.me/MuthoyBazaar', // opens the chat directly; page: https://www.facebook.com/MuthoyBazaar
  whatsapp: `https://wa.me/${WHATSAPP}`,
  call: `tel:+${WHATSAPP}`,
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  const row = 'flex items-center gap-3 rounded-xl border bg-white px-4 py-3 font-medium text-gray-800 transition hover:border-cta hover:bg-orange-50';

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
          <div className="space-y-2 bg-surface p-3">
            <a href={LINKS.messenger} target="_blank" rel="noreferrer" className={row}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white"><MessageCircle size={18} /></span>
              {t('messenger')}
            </a>
            <a href={LINKS.whatsapp} target="_blank" rel="noreferrer" className={row}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white"><MessageCircle size={18} /></span>
              <span>{t('whatsapp')}<small className="block text-xs font-normal text-gray-500">+880 1612-633433</small></span>
            </a>
            <a href={LINKS.call} className={row}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cta text-white"><Phone size={18} /></span>
              {t('helpline')}
            </a>
          </div>
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
