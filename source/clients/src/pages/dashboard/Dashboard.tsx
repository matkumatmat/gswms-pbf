import { useState, useEffect } from 'react';
import { useApi } from '../../components/hooks/use-api';
import { Users, Package, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function Dashboard() {
  const { api } = useApi();
  const [stats, setStats] = useState({ customers: 0, products: 0, batches: 0 });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, prodRes, batchRes] = await Promise.all([
          api.call('getMasterCustomersPaginated', { page: 1, limit: 1, statues: 'ACTIVE' }),
          api.call('getMasterProductsPaginated', { page: 1, limit: 1, statues: 'ACTIVE' }),
          api.call('getMasterBatchesPaginated', { page: 1, limit: 1, statues: 'ACTIVE' }),
        ]);

        setStats({
          customers: custRes?.data?.total || 0,
          products: prodRes?.data?.total || 0,
          batches: batchRes?.data?.total || 0,
        });

        const txRes = await api.call('getTransactional', { year: '2025', sheet: 'ALL_DIST', page: 1, limit: 5 });
        if (txRes?.data?.data) {
          setRecentActivities(txRes.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Customers</p>
            <h3 className="text-2xl font-bold">{stats.customers}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Package /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Products</p>
            <h3 className="text-2xl font-bold">{stats.products}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><FileText /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Batches</p>
            <h3 className="text-2xl font-bold">{stats.batches}</h3>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-semibold text-lg">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Button variant="primary-light" className="h-24 flex-col text-sm rounded-xl">New Receiving</Button>
            <Button variant="primary-light" className="h-24 flex-col text-sm rounded-xl">New Distribution</Button>
            <Button variant="primary-light" className="h-24 flex-col text-sm rounded-xl">Export Batch Record</Button>
            <Button variant="primary-light" className="h-24 flex-col text-sm rounded-xl">Upload Archive</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-semibold text-lg">Recent Distributions (2025)</h3>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Konsumen</th>
                  <th className="px-4 py-3 font-medium">Barang</th>
                  <th className="px-4 py-3 font-medium text-right">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentActivities.map((act, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 whitespace-nowrap">{act.tanggal ? act.tanggal.substring(0,10) : ''}</td>
                    <td className="px-4 py-3 truncate max-w-[150px]">{act.namaKonsumen}</td>
                    <td className="px-4 py-3 truncate max-w-[150px]">{act.namaBarang}</td>
                    <td className="px-4 py-3 text-right font-medium text-amber-600">{act.distribusi}</td>
                  </tr>
                ))}
                {recentActivities.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-500">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
