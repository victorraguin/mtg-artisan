# ManaShop - Design System

## Vue d'ensemble

Ce design system met en œuvre une approche sobre, foncée et minimaliste pour l'application ManaShop, avec seulement trois couleurs principales pour créer une expérience magique et unique.

## Palette de Couleurs

### Couleurs Principales (3 couleurs max)

1. **Noir Profond** (`--background: 0 0% 4%`)

   - Couleur de fond principale
   - Crée une ambiance sombre et sophistiquée

2. **Blanc Cassé** (`--foreground: 0 0% 98%`)

   - Texte principal et éléments de premier plan
   - Offre un excellent contraste et une lisibilité optimale

3. **Doré Subtil** (`--primary: 45 100% 51%`)
   - Couleur d'accent pour les actions et éléments interactifs
   - Évoque la qualité premium et l'artisanat

### Couleurs Secondaires

- **Card Background**: `0 0% 6%` - Légèrement plus clair que le fond principal
- **Border**: `0 0% 12%` - Bordures subtiles et élégantes
- **Muted**: `0 0% 8%` - Éléments secondaires et désactivés

## Typographie

### Hiérarchie

- **Titres**: `font-light` avec `tracking-tight` pour un aspect moderne
- **Corps de texte**: Lisibilité optimale avec des contrastes appropriés
- **Labels**: `font-medium` pour les éléments interactifs

### Tailles

- **H1**: `text-5xl md:text-7xl` - Titres de page
- **H2**: `text-3xl md:text-4xl lg:text-5xl` - Sections
- **H3**: `text-xl md:text-2xl` - Sous-sections
- **Corps**: `text-sm md:text-base` - Texte principal

## Composants UI

### Button

Variantes disponibles :

- `primary`: Bouton principal avec fond doré
- `secondary`: Bouton secondaire
- `outline`: Bouton avec bordure
- `ghost`: Bouton transparent
- `gradient`: Bouton avec bordure dégradée

### Card

- **Border radius**: `rounded-3xl` pour un aspect moderne
- **Hover effects**: Animations subtiles avec `scale-[1.02]`
- **Glass effect**: Option `glass` pour les overlays

### Input

- **Design**: Champs arrondis avec bordures subtiles
- **Focus states**: Anneaux de focus avec la couleur primaire
- **Icons**: Support des icônes à gauche ou à droite

## Animations et Transitions

### Principes

- **Durée**: `0.3s` pour la plupart des transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` pour des mouvements naturels
- **Hover effects**: Transformations subtiles et ombres

### Animations Personnalisées

- **Shimmer**: Effet de brillance pour les éléments de chargement
- **Image hover**: Zoom subtil sur les images
- **Border animations**: Bordures animées au survol

## Effets Visuels

### Glassmorphism

- **Backdrop blur**: `backdrop-blur-xl`
- **Transparence**: `bg-background/80`
- **Bordures**: `border-border/50`

### Ombres

- **Niveaux de profondeur**: `depth-1`, `depth-2`, `depth-3`
- **Couleurs**: Utilisation de la couleur primaire pour les ombres
- **Hover**: Ombres plus prononcées au survol

## Responsive Design

### Breakpoints

- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Adaptations

- **Espacement**: `px-6 lg:px-8` pour les marges
- **Tailles**: Utilisation de classes responsives Tailwind
- **Navigation**: Menu adaptatif pour mobile

## Accessibilité

### Contraste

- **Ratio**: Respect des standards WCAG AA
- **Focus states**: Anneaux de focus visibles
- **Couleurs**: Vérification des contrastes avec la palette

### Navigation

- **Clavier**: Support complet de la navigation au clavier
- **Screen readers**: Structure sémantique appropriée
- **ARIA**: Labels et descriptions appropriés

## Utilisation

### Installation

Les composants sont disponibles dans `src/components/UI/` et peuvent être importés directement :

```tsx
import { Button, Card, Input } from "../components/UI";
```

### Personnalisation

Le design system utilise CSS Custom Properties et peut être facilement adapté en modifiant les variables dans `src/index.css`.

### Extensions

Nouveaux composants peuvent être ajoutés en suivant les conventions établies et en utilisant la palette de couleurs définie.

## Maintenance

### Mise à jour des couleurs

Modifier les variables CSS dans `:root` pour ajuster la palette globale.

### Ajout de composants

Suivre la structure existante et utiliser les classes utilitaires Tailwind définies.

### Tests

Vérifier la cohérence visuelle et l'accessibilité lors de l'ajout de nouveaux éléments.
