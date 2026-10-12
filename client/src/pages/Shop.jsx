import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';

const TABS = [['', 'All'], ['featured', 'Featured'], ['best', 'Best sellers'], ['new', 'New arrivals'], ['offer', 'Offers']];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [state, setState] = useState({ products: [], total: 0, pages: 1, page: 1, loading: true, error: false });
  const key = params.toString();
  const q = { category: params.get('category') || '', brand: params.get('brand') || '', search: params.get('search') || '', flag: params.get('flag') || '', sort: params.get('sort') || '' };

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data)).catch(() => {});
    api.get('/products/brands').then((r) => setBrands(r.data)).catch(() => {});
  }, []);

  const fetchPage = (page, append) => {
    setState((s) => ({ ...s, loading: true, error: false }));
    api.get('/products', { params: { ...q, page, limit: 20 } })
      .then((r) => {
        if (!Array.isArray(r.data?.products)) throw new Error('Unexpected response'); // for example a web page instead of JSON
        setState((s) => ({ products: append ? [...s.products, ...r.data.products] : r.data.products, total: r.data.total, pages: r.data.pages, page, loading: false, error: false }));
      })
      .catch(() => setState((s) => ({ ...s, loading: false, error: true })));
  };
  useEffect(() => { fetchPage(1, false); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => { const n = new URLSearchParams(params); v ? n.set(k, v) : n.delete(k); setParams(n); };
  const title = q.category || (q.search ? `Search: ${q.search}` : q.brand || TABS.find((t) => t[0] === q.flag)?.[1] || 'All products');
  const chip = (on) => `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm ${on ? 'border-brand bg-brand text-white' : 'bg-white hover:border-brand'}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-5">
      <p className="text-sm text-gray-500"><Link to="/" className="text-brand hover:underline">Home</Link> / {title}</p>
      <h1 className="mt-1 text-2xl font-bold">{title} <span className="text-base font-normal text-gray-500">({state.total} items)</span></h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => set('category', '')} className={chip(!q.category)}>All categories</button>
        {cats.map((c) => <button key={c._id} onClick={() => set('category', c.name)} className={chip(q.category === c.name)}>{c.name}</button>)}
      </div>

      <div className="my-4 flex flex-wrap items-center gap-2">
        {TABS.map(([v, l]) => <button key={l} onClick={() => set('flag', v)} className={chip(q.flag === v)}>{l}</button>)}
        <select value={q.brand} onChange={(e) => set('brand', e.target.value)} aria-label="Brand" className="ml-auto rounded-lg border bg-white px-3 py-2 text-sm">
          <option value="">All brands</option>{brands.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select value={q.sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort" className="rounded-lg border bg-white px-3 py-2 text-sm">
          <option value="">Sort: Default</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="newest">Newest first</option>
        </select>
      </div>

      {state.error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="font-semibold text-red-800">We could not load the products.</p>
          <p className="mt-1 text-sm text-red-700">The server may be starting up after a quiet period, which can take up to a minute. Please try again.</p>
          <button onClick={() => fetchPage(1, false)} className="mt-3 rounded-lg bg-cta px-5 py-2 font-semibold text-white hover:bg-cta-dark">Try again</button>
        </div>
      )}
      {!state.loading && !state.error && state.products.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No products match. Try another category, brand or search word.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{state.products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
      )}
      {state.page < state.pages && (
        <div className="mt-6 text-center">
          <button onClick={() => fetchPage(state.page + 1, true)} disabled={state.loading} className="rounded-lg border-2 border-brand px-8 py-2 font-semibold text-brand hover:bg-brand-light disabled:opacity-60">{state.loading ? 'Loading…' : 'Load more'}</button>
        </div>
      )}
    </main>
  );
}
