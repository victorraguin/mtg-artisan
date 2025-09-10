import React, { useState } from "react";
import { X, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Card } from "../UI/Card";
import { PayPalLogo } from "../UI/PayPalLogo";
import { useWallet } from "../../contexts/WalletContext";

interface PayPalDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
  loading: boolean;
}

export function PayPalDepositModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: PayPalDepositModalProps) {
  const { refreshBalance } = useWallet();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Veuillez saisir un montant valide");
      return;
    }

    if (numAmount < 1) {
      setError("Le montant minimum est de 1€");
      return;
    }

    if (numAmount > 10000) {
      setError("Le montant maximum est de 10 000€");
      return;
    }

    try {
      await onConfirm(numAmount);
      await refreshBalance(); // Rafraîchir le solde dans le contexte
      setAmount("");
      onClose();
    } catch (err) {
      setError("Erreur lors du dépôt");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Card className="w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-foreground">
                Déposer via PayPal
              </h2>
              <p className="text-sm text-muted-foreground">
                Ajoutez des fonds à votre wallet
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* PayPal Info */}
        <div className="mb-6 p-4 glass rounded-2xl border border-primary/20">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <PayPalLogo size="md" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Paiement sécurisé
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Vous serez redirigé vers PayPal pour finaliser le paiement
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Montant à déposer
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="1"
                max="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pr-10"
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                €
              </div>
            </div>
            {error && (
              <div className="flex items-center space-x-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((suggestedAmount) => (
              <Button
                key={suggestedAmount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(suggestedAmount.toString())}
                disabled={loading}
                className="text-xs"
              >
                {suggestedAmount}€
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!amount || loading}
              className="flex-1"
            >
              Continuer
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Les fonds seront disponibles immédiatement après confirmation PayPal
          </p>
        </div>
      </Card>
    </div>
  );
}
