import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { money, fmtDate, statusStyle, apiError } from '../lib/helpers.js';

export default function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [orderError, setOrderError] = useState('');
  const [reviewError, setReviewError] = useState('');
  useEffect(() => {
    if (!user) return;
    api.get('/orders/my').then((r) => setOrders(r.data)).catch((error) => setOrderError(apiError(error)));
    api.get('/products/my/reviews').then((r) => setReviews(r.data)).catch((error) => setReviewError(apiError(error)));
  }, [user]);
  if (!user) return <Navigate to="/login?redirect=/account" replace />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">{user.name}</h1><p className="text-gray-500">{user.email || user.phone}</p></div>
        <button onClick={logout} className="rounded-lg border px-4 py-2 hover:bg-gray-50">Logout</button>
      </div>
      <h2 className="mb-3 mt-8 text-lg font-bold">My orders</h2>
      {orderError && <p role="alert" className="mb-3 text-sm text-red-700">{orderError}</p>}
      {orders === null ? <p className="text-gray-500">Loading…</p> : orderError ? null : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet. <Link to="/shop" className="text-brand underline">Start shopping</Link></p>
      ) : (
        <ul className="space-y-3">{orders.map((o) => (
          <li key={o._id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><b>{o.orderNumber}</b><p className="text-sm text-gray-500">{fmtDate(o.createdAt)}</p></div><span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${statusStyle[o.status]}`}>{o.status}</span></div>
            <Link to={`/track/${o.orderNumber}`} className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">Track order</Link>
            <ul className="mt-4 divide-y rounded-lg border">
              {o.items.map((item, index) => (
                <li key={`${item.product || item.name}-${index}`} className="flex items-start gap-3 p-3">
                  {item.image && <img src={item.image} alt="" className="h-12 w-12 rounded object-cover" />}
                  <div className="min-w-0 flex-1">
                    {item.product ? <Link to={`/product/${item.product}`} className="font-medium text-brand hover:underline">{item.name}</Link> : <p className="font-medium">{item.name}</p>}
                    <p className="text-sm text-gray-500">Qty {item.qty} · {money(item.price)} each</p>
                    {item.reviewRating && (
                      <div className="mt-2 rounded bg-surface p-2">
                        <div className="flex items-center gap-1 text-amber-500" aria-label={`${item.reviewRating} out of 5 stars`}>
                          {Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} fill={index < item.reviewRating ? 'currentColor' : 'none'} />)}
                        </div>
                        {item.reviewText && <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{item.reviewText}</p>}
                      </div>
                    )}
                  </div>
                  <b className="text-sm">{money(item.price * item.qty)}</b>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right font-semibold">Order total: {money(o.total)}</p>
          </li>))}
        </ul>
      )}

      <h2 className="mb-3 mt-8 text-lg font-bold">My ratings & reviews</h2>
      {reviewError && <p role="alert" className="mb-3 text-sm text-red-700">{reviewError}</p>}
      {reviews === null ? <p className="text-gray-500">Loading…</p> : reviewError ? null : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews linked to this account yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={`${review.product}-${review.createdAt}`} className="rounded-xl border bg-white p-4">
              <Link to={`/product/${review.product}`} className="font-semibold text-brand hover:underline">{review.name}</Link>
              <div className="mt-1 flex items-center gap-1 text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < review.rating ? 'currentColor' : 'none'} />)}
              </div>
              {review.review && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{review.review}</p>}
              <p className="mt-2 text-xs text-gray-500">{fmtDate(review.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
