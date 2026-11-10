import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, Plus, Check, Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart, cart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const [justAdded, setJustAdded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const cartItem = cart.find(i => i.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isMaxStockReached = qtyInCart >= product.stock;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isMaxStockReached) return;
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour enregistrer ce produit dans vos favoris.");
      return;
    }

    setWishlistLoading(true);
    try {
      const res = await axios.post(
        '/api/wishlist/toggle',
        { productId: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved(res.data.isSaved);
    } catch (err) {
      console.error("Erreur favoris :", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <article className="group relative bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          aria-label="Ajouter aux favoris"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-500 hover:text-rose-500 hover:scale-110 transition-all"
        >
          <Heart
            size={16}
            className={isSaved ? "text-rose-500 fill-rose-500" : ""}
          />
        </button>

        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.badge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white shadow-sm">
              {product.badge}
            </span>
          )}
          {product.stock <= 5 && !isOutOfStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
              Reste {product.stock}
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Rupture
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Meta: Category & Rating */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium text-slate-400 uppercase text-[10px] tracking-wider">{product.category}</span>
          <Link
            to={`/product/${product.id}`}
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-amber-600 transition-colors"
          >
            <Star size={13} className="text-amber-500 fill-amber-500" />
            <span>{product.rating}</span>
            <span className="text-slate-400 font-normal text-[11px]">({product.numReviews || 12})</span>
          </Link>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-sm mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Features pills */}
        {product.features && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.features.slice(0, 2).map((f, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Price & Add to Cart button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="text-base font-bold text-slate-900 tracking-tight">
              {product.price.toFixed(2)} €
            </div>
            <div className="text-[10px] text-slate-400">TVA 20% incluse</div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || isMaxStockReached}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow'
            }`}
          >
            {justAdded ? (
              <>
                <Check size={14} /> Ajouté
              </>
            ) : isOutOfStock ? (
              "Épuisé"
            ) : isMaxStockReached ? (
              `Max (${qtyInCart})`
            ) : (
              <>
                <Plus size={14} /> Ajouter
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
