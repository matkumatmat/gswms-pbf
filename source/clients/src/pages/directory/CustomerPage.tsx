import { useState, useEffect } from 'react';
import { useApi } from '../../components/hooks/use-api';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function CustomerPage() {
  const { api, execute, loading } = useApi();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchField, setSearchField] = useState('namaKonsumen');
  const [searchValue, setSearchValue] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async (currentPage: number) => {
    try {
      let res;
      if (searchValue.trim() !== '') {
        res = await api.call('getMasterCustomersByField', { field: searchField, value: searchValue });
        // Response untuk byField: langsung array
        if (Array.isArray(res)) {
          setData(res);
          setTotalPages(1);
        } else {
          setData([]);
        }
      } else {
        res = await api.call('getMasterCustomersPaginated', { page: currentPage, limit: 10, statues: 'ACTIVE' });
        // Response untuk paginated: { data: [], totalPages, page, limit, total }
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
      await execute(() => api.call('deleteMasterCustomer', { id }));
      loadData(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await execute(() => api.call('updateMasterCustomer', { id: editingId, data: formData }));
      } else {
        // CREATE: kirim LANGSUNG formData, BUKAN { data: formData }
        await execute(() => api.call('createMasterCustomer', formData));
      }
      setIsModalOpen(false);
      loadData(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Nama Konsumen', accessor: 'namaKonsumen' as const },
    { header: 'Kota/Cabang', accessor: 'kotaCabang' as const },
    { header: 'Type Konsumen', accessor: 'typeKonsumen' as const },
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
        <h2 className="text-xl font-bold">Customers</h2>
        <Button onClick={handleCreate}>Add Customer</Button>
      </div>
      
      {/* Search bar */}
      <div className="flex gap-2">
        <select
          className="border p-2 rounded"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        >
          <option value="namaKonsumen">Nama Konsumen</option>
          <option value="kotaCabang">Kota/Cabang</option>
          <option value="kategori">Kategori</option>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Konsumen</label>
              <input required type="text" className="w-full border p-2 rounded" value={formData.namaKonsumen || ''} onChange={e => setFormData({...formData, namaKonsumen: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kota/Cabang</label>
              <input required type="text" className="w-full border p-2 rounded" value={formData.kotaCabang || ''} onChange={e => setFormData({...formData, kotaCabang: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type Konsumen</label>
              <select className="w-full border p-2 rounded" value={formData.typeKonsumen || ''} onChange={e => setFormData({...formData, typeKonsumen: e.target.value})}>
                <option value="">--Pilih--</option>
                <option value="REGULER">REGULER</option>
                <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                <option value="INSTANSI PEMERINTAH">INSTANSI PEMERINTAH</option>
                <option value="KLINIK">KLINIK</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.kategori || ''} onChange={e => setFormData({...formData, kategori: e.target.value})} />
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