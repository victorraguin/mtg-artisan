import supabase from '../lib/supabase';
import { CartItem } from '../contexts/CartContext';

export interface PaymentDetails {
  id: string;
  capture_id?: string;
  status: string;
  amount: number;
}

export interface OrderCreationResult {
  order: any;
  escrows: any[];
  notifications: any[];
  success: boolean;
  error?: string;
}

export class OrderService {
  static async createCompleteOrder(
    items: CartItem[],
    userId: string,
    paymentDetails: PaymentDetails,
    shippingAddress?: any
  ): Promise<OrderCreationResult> {
    try {
      console.log('🛒 Création de la commande complète...', {
        itemsCount: items.length,
        userId,
        paymentId: paymentDetails.id
      });

      // 1. Calculer le total
      const total = items.reduce((sum, item) => sum + (item.unit_price * item.qty), 0);

      // 2. Créer la commande principale
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total,
          status: 'paid',
          paypal_order_id: paymentDetails.id,
          paypal_capture_id: paymentDetails.capture_id || `CAPTURE_${Date.now()}`,
          breakdown_by_shop: this.calculateShopBreakdown(items),
          currency: 'EUR'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      console.log('✅ Commande créée:', order.id);

      // 3. Créer les items de commande
      const orderItems = items.map((item) => ({
        order_id: order.id,
        item_type: item.item_type,
        item_id: item.item_id,
        qty: item.qty,
        unit_price: item.unit_price,
        shop_id: item.shop_id,
        currency: 'EUR',
        status: 'pending'
      }));

      const { data: createdItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) throw itemsError;

      console.log('✅ Items de commande créés:', createdItems?.length);

      // 4. Créer les escrows pour chaque item
      const escrows = [];
      for (const item of createdItems || []) {
        // Récupérer le propriétaire de la boutique
        const { data: shop } = await supabase
          .from('shops')
          .select('owner_id')
          .eq('id', item.shop_id)
          .single();

        if (shop?.owner_id) {
          const itemTotal = item.unit_price * item.qty;
          const commissionPlatform = itemTotal * 0.05; // 5% commission plateforme
          const commissionAmbassador = 0; // TODO: Calculer selon le parrainage
          const netAmount = itemTotal - commissionPlatform - commissionAmbassador;

          const { data: escrow, error: escrowError } = await supabase
            .from('escrows')
            .insert({
              order_id: order.id,
              buyer_id: userId,
              seller_id: shop.owner_id,
              gross_amount: itemTotal,
              commission_platform: commissionPlatform,
              commission_ambassador: commissionAmbassador,
              net_amount: netAmount,
              currency: 'EUR',
              status: 'held',
              auto_release_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();

          if (escrowError) {
            console.error('❌ Erreur création escrow:', escrowError);
          } else {
            escrows.push(escrow);
            console.log('✅ Escrow créé pour le vendeur:', shop.owner_id);
          }
        }
      }

      // 5. Créer les notifications
      const notifications = await this.createOrderNotifications(order, items, total);

      // 6. Créer les payouts en attente
      await this.createPendingPayouts(order, createdItems || []);

      console.log('🎉 Commande complète créée avec succès!');

      return {
        order,
        escrows,
        notifications,
        success: true
      };

    } catch (error) {
      console.error('❌ Erreur création commande:', error);
      return {
        order: null,
        escrows: [],
        notifications: [],
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  private static calculateShopBreakdown(items: CartItem[]): Record<string, any> {
    const breakdown: Record<string, any> = {};
    
    items.forEach(item => {
      if (!breakdown[item.shop_id]) {
        breakdown[item.shop_id] = {
          items: 0,
          total: 0
        };
      }
      breakdown[item.shop_id].items += item.qty;
      breakdown[item.shop_id].total += item.unit_price * item.qty;
    });

    return breakdown;
  }

  private static async createOrderNotifications(
    order: any, 
    items: CartItem[], 
    total: number
  ): Promise<any[]> {
    const notifications = [];

    // Notification pour l'acheteur
    const buyerNotification = {
      user_id: order.user_id,
      category: 'orders',
      event_name: 'order_confirmed',
      title: 'Commande confirmée !',
      body: `Votre commande de ${total.toFixed(2)}€ a été confirmée et les fonds sont en sécurité.`,
      action_url: '/dashboard/buyer',
      payload: { order_id: order.id, amount: total }
    };

    const { data: buyerNotif } = await supabase
      .from('notifications')
      .insert(buyerNotification)
      .select()
      .single();

    if (buyerNotif) notifications.push(buyerNotif);

    // Notifications pour les vendeurs
    const shopIds = [...new Set(items.map(item => item.shop_id))];
    
    for (const shopId of shopIds) {
      const { data: shop } = await supabase
        .from('shops')
        .select('owner_id, name')
        .eq('id', shopId)
        .single();

      if (shop?.owner_id) {
        const shopItems = items.filter(item => item.shop_id === shopId);
        const shopTotal = shopItems.reduce((sum, item) => sum + (item.unit_price * item.qty), 0);

        const sellerNotification = {
          user_id: shop.owner_id,
          category: 'orders',
          event_name: 'new_order',
          title: 'Nouvelle commande reçue !',
          body: `Vous avez reçu une nouvelle commande d'un montant de ${shopTotal.toFixed(2)}€`,
          action_url: '/dashboard/creator',
          payload: { 
            order_id: order.id, 
            shop_id: shopId,
            amount: shopTotal,
            items_count: shopItems.length
          }
        };

        const { data: sellerNotif } = await supabase
          .from('notifications')
          .insert(sellerNotification)
          .select()
          .single();

        if (sellerNotif) notifications.push(sellerNotif);
      }
    }

    console.log('✅ Notifications créées:', notifications.length);
    return notifications;
  }

  private static async createPendingPayouts(order: any, orderItems: any[]): Promise<void> {
    for (const item of orderItems) {
      const itemTotal = item.unit_price * item.qty;
      const commissionPlatform = itemTotal * 0.05;
      const commissionAmbassador = 0; // TODO: Calculer selon le parrainage
      const netAmount = itemTotal - commissionPlatform - commissionAmbassador;

      await supabase
        .from('payouts')
        .insert({
          shop_id: item.shop_id,
          order_id: order.id,
          gross_amount: itemTotal,
          commission_platform: commissionPlatform,
          commission_ambassador: commissionAmbassador,
          net_amount: netAmount,
          currency: 'EUR',
          status: 'en_attente'
        });
    }

    console.log('✅ Payouts créés pour', orderItems.length, 'items');
  }

  static async markOrderAsDelivered(orderId: string, itemId?: string): Promise<boolean> {
    try {
      if (itemId) {
        // Marquer un item spécifique comme livré
        const { error } = await supabase
          .from('order_items')
          .update({ 
            status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('id', itemId);

        if (error) throw error;
      } else {
        // Marquer tous les items de la commande comme livrés
        const { error } = await supabase
          .from('order_items')
          .update({ 
            status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('order_id', orderId);

        if (error) throw error;
      }

      console.log('✅ Commande marquée comme livrée');
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage livraison:', error);
      return false;
    }
  }
}
