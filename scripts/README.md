# Scripts de données de test

Ce dossier contient les scripts pour créer des données de test pour les boutiques ManaShop.

## Utilisation

### 1. Créer les utilisateurs de test

Avant d'exécuter le script SQL, vous devez créer les utilisateurs via l'API Supabase Admin :

```bash
# Installer les dépendances
npm install @supabase/supabase-js

# Configurer les variables d'environnement
# Remplacez les valeurs dans create-test-users.js par vos vraies clés Supabase

# Exécuter le script
node scripts/create-test-users.js
```

### 2. Injecter les données de test

Une fois les utilisateurs créés, exécutez le script SQL dans l'éditeur SQL de Supabase :

1. Ouvrez votre projet Supabase
2. Allez dans l'onglet "SQL Editor"
3. Copiez-collez le contenu de `seed-data.sql`
4. Remplacez les UUIDs dans le script par les vrais IDs des utilisateurs créés
5. Exécutez le script

## Comptes de test créés

| Email                  | Mot de passe  | Rôle    | Description                         |
| ---------------------- | ------------- | ------- | ----------------------------------- |
| admin@manashop.com     | admin123!     | admin   | Administrateur de la plateforme     |
| alice@artmaster.com    | alice123!     | creator | Artiste spécialisée dans les alters |
| bob@tokencraft.com     | bob123!       | creator | Créateur de tokens personnalisés    |
| sarah@judgeacademy.com | sarah123!     | creator | Juge niveau 2, coaching             |
| pro@decksolutions.com  | pro123!       | creator | Constructeur de decks professionnel |
| collector@manashop.com | collector123! | buyer   | Collectionneur ManaShop             |

## Données créées

Le script `seed-data.sql` crée :

- ✅ 8 catégories (produits et services)
- ✅ 6 profils utilisateurs avec avatars et bios
- ✅ 4 boutiques avec logos, bannières et politiques
- ✅ 5 produits (alters, tokens, playmats) avec images
- ✅ 5 services (coaching, deckbuilding, commissions)
- ✅ 3 portfolios avec galeries d'images
- ✅ 2 commandes de test avec différents statuts
- ✅ 4 éléments de commande
- ✅ 3 messages entre acheteurs et vendeurs
- ✅ 2 avis clients
- ✅ 2 devis pour services personnalisés

## Test de l'application

Avec ces données, vous pouvez tester :

1. **Authentification** : Connexion avec les différents rôles
2. **Navigation** : Parcourir les produits et services
3. **Recherche** : Filtrer par catégorie, prix, pays
4. **Panier** : Ajouter des articles de différentes boutiques
5. **Commandes** : Voir l'historique et les statuts
6. **Dashboards** : Interface créateur et admin
7. **Messagerie** : Communication entre acheteurs/vendeurs
8. **Avis** : Système de notation et commentaires

## Notes importantes

- Les images utilisent des URLs Pexels pour les tests
- Les prix sont en USD
- Les PayPal IDs sont fictifs (pour les tests)
- Les politiques RLS doivent être configurées dans Supabase
- Pour tester les paiements, configurez PayPal Sandbox

# Configuration du Stockage Supabase

## 🎯 Objectif

Configurer le stockage Supabase pour permettre aux boutiques d'uploader des bannières personnalisées.

## 🚀 Configuration Rapide

### Option 1: Console SQL Supabase (Recommandée)

1. Allez dans votre dashboard Supabase
2. Cliquez sur "SQL Editor" dans le menu de gauche
3. Copiez-collez le contenu de `supabase/setup-storage.sql`
4. Cliquez sur "Run" pour exécuter le script

### Option 2: Script Node.js

1. Installez les dépendances : `npm install @supabase/supabase-js`
2. Modifiez `scripts/setup-storage.js` avec vos clés Supabase
3. Exécutez : `node scripts/setup-storage.js`

## 📁 Structure du Bucket

```
shop-assets/
├── {user_id}-banner-{timestamp}.jpg
├── {user_id}-banner-{timestamp}.png
└── {user_id}-banner-{timestamp}.gif
```

## 🔒 Politiques de Sécurité

- **Lecture publique** : Tous les utilisateurs peuvent voir les bannières
- **Upload restreint** : Seuls les propriétaires de boutique peuvent uploader
- **Modification restreinte** : Seuls les propriétaires peuvent modifier/supprimer
- **Validation des fichiers** : JPG, PNG, GIF, WebP uniquement
- **Limite de taille** : 5MB maximum

## 🎨 Utilisation dans l'App

### Upload de bannière

```typescript
const { data, error } = await supabase.storage
  .from("shop-assets")
  .upload(`shop-banners/${fileName}`, file);
```

### Affichage de la bannière

```typescript
const {
  data: { publicUrl },
} = supabase.storage.from("shop-assets").getPublicUrl(filePath);
```

## ⚠️ Notes Importantes

1. **Permissions** : Assurez-vous que RLS est activé sur `storage.objects`
2. **Authentification** : Les politiques RLS nécessitent que l'utilisateur soit connecté
3. **Nettoyage** : Les anciennes bannières ne sont pas automatiquement supprimées
4. **Performance** : Les images sont servies directement depuis Supabase CDN

## 🔧 Dépannage

### Erreur "Bucket not found"

- Vérifiez que le script SQL a été exécuté avec succès
- Vérifiez que vous êtes dans le bon projet Supabase

### Erreur "Policy already exists"

- Normal, les politiques sont créées avec `ON CONFLICT DO NOTHING`
- Vérifiez que les politiques existent dans la console Supabase

### Erreur "Access denied"

- Vérifiez que l'utilisateur est connecté
- Vérifiez que les politiques RLS sont correctement configurées

## 📱 Test

1. Créez une boutique via `/creator/shop`
2. Uploadez une bannière
3. Vérifiez l'affichage sur `/creator/{slug}`
4. Vérifiez que la bannière apparaît dans le carrousel d'artistes populaires
