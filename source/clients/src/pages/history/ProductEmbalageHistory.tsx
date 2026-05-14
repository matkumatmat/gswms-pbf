import { useState } from 'react';
import { useApi } from '../../components/hooks/use-api';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';

export default function ProductEmbalageHistory() {
  const { api, execute, loading } = useApi();
  const [data, setData] = useState([]);
  
  const [filterBy, setFilterBy] = useState('batch'); // batch, kodeBarang, namaBarang, namaKonsumen, field, year
  const [value, setValue] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState('100');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await execute(() => api.call('getProductEmbalageHistory', { 
        filterBy, 
        value, 
        fieldName, 
        startDate, 
        endDate, 
        limit 
      }));
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      alert('Error loading history');
    }
  };

  const columns = [
    { header: 'Tanggal', accessor: (row: any) => row.tanggal?.substring(0,10) },
    { header: 'No Dokumen', accessor: 'noDok' as const },
    { header: 'Konsumen', accessor: 'namaKonsumen' as const },
    { header: 'Kode Barang', accessor: 'kodeBarang' as const },
    { header: 'Nama Barang', accessor: 'namaBarang' as const },
    { header: 'Batch', accessor: 'batch' as const },
    { header: 'Penerimaan', accessor: 'penerimaan' as const },
    { header: 'Distribusi', accessor: 'distribusi' as const },
    { header: 'Catatan', accessor: 'catatan' as const },
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <h2 className="text-xl font-bold">Product Embalage History</h2>
      
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Filter By</label>
          <select className="border p-2 rounded text-sm min-w-[150px]" value={filterBy} onChange={e => setFilterBy(e.target.value)}>
            <option value="batch">Batch</option>
            <option value="kodeBarang">Kode Barang</option>
            <option value="namaBarang">Nama Barang</option>
            <option value="namaKonsumen">Nama Konsumen</option>
            <option value="year">Year</option>
            <option value="field">Custom Field</option>
          </select>
        </div>
        {filterBy === 'field' && (
          <div>
            <label className="block text-xs font-medium mb-1">Field Name</label>
            <input required type="text" className="border p-2 rounded text-sm w-32" value={fieldName} onChange={e => setFieldName(e.target.value)} />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium mb-1">Search Value</label>
          <input required type="text" className="border p-2 rounded text-sm min-w-[200px]" value={value} onChange={e => setValue(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Start Date</label>
          <input type="date" className="border p-2 rounded text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">End Date</label>
          <input type="date" className="border p-2 rounded text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Limit</label>
          <select className="border p-2 rounded text-sm" value={limit} onChange={e => setLimit(e.target.value)}>
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="">All</option>
          </select>
        </div>
        <Button type="submit" isLoading={loading}>Search</Button>
      </form>
      
      <div className="flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={data}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      </div>
    </div>
  );
}
