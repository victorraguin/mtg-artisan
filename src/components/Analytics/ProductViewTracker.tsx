import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import analyticsService from "../../services/analytics";

interface ProductViewTrackerProps {
  productId: string;
}

/**
 * Composant invisible qui track automatiquement les vues de produit
 * À utiliser dans les pages de détail produit
 */
export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (productId) {
      // Délai pour éviter de tracker les vues accidentelles
      const timer = setTimeout(() => {
        analyticsService.trackProductView(productId, user?.id);
      }, 1000); // 1 seconde de délai

      return () => clearTimeout(timer);
    }
  }, [productId, user?.id]);

  // Composant invisible
  return null;
}
