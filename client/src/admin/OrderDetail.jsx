import { useState } from 'react';
import api from '../lib/api.js';
import { money, fmtDate, STATUSES, statusStyle, apiError } from '../lib/helpers.js';
import { Modal, th, td, field, btnPrimary } from './ui.jsx';

// Full order details with status update. Used by the Dashboard and the Sales page.
export default function OrderDetail({ order, onClose, onChanged }) {
  const [o, setO] = useState(order);
  const [next, setNext] = useState(order.status);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true); setMsg('');
    try {
      const { data } = await api.patch(`/orders/${o._id}/status`, { status: next });
      setO(data); setMsg(`Order is now ${data.status}`);
      onChanged?.();
    } catch (e) { setMsg(apiError(e)); } finally { setBusy(false); }
  };

  return (
    <Modal title={`Order ${o.orderNumber}`} onClose={onClose} wide>
      <p className="mb-3"><span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyle[o.status]}`}>{o.status}</span></p>
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <b>Customer</b>
          <p>{o.customer.name}</p>
          <p><a href={`tel:${o.customer.phone}`} className="text-brand underline">{o.customer.phone}</a></p>
          {o.customer.city && <p className="text-gray-600">{o.customer.city}</p>}
          <p className="text-gray-600">{o.customer.address}</p>
          <p className="mt-2 inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
            Delivery: {o.zone === 'inside' ? 'Dhaka' : 'Outside Dhaka'} · {money(o.shippingFee)}
          </p>
        </div>
        <div>
          <b>Payment</b>
          <p>{o.paymentMethod}</p>
          {o.trxId && <p>Sender {o.senderNumber} · Trx ID {o.trxId}</p>}
          <p className="text-gray-500">Placed {fmtDate(o.createdAt)}</p>
          {o.flagged && <p className="mt-1 font-semibold text-red-700">This phone number has cancelled orders before.</p>}
        </div>
      </div>

      <table className="mt-4 w-full">
        <thead><tr>{['Item', 'Price', 'Qty', 'Total'].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
        <tbody>
          {o.items.map((i) => (
            <tr key={i._id}>
              <td className={td}>{i.name}</td><td className={td}>{money(i.price)}</td><td className={td}>{i.qty}</td><td className={td}>{money(i.price * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto mt-3 w-64 space-y-1 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
        {o.discount > 0 && <div className="flex justify-between"><dt>Discount {o.couponCode && `(${o.couponCode})`}</dt><dd>−{money(o.discount)}</dd></div>}
        <div className="flex justify-between"><dt>Delivery charge ({o.zone === 'inside' ? 'Dhaka' : 'outside Dhaka'})</dt><dd>{money(o.shippingFee)}</dd></div>
        <div className="flex justify-between border-t pt-1 text-base font-bold"><dt>Total</dt><dd>{money(o.total)}</dd></div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
        <select value={next} onChange={(e) => setNext(e.target.value)} aria-label="Order status" className={`${field} w-auto`}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button onClick={save} disabled={busy || next === o.status} className={btnPrimary}>{busy ? 'Saving…' : 'Update status'}</button>
        <button onClick={() => window.print()} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Print</button>
        {msg && <span role="status" className="text-sm text-gray-600">{msg}</span>}
      </div>
    </Modal>
  );
}
