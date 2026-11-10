import React from 'react';
import { CheckCircle2, Truck, Clock, XCircle, Package } from 'lucide-react';

export default function StatusBadge({ status }) {
  const clean = (status || '').toLowerCase();

  if (clean.includes('livrée') || clean.includes('delivered')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={13} className="text-emerald-600" />
        <span>Livrée</span>
      </span>
    );
  }

  if (clean.includes('expédiée') || clean.includes('shipped')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
        <Truck size={13} className="text-sky-600" />
        <span>Expédiée</span>
      </span>
    );
  }

  if (clean.includes('annulée') || clean.includes('cancelled')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle size={13} className="text-rose-600" />
        <span>Annulée</span>
      </span>
    );
  }

  // Default: En préparation
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <Clock size={13} className="text-amber-600" />
      <span>En préparation</span>
    </span>
  );
}

