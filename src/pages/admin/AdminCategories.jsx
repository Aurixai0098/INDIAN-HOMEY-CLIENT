 
import { useState, useEffect } from 'react';
import { createCategory, updateCategory, deleteCategory, fetchCategories } from '../../services/api';

// Modern Lucide Icons (install: npm install lucide-react)
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
  ArrowUpDown,
  Check,
  ImageIcon,
  LayoutGrid,
  AlertTriangle,
  Loader2,
  Sparkles,
  Eye,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

// ─── Shimmer Skeleton Components ────────────────────────────────────
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded-lg w-32"></div>
          <div className="h-3 bg-slate-200 rounded-lg w-48"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
        <div className="h-8 bg-slate-200 rounded-lg w-16"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-slate-200 rounded-lg w-8"></div>
          <div className="h-8 bg-slate-200 rounded-lg w-8"></div>
        </div>
      </div>
    ))}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState({ name: '', slug: '', description: '', iconUrl: '', sortOrder: 1, isActive: true });
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'sortOrder', direction: 'asc' });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
    const [toast, setToast] = useState(null);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await fetchCategories();
            if (res.success) setCategories(res.data.categories);
            else setCategories([]);
        } catch (err) {
            console.error('Error loading categories:', err);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, []);

    // Auto-generate slug from name
    useEffect(() => {
        if (!editingId && form.name && !form.slug) {
            setForm(prev => ({
                ...prev,
                slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            }));
        }
    }, [form.name, editingId]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await updateCategory(editingId, form);
                showToast('Category updated successfully!');
            } else {
                await createCategory(form);
                showToast('Category created successfully!');
            }
            resetForm();
            loadCategories();
        } catch (err) {
            showToast(err.message || 'Something went wrong', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            setDeleteConfirm(null);
            showToast('Category deleted successfully!');
            loadCategories();
        } catch (err) {
            showToast(err.message || 'Failed to delete', 'error');
        }
    };

    const resetForm = () => {
        setForm({ name: '', slug: '', description: '', iconUrl: '', sortOrder: 1, isActive: true });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const editCategory = (cat) => {
        setForm({
            ...cat,
            iconUrl: cat.icon?.url || ''
        });
        setEditingId(cat._id);
        setIsFormOpen(true);
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Filter & Sort
    const filteredCategories = categories
        .filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       cat.slug.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (sortConfig.direction === 'asc') return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
        });

    const activeCount = categories.filter(c => c.isActive).length;
    const inactiveCount = categories.length - activeCount;

    // ─── Loading State ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded-lg w-64 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>)}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="h-14 bg-slate-100 border-b border-slate-200"></div>
                    <TableSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ═══ TOAST NOTIFICATION ═══ */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[1100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slideInRight
                    ${toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
                    {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                    <span className="font-medium">{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ═══ HEADER ═══ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Categories</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and organize your service categories</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            {/* ═══ STATS CARDS ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    icon={LayoutGrid}
                    label="Total Categories"
                    value={categories.length}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    icon={Check}
                    label="Active"
                    value={activeCount}
                    color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Inactive"
                    value={inactiveCount}
                    color="bg-amber-50 text-amber-600"
                />
            </div>

            {/* ═══ TOOLBAR ═══ */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ═══ TABLE VIEW ═══ */}
            {viewMode === 'table' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Icon</th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Name
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                                        onClick={() => handleSort('sortOrder')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Order
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCategories.map(cat => (
                                    <tr key={cat._id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-slate-300 transition-colors">
                                                {cat.icon?.url ? (
                                                    <img src={cat.icon.url} alt={cat.name} className="w-6 h-6 object-contain" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-slate-800">{cat.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.description || 'No description'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono">
                                                {cat.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                                <GripVertical className="w-3 h-3" />
                                                {cat.sortOrder}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    const updated = { ...cat, isActive: !cat.isActive };
                                                    updateCategory(cat._id, updated).then(() => {
                                                        showToast(`Category ${updated.isActive ? 'activated' : 'deactivated'}`);
                                                        loadCategories();
                                                    });
                                                }}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2
                                                    ${cat.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${cat.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => editCategory(cat)}
                                                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(cat)}
                                                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No categories found</p>
                                            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or add a new category</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ GRID VIEW ═══ */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredCategories.map(cat => (
                        <div key={cat._id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative overflow-hidden">
                                {cat.icon?.url ? (
                                    <img src={cat.icon.url} alt={cat.name} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <ImageIcon className="w-16 h-16 text-slate-300" />
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                        ${cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {cat.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{cat.name}</h3>
                                <p className="text-slate-500 text-sm mb-3 line-clamp-2">{cat.description || 'No description available'}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{cat.slug}</span>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => editCategory(cat)}
                                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(cat)}
                                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredCategories.length === 0 && (
                        <div className="col-span-full py-16 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">No categories found</p>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ ADD/EDIT MODAL ═══ */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto animate-slideUp">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Category' : 'New Category'}</h2>
                                    <p className="text-xs text-slate-500">{editingId ? 'Update category details' : 'Create a new service category'}</p>
                                </div>
                            </div>
                            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            {/* Name & Slug Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all text-sm"
                                        placeholder="e.g., Air Conditioner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Slug *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.slug}
                                        onChange={e => setForm({ ...form, slug: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all text-sm font-mono"
                                        placeholder="e.g., air-conditioner"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all text-sm resize-none"
                                    placeholder="Brief description of the category..."
                                />
                            </div>

                            {/* Icon URL with Preview */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Icon URL</label>
                                <div className="flex gap-3">
                                    <input
                                        type="url"
                                        value={form.iconUrl}
                                        onChange={e => setForm({ ...form, iconUrl: e.target.value })}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all text-sm"
                                        placeholder="https://example.com/icon.png"
                                    />
                                    {form.iconUrl && (
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <img src={form.iconUrl} alt="preview" className="w-10 h-10 object-contain" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sort Order & Status Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sort Order</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.sortOrder}
                                        onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors w-full">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={form.isActive}
                                                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-900/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">Category is Active</span>
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            {editingId ? 'Update Category' : 'Create Category'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Category?</h3>
                            <p className="text-slate-500 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-slate-700">"{deleteConfirm.name}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm._id)}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
 