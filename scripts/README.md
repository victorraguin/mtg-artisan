# Scripts de données de test

Ce dossier contient les scripts pour créer des données de test pour l'application MTG Artisans.

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

| Email | Mot de passe | Rôle | Description |
|-------|--------------|------|-------------|
| admin@mtgartisans.com | admin123! | admin | Administrateur de la plateforme |
| alice@artmaster.com | alice123! | creator | Artiste spécialisée dans les alters |
| bob@tokencraft.com | bob123! | creator | Créateur de tokens personnalisés |
| sarah@judgeacademy.com | sarah123! | creator | Juge niveau 2, coaching |
| pro@decksolutions.com | pro123! | creator | Constructeur de decks professionnel |
| collector@mtg.com | collector123! | buyer | Collectionneur MTG |

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