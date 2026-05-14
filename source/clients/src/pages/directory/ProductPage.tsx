import { useState, useEffect } from 'react';
import { useApi } from '../../components/hooks/use-api';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function ProductPage() {
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
      const res = await api.call('getMasterProductsPaginated', {
        page: currentPage,
        limit: 10,
        statues: 'ACTIVE'
      });
      // Response sekarang: { data: [], totalPages, page, limit, total }
      if (res && Array.isArray(res.data)) {
        setData(res.data);
        setTotalPages(res.totalPages || 1);
      } else {
        setData([]);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      loadData(1);
      return;
    }
    try {
      const res = await api.call('getMasterProductsByField', {
        field: searchField,
        value: searchValue
      });
      if (Array.isArray(res)) {
        setData(res);
        setTotalPages(1);
      } else {
        setData([]);
      }
      setPage(1);
    } catch (err: any) {
      alert(err.message);
    }
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
    if (!confirm('Hapus produk ini?')) return;
    try {
      await execute(() => api.call('deleteMasterProduct', { id }));
      loadData(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await execute(() => api.call('updateMasterProduct', { id: editingId, data: formData }));
      } else {
        await execute(() => api.call('createMasterProduct', formData));
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
    { header: 'Jenis', accessor: 'jenis' as const },
    { header: 'HJP', accessor: 'hjp' as const },
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
        <h2 className="text-xl font-bold">Products</h2>
        <Button onClick={handleCreate}>Add Product</Button>
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

      {/* Debug response (dokumentasi & debugging) */}
      <div className="mt-4 p-2 bg-gray-100 text-xs overflow-auto max-h-40 border rounded">
        <strong>Debug Response (terakhir dari loadData):</strong>
        <pre>{JSON.stringify({ dataCount: data.length, totalPages, page, sampleData: data.slice(0, 2) }, null, 2)}</pre>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Product' : 'Add Product'}>
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
              <label className="block text-sm font-medium mb-1">Jenis</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.jenis || ''} onChange={e => setFormData({...formData, jenis: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Satuan</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.satuan || ''} onChange={e => setFormData({...formData, satuan: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">HJP</label>
              <input type="number" className="w-full border p-2 rounded" value={formData.hjp || ''} onChange={e => setFormData({...formData, hjp: e.target.value})} />
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