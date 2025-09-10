import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Shop, ShopStats, OrderItemWithDetails } from "../../types";
import supabase from "../../lib/supabase";
import {
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Store,
  ShoppingCart,
  Eye,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import { ProductsTable } from "../../components/Creator/ProductsTable";
import { ServicesTable } from "../../components/Creator/ServicesTable";
import { StockAlerts } from "../../components/Creator/StockAlerts";
import { SalesAnalytics } from "../../components/Creator/SalesAnalytics";
import { OverviewNotifications } from "../../components/Creator/OverviewNotifications";

export function CreatorDashboard() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<ShopStats>({
    products: 0,
    services: 0,
    orders: 0,
    revenue: 0,
    productsInCarts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderItemWithDetails[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [disputesCount, setDisputesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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

      if (shopError && shopError.code !== "PGRST116") {
        throw shopError;
      }

      setShop(shopData);

      if (shopData) {
        // Fetch stats
        const [statsResult, ordersResult, topProductsResult, disputesResult] =
          await Promise.all([
            fetchShopStats(shopData.id),
            fetchRecentOrders(shopData.id),
            fetchTopProducts(shopData.id),
            fetchDisputesCount(),
          ]);

        setStats(statsResult);
        setRecentOrders(ordersResult);
        setTopProducts(topProductsResult);
        setDisputesCount(disputesResult);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopStats = async (shopId: string): Promise<ShopStats> => {
    const [productsCount, servicesCount, ordersData, revenueData] =
      await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact" })
          .eq("shop_id", shopId),
        supabase
          .from("services")
          .select("id", { count: "exact" })
          .eq("shop_id", shopId),
        supabase
          .from("order_items")
          .select("id", { count: "exact" })
          .eq("shop_id", shopId),
        supabase
          .from("order_items")
          .select("unit_price, qty")
          .eq("shop_id", shopId)
          .in("status", ["completed", "delivered"]),
      ]);

    const revenue =
      revenueData.data?.reduce(
        (sum, item) => sum + item.unit_price * item.qty,
        0
      ) || 0;

    // Pour les paniers, on va faire une requête séparée plus simple
    let productsInCarts = 0;
    try {
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("shop_id", shopId);

      if (products && products.length > 0) {
        const productIds = products.map((p) => p.id);
        const { data: cartData } = await supabase
          .from("cart_analytics")
          .select("quantity")
          .in("product_id", productIds)
          .is("removed_at", null);

        productsInCarts =
          cartData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      }
    } catch (error) {
      console.log("Erreur lors du calcul des paniers:", error);
      productsInCarts = 0;
    }

    return {
      products: productsCount.count || 0,
      services: servicesCount.count || 0,
      orders: ordersData.count || 0,
      revenue,
      productsInCarts,
    };
  };

  const fetchRecentOrders = async (
    shopId: string
  ): Promise<OrderItemWithDetails[]> => {
    const { data, error } = await supabase
      .from("order_items")
      .select(
        `
        *,
        order:orders(
          id,
          user_id,
          created_at,
          profiles:user_id(display_name)
        )
      `
      )
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Erreur lors du chargement des commandes:", error);
      return [];
    }

    // Enrichir avec les détails des produits/services
    const enrichedData = await Promise.all(
      (data || []).map(async (item) => {
        let productData = null;
        let serviceData = null;

        if (item.item_type === "product") {
          const { data: product } = await supabase
            .from("products")
            .select("title")
            .eq("id", item.item_id)
            .single();
          productData = product;
        } else if (item.item_type === "service") {
          const { data: service } = await supabase
            .from("services")
            .select("title")
            .eq("id", item.item_id)
            .single();
          serviceData = service;
        }

        return {
          ...item,
          product: productData,
          service: serviceData,
        };
      })
    );

    return enrichedData;
  };

  const fetchTopProducts = async (shopId: string) => {
    const { data, error } = await supabase
      .from("order_items")
      .select("item_id, qty")
      .eq("shop_id", shopId)
      .eq("item_type", "product")
      .in("status", ["completed", "delivered"]);

    if (error) {
      console.error("Erreur lors du chargement des top produits:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Compter les ventes par produit
    const productCounts: { [key: string]: number } = {};
    data.forEach((item) => {
      const id = item.item_id;
      productCounts[id] = (productCounts[id] || 0) + item.qty;
    });

    // Récupérer les détails des 3 produits les plus vendus
    const topProductIds = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);

    if (topProductIds.length === 0) {
      return [];
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, title, price, images")
      .in("id", topProductIds);

    if (productsError) {
      console.error(
        "Erreur lors du chargement des détails produits:",
        productsError
      );
      return [];
    }

    // Combiner les données
    return (products || [])
      .map((product) => ({
        ...product,
        sales: productCounts[product.id] || 0,
      }))
      .sort((a, b) => b.sales - a.sales);
  };

  const fetchDisputesCount = async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from("disputes")
        .select(
          `
          id,
          escrow:escrows!inner(seller_id)
        `
        )
        .eq("escrows.seller_id", user?.id);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error("Error fetching disputes count:", error);
      return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      case "in_progress":
        return "text-blue-500 bg-blue-500/10";
      case "shipped":
        return "text-purple-500 bg-purple-500/10";
      case "delivered":
      case "completed":
        return "text-green-500 bg-green-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "in_progress":
        return "En cours";
      case "shipped":
        return "Expédié";
      case "delivered":
        return "Livré";
      case "completed":
        return "Terminé";
      default:
        return status;
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
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <Card className="text-center p-12">
          <Store className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Créez votre boutique
          </h3>
          <p className="text-muted-foreground/70 mb-4">
            Commencez par créer votre boutique pour vendre vos créations.
          </p>
          <Link to="/creator/shop">
            <Button>Créer ma boutique</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight mb-4">
              {shop.name}
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              Gérez votre boutique et suivez vos performances
            </p>
          </div>
          <div className="flex space-x-2">
            <Link to="/creator/orders">
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Mes Commandes
              </Button>
            </Link>
            <Link to="/creator/products/new">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Produit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Disputes Alert - Design System */}
      {disputesCount > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center border border-primary/20">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    {disputesCount} litige{disputesCount > 1 ? "s" : ""}{" "}
                    nécessite{disputesCount > 1 ? "nt" : ""} votre attention
                  </h3>
                  <p className="text-muted-foreground/70">
                    Des clients souhaitent discuter de leurs commandes
                  </p>
                </div>
              </div>
              <Link to="/creator/disputes">
                <Button variant="outline" size="sm">
                  Voir les litiges
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center p-6">
          <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div className="text-2xl font-light text-foreground mb-1">
            {stats.products}
          </div>
          <div className="text-muted-foreground/70 text-sm">Produits</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-green-500/20">
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-2xl font-light text-foreground mb-1">
            {stats.revenue.toFixed(0)}€
          </div>
          <div className="text-muted-foreground/70 text-sm">Revenus</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
            <TrendingUp className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-2xl font-light text-foreground mb-1">
            {stats.orders}
          </div>
          <div className="text-muted-foreground/70 text-sm">Commandes</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-orange-500/20">
            <ShoppingCart className="h-6 w-6 text-orange-500" />
          </div>
          <div className="text-2xl font-light text-foreground mb-1">
            {stats.productsInCarts}
          </div>
          <div className="text-muted-foreground/70 text-sm">En paniers</div>
        </Card>
      </div>

      {/* Stock Alerts */}
      <StockAlerts shopId={shop.id} />

      {/* Activité Récente */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Activité Récente
            </h3>
            <Link to="/creator/orders">
              <Button variant="outline" size="sm">
                Voir toutes les commandes
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground/70">
                Aucune commande récente
              </p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                Les nouvelles commandes apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 glass rounded-2xl border border-border/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {item.order?.profiles?.display_name || "Client"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.item_type === "product"
                        ? item.product?.title
                        : item.service?.title}{" "}
                      × {item.qty}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        {(item.unit_price * item.qty).toFixed(2)}€
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusText(item.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <Button
          variant={activeTab === "overview" ? "primary" : "outline"}
          onClick={() => setActiveTab("overview")}
        >
          Vue d'ensemble
        </Button>
        <Button
          variant={activeTab === "products" ? "primary" : "outline"}
          onClick={() => setActiveTab("products")}
        >
          Produits ({stats.products})
        </Button>
        {stats.services > 0 && (
          <Button
            variant={activeTab === "services" ? "primary" : "outline"}
            onClick={() => setActiveTab("services")}
          >
            Services ({stats.services})
          </Button>
        )}
        <Button
          variant={activeTab === "analytics" ? "primary" : "outline"}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Notifications importantes */}
            <OverviewNotifications
              stats={stats}
              recentOrders={recentOrders}
              topProducts={topProducts}
              shopId={shop.id}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-foreground">
                  Actions Rapides
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/creator/products/new" className="block">
                  <div className="p-4 glass rounded-2xl border border-border/30 hover:border-primary/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Plus className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">
                          Nouveau Produit
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Ajouter un nouveau produit à votre boutique
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/creator/orders" className="block">
                  <div className="p-4 glass rounded-2xl border border-border/30 hover:border-primary/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">
                          Gérer les Commandes
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Voir et gérer toutes vos commandes
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/creator/shop" className="block">
                  <div className="p-4 glass rounded-2xl border border-border/30 hover:border-primary/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Store className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">
                          Paramètres Boutique
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Modifier les informations de votre boutique
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "products" && <ProductsTable shopId={shop.id} />}

      {activeTab === "services" && stats.services > 0 && (
        <ServicesTable shopId={shop.id} />
      )}

      {activeTab === "analytics" && <SalesAnalytics shopId={shop.id} />}
    </div>
  );
}
