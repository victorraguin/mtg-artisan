# Guide de Correction de la Base de Données

## 🎯 Problème Identifié

L'erreur `COALESCE types uuid and text cannot be matched` vient du fait que :

- `user_id` est de type `uuid`
- `session_id` est de type `text`
- PostgreSQL ne peut pas faire un `COALESCE` entre ces deux types différents

## 🔧 Solution

J'ai créé un script SQL corrigé et simplifié : `fix_database_simple.sql`

### **Corrections Apportées**

#### 1. **Correction du COALESCE**

```sql
-- Avant (Erreur)
COUNT(DISTINCT COALESCE(user_id, session_id)) as unique_users_viewed

-- Après (Corrigé)
COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_users_viewed
```

#### 2. **Compatibilité avec votre Schéma**

- Utilise `item_id` et `item_type` pour `order_items` (au lieu de `product_id`)
- Utilise `owner_id` pour les relations avec `shops` (au lieu de `user_id`)
- Utilise `profile_id` pour `shipping_zones` (au lieu de `shipping_profile_id`)

#### 3. **Script Simplifié**

- Ne crée que ce qui est nécessaire
- Compatible avec votre schéma existant
- Évite les conflits avec les tables existantes

## 🎮 Comment Appliquer la Correction

### Étape 1 : Exécuter le Script Corrigé

```
1. Aller dans votre dashboard Supabase
2. Aller dans l'éditeur SQL
3. Copier le contenu de fix_database_simple.sql
4. Exécuter le script
```

### Étape 2 : Vérifier la Création

```
1. Aller dans l'onglet "Tables" de Supabase
2. Vérifier que la vue "product_statistics" existe
3. Vérifier que les index ont été créés
4. Vérifier que les fonctions RPC existent
```

### Étape 3 : Tester le Système

```
1. Aller sur votre dashboard créateur
2. Vérifier que les statistiques s'affichent
3. Tester l'édition d'un produit
4. Vérifier que le stock se met à jour correctement
```

## ✅ Ce que le Script Fait

### 1. **Crée la Vue `product_statistics`**

- Consolidation des statistiques de vues, paniers et ventes
- Compatible avec votre schéma existant
- Gère les types de données correctement

### 2. **Crée les Index**

- Améliore les performances des requêtes
- Index sur les colonnes fréquemment utilisées

### 3. **Active RLS et Crée les Politiques**

- Sécurité des données
- Accès contrôlé aux tables

### 4. **Crée les Fonctions RPC**

- `increment_product_view` : Tracking des vues
- `track_cart_addition` : Tracking des ajouts au panier
- `track_cart_removal` : Tracking des suppressions du panier

## 🚨 Erreurs Évitées

### 1. **Erreur de Type COALESCE**

- ✅ Corrigé avec `user_id::text`

### 2. **Conflits de Schéma**

- ✅ Utilise les noms de colonnes corrects
- ✅ Compatible avec votre structure existante

### 3. **Tables Dupliquées**

- ✅ Ne crée que ce qui est nécessaire
- ✅ Évite les conflits avec les tables existantes

## 🎯 Résultat Attendu

Après avoir exécuté le script :

1. **Vue `product_statistics`** créée et fonctionnelle
2. **Index** créés pour améliorer les performances
3. **Fonctions RPC** disponibles pour le tracking
4. **Politiques RLS** activées pour la sécurité
5. **Erreurs de base de données** résolues

Le système de tracking et d'analytics sera maintenant **complètement fonctionnel** ! 🚀
