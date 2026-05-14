import { useState, useEffect } from 'react';
import { useApi } from '../../components/hooks/use-api';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function ProductDist() {
  const { api, execute, loading } = useApi();
  const [data, setData] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [year, setYear] = useState('2025');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async (currentPage: number, selectedYear: string) => {
    try {
      const res = await api.call('getTransactional', { year: selectedYear, sheet: 'ALL_DIST', page: currentPage, limit: 10 });
      // Response setelah ApiClient.unwrap: { data: [], totalPages, page, limit, total }
      if (res && Array.isArray(res.data)) {
        setData(res.data);
        setTotalPages(res.totalPages || 1);
      } else {
        setData([]);
      }
    } catch (err: any) {
      alert('Error loading data: ' + err.message);
    }
  };

  const loadBatches = async () => {
    try {
      const res = await api.call('getMasterBatchesPaginated', { page: 1, limit: 500, statues: 'ACTIVE' });
      if (res && Array.isArray(res.data)) {
        setBatches(res.data);
      }
    } catch (err) { }
  };

  useEffect(() => {
    loadData(page, year);
    if (batches.length === 0) loadBatches();
  }, [page, year]);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ tanggal: new Date().toISOString().substring(0, 10) });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await execute(() => api.call('deleteTransactional', { id, year, sheet: 'ALL_DIST' }));
      loadData(page, year);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await execute(() => api.call('updateTransactional', { id: editingId, year, sheet: 'ALL_DIST', data: formData }));
      } else {
        await execute(() => api.call('createTransactional', { year, sheet: 'ALL_DIST', data: formData }));
      }
      setIsModalOpen(false);
      loadData(page, year);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Tanggal', accessor: (row: any) => row.tanggal?.substring(0, 10) },
    { header: 'No Dokumen', accessor: (row: any) => row.noSO_MOV || row.noDok },
    { header: 'Konsumen', accessor: 'namaKonsumen' as const },
    { header: 'Kode Barang', accessor: 'kodeBarang' as const },
    { header: 'Nama Barang', accessor: 'namaBarang' as const },
    { header: 'Batch', accessor: 'batch' as const },
    { header: 'Distribusi', accessor: 'distribusi' as const },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      ) 
    }
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-bold">Product Distribution (ALL_DIST)</h2>
        <div className="flex items-center gap-4">
          <select className="border p-2 rounded" value={year} onChange={e => { setYear(e.target.value); setPage(1); }}>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
          <Button onClick={handleCreate}>Add Distribution</Button>
        </div>
      </div>
      
      {/* Debug box (optional, bisa dihapus nanti) */}
      <div className="bg-gray-100 p-2 text-xs overflow-auto max-h-32 border rounded">
        <strong>Debug:</strong> Data count: {data.length}, Total Pages: {totalPages}
        <pre>{JSON.stringify(data.slice(0, 2), null, 2)}</pre>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={data}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Distribution' : 'Add Distribution'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Batch</label>
              <select 
                required 
                className="w-full border p-2 rounded" 
                value={formData.batch || ''} 
                onChange={e => {
                  const b = batches.find(p => p.batch === e.target.value);
                  setFormData({ ...formData, batch: e.target.value, kodeBarang: b?.kodeBarang, namaBarang: b?.namaBarang });
                }}
              >
                <option value="">Select Batch...</option>
                {batches.map(p => <option key={p.id} value={p.batch}>{p.batch} - {p.namaBarang}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input required type="date" className="w-full border p-2 rounded" value={formData.tanggal?.substring(0,10) || ''} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No Dok</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.noDok || formData.noSO_MOV || ''} onChange={e => setFormData({ ...formData, noDok: e.target.value, noSO_MOV: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Konsumen</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.namaKonsumen || ''} onChange={e => setFormData({ ...formData, namaKonsumen: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kota/Cabang</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.kotaCabang || ''} onChange={e => setFormData({ ...formData, kotaCabang: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alokasi</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.alokasi || ''} onChange={e => setFormData({ ...formData, alokasi: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sektor</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.sektor || ''} onChange={e => setFormData({ ...formData, sektor: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Distribusi QTY</label>
              <input type="number" className="w-full border p-2 rounded" value={formData.distribusi || ''} onChange={e => setFormData({ ...formData, distribusi: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={loading}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}