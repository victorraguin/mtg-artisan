import React from "react";
import { PayPalLogo } from "../UI/PayPalLogo";

interface PayPalButtonsProps {
  amount: number;
  onSuccess: (paymentDetails?: any) => Promise<void>;
  disabled: boolean;
}

export function PayPalButtons({
  amount,
  onSuccess,
  disabled,
}: PayPalButtonsProps) {
  const handlePayment = async () => {
    try {
      // In a real implementation, this would integrate with PayPal Smart Buttons
      // For now, we'll simulate the payment process
      const simulatedPaymentDetails = {
        id: `PAYPAL_DEMO_${Date.now()}`,
        status: "COMPLETED",
        amount: amount,
      };

      await onSuccess(simulatedPaymentDetails);
      console.log("Paiement réussi");
    } catch (error) {
      console.error("Échec du paiement:", error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handlePayment}
        disabled={disabled}
        className="w-full glass border border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-foreground py-3 px-4 rounded-2xl font-medium transition-all flex items-center justify-center relative disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2" />
        )}
        {disabled ? "Traitement..." : `Payer ${amount.toFixed(2)} €`}
      </button>

      <p className="text-xs text-muted-foreground/70 text-center">
        Intégration PayPal - Mode démo
      </p>
    </div>
  );
}
