import { useEffect, useState } from "react";
import { Shop, ShopStats, OrderItem } from "../types";
import dashboardService from "../services/dashboard";

export function useDashboard(userId: string | undefined) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<ShopStats>({
    products: 0,
    services: 0,
    orders: 0,
    revenue: 0,
    productsInCarts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Récupérer la boutique
      const shopData = await dashboardService.getUserShop(userId);
      setShop(shopData);

      if (shopData) {
        // Récupérer les statistiques et commandes récentes
        const [statsData, ordersData] = await Promise.all([
          dashboardService.getShopStats(shopData.id),
          dashboardService.getRecentOrders(shopData.id, 6),
        ]);

        setStats(statsData);
        setRecentOrders(ordersData);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const refetchStats = async () => {
    if (!shop) return;

    try {
      const statsData = await dashboardService.getShopStats(shop.id);
      setStats(statsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du rechargement des statistiques"
      );
    }
  };

  return {
    shop,
    stats,
    recentOrders,
    loading,
    error,
    refetchStats,
  };
}
