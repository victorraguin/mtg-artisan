import supabase from "../lib/supabase";
import { NotificationService } from "./notificationService";

export class StockNotificationService {
  /**
   * Vérifie le stock et envoie des notifications si nécessaire
   */
  static async checkAndNotifyLowStock(productId: string): Promise<void> {
    try {
      // Récupérer les informations du produit
      const { data: product, error: productError } = await supabase
        .from("products")
        .select(
          `
          *,
          shop:shops(id, owner_id, name)
        `
        )
        .eq("id", productId)
        .eq("type", "physical")
        .not("stock", "is", null)
        .single();

      if (productError || !product || !product.shop) return;

      // Calculer le stock en panier
      const { data: cartData } = await supabase
        .from("cart_analytics")
        .select("quantity")
        .eq("product_id", productId)
        .is("removed_at", null)
        .eq("converted_to_order", false);

      const inCartQuantity =
        cartData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const availableStock = Math.max(0, (product.stock || 0) - inCartQuantity);

      // Seuils d'alerte
      const LOW_STOCK_THRESHOLD = 5;
      const OUT_OF_STOCK_THRESHOLD = 0;

      if (availableStock <= OUT_OF_STOCK_THRESHOLD && product.stock > 0) {
        // Rupture de stock
        await NotificationService.emitEvent(
          "product.out_of_stock",
          [product.shop.owner_id],
          {
            productName: product.title,
            productId: product.id,
            shopName: product.shop.name,
          }
        );
      } else if (availableStock <= LOW_STOCK_THRESHOLD && availableStock > 0) {
        // Stock faible
        await NotificationService.emitEvent(
          "product.low_stock",
          [product.shop.owner_id],
          {
            productName: product.title,
            productId: product.id,
            stock: availableStock,
            shopName: product.shop.name,
          }
        );
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du stock:", error);
    }
  }

  /**
   * Vérifie le stock après un ajout au panier
   */
  static async checkStockAfterCartAction(productId: string): Promise<void> {
    // Délai pour permettre à la transaction de se terminer
    setTimeout(() => {
      this.checkAndNotifyLowStock(productId);
    }, 1000);
  }

  /**
   * Vérifie le stock après une commande
   */
  static async checkStockAfterOrder(
    orderItems: Array<{ item_id: string; item_type: string }>
  ): Promise<void> {
    const productItems = orderItems.filter(
      (item) => item.item_type === "product"
    );

    for (const item of productItems) {
      setTimeout(() => {
        this.checkAndNotifyLowStock(item.item_id);
      }, 2000); // Délai plus long pour les commandes
    }
  }
}
