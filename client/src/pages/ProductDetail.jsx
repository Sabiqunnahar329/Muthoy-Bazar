import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import api from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { money, emoji, productName } from '../lib/helpers.js';
import { trackEvent } from '../lib/trackEvent.js';
import { useLang } from '../context/LanguageContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { lang } = useLang();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setP(null); setQty(1); setImg(0); setMissing(false);
    api.get(`/products/${id}`).then(async (r) => {
      setP(r.data);
      trackEvent('ViewContent', { product: id, path: `/product/${id}` });
      const rel = await api.get('/products', { params: { category: r.data.category?.name, limit: 6 } }).catch(() => null);
      setRelated((rel?.data.products || []).filter((x) => x._id !== id).slice(0, 5));
    }).catch(() => setMissing(true));
  }, [id]);

  if (missing) return <p className="py-20 text-center">This product was not found. <Link to="/shop" className="text-brand underline">Back to shop</Link></p>;
  if (!p) return <p className="py-20 text-center text-gray-500">Loading…</p>;
  const price = p.discountPrice || p.price;
  const out = p.stock < 1;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <p className="text-sm text-gray-500"><Link to="/" className="text-brand hover:underline">Home</Link> / <Link to={`/shop?category=${encodeURIComponent(p.category?.name || '')}`} className="text-brand hover:underline">{p.category?.name}</Link> / {productName(p, lang)}</p>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-brand-light">
            <span className="absolute inset-0 flex items-center justify-center text-8xl">{emoji(p.category?.name)}</span>
            {p.images?.[img] && <img src={p.images[img]} alt={productName(p, lang)} onError={(e) => (e.currentTarget.style.display = 'none')} className="absolute inset-0 h-full w-full object-cover" />}
          </div>
          {p.images?.length > 1 && (
            <div className="mt-3 flex gap-2">{p.images.map((u, i) => <button key={u} onClick={() => setImg(i)} className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${i === img ? 'border-cta' : 'border-transparent'}`}><img src={u} alt="" className="h-full w-full object-cover" /></button>)}</div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500">{p.brand}</p>
          <h1 className="text-3xl font-bold">{productName(p, lang)}</h1>
          <p className="mt-1 text-gray-500">{p.weight} {p.unit} · SKU {p.sku}</p>
          <p className="mt-4 text-3xl font-bold text-brand">{money(price)} {p.discountPrice > 0 && <s className="ml-2 text-lg font-normal text-gray-400">{money(p.price)}</s>}</p>
          <p className={`mt-2 text-sm font-medium ${out ? 'text-red-600' : p.stock < 10 ? 'text-amber-700' : 'text-green-700'}`}>{out ? 'Out of stock' : p.stock < 10 ? `Only ${p.stock} left` : 'In stock'}</p>
          <p className="mt-4 leading-relaxed text-gray-700">{p.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border bg-white">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" className="p-3 hover:text-cta"><Minus size={16} /></button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} aria-label="Increase" className="p-3 hover:text-cta"><Plus size={16} /></button>
            </div>
            <button disabled={out} onClick={() => add(p, qty)} className="rounded-lg border-2 border-brand px-6 py-2.5 font-semibold text-brand hover:bg-brand-light disabled:opacity-50">Add To Cart</button>
            <button disabled={out} onClick={() => { add(p, qty, false); navigate('/checkout'); }} className="rounded-lg bg-cta px-8 py-2.5 font-bold text-white hover:bg-cta-dark disabled:opacity-50">Buy now</button>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-12"><h2 className="mb-4 text-2xl font-bold">Related products</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{related.map((r) => <ProductCard key={r._id} p={r} />)}</div>
        </section>
      )}
    </main>
  );
}
