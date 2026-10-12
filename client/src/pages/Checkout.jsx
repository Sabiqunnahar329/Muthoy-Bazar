import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { money, PHONE_RE, apiError, productName } from '../lib/helpers.js';
import { trackEvent } from '../lib/trackEvent.js';

// Delivery charge is worked out automatically. The server repeats this check, so the price cannot be changed in the browser.
const DHAKA_FEE = 80;
const OTHER_FEE = 150;
const isDhaka = (text) => /dhaka|ঢাকা/i.test(text || '');

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: user?.name || '', phone: user?.phone || '', city: '', address: '', pay: 'COD', sender: '', trx: '' });
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [busy, setBusy] = useState(false);
  const checkoutTracked = useRef(false);

  useEffect(() => {
    if (items.length && !checkoutTracked.current) {
      checkoutTracked.current = true;
      trackEvent('InitiateCheckout', { path: '/checkout' });
    }
  }, [items.length]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const located = f.city.trim() !== '' || f.address.trim() !== '';
  const inDhaka = isDhaka(`${f.city} ${f.address}`);
  const shipping = located ? (inDhaka ? DHAKA_FEE : OTHER_FEE) : null; // null until the customer types a city or address
  const discount = coupon?.discount || 0;
  const total = subtotal - discount + (shipping ?? 0);

  if (!items.length) {
    return <main className="mx-auto max-w-xl px-4 py-20 text-center"><p className="text-lg">Your cart is empty.</p><Link to="/shop" className="mt-4 inline-block rounded-lg bg-cta px-6 py-2.5 font-semibold text-white">Continue shopping</Link></main>;
  }

  const applyCoupon = async () => {
    setCouponMsg('');
    try { const { data } = await api.post('/coupons/validate', { code, subtotal }); setCoupon(data); setCouponMsg(`Coupon applied: you save ${money(data.discount)}`); }
    catch (e) { setCoupon(null); setCouponMsg(apiError(e, 'This coupon code is not valid')); }
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Enter your name';
    if (!PHONE_RE.test(f.phone)) er.phone = 'Enter a valid 11-digit number starting with 01';
    if (!f.city.trim()) er.city = 'Enter your city or district';
    if (f.address.trim().length < 8) er.address = 'Enter your full delivery address';
    if (f.pay !== 'COD') { if (!PHONE_RE.test(f.sender)) er.sender = 'Enter the number you paid from'; if (!f.trx.trim()) er.trx = 'Enter the transaction ID'; }
    setErrors(er); setServerErr('');
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const { data } = await api.post('/orders', {
        customer: { name: f.name, phone: f.phone, city: f.city, address: f.address },
        items: items.map((i) => ({ product: i._id, qty: i.qty })), paymentMethod: f.pay, senderNumber: f.sender, trxId: f.trx, couponCode: coupon?.code,
      });
      clear();
      navigate(`/order-success/${data.orderNumber}`, { state: { total: data.total, pay: data.paymentMethod } });
    } catch (err) { setServerErr(apiError(err)); } finally { setBusy(false); }
  };

  const input = (k) => `w-full rounded-lg border bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 ${errors[k] ? 'border-red-500' : 'border-gray-300'}`;
  const opt = 'flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-4 py-3 has-[:checked]:border-brand has-[:checked]:bg-brand-light';
  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-sm text-red-600">{errors[k]}</p> : null);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-5">
      <form onSubmit={submit} noValidate className="space-y-4 lg:col-span-3">
        <h1 className="text-2xl font-bold">Checkout</h1>
        {!user && <p className="rounded-lg bg-brand-light px-4 py-2 text-sm">Have an account? <Link to="/login?redirect=/checkout" className="font-semibold text-brand underline">Log in</Link> (optional). You can also order as a guest.</p>}
        <div><label htmlFor="co-name" className="mb-1 block text-sm font-medium">Full name</label><input id="co-name" value={f.name} onChange={set('name')} className={input('name')} /><Err k="name" /></div>
        <div><label htmlFor="co-phone" className="mb-1 block text-sm font-medium">Phone number</label><input id="co-phone" value={f.phone} onChange={set('phone')} inputMode="numeric" placeholder="01XXXXXXXXX" className={input('phone')} /><Err k="phone" /></div>
        <div>
          <label htmlFor="co-city" className="mb-1 block text-sm font-medium">City / District</label>
          <input id="co-city" value={f.city} onChange={set('city')} placeholder="e.g. Dhaka, Chattogram, Sylhet" className={input('city')} />
          <Err k="city" />
        </div>
        <div><label htmlFor="co-address" className="mb-1 block text-sm font-medium">Delivery address</label><textarea id="co-address" rows={2} value={f.address} onChange={set('address')} placeholder="House, road, area" className={input('address')} /><Err k="address" /></div>
        <div className="grid gap-2 sm:grid-cols-3">
          {['COD', 'bKash', 'Nagad'].map((m) => <label key={m} className={opt}><input type="radio" name="pay" checked={f.pay === m} onChange={() => setF((s) => ({ ...s, pay: m }))} /> {m === 'COD' ? 'Cash on delivery' : m}</label>)}
        </div>
        {f.pay !== 'COD' && (
          <div className="space-y-3 rounded-lg bg-brand-light p-4">
            <p className="text-sm">Send {money(total)} to our {f.pay} number <b>01612-633433</b> (Send Money), then enter the details below.</p>
            <div><input value={f.sender} onChange={set('sender')} placeholder="Number you paid from" aria-label="Number you paid from" className={input('sender')} /><Err k="sender" /></div>
            <div><input value={f.trx} onChange={set('trx')} placeholder="Transaction ID" aria-label="Transaction ID" className={input('trx')} /><Err k="trx" /></div>
          </div>
        )}
        {serverErr && <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-red-700">{serverErr}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-cta py-3 text-lg font-bold text-white hover:bg-cta-dark disabled:opacity-60">{busy ? 'Placing order…' : `Confirm order · ${money(total)}`}</button>
      </form>

      <aside className="h-fit rounded-2xl border bg-white p-5 lg:col-span-2">
        <h2 className="mb-3 text-lg font-bold">Order summary</h2>
        <ul className="divide-y text-sm">{items.map((i) => <li key={i._id} className="flex justify-between gap-3 py-2"><span>{productName(i, lang)} × {i.qty}</span><b>{money((i.discountPrice || i.price) * i.qty)}</b></li>)}</ul>
        <div className="mt-4 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" className="min-w-0 flex-1 rounded-lg border px-3 py-2" /><button type="button" onClick={applyCoupon} className="rounded-lg border-2 border-brand px-4 font-semibold text-brand">Apply</button></div>
        {couponMsg && <p className={`mt-1 text-sm ${coupon ? 'text-green-700' : 'text-red-600'}`}>{couponMsg}</p>}
        <dl className="mt-4 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount</dt><dd>−{money(discount)}</dd></div>}
          <div className="flex justify-between">
            <dt>Delivery {shipping !== null && <span className="text-gray-500">({inDhaka ? 'Dhaka' : 'outside Dhaka'})</span>}</dt>
            <dd>{shipping !== null ? money(shipping) : <span className="text-gray-500">Enter your city</span>}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold"><dt>Total</dt><dd>{money(total)}</dd></div>
        </dl>
      </aside>
    </main>
  );
}
