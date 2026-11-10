import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function WishlistPage() {
  const { token, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await axios.post('/api/wishlist/toggle', { productId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(prev => prev.filter(i => i.id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToCart = (item) => {
    addToCart(item);
    handleRemove(item.id);
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach(item => addToCart(item));
    setWishlistItems([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Heart size={24} className="text-rose-500 fill-rose-500" />
            <span>Mes Favoris</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {wishlistItems.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Retrouvez tous les articles enregistrés lors de vos précédentes visites.
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <button
            onClick={handleMoveAllToCart}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            <ShoppingCart size={15} />
            <span>Tout ajouter au panier</span>
          </button>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          <h2 className="text-base font-bold text-slate-900">Connexion requise</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Veuillez vous connecter pour accéder à votre liste de favoris et synchroniser vos articles.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft size={14} /> Retour à l'accueil
          </Link>
        </div>
      ) : loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <Heart size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900">Votre liste de favoris est vide</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Parcourez notre catalogue et cliquez sur l'icône cœur pour sauvegarder des produits.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Découvrir les produits <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <Link to={`/product/${item.id}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg bg-slate-100"
                  />
                </Link>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition">
                    <Link to={`/product/${item.id}`}>{item.name}</Link>
                  </h3>
                  <div className="text-sm font-extrabold text-slate-900 mt-1">
                    {item.price.toFixed(2)} €
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                >
                  <ShoppingCart size={14} />
                  <span>Ajouter au panier</span>
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  title="Supprimer des favoris"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

