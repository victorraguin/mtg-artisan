import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../UI";
import { TrendingUp, DollarSign, Package, ShoppingCart } from "lucide-react";
import conversionTrackingService from "../../services/conversionTracking";

interface SalesPerformance {
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
}

interface SalesAnalyticsProps {
  shopId: string;
}

export function SalesAnalytics({ shopId }: SalesAnalyticsProps) {
  const [performance, setPerformance] = useState<SalesPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30); // Période en jours

  useEffect(() => {
    fetchSalesData();
  }, [shopId, period]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const data = await conversionTrackingService.getSalesPerformance(
        shopId,
        period
      );
      setPerformance(data);
    } catch (error) {
      console.error("Erreur lors du chargement des données de vente:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!performance) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Métriques de performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-light text-foreground tracking-tight">
              Performance des Ventes ({period} derniers jours)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod(7)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  period === 7
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                7j
              </button>
              <button
                onClick={() => setPeriod(30)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  period === 30
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                30j
              </button>
              <button
                onClick={() => setPeriod(90)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  period === 90
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                90j
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-primary mr-2" />
                <span className="text-2xl font-light text-foreground">
                  ${performance.totalRevenue.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Revenus Totaux
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ShoppingCart className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-light text-foreground">
                  {performance.totalOrders}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Commandes</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-light text-foreground">
                  {performance.totalItemsSold}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Articles Vendus
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-light text-foreground">
                  ${performance.averageOrderValue.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Panier Moyen</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top produits */}
      {performance.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-foreground">
              Produits les Plus Performants
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performance.topProducts.map((product, index) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between p-3 glass rounded-2xl border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : index === 1
                          ? "bg-orange-500/20 text-orange-500"
                          : index === 2
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {product.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.quantity_sold} vendu
                        {product.quantity_sold > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-foreground">
                      ${product.revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
