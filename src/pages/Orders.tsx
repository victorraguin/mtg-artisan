import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import supabase from "../lib/supabase";
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
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { Button } from "../components/UI/Button";
import { Card, CardContent } from "../components/UI/Card";
import Chat from "../components/Chat";
import DisputeChatWrapper from "../components/DisputeChatWrapper";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import { useClickOutside } from "../hooks/useClickOutside";

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [escrows, setEscrows] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState<any>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputes, setDisputes] = useState<any[]>([]);
  const [showDisputeChatModal, setShowDisputeChatModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);

  // Empêcher le scroll du body quand les modales sont ouvertes
  useModalScrollLock(showChatModal);
  useModalScrollLock(showDisputeModal);
  useModalScrollLock(showDisputeChatModal);

  // Fermer les modales en cliquant en dehors
  const chatModalRef = useClickOutside(showChatModal, () => {
    setShowChatModal(false);
    setSelectedOrder(null);
  });
  const disputeModalRef = useClickOutside(!!showDisputeModal, () => {
    setShowDisputeModal(null);
    setDisputeReason("");
  });
  const disputeChatModalRef = useClickOutside(showDisputeChatModal, () => {
    setShowDisputeChatModal(false);
    setSelectedDispute(null);
  });

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchEscrows();
      fetchDisputes();
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

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from("disputes")
        .select(
          `
          *,
          escrow:escrows(
            *,
            order:orders(
              *,
              order_items(
                *,
                shop:shops(name)
              )
            )
          )
        `
        )
        .eq("opened_by", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Litiges chargés:", data);
      setDisputes(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des litiges:", error);
    }
  };

  const getEscrowForOrder = (orderId: string) => {
    return escrows.find((escrow) => escrow.order_id === orderId);
  };

  const hasDisputeForOrder = (orderId: string) => {
    const escrow = getEscrowForOrder(orderId);
    if (!escrow) return false;
    return disputes.some(
      (dispute) => dispute.escrow_id === escrow.id && dispute.status === "open"
    );
  };

  const getDisputeForOrder = (orderId: string) => {
    const escrow = getEscrowForOrder(orderId);
    if (!escrow) return null;
    return disputes.find((dispute) => dispute.escrow_id === escrow.id);
  };

  const openChatModal = (order: any) => {
    setSelectedOrder(order);
    setShowChatModal(true);
  };

  const openDisputeChatModal = (dispute: any) => {
    setSelectedDispute(dispute);
    setShowDisputeChatModal(true);
  };

  const openDispute = async () => {
    if (!disputeReason.trim() || !showDisputeModal) return;

    // Vérifier si un litige existe déjà pour cette commande
    if (hasDisputeForOrder(showDisputeModal.id)) {
      alert("Un litige est déjà ouvert pour cette commande.");
      setShowDisputeModal(null);
      setDisputeReason("");
      return;
    }

    try {
      await supabase.functions.invoke("openDispute", {
        body: {
          orderId: showDisputeModal.id,
          buyerId: user?.id,
          reason: disputeReason,
        },
      });

      // Fermer le modal et rafraîchir les données
      setShowDisputeModal(null);
      setDisputeReason("");
      fetchOrders();
      fetchDisputes();
      fetchEscrows();
    } catch (error) {
      console.error("Erreur lors de l'ouverture du litige:", error);
    }
  };

  const requestDisputeClosure = async (
    disputeId: string,
    resolutionType: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "requestDisputeClosure",
        {
          body: {
            disputeId: disputeId,
            userId: user?.id,
            resolutionType: resolutionType,
            message: "Demande de fermeture du litige",
          },
        }
      );

      if (error) throw error;

      // Afficher le message de la réponse
      if (data?.message) {
        console.log("Réponse du serveur:", data.message);
        // Ici on pourrait afficher une notification à l'utilisateur
      }

      // Rafraîchir les données
      fetchDisputes();
      fetchEscrows();
      fetchOrders();
    } catch (error) {
      console.error("Erreur lors de la demande de fermeture:", error);
    }
  };

  const respondToDisputeClosure = async (
    disputeId: string,
    approved: boolean
  ) => {
    try {
      await supabase.functions.invoke("respondToDisputeClosure", {
        body: {
          disputeId: disputeId,
          userId: user?.id,
          approved: approved,
          message: approved ? "Fermeture approuvée" : "Fermeture refusée",
        },
      });

      // Rafraîchir les données
      fetchDisputes();
      fetchEscrows();
      fetchOrders();
    } catch (error) {
      console.error("Erreur lors de la réponse:", error);
    }
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
    if (activeTab === "disputes") return []; // Les litiges sont affichés séparément
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

  console.log("État actuel:", {
    activeTab,
    disputes: disputes.length,
    orders: orders.length,
    filteredOrdersLength: filteredOrders.length,
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight mb-4">
          Mes Achats
        </h1>
        <p className="text-muted-foreground/70 text-lg">
          Suivez toutes vos commandes et gérez vos achats
        </p>
      </div>

      <div className="space-y-8">
        {/* Stats Cards - Simplified */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted/30 rounded-xl p-4 border border-border/20">
            <div className="text-2xl font-medium text-foreground mb-1">
              {orders.length}
            </div>
            <div className="text-muted-foreground text-xs">Total achats</div>
          </div>

          <div className="bg-muted/30 rounded-xl p-4 border border-border/20">
            <div className="text-2xl font-medium text-foreground mb-1">
              {orders.filter((o) => o.status === "completed").length}
            </div>
            <div className="text-muted-foreground text-xs">Terminés</div>
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
              { key: "all", label: "Tous", count: orders.length },
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
                  (o) => o.status === "processing" || o.status === "in_progress"
                ).length,
              },
              {
                key: "shipped",
                label: "Expédiés",
                count: orders.filter((o) => o.status === "shipped").length,
              },
              {
                key: "delivered",
                label: "Livrés",
                count: orders.filter((o) => o.status === "delivered").length,
              },
              {
                key: "completed",
                label: "Terminés",
                count: orders.filter((o) => o.status === "completed").length,
              },
              {
                key: "disputes",
                label: "Litiges",
                count: disputes.length,
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
          {filteredOrders.length === 0 && activeTab !== "disputes" ? (
            <Card className="text-center p-16">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>
                <Package className="relative h-20 w-20 text-muted-foreground/60 mx-auto mb-6" />
              </div>
              <h3 className="text-2xl font-light text-foreground mb-3">
                {activeTab === "all" ? "Aucun achat" : "Aucun achat trouvé"}
              </h3>
              <p className="text-muted-foreground/70 mb-8 max-w-md mx-auto text-lg">
                {activeTab === "all"
                  ? "Commencez votre premier achat dès maintenant et découvrez nos créateurs talentueux."
                  : `Aucun achat avec le statut "${getStatusText(activeTab)}".`}
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
          ) : activeTab === "disputes" ? (
            disputes.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/5 rounded-full blur-3xl"></div>
                  <AlertCircle className="relative h-20 w-20 text-muted-foreground/60 mx-auto mb-6" />
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3">
                  Aucun litige
                </h3>
                <p className="text-muted-foreground/70 mb-8 max-w-md mx-auto text-lg">
                  Vous n'avez aucun litige en cours. C'est une bonne nouvelle !
                </p>
              </Card>
            ) : (
              disputes.map((dispute) => (
                <Card
                  key={dispute.id}
                  className="overflow-hidden border-destructive/30 hover:border-destructive/50 transition-colors duration-200"
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-foreground">
                            Litige #{dispute.id.slice(-8)}
                          </h3>
                          <p className="text-muted-foreground/70 text-sm">
                            Ouvert le{" "}
                            {new Date(dispute.created_at).toLocaleDateString(
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
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          dispute.status === "open"
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : dispute.status === "resolved"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {dispute.status === "open"
                          ? "En cours"
                          : dispute.status === "resolved"
                          ? "Résolu"
                          : dispute.status}
                      </div>
                    </div>

                    {/* Commande liée */}
                    {dispute.escrow?.order && (
                      <div className="mb-4 p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Commande #{dispute.escrow.order.id.slice(-8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dispute.escrow.order.total?.toFixed(2)}€ •{" "}
                              {dispute.escrow.order.order_items?.length || 0}{" "}
                              article(s)
                            </p>
                          </div>
                          <div className="text-sm font-medium text-destructive">
                            Montant bloqué
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Motif du litige */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        Motif du litige :
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                        {dispute.reason}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-border/20">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-3 py-1.5"
                          onClick={() => openDisputeChatModal(dispute)}
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            <span>Discussion</span>
                          </div>
                        </Button>

                        {/* Boutons de résolution selon le statut */}
                        {dispute.status === "open" && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs px-3 py-1.5"
                            onClick={() =>
                              requestDisputeClosure(dispute.id, "refund_buyer")
                            }
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3" />
                              <span>Proposer fermeture</span>
                            </div>
                          </Button>
                        )}

                        {dispute.status === "pending_buyer_closure" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-xs px-3 py-1.5"
                              onClick={() =>
                                respondToDisputeClosure(dispute.id, true)
                              }
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3" />
                                <span>Accepter</span>
                              </div>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-3 py-1.5 text-destructive border-destructive/30"
                              onClick={() =>
                                respondToDisputeClosure(dispute.id, false)
                              }
                            >
                              <div className="flex items-center gap-2">
                                <XCircle className="h-3 w-3" />
                                <span>Refuser</span>
                              </div>
                            </Button>
                          </div>
                        )}

                        {dispute.status === "pending_seller_closure" && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-600 font-medium">
                              En attente de validation du vendeur
                            </span>
                          </div>
                        )}

                        {/* Message si en attente admin */}
                        {dispute.status === "pending_admin_review" && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-orange-600 font-medium">
                              En attente de l'administrateur
                            </span>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground ml-auto">
                          {dispute.status === "open" && "En cours"}
                          {dispute.status === "pending_buyer_closure" &&
                            "En attente de validation acheteur"}
                          {dispute.status === "pending_seller_closure" &&
                            "En attente de validation vendeur"}
                          {dispute.status === "pending_admin_review" &&
                            "En attente admin"}
                          {dispute.status === "resolved" && "Résolu"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          ) : (
            filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden hover:border-primary/30 transition-colors duration-200"
              >
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
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <a
                                href={`/product/${item.item_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground font-medium text-sm hover:text-primary transition-colors"
                              >
                                {item.title || "Article"}
                              </a>
                              <a
                                href={`/product/${item.item_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                title="Voir l'article"
                              >
                                <Package className="h-4 w-4" />
                              </a>
                            </div>
                            <p className="text-muted-foreground/70 text-xs">
                              {item.shop?.name} • Qty: {item.qty}
                            </p>
                            {item.tracking && (
                              <p className="text-muted-foreground/70 text-xs mt-1">
                                <Truck className="h-4 w-4 inline mr-1" />
                                Suivi: {item.tracking}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                              item.status
                            )}`}
                            title={getStatusDescription(item.status)}
                          >
                            {getStatusText(item.status)}
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {(item.unit_price * item.qty).toFixed(2)}€
                          </div>
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
                          className="text-xs px-3 py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            <span>Contacter</span>
                          </div>
                        </Button>
                        {order.order_items?.some(
                          (item: any) => item.status === "completed"
                        ) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs px-3 py-1.5 text-primary hover:text-primary/80"
                          >
                            <div className="flex items-center gap-2">
                              <Star className="h-3 w-3" />
                              <span>Avis</span>
                            </div>
                          </Button>
                        )}
                      </div>

                      {/* Buyer Order Actions - Inline */}
                      {order.order_items?.some((item: any) =>
                        ["delivered", "shipped"].includes(item.status)
                      ) &&
                        (() => {
                          const dispute = getDisputeForOrder(order.id);
                          const isDisputeInAdminReview =
                            dispute?.status === "pending_admin_review";
                          const isDisputeOpen = dispute?.status === "open";
                          const isDisputePending =
                            dispute?.status?.includes("pending");
                          const isDisputeResolved =
                            dispute?.status === "resolved";

                          if (isDisputeResolved) {
                            return (
                              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">
                                  Litige résolu - Remboursement effectué
                                </span>
                              </div>
                            );
                          }

                          if (isDisputeInAdminReview) {
                            return (
                              <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <span className="text-sm text-orange-600 font-medium">
                                  Litige en cours d'examen par l'administrateur
                                </span>
                              </div>
                            );
                          }

                          if (isDisputeOpen || isDisputePending) {
                            return (
                              <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 rounded-lg border border-destructive/20">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <span className="text-sm text-destructive font-medium">
                                  Litige en cours - Argent bloqué
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                className="text-xs px-3 py-1.5"
                                onClick={async () => {
                                  try {
                                    await supabase.functions.invoke(
                                      "releaseEscrow",
                                      {
                                        body: { orderId: order.id },
                                      }
                                    );
                                    // Rafraîchir les données après confirmation
                                    fetchOrders();
                                  } catch (error) {
                                    console.error(
                                      "Erreur lors de la confirmation:",
                                      error
                                    );
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Confirmer</span>
                                </div>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs px-3 py-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => setShowDisputeModal(order)}
                              >
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Litige</span>
                                </div>
                              </Button>
                            </div>
                          );
                        })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={chatModalRef}
            className="w-full max-w-3xl max-h-[85vh] overflow-hidden bg-background rounded-lg shadow-xl border border-border"
          >
            <div className="bg-card border-b border-border/30 p-6">
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
            </div>
            <div className="p-0 h-[60vh]">
              <Chat
                orderId={selectedOrder.id}
                userId={user?.id || ""}
                context="order"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={disputeModalRef}
            className="w-full max-w-md bg-background rounded-lg shadow-xl border border-border"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-destructive/10 rounded-xl border border-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light text-foreground">
                      Ouvrir un litige
                    </h3>
                    <p className="text-sm text-muted-foreground/70">
                      Commande #{showDisputeModal.id.slice(-8)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDisputeModal(null);
                    setDisputeReason("");
                  }}
                >
                  Fermer
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Motif du litige
                </label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Décrivez le problème rencontré avec cette commande..."
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground/60 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  rows={4}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={openDispute}
                  disabled={!disputeReason.trim()}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    <span>Ouvrir le litige</span>
                  </div>
                </Button>
                <Button
                  onClick={() => {
                    setShowDisputeModal(null);
                    setDisputeReason("");
                  }}
                  variant="ghost"
                  size="sm"
                  className="px-4"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Chat Modal */}
      {showDisputeChatModal && selectedDispute && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={disputeChatModalRef}
            className="w-full max-w-4xl max-h-[80vh] overflow-hidden bg-background rounded-lg shadow-xl border border-border"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium text-foreground">
                    Discussion - Litige #{selectedDispute.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Conversation concernant la commande #
                    {selectedDispute.escrow?.order?.id?.slice(-8)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDisputeChatModal(false);
                    setSelectedDispute(null);
                  }}
                >
                  Fermer
                </Button>
              </div>
            </div>
            <div className="p-0 flex flex-col h-96">
              <DisputeChatWrapper
                disputeId={selectedDispute.id}
                userId={user.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
