// src/pages/admin/AdminRolesPermissions.jsx
import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Plus, Edit2, Trash2, Save, X, Loader2,
  Eye, EyeOff, CheckCircle, XCircle, Key, UserPlus, Lock
} from 'lucide-react';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  fetchPermissions,
  updateRolePermissions
} from '../../services/api';

const formatDate = (date) => new Date(date).toLocaleString('en-IN');

// Role Card Component
const RoleCard = ({ role, permissions, allPermissions, onUpdate, onDelete, onTogglePermission }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(role.name);
  const [editDescription, setEditDescription] = useState(role.description || '');

  const handleSave = () => {
    onUpdate(role._id, { name: editName, description: editDescription });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border rounded px-2 py-1 text-sm flex-1"
              placeholder="Role name"
            />
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="border rounded px-2 py-1 text-sm flex-1"
              placeholder="Description"
            />
            <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save size={16} /></button>
            <button onClick={() => setIsEditing(false)} className="p-1 text-gray-600 hover:bg-gray-100 rounded"><X size={16} /></button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-semibold text-gray-900">{role.name}</h3>
              {role.description && <p className="text-xs text-gray-500">{role.description}</p>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setIsEditing(true)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
              <button onClick={() => onDelete(role._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Permissions</h4>
        <div className="grid grid-cols-2 gap-2">
          {allPermissions.map(perm => {
            const isChecked = role.permissions?.includes(perm.key) || false;
            return (
              <label key={perm.key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onTogglePermission(role._id, perm.key, !isChecked)}
                  className="rounded"
                />
                <span className="text-gray-700">{perm.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Admin User Modal
const AdminUserModal = ({ user, onClose, onSave, roles }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    roleId: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || '',
        password: '',
        fullName: user.fullName || '',
        roleId: user.role?._id || '',
        status: user.status || 'active'
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!form.email || (!user && !form.password) || !form.fullName || !form.roleId) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{user ? 'Edit Admin User' : 'Add Admin User'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {error && <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{user ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <select
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded-lg p-2"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const AdminRolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roles');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes, permsRes] = await Promise.all([
        fetchRoles(),
        fetchAdminUsers(),
        fetchPermissions()
      ]);
      if (rolesRes.success) setRoles(rolesRes.data);
      if (usersRes.success) setAdminUsers(usersRes.data);
      if (permsRes.success) setPermissions(permsRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Role handlers
  const handleCreateRole = async (data) => {
    await createRole(data);
    showToast('Role created successfully');
    loadData();
  };

  const handleUpdateRole = async (roleId, data) => {
    await updateRole(roleId, data);
    showToast('Role updated');
    loadData();
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Delete this role? This will also affect admin users assigned to it.')) {
      await deleteRole(roleId);
      showToast('Role deleted');
      loadData();
    }
  };

  const handleTogglePermission = async (roleId, permKey, enabled) => {
    const role = roles.find(r => r._id === roleId);
    let newPermissions = [...(role.permissions || [])];
    if (enabled) {
      newPermissions.push(permKey);
    } else {
      newPermissions = newPermissions.filter(p => p !== permKey);
    }
    try {
      await updateRolePermissions(roleId, newPermissions);
      showToast('Permission updated');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Admin user handlers
  const handleCreateAdminUser = async (data) => {
    await createAdminUser(data);
    showToast('Admin user created');
    loadData();
  };

  const handleUpdateAdminUser = async (userId, data) => {
    await updateAdminUser(userId, data);
    showToast('Admin user updated');
    loadData();
  };

  const handleDeleteAdminUser = async (userId) => {
    if (window.confirm('Delete this admin user?')) {
      await deleteAdminUser(userId);
      showToast('Admin user deleted');
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-blue-600" size={24} /> Roles & Permissions
        </h1>
        <p className="text-gray-500">Manage admin roles, permissions, and admin user accounts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 font-medium ${activeTab === 'roles' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2 font-medium ${activeTab === 'admins' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Admin Users
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                const name = prompt('Enter role name:');
                const description = prompt('Enter role description (optional):');
                if (name) handleCreateRole({ name, description });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} /> Add Role
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {roles.map(role => (
              <RoleCard
                key={role._id}
                role={role}
                permissions={permissions}
                allPermissions={permissions}
                onUpdate={handleUpdateRole}
                onDelete={handleDeleteRole}
                onTogglePermission={handleTogglePermission}
              />
            ))}
          </div>
        </>
      )}

      {/* Admin Users Tab */}
      {activeTab === 'admins' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingUser(null); setShowUserModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlus size={16} /> Add Admin User
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {adminUsers.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 text-gray-400">No admin users found.</td></tr>
                  ) : (
                    adminUsers.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{user.fullName}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{user.role?.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingUser(user); setShowUserModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteAdminUser(user._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showUserModal && (
        <AdminUserModal
          user={editingUser}
          roles={roles}
          onClose={() => setShowUserModal(false)}
          onSave={editingUser ? handleUpdateAdminUser : handleCreateAdminUser}
        />
      )}
    </div>
  );
};

export default AdminRolesPermissions;