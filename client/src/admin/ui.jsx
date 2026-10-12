import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className={`max-h-[92vh] w-full overflow-auto rounded-2xl bg-white p-6 shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold text-brand">{title}</h2><button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-gray-100"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}

export const Card = ({ children, className = '' }) => <div className={`overflow-x-auto rounded-xl border bg-white p-4 ${className}`}>{children}</div>;
export const th = 'whitespace-nowrap border-b px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500';
export const td = 'whitespace-nowrap border-b px-3 py-2.5 text-sm';
export const field = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';
export const btnPrimary = 'rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60';
export const btnCta = 'rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-white hover:bg-cta-dark disabled:opacity-60';
export const btnGhost = 'rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50';
