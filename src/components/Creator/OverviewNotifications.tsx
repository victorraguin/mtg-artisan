import { useState, useEffect } from "react";
import {
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Package,
  CheckCircle,
  Bell,
  Star,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../UI/Card";
import { ShopStats, OrderItemWithDetails } from "../../types";
import supabase from "../../lib/supabase";

interface OverviewNotificationsProps {
  stats: ShopStats;
  recentOrders: OrderItemWithDetails[];
  topProducts: any[];
  shopId: string;
}

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "danger";
  icon: React.ComponentType<any>;
  title: string;
  message: string;
  priority: number; // Plus haut = plus important
}

export function OverviewNotifications({
  stats,
  recentOrders,
  topProducts,
  shopId,
}: OverviewNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchLowStockProducts();
    generateNotifications();
  }, [stats, recentOrders, topProducts]);

  const fetchLowStockProducts = async () => {
    try {
      const { data } = await supabase
        .from("products")
        .select("id, title, stock")
        .eq("shop_id", shopId)
        .lt("stock", 5)
        .gt("stock", 0)
        .order("stock", { ascending: true });

      setLowStockProducts(data || []);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des stocks faibles:",
        error
      );
    }
  };

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];

    // 1. Nouvelles ventes récentes (dernières 24h)
    const recentSales = recentOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return (
        orderDate > yesterday &&
        ["completed", "delivered"].includes(order.status)
      );
    });

    if (recentSales.length > 0) {
      const totalRevenue = recentSales.reduce(
        (sum, order) => sum + order.unit_price * order.qty,
        0
      );
      newNotifications.push({
        id: "recent-sales",
        type: "success",
        icon: TrendingUp,
        title: "Nouvelles ventes !",
        message: `${recentSales.length} vente${
          recentSales.length > 1 ? "s" : ""
        } réalisée${
          recentSales.length > 1 ? "s" : ""
        } aujourd'hui pour ${totalRevenue.toFixed(2)}€`,
        priority: 9,
      });
    }

    // 2. Produits ajoutés aux paniers
    if (stats.productsInCarts > 0) {
      newNotifications.push({
        id: "products-in-carts",
        type: "info",
        icon: ShoppingCart,
        title: "Intérêt pour vos produits",
        message: `${stats.productsInCarts} produit${
          stats.productsInCarts > 1 ? "s" : ""
        } dans les paniers des clients`,
        priority: 6,
      });
    }

    // 3. Alertes stock faible
    if (lowStockProducts.length > 0) {
      const criticalStock = lowStockProducts.filter((p) => p.stock <= 2);
      if (criticalStock.length > 0) {
        newNotifications.push({
          id: "critical-stock",
          type: "danger",
          icon: AlertTriangle,
          title: "Stock critique !",
          message: `${criticalStock.length} produit${
            criticalStock.length > 1 ? "s" : ""
          } presque en rupture de stock`,
          priority: 10,
        });
      } else {
        newNotifications.push({
          id: "low-stock",
          type: "warning",
          icon: Package,
          title: "Stock faible",
          message: `${lowStockProducts.length} produit${
            lowStockProducts.length > 1 ? "s" : ""
          } à réapprovisionner bientôt`,
          priority: 7,
        });
      }
    }

    // 4. Commandes en attente
    const pendingOrders = recentOrders.filter(
      (order) => order.status === "pending"
    );
    if (pendingOrders.length > 0) {
      newNotifications.push({
        id: "pending-orders",
        type: "warning",
        icon: Bell,
        title: "Commandes en attente",
        message: `${pendingOrders.length} commande${
          pendingOrders.length > 1 ? "s" : ""
        } à traiter`,
        priority: 8,
      });
    }

    // 5. Performance des produits
    if (topProducts.length > 0 && topProducts[0].sales > 0) {
      const bestProduct = topProducts[0];
      newNotifications.push({
        id: "top-product",
        type: "success",
        icon: Star,
        title: "Produit star !",
        message: `"${bestProduct.title}" cartonne avec ${
          bestProduct.sales
        } vente${bestProduct.sales > 1 ? "s" : ""}`,
        priority: 5,
      });
    }

    // 6. Première vente si c'est le cas
    if (stats.orders === 1) {
      newNotifications.push({
        id: "first-sale",
        type: "success",
        icon: CheckCircle,
        title: "Félicitations !",
        message: "Vous avez réalisé votre première vente sur ManaShop !",
        priority: 10,
      });
    }

    // 7. Pas de ventes récentes (encouragement)
    if (stats.orders === 0) {
      newNotifications.push({
        id: "no-sales-yet",
        type: "info",
        icon: Users,
        title: "Démarrez vos ventes",
        message:
          "Partagez vos produits sur les réseaux sociaux pour attirer vos premiers clients",
        priority: 4,
      });
    }

    // Trier par priorité et prendre les 3 plus importantes
    const sortedNotifications = newNotifications
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);

    setNotifications(sortedNotifications);
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-500/30 bg-green-500/5";
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/5";
      case "danger":
        return "border-red-500/30 bg-red-500/5";
      case "info":
      default:
        return "border-blue-500/30 bg-blue-500/5";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "danger":
        return "text-red-500";
      case "info":
      default:
        return "text-blue-500";
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium text-foreground flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Résumé Important
        </h3>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground/70">
              Aucune notification pour le moment
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Les alertes importantes apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-3 glass rounded-2xl border ${getNotificationStyles(
                    notification.type
                  )} transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full bg-background/50 ${getIconColor(
                        notification.type
                      )}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
