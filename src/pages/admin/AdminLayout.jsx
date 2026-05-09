import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <div className="text-center py-20 text-red-600">Access Denied. Admin only.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 text-xl font-bold border-b">Admin Panel</div>
        <nav className="p-4 space-y-2">
          <NavLink to="/admin" end className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>Dashboard</NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>Users</NavLink>
          <NavLink to="/admin/providers" className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>Provider Verifications</NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>Categories</NavLink>
          <NavLink to="/admin/services" className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>Services</NavLink>
          <NavLink to="/admin/bookings" className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>Bookings</NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;