# Système d'Analytics et de Gestion d'Inventaire - ManaShop

## Vue d'ensemble

Ce document décrit le système complet d'analytics et de gestion d'inventaire implémenté pour ManaShop, incluant le tracking des vues, la gestion des paniers, et la prévention des conflits de stock.

## 🎯 Fonctionnalités Implémentées

### 1. Analytics Avancés

#### Tracking des Vues de Produit

- **Déduplication** : Évite les vues multiples de la même session (5 min)
- **Utilisateurs anonymes** : Tracking par session ID
- **Utilisateurs connectés** : Tracking par user ID
- **Métadonnées** : IP, user agent pour l'analyse

#### Tracking des Paniers

- **Ajouts** : Chaque ajout au panier est enregistré
- **Suppressions** : Tracking des abandons de panier
- **Conversions** : Lien avec les commandes finales
- **Quantités** : Suivi des quantités ajoutées/supprimées

#### Statistiques de Vente

- **Revenus** : Calcul automatique par produit
- **Quantités vendues** : Suivi des unités vendues
- **Taux de conversion** : Vues → Achats
- **Tendances** : Données sur 30 jours

### 2. Gestion d'Inventaire Intelligente

#### Vérification de Stock en Temps Réel

```typescript
// Avant chaque ajout au panier
const stockInfo = await analyticsService.checkStockAvailability(
  productId,
  quantity
);
if (!stockInfo.available) {
  toast.error(
    `Stock insuffisant. Seulement ${stockInfo.availableStock} disponible(s)`
  );
  return;
}
```

#### Gestion des Conflits

- **Stock réservé** : Les articles dans les paniers réduisent le stock disponible
- **Timeout des paniers** : Articles libérés après expiration (à implémenter)
- **Priorité FIFO** : Premier arrivé, premier servi
- **Notifications** : Alertes en temps réel sur les stocks faibles

### 3. Frais de Livraison

#### Profils de Livraison

- **Coût de base** : Frais fixes par boutique
- **Livraison gratuite** : Seuil configurable
- **Profil par défaut** : Un profil principal par boutique
- **Zones géographiques** : Coûts différenciés par région (prévu)

#### Intégration Commandes

- **Calcul automatique** : Frais ajoutés lors du checkout
- **Transparence** : Affichage détaillé des coûts
- **Optimisation** : Suggestions de livraison gratuite

## 🛠️ Architecture Technique

### Base de Données

#### Tables Analytics

```sql
-- Vues de produits
CREATE TABLE product_views (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics de panier
CREATE TABLE cart_analytics (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    quantity INTEGER,
    added_at TIMESTAMP DEFAULT NOW(),
    removed_at TIMESTAMP,
    converted_to_order BOOLEAN DEFAULT FALSE,
    order_id UUID REFERENCES orders(id)
);
```

#### Vue Statistiques

```sql
-- Vue consolidée des statistiques
CREATE VIEW product_statistics AS
SELECT
    p.id as product_id,
    COUNT(DISTINCT pv.id) as total_views,
    COUNT(DISTINCT ca.id) as times_added_to_cart,
    COUNT(DISTINCT CASE WHEN ca.removed_at IS NULL THEN ca.id END) as currently_in_carts,
    COUNT(DISTINCT oi.id) as total_sales,
    COALESCE(SUM(oi.unit_price * oi.qty), 0) as total_revenue,
    -- ... autres métriques
FROM products p
LEFT JOIN product_views pv ON p.id = pv.product_id
LEFT JOIN cart_analytics ca ON p.id = ca.product_id
LEFT JOIN order_items oi ON p.id = oi.item_id
GROUP BY p.id;
```

### Services

#### AnalyticsService

```typescript
class AnalyticsService {
  // Tracking des vues
  async trackProductView(productId: string, userId?: string): Promise<void>;

  // Gestion du panier
  async trackCartAddition(
    productId: string,
    quantity: number,
    userId?: string
  ): Promise<void>;
  async trackCartRemoval(productId: string, userId?: string): Promise<void>;

  // Vérification stock
  async checkStockAvailability(
    productId: string,
    quantity: number
  ): Promise<StockInfo>;

  // Statistiques
  async getProductStatistics(productId: string): Promise<ProductStats>;
  async getShopProductsStatistics(shopId: string): Promise<ProductStats[]>;
}
```

#### Hooks React

```typescript
// Hook principal pour le tracking
export function useAnalytics() {
  const trackView = async (productId: string) => { ... };
  const trackCartAdd = async (productId: string, quantity: number) => { ... };
  const trackCartRemove = async (productId: string) => { ... };
  return { trackView, trackCartAdd, trackCartRemove };
}

// Hook pour les statistiques
export function useShopStatistics(shopId: string) {
  const { statistics, loading, error, refetch } = ...;
  return { statistics, loading, error, refetch };
}

// Hook pour la vérification de stock
export function useStockCheck() {
  const checkStock = async (productId: string, quantity: number) => { ... };
  return { checkStock, checking };
}
```

## 📊 Interface Utilisateur

### Dashboard Créateur

#### Statistiques par Produit

- **Vues** : Nombre total et uniques
- **Paniers** : Articles actuellement dans des paniers
- **Ventes** : Quantités vendues et revenus
- **Conversion** : Taux de transformation vues → achats

