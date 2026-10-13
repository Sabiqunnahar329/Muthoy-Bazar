import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus, Star } from 'lucide-react';
import api from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { money, emoji, productName } from '../lib/helpers.js';
import { trackEvent } from '../lib/trackEvent.js';
import { useLang } from '../context/LanguageContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();
  const { lang } = useLang();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [missing, setMissing] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    setP(null); setQty(1); setImg(0); setMissing(false); setReviewError(''); setReviewSuccess(''); setRating(5); setReviewerName(''); setReviewText('');
    api.get(`/products/${id}`).then(async (r) => {
      setP(r.data);
      trackEvent('ViewContent', { product: id, path: `/product/${id}` });
      const rel = await api.get('/products', { params: { category: r.data.category?.name, limit: 6 } }).catch(() => null);
      setRelated((rel?.data.products || []).filter((x) => x._id !== id).slice(0, 5));
    }).catch(() => setMissing(true));
  }, [id]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const { data } = await api.post(`/products/${id}/reviews`, { name: user?.name || reviewerName, rating, review: reviewText });
      setP(data);
      setReviewerName('');
      setReviewText('');
      setRating(5);
      setReviewSuccess('Thank you! Your review has been added.');
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Unable to save your review right now.');
    } finally {
      setSubmitting(false);
    }
  };

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

      <section className="mt-12 rounded-2xl border bg-white p-6">
        <h2 className="text-2xl font-bold">Ratings & reviews</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            {p.reviews?.length ? (
              <div className="space-y-4">
                {p.reviews.slice().reverse().map((review) => (
                  <div key={`${review.user}-${review.createdAt || review._id}`} className="rounded-xl border bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{review.name || 'Customer'}</p>
                        <div className="mt-1 flex items-center gap-1 text-amber-500">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < Number(review.rating || 0) ? 'currentColor' : 'none'} strokeWidth={1.8} />)}</div>
                      </div>
                      <span className="text-xs text-gray-500">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Just now'}</span>
                    </div>
                    <p className="mt-3 leading-relaxed text-gray-700">{review.review}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to share your feedback.</p>
            )}
          </div>

          <form onSubmit={handleReviewSubmit} className="rounded-2xl border bg-gray-50 p-5">
            <h3 className="text-lg font-semibold">Write a review</h3>
            <p className="mt-2 text-sm text-gray-600">You can leave a rating and review without logging in.</p>
            <>
                <div className="mt-4">
                  <label htmlFor="reviewerName" className="mb-2 block text-sm font-medium text-gray-700">Your name</label>
                  <input id="reviewerName" type="text" value={user?.name || reviewerName} onChange={(e) => setReviewerName(e.target.value)} maxLength={80} placeholder="Enter your name" className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-brand disabled:bg-gray-100" disabled={!!user} required />
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Your rating</label>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }, (_, index) => {
                      const value = index + 1;
                      return (
                        <button key={value} type="button" onClick={() => setRating(value)} className="text-2xl transition hover:scale-105" aria-label={`Rate ${value} out of 5`}>
                          <Star size={24} fill={value <= rating ? 'currentColor' : 'none'} className={value <= rating ? 'text-amber-500' : 'text-gray-300'} strokeWidth={1.8} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="review" className="mb-2 block text-sm font-medium text-gray-700">Your review</label>
                  <textarea id="review" value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows="4" maxLength={500} placeholder="Tell others what you liked or disliked about this product" className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none ring-0 transition focus:border-brand" required />
                </div>
                {reviewError && <p className="mt-3 text-sm text-red-600">{reviewError}</p>}
                {reviewSuccess && <p className="mt-3 text-sm text-green-600">{reviewSuccess}</p>}
                <button type="submit" disabled={submitting || !reviewText.trim()} className="mt-5 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit review'}
                </button>
            </>
          </form>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12"><h2 className="mb-4 text-2xl font-bold">Related products</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{related.map((r) => <ProductCard key={r._id} p={r} />)}</div>
        </section>
      )}
    </main>
  );
}
