import { useState, useEffect } from 'react';
import { useApi } from '../../components/hooks/use-api';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function ShippingEmbalagePage() {
  const { api, execute, loading } = useApi();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchField, setSearchField] = useState('namaBarang');
  const [searchValue, setSearchValue] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async (currentPage: number) => {
    try {
      let res;
      if (searchValue.trim() !== '') {
        res = await api.call('getMasterShippingEmbalagesByField', { field: searchField, value: searchValue });
        if (Array.isArray(res)) {
          setData(res);
          setTotalPages(1);
        } else {
          setData([]);
        }
      } else {
        res = await api.call('getMasterShippingEmbalagesPaginated', { page: currentPage, limit: 10, statues: 'ACTIVE' });
        if (res && Array.isArray(res.data)) {
          setData(res.data);
          setTotalPages(res.totalPages || 1);
        } else {
          setData([]);
        }
      }
    } catch (err: any) {
      alert('Error loading data: ' + err.message);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadData(1);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ statues: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await execute(() => api.call('deleteMasterShippingEmbalages', { id }));
      loadData(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await execute(() => api.call('updateMasterShippingEmbalages', { id: editingId, data: formData }));
      } else {
        // CREATE: kirim LANGSUNG formData
        await execute(() => api.call('createMasterShippingEmbalages', formData));
      }
      setIsModalOpen(false);
      loadData(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Kode Barang', accessor: 'kodeBarang' as const },
    { header: 'Nama Barang', accessor: 'namaBarang' as const },
    { header: 'Kategori', accessor: 'kategori' as const },
    { header: 'Satuan', accessor: 'satuan' as const },
    { header: 'Safety Stock', accessor: 'safetyStock' as const },
    { header: 'Status', accessor: 'statues' as const },
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Shipping Embalage Master</h2>
        <Button onClick={handleCreate}>Add Embalage</Button>
      </div>
      
      {/* Search bar */}
      <div className="flex gap-2">
        <select
          className="border p-2 rounded"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        >
          <option value="namaBarang">Nama Barang</option>
          <option value="kodeBarang">Kode Barang</option>
        </select>
        <input
          type="text"
          className="border p-2 rounded flex-1"
          placeholder="Cari..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Button onClick={handleSearch}>Cari</Button>
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

      {/* Debug response */}
      <div className="mt-4 p-2 bg-gray-100 text-xs overflow-auto max-h-40 border rounded">
        <strong>Debug Response (terakhir dari loadData):</strong>
        <pre>{JSON.stringify({ dataCount: data.length, totalPages, page, sampleData: data.slice(0, 2) }, null, 2)}</pre>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Embalage' : 'Add Embalage'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kode Barang</label>
              <input required type="text" className="w-full border p-2 rounded" value={formData.kodeBarang || ''} onChange={e => setFormData({...formData, kodeBarang: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Barang</label>
              <input required type="text" className="w-full border p-2 rounded" value={formData.namaBarang || ''} onChange={e => setFormData({...formData, namaBarang: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.kategori || ''} onChange={e => setFormData({...formData, kategori: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Satuan</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.satuan || ''} onChange={e => setFormData({...formData, satuan: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Safety Stock</label>
              <input type="number" className="w-full border p-2 rounded" value={formData.safetyStock || ''} onChange={e => setFormData({...formData, safetyStock: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reorder Point</label>
              <input type="number" className="w-full border p-2 rounded" value={formData.reorderPoint || ''} onChange={e => setFormData({...formData, reorderPoint: e.target.value})} />
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