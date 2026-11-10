import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Tag,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Receipt
} from 'lucide-react';

export default function OrdersPage() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <Package size={36} className="text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Connexion requise</h2>
        <p className="text-xs text-slate-500">
          Veuillez vous connecter pour consulter l'historique et le suivi de vos commandes.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          <ArrowLeft size={14} /> Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Package size={24} className="text-blue-600" />
          <span>Mes Commandes</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
            {orders.length}
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Suivez l'état d'expédition et consultez le détail de vos achats passés.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-4">
          <Package size={36} className="text-slate-300 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Aucune commande enregistrée</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Vous n'avez pas encore passé de commande sur TechStore.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Découvrir les nouveautés <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isExpanded = expandedOrderId === ord.id;
            return (
              <div
                key={ord.id}
                className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:border-slate-300 transition-all"
              >
                {/* Order Summary Header */}
                <div
                  onClick={() => toggleExpand(ord.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
                        #{ord.id}
                      </span>
                      <StatusBadge status={ord.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {new Date(ord.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
                      </span>
                      <span>•</span>
                      <span>{ord.items?.length || 0} article(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">
                        {ord.grandTotal?.toFixed(2)} €
                      </div>
                      <div className="text-[10px] text-slate-400">Total TTC payé</div>
                    </div>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/40 space-y-5">
                    {/* Items List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Articles commandés
                      </h4>
                      <div className="space-y-2">
                        {ord.items?.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-lg bg-white border border-slate-200/70 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-md bg-slate-100 shrink-0"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                                <span className="text-[11px] text-slate-500">
                                  {item.price?.toFixed(2)} € × {item.quantity}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-900">
                              {(item.price * item.quantity).toFixed(2)} €
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metadata: Address & Receipt Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-3.5 rounded-lg bg-white border border-slate-200/70 space-y-1 text-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                          <MapPin size={14} className="text-blue-600" />
                          <span>Adresse de livraison</span>
                        </div>
                        <div className="text-slate-600">{ord.shippingAddress?.street}</div>
                        <div className="text-slate-600">
                          {ord.shippingAddress?.zip} {ord.shippingAddress?.city}, {ord.shippingAddress?.country || "France"}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-white border border-slate-200/70 space-y-1.5 text-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                          <Receipt size={14} className="text-emerald-600" />
                          <span>Détails financiers</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Sous-total HT :</span>
                          <span>{ord.subtotal?.toFixed(2)} €</span>
                        </div>
                        {ord.discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-600 font-semibold">
                            <span className="flex items-center gap-1"><Tag size={12} /> Code {ord.couponCode} :</span>
                            <span>- {ord.discountAmount.toFixed(2)} €</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500">
                          <span>TVA (20%) :</span>
                          <span>{ord.tax?.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Livraison :</span>
                          <span>{ord.shippingFee === 0 ? "Offerte" : `${ord.shippingFee?.toFixed(2)} €`}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                          <span>Total payé :</span>
                          <span>{ord.grandTotal?.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

