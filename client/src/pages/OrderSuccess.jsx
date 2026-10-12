import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { money } from '../lib/helpers.js';

export default function OrderSuccess() {
  const { number } = useParams();
  const { state } = useLocation();
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle className="mx-auto text-green-600" size={64} />
      <h1 className="mt-4 text-2xl font-bold">Thank you! Your order is placed.</h1>
      <p className="mt-2 text-gray-600">Order ID: <b className="text-brand">{number}</b></p>
      {state?.total && <p className="text-gray-600">Total to pay: <b>{money(state.total)}</b> ({state.pay})</p>}
      <p className="mt-3 text-sm text-gray-500">We will confirm your order by SMS. Save the order ID to track it.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/track" className="rounded-lg border-2 border-brand px-5 py-2 font-semibold text-brand">Track order</Link>
        <Link to="/shop" className="rounded-lg bg-cta px-5 py-2 font-semibold text-white">Continue shopping</Link>
      </div>
    </main>
  );
}
