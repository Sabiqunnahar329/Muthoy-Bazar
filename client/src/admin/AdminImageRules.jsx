import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { Card, btnGhost, td, th } from './ui.jsx';

export default function AdminImageRules() {
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/products/admin/image-audit');
      setAudit(data);
    } catch (e) {
      setAudit(null);
      setError(apiError(e, 'Could not check product images.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Image rules</h1>
          <p className="mt-1 text-sm text-gray-500">Uploads accept JPEG, PNG, WebP or GIF up to 3 MB. Local files are checked for existence; external HTTPS URLs are checked for format only.</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className={btnGhost}>
          <RefreshCw size={15} className={`mr-1 inline ${loading ? 'animate-spin' : ''}`} />{loading ? 'Checking…' : 'Run audit'}
        </button>
      </div>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {!audit && !error && <p className="text-gray-500">Checking product images…</p>}
      {audit && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {[['Products checked', audit.checkedProducts], ['Images OK', audit.passedProducts], ['Need attention', audit.findings.length]].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-white p-4"><p className="text-2xl font-bold text-brand">{value}</p><p className="text-sm text-gray-500">{label}</p></div>
            ))}
          </div>
          <Card className="p-0">
            {!audit.findings.length ? <p className="p-5 text-green-700">All catalog products have valid images.</p> : (
              <table className="w-full">
                <thead><tr><th className={th}>Product</th><th className={th}>SKU</th><th className={th}>Issue</th><th className={th}></th></tr></thead>
                <tbody>{audit.findings.map((item) => (
                  <tr key={item._id}>
                    <td className={td}>{item.name}</td>
                    <td className={td}>{item.sku || '—'}</td>
                    <td className={`${td} whitespace-normal text-red-700`}>{item.issue}</td>
                    <td className={td}><Link to="/admin/products" className="font-semibold text-brand hover:underline">Edit product</Link></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
