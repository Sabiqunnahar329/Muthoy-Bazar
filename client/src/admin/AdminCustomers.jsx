import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import api from '../lib/api.js';
import { money, fmtDate } from '../lib/helpers.js';
import { Card, th, td, btnCta } from './ui.jsx';

export default function AdminCustomers() {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.get('/admin/customers').then((r) => setRows(r.data)).catch(() => setRows([])); }, []);

  const exportCsv = async () => {
    const { data } = await api.get('/admin/customers/export', { responseType: 'blob' });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold">Customer</h1><button onClick={exportCsv} className={btnCta}><Download size={16} className="mr-1 inline" />Export phone numbers (CSV)</button></div>
      <Card>
        <table className="w-full"><thead><tr>{['Name', 'Phone', 'Last address', 'Orders', 'Cancelled', 'Total spent', 'Last order'].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody>{(rows || []).map((c) => (
            <tr key={c._id}><td className={td}>{c.name}</td><td className={td}>{c._id}</td><td className={`${td} max-w-xs truncate`}>{c.address}</td><td className={td}>{c.orders}</td>
              <td className={td}>{c.cancelled > 1 ? <b className="text-red-600">{c.cancelled}</b> : c.cancelled}</td><td className={td}>{money(c.spent)}</td><td className={td}>{fmtDate(c.lastOrder)}</td></tr>))}
            {rows && !rows.length && <tr><td className={td} colSpan={7}>No customers yet. They appear here after their first order.</td></tr>}
            {!rows && <tr><td className={td} colSpan={7}>Loading…</td></tr>}</tbody></table>
      </Card>
    </div>
  );
}
