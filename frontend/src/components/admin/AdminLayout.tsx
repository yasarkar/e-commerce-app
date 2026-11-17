import React from 'react';
import { Link, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShoppingBag, FolderOpen, ClipboardList, Store, LogOut, Shield, Tag, Users, PackageSearch, History } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-800 flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-700 space-x-2">
            <Shield className="w-6 h-6 text-indigo-600 animate-pulse" />
            <span className="font-black text-slate-900 text-xl tracking-wider">Admin Paneli</span>
          </div>

          <nav className="p-4 space-y-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-855 border border-transparent'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-855 border border-transparent'
                }`
              }
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Ürün Yönetimi</span>
            </NavLink>
            <NavLink
              to="/admin/stock"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-855 border border-transparent'
                }`
              }
            >
              <PackageSearch className="w-5 h-5" />
              <span>Toplu Stok Yönetimi</span>
            </NavLink>
            <NavLink
              to="/admin/stock/movements"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-855 border border-transparent'
                }`
              }
            >
              <History className="w-5 h-5" />
              <span>Stok Hareketleri</span>
            </NavLink>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-855 border border-transparent'
                }`
              }
            >
              <FolderOpen className="w-5 h-5" />
              <span>Kategori Yönetimi</span>
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-855 border border-transparent'
                }`
              }
            >
              <ClipboardList className="w-5 h-5" />
              <span>Sipariş Yönetimi</span>
            </NavLink>
            <NavLink
              to="/admin/coupons"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-855 border border-transparent'
                }`
              }
            >
              <Tag className="w-5 h-5" />
              <span>Kupon Yönetimi</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-855 border border-transparent'
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span>Kullanıcı Yönetimi</span>
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-855 transition-all border border-transparent"
          >
            <Store className="w-5 h-5" />
            <span>Mağazaya Dön</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-end px-8 shrink-0">
          <div className="flex items-center">
            <button
              onClick={logout}
              className="p-2 text-slate-900 hover:text-red-500 hover:bg-slate-855 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              title="Çıkış Yap"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};