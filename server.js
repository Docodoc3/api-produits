const express = require('express');
const app = express();
const PORT = 3000;

// Middleware permettant d'analyser le corps des requêtes au format JSON
app.use(express.json());

// Données stockées en mémoire
let produits = [
  {
    id: 1,
    nom: 'Ecran 27 pouces',
    description: 'Ecran 4K 144Hz pour le jeu et la bureautique',
    prix: 299.99,
    categorie: 'Informatique'
  },
  {
    id: 2,
    nom: 'Souris ergonomique',
    description: 'Souris sans fil avec capteur optique',
    prix: 45.00,
    categorie: 'Accessoires'
  }
];

let nextId = 3;

// 1. LISTER tous les produits
app.get('/api/produits', (req, res) => {
  res.status(200).json(produits);
});

// 2. CONSULTER un produit par son ID
app.get('/api/produits/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const produit = produits.find(p => p.id === id);

  if (!produit) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }

  res.status(200).json(produit);
});

// 3. AJOUTER un produit
app.post('/api/produits', (req, res) => {
  const { nom, description, prix, categorie } = req.body;

  if (!nom || !description || prix === undefined || !categorie) {
    return res.status(400).json({ message: 'Tous les champs (nom, description, prix, categorie) sont requis' });
  }

  const nouveauProduit = {
    id: nextId++,
    nom,
    description,
    prix: Number(prix),
    categorie
  };

  produits.push(nouveauProduit);
  res.status(201).json(nouveauProduit);
});

// 4. REMPLACER totalement un produit (PUT)
app.put('/api/produits/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = produits.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }

  const { nom, description, prix, categorie } = req.body;

  if (!nom || !description || prix === undefined || !categorie) {
    return res.status(400).json({ message: 'Tous les champs doivent être fournis pour un remplacement complet' });
  }

  produits[index] = {
    id,
    nom,
    description,
    prix: Number(prix),
    categorie
  };

  res.status(200).json(produits[index]);
});

// 5. MODIFIER partiellement un produit (PATCH)
app.patch('/api/produits/:id', (req, res) => {
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

// 6. SUPPRIMER un produit
app.delete('/api/produits/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = produits.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }

  produits.splice(index, 1);
  res.status(204).send();
});

// Démarrage du serveur HTTP
app.listen(PORT, () => {
  console.log(`Serveur actif sur http://localhost:${PORT}`);
});