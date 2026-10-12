import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const money = (n) => `৳${Number(n).toLocaleString('en-US')}.00`;
const unit = (p) => p.discountPrice || p.price;

/**
 * items:       [{ _id, name, images, price, discountPrice, qty }]
 * suggestions: products for "You May Also Like"
 * handlers:    onInc(id) onDec(id) onRemove(id) onAdd(product)
 */
export default function CartDrawer({ open, onClose, items = [], suggestions = [], onInc, onDec, onRemove, onAdd }) {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const rail = useRef(null);
  const total = items.reduce((sum, i) => sum + unit(i) * i.qty, 0);
  const scroll = (dir) => rail.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  const inCart = new Set(items.map((i) => i._id));
  const ideas = suggestions.filter((s) => !inCart.has(s._id));

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-50 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <aside
        role="dialog" aria-label={t('shoppingCart')} aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b bg-white px-5 py-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-brand">{t('shoppingCart')}</h2>
          <button onClick={onClose} className="flex items-center gap-1 text-gray-700 hover:text-cta">{t('close')} <X size={18} /></button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-500">
              <ShoppingCart size={48} /> <p>{t('emptyCart')}</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
              <img src={item.images?.[0]} alt="" className="h-16 w-16 rounded-lg border object-cover" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{item.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-700">
                  <div className="flex items-center rounded-full border">
                    <button onClick={() => onDec(item._id)} aria-label="Decrease" className="p-1.5 hover:text-cta"><Minus size={14} /></button>
                    <span className="w-6 text-center text-sm">{item.qty}</span>
                    <button onClick={() => onInc(item._id)} aria-label="Increase" className="p-1.5 hover:text-cta"><Plus size={14} /></button>
                  </div>
                  <span>× {money(unit(item))} = <b className="text-brand">{money(unit(item) * item.qty)}</b></span>
                </div>
              </div>
              <button onClick={() => onRemove(item._id)} aria-label="Remove" className="p-1 text-gray-500 hover:text-red-600"><X size={20} /></button>
            </div>
          ))}
        </div>

        <div className="border-t bg-gray-100 p-4">
          {ideas.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="border-b-2 border-cta pb-1 text-base font-bold text-gray-900">{t('alsoLike')}</h3>
                <div className="flex gap-2">
                  <button onClick={() => scroll(-1)} aria-label="Previous" className="rounded-full bg-cta p-1.5 text-white"><ChevronLeft size={16} /></button>
                  <button onClick={() => scroll(1)} aria-label="Next" className="rounded-full bg-cta p-1.5 text-white"><ChevronRight size={16} /></button>
                </div>
              </div>
              <div ref={rail} className="flex snap-x gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {ideas.slice(0, 8).map((p) => (
                  <div key={p._id} className="flex w-60 shrink-0 snap-start items-center gap-3 rounded-xl border bg-white p-3">
                    <img src={p.images?.[0]} alt="" className="h-14 w-14 rounded object-cover" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-sm text-gray-600">{money(unit(p))}</p>
                      <button onClick={() => onAdd(p)} className="mt-1 flex items-center gap-1 rounded-full bg-cta px-3 py-0.5 text-sm font-medium text-white hover:bg-cta-dark">
                        <Plus size={14} /> {t('add')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between text-lg font-bold">
            <span>{t('total')}:</span><span>{money(total)}</span>
          </div>
          <button
            disabled={items.length === 0}
            onClick={() => { onClose(); navigate('/checkout'); }}
            className="w-full rounded-lg bg-cta py-3 font-bold tracking-wide text-white hover:bg-cta-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('checkout')}
          </button>
          {!user && (
            <p className="mt-3 text-center text-sm text-gray-600">
              {t('loginHint')}{' '}
              <Link to="/login?redirect=/checkout" onClick={onClose} className="font-semibold text-brand underline">{t('login')}</Link>
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
