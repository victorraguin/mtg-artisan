import { useState } from "react";
import { CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";
import { Button } from "./UI/Button";
import supabase from "../lib/supabase";

interface Props {
  orderId: string;
  buyerId: string;
}

export default function BuyerOrderActions({ orderId, buyerId }: Props) {
  const [reason, setReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirmer = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke("releaseEscrow", {
        body: { orderId },
      });
      // Optionnel: afficher un message de succès
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
    } finally {
      setLoading(false);
    }
  };

  const litige = async () => {
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await supabase.functions.invoke("openDispute", {
        body: { orderId, buyerId, reason },
      });
      setReason("");
      setShowDisputeForm(false);
      // Optionnel: afficher un message de succès
    } catch (error) {
      console.error("Erreur lors de l'ouverture du litige:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Bouton principal de confirmation */}
      <Button
        onClick={confirmer}
        disabled={loading}
        variant="primary"
        size="sm"
        className="w-full"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        {loading ? "Confirmation..." : "Confirmer la réception"}
      </Button>

      {/* Bouton pour afficher le formulaire de litige */}
      {!showDisputeForm ? (
        <Button
          onClick={() => setShowDisputeForm(true)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Signaler un problème
        </Button>
      ) : (
        /* Formulaire de litige */
        <div className="p-4 bg-muted rounded-xl border border-border/30 space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Signaler un problème
            </span>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Décrivez le problème rencontré avec cette commande..."
            className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground/60 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            rows={3}
          />

          <div className="flex space-x-2">
            <Button
              onClick={litige}
              disabled={!reason.trim() || loading}
              variant="outline"
              size="sm"
              className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {loading ? "Envoi..." : "Ouvrir un litige"}
            </Button>
            <Button
              onClick={() => {
                setShowDisputeForm(false);
                setReason("");
              }}
              variant="ghost"
              size="sm"
              className="px-4"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
