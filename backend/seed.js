// backend/seed.js
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Wishlist = require('./models/Wishlist');

const seedDatabase = async () => {
  try {
    // 1. Seed Users if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Seed] Création des comptes utilisateurs de base...');
      await User.create([
        {
          name: "Yassine Dev (Client)",
          email: "client@test.com",
          role: "customer",
          passwordHash: bcrypt.hashSync("test1234", 10)
        },
        {
          name: "Admin TechStore",
          email: "admin@techstore.com",
          role: "admin",
          passwordHash: bcrypt.hashSync("admin123", 10)
        }
      ]);
      console.log('[Seed] 2 comptes créés (client@test.com / admin@techstore.com)');
    }

    // 2. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Seed] Insertion du catalogue de 12 produits dans MongoDB...');
      const initialProducts = [
        {
          id: 1,
          name: "MacBook Pro 16'' M3 Max",
          category: "Ordinateurs",
          price: 2499.99,
          stock: 8,
          rating: 4.9,
          numReviews: 48,
          badge: "Top Vente",
          description: "Puce M3 Max 16 cœurs, 36 Go de mémoire unifiée, 1 To SSD. Écran Liquid Retina XDR exceptionnel.",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80",
          features: ["Puce Apple M3 Max", "36 Go RAM Unifiée", "1 To SSD NVMe", "Autonomie 22h", "Écran 120Hz ProMotion"]
        },
        {
          id: 2,
          name: "iPhone 15 Pro Max 256GB",
          category: "Smartphones",
          price: 1299.00,
          stock: 12,
          rating: 4.8,
          numReviews: 64,
          badge: "Nouveauté",
          description: "Design en titane aérospatial, puce A17 Pro, système photo pro 48 Mpx avec téléobjectif x5.",
          image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=700&q=80",
          features: ["Titane Naturel", "Puce A17 Pro 3nm", "Capteur Photo 48 MP", "Port USB-C 3", "Action Button"]
        },
        {
          id: 3,
          name: "Casque Sony WH-1000XM5",
          category: "Audio",
          price: 349.50,
          stock: 20,
          rating: 4.7,
          numReviews: 35,
          badge: "Promo",
          description: "Réduction de bruit active de pointe avec deux processeurs et 8 microphones. Autonomie 30h.",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
          features: ["ANC Réduction Bruit Pro", "Autonomie 30 heures", "Codec LDAC Hi-Res", "Multipoint Bluetooth 5.2"]
        },
        {
          id: 4,
          name: "Écran Dell UltraSharp 32'' 4K",
          category: "Écrans",
          price: 799.00,
          stock: 4,
          rating: 4.6,
          numReviews: 19,
          badge: "Stock Limité",
          description: "Dalle IPS Black 4K HDR avec hub USB-C 90W intégré et couverture colorimétrique 98% DCI-P3.",
          image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=80",
          features: ["Résolution 3840 x 2160", "Technologie IPS Black", "Hub USB-C 90W", "Contraste 2000:1"]
        },
        {
          id: 5,
          name: "Clavier Mécanique Keychron K2 Pro",
          category: "Accessoires",
          price: 119.00,
          stock: 25,
          rating: 4.9,
          numReviews: 42,
          badge: "Coup de Cœur",
          description: "Clavier sans fil mécanique 75% QMK/VIA avec switches hotswap et rétroéclairage RGB personnalisable.",
          image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80",
          features: ["Switches Hotswap Gateron", "Bluetooth 5.1 & Câble", "Compatible Mac & Windows", "Keycaps PBT double-shot"]
        },
        {
          id: 6,
          name: "Souris Logitech MX Master 3S",
          category: "Accessoires",
          price: 109.90,
          stock: 18,
          rating: 4.8,
          numReviews: 53,
          badge: "Populaire",
          description: "Capteur 8000 DPI tous supports, clics silencieux, molette MagSpeed défilement ultra-rapide.",
          image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=700&q=80",
          features: ["Capteur 8000 DPI Darkfield", "Molette MagSpeed", "Clics 90% plus silencieux", "Recharge USB-C"]
        },
        {
          id: 7,
          name: "iPad Air 11'' M2 128GB",
          category: "Tablettes",
          price: 699.00,
          stock: 10,
          rating: 4.7,
          numReviews: 28,
          badge: null,
          description: "Puce M2 ultra-puissante, caméra avant paysage 12 Mpx, compatible Apple Pencil Pro.",
          image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&q=80",
          features: ["Puce Apple M2", "Écran Liquid Retina", "Caméra 12 MP Cadre Centré", "Wi-Fi 6E ultra rapide"]
        },
        {
          id: 8,
          name: "Enceinte Bose SoundLink Revolve II",
          category: "Audio",
          price: 199.00,
          stock: 3,
          rating: 4.5,
          numReviews: 22,
          badge: "Stock Limité",
          description: "Son immersif à 360°, résistante aux éclaboussures et à la poussière (IP55), autonomie 13h.",
          image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=80",
          features: ["Diffusion 360 degrés", "Étanchéité IP55", "Commandes vocales intégrées", "Autonomie 13 heures"]
        },
        {
          id: 9,
          name: "Apple Watch Ultra 2 GPS + Cellular",
          category: "Accessoires",
          price: 899.00,
          stock: 7,
          rating: 4.9,
          numReviews: 31,
          badge: "Nouveauté",
          description: "Boîtier en titane de 49 mm, écran de 3000 nits, GPS double fréquence haute précision.",
          image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=700&q=80",
          features: ["Boîtier Titane 49mm", "Luminosité 3000 nits", "Autonomie jusqu'à 72h", "Profondeur jusqu'à 40m"]
        },
        {
          id: 10,
          name: "PlayStation 5 Édition Standard",
          category: "Gaming",
          price: 549.00,
          stock: 5,
          rating: 4.9,
          numReviews: 76,
          badge: "Top Vente",
          description: "Chargements ultra-rapides grâce à un disque SSD ultra-rapide, retour haptique et audio 3D.",
          image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80",
          features: ["SSD Ultra Haute Vitesse", "Manette DualSense Haptique", "Technologie Ray Tracing", "Sortie 120Hz 4K"]
        },
        {
          id: 11,
          name: "Samsung Galaxy S24 Ultra 512GB",
          category: "Smartphones",
          price: 1349.00,
          stock: 9,
          rating: 4.8,
          numReviews: 39,
          badge: null,
          description: "Cadre en titane, écran Dynamic AMOLED 2X 120Hz, stylet S-Pen intégré et Galaxy AI.",
          image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=700&q=80",
          features: ["Galaxy AI Intégré", "Stylet S-Pen Inclus", "Zoom Optique 100x", "Snapdragon 8 Gen 3"]
        },
        {
          id: 12,
          name: "Asus ROG Swift 27'' OLED 240Hz",
          category: "Écrans",
          price: 999.00,
          stock: 6,
          rating: 4.9,
          numReviews: 17,
          badge: "Gaming Pro",
          description: "Écran de jeu OLED QHD (2560 x 1440) de 26,5 pouces avec taux de rafraîchissement de 240 Hz.",
          image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=700&q=80",
          features: ["Dalle QD-OLED 240Hz", "Temps de réponse 0.03ms", "Résolution 2K QHD", "G-Sync Compatible"]
        }
      ];
      await Product.insertMany(initialProducts);
      console.log('[Seed] 12 produits insérés dans MongoDB');
    }

    // 3. Seed Coupons if empty
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log('[Seed] Insertion des codes promo...');
      await Coupon.create([
        {
          code: "TECH20",
          discountType: "percentage",
          discountValue: 20,
          maxDiscount: 100,
          minOrderValue: 50,
          isActive: true,
          expiresAt: new Date("2027-12-31T23:59:59.000Z"),
          description: "20% de réduction immédiate (dès 50€ d'achat, plafonné à 100€)"
        },
        {
          code: "BIENVENUE10",
          discountType: "fixed",
          discountValue: 10,
          maxDiscount: 10,
          minOrderValue: 30,
          isActive: true,
          expiresAt: new Date("2027-12-31T23:59:59.000Z"),
          description: "10€ de réduction pour toute nouvelle commande supérieure à 30€"
        },
        {
          code: "VIP50",
          discountType: "fixed",
          discountValue: 50,
          maxDiscount: 50,
          minOrderValue: 250,
          isActive: true,
          expiresAt: new Date("2027-12-31T23:59:59.000Z"),
          description: "50€ offerts pour les commandes premium de 250€ et plus"
        },
        {
          code: "EXPIRE2025",
          discountType: "percentage",
          discountValue: 30,
          maxDiscount: 150,
          minOrderValue: 20,
          isActive: false,
          expiresAt: new Date("2025-01-01T00:00:00.000Z"),
          description: "Code promo expiré (utilisé pour les tests de validation)"
        }
      ]);
      console.log('[Seed] 4 codes promo insérés dans MongoDB');
    }

    // 4. Seed Orders if empty
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      console.log('[Seed] Insertion des commandes historiques...');
      await Order.create([
        {
          id: "CMD-892104-512",
          userId: "1",
          userEmail: "client@test.com",
          userName: "Yassine Dev",
          items: [
            { id: 1, name: "MacBook Pro 16'' M3 Max", price: 2499.99, quantity: 1, itemTotal: 2499.99, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80" },
            { id: 5, name: "Clavier Mécanique Keychron K2 Pro", price: 119.00, quantity: 1, itemTotal: 119.00, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80" }
          ],
          subtotal: 2618.99,
          discountAmount: 100.00,
          couponCode: "TECH20",
          tax: 503.80,
          shippingFee: 0,
          grandTotal: 3022.79,
          shippingAddress: { street: "12 Boulevard Saint-Germain", city: "Paris", zip: "75005", country: "France" },
          paymentMethod: "Carte Bancaire (Simulée)",
          status: "Livrée",
          createdAt: new Date("2026-02-05T14:22:00.000Z")
        },
        {
          id: "CMD-771239-108",
          userId: "3",
          userEmail: "sarah.m@gmail.com",
          userName: "Sarah Mansour",
          items: [
            { id: 2, name: "iPhone 15 Pro Max 256GB", price: 1299.00, quantity: 1, itemTotal: 1299.00, image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=700&q=80" },
            { id: 3, name: "Casque Sony WH-1000XM5", price: 349.50, quantity: 1, itemTotal: 349.50, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80" }
          ],
          subtotal: 1648.50,
          discountAmount: 50.00,
          couponCode: "VIP50",
          tax: 319.70,
          shippingFee: 0,
          grandTotal: 1918.20,
          shippingAddress: { street: "45 Avenue Victor Hugo", city: "Lyon", zip: "69002", country: "France" },
          paymentMethod: "Apple Pay",
          status: "Livrée",
          createdAt: new Date("2026-02-12T11:45:00.000Z")
        },
        {
          id: "CMD-654812-334",
          userId: "4",
          userEmail: "thomas.bernard@outlook.fr",
          userName: "Thomas Bernard",
          items: [
            { id: 10, name: "PlayStation 5 Édition Standard", price: 549.00, quantity: 1, itemTotal: 549.00, image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80" }
          ],
          subtotal: 549.00,
          discountAmount: 0,
          couponCode: null,
          tax: 109.80,
          shippingFee: 0,
          grandTotal: 658.80,
          shippingAddress: { street: "8 Rue de la République", city: "Marseille", zip: "13001", country: "France" },
          paymentMethod: "Carte Bancaire (Simulée)",
          status: "Expédiée",
          createdAt: new Date("2026-02-20T16:10:00.000Z")
        },
        {
          id: "CMD-541982-901",
          userId: "5",
          userEmail: "leila.kaddour@gmail.com",
          userName: "Leïla Kaddour",
          items: [
            { id: 6, name: "Souris Logitech MX Master 3S", price: 109.90, quantity: 1, itemTotal: 109.90, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=700&q=80" },
            { id: 8, name: "Enceinte Bose SoundLink Revolve II", price: 199.00, quantity: 1, itemTotal: 199.00, image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=80" }
          ],
          subtotal: 308.90,
          discountAmount: 10.00,
          couponCode: "BIENVENUE10",
          tax: 59.78,
          shippingFee: 15.00,
          grandTotal: 373.68,
          shippingAddress: { street: "17 Cours Mirabeau", city: "Aix-en-Provence", zip: "13100", country: "France" },
          paymentMethod: "Carte Bancaire (Simulée)",
          status: "En préparation",
          createdAt: new Date("2026-02-24T09:30:00.000Z")
        }
      ]);
      console.log('[Seed] Commandes insérées dans MongoDB');
    }

    // 5. Seed Reviews if empty
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      await Review.create([
        {
          productId: 1,
          userName: "Alexandre Martin",
          rating: 5,
          title: "Une puissance phénoménale !",
          comment: "Le MacBook Pro M3 Max est une bête de course. Export 4K instantané, silence absolu et autonomie impressionnante."
        },
        {
          productId: 1,
          userName: "Sarah Benali",
          rating: 5,
          title: "Qualité d'écran incroyable",
          comment: "L'écran Liquid Retina XDR est le plus beau que j'ai vu sur un portable. Idéal pour le montage photo professionnel."
        },
        {
          productId: 2,
          userName: "Karim Ziani",
          rating: 5,
          title: "Le meilleur iPhone sans hésiter",
          comment: "Le titane allège énormément le téléphone en main. Les photos en x5 sont d'une netteté bluffante."
        },
        {
          productId: 3,
          userName: "Thomas Leroy",
          rating: 5,
          title: "Silence total dans le train",
          comment: "La réduction de bruit active est magique. Casque ultra confortable même après 6h d'écoute."
        }
      ]);
      console.log('[Seed] Avis clients insérés dans MongoDB');
    }
  } catch (err) {
    console.error('[Seed] Erreur lors du peuplement de la DB :', err.message);
  }
};

module.exports = seedDatabase;

