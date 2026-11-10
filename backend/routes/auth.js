// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user._id.toString(), name: user.name, email: user.email, role: user.role || 'customer' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit comporter au moins 6 caractères." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà associé à un compte." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      role: "customer",
      passwordHash
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      message: "Compte créé avec succès !",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error("Erreur inscription :", error);
    return res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects (email non trouvé)." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants incorrects (mot de passe invalide)." });
    }

    const token = generateToken(user);
    return res.json({
      message: "Connexion réussie !",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer'
      }
    });
  } catch (error) {
    console.error("Erreur connexion :", error);
    return res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
