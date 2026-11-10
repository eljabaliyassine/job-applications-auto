import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Plus,
  Minus,
  Check,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const { token, user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchProductAndReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProductAndReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodRes, revRes] = await Promise.all([
        axios.get(`/api/products/${id}`),
        axios.get(`/api/products/${id}/reviews`)
      ]);
      setProduct(prodRes.data);
      setReviews(revRes.data.reviews || []);
    } catch (err) {
      setError("Produit introuvable ou erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const cartItem = cart.find(i => i.id === product?.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product ? product.stock <= 0 : false;
  const isMaxStockReached = product ? (qtyInCart + quantity) > product.stock : false;

  const handleAddToCart = () => {
    if (isOutOfStock || isMaxStockReached) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour gérer vos favoris.");
      return;
    }
    try {
      const res = await axios.post(
        '/api/wishlist/toggle',
        { productId: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved(res.data.isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setReviewError("Veuillez saisir votre commentaire.");
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const res = await axios.post(`/api/products/${product.id}/reviews`, {
        rating: newRating,
        title: newTitle.trim() || "Avis client certifié",
        comment: newComment.trim(),
        userName: user?.name || "Client Vérifié"
      });
      setReviewSuccess("Votre avis a été publié avec succès !");
      setNewTitle('');
      setNewComment('');
      // Reload reviews
      const revRes = await axios.get(`/api/products/${id}/reviews`);
      setReviews(revRes.data.reviews || []);
      setProduct(prev => ({ ...prev, rating: res.data.updatedProductRating }));
    } catch (err) {
      setReviewError(err.response?.data?.error || "Erreur lors de la publication.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle size={36} className="text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">{error || "Produit non trouvé"}</h2>
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline">
          <ArrowLeft size={14} /> Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-slate-400">{product.category}</span>
        <span>/</span>
        <span className="font-medium text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Product Image */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-900 text-white shadow-md">
              {product.badge}
            </span>
          )}
          <button
            onClick={handleToggleWishlist}
            aria-label="Favoris"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-600 hover:text-rose-500 hover:scale-110 transition-all"
          >
            <Heart size={18} className={isSaved ? "text-rose-500 fill-rose-500" : ""} />
          </button>
        </div>

        {/* Right: Info & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {product.category}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={15}
                    fill={s <= Math.round(product.rating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-900">{product.rating}</span>
              <span className="text-xs text-slate-400">({reviews.length} avis certifiés)</span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {product.price.toFixed(2)} €
              </div>
              <div className="text-xs text-slate-500">TVA 20% incluse • Livraison offerte dès 500 €</div>
            </div>
            <div className="text-right">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                  Rupture de stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check size={13} /> En stock ({product.stock} disponibles)
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Feature Specs */}
          {product.features && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Points clés & Caractéristiques</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart Button */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-lg bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isMaxStockReached}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check size={16} /> Ajouté au panier !
                  </>
                ) : isOutOfStock ? (
                  "Produit Épuisé"
                ) : (
                  <>
                    <Plus size={16} /> Ajouter au panier ({(product.price * quantity).toFixed(2)} €)
                  </>
                )}
              </button>
            </div>

            {/* Reassurance Icons */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-500 text-center">
              <div className="p-2 rounded bg-slate-50 flex flex-col items-center gap-1">
                <Truck size={15} className="text-slate-700" />
                <span>Expédié sous 24h</span>
              </div>
              <div className="p-2 rounded bg-slate-50 flex flex-col items-center gap-1">
                <ShieldCheck size={15} className="text-slate-700" />
                <span>Garantie 2 ans</span>
              </div>
              <div className="p-2 rounded bg-slate-50 flex flex-col items-center gap-1">
                <RotateCcw size={15} className="text-slate-700" />
                <span>Retours 30 jours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section id="reviews" className="pt-10 border-t border-slate-200 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Avis et Évaluations Clients</h2>
            <p className="text-xs text-slate-500">Retours d'expérience vérifiés sur ce produit.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <span className="font-bold text-slate-900 text-sm">{product.rating} / 5</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Write a Review Form */}
          <div className="lg:col-span-1 p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={16} /> Laisser une évaluation
            </h3>

            {reviewSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} /> {reviewSuccess}
              </div>
            )}
            {reviewError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle size={15} /> {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Votre note</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={20}
                        className={s <= newRating ? "text-amber-500 fill-amber-500" : "text-slate-300"}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{newRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Titre de l'avis</label>
                <input
                  type="text"
                  placeholder="Ex: Performance bluffante !"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Votre avis détaillé *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Partagez vos impressions sur la rapidité, l'écran, la finition..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting || !newComment.trim()}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <Send size={13} />
                <span>{reviewSubmitting ? "Publication..." : "Envoyer mon avis"}</span>
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Aucun avis pour ce produit pour l'instant. Soyez le premier à donner votre avis !
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                          {r.userName?.charAt(0) || "U"}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{r.userName}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            fill={s <= r.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>

                    {r.title && <h5 className="text-xs font-bold text-slate-800">{r.title}</h5>}
                    <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                    <div className="text-[10px] text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

