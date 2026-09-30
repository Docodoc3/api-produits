const express = require('express');
const jwt = require('jsonwebtoken'); // Importation de JSON Web Token

const app = express();
const PORT = 3000;

// Clé secrète pour signer et vérifier les jetons (à conserver secrète en production)
const SECRET_KEY = 'cle_secrete_pour_le_tp';

app.use(express.json());

// Données de démonstration pour les produits
let produits = [
  { id: 1, nom: 'Ecran 27 pouces', description: 'Ecran 4K 144Hz', prix: 299.99, categorie: 'Informatique' },
  { id: 2, nom: 'Souris ergonomique', description: 'Souris sans fil', prix: 45.00, categorie: 'Accessoires' }
];
let nextId = 3;

// --- ROUTE D'AUTHENTIFICATION ---
// Permet d'obtenir un jeton d'accès
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Compte de démonstration
  if (username === 'admin' && password === '1234') {
    // Génération du jeton expirant après 5 minutes
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '5m' });
    return res.status(200).json({ token });
  }

  // Identifiants invalides
  res.status(401).json({ message: 'Identifiants incorrects' });
});

// --- MIDDLEWARE DE VÉRIFICATION DU JETON ---
const verifierJeton = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Récupère le jeton après le mot "Bearer "
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé : aucun jeton fourni' });
  }

  // Vérification de la validité et de l'expiration du jeton
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Jeton invalide ou expiré' });
    }
    req.user = user;
    next(); // Passe à l'action suivante si le jeton est valide
  });
};

// --- ROUTES PUBLIQUES (LECTURE) ---
// 1. Lister tous les produits
app.get('/api/produits', (req, res) => {
  res.status(200).json(produits);
});

// 2. Consulter un produit par ID
app.get('/api/produits/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const produit = produits.find(p => p.id === id);

  if (!produit) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }

  res.status(200).json(produit);
});

// --- ROUTES PROTÉGÉES (ÉCRITURE) ---
// 3. Ajouter un produit (Protégé)
app.post('/api/produits', verifierJeton, (req, res) => {
  const { nom, description, prix, categorie } = req.body;

  if (!nom || !description || prix === undefined || !categorie) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  const nouveauProduit = { id: nextId++, nom, description, prix: Number(prix), categorie };
  produits.push(nouveauProduit);
  res.status(201).json(nouveauProduit);
});

// 4. Remplacer totalement un produit (Protégé)
app.put('/api/produits/:id', verifierJeton, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = produits.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }

  const { nom, description, prix, categorie } = req.body;

  if (!nom || !description || prix === undefined || !categorie) {
    return res.status(400).json({ message: 'Tous les champs doivent être fournis' });
  }

  produits[index] = { id, nom, description, prix: Number(prix), categorie };
  res.status(200).json(produits[index]);
});

// 5. Modifier partiellement un produit (Protégé)
app.patch('/api/produits/:id', verifierJeton, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const produit = produits.find(p => p.id === id);

  if (!produit) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }

  const { nom, description, prix, categorie } = req.body;

  if (nom !== undefined) produit.nom = nom;
  if (description !== undefined) produit.description = description;
  if (prix !== undefined) produit.prix = Number(prix);
  if (categorie !== undefined) produit.categorie = categorie;

  res.status(200).json(produit);
});

// 6. Supprimer un produit (Protégé)
app.delete('/api/produits/:id', verifierJeton, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = produits.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }

  produits.splice(index, 1);
  res.status(204).send();
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur actif sur http://localhost:${PORT}`);
});