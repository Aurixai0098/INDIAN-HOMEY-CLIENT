// src/pages/provider/ProviderLayout.jsx
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProviderLayout = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/provider', label: 'Dashboard', icon: '📊' },
    { to: '/provider/bookings', label: 'Bookings', icon: '📅' },
    { to: '/provider/services', label: 'Services', icon: '🛠️' },
    { to: '/provider/wallet', label: 'Wallet', icon: '💰' },
    { to: '/provider/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 pt-20">
        <div className="px-4 py-6">
          <div className="mb-8">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Provider</p>
            <p className="font-semibold text-gray-800">{user?.businessName || user?.firstName}</p>
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/provider'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProviderLayout;