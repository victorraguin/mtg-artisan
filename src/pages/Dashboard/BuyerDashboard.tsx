import { useState, useEffect } from "react";
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
  Shield,
  ShoppingBag,
  Hourglass,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import BuyerOrderActions from "../../components/BuyerOrderActions";
import Chat from "../../components/Chat";

export function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [escrows, setEscrows] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchEscrows();
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
            shop:shops(name, slug, owner_id)
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

  const fetchEscrows = async () => {
    try {
      const { data, error } = await supabase
        .from("escrows")
        .select(
          `
          *,
          order:orders(id, total)
        `
        )
        .eq("buyer_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEscrows(data || []);
    } catch (error) {
      console.error("Error fetching escrows:", error);
    }
  };

  const getEscrowForOrder = (orderId: string) => {
    return escrows.find((escrow) => escrow.order_id === orderId);
  };

  const openChatModal = (order: any) => {
    setSelectedOrder(order);
    setShowChatModal(true);
  };

  const getStatusIcon = (status: string) => {
    const iconClasses = "h-4 w-4";

    switch (status) {
      case "paid":
      case "pending":
        return <Hourglass className={`${iconClasses}`} />;
      case "processing":
      case "in_progress":
        return (
          <Clock
            className={`${iconClasses} animate-spin`}
            style={{ animationDuration: "3s" }}
          />
        );
      case "shipped":
        return <Truck className={`${iconClasses}`} />;
      case "delivered":
        return <Package className={`${iconClasses}`} />;
      case "completed":
        return <CheckCircle className={`${iconClasses}`} />;
      case "disputed":
        return <AlertCircle className={`${iconClasses}`} />;
      case "refunded":
        return <RefreshCw className={`${iconClasses}`} />;
      case "cancelled":
        return <XCircle className={`${iconClasses}`} />;
      default:
        return <AlertCircle className={`${iconClasses}`} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payé";
      case "pending":
        return "En attente";
      case "processing":
      case "in_progress":
        return "En traitement";
      case "shipped":
        return "Expédié";
      case "delivered":
        return "Livré";
      case "completed":
        return "Terminé";
      case "disputed":
        return "Litige";
      case "refunded":
        return "Remboursé";
      case "cancelled":
        return "Annulé";
      default:
        return status.replace("_", " ");
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    const baseClasses =
      "flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 shadow-sm";

    switch (status) {
      case "paid":
      case "pending":
        return `${baseClasses} bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 hover:shadow-md hover:shadow-primary/10`;
      case "processing":
      case "in_progress":
        return `${baseClasses} bg-primary/8 text-primary border-primary/25 animate-pulse hover:bg-primary/12 hover:shadow-md hover:shadow-primary/5`;
      case "shipped":
        return `${baseClasses} bg-primary/12 text-primary border-primary/30 hover:bg-primary/18 hover:shadow-md hover:shadow-primary/8`;
      case "delivered":
        return `${baseClasses} bg-primary/15 text-primary border-primary/35 hover:bg-primary/20 hover:shadow-md hover:shadow-primary/10`;
      case "completed":
        return `${baseClasses} bg-primary/20 text-primary border-primary/40 hover:bg-primary/25 hover:shadow-md hover:shadow-primary/15`;
      case "disputed":
        return `${baseClasses} bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15 animate-pulse`;
      case "refunded":
        return `${baseClasses} bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted/70`;
      case "cancelled":
        return `${baseClasses} bg-muted/30 text-muted-foreground/80 border-border/30 hover:bg-muted/40`;
      default:
        return `${baseClasses} bg-muted text-muted-foreground border-border/30 hover:bg-muted/80`;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "paid":
      case "pending":
        return "Paiement confirmé, en attente de traitement";
      case "processing":
      case "in_progress":
        return "Commande en cours de préparation";
      case "shipped":
        return "Commande expédiée, en transit";
      case "delivered":
        return "Commande livrée, en attente de confirmation";
      case "completed":
        return "Commande terminée avec succès";
      case "disputed":
        return "Litige ouvert, résolution en cours";
      case "refunded":
        return "Commande remboursée";
      case "cancelled":
        return "Commande annulée";
      default:
        return "";
    }
  };

  const filteredOrders = (() => {
    if (activeTab === "all") return orders;
    if (activeTab === "pending")
      return orders.filter(
        (order) => order.status === "pending" || order.status === "paid"
      );
    if (activeTab === "in_progress")
      return orders.filter(
        (order) =>
          order.status === "processing" || order.status === "in_progress"
      );
    return orders.filter((order) => order.status === activeTab);
  })();

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

      <div className="space-y-8">
        {/* Commandes */}
        <div>
          {/* Stats Cards - Simplified */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/30 rounded-xl p-4 border border-border/20">
              <div className="text-2xl font-medium text-foreground mb-1">
                {orders.length}
              </div>
              <div className="text-muted-foreground text-xs">
                Total commandes
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 border border-border/20">
              <div className="text-2xl font-medium text-foreground mb-1">
                {orders.filter((o) => o.status === "completed").length}
              </div>
              <div className="text-muted-foreground text-xs">Terminées</div>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 border border-border/20">
              <div className="text-2xl font-medium text-foreground mb-1">
                {
                  orders.filter(
                    (o) =>
                      o.status === "processing" ||
                      o.status === "in_progress" ||
                      o.status === "shipped"
                  ).length
                }
              </div>
              <div className="text-muted-foreground text-xs">En cours</div>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 border border-border/20">
              <div className="text-2xl font-medium text-foreground mb-1">
                {
                  orders.filter(
                    (o) => o.status === "paid" || o.status === "pending"
                  ).length
                }
              </div>
              <div className="text-muted-foreground text-xs">En attente</div>
            </div>
          </div>

          {/* Tabs - Simplified */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Toutes", count: orders.length },
                {
                  key: "pending",
                  label: "En attente",
                  count: orders.filter(
                    (o) => o.status === "pending" || o.status === "paid"
                  ).length,
                },
                {
                  key: "in_progress",
                  label: "En cours",
                  count: orders.filter(
                    (o) =>
                      o.status === "processing" || o.status === "in_progress"
                  ).length,
                },
                {
                  key: "shipped",
                  label: "Expédiées",
                  count: orders.filter((o) => o.status === "shipped").length,
                },
                {
                  key: "delivered",
                  label: "Livrées",
                  count: orders.filter((o) => o.status === "delivered").length,
                },
                {
                  key: "completed",
                  label: "Terminées",
                  count: orders.filter((o) => o.status === "completed").length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card className="text-center p-16">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>
                  <Package className="relative h-20 w-20 text-muted-foreground/60 mx-auto mb-6" />
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3">
                  {activeTab === "all"
                    ? "Aucune commande"
                    : "Aucune commande trouvée"}
                </h3>
                <p className="text-muted-foreground/70 mb-8 max-w-md mx-auto text-lg">
                  {activeTab === "all"
                    ? "Commencez votre première commande dès maintenant et découvrez nos créateurs talentueux."
                    : `Aucune commande avec le statut "${getStatusText(
                        activeTab
                      )}".`}
                </p>
                {activeTab === "all" && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => (window.location.href = "/")}
                    >
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Découvrir les produits
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => (window.location.href = "/search")}
                    >
                      Parcourir les créateurs
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} hover className="overflow-hidden">
                  <CardContent className="p-4">
                    {/* Header Grid */}
                    <div className="grid grid-cols-12 gap-4 items-center mb-4">
                      <div className="col-span-6 flex items-center space-x-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-foreground">
                            Commande #{order.id.slice(-8)}
                          </h3>
                          <p className="text-muted-foreground/70 text-xs">
                            {new Date(order.created_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-3 text-center">
                        <div className="text-lg font-medium text-foreground">
                          {order.total?.toFixed(2)}€
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.order_items?.length} article
                          {order.order_items?.length > 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="col-span-3 text-right">
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                            order.status
                          )}`}
                          title={getStatusDescription(order.status)}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Escrow Information - Compact */}
                    {(() => {
                      const escrow = getEscrowForOrder(order.id);
                      if (escrow && escrow.status === "held") {
                        return (
                          <div className="mb-3 p-2 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-3 w-3 text-primary" />
                              <span className="text-xs font-medium text-foreground">
                                Paiement sécurisé ({escrow.amount?.toFixed(2)}€)
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Order Items - Simplified */}
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                            <div>
                              <h4 className="text-foreground font-medium text-sm">
                                {item.title || "Article"}
                              </h4>
                              <p className="text-muted-foreground/70 text-xs">
                                {item.shop?.name} • Qty: {item.qty}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {(item.unit_price * item.qty).toFixed(2)}€
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons - Improved Layout */}
                    <div className="pt-4 border-t border-border/20">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openChatModal(order)}
                            className="flex items-center gap-2 text-xs px-3 py-1.5"
                          >
                            <MessageSquare className="h-3 w-3" />
                            Contacter
                          </Button>
                          {order.order_items?.some(
                            (item: any) => item.status === "completed"
                          ) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-2 text-xs px-3 py-1.5 text-primary hover:text-primary/80"
                            >
                              <Star className="h-3 w-3" />
                              Avis
                            </Button>
                          )}
                        </div>

                        {/* Buyer Order Actions - Inline */}
                        {order.order_items?.some((item: any) =>
                          ["delivered", "shipped"].includes(item.status)
                        ) && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex items-center gap-2 text-xs px-3 py-1.5"
                              onClick={async () => {
                                try {
                                  await supabase.functions.invoke(
                                    "releaseEscrow",
                                    {
                                      body: { orderId: order.id },
                                    }
                                  );
                                } catch (error) {
                                  console.error(
                                    "Erreur lors de la confirmation:",
                                    error
                                  );
                                }
                              }}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Confirmer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 text-xs px-3 py-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => {
                                const reason = prompt(
                                  "Décrivez le problème rencontré :"
                                );
                                if (reason?.trim()) {
                                  supabase.functions.invoke("openDispute", {
                                    body: {
                                      orderId: order.id,
                                      buyerId: user?.id,
                                      reason,
                                    },
                                  });
                                }
                              }}
                            >
                              <AlertCircle className="h-3 w-3" />
                              Problème
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[85vh] overflow-hidden">
            <CardHeader className="bg-card border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light text-foreground">
                      Conversation avec{" "}
                      {selectedOrder.order_items?.[0]?.shop?.name ||
                        "le vendeur"}
                    </h3>
                    <p className="text-sm text-muted-foreground/70">
                      Commande #{selectedOrder.id.slice(-8)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  Fermer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[60vh]">
              <Chat
                orderId={selectedOrder.id}
                userId={user?.id || ""}
                context="order"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
