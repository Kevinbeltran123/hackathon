import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/AuthProvider';

const BusinessLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/business/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/business/places', label: 'Locales', icon: '🏪' },
    { path: '/business/coupons', label: 'Cupones', icon: '🎫' },
    { path: '/business/metrics', label: 'Análisis', icon: '📈' },
    { path: '/business/settings', label: 'Configuración', icon: '⚙️' }
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl"
              >
                🏢
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">Rutas Vivas Business</h1>
                <p className="text-blue-100 text-sm">Panel Empresarial</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-medium">{user?.full_name}</div>
                <div className="text-blue-100 text-sm">Empresario</div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl cursor-pointer"
              >
                {user?.avatar || '👨‍💼'}
              </motion.div>
              <button
                onClick={handleLogout}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-1 pt-4 pb-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p className="text-sm">
              © 2024 Rutas Vivas Business. Impulsando el turismo local en Ibagué.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <span>📧 Soporte: support@rutasvivas.com</span>
              <span>📞 +57 (8) 123-4567</span>
              <span>🌐 www.rutasvivas.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BusinessLayout;