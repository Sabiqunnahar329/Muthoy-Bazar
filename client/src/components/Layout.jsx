import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';
import ChatWidget from './ChatWidget.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../lib/api.js';
import { trackEvent } from '../lib/trackEvent.js';

export default function Layout() {
  const cart = useCart();
  const { pathname } = useLocation();
  const [suggestions, setSuggestions] = useState([]);
  const [cats, setCats] = useState(undefined);

  useEffect(() => {
    api.get('/products', { params: { flag: 'best', limit: 12 } }).then((r) => setSuggestions(r.data.products)).catch(() => {});
    api.get('/categories').then((r) => setCats(r.data.slice(0, 8).map((c) => c.name))).catch(() => {});
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('PageView', { path: pathname });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cart.count} onCartClick={() => cart.setOpen(true)} />
      <div className="flex-1"><Outlet /></div>
      <Footer categories={cats} />
      <ChatWidget />
      <CartDrawer
        open={cart.open} onClose={() => cart.setOpen(false)} items={cart.items} suggestions={suggestions}
        onInc={cart.inc} onDec={cart.dec} onRemove={cart.remove} onAdd={(p) => cart.add(p, 1, false)}
      />
    </div>
  );
}
