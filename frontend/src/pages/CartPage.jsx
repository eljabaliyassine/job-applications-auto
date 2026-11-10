import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  Check,
  AlertCircle,
  Truck,
  ShieldCheck
} from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    tax,
    shipping,
    total,
    totalItemsCount,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');

  const freeShippingThreshold = 500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponSuccessMsg('');
    try {
      await applyCoupon(couponInput.trim());
      setCouponSuccessMsg(`Code '${couponInput.toUpperCase()}' appliqué avec succès !`);
      setCouponInput('');
    } catch (err) {
      // Handled in CartContext
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingCart size={24} className="text-blue-600" />
            <span>Mon Panier</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {totalItemsCount} article(s)
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Vérifiez vos articles avant de procéder au paiement sécurisé.
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1.5 self-end sm:self-auto"
          >
            <Trash2 size={14} /> Vider le panier
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingCart size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Votre panier est actuellement vide</h2>
          <p className="text-xs text-slate-500">
            Parcourez nos catégories de pointe pour ajouter vos produits favoris.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft size={14} /> Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                {remainingForFreeShipping > 0 ? (
                  <span>Ajoutez encore <b className="text-slate-900">{remainingForFreeShipping.toFixed(2)} €</b> pour profiter de la <b>livraison offerte</b></span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Check size={14} /> Félicitations ! La livraison vous est offerte.
                  </span>
                )}
                <span className="font-bold text-slate-900">{freeShippingProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Items Table / Cards */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg bg-slate-100 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition">
                        <Link to={`/product/${item.id}`}>{item.name}</Link>
                      </h3>
                      <div className="text-xs font-semibold text-slate-900 mt-1">
                        {item.price.toFixed(2)} € <span className="text-slate-400 font-normal text-[11px]">/ unité</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Total item price */}
                    <div className="text-right min-w-[70px]">
                      <div className="text-sm font-extrabold text-slate-900">
                        {(item.price * item.quantity).toFixed(2)} €
                      </div>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      title="Supprimer du panier"
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft size={14} /> Continuer mes achats
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-5 sticky top-24">
              <h3 className="text-sm font-bold text-slate-900">Récapitulatif de commande</h3>

              {/* Promo Code Input */}
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Tag size={14} /> Code Promotionnel
                </label>

                {coupon ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-emerald-800">{coupon.code}</span>
                      <span className="text-emerald-700 ml-2 font-semibold">
                        (-{discountAmount.toFixed(2)} €)
                      </span>
                    </div>
                    <button onClick={removeCoupon} className="text-rose-600 hover:underline font-semibold">
                      Retirer
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: TECH20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 uppercase font-mono text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-3.5 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-40"
                    >
                      {couponLoading ? "..." : "Appliquer"}
                    </button>
                  </form>
                )}

                {!coupon && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <span>Codes test :</span>
                    <button
                      type="button"
                      onClick={() => setCouponInput('TECH20')}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-mono text-slate-800 font-medium"
                    >
                      TECH20 (-20%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCouponInput('BIENVENUE10')}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-mono text-slate-800 font-medium"
                    >
                      BIENVENUE10 (-10€)
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {couponError}
                  </p>
                )}
                {couponSuccessMsg && !couponError && (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <Check size={12} /> {couponSuccessMsg}
                  </p>
                )}
              </div>

              {/* Financial Lines */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total HT</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Remise ({coupon?.code})</span>
                    <span>- {discountAmount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>TVA (20%)</span>
                  <span>{tax.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frais de livraison</span>
                  <span>{shipping === 0 ? <b className="text-emerald-600">Offerts</b> : `${shipping.toFixed(2)} €`}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total TTC</span>
                  <span className="text-lg text-blue-600">{total.toFixed(2)} €</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition"
              >
                <span>Commander maintenant</span>
                <ArrowRight size={15} />
              </button>

              <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Truck size={13} /> Livraison 24-48h</span>
                <span className="flex items-center gap-1"><ShieldCheck size={13} /> Paiement 100% Sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

