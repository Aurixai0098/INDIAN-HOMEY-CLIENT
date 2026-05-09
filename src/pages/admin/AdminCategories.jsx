import { useState, useEffect } from 'react';
import { createCategory, updateCategory, deleteCategory } from '../../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', sortOrder: 1, isActive: true });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Simulated fetch – your backend may have GET /admin/categories; if not, you need to implement.
  // For now, we'll assume you have a fetch function. Add to api.js:
  // export const fetchCategories = async () => apiFetch('/admin/categories');
  // Then use it here.
  // I'll add that function in api.js (see note below). For demo, we use dummy.

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const res = await fetch('/admin/categories', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setCategories(data.data.categories);
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        alert('Category updated');
      } else {
        await createCategory(form);
        alert('Category created');
      }
      resetForm();
      loadCategories();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this category?')) {
      try {
        await deleteCategory(id);
        loadCategories();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', icon: '', sortOrder: 1, isActive: true });
    setEditingId(null);
  };

  const editCategory = (cat) => {
    setForm(cat);
    setEditingId(cat._id);
  };

  if (loading) return <div className="text-center py-10">Loading categories...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-3">
        <input type="text" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-2 rounded w-full" required />
        <input type="text" placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="border p-2 rounded w-full" required />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border p-2 rounded w-full"></textarea>
        <input type="text" placeholder="Icon" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="border p-2 rounded w-full" />
        <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value)})} className="border p-2 rounded w-full" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /> Active</label>
        <div className="flex gap-2">
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Create'} Category</button>
          {editingId && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Slug</th><th className="px-4 py-2">Sort Order</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Actions</th></tr></thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id} className="border-t"><td className="px-4 py-2">{cat.name}</td><td className="px-4 py-2">{cat.slug}</td><td className="px-4 py-2">{cat.sortOrder}</td><td className="px-4 py-2">{cat.isActive ? 'Active' : 'Inactive'}</td>
              <td className="px-4 py-2 space-x-2"><button onClick={() => editCategory(cat)} className="text-blue-600">Edit</button><button onClick={() => handleDelete(cat._id)} className="text-red-600">Delete</button></td></tr>
            ))}
            {categories.length === 0 && <tr><td colSpan="5" className="text-center py-4">No categories</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;