import supabase from "../lib/supabase";
import analyticsService from "./analytics";

class ConversionTrackingService {
  /**
   * Marquer les articles du panier comme convertis en commande
   */
  async markCartItemsAsConverted(
    orderId: string,
    cartItems: Array<{
      item_id: string;
      item_type: string;
      qty: number;
    }>
  ): Promise<void> {
    try {
      // Marquer tous les articles du panier comme convertis
      const productItems = cartItems.filter(
        (item) => item.item_type === "product"
      );

      for (const item of productItems) {
        await supabase
          .from("cart_analytics")
          .update({
            converted_to_order: true,
            order_id: orderId,
          })
          .eq("product_id", item.item_id)
          .is("removed_at", null)
          .eq("converted_to_order", false);
      }
    } catch (error) {
      console.error("Erreur lors du marquage des conversions:", error);
    }
  }

  /**
   * Enregistrer une vente réussie
   */
  async recordSale(
    orderId: string,
    orderItems: Array<{
      item_id: string;
      item_type: string;
      qty: number;
      unit_price: number;
      shop_id: string;
    }>
  ): Promise<void> {
    try {
      // Marquer les conversions panier → commande
      await this.markCartItemsAsConverted(orderId, orderItems);

      // Décrémenter le stock des produits physiques
      const productItems = orderItems.filter(
        (item) => item.item_type === "product"
      );

      for (const item of productItems) {
        // Récupérer le produit actuel
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock, type")
          .eq("id", item.item_id)
          .single();

        if (productError) {
          console.error(
            "Erreur lors de la récupération du produit:",
            productError
          );
          continue;
        }

        // Décrémenter le stock seulement pour les produits physiques
        if (product.type === "physical" && product.stock !== null) {
          const newStock = Math.max(0, product.stock - item.qty);

          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.item_id);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la vente:", error);
    }
  }

  /**
   * Annuler une commande et restaurer le stock
   */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      // Récupérer les articles de la commande
      const { data: orderItems, error: orderError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (orderError) throw orderError;

      // Restaurer le stock pour les produits physiques
      const productItems =
        orderItems?.filter((item) => item.item_type === "product") || [];

      for (const item of productItems) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock, type")
          .eq("id", item.item_id)
          .single();

        if (productError) continue;

        if (product.type === "physical" && product.stock !== null) {
          const newStock = product.stock + item.qty;

          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.item_id);
        }
      }

      // Marquer les analytics de panier comme non-converties
      await supabase
        .from("cart_analytics")
        .update({
          converted_to_order: false,
          order_id: null,
        })
        .eq("order_id", orderId);
    } catch (error) {
      console.error("Erreur lors de l'annulation de la commande:", error);
    }
  }

  /**
   * Obtenir un résumé des performances de vente
   */
  async getSalesPerformance(
    shopId: string,
    days: number = 30
  ): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalItemsSold: number;
    averageOrderValue: number;
    topProducts: Array<{
      product_id: string;
      title: string;
      quantity_sold: number;
      revenue: number;
    }>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Récupérer les commandes de la période
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("shop_id", shopId)
        .gte("created_at", startDate.toISOString());

      if (error) throw error;

      const items = orderItems || [];
      const totalRevenue = items.reduce(
        (sum, item) => sum + item.unit_price * item.qty,
        0
      );
      const totalOrders = new Set(items.map((item) => item.order_id)).size;
      const totalItemsSold = items.reduce((sum, item) => sum + item.qty, 0);
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculer les produits les plus vendus
      // Récupérer les titres produits via une map (requêtes groupées)
      const productItemIds = Array.from(
        new Set(
          (items || [])
            .filter((i) => i.item_type === "product")
            .map((i) => i.item_id)
        )
      );
      let productTitles: Record<string, string> = {};
      if (productItemIds.length > 0) {
        const { data: productsMeta } = await supabase
          .from("products")
          .select("id, title")
          .in("id", productItemIds);
        for (const p of productsMeta || []) {
          productTitles[p.id] = p.title;
        }
      }

      const productSales = (items || [])
        .filter((item) => item.item_type === "product")
        .reduce((acc, item) => {
          const key = item.item_id;
          if (!acc[key]) {
            acc[key] = {
              product_id: item.item_id,
              title: productTitles[item.item_id] || "Produit inconnu",
              quantity_sold: 0,
              revenue: 0,
            };
          }
          acc[key].quantity_sold += item.qty;
          acc[key].revenue += item.unit_price * item.qty;
          return acc;
        }, {} as Record<string, any>);

      const topProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        totalRevenue,
        totalOrders,
        totalItemsSold,
        averageOrderValue,
        topProducts,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des performances:", error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalItemsSold: 0,
        averageOrderValue: 0,
        topProducts: [],
      };
    }
  }
}

// Singleton instance
const conversionTrackingService = new ConversionTrackingService();
export default conversionTrackingService;
