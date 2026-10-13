import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';

export default function OrderReview() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/review/${token}`)
      .then(({ data }) => setOrder(data))
      .catch((requestError) => setError(apiError(requestError, 'This feedback link is invalid or has expired.')));
  }, [token]);

  const submit = async (product) => {
    setError('');
    const rating = ratings[product];
    if (!rating) {
      setError('Choose a star rating before submitting.');
      return;
    }
    setBusy(product);
    try {
      await api.post(`/orders/review/${token}`, { product, rating, review: reviews[product] || '' });
      setOrder((current) => ({
        ...current,
        items: current.items.map((item) => item.product === product ? { ...item, reviewed: true } : item),
      }));
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setBusy('');
    }
  };

  if (error && !order) {
    return <main className="mx-auto max-w-2xl px-4 py-16 text-center"><p role="alert" className="text-red-700">{error}</p></main>;
  }
  if (!order) return <main className="py-16 text-center text-gray-500">Loading your order…</main>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">How was your order?</h1>
      <p className="mt-2 text-gray-600">Order {order.orderNumber}. Rate each item; writing a review is optional.</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <ul className="mt-6 space-y-4">
        {order.items.map((item) => (
          <li key={item.product} className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              {item.image && <img src={item.image} alt="" className="h-14 w-14 rounded-lg object-cover" />}
              <h2 className="font-semibold">{item.name}</h2>
            </div>
            {item.reviewed ? (
              <p role="status" className="mt-4 text-sm font-medium text-green-700">Thank you for your feedback!</p>
            ) : (
              <>
                <div className="mt-4 flex gap-1" aria-label={`Rating for ${item.name}`}>
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    return (
                      <button key={value} type="button" onClick={() => setRatings((current) => ({ ...current, [item.product]: value }))} aria-label={`Rate ${value} out of 5`} className="p-1">
                        <Star size={25} fill={value <= (ratings[item.product] || 0) ? 'currentColor' : 'none'} className={value <= (ratings[item.product] || 0) ? 'text-amber-500' : 'text-gray-300'} />
                      </button>
                    );
                  })}
                </div>
                <label className="mt-3 block text-sm font-medium" htmlFor={`review-${item.product}`}>Review (optional)</label>
                <textarea id={`review-${item.product}`} value={reviews[item.product] || ''} onChange={(event) => setReviews((current) => ({ ...current, [item.product]: event.target.value }))} maxLength={500} rows={3} placeholder="Tell us what you think (optional)" className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30" />
                <button type="button" onClick={() => submit(item.product)} disabled={busy === item.product} className="mt-3 rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                  {busy === item.product ? 'Submitting…' : 'Submit rating'}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
