// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/techstore_db';
  const isAtlas = uri.startsWith('mongodb+srv://');

  try {
    if (isAtlas) {
      console.log(`[MongoDB] Tentative de connexion au Cloud MongoDB Atlas...`);
    } else {
      console.log(`[MongoDB] Connexion au serveur local : ${uri}`);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    const hostType = isAtlas ? 'Cloud Atlas Cluster' : conn.connection.host;
    console.log(`====================================================`);
    console.log(`[MongoDB] Connexion établie avec succès !`);
    console.log(`[Base de données] : ${conn.connection.name}`);
    console.log(`[Hôte / Source]   : ${hostType}`);
    console.log(`====================================================`);
    return conn;
  } catch (err) {
    console.error(`====================================================`);
    console.error(`[MongoDB] Échec de la connexion :`, err.message);
    if (isAtlas) {
      console.error(`[Diagnostic Atlas] :`);
      console.error(` 1. Vérifiez que votre mot de passe ne contient pas de caractères spéciaux non encodés.`);
      console.error(` 2. Assurez-vous d'avoir autorisé l'adresse IP (0.0.0.0/0) dans Network Access sur Atlas.`);
      console.error(` 3. Vérifiez le nom d'utilisateur dans la chaîne mongodb+srv://.`);
    }
    console.error(`====================================================`);

    // Basculement automatique vers MongoDB local si Atlas échoue
    if (isAtlas) {
      console.log(`[MongoDB] Tentative de basculement vers MongoDB local (127.0.0.1:27017)...`);
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/techstore_db');
        console.log(`[MongoDB] Connecté avec succès au fallback local !`);
        return localConn;
      } catch (localErr) {
        console.error(`[MongoDB] Le fallback local a également échoué.`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
