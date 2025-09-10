# Guide de Test - Système d'Ambassadeurs ManaShop

## Vue d'ensemble du système refactorisé

Le nouveau système d'ambassadeurs est complètement autonome et centré sur l'utilisateur :

### Fonctionnalités principales
1. **Création automatique d'ambassadeur** : Les utilisateurs peuvent devenir ambassadeurs en un clic
2. **Wallet universel** : Tous les utilisateurs ont un wallet intégré dans le header
3. **Dashboard ambassadeur** : Interface dédiée pour gérer les parrainages
4. **Gestion des codes de parrainage** : Intégration dans l'inscription
5. **Admin dashboard** : Gestion centralisée des ambassadeurs et commissions

## Parcours de test complet

### 1. Test Utilisateur Standard → Ambassadeur

#### Étape 1 : Inscription d'un utilisateur
1. Aller sur `/auth/signup`
2. Remplir le formulaire d'inscription
3. Vérifier la création du compte et du profil
4. Vérifier la création automatique du wallet (solde 0€)

#### Étape 2 : Devenir ambassadeur
1. Se connecter et aller sur `/ambassador`
2. Cliquer sur "Devenir Ambassadeur"
3. Vérifier la génération du code de parrainage unique
4. Vérifier l'affichage du dashboard ambassadeur

#### Étape 3 : Tester le wallet
1. Dans le header, vérifier l'affichage du wallet compact
2. Cliquer sur le bouton "+" pour déposer de l'argent
3. Entrer un montant (ex: 50€) et confirmer
4. Vérifier la mise à jour du solde
5. Tester un retrait avec le bouton "-"

### 2. Test Parrainage

#### Étape 1 : Partager le lien de parrainage
1. Sur le dashboard ambassadeur, copier le lien de parrainage
2. Le lien doit être au format : `http://localhost:5173/auth/signup?ref=CODE_UNIQUE`

#### Étape 2 : Inscription via lien de parrainage
1. Ouvrir le lien dans un navigateur privé/incognito
2. Vérifier l'affichage de l'encart "Parrainé par [Nom de l'ambassadeur]"
3. Compléter l'inscription
4. Vérifier le message de confirmation du parrainage

#### Étape 3 : Vérification du parrainage
1. Retourner sur le dashboard de l'ambassadeur
2. Vérifier que le nouveau parrainé apparaît dans la liste
3. Vérifier la mise à jour des statistiques

### 3. Test Admin Dashboard

#### Étape 1 : Accès admin
1. Se connecter avec un compte admin
2. Aller sur `/admin/ambassadors`
3. Vérifier l'affichage de tous les ambassadeurs

#### Étape 2 : Gestion des ambassadeurs
1. Sélectionner un ambassadeur dans la liste
2. Modifier son taux de commission
3. Définir une date de fin (optionnelle)
4. Activer/désactiver l'ambassadeur
5. Vérifier la sauvegarde des modifications

### 4. Test Commissions

#### Étape 1 : Configuration des commissions
1. Aller sur `/admin/commissions`
2. Créer une règle de commission globale
3. Créer des règles spécifiques par produit/service
4. Vérifier l'activation/désactivation des règles

#### Étape 2 : Simulation de vente
1. Créer un produit en tant que créateur parrainé
2. Simuler une commande
3. Vérifier le calcul automatique des commissions
4. Vérifier la mise à jour du wallet de l'ambassadeur

### 5. Tests d'intégration

#### Test de l'interface utilisateur
- [ ] Wallet visible dans le header pour tous les utilisateurs connectés
- [ ] Lien "Programme Ambassadeur" dans le menu utilisateur
- [ ] Navigation fluide entre les différentes pages
- [ ] Responsive design sur mobile et desktop

#### Test de la base de données
- [ ] Création automatique des wallets
- [ ] Enregistrement correct des parrainages
- [ ] Calcul précis des commissions
- [ ] Historique des transactions

#### Test de sécurité
- [ ] Codes de parrainage uniques
- [ ] Validation des montants de wallet
- [ ] Protection des routes admin
- [ ] Gestion des erreurs

## Scénarios de test avancés

### Scénario 1 : Ambassadeur avec plusieurs parrainés
1. Créer plusieurs comptes via le même lien de parrainage
2. Simuler des ventes pour chaque parrainé
3. Vérifier l'accumulation des commissions
4. Tester les retraits de wallet

### Scénario 2 : Gestion des dates de fin
1. Définir une date de fin pour un ambassadeur
2. Tenter de s'inscrire avec son code après expiration
3. Vérifier que le parrainage est refusé
4. Vérifier l'affichage des informations d'expiration

### Scénario 3 : Test de performance
1. Créer de nombreux ambassadeurs (simulation)
2. Tester la pagination dans l'admin
3. Vérifier les temps de chargement
4. Tester avec de nombreuses transactions wallet

## Points de contrôle qualité

### UX/UI
- ✅ Interface moderne et cohérente
- ✅ Feedback utilisateur (toasts, loading states)
- ✅ Wallet compact et discret dans le header
- ✅ Dashboard ambassadeur intuitif

### Fonctionnel
- ✅ Création automatique d'ambassadeur
- ✅ Gestion des codes de parrainage
- ✅ Calcul des commissions
- ✅ Intégration PayPal simulée

### Technique
- ✅ Pas d'erreurs de linting
- ✅ Gestion des erreurs
- ✅ Optimisation des requêtes
- ✅ Sécurité des données

## Problèmes connus et limitations

1. **PayPal** : Intégration simulée (prompts natifs au lieu de l'API réelle)
2. **Notifications** : Pas de notifications push pour les nouveaux parrainages
3. **Analytics** : Métriques basiques, pas de graphiques avancés

## Prochaines améliorations

1. Intégration PayPal réelle avec SDK
2. Système de notifications en temps réel
3. Analytics avancées avec graphiques
4. Programme de paliers pour les ambassadeurs
5. Système de badges et récompenses
