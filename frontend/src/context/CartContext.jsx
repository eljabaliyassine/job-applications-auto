import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  // 1. Initialisation avec hydratation depuis LocalStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('techstore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erreur de lecture du localStorage :", e);
      return [];
    }
  });

  // Coupon state
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // 2. Synchronisation automatique dans LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('techstore_cart', JSON.stringify(cart));
    } catch (e) {
      console.error("Erreur d'écriture dans localStorage :", e);
    }
  }, [cart]);

  // Ajouter au panier avec validation de stock
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Désolé, stock maximal atteint pour "${product.name}" (${product.stock} disponibles).`);
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Modifier la quantité (+1 ou -1)
  const updateQuantity = (id, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stock) {
            alert(`Stock maximal disponible : ${item.stock}`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean)
    );
  };

  // Supprimer un article
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Vider entièrement le panier
  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  // Appliquer un code coupon via l'API RESTful
  const applyCoupon = async (code) => {
    setCouponError('');
    try {
      const res = await axios.post('/api/coupons/validate', {
        code,
        subtotal
      });
      setCoupon(res.data.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || "Code promo invalide.";
      setCouponError(msg);
      throw new Error(msg);
    }
  };

  // Retirer le code coupon
  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

  // Calculs financiers dynamiques
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  
  // Calcul de la remise si coupon actif
  let discountAmount = 0;
  if (coupon && subtotal >= (coupon.minOrderValue || 0)) {
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
  } else if (coupon && subtotal < (coupon.minOrderValue || 0)) {
    // Si le total est descendu en dessous du minimum requis
    discountAmount = 0;
  }
  discountAmount = Number(discountAmount.toFixed(2));

  const discountedSubtotal = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
  const tax = Number((discountedSubtotal * 0.20).toFixed(2)); // TVA 20%
  const shipping = subtotal === 0 || subtotal >= 500 ? 0 : 15.00; // Franco de port dès 500€
  const total = Number((discountedSubtotal + tax + shipping).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
        discountAmount,
        discountedSubtotal,
        tax,
        shipping,
        total,
        coupon,
        couponError,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
