import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, PackageSearch, Heart, MoreHorizontal, Languages, LogOut, Phone, Store } from 'lucide-react';
import api from '../lib/api';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import useMenu from '../lib/useMenu';
import CategoryNav from './CategoryNav.jsx';

const money = (n) => `৳${Number(n).toLocaleString('en-US')}`;
const itemClass = 'flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-gray-700 transition hover:text-brand sm:text-xs';

export default function Header({ cartCount = 0, onCartClick }) {
  const { t, lang, toggle } = useLang();
  const { user, logout, isStaff } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const menu = useMenu();
  // Items saved in Admin > Menu Builder replace the default category structure.
  const menuItems = menu?.header?.length ? menu.header.map((m) => ({ label: m.label, to: m.url })) : undefined;
  const box = useRef(null);
  const moreBox = useRef(null);

  const L = lang === 'bn'
    ? { track: 'অর্ডার ট্র্যাক', signin: 'সাইন ইন', account: 'অ্যাকাউন্ট', wish: 'উইশলিস্ট', more: 'আরও', contact: 'যোগাযোগ', all: 'সব পণ্য', lang: 'English' }
    : { track: 'Track Order', signin: 'Sign In', account: 'Account', wish: 'Wishlist', more: 'More', contact: 'Contact us', all: 'All products', lang: 'বাংলা' };

  // Autocomplete. Backend: GET /products?search=&limit= -> { products: [...] } or [...]
  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    const id = setTimeout(async () => {
      try {
        const { data } = await api.get('/products', { params: { search: q.trim(), limit: 6 } });
        setResults(data.products || data || []);
      } catch { setResults([]); }
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
      if (moreBox.current && !moreBox.current.contains(e.target)) setMore(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
  };
  const openProduct = (id) => { setOpen(false); setQ(''); navigate(`/product/${id}`); };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-3" aria-label="Muthoy Bazar home">
            <img src="/logo.png" alt="Muthoy Bazar" className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
            <span className="leading-tight">
              <span className="block text-lg font-bold text-brand">Muthoy Bazar</span>
              <span className="block text-xs text-gray-500 sm:text-sm">{t('tagline')}</span>
            </span>
          </Link>

          <form ref={box} onSubmit={submit} className="relative order-last w-full md:order-none md:mx-auto md:max-w-xl md:flex-1">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder={t('search')}
              aria-label={t('search')}
              className="w-full rounded-full border-2 border-gray-300 bg-white py-2.5 pl-5 pr-14 text-gray-900 placeholder-gray-500 focus:border-brand focus:outline-none"
            />
            <button type="submit" aria-label="Search" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand p-2 text-white hover:bg-brand-dark">
              <Search size={18} />
            </button>
            {open && results.length > 0 && (
              <ul className="absolute left-0 right-0 top-14 z-50 max-h-80 overflow-auto rounded-xl bg-white text-gray-900 shadow-xl ring-1 ring-black/5">
                {results.map((p) => (
                  <li key={p._id}>
                    <button type="button" onClick={() => openProduct(p._id)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-brand-light">
                      <img src={p.images?.[0]} alt="" className="h-10 w-10 rounded object-cover" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
                      <span className="flex-1 text-sm">{p.name}</span>
                      <span className="text-sm font-semibold text-brand">{money(p.discountPrice || p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>

          <div className="ml-auto flex items-start gap-0.5 sm:gap-1 md:ml-0">
            <Link to="/track" className={`${itemClass} hidden sm:flex`}><PackageSearch size={22} />{L.track}</Link>

            {user ? (
              <Link to={isStaff ? '/admin' : '/account'} className={itemClass}>
                <User size={22} /><span className="max-w-16 truncate">{user.name?.split(' ')[0] || L.account}</span>
              </Link>
            ) : (
              <Link to="/login" className={itemClass}><User size={22} />{L.signin}</Link>
            )}

            <Link to="/wishlist" className={`${itemClass} hidden sm:flex`}><Heart size={22} />{L.wish}</Link>

            <button onClick={onCartClick} className={itemClass} aria-label={t('cart')}>
              <span className="relative">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-cta px-1 text-[11px] font-bold text-white">{cartCount}</span>
                )}
              </span>
              {t('cart')}
            </button>

            <div ref={moreBox} className="relative">
              <button onClick={() => setMore((m) => !m)} aria-expanded={more} aria-haspopup="menu" className={itemClass}><MoreHorizontal size={22} />{L.more}</button>
              {more && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl bg-white py-1 text-sm text-gray-800 shadow-xl ring-1 ring-black/5">
                  <button role="menuitem" onClick={() => { toggle(); setMore(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-brand-light"><Languages size={16} />{L.lang}</button>
                  <Link role="menuitem" to="/shop" onClick={() => setMore(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-brand-light"><Store size={16} />{L.all}</Link>
                  <Link role="menuitem" to="/track" onClick={() => setMore(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-brand-light sm:hidden"><PackageSearch size={16} />{L.track}</Link>
                  <Link role="menuitem" to="/contact" onClick={() => setMore(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-brand-light"><Phone size={16} />{L.contact}</Link>
                  {user && <button role="menuitem" onClick={() => { logout(); setMore(false); }} className="flex w-full items-center gap-2 border-t px-4 py-2.5 text-left text-red-600 hover:bg-red-50"><LogOut size={16} />{t('logout')}</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CategoryNav items={menuItems} />
    </header>
  );
}
