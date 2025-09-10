import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabase";
import {
  AlertTriangle,
  MessageSquare,
  Clock,
  User,
  Package,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import DisputeChatWrapper from "../../components/DisputeChatWrapper";
import { Link } from "react-router-dom";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import { useClickOutside } from "../../hooks/useClickOutside";

export function DisputesManagement() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);

  // Empêcher le scroll du body quand la modal est ouverte
  useModalScrollLock(showChatModal);

  // Fermer la modal en cliquant en dehors
  const chatModalRef = useClickOutside(showChatModal, () => {
    setShowChatModal(false);
    setSelectedDispute(null);
  });

  useEffect(() => {
    if (user) {
      fetchCreatorDisputes();
    }
  }, [user]);

  const fetchCreatorDisputes = async () => {
    try {
      setLoading(true);

      // Récupérer les litiges où l'utilisateur actuel est le vendeur
      const { data, error } = await supabase
        .from("disputes")
        .select(
          `
          *,
          escrow:escrows!inner(
            *,
            order:orders(
              *,
              order_items(*)
            ),
            buyer:profiles!escrows_buyer_id_fkey(display_name, avatar_url)
          )
        `
        )
        .eq("escrows.seller_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des litiges:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestClosure = async (disputeId: string, resolutionType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("requestDisputeClosure", {
        body: {
          disputeId,
          userId: user?.id,
          resolutionType,
          message: "Demande de clôture par le vendeur",
        },
      });

      if (error) throw error;

      // Afficher le message de la réponse
      if (data?.message) {
        console.log("Réponse du serveur:", data.message);
        // Ici on pourrait afficher une notification à l'utilisateur
      }

      fetchCreatorDisputes();
    } catch (error) {
      console.error("Erreur lors de la demande de clôture:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "open":
        return `${baseClasses} bg-orange-500/10 text-orange-600 border border-orange-500/20`;
      case "pending_buyer_closure":
        return `${baseClasses} bg-blue-500/10 text-blue-600 border border-blue-500/20`;
      case "pending_seller_closure":
        return `${baseClasses} bg-yellow-500/10 text-yellow-600 border border-yellow-500/20`;
      case "pending_admin_review":
        return `${baseClasses} bg-purple-500/10 text-purple-600 border border-purple-500/20`;
      case "resolved":
        return `${baseClasses} bg-green-500/10 text-green-600 border border-green-500/20`;
      default:
        return `${baseClasses} bg-muted/20 text-muted-foreground border border-muted/30`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "En cours";
      case "pending_buyer_closure":
        return "Attente client";
      case "pending_seller_closure":
        return "En attente";
      case "pending_admin_review":
        return "Examen admin";
      case "resolved":
        return "Résolu";
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

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            to="/dashboard/creator"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center border border-primary/20">
            <AlertTriangle className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight">
              Gestion des litiges
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              Résoudre les différends avec vos clients
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-muted/20">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-2xl font-light text-foreground mb-1">
              {disputes.length}
            </div>
            <div className="text-muted-foreground/70 text-sm">Total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-orange-500/20">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-2xl font-light text-foreground mb-1">
              {disputes.filter((d) => d.status === "open").length}
            </div>
            <div className="text-muted-foreground/70 text-sm">En cours</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
              <User className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-light text-foreground mb-1">
              {disputes.filter((d) => d.status.includes("pending")).length}
            </div>
            <div className="text-muted-foreground/70 text-sm">En attente</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-green-500/20">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-light text-foreground mb-1">
              {disputes.filter((d) => d.status === "resolved").length}
            </div>
            <div className="text-muted-foreground/70 text-sm">Résolus</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-foreground tracking-tight">
            Litiges actifs
          </h2>
          <p className="text-muted-foreground/70">
            Gérez les litiges concernant vos commandes
          </p>
        </div>
        <Button onClick={fetchCreatorDisputes} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Liste des litiges */}
      <div className="space-y-4">
        {disputes.length === 0 ? (
          <Card className="p-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>
              <CheckCircle2 className="relative h-20 w-20 text-muted-foreground/60 mx-auto mb-6" />
            </div>
            <h3 className="text-2xl font-light text-foreground mb-3">
              Aucun litige actif
            </h3>
            <p className="text-muted-foreground/70 text-lg max-w-md mx-auto">
              Excellente nouvelle ! Aucun litige n'est ouvert concernant vos
              commandes.
            </p>
          </Card>
        ) : (
          disputes.map((dispute) => (
            <Card
              key={dispute.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center border border-orange-500/20">
                      <AlertTriangle className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-1">
                        Litige #{dispute.id.slice(-8)}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(dispute.created_at).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4" />
                          <span>
                            Commande #{dispute.escrow?.order?.id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={getStatusBadge(dispute.status)}>
                    {getStatusText(dispute.status)}
                  </div>
                </div>

                {/* Informations du litige */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="glass p-4 rounded-lg border border-muted/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Client
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {dispute.escrow?.buyer?.display_name || "Utilisateur"}
                    </p>
                  </div>
                  <div className="glass p-4 rounded-lg border border-muted/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Montant
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {dispute.escrow?.gross_amount?.toFixed(2)}€
                    </p>
                  </div>
                  <div className="glass p-4 rounded-lg border border-muted/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Commande
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      #{dispute.escrow?.order?.id?.slice(-8) || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Détails des articles */}
                {dispute.escrow?.order?.order_items &&
                  dispute.escrow.order.order_items.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-foreground mb-3">
                        Articles concernés
                      </h4>
                      <div className="space-y-2">
                        {dispute.escrow.order.order_items.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              className="glass p-3 rounded-lg border border-muted/20"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {item.item_type === "product"
                                      ? `Produit #${item.item_id.slice(-8)}`
                                      : item.item_type === "service"
                                      ? `Service #${item.item_id.slice(-8)}`
                                      : "Article"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Type: {item.item_type} • Quantité:{" "}
                                    {item.qty} • {item.unit_price?.toFixed(2)}€
                                  </p>
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {(item.qty * item.unit_price)?.toFixed(2)}€
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Motif */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Motif du litige
                  </h4>
                  <div className="glass p-3 rounded-lg border border-muted/20">
                    <p className="text-sm text-muted-foreground">
                      {dispute.reason}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowChatModal(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Discussion
                    </Button>

                    {/* Boutons selon le statut */}
                    {dispute.status === "open" && (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            requestClosure(dispute.id, "refund_buyer")
                          }
                        >
                          Accepter remboursement
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            requestClosure(dispute.id, "pay_seller")
                          }
                        >
                          Demander paiement
                        </Button>
                      </div>
                    )}

                    {dispute.status === "pending_seller_closure" && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            supabase.functions.invoke(
                              "respondToDisputeClosure",
                              {
                                body: {
                                  disputeId: dispute.id,
                                  userId: user?.id,
                                  approved: true,
                                  message: "Fermeture approuvée par le vendeur",
                                },
                              }
                            )
                          }
                        >
                          Accepter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            supabase.functions.invoke(
                              "respondToDisputeClosure",
                              {
                                body: {
                                  disputeId: dispute.id,
                                  userId: user?.id,
                                  approved: false,
                                  message: "Fermeture refusée par le vendeur",
                                },
                              }
                            )
                          }
                        >
                          Refuser
                        </Button>
                      </div>
                    )}

                    {dispute.status === "pending_buyer_closure" && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-600 font-medium">
                          En attente de validation du client
                        </span>
                      </div>
                    )}

                    {dispute.status === "pending_admin_review" && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-purple-600 font-medium">
                          En attente de l'administrateur
                        </span>
                      </div>
                    )}

                    {dispute.status === "resolved" && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">
                          Litige résolu
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de chat */}
      {showChatModal && selectedDispute && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card
            ref={chatModalRef}
            className="w-full max-w-4xl max-h-[80vh] overflow-hidden"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium text-foreground">
                    Discussion - Litige #{selectedDispute.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Conversation avec{" "}
                    {selectedDispute.escrow?.buyer?.display_name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedDispute(null);
                  }}
                >
                  Fermer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-96">
              <DisputeChatWrapper
                disputeId={selectedDispute.id}
                userId={user.id}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
