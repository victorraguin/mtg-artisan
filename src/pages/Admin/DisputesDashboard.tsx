import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { Button } from "../../components/UI/Button";
import { Card, CardContent } from "../../components/UI/Card";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import DisputeChatWrapper from "../../components/DisputeChatWrapper";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import { useClickOutside } from "../../hooks/useClickOutside";

interface Profile {
  display_name: string | null;
}

interface Escrow {
  order_id: string;
  net_amount: number;
  currency: string;
  buyer: Profile[];
  seller: Profile[];
}

interface Dispute {
  id: string;
  reason: string | null;
  status: string;
  created_at: string;
  escrows: Escrow[];
}

export default function DisputesDashboard() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedDisputeForChat, setSelectedDisputeForChat] =
    useState<Dispute | null>(null);

  // Empêcher le scroll du body quand la modal est ouverte
  useModalScrollLock(showChatModal);

  // Fermer la modal en cliquant en dehors
  const chatModalRef = useClickOutside(showChatModal, () => {
    setShowChatModal(false);
    setSelectedDisputeForChat(null);
  });

  const load = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("disputes")
        .select(
          `
          id, 
          reason, 
          status, 
          created_at,
          escrows(
            order_id, 
            net_amount, 
            currency,
            buyer:profiles!escrows_buyer_id_fkey(display_name),
            seller:profiles!escrows_seller_id_fkey(display_name)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des litiges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decision = async (id: string, action: string) => {
    try {
      await supabase.functions.invoke("resolveDispute", {
        body: { disputeId: id, decision: action },
      });
      load();
    } catch (error) {
      console.error("Erreur lors de la résolution:", error);
    }
  };

  const openDisputeChat = (dispute: Dispute) => {
    setSelectedDisputeForChat(dispute);
    setShowChatModal(true);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "open":
        return `${baseClasses} bg-red-500/10 text-red-600 border border-red-500/20`;
      case "pending_admin_review":
        return `${baseClasses} bg-blue-500/10 text-blue-600 border border-blue-500/20`;
      case "resolved":
        return `${baseClasses} bg-green-500/10 text-green-600 border border-green-500/20`;
      default:
        return `${baseClasses} bg-muted/20 text-muted-foreground border border-muted/30`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-light text-foreground">Litiges</h2>
          <p className="text-muted-foreground/70">
            Gérez tous les litiges de la plateforme
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {disputes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>
              <AlertCircle className="relative h-20 w-20 text-muted-foreground/60 mx-auto mb-6" />
            </div>
            <h3 className="text-2xl font-light text-foreground mb-3">
              Aucun litige
            </h3>
            <p className="text-muted-foreground/70 text-lg max-w-md mx-auto">
              Aucun litige n'a été signalé pour le moment.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Card key={dispute.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">
                          Litige #{dispute.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Ouvert le{" "}
                          {new Date(dispute.created_at).toLocaleDateString(
                            "fr-FR"
                          )}
                          {" • "}Commande #
                          {dispute.escrows[0]?.order_id?.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className={getStatusBadge(dispute.status)}>
                      {dispute.status === "open" && "Ouvert"}
                      {dispute.status === "pending_buyer_closure" &&
                        "En attente client"}
                      {dispute.status === "pending_seller_closure" &&
                        "En attente vendeur"}
                      {dispute.status === "pending_admin_review" &&
                        "En attente admin"}
                      {dispute.status === "resolved" && "Résolu"}
                      {![
                        "open",
                        "pending_buyer_closure",
                        "pending_seller_closure",
                        "pending_admin_review",
                        "resolved",
                      ].includes(dispute.status) && dispute.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Acheteur
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        {dispute.escrows[0]?.buyer?.[0]?.display_name ||
                          "Utilisateur"}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Vendeur
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        {dispute.escrows[0]?.seller?.[0]?.display_name ||
                          "Vendeur"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Motif du litige
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      {dispute.reason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-foreground">
                      {dispute.escrows[0]?.net_amount?.toFixed(2) || "0.00"}€
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDisputeChat(dispute)}
                        className="text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Discussion
                      </Button>

                      {dispute.status === "open" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => decision(dispute.id, "refund_buyer")}
                            className="text-red-600 border-red-500/30 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rembourser
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => decision(dispute.id, "pay_seller")}
                            className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Payer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => decision(dispute.id, "split")}
                            className="text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/10"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Partager
                          </Button>
                        </>
                      )}

                      {(dispute.status === "pending_buyer_closure" ||
                        dispute.status === "pending_seller_closure") && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-600 font-medium">
                            En attente d'approbation
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de chat pour les litiges */}
      {showChatModal && selectedDisputeForChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            ref={chatModalRef}
            className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Discussion du litige #{selectedDisputeForChat.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Commande #
                    {selectedDisputeForChat.escrows[0]?.order_id?.slice(-8)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChatModal(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <DisputeChatWrapper
                disputeId={selectedDisputeForChat.id}
                userId={user?.id || ""}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
