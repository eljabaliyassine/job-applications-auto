import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Truck,
  Lock,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function CheckoutPage() {
  const {
    cart,
    subtotal,
    discountAmount,
    tax,
    shipping,
    total,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCart();
  const { token, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: '12 Avenue des Champs-Élysées',
    city: 'Paris',
    zip: '75008',
    country: 'France'
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (err) {
      // Handled in CartContext
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Veuillez vous connecter pour valider votre commande.");
      return;
    }
    if (!address.street || !address.city || !address.zip) {
      setError("Merci de renseigner l'ensemble des champs de livraison.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        '/api/orders',
        {
          items: cart,
          shippingAddress: address,
          paymentMethod: paymentMethod === 'card' ? 'Carte Bancaire (Simulée)' : 'Apple Pay / Google Pay',
          couponCode: coupon?.code || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderData = res.data.order;
      setCompletedOrder(orderData);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue lors de la commande.");
    } finally {
      setLoading(false);
    }
  };

  // If completed order, show full confirmation page
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Commande Confirmée avec Succès !
          </h1>
          <p className="text-xs text-slate-500">
            Merci pour votre confiance, <b>{user?.name}</b>. Votre commande est actuellement en cours de préparation.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 text-left space-y-4 max-w-lg mx-auto text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-slate-500">Numéro de commande</span>
            <span className="font-mono font-bold text-slate-900">#{completedOrder.id}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Email de confirmation</span>
            <span className="font-medium text-slate-900">{completedOrder.userEmail}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Adresse de livraison</span>
            <span className="font-medium text-slate-900 text-right">
              {completedOrder.shippingAddress?.street}, {completedOrder.shippingAddress?.city}
            </span>
          </div>

          {completedOrder.discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-600 font-semibold">
              <span>Code promo appliqué ({completedOrder.couponCode})</span>
              <span>- {completedOrder.discountAmount.toFixed(2)} €</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm font-bold text-slate-900">
            <span>Total réglé</span>
            <span className="text-base text-blue-600">{completedOrder.grandTotal?.toFixed(2)} €</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/orders"
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            Suivre ma commande
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
          >
            Retourner à la boutique
          </Link>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Votre panier est vide</h2>
        <p className="text-xs text-slate-500">
          Ajoutez des articles à votre panier avant de procéder au règlement.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          <ArrowLeft size={14} /> Découvrir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Finaliser ma Commande</h1>
          <p className="text-xs text-slate-500">Paiement 100% sécurisé et expédition express.</p>
        </div>
        <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft size={14} /> Continuer mes achats
        </Link>
      </div>

      {!isAuthenticated && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>Vous n'êtes pas connecté. Connectez-vous pour finaliser la commande.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Shipping + Payment */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck size={17} className="text-blue-600" />
              <span>1. Adresse de livraison</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Adresse (Rue & Numéro)</label>
                <input
                  type="text"
                  required
                  placeholder="12 Avenue des Champs-Élysées"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Code Postal</label>
                  <input
                    type="text"
                    required
                    placeholder="75008"
                    value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ville</label>
                  <input
                    type="text"
                    required
                    placeholder="Paris"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard size={17} className="text-emerald-600" />
              <span>2. Mode de paiement</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-lg border text-xs font-semibold cursor-pointer flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="hidden"
                />
                <CreditCard size={16} />
                <span>Carte Bancaire</span>
              </label>

              <label
                className={`p-3.5 rounded-lg border text-xs font-semibold cursor-pointer flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'apple'
                    ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="apple"
                  checked={paymentMethod === 'apple'}
                  onChange={() => setPaymentMethod('apple')}
                  className="hidden"
                />
                <ShieldCheck size={16} />
                <span>Apple / Google Pay</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isAuthenticated}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            <Lock size={16} />
            <span>
              {loading ? "Traitement sécurisé..." : `Payer et Confirmer (${total.toFixed(2)} €)`}
            </span>
          </button>
        </form>

        {/* Right Sticky Card: Summary & Coupons */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-5 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900">Récapitulatif de la commande</h3>

            {/* Items */}
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                      <div className="text-slate-400">Qté : {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 shrink-0">
                    {(item.price * item.quantity).toFixed(2)} €
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag size={14} /> Code Promo
              </label>

              {coupon ? (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-emerald-800">{coupon.code}</span>
                    <span className="text-emerald-700 ml-2 font-semibold">
                      (-{discountAmount.toFixed(2)} €)
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-600 hover:underline font-semibold"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: TECH20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 uppercase font-mono text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-40"
                  >
                    {couponLoading ? "..." : "Appliquer"}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {couponError}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total articles</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Remise code promo</span>
                  <span>- {discountAmount.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>TVA (20%)</span>
                <span>{tax.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frais d'expédition</span>
                <span>{shipping === 0 ? <b className="text-emerald-600">Gratuit</b> : `${shipping.toFixed(2)} €`}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total à régler</span>
                <span className="text-base text-blue-600">{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

