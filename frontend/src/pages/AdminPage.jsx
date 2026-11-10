import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  Tag,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Edit,
  Power,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

export default function AdminPage() {
  const { token, user, isAuthenticated } = useAuth();

  const [stats, setStats] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: overview | products | orders | coupons | customers
  const [activeTab, setActiveTab] = useState('overview');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Search in products
  const [productSearch, setProductSearch] = useState('');

  // Create Product Modal / Form state
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'Ordinateurs',
    price: '',
    stock: '',
    description: '',
    badge: 'Nouveauté',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80'
  });

  // Edit Product Modal state
  const [editingProduct, setEditingProduct] = useState(null);

  // Create Coupon Modal state
  const [isNewCouponOpen, setIsNewCouponOpen] = useState(false);
  const [newCpn, setNewCpn] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 100,
    minOrderValue: 50,
    description: ''
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadAllAdminData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, lowStockRes, topRes, ordersRes, couponsRes, prodsRes, custRes] = await Promise.all([
        axios.get('/api/admin/stats', config),
        axios.get('/api/admin/stats/low-stock?threshold=6', config),
        axios.get('/api/admin/stats/top-products', config),
        axios.get('/api/admin/orders', config),
        axios.get('/api/coupons', config),
        axios.get('/api/admin/products', config),
        axios.get('/api/admin/customers', config)
      ]);

      setStats(statsRes.data.data);
      setLowStock(lowStockRes.data.products || []);
      setTopProducts(topRes.data.topProducts || []);
      setAllOrders(ordersRes.data.orders || []);
      setCoupons(couponsRes.data.coupons || []);
      setProductsList(prodsRes.data.products || []);
      setCustomers(custRes.data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setTimeout(() => setActionError(''), 3500);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(''), 3500);
    }
  };

  // ── Actions Produits ──
  const handleRestock = async (productId, amount = 15) => {
    try {
      const res = await axios.post(`/api/admin/products/${productId}/restock`, { amount }, config);
      showToast(res.data.message);
      loadAllAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur réapprovisionnement", true);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/products', newProd, config);
      showToast(res.data.message);
      setIsNewProductOpen(false);
      setNewProd({
        name: '', category: 'Ordinateurs', price: '', stock: '', description: '',
        badge: '', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80'
      });
      loadAllAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur création produit", true);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await axios.put(`/api/admin/products/${editingProduct.id}`, editingProduct, config);
      showToast(res.data.message);
      setEditingProduct(null);
      loadAllAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur mise à jour produit", true);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le produit '${name}' ?`)) return;
    try {
      const res = await axios.delete(`/api/admin/products/${id}`, config);
      showToast(res.data.message);
      loadAllAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur suppression", true);
    }
  };

  // ── Actions Commandes ──
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus }, config);
      showToast(`Commande #${orderId} mise à jour : ${newStatus}`);
      loadAllAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur statut", true);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Supprimer la commande #${orderId} ?`)) return;
    try {
      const res = await axios.delete(`/api/admin/orders/${orderId}`, config);
      showToast(res.data.message);
      loadAllAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur suppression commande", true);
    }
  };

  // ── Actions Coupons ──
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/coupons', newCpn, config);
      showToast(res.data.message);
      setIsNewCouponOpen(false);
      setNewCpn({ code: '', discountType: 'percentage', discountValue: 20, maxDiscount: 100, minOrderValue: 50, description: '' });
      loadAllAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur création coupon", true);
    }
  };

  const handleToggleCoupon = async (code) => {
    try {
      const res = await axios.patch(`/api/admin/coupons/${code}/toggle`, {}, config);
      showToast(res.data.message);
      loadAllAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur toggle coupon", true);
    }
  };

  const handleDeleteCoupon = async (code) => {
    if (!window.confirm(`Supprimer définitivement le code promo '${code}' ?`)) return;
    try {
      const res = await axios.delete(`/api/admin/coupons/${code}`, config);
      showToast(res.data.message);
      loadAllAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur suppression coupon", true);
    }
  };

  // ── Actions Clients ──
  const handleToggleRole = async (userId, currentRole, name) => {
    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Modifier le rôle de '${name}' vers '${nextRole}' ?`)) return;
    try {
      const res = await axios.patch(`/api/admin/customers/${userId}/role`, { role: nextRole }, config);
      showToast(res.data.message);
      loadAllAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur modification rôle", true);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock size={22} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Accès Restreint</h2>
        <p className="text-xs text-slate-500">
          Cette page est réservée exclusivement aux administrateurs de la boutique TechStore.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          <ArrowLeft size={14} /> Retour à la boutique
        </Link>
      </div>
    );
  }

  const filteredProducts = productsList.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Panneau d'Administration</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-900 text-white">
              Admin Suite
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestion complète du catalogue, réassort, commandes, promotions et comptes clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
          >
            <RefreshCw size={14} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toasts */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp size={15} />
          <span>Vue Globale</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package size={15} />
          <span>Produits ({productsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 size={15} />
          <span>Commandes ({allOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'coupons'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag size={15} />
          <span>Codes Promo ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'customers'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users size={15} />
          <span>Clients & Rôles ({customers.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div>
          {/* ═══════════════════════════════════════════════════
              TAB 1: VUE GLOBALE & KPIS
             ═══════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 4 KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Chiffre d'Affaires</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {stats?.totalRevenue?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </div>
                  <div className="text-[11px] text-slate-400">Total cumulé des commandes</div>
                </div>

                <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Total Commandes</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Package size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {stats?.totalOrders}
                  </div>
                  <div className="text-[11px] text-slate-400">Toutes enregistrées</div>
                </div>

                <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Panier Moyen (AOV)</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {stats?.avgOrderValue?.toFixed(2)} €
                  </div>
                  <div className="text-[11px] text-slate-400">Moyenne par transaction</div>
                </div>

                <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Stocks Critiques</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertTriangle size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {stats?.lowStockCount}
                  </div>
                  <div className="text-[11px] text-amber-600 font-medium">Articles avec stock ≤ 6</div>
                </div>
              </div>

              {/* Top Products */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Top 5 des Produits les Plus Vendus</h3>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Gérer tout le catalogue →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3">Produit</th>
                        <th className="px-5 py-3">Catégorie</th>
                        <th className="px-5 py-3">Prix</th>
                        <th className="px-5 py-3">Quantité Vendue</th>
                        <th className="px-5 py-3 text-right">Revenu Généré</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {topProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3 flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-9 h-9 object-cover rounded-md bg-slate-100 shrink-0" />
                            <span className="font-semibold text-slate-900">{p.name}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600">{p.category}</span>
                          </td>
                          <td className="px-5 py-3 font-medium">{p.price.toFixed(2)} €</td>
                          <td className="px-5 py-3 font-bold text-slate-900">{p.quantitySold} unités</td>
                          <td className="px-5 py-3 text-right font-extrabold text-slate-900">
                            {p.totalRevenue.toFixed(2)} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              TAB 2: GESTION DU CATALOGUE PRODUITS (CRUD)
             ═══════════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Product Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrer par nom ou catégorie..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <button
                  onClick={() => setIsNewProductOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
                >
                  <Plus size={15} />
                  <span>Ajouter un Produit</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3">Produit</th>
                        <th className="px-5 py-3">Catégorie</th>
                        <th className="px-5 py-3">Prix</th>
                        <th className="px-5 py-3">Stock Actuel</th>
                        <th className="px-5 py-3">Ajuster Stock</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3 flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-md bg-slate-100 shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900">{p.name}</div>
                              {p.badge && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-900">{p.price.toFixed(2)} €</td>
                          <td className="px-5 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                p.stock <= 5
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {p.stock} unités
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleRestock(p.id, 5)}
                                title="Ajouter +5 unités"
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleRestock(p.id, 15)}
                                title="Ajouter +15 unités"
                                className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 text-[11px]"
                              >
                                +15
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingProduct(p)}
                                title="Modifier le produit"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                title="Supprimer du catalogue"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              TAB 3: GESTION DES COMMANDES
             ═══════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Toutes les Commandes ({allOrders.length})</h3>
                <span className="text-xs text-slate-400">Modifiez le statut ou supprimez une commande</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Commande</th>
                      <th className="px-5 py-3">Client</th>
                      <th className="px-5 py-3">Articles</th>
                      <th className="px-5 py-3">Total TTC</th>
                      <th className="px-5 py-3">Statut Actuel</th>
                      <th className="px-5 py-3">Modifier Statut</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {allOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3 font-mono font-bold text-slate-900">#{ord.id}</td>
                        <td className="px-5 py-3">
                          <div className="font-semibold text-slate-900">{ord.userName}</div>
                          <div className="text-slate-400 text-[11px]">{ord.userEmail}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-medium">{ord.items?.length || 0} article(s)</span>
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-900">
                          {ord.grandTotal?.toFixed(2)} €
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={ord.status} />
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                          >
                            <option value="En préparation">En préparation</option>
                            <option value="Expédiée">Expédiée</option>
                            <option value="Livrée">Livrée</option>
                            <option value="Annulée">Annulée</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            title="Supprimer la commande"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              TAB 4: GESTION DES CODES PROMO
             ═══════════════════════════════════════════════════ */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Gestion des Codes Promo</h3>
                  <p className="text-xs text-slate-500">Créez, activez ou désactivez les remises en temps réel.</p>
                </div>
                <button
                  onClick={() => setIsNewCouponOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
                >
                  <Plus size={15} />
                  <span>Nouveau Code Promo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                          {c.code}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {c.isActive ? 'Actif' : 'Désactivé'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Remise :</span>
                          <span className="font-bold text-slate-900">
                            {c.discountType === 'percentage' ? `${c.discountValue}%` : `${c.discountValue} €`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Achat minimum :</span>
                          <span className="font-medium text-slate-900">{c.minOrderValue} €</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleToggleCoupon(c.code)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          c.isActive
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        <Power size={13} />
                        <span>{c.isActive ? "Désactiver" : "Activer"}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCoupon(c.code)}
                        title="Supprimer le code"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              TAB 5: GESTION DES CLIENTS & RÔLES
             ═══════════════════════════════════════════════════ */}
          {activeTab === 'customers' && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Utilisateurs et Rôles d'Accès ({customers.length})</h3>
                <p className="text-xs text-slate-500">Attribuez des privilèges administrateur ou visualisez les dépenses totales.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Client</th>
                      <th className="px-5 py-3">Rôle Actuel</th>
                      <th className="px-5 py-3">Commandes Passées</th>
                      <th className="px-5 py-3">Dépenses Totales</th>
                      <th className="px-5 py-3 text-right">Modifier Rôle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3">
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-slate-400 text-[11px]">{c.email}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              c.role === 'admin'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          {c.orderCount} commande(s)
                        </td>
                        <td className="px-5 py-3 font-extrabold text-slate-900">
                          {c.totalSpent.toFixed(2)} €
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleToggleRole(c.id, c.role, c.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                          >
                            <ShieldCheck size={14} className={c.role === 'admin' ? "text-amber-600" : "text-slate-400"} />
                            <span>{c.role === 'admin' ? "Rétrograder en Client" : "Promouvoir Admin"}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL: AJOUTER UN PRODUIT
         ═══════════════════════════════════════════════════ */}
      {isNewProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsNewProductOpen(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Ajouter un Nouveau Produit</h3>
              <button onClick={() => setIsNewProductOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom du produit *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dell XPS 15 4K OLED"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Catégorie *</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  >
                    <option value="Ordinateurs">Ordinateurs</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="Audio">Audio</option>
                    <option value="Écrans">Écrans</option>
                    <option value="Accessoires">Accessoires</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Tablettes">Tablettes</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Badge marketing</label>
                  <input
                    type="text"
                    placeholder="Ex: Top Vente, Nouveauté"
                    value={newProd.badge}
                    onChange={(e) => setNewProd({ ...newProd, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prix (€ TTC) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1299.00"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock initial *</label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">URL de l'image</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProd.image}
                  onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Spécifications, performances, connectique..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                >
                  Créer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL: MODIFIER UN PRODUIT
         ═══════════════════════════════════════════════════ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditingProduct(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Modifier le Produit #{editingProduct.id}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-900"><X size={16} /></button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom du produit</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Badge</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MODAL: NOUVEAU CODE PROMO
         ═══════════════════════════════════════════════════ */}
      {isNewCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsNewCouponOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Créer un Nouveau Code Promo</h3>
              <button onClick={() => setIsNewCouponOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Code Promo (en majuscules) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PROMO30"
                  value={newCpn.code}
                  onChange={(e) => setNewCpn({ ...newCpn, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 font-mono uppercase bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type de réduction</label>
                  <select
                    value={newCpn.discountType}
                    onChange={(e) => setNewCpn({ ...newCpn, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Valeur de la remise *</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={newCpn.discountValue}
                    onChange={(e) => setNewCpn({ ...newCpn, discountValue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Achat minimum (€)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newCpn.minOrderValue}
                    onChange={(e) => setNewCpn({ ...newCpn, minOrderValue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Plafond max (€)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={newCpn.maxDiscount}
                    onChange={(e) => setNewCpn({ ...newCpn, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Ex: 30% de remise sur les accessoires"
                  value={newCpn.description}
                  onChange={(e) => setNewCpn({ ...newCpn, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCouponOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                >
                  Créer le code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
