import { useEffect, useState } from "react";
import { StockInfo } from "../types";
import analyticsService from "../services/analytics";
import { useTranslation } from "react-i18next";

/**
 * Hook pour surveiller le stock d'un produit en temps réel
 */
export function useStockMonitoring(productId: string, enabled: boolean = true) {
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const checkStock = async (quantity: number = 1) => {
    if (!productId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const stock = await analyticsService.checkStockAvailability(
        productId,
        quantity
      );
      setStockInfo(stock);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("stock.checkError")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId && enabled) {
      checkStock();
    }
  }, [productId, enabled]);

  const refetchStock = () => checkStock();

  return {
    stockInfo,
    loading,
    error,
    refetchStock,
  };
}

/**
 * Hook pour surveiller plusieurs produits à la fois
 */
export function useBulkStockMonitoring(productIds: string[]) {
  const [stockInfos, setStockInfos] = useState<Record<string, StockInfo>>({});
  const [loading, setLoading] = useState(true);

  const checkAllStocks = async () => {
    if (productIds.length === 0) return;

    setLoading(true);
    try {
      const stockPromises = productIds.map(async (productId) => {
        const stock = await analyticsService.checkStockAvailability(
          productId,
          1
        );
        return { productId, stock };
      });

      const results = await Promise.all(stockPromises);
      const stockMap = results.reduce((acc, { productId, stock }) => {
        acc[productId] = stock;
        return acc;
      }, {} as Record<string, StockInfo>);

      setStockInfos(stockMap);
    } catch (error) {
      console.error("Erreur lors de la vérification des stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAllStocks();
  }, [productIds.join(",")]);

  return {
    stockInfos,
    loading,
    refetchStocks: checkAllStocks,
  };
}
