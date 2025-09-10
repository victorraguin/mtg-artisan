import { Wallet as WalletIcon, CreditCard } from "lucide-react";
import { Card, CardHeader, CardContent } from "../UI/Card";
import { LoadingSpinner } from "../UI/LoadingSpinner";

interface PaymentBreakdownProps {
  total: number;
  walletAmount: number;
  paypalAmount: number;
  walletBalance: number;
  loading?: boolean;
}

export function PaymentBreakdown({
  total,
  walletAmount,
  paypalAmount,
  walletBalance,
  loading = false,
}: PaymentBreakdownProps) {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex justify-center">
          <LoadingSpinner size="sm" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <CardHeader>
        <h3 className="text-lg font-medium text-foreground">
          Répartition du paiement
        </h3>
        <p className="text-sm text-muted-foreground/70">
          Total à payer: {total.toFixed(2)} €
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Solde wallet disponible */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
          <div className="flex items-center space-x-3">
            <WalletIcon className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-foreground">
                Solde disponible
              </div>
              <div className="text-xs text-muted-foreground">
                Dans votre wallet
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-foreground">
            {walletBalance.toFixed(2)} €
          </div>
        </div>

        {/* Montant utilisé du wallet */}
        {walletAmount > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
            <div className="flex items-center space-x-3">
              <WalletIcon className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Payé par wallet
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-200">
                  Débité automatiquement
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
              -{walletAmount.toFixed(2)} €
            </div>
          </div>
        )}

        {/* Montant PayPal */}
        {paypalAmount > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Complément PayPal
                </div>
                <div className="text-xs text-orange-700 dark:text-orange-200">
                  {paypalAmount === total
                    ? "Paiement complet"
                    : "Montant restant"}
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
              {paypalAmount.toFixed(2)} €
            </div>
          </div>
        )}

        {/* Résumé */}
        <div className="border-t border-border/50 pt-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-foreground">
              Total à payer
            </div>
            <div className="text-lg font-medium text-foreground">
              {total.toFixed(2)} €
            </div>
          </div>

          {walletAmount > 0 && (
            <div className="text-xs text-muted-foreground/70 mt-1">
              Wallet: {walletAmount.toFixed(2)}€ + PayPal:{" "}
              {paypalAmount.toFixed(2)}€
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
