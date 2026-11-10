import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import {
  Sparkles,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Tous']);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Update search term when URL param changes
  useEffect(() => {
    setSearchTerm(searchFromUrl);
  }, [searchFromUrl]);

  // Load categories
  useEffect(() => {
    axios.get('/api/products/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Erreur catégories :", err));
  }, []);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [activeCategory, searchTerm, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (activeCategory && activeCategory !== 'Tous') params.category = activeCategory;
      if (searchTerm) params.search = searchTerm;
      if (sortBy) params.sort = sortBy;

      const res = await axios.get('/api/products', { params });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Erreur chargement produits :", err);
      setError("Impossible de joindre le serveur API (port 5001). Vérifiez que le backend Node.js est en cours d'exécution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section — Minimalist Sleek Dark Studio */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-amber-300 border border-white/10 backdrop-blur-sm">
            <Sparkles size={14} />
            <span>Nouvelle Collection Tech 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            L'Excellence Technologique à portée de main.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Découvrez nos ordinateurs, smartphones, consoles et écrans professionnels.
            Profitez du code promo <strong className="text-amber-400 font-mono bg-white/10 px-2 py-0.5 rounded">TECH20</strong> pour 20% de remise immédiate.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Truck size={15} className="text-blue-400" /> Livraison offerte dès 500 €</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-400" /> Garantie constructeur 2 ans</span>
          </div>
        </div>

        {/* Ambient lighting effect */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Filter and Sorting Controls */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Trier par"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 rounded-lg border-none focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="">Tri : Recommandations</option>
              <option value="price-asc">Prix : Croissant</option>
              <option value="price-desc">Prix : Décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {(searchTerm || activeCategory !== 'Tous') && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Filtres actifs :</span>
            {activeCategory !== 'Tous' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                Catégorie : {activeCategory}
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                Recherche : "{searchTerm}"
              </span>
            )}
            <button
              onClick={() => {
                setActiveCategory('Tous');
                setSearchTerm('');
                setSearchParams({});
              }}
              className="text-blue-600 hover:underline ml-2"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </section>

      {/* Products Grid */}
      <section>
        {error ? (
          <div className="p-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between">
            <p className="text-xs">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-3 py-1 rounded bg-rose-600 text-white text-xs font-medium flex items-center gap-1"
            >
              <RefreshCw size={13} /> Réessayer
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white border border-slate-200/70 rounded-xl p-4 space-y-3 animate-pulse">
                <div className="aspect-[4/3] bg-slate-100 rounded-lg" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-8 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search size={22} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Aucun produit trouvé</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nous n'avons trouvé aucun article correspondant à vos critères de recherche.
            </p>
            <button
              onClick={() => {
                setActiveCategory('Tous');
                setSearchTerm('');
                setSearchParams({});
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Voir tout le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

