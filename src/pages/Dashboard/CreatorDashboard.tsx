import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Shop, ShopStats, OrderItem } from "../../types";
import supabase from "../../lib/supabase";
import {
  Plus,
  Package,
  Briefcase,
  DollarSign,
  TrendingUp,
  Palette,
  Store,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import { ProductsTable } from "../../components/Creator/ProductsTable";
import { ServicesTable } from "../../components/Creator/ServicesTable";
import { ShippingManager } from "../../components/Creator/ShippingManager";
import { StockAlerts } from "../../components/Creator/StockAlerts";
import { SalesAnalytics } from "../../components/Creator/SalesAnalytics";
import { StockInfoCard } from "../../components/Creator/StockInfoCard";

export function CreatorDashboard() {
  const { user, profile } = useAuth();
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

  useEffect(() => {
    if (user) {
      fetchCreatorData();
    }
  }, [user]);

  const fetchCreatorData = async () => {
    try {
      // Fetch shop
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user?.id)
        .maybeSingle();

      if (shopError) {
        console.error(
          "Erreur lors de la récupération de la boutique:",
          shopError
        );
      }

      setShop(shopData);

      if (shopData) {
        // Fetch stats
        const [productsResult, servicesResult, ordersResult] =
          await Promise.all([
            supabase.from("products").select("id").eq("shop_id", shopData.id),
            supabase.from("services").select("id").eq("shop_id", shopData.id),
            supabase
              .from("order_items")
              .select("*, orders(*)")
              .eq("shop_id", shopData.id),
          ]);

        const revenue =
          ordersResult.data?.reduce(
            (sum, item) => sum + item.unit_price * item.qty,
            0
          ) || 0;

        setStats({
          products: productsResult.data?.length || 0,
          services: servicesResult.data?.length || 0,
          orders: ordersResult.data?.length || 0,
          revenue,
          productsInCarts: 0, // Sera mis à jour par le hook useDashboard
        });

        setRecentOrders(ordersResult.data?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error("Erreur dans fetchCreatorData:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 text-center">
        <div className="glass rounded-3xl p-12 border border-border/30">
          <div className="glass w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <Store className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-light text-foreground tracking-tight mb-4">
            Bienvenue dans votre Studio Créateur
          </h1>
          <p className="text-muted-foreground/70 text-lg mb-8">
            Configurez votre boutique pour commencer à vendre vos œuvres d'art
            et services incroyables
          </p>
          <Link to="/creator/shop">
            <Button variant="gradient" size="lg" icon={Plus}>
              Créer votre boutique
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-12">
        <div className="flex items-center space-x-4">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center border border-primary/20">
            <Palette className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-light text-foreground tracking-tight">
              Studio Créateur
            </h1>
            <p className="text-muted-foreground/70 text-base md:text-lg">
              {shop.name} • Gérez vos créations
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link to="/creator/products/new">
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              className="w-full sm:w-auto"
            >
              Ajouter un produit
            </Button>
          </Link>
          <Link to="/creator/services/new">
            <Button
              variant="outline"
              size="md"
              icon={Plus}
              className="w-full sm:w-auto"
            >
              Ajouter un service
            </Button>
          </Link>
        </div>
      </div>
      {/* Stock Alerts */}
      <div className="mb-8">
        <StockAlerts shopId={shop.id} />
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        <Card className="text-center p-4 md:p-6">
          <div className="glass w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-4 border border-primary/20">
            <Package className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div className="text-2xl md:text-3xl font-light text-foreground mb-1 md:mb-2">
            {stats.products.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-xs md:text-sm">
            Produits
          </div>
          {stats.productsInCarts > 0 && (
            <div className="text-xs text-orange-500 mt-1">
              dont {stats.productsInCarts} en paniers
            </div>
          )}
        </Card>

        <Card className="text-center p-4 md:p-6">
          <div className="glass w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-4 border border-primary/20">
            <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div className="text-2xl md:text-3xl font-light text-foreground mb-1 md:mb-2">
            {stats.services.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-xs md:text-sm">
            Services
          </div>
        </Card>

        <Card className="text-center p-4 md:p-6">
          <div className="glass w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-4 border border-primary/20">
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div className="text-2xl md:text-3xl font-light text-foreground mb-1 md:mb-2">
            {stats.orders.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-xs md:text-sm">
            Commandes
          </div>
        </Card>

        <Card className="text-center p-4 md:p-6">
          <div className="glass w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-4 border border-primary/20">
            <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div className="text-2xl md:text-3xl font-light text-foreground mb-1 md:mb-2">
            ${stats.revenue.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-xs md:text-sm">
            Revenus
          </div>
        </Card>
      </div>
      {/* Stock Information
      <div className="mb-8">
        <StockInfoCard />
      </div> */}
      {/* Products Management */}
      <div className="mb-8">
        <ProductsTable shopId={shop.id} />
      </div>
      {/* Services Management */}
      <div className="mb-8">
        <ServicesTable shopId={shop.id} />
      </div>
      {/* Sales Analytics */}
      <div className="mb-8">
        <SalesAnalytics shopId={shop.id} />
      </div>
      {/* Shipping Management */}
      <div className="mb-8">
        <ShippingManager shopId={shop.id} />
      </div>
      {/* Recent Orders Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light text-foreground tracking-tight">
              Activité Récente
            </h2>
            <Button variant="ghost" size="sm">
              Voir toutes les commandes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground/70">
                Aucune commande récente
              </p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                Les nouvelles commandes apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentOrders.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="glass rounded-2xl p-4 border border-border/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-foreground font-medium text-sm">
                      Commande #{item.id.slice(-6)}
                    </h3>
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.status === "completed"
                          ? "text-green-500 bg-green-500/10"
                          : item.status === "shipped"
                          ? "text-blue-500 bg-blue-500/10"
                          : "text-primary bg-primary/10"
                      }`}
                    >
                      {item.status === "completed"
                        ? "Complétée"
                        : item.status === "shipped"
                        ? "Expédiée"
                        : "En cours"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-light text-foreground">
                      ${(item.unit_price * item.qty).toFixed(2)}
                    </div>
                    <p className="text-muted-foreground/70 text-xs">
                      Qté: {item.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
