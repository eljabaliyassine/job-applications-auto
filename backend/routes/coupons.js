// backend/routes/coupons.js
const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// GET /api/coupons — Liste publique des coupons actifs
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/coupons/validate — Valider un coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal === undefined) {
      return res.status(400).json({ error: "Le code promo et le montant sous-total sont requis." });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ error: `Le code promo '${cleanCode}' n'existe pas.` });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: `Ce code promo '${cleanCode}' est désactivé.` });
    }

    if (new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({ error: `Ce code promo est expiré.` });
    }

    const numericSubtotal = parseFloat(subtotal);
    if (numericSubtotal < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Le montant minimum pour activer ce code est de ${coupon.minOrderValue.toFixed(2)} €.`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (numericSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, numericSubtotal);
    }

    discountAmount = Number(discountAmount.toFixed(2));
    const finalSubtotal = Number((numericSubtotal - discountAmount).toFixed(2));

    return res.json({
      success: true,
      message: `Code promo '${cleanCode}' appliqué avec succès !`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        originalSubtotal: numericSubtotal,
        finalSubtotal
      }
    });
  } catch (err) {
    console.error("Erreur coupon :", err);
    return res.status(500).json({ error: "Erreur serveur lors de la validation du coupon." });
  }
});

module.exports = router;
