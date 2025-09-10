import React, { useState } from "react";
import { X, ArrowUpRight, AlertCircle, Info } from "lucide-react";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Card } from "../UI/Card";
import { PayPalLogo } from "../UI/PayPalLogo";
import { useWallet } from "../../contexts/WalletContext";

interface PayPalWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, paypalEmail: string) => Promise<void>;
  loading: boolean;
  availableBalance: number;
}

export function PayPalWithdrawModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  availableBalance,
}: PayPalWithdrawModalProps) {
  const { refreshBalance } = useWallet();
  const [amount, setAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
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

    if (numAmount < 5) {
      setError("Le montant minimum de retrait est de 5€");
      return;
    }

    if (numAmount > availableBalance) {
      setError("Montant supérieur au solde disponible");
      return;
    }

    if (!paypalEmail || !paypalEmail.includes("@")) {
      setError("Veuillez saisir une adresse email PayPal valide");
      return;
    }

    try {
      await onConfirm(numAmount, paypalEmail);
      await refreshBalance(); // Rafraîchir le solde dans le contexte
      setAmount("");
      setPaypalEmail("");
      onClose();
    } catch (err) {
      setError("Erreur lors du retrait");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const maxWithdraw = Math.min(availableBalance, 5000); // Limite de 5000€ par retrait

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
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <ArrowUpRight className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-foreground">
                Retirer vers PayPal
              </h2>
              <p className="text-sm text-muted-foreground">
                Transférez vos fonds vers votre compte PayPal
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

        {/* Balance Info */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Solde disponible
            </span>
            <span className="text-lg font-medium text-foreground">
              {availableBalance.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* PayPal Info */}
        <div className="mb-6 p-4 glass rounded-2xl border border-primary/20">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <PayPalLogo size="md" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Délai de traitement
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Les retraits prennent généralement 1-3 jours ouvrés
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Adresse email PayPal
            </label>
            <Input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="votre-email@paypal.com"
              disabled={loading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              L'email associé à votre compte PayPal
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Montant à retirer
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="5"
                max={maxWithdraw}
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
            <p className="text-xs text-muted-foreground mt-1">
              Minimum: 5€ - Maximum: {maxWithdraw.toFixed(2)}€
            </p>
            {error && (
              <div className="flex items-center space-x-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2">
            {[
              Math.min(25, availableBalance),
              Math.min(50, availableBalance),
              Math.min(100, availableBalance),
              availableBalance,
            ]
              .filter((val) => val >= 5)
              .map((suggestedAmount, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(suggestedAmount.toFixed(2))}
                  disabled={loading}
                  className="text-xs"
                >
                  {index === 3 ? "Tout" : `${suggestedAmount}€`}
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
              disabled={!amount || !paypalEmail || loading}
              className="flex-1"
            >
              Initier le retrait
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Une commission de 2% est appliquée sur les retraits PayPal
          </p>
        </div>
      </Card>
    </div>
  );
}
