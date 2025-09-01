import supabase from "../lib/supabase";
import { Shop, ShopStats, OrderItem, Product, Service } from "../types";

class DashboardService {
  /**
   * Récupérer la boutique d'un utilisateur
   */
  async getUserShop(userId: string): Promise<Shop | null> {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la boutique:", error);
      return null;
    }
  }

  /**
   * Récupérer les statistiques d'une boutique
   */
  async getShopStats(shopId: string): Promise<ShopStats> {
    try {
      const [productsResult, servicesResult, ordersResult, cartResult] =
        await Promise.all([
          supabase.from("products").select("id").eq("shop_id", shopId),
          supabase.from("services").select("id").eq("shop_id", shopId),
          supabase
            .from("order_items")
            .select("unit_price, qty")
            .eq("shop_id", shopId),
          supabase
            .from("cart_analytics")
            .select("product_id, quantity")
            .eq("shop_id", shopId)
            .is("removed_at", null)
            .eq("converted_to_order", false),
        ]);

      const revenue =
        ordersResult.data?.reduce(
          (sum, item) => sum + item.unit_price * item.qty,
          0
        ) || 0;

      const productsInCarts =
        cartResult.data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      return {
        products: productsResult.data?.length || 0,
        services: servicesResult.data?.length || 0,
        orders: ordersResult.data?.length || 0,
        revenue,
        productsInCarts,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return {
        products: 0,
        services: 0,
        orders: 0,
        revenue: 0,
        productsInCarts: 0,
      };
    }
  }

  /**
   * Récupérer les commandes récentes d'une boutique
   */
  async getRecentOrders(
    shopId: string,
    limit: number = 5
  ): Promise<OrderItem[]> {
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
          *,
          orders!inner(*)
        `
        )
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des commandes récentes:",
        error
      );
      return [];
    }
  }

  /**
   * Récupérer tous les produits d'une boutique
   */
  async getShopProducts(shopId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      return [];
    }
  }

  /**
   * Récupérer tous les services d'une boutique
   */
  async getShopServices(shopId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des services:", error);
      return [];
    }
  }

  /**
   * Supprimer un produit
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      return false;
    }
  }

  /**
   * Supprimer un service
   */
  async deleteService(serviceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du service:", error);
      return false;
    }
  }
}

// Singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
