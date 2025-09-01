import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
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

export function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [stats, setStats] = useState({
    products: 0,
    services: 0,
    orders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
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
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-4">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center border border-primary/20">
            <Palette className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-light text-foreground tracking-tight">
              Studio Créateur
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              {shop.name} • Gérez vos créations
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Link to="/creator/products/new">
            <Button variant="primary" size="md" icon={Plus}>
              Ajouter un produit
            </Button>
          </Link>
          <Link to="/creator/services/new">
            <Button variant="outline" size="md" icon={Plus}>
              Ajouter un service
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.products.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-sm">Produits</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.services.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-sm">Services</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.orders.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-sm">Commandes</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            ${stats.revenue.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-sm">Revenus</div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light text-foreground tracking-tight">
              Commandes Récentes
            </h2>
            <Button variant="ghost" size="sm">
              Voir toutes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground/70 text-lg">
                Aucune commande pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((item) => (
                <div
                  key={item.id}
                  className="glass rounded-2xl p-4 border border-border/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-foreground font-medium">
                        Commande #{item.id.slice(-8)}
                      </h3>
                      <p className="text-muted-foreground/70 text-sm">
                        Qté: {item.qty} • ${item.unit_price} l'unité
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-light text-foreground">
                        ${(item.unit_price * item.qty).toFixed(2)}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          item.status === "completed"
                            ? "text-green-500"
                            : item.status === "shipped"
                            ? "text-blue-500"
                            : "text-primary"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </div>
                    </div>
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
