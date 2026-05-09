import { useState, useEffect } from 'react';
import { createService, updateService, deleteService } from '../../services/api';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '', category: '', basePrice: 0, unit: 'per_service', duration: 30, isActive: true, isFeatured: false, tags: [] });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // You need a GET /admin/services endpoint. Add to api.js if missing.
  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/admin/services', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setServices(data.data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) await updateService(editingId, form);
      else await createService(form);
      alert('Service saved');
      resetForm();
      loadServices();
    } catch (err) { alert(err.message); } finally { setSubmitting(false); }
  };

  const resetForm = () => setForm({ name: '', slug: '', description: '', category: '', basePrice: 0, unit: 'per_service', duration: 30, isActive: true, isFeatured: false, tags: [] });
  const editService = (svc) => { setForm(svc); setEditingId(svc._id); };
  const handleDelete = async (id) => { if (confirm('Delete?')) { await deleteService(id); loadServices(); } };

  if (loading) return <div>Loading services...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Services</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-3">
        <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-2 rounded w-full" required />
        <input placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="border p-2 rounded w-full" required />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border p-2 rounded w-full"></textarea>
        <input placeholder="Category ID" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="border p-2 rounded w-full" required />
        <input type="number" placeholder="Base Price" value={form.basePrice} onChange={e => setForm({...form, basePrice: parseFloat(e.target.value)})} className="border p-2 rounded w-full" required />
        <input placeholder="Unit (e.g., per_service, per_hour)" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="border p-2 rounded w-full" />
        <input type="number" placeholder="Duration (mins)" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} className="border p-2 rounded w-full" />
        <input placeholder="Tags (comma separated)" value={form.tags.join(',')} onChange={e => setForm({...form, tags: e.target.value.split(',').map(t => t.trim())})} className="border p-2 rounded w-full" />
        <label><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /> Active</label>
        <label><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} /> Featured</label>
        <div className="flex gap-2">
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Create'} Service</button>
          {editingId && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full"><thead className="bg-gray-50"><tr><th>Name</th><th>Category</th><th>Base Price</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
        <tbody>{services.map(s => (<tr key={s._id} className="border-t"><td className="px-4 py-2">{s.name}</td><td>{s.category}</td><td>₹{s.basePrice}</td><td>{s.isActive ? 'Active' : 'Inactive'}</td><td>{s.isFeatured ? 'Yes' : 'No'}</td>
        <td><button onClick={() => editService(s)} className="text-blue-600 mr-2">Edit</button><button onClick={() => handleDelete(s._id)} className="text-red-600">Delete</button></td></tr>))}</tbody></table>
      </div>
    </div>
  );
};

export default AdminServices;