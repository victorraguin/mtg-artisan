import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabase";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Shield,
  User,
  Package,
  RefreshCw,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import { Select } from "../../components/UI/Select";
import { Input } from "../../components/UI/Input";
import DisputeChatWrapper from "../../components/DisputeChatWrapper";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import { useClickOutside } from "../../hooks/useClickOutside";

export function DisputeManagement() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolutionType, setResolutionType] = useState("refund_buyer");
  const [adminNotes, setAdminNotes] = useState("");
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedDisputeForChat, setSelectedDisputeForChat] =
    useState<any>(null);

  // Empêcher le scroll du body quand les modales sont ouvertes
  useModalScrollLock(showResolutionModal);
  useModalScrollLock(showChatModal);

  // Fermer les modales en cliquant en dehors
  const resolutionModalRef = useClickOutside(showResolutionModal, () => {
    setShowResolutionModal(false);
    setSelectedDispute(null);
    setResolutionType("refund_buyer");
    setAdminNotes("");
  });
  const chatModalRef = useClickOutside(showChatModal, () => {
    setShowChatModal(false);
    setSelectedDisputeForChat(null);
  });

  useEffect(() => {
    if (user) {
      fetchAllDisputes();
    }
  }, [user]);

  const fetchAllDisputes = async () => {
    try {
      setLoading(true);
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
            ),
            buyer:profiles!escrows_buyer_id_fkey(display_name, avatar_url),
            seller:profiles!escrows_seller_id_fkey(display_name, avatar_url)
          ),
          dispute_resolution_actions(
            *,
            user:profiles(display_name, role)
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

  const resolveDispute = async () => {
    if (!selectedDispute || !adminNotes.trim()) return;

    try {
      await supabase.functions.invoke("adminResolveDispute", {
        body: {
          disputeId: selectedDispute.id,
          adminId: user?.id,
          resolutionType: resolutionType,
          adminNotes: adminNotes,
        },
      });

      // Fermer le modal et rafraîchir
      setShowResolutionModal(false);
      setSelectedDispute(null);
      setAdminNotes("");
      fetchAllDisputes();
    } catch (error) {
      console.error("Erreur lors de la résolution:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "open":
        return `${baseClasses} bg-red-500/10 text-red-600 border border-red-500/20`;
      case "pending_buyer_closure":
      case "pending_seller_closure":
        return `${baseClasses} bg-yellow-500/10 text-yellow-600 border border-yellow-500/20`;
      case "pending_admin_review":
        return `${baseClasses} bg-blue-500/10 text-blue-600 border border-blue-500/20`;
      case "resolved":
        return `${baseClasses} bg-green-500/10 text-green-600 border border-green-500/20`;
      default:
        return `${baseClasses} bg-muted/20 text-muted-foreground border border-muted/30`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Ouvert";
      case "pending_buyer_closure":
        return "Attente acheteur";
      case "pending_seller_closure":
        return "Attente vendeur";
      case "pending_admin_review":
        return "Attente admin";
      case "resolved":
        return "Résolu";
      default:
        return status;
    }
  };

  const getPriorityColor = (status: string, createdAt: string) => {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (status === "pending_admin_review") return "border-blue-500";
    if (daysSinceCreation > 7) return "border-red-500";
    if (daysSinceCreation > 3) return "border-yellow-500";
    return "border-gray-200";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">
              Gestion des Litiges
            </h1>
            <p className="text-muted-foreground">
              Administration et résolution des litiges
            </p>
          </div>
          <Button onClick={fetchAllDisputes} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold">{disputes.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  En attente admin
                </p>
                <p className="text-2xl font-semibold text-blue-500">
                  {
                    disputes.filter((d) => d.status === "pending_admin_review")
                      .length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ouverts</p>
                <p className="text-2xl font-semibold text-red-500">
                  {disputes.filter((d) => d.status === "open").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Résolus</p>
                <p className="text-2xl font-semibold text-green-500">
                  {disputes.filter((d) => d.status === "resolved").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des litiges */}
      <div className="space-y-4">
        {disputes.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">
              Aucun litige
            </h3>
            <p className="text-muted-foreground">
              Aucun litige n'a été signalé pour le moment.
            </p>
          </Card>
        ) : (
          disputes.map((dispute) => (
            <Card
              key={dispute.id}
              className={`overflow-hidden border-l-4 ${getPriorityColor(
                dispute.status,
                dispute.created_at
              )}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-destructive" />
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
                        {" • "}
                        Commande #{dispute.escrow?.order?.id.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className={getStatusBadge(dispute.status)}>
                    {getStatusText(dispute.status)}
                  </div>
                </div>

                {/* Parties impliquées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Acheteur</span>
                    </div>
                    <p className="text-sm text-foreground">
                      {dispute.escrow?.buyer?.display_name || "Utilisateur"}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Vendeur</span>
                    </div>
                    <p className="text-sm text-foreground">
                      {dispute.escrow?.seller?.display_name || "Vendeur"}
                    </p>
                  </div>
                </div>

                {/* Montant et motif */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Montant bloqué
                    </p>
                    <p className="text-lg font-semibold text-destructive">
                      {dispute.escrow?.gross_amount?.toFixed(2)}€
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Motif du litige
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {dispute.reason}
                    </p>
                  </div>
                </div>

                {/* Actions admin */}
                <div className="pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-3 py-1.5"
                        onClick={() => {
                          setSelectedDisputeForChat(dispute);
                          setShowChatModal(true);
                        }}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chat du litige
                      </Button>
                    </div>

                    {/* Boutons selon le statut */}
                    {(dispute.status === "pending_admin_review" ||
                      dispute.status === "open") && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs px-3 py-1.5"
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setShowResolutionModal(true);
                        }}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Résoudre
                      </Button>
                    )}

                    {(dispute.status === "pending_buyer_closure" ||
                      dispute.status === "pending_seller_closure") && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600 font-medium">
                          En attente de validation des parties
                        </span>
                      </div>
                    )}

                    {dispute.status === "resolved" && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <CheckCircle className="h-4 w-4 text-green-500" />
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

      {/* Modal de résolution */}
      {showResolutionModal && selectedDispute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card ref={resolutionModalRef} className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium text-foreground">
                    Résoudre le litige
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Litige #{selectedDispute.id.slice(-8)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowResolutionModal(false);
                    setSelectedDispute(null);
                    setAdminNotes("");
                  }}
                >
                  Fermer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type de résolution
                </label>
                <Select
                  value={resolutionType}
                  onValueChange={setResolutionType}
                  options={[
                    { value: "refund_buyer", label: "Rembourser l'acheteur" },
                    { value: "pay_seller", label: "Payer le vendeur" },
                    { value: "split_payment", label: "Partager le paiement" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes administrateur
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Expliquez la décision prise..."
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground/60 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  rows={4}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={resolveDispute}
                  disabled={!adminNotes.trim()}
                  variant="primary"
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Résoudre le litige
                </Button>
                <Button
                  onClick={() => {
                    setShowResolutionModal(false);
                    setSelectedDispute(null);
                    setAdminNotes("");
                  }}
                  variant="ghost"
                  className="px-4"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de chat de litige */}
      {showChatModal && selectedDisputeForChat && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card
            ref={chatModalRef}
            className="w-full max-w-4xl max-h-[80vh] overflow-hidden"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium text-foreground">
                    Chat du litige #{selectedDisputeForChat.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Communication entre{" "}
                    {selectedDisputeForChat.escrow?.buyer?.display_name} et{" "}
                    {selectedDisputeForChat.escrow?.seller?.display_name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedDisputeForChat(null);
                  }}
                >
                  Fermer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-96">
              <DisputeChatWrapper
                disputeId={selectedDisputeForChat.id}
                userId={user.id}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
