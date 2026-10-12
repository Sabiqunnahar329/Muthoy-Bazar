import { useParams } from 'react-router-dom';

export default function ComingSoon() {
  const { slug } = useParams();
  const title = slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  return (
    <div className="mx-auto max-w-lg rounded-2xl border bg-white p-10 text-center">
      <h1 className="text-2xl font-bold text-brand">{title}</h1>
      <p className="mt-3 text-gray-600">This module is part of the menu but is not built yet. The Dashboard, Product, Sales, Stock, Customer and Coupons modules are working.</p>
    </div>
  );
}
