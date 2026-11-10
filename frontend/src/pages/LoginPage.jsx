import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
          <Zap size={20} className="text-amber-400 fill-amber-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Connexion à TechStore</h1>
        <p className="text-xs text-slate-500">
          Accédez à votre espace client, vos favoris et vos commandes.
        </p>
      </div>

      {/* Main Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Adresse Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="client@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">Mot de passe</label>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition shadow-sm disabled:opacity-50 text-xs"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <span className="text-[11px] text-slate-400 block font-medium">Comptes de test pré-remplis :</span>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => fillDemo("client@test.com", "test1234")}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-semibold transition"
            >
              Client (client@test.com)
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@techstore.com", "admin123")}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[11px] text-amber-800 font-bold border border-amber-200 transition"
            >
              Admin (admin@techstore.com)
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-bold text-slate-900 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}

