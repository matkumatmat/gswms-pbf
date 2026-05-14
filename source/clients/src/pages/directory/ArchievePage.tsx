import { useState, useEffect } from 'react';
import { useApi } from '../../components/hooks/use-api';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function ArchievePage() {
  const { api, execute, loading } = useApi();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);

  const loadData = async (currentPage: number) => {
    try {
      const res = await api.call('getArchieves', { page: currentPage, limit: 10 });
      // Response: { data: [], totalPages, page, limit, total }
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

  useEffect(() => {
    loadData(page);
  }, [page]);

  const handleEdit = async (id: string) => {
    try {
      const res = await api.call('getArchieveById', { id });
      if (res) {
        setEditingId(id);
        setFormData(res);
        setFile(null);
        setIsModalOpen(true);
      }
    } catch(err: any) {
      alert(err.message);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ documentDate: new Date().toISOString().substring(0,10) });
    setFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await execute(() => api.call('deleteArchieveFile', { id }));
      loadData(page);
    } catch(err: any) {
      alert(err.message);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await execute(() => api.call('downloadArchieveFile', { id }));
      if (res && res.base64 && res.mimeType && res.fileName) {
        const dataUri = `data:${res.mimeType};base64,${res.base64}`;
        const a = document.createElement('a');
        a.href = dataUri;
        a.download = res.fileName;
        a.click();
      } else {
        alert('Download failed: invalid response');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toBase64 = (f: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(f);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update metadata: kirim { id, data }
        await execute(() => api.call('updateArchieveMetadata', { id: editingId, data: formData }));
      } else {
        // Upload new: kirim payload langsung (bukan dibungkus { data })
        if (!file) {
          alert('Please select a file');
          return;
        }
        const b64 = await toBase64(file);
        const payload = {
          ...formData,
          fileName: formData.fileName || file.name,
          mimeType: file.type || 'application/octet-stream',
          base64Data: b64,
          isPublic: formData.isPublic || false
        };
        await execute(() => api.call('uploadArchieveFile', payload));
      }
      setIsModalOpen(false);
      loadData(page);
    } catch(err: any) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'File Name', accessor: 'fileName' as const },
    { header: 'Doc Type', accessor: 'documentType' as const },
    { header: 'Entity Type', accessor: 'entityType' as const },
    { header: 'Entity Name', accessor: 'entityName' as const },
    { header: 'Size', accessor: 'fileSize' as const },
    { header: 'Date', accessor: (row: any) => row.createdAt?.substring(0,10) },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleDownload(row.id)}>Download</Button>
          <Button size="sm" onClick={() => handleEdit(row.id)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      ) 
    }
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Archive Management</h2>
        <Button onClick={handleCreate}>Upload File</Button>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Metadata' : 'Upload File'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!editingId && (
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">File</label>
                <input required type="file" className="w-full border p-2 rounded" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">File Name (override)</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.fileName || ''} onChange={e => setFormData({...formData, fileName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.documentType || ''} onChange={e => setFormData({...formData, documentType: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Entity Type</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.entityType || ''} onChange={e => setFormData({...formData, entityType: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Entity ID</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.entityId || ''} onChange={e => setFormData({...formData, entityId: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Entity Name</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.entityName || ''} onChange={e => setFormData({...formData, entityName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Document Date</label>
              <input type="date" className="w-full border p-2 rounded" value={formData.documentDate?.substring(0,10) || ''} onChange={e => setFormData({...formData, documentDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expire Date</label>
              <input type="date" className="w-full border p-2 rounded" value={formData.expireDate?.substring(0,10) || ''} onChange={e => setFormData({...formData, expireDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.tags || ''} onChange={e => setFormData({...formData, tags: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.remarks || ''} onChange={e => setFormData({...formData, remarks: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea className="w-full border p-2 rounded" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" checked={formData.isPublic || false} onChange={e => setFormData({...formData, isPublic: e.target.checked})} id="isPublic" />
              <label htmlFor="isPublic" className="text-sm font-medium">Is Public</label>
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