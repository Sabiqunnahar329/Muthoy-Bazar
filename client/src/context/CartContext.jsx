import { createContext, useContext, useEffect, useState } from 'react';
import { trackEvent } from '../lib/trackEvent.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb_cart')) || []; } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem('mb_cart', JSON.stringify(items)); }, [items]);

  const add = (p, qty = 1, openDrawer = true) => {
    if (p.stock < 1) return;
    trackEvent('AddToCart', { product: p._id, path: window.location.pathname });
    setItems((prev) => {
      const found = prev.find((x) => x._id === p._id);
      if (found) return prev.map((x) => (x._id === p._id ? { ...x, qty: Math.min(x.qty + qty, p.stock) } : x));
      return [...prev, { _id: p._id, name: p.name, images: p.images, price: p.price, discountPrice: p.discountPrice, stock: p.stock, qty: Math.min(qty, p.stock) }];
    });
    if (openDrawer) setOpen(true);
  };
  const inc = (id) => setItems((prev) => prev.map((x) => (x._id === id ? { ...x, qty: Math.min(x.qty + 1, x.stock) } : x)));
  const dec = (id) => setItems((prev) => prev.flatMap((x) => (x._id !== id ? [x] : x.qty <= 1 ? [] : [{ ...x, qty: x.qty - 1 }])));
  const remove = (id) => setItems((prev) => prev.filter((x) => x._id !== id));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + (i.discountPrice || i.price) * i.qty, 0);

  return <CartContext.Provider value={{ items, add, inc, dec, remove, clear, count, subtotal, open, setOpen }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
