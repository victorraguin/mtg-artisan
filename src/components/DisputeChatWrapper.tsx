import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Chat from "./Chat";
import { LoadingSpinner } from "./UI/LoadingSpinner";

interface Props {
  disputeId: string;
  userId: string;
}

export default function DisputeChatWrapper({ disputeId, userId }: Props) {
  const [orderId, setOrderId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderId();
  }, [disputeId]);

  const fetchOrderId = async () => {
    try {
      // Récupérer l'escrow_id depuis le litige
      const { data: dispute, error: disputeError } = await supabase
        .from("disputes")
        .select("escrow_id")
        .eq("id", disputeId)
        .single();

      if (disputeError) throw disputeError;

      // Récupérer l'order_id depuis l'escrow
      const { data: escrow, error: escrowError } = await supabase
        .from("escrows")
        .select("order_id")
        .eq("id", dispute.escrow_id)
        .single();

      if (escrowError) throw escrowError;

      setOrderId(escrow.order_id);
    } catch (error) {
      console.error("Erreur lors du chargement de l'order_id:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          Impossible de charger la conversation
        </div>
      </div>
    );
  }

  return <Chat orderId={orderId} userId={userId} context="dispute" />;
}
