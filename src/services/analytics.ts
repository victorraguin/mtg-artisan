import supabase from "../lib/supabase";
import { ProductStatistics, StockInfo } from "../types";

class AnalyticsService {
  private sessionId: string;

  constructor() {
    // Générer ou récupérer un ID de session pour les utilisateurs anonymes
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  }

  /**
   * Tracker une vue de produit
   */
  async trackProductView(productId: string, userId?: string): Promise<void> {
    try {
      const { error } = await supabase.rpc("increment_product_view", {
        p_product_id: productId,
        p_user_id: userId || null,
        p_session_id: this.sessionId,
        p_ip_address: null, // Sera géré côté serveur si nécessaire
        p_user_agent: navigator.userAgent,
      });

      if (error) {
        console.warn("Erreur lors du tracking de vue:", error);
      }
    } catch (error) {
      console.warn("Erreur lors du tracking de vue:", error);
    }
  }

  /**
   * Tracker l'ajout d'un produit au panier
   */
  async trackCartAddition(
    productId: string,
    quantity: number = 1,
    userId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc("track_cart_addition", {
        p_product_id: productId,
        p_user_id: userId || null,
        p_session_id: this.sessionId,
        p_quantity: quantity,
      });

      if (error) {
        console.warn("Erreur lors du tracking d'ajout au panier:", error);
      }
    } catch (error) {
      console.warn("Erreur lors du tracking d'ajout au panier:", error);
    }
  }

  /**
   * Tracker la suppression d'un produit du panier
   */
  async trackCartRemoval(productId: string, userId?: string): Promise<void> {
    try {
      const { error } = await supabase.rpc("track_cart_removal", {
        p_product_id: productId,
        p_user_id: userId || null,
        p_session_id: this.sessionId,
      });

      if (error) {
        console.warn(
          "Erreur lors du tracking de suppression du panier:",
          error
        );
      }
    } catch (error) {
      console.warn("Erreur lors du tracking de suppression du panier:", error);
    }
  }

  /**
   * Obtenir les statistiques d'un produit
   */
  async getProductStatistics(
    productId: string
  ): Promise<ProductStatistics | null> {
    try {
      const { data, error } = await supabase
        .from("product_statistics")
        .select("*")
        .eq("product_id", productId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return null;
    }
  }

  /**
   * Obtenir les statistiques de tous les produits d'une boutique
   */
  async getShopProductsStatistics(
    shopId: string
  ): Promise<ProductStatistics[]> {
    try {
      const { data, error } = await supabase
        .from("product_statistics")
        .select("*")
        .eq("shop_id", shopId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des statistiques de la boutique:",
        error
      );
      return [];
    }
  }

  /**
   * Vérifier la disponibilité du stock avant ajout au panier
   */
  async checkStockAvailability(
    productId: string,
    requestedQuantity: number
  ): Promise<StockInfo> {
    try {
      // Récupérer le produit et son stock actuel
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock, title")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      // Si c'est un produit numérique, pas de limite de stock
      if (product.stock === null) {
        return {
          available: true,
          currentStock: Infinity,
          inCartsCount: 0,
          availableStock: Infinity,
        };
      }

      // Compter combien d'unités sont actuellement dans des paniers
      const { data: cartAnalytics, error: cartError } = await supabase
        .from("cart_analytics")
        .select("quantity")
        .eq("product_id", productId)
        .is("removed_at", null)
        .eq("converted_to_order", false);

      if (cartError) throw cartError;

      const inCartsCount =
        cartAnalytics?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const availableStock = Math.max(0, product.stock - inCartsCount);
      const available = availableStock >= requestedQuantity;

      return {
        available,
        currentStock: product.stock,
        inCartsCount,
        availableStock,
      };
    } catch (error) {
      console.error("Erreur lors de la vérification du stock:", error);
      return {
        available: false,
        currentStock: 0,
        inCartsCount: 0,
        availableStock: 0,
      };
    }
  }

  /**
   * Obtenir les produits les plus vus
   */
  async getTopViewedProducts(limit: number = 10): Promise<ProductStatistics[]> {
    try {
      const { data, error } = await supabase
        .from("product_statistics")
        .select("*")
        .eq("status", "active")
        .order("total_views", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des produits les plus vus:",
        error
      );
      return [];
    }
  }

  /**
   * Obtenir les produits les plus vendus
   */
  async getTopSellingProducts(
    limit: number = 10
  ): Promise<ProductStatistics[]> {
    try {
      const { data, error } = await supabase
        .from("product_statistics")
        .select("*")
        .eq("status", "active")
        .order("total_quantity_sold", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des produits les plus vendus:",
        error
      );
      return [];
    }
  }
}

// Singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
