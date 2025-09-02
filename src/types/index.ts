// Types pour les produits
export interface Product {
  id: string;
  shop_id: string;
  type: "physical" | "digital";
  title: string;
  description: string;
  price: number;
  currency: string;
  stock: number | null;
  images: string[];
  category_id: string;
  tags: string[];
  attributes: Record<string, any>;
  lead_time_days: number | null;
  status: "draft" | "active" | "paused" | "sold_out";
  created_at: string;
}

// Types pour les services
export interface Service {
  id: string;
  shop_id: string;
  title: string;
  description: string;
  base_price: number;
  currency: string;
  requires_brief: boolean;
  delivery_days: number;
  slots_config: Record<string, any> | null;
  category_id: string | null;
  status: "draft" | "active" | "paused";
  created_at: string;
}

// Types pour les boutiques
export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  banner_url: string | null;
  logo_url: string | null;
  bio: string | null;
  policies: string | null;
  shipping_profile_id: string | null;
  paypal_merchant_id: string | null;
  paypal_email: string | null;
  is_verified: boolean;
  rating_avg: number;
  country: string | null;
  created_at: string;
}

// Types pour les catégories
export interface Category {
  id: string;
  name: string;
  description: string | null;
  type: "product" | "service";
  created_at: string;
}

// Types pour les commandes
export interface Order {
  id: string;
  user_id: string;
  total: number;
  currency: string;
  status: string;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  breakdown_by_shop: Record<string, any>;
  shipping_cost: number;
  shipping_profile_id: string | null;
  shipping_zone_id: string | null;
  created_at: string;
}

// Types pour les articles de commande
export interface OrderItem {
  id: string;
  order_id: string;
  shop_id: string;
  item_type: "product" | "service";
  item_id: string;
  qty: number;
  unit_price: number;
  currency: string;
  status: string;
  tracking: string | null;
  delivery_due_at: string | null;
  delivered_at: string | null;
  files: string[];
  created_at: string;
}

// Types pour les profils de livraison
export interface ShippingProfile {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  base_cost: number;
  free_shipping_threshold: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Types pour les zones de livraison
export interface ShippingZone {
  id: string;
  profile_id: string;
  name: string;
  countries: string[];
  additional_cost: number;
  estimated_days_min: number;
  estimated_days_max: number;
  created_at: string;
}

// Types pour les analytics
export interface ProductView {
  id: string;
  product_id: string;
  user_id: string | null;
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface CartAnalytic {
  id: string;
  product_id: string;
  user_id: string | null;
  session_id: string | null;
  quantity: number;
  added_at: string;
  removed_at: string | null;
  converted_to_order: boolean;
  order_id: string | null;
}

// Types pour les statistiques consolidées
export interface ProductStatistics {
  product_id: string;
  title: string;
  price: number;
  total_views: number;
  unique_users_viewed: number;
  views_last_30_days: number;
  times_added_to_cart: number;
  currently_in_carts: number;
  total_sales: number;
  total_quantity_sold: number;
  total_revenue: number;
  revenue_last_30_days: number;
  conversion_rate_percent: number;
}

// Types pour les informations de stock
export interface StockInfo {
  available: boolean;
  currentStock: number;
  inCartsCount: number;
  availableStock: number;
}

// Types pour les produits avec statistiques
export interface ProductWithStats extends Product {
  total_views: number;
  currently_in_carts: number;
  total_quantity_sold: number;
  total_revenue: number;
  conversion_rate_percent: number;
}

// Types pour les produits avec détails de boutique
export interface ProductWithShop extends Product {
  shop: Shop;
  category: Category | null;
}

// Types pour les services avec détails de boutique
export interface ServiceWithShop extends Service {
  shop: Shop;
  category: Category | null;
}

// Types pour les statistiques de boutique
export interface ShopStats {
  products: number;
  services: number;
  orders: number;
  revenue: number;
  productsInCarts: number;
}

export * from './notifications';
