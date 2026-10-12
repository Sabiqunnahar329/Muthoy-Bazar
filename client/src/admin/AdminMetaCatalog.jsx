import { useEffect, useState } from 'react';
import { Download, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { Card, btnGhost } from './ui.jsx';

export default function AdminMetaCatalog() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const { data } = await api.get('/catalog/status');
      setStatus(data);
    } catch (e) {
      setError(apiError(e, 'Could not prepare the product catalog.'));
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const feedUrl = `${api.defaults.baseURL}/catalog/meta.csv`;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div><h1 className="text-2xl font-bold">Meta Catalog</h1><p className="mt-1 text-sm text-gray-500">Create a free CSV feed for import into a Meta Commerce catalog.</p></div>
        <button type="button" onClick={load} className={btnGhost}><RefreshCw size={15} className="mr-1 inline" />Refresh</button>
      </div>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {!status && !error && <p className="text-gray-500">Loading catalog status…</p>}
      {status && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {[['Products', status.totalProducts], ['Included in feed', status.includedProducts], ['Excluded from feed', status.excludedProducts]].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-white p-4"><p className="text-2xl font-bold text-brand">{value}</p><p className="text-sm text-gray-500">{label}</p></div>
            ))}
          </div>
          <Card className="space-y-3">
            <h2 className="font-bold">Catalog feed URL</h2>
            <p className="break-all rounded-lg bg-gray-50 p-3 text-sm">{status.feedUrl}</p>
            <a href={feedUrl} className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              <Download size={16} className="mr-2" />Download CSV
            </a>
            <a href={status.feedUrl} target="_blank" rel="noreferrer" className="ml-3 inline-flex items-center text-sm font-semibold text-brand hover:underline">
              Open feed <ExternalLink size={14} className="ml-1" />
            </a>
          </Card>
          {status.missingImageProducts > 0 && <p className="text-sm text-amber-800">{status.missingImageProducts} product(s) have no image and are omitted. Check Admin → Image rules.</p>}
          {!status.baseUrlConfigured && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">For a live Meta import, set CLIENT_URL to the public website address in server/.env. The feed currently uses a local development URL.</p>}
          <p className="text-xs text-gray-500">This creates a standards-based CSV at no cost; it does not connect to or sync a Meta account. Products without an image are left out of the feed.</p>
        </>
      )}
    </div>
  );
}
