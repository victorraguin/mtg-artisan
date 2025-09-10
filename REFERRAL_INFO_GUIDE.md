# Guide des Informations de Parrainage - ManaShop

## 🎯 Où retrouver les informations de parrainage

### Pour les utilisateurs parrainés

#### 1. **Page de Profil** (`/profile`) ✅

**Accès** : Menu utilisateur → "Paramètres du Profil"

**Informations affichées** :

- ✅ **Nom de l'ambassadeur** qui vous a parrainé
- ✅ **Code de parrainage** utilisé
- ✅ **Date de parrainage** (quand vous avez rejoint)
- ✅ **Commissions générées** pour votre ambassadeur
- ✅ **Message de remerciement** si vous avez généré des commissions

**Interface** :

- Section dédiée "Informations de Parrainage"
- Design avec icônes et couleurs distinctives
- Affichage conditionnel (uniquement si parrainé)

#### 2. **Inscription** (`/auth/signup?ref=CODE`) ✅

**Informations affichées** :

- ✅ **Nom de l'ambassadeur** dans un encart spécial
- ✅ **Explication claire** du système de commissions
- ✅ **Message de confirmation** après inscription

### Pour les ambassadeurs

#### 1. **Dashboard Ambassadeur** (`/ambassador`) ✅

**Informations affichées** :

- ✅ **Liste complète** de tous les parrainés
- ✅ **Statistiques détaillées** par parrainé
- ✅ **Revenus générés** par chaque parrainage
- ✅ **Dates importantes** (parrainage, première vente)

#### 2. **Wallet** (Header + pages dédiées) ✅

**Informations affichées** :

- ✅ **Commissions d'ambassadeur** dans l'historique
- ✅ **Revenus par type** (parrainage vs ventes)
- ✅ **Transactions détaillées** avec références

### Pour les admins

#### 1. **Admin Ambassadeurs** (`/admin/ambassadors`) ✅

**Informations affichées** :

- ✅ **Vue d'ensemble** de tous les ambassadeurs
- ✅ **Statistiques globales** du programme
- ✅ **Gestion des taux** et paramètres
- ✅ **Détails par ambassadeur** (parrainages, revenus)

## 🔍 Détails techniques

### Base de données

```sql
-- Table des parrainages
referrals:
- ambassador_id (lien vers ambassadors)
- referred_user_id (utilisateur parrainé)
- referral_date (date du parrainage)
- total_earned (commissions générées)
- is_active (statut du parrainage)

-- Jointures utilisées
referrals → ambassadors → profiles (nom ambassadeur)
referrals → profiles (info utilisateur parrainé)
```

### Requêtes principales

#### Récupération info parrainage (Profile.tsx)

```sql
SELECT
  referral_date,
  total_earned,
  ambassador.referral_code,
  ambassador.profile.display_name
FROM referrals
JOIN ambassadors ON referrals.ambassador_id = ambassadors.id
JOIN profiles ON ambassadors.user_id = profiles.id
WHERE referrals.referred_user_id = $user_id
```

#### Vérification code parrainage (SignUp.tsx)

```sql
SELECT
  ambassadors.*,
  profile.display_name
FROM ambassadors
JOIN profiles ON ambassadors.user_id = profiles.id
WHERE ambassadors.referral_code = $code
AND ambassadors.is_active = true
```

## 📱 Expérience utilisateur

### Parcours type d'un utilisateur parrainé

1. **Inscription** avec lien de parrainage

   - ✅ Reconnaissance automatique du code
   - ✅ Affichage des infos ambassadeur
   - ✅ Confirmation du parrainage

2. **Utilisation normale** de la plateforme

   - ✅ Wallet visible dans le header
   - ✅ Aucune différence dans l'expérience

3. **Consultation des informations**
   - ✅ Page profil pour voir son ambassadeur
   - ✅ Historique des commissions générées
   - ✅ Transparence totale du système

### Messages et notifications

#### Messages positifs

- ✅ "Lien de parrainage validé !"
- ✅ "Merci pour votre contribution !"
- ✅ "Vos ventes ont permis à votre ambassadeur de gagner X€"

#### Informations claires

- ✅ "Votre parrain gagnera des commissions sur vos futures ventes"
- ✅ "Vous avez rejoint ManaShop grâce à un ambassadeur"
- ✅ "Commissions générées pour votre ambassadeur"

## 🚀 Améliorations futures possibles

### Fonctionnalités avancées

- [ ] **Notifications** lors de nouvelles commissions
- [ ] **Historique détaillé** des ventes qui ont généré des commissions
- [ ] **Contact direct** avec l'ambassadeur
- [ ] **Badge spécial** pour les utilisateurs parrainés
- [ ] **Programme de fidélité** pour les parrainés actifs

### Analytics avancées

- [ ] **Graphiques** d'évolution des commissions
- [ ] **Comparaison** avec d'autres parrainés
- [ ] **Prédictions** de revenus futurs
- [ ] **Classements** des ambassadeurs les plus performants

## 📋 Checklist de vérification

### Tests à effectuer

#### Pour un utilisateur parrainé

- [ ] S'inscrire avec un code de parrainage
- [ ] Vérifier l'affichage dans la page profil
- [ ] Effectuer des achats/ventes
- [ ] Contrôler la mise à jour des commissions
- [ ] Tester l'affichage responsive

#### Pour un ambassadeur

- [ ] Créer un lien de parrainage
- [ ] Parrainer un utilisateur
- [ ] Vérifier les statistiques du dashboard
- [ ] Contrôler les revenus dans le wallet
- [ ] Tester les notifications

#### Pour un admin

- [ ] Consulter la vue d'ensemble
- [ ] Modifier les paramètres d'un ambassadeur
- [ ] Vérifier les statistiques globales
- [ ] Contrôler la cohérence des données

Le système de parrainage est maintenant **complètement transparent** et **facilement accessible** pour tous les utilisateurs ! 🎉
