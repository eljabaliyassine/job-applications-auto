import React from 'react';
import { Zap, Truck, ShieldCheck, RotateCcw, Headphones, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      {/* Value Proposition Bar */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900">Livraison Express</div>
              <div className="text-[11px] text-slate-500">Gratuite dès 500 € d'achat</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900">Garantie 2 ans</div>
              <div className="text-[11px] text-slate-500">Produits 100% certifiés neufs</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900">Retours 30 jours</div>
              <div className="text-[11px] text-slate-500">Remboursement intégral garanti</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900">Paiement Sécurisé</div>
              <div className="text-[11px] text-slate-500">Cryptage SSL & Tokenisation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white">
              <Zap size={14} className="text-amber-400 fill-amber-400" />
            </div>
            <span className="font-bold text-slate-900 text-sm">TechStore</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Plateforme E-Commerce Fullstack de référence propulsée par React 18, Vite et une API RESTful Node.js / Express haute performance.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Catégories</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Ordinateurs & Laptops</span></li>
            <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Smartphones & iPhone</span></li>
            <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Audio & Casques ANC</span></li>
            <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Écrans UltraSharp 4K</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Architecture</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li>Node.js 20 & Express REST API</li>
            <li>React 18 & React Router v7</li>
            <li>Sécurité JWT & Hash Bcrypt</li>
            <li>Coupons & Wishlist en temps réel</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Contact & Support</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="flex items-center gap-2"><Headphones size={14} /> Support 7j/7 disponible</li>
            <li>support@techstore.com</li>
            <li>Paris, France</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>© 2026 TechStore Inc. Tous droits réservés.</p>
      </div>
    </footer>
  );
}

