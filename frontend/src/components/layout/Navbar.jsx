import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  Zap,
  Search,
  ShoppingCart,
  Heart,
  Package,
  LayoutDashboard,
  User,
  LogOut
} from 'lucide-react';

export default function Navbar() {
  const { totalItemsCount, subtotal } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Zap size={18} className="text-amber-400 fill-amber-400" />
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight text-lg leading-tight">TechStore</div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">High-Tech Store</div>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher MacBook, iPhone, Sony, 4K..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 placeholder-slate-400 rounded-lg border border-transparent focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
          />
        </form>

        {/* Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              isActive('/wishlist')
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Heart size={16} className={isActive('/wishlist') ? 'text-rose-500 fill-rose-500' : ''} />
            <span className="hidden sm:inline">Favoris</span>
          </Link>

          {/* Orders Link */}
          {isAuthenticated && (
            <Link
              to="/orders"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isActive('/orders')
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package size={16} />
              <span className="hidden sm:inline">Commandes</span>
            </Link>
          )}

          {/* Admin Dashboard Link (Admin only) */}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                isActive('/admin')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              <LayoutDashboard size={15} className="text-amber-500" />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* User Account / Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">{user?.name}</span>
                <span className="text-[10px] text-slate-400 capitalize">{user?.role}</span>
              </div>
              <button
                onClick={logout}
                title="Se déconnecter"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
            >
              <User size={15} />
              <span>Connexion</span>
            </Link>
          )}

          {/* Cart Page Link (Full Page Navigation) */}
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all hover:shadow"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">{subtotal.toFixed(2)} €</span>
            {totalItemsCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-blue-700 text-[11px] font-bold shadow-sm">
                {totalItemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
