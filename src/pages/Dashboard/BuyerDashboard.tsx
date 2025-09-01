import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabase";
import {
  Package,
  Clock,
  CheckCircle,
  MessageSquare,
  Star,
  Truck,
  AlertCircle,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";

export function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(
            *,
            shop:shops(name, slug)
          )
        `
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
      case "processing":
        return <Clock className="h-5 w-5 text-primary" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground/60" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "processing":
        return "text-primary";
      case "completed":
        return "text-green-500";
      case "shipped":
        return "text-blue-500";
      default:
        return "text-muted-foreground/60";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payé";
      case "processing":
        return "En traitement";
      case "completed":
        return "Terminé";
      case "shipped":
        return "Expédié";
      default:
        return status.replace("_", " ");
    }
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight mb-4">
          Tableau de Bord
        </h1>
        <p className="text-muted-foreground/70 text-lg">
          Suivez vos commandes et gérez vos achats
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="text-center p-6">
          <div className="text-3xl font-light text-foreground mb-2">
            {orders.length}
          </div>
          <div className="text-muted-foreground/70 text-sm">
            Total des commandes
          </div>
        </Card>

        <Card className="text-center p-6">
          <div className="text-3xl font-light text-foreground mb-2">
            {orders.filter((o) => o.status === "completed").length}
          </div>
          <div className="text-muted-foreground/70 text-sm">
            Commandes terminées
          </div>
        </Card>

        <Card className="text-center p-6">
          <div className="text-3xl font-light text-foreground mb-2">
            {
              orders.filter(
                (o) => o.status === "processing" || o.status === "shipped"
              ).length
            }
          </div>
          <div className="text-muted-foreground/70 text-sm">En cours</div>
        </Card>

        <Card className="text-center p-6">
          <div className="text-3xl font-light text-foreground mb-2">
            {orders.filter((o) => o.status === "paid").length}
          </div>
          <div className="text-muted-foreground/70 text-sm">En attente</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {["all", "paid", "processing", "shipped", "completed"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "Toutes" : getStatusText(tab)}
          </Button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <Card className="text-center p-16">
            <Package className="h-16 w-16 text-muted-foreground/40 mx-auto mb-6" />
            <h3 className="text-xl font-light text-foreground mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-muted-foreground/70">
              {activeTab === "all"
                ? "Vous n'avez pas encore passé de commande."
                : `Aucune commande avec le statut "${getStatusText(
                    activeTab
                  )}".`}
            </p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} hover className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-light text-foreground">
                      Commande #{order.id.slice(-8)}
                    </h3>
                    <p className="text-muted-foreground/70 text-sm">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-light text-foreground">
                      ${order.total}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground/70">
                      {getStatusIcon(order.status)}
                      <span
                        className={`ml-2 font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Order Items */}
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="glass rounded-2xl p-4 border border-border/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-foreground font-medium">
                            {item.title || "Article"}
                          </h4>
                          <p className="text-muted-foreground/70 text-sm">
                            De {item.shop?.name} • Qté: {item.qty}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(item.status)}
                          <span
                            className={`text-sm font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {item.status === "completed" && (
                        <div className="flex items-center space-x-4 mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={MessageSquare}
                            className="text-primary hover:text-primary/80"
                          >
                            Contacter le vendeur
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Star}
                            className="text-primary hover:text-primary/80"
                          >
                            Laisser un avis
                          </Button>
                        </div>
                      )}

                      {/* Tracking Info */}
                      {item.tracking && (
                        <div className="mt-3 p-3 glass rounded-xl border border-border/30">
                          <p className="text-sm text-foreground">
                            <strong>Suivi :</strong> {item.tracking}
                          </p>
                        </div>
                      )}

                      {/* Delivery Info */}
                      {item.delivery_date && (
                        <div className="mt-3 p-3 glass rounded-xl border border-border/30">
                          <p className="text-sm text-foreground">
                            <strong>Livraison prévue :</strong>{" "}
                            {new Date(item.delivery_date).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