#### Tableau de Gestion

```tsx
<div className="grid grid-cols-4 gap-2 text-center">
  <div>
    <Eye className="h-4 w-4 text-blue-500" />
    <span>{product.total_views}</span>
    <div>Vues</div>
  </div>
  <div>
    <TrendingUp className="h-4 w-4 text-green-500" />
    <span>{product.total_quantity_sold}</span>
    <div>Vendus</div>
  </div>
  <div>
    <DollarSign className="h-4 w-4 text-primary" />
    <span>${product.total_revenue}</span>
    <div>Revenus</div>
  </div>
  <div>
    <Package className="h-4 w-4 text-orange-500" />
    <span>{product.currently_in_carts}</span>
    <div>Paniers</div>
  </div>
</div>
```

### Gestion des Stocks

#### Alertes en Temps Réel

- **Stock faible** : Notifications automatiques
- **Rupture** : Alertes critiques
- **Conflits** : Gestion des accès concurrents

#### Interface Panier

- **Vérification automatique** : Avant chaque ajout
- **Messages informatifs** : Stock disponible affiché
- **Gestion gracieuse** : Fallback en cas d'indisponibilité

## 🔧 Utilisation

### Tracking Automatique

#### Dans les Pages Produit

```tsx
import { ProductViewTracker } from "../../components/Analytics";

export function ProductDetail({ productId }: { productId: string }) {
  return (
    <div>
      <ProductViewTracker productId={productId} />
      {/* Contenu de la page */}
    </div>
  );
}
```

#### Dans le Contexte Panier

```tsx
// Ajout automatique avec vérification
const addToCart = async (item) => {
  // 1. Vérifier le stock
  const stockInfo = await analyticsService.checkStockAvailability(
    item.item_id,
    item.qty
  );

  // 2. Ajouter si disponible
  if (stockInfo.available) {
    // ... ajout en base
    // 3. Tracker l'action
    analyticsService.trackCartAddition(item.item_id, item.qty, user.id);
  }
};
```

### Affichage des Statistiques

#### Composant ProductsTable

```tsx
// Utilisation du hook de statistiques
const { statistics, loading, refetch } = useShopStatistics(shopId);

// Combinaison avec les données produit
useEffect(() => {
  const combined = products.map((product) => {
    const stats = statistics.find((s) => s.product_id === product.id);
    return { ...product, ...stats };
  });
  setProductsWithStats(combined);
}, [products, statistics]);
```

## 🚀 Performance

### Optimisations

#### Base de Données

- **Index optimisés** : Sur product_id, user_id, created_at
- **Vue matérialisée** : Pour les statistiques lourdes (optionnel)
- **Partitioning** : Par date pour les gros volumes

#### Frontend

- **Debouncing** : Évite les appels multiples
- **Cache local** : Statistiques en cache
- **Lazy loading** : Chargement progressif

#### Tracking Asynchrone

- **Non-bloquant** : N'affecte pas l'UX
- **Retry logic** : Gestion des échecs réseau
- **Batch processing** : Groupement des événements

## 🔒 Sécurité et Confidentialité

### Row Level Security (RLS)

```sql
-- Seuls les propriétaires voient leurs stats
CREATE POLICY "Shop owners see their stats" ON product_views
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products p JOIN shops s ON p.shop_id = s.id
    WHERE p.id = product_views.product_id AND s.owner_id = auth.uid()
  )
);
```

### Anonymisation

- **Sessions temporaires** : Nettoyage automatique
- **Données minimales** : Seulement ce qui est nécessaire
- **Consentement** : Respect du RGPD

## 📈 Métriques Clés

### KPIs Produit

- **Taux de vue** : Vues / Impressions
- **Taux d'ajout panier** : Ajouts / Vues
- **Taux de conversion** : Achats / Vues
- **Valeur panier moyenne** : Revenus / Commandes

### KPIs Boutique

- **Produits populaires** : Top vues/ventes
- **Revenus par période** : Tendances temporelles
- **Stock turnover** : Rotation des stocks
- **Abandons panier** : Optimisation UX

## 🔮 Évolutions Futures

### Analytics Avancés

- **Heatmaps** : Zones chaudes des pages
- **Funnel analysis** : Parcours utilisateur
- **Cohort analysis** : Rétention client
- **A/B testing** : Optimisation continue

### Gestion Inventaire

- **Prédictions** : ML pour les ruptures
- **Auto-restock** : Commandes automatiques
- **Multi-entrepôts** : Gestion distribuée
- **Dropshipping** : Intégration fournisseurs

### Intégrations

- **Google Analytics** : Double tracking
- **Facebook Pixel** : Retargeting
- **Email marketing** : Triggers automatiques
- **CRM** : Synchronisation client

## 🛠️ Maintenance

### Monitoring

- **Alertes** : Erreurs de tracking
- **Performance** : Temps de réponse
- **Volumes** : Croissance des données
- **Qualité** : Intégrité des données

### Nettoyage

- **Purge automatique** : Données anciennes
- **Archivage** : Données historiques
- **Optimisation** : Index et requêtes
- **Backup** : Sauvegarde régulière

### Tests

- **Unit tests** : Services et hooks
- **Integration tests** : Flux complets
- **Load tests** : Montée en charge
- **E2E tests** : Parcours utilisateur
