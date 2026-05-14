import { useState, useEffect } from 'react';
import { useApi } from '../../components/hooks/use-api';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function BatchPage() {
  const { api, execute, loading } = useApi();
  const [data, setData] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchField, setSearchField] = useState('batch');
  const [searchValue, setSearchValue] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async (currentPage: number) => {
    try {
      let res;
      if (searchValue.trim() !== '') {
        res = await api.call('getMasterBatchesByField', { field: searchField, value: searchValue });
        // Response byField: langsung array
        if (Array.isArray(res)) {
          setData(res);
          setTotalPages(1);
        } else {
          setData([]);
        }
      } else {
        res = await api.call('getMasterBatchesPaginated', { page: currentPage, limit: 10, statues: 'ACTIVE' });
        // Response paginated: { data: [], totalPages, page, limit, total }
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

  const loadProducts = async () => {
    try {
      const res = await api.call('getMasterProductsPaginated', { page: 1, limit: 500, statues: 'ACTIVE' });
      if (res && Array.isArray(res.data)) setProducts(res.data);
    } catch (err) { }
  };

  useEffect(() => {
    loadData(page);
    loadProducts();
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
    setFormData({ statues: 'ACTIVE', status: 'RECEIVED' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await execute(() => api.call('deleteMasterBatch', { id }));
      loadData(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await execute(() => api.call('updateMasterBatch', { id: editingId, data: formData }));
      } else {
        // CREATE: kirim LANGSUNG formData
        await execute(() => api.call('createMasterBatch', formData));
      }
      setIsModalOpen(false);
      loadData(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExport = async (batchNo: string) => {
    try {
      const res = await execute(() => api.call('exportBatchRecord', { batchNo, format: 'xlsx' }));
      if (res && res.url) {
        window.open(res.url, '_blank');
      } else {
        alert('Export completed but no URL returned.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Batch', accessor: 'batch' as const },
    { header: 'Nama Barang', accessor: 'namaBarang' as const },
    { header: 'Expire Date', accessor: (row: any) => row.expireDate?.substring(0,10) },
    { header: 'Status', accessor: 'status' as const },
    { header: 'SysStatus', accessor: 'SysStatus' as const },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleExport(row.batch)}>Export</Button>
          <Button size="sm" onClick={() => handleEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      ) 
    }
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Batches</h2>
        <Button onClick={handleCreate}>Add Batch</Button>
      </div>
      
      {/* Search bar */}
      <div className="flex gap-2">
        <select
          className="border p-2 rounded"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        >
          <option value="batch">Batch No</option>
          <option value="namaBarang">Nama Barang</option>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Batch' : 'Add Batch'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Product</label>
              <select 
                required 
                className="w-full border p-2 rounded" 
                value={formData.productId || ''} 
                onChange={e => {
                  const prod = products.find(p => p.id === e.target.value);
                  setFormData({...formData, productId: e.target.value, kodeBarang: prod?.kodeBarang, namaBarang: prod?.namaBarang});
                }}
              >
                <option value="">Select Product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.kodeBarang} - {p.namaBarang}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Batch No</label>
              <input required type="text" className="w-full border p-2 rounded" value={formData.batch || ''} onChange={e => setFormData({...formData, batch: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">MFG Date</label>
              <input type="date" className="w-full border p-2 rounded" value={formData.mfgDate?.substring(0,10) || ''} onChange={e => setFormData({...formData, mfgDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expire Date</label>
              <input type="date" className="w-full border p-2 rounded" value={formData.expireDate?.substring(0,10) || ''} onChange={e => setFormData({...formData, expireDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full border p-2 rounded" value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="RECEIVED">RECEIVED</option>
                <option value="NOT RECEIVED">NOT RECEIVED</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NIE</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.nomorIzinEdar || ''} onChange={e => setFormData({...formData, nomorIzinEdar: e.target.value})} />
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