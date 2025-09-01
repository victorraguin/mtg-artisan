import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ProductStatistics, StockInfo } from "../types";
import analyticsService from "../services/analytics";

export function useAnalytics() {
  const { user } = useAuth();

  /**
   * Tracker une vue de produit
   */
  const trackView = async (productId: string) => {
    await analyticsService.trackProductView(productId, user?.id);
  };

  /**
   * Tracker l'ajout au panier
   */
  const trackCartAdd = async (productId: string, quantity: number = 1) => {
    await analyticsService.trackCartAddition(productId, quantity, user?.id);
  };

  /**
   * Tracker la suppression du panier
   */
  const trackCartRemove = async (productId: string) => {
    await analyticsService.trackCartRemoval(productId, user?.id);
  };

  return {
    trackView,
    trackCartAdd,
    trackCartRemove,
  };
}

/**
 * Hook pour obtenir les statistiques d'un produit
 */
export function useProductStatistics(productId: string) {
  const [statistics, setStatistics] = useState<ProductStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        const stats = await analyticsService.getProductStatistics(productId);
        setStatistics(stats);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des statistiques"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [productId]);

  return { statistics, loading, error };
}

/**
 * Hook pour obtenir les statistiques de tous les produits d'une boutique
 */
export function useShopStatistics(shopId: string) {
  const [statistics, setStatistics] = useState<ProductStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!shopId) return;

      setLoading(true);
      setError(null);

      try {
        const stats = await analyticsService.getShopProductsStatistics(shopId);
        setStatistics(stats);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des statistiques"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [shopId]);

  const refetch = async () => {
    if (!shopId) return;

    try {
      const stats = await analyticsService.getShopProductsStatistics(shopId);
      setStatistics(stats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des statistiques"
      );
    }
  };

  return { statistics, loading, error, refetch };
}

/**
 * Hook pour vérifier la disponibilité du stock
 */
export function useStockCheck() {
  const [checking, setChecking] = useState(false);

  const checkStock = async (
    productId: string,
    quantity: number
  ): Promise<StockInfo> => {
    setChecking(true);
    try {
      const stockInfo = await analyticsService.checkStockAvailability(
        productId,
        quantity
      );
      return stockInfo;
    } finally {
      setChecking(false);
    }
  };

  return { checkStock, checking };
}

/**
 * Hook pour obtenir les produits populaires
 */
export function usePopularProducts() {
  const [topViewed, setTopViewed] = useState<ProductStatistics[]>([]);
  const [topSelling, setTopSelling] = useState<ProductStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      setLoading(true);
      try {
        const [viewed, selling] = await Promise.all([
          analyticsService.getTopViewedProducts(5),
          analyticsService.getTopSellingProducts(5),
        ]);
        setTopViewed(viewed);
        setTopSelling(selling);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des produits populaires:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  return { topViewed, topSelling, loading };
}
