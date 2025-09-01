# Fonctionnalités Créateur - ManaShop

## Vue d'ensemble

Ce document décrit les fonctionnalités disponibles pour les créateurs (artistes et artisans) sur la plateforme ManaShop.

## Pages Disponibles

### 1. Création de Produit

**Route :** `/creator/products/new`

**Fonctionnalités :**

- Création de produits physiques ou numériques
- Gestion des informations de base (titre, description, prix)
- Configuration du stock (pour les produits physiques)
- Sélection de catégorie
- Gestion des tags
- Configuration du délai de livraison
- Choix du statut (brouillon/actif)

**Design System :**

- Interface moderne avec le nouveau design system
- Composants UI cohérents (Button, Card, Input, Select, Textarea, TagInput, RadioGroup)
- Animations et transitions fluides
- Responsive design

### 2. Édition de Produit

**Route :** `/creator/products/:productId/edit`

**Fonctionnalités :**

- Modification de tous les champs d'un produit existant
- Vérification des permissions (seul le propriétaire peut éditer)
- Mise à jour en temps réel
- Gestion des statuts étendue (brouillon, actif, en pause, épuisé)

**Sécurité :**

- Vérification que l'utilisateur est propriétaire du produit
- Redirection automatique en cas d'accès non autorisé

## Composants UI Créés

### Button

- Variantes : primary, secondary, outline, ghost, gradient
- Tailles : sm, md, lg
- Support des icônes et états de chargement

### Card

- Design moderne avec bordures arrondies
- Effets de survol et animations
- Support du glassmorphism

### Input

- Champs de saisie stylisés
- Support des icônes
- Gestion des erreurs
- Variantes : default, glass

### Textarea

- Zones de texte extensibles
- Cohérent avec le design system
- Gestion des erreurs

### Select

- Menus déroulants stylisés
- Icône de chevron personnalisée
- Gestion des erreurs

### TagInput

- Gestion avancée des tags
- Ajout/suppression dynamique
- Limite configurable du nombre de tags
- Interface intuitive

### RadioGroup

- Sélection radio stylisée
- Support des descriptions
- Animations au survol et à la sélection

## Design System

### Couleurs

- **Noir Profond** : Fond principal
- **Blanc Cassé** : Texte et éléments de premier plan
- **Doré Subtil** : Couleur d'accent et actions

### Typographie

- Hiérarchie claire avec des tailles responsives
- Police légère avec tracking serré
- Contraste optimal pour l'accessibilité

### Animations

- Transitions fluides (0.3s)
- Effets de survol subtils
- Transformations d'échelle au survol

## Utilisation

### Installation des Composants

```tsx
import {
  Button,
  Card,
  Input,
  Textarea,
  Select,
  TagInput,
  RadioGroup,
} from "../components/UI";
```

### Exemple d'Utilisation

```tsx
<Card className="p-8">
  <CardHeader>
    <h2>Créer un produit</h2>
  </CardHeader>
  <CardContent>
    <form className="space-y-6">
      <Input label="Titre du produit" placeholder="Nom du produit" required />
      <Textarea
        label="Description"
        rows={4}
        placeholder="Description détaillée..."
      />
      <Select
        label="Catégorie"
        options={categoryOptions}
        placeholder="Choisir une catégorie"
      />
      <TagInput label="Tags" tags={tags} onTagsChange={setTags} />
      <Button type="submit" loading={isSubmitting}>
        Créer le produit
      </Button>
    </form>
  </CardContent>
</Card>
```

## Navigation

### Routes Créateur

- `/creator/products/new` - Créer un nouveau produit
- `/creator/products/:id/edit` - Éditer un produit existant
- `/creator/services/new` - Créer un nouveau service
- `/creator/shop` - Gérer la boutique
- `/dashboard/creator` - Tableau de bord créateur

### Navigation

- Bouton "Retour" sur toutes les pages de création/édition
- Redirection automatique après sauvegarde
- Gestion des erreurs avec toast notifications

## Sécurité et Permissions

### Vérifications

- Rôle utilisateur (creator requis)
- Propriété du produit (pour l'édition)
- Existence de la boutique

### Redirections

- Redirection automatique si non autorisé
- Messages d'erreur explicites
- Gestion gracieuse des erreurs

## Responsive Design

### Breakpoints

- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Adaptations

- Grilles responsives
- Espacement adaptatif
- Tailles de police responsives

## Maintenance

### Ajout de Nouveaux Composants

1. Créer le composant dans `src/components/UI/`
2. Ajouter l'export dans `src/components/UI/index.ts`
3. Suivre les conventions de nommage et de style
4. Tester la responsivité et l'accessibilité

### Mise à Jour du Design System

- Modifier les variables CSS dans `src/index.css`
- Maintenir la cohérence des couleurs et espacements
- Tester sur différents appareils et navigateurs
