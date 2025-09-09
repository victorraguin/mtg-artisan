import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent, CardHeader } from "../UI";
import { Product, ProductStatistics } from "../../types";
import { AlertTriangle, Package, Edit3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import supabase from "../../lib/supabase";

interface LowStockProduct extends Product {
  currently_in_carts: number;
  available_stock: number;
}

interface StockAlertsProps {
  shopId: string;
}

export function StockAlerts({ shopId }: StockAlertsProps) {
  const { t } = useTranslation();
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
  }, [shopId]);

  const fetchLowStockProducts = async () => {
    try {
      // Récupérer les produits physiques avec stock faible
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .eq("type", "physical")
        .not("stock", "is", null)
        .lte("stock", 10) // Stock <= 10
        .eq("status", "active");

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        // Récupérer les statistiques de panier pour chaque produit
        const productsWithCartInfo = await Promise.all(
          products.map(async (product) => {
            const { data: cartData, error: cartError } = await supabase
              .from("cart_analytics")
              .select("quantity")
              .eq("product_id", product.id)
              .is("removed_at", null)
              .eq("converted_to_order", false);

            const currently_in_carts =
              cartData?.reduce((sum, item) => sum + item.quantity, 0) || 0;

            const available_stock = Math.max(
              0,
              (product.stock || 0) - currently_in_carts
            );

            return {
              ...product,
              currently_in_carts,
              available_stock,
            };
          })
        );

        // Filtrer seulement ceux avec stock vraiment faible
        const lowStock = productsWithCartInfo.filter(
          (product) => product.available_stock <= 5
        );

        setLowStockProducts(lowStock);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes stock:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-500/30 bg-orange-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-medium text-foreground">
            {t("stockAlerts.title", { count: lowStockProducts.length })}
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20"
            >
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {product.title}
                  </p>
                  <p className="text-xs text-orange-600">
                    {product.available_stock === 0
                      ? t("stockAlerts.outOfStock")
                      : t("stockAlerts.remaining", {
                          count: product.available_stock,
                        })}
                    {product.currently_in_carts > 0 && (
                      <span className="ml-2">
                        {t("stockAlerts.inCarts", {
                          count: product.currently_in_carts,
                        })}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Link to={`/creator/products/${product.id}/edit`}>
                <Button variant="outline" size="sm" icon={Edit3}>
                  {t("stockAlerts.manage")}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
