import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { money, emoji } from '../lib/helpers.js';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const { t } = useLang();
  const navigate = useNavigate();
  const price = p.discountPrice || p.price;
  const save = p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
  const out = p.stock < 1;
  const badge = p.isBestSeller ? 'Best Selling' : p.isNewArrival ? 'New Arrival' : '';

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/product/${p._id}`} className="relative block aspect-square overflow-hidden bg-brand-light">
        <span className="absolute inset-0 flex items-center justify-center text-5xl">{emoji(p.category?.name)}</span>
        {p.images?.[0] && (
          <img src={p.images[0]} alt={p.name} loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 hover:scale-105" />
        )}
        {badge && <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">{badge}</span>}
        {save > 0 && <span className="absolute right-2 top-2 rounded-full bg-cta px-2 py-0.5 text-xs font-semibold text-white">Save {save}%</span>}
      </Link>
      <div className="flex-1 p-3">
        <p className="text-xs text-gray-500">{p.brand}</p>
        <Link to={`/product/${p._id}`} className="line-clamp-2 font-semibold leading-snug hover:text-brand">{p.name}</Link>
        <p className="mt-0.5 text-xs text-gray-500">{p.weight} {p.unit}{p.stock > 0 && p.stock < 10 ? ` · only ${p.stock} left` : ''}</p>
        <p className="mt-1 text-lg font-bold text-brand">
          {money(price)} {p.discountPrice > 0 && <s className="ml-1 text-sm font-normal text-gray-400">{money(p.price)}</s>}
        </p>
      </div>
      <div className="grid gap-2 p-3 pt-0">
        <button disabled={out} onClick={() => add(p)} className="rounded-lg border-2 border-brand py-1.5 text-sm font-semibold text-brand hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50">
          {out ? 'Out of stock' : 'Add To Cart'}
        </button>
        <button disabled={out} onClick={() => { add(p, 1, false); navigate('/checkout'); }} className="rounded-lg bg-cta py-1.5 text-sm font-bold text-white hover:bg-cta-dark disabled:cursor-not-allowed disabled:opacity-50">
          Buy now
        </button>
      </div>
    </article>
  );
}
