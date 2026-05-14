import { useState, useEffect } from 'react';
import { useApi } from '../../components/hooks/use-api';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function ProductReceiving() {
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
      const res = await api.call('getTransactional', { year: selectedYear, sheet: 'ALL_RCV', page: currentPage, limit: 10 });
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
    setFormData({ type: 'RECEIVING', jenisKemasan: 'REGULER', tanggal: new Date().toISOString().substring(0,10) });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await execute(() => api.call('deleteProductReceiving', { id, year }));
      loadData(page, year);
    } catch(err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await execute(() => api.call('updateProductReceiving', { id: editingId, year, data: formData }));
      } else {
        await execute(() => api.call('createProductReceiving', { year, data: formData }));
      }
      setIsModalOpen(false);
      loadData(page, year);
    } catch(err: any) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Tanggal', accessor: (row: any) => row.tanggal?.substring(0,10) },
    { header: 'Type', accessor: 'type' as const },
    { header: 'No Dokumen', accessor: 'noDokumen' as const },
    { header: 'Batch', accessor: 'batch' as const },
    { header: 'Konsumen', accessor: 'namaKonsumen' as const },
    { header: 'Jumlah', accessor: 'jumlahFisik' as const },
    { header: 'Penempatan', accessor: 'placement' as const },
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
        <h2 className="text-xl font-bold">Product Receiving (ALL_RCV)</h2>
        <div className="flex items-center gap-4">
          <select className="border p-2 rounded" value={year} onChange={e => { setYear(e.target.value); setPage(1); }}>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
          <Button onClick={handleCreate}>Add Receiving</Button>
        </div>
      </div>
      
      {/* Debug box (opsional, hapus nanti) */}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Receiving' : 'Add Receiving'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!editingId && (
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Batch</label>
                <select 
                  required 
                  className="w-full border p-2 rounded" 
                  value={formData.batchId || ''} 
                  onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                >
                  <option value="">Select Batch...</option>
                  {batches.map(p => <option key={p.id} value={p.id}>{p.batch} - {p.namaBarang}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full border p-2 rounded" value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="RECEIVING">RECEIVING</option>
                <option value="CONSIGNMENT_RETURN">CONSIGNMENT_RETURN</option>
                <option value="RETURN">REGULER_RETURN</option>
                <option value="RECALL">RECALL</option>
                <option value="CANCEL">CANCEL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input required type="date" className="w-full border p-2 rounded" value={formData.tanggal?.substring(0,10) || ''} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jam</label>
              <input type="time" className="w-full border p-2 rounded" value={formData.jam || ''} onChange={e => setFormData({ ...formData, jam: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No Dokumen</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.noDokumen || ''} onChange={e => setFormData({ ...formData, noDokumen: e.target.value })} />
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
              <label className="block text-sm font-medium mb-1">Kondisi Kemasan</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.kondisiKemasan || ''} onChange={e => setFormData({ ...formData, kondisiKemasan: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jenis Kemasan</label>
              <select className="w-full border p-2 rounded" value={formData.jenisKemasan || ''} onChange={e => setFormData({ ...formData, jenisKemasan: e.target.value })}>
                <option value="REGULER">REGULER</option>
                <option value="IMPORT">IMPORT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jumlah Fisik</label>
              <input type="number" className="w-full border p-2 rounded" value={formData.jumlahFisik || ''} onChange={e => setFormData({ ...formData, jumlahFisik: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Penempatan</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.placement || ''} onChange={e => setFormData({ ...formData, placement: e.target.value })} />
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