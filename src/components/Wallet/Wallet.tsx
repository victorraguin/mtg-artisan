import { useState, useEffect } from "react";
import {
  Wallet as WalletIcon,
  Plus,
  Minus,
  TrendingUp,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../UI/Card";
import { Button } from "../UI/Button";
import { LoadingSpinner } from "../UI/LoadingSpinner";
import { PayPalLogo } from "../UI/PayPalLogo";
import { PayPalDepositModal } from "./PayPalDepositModal";
import { PayPalWithdrawModal } from "./PayPalWithdrawModal";
import supabase from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useWallet } from "../../contexts/WalletContext";
import toast from "react-hot-toast";

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  type: "credit" | "debit" | "withdrawal" | "deposit";
  amount: number;
  description: string;
  reference_type: string;
  status: string;
  created_at: string;
}

interface WalletProps {
  showActions?: boolean;
  compact?: boolean;
}

export function Wallet({ showActions = true, compact = false }: WalletProps) {
  const { user } = useAuth();
  const { balance, loading: walletLoading, refreshBalance } = useWallet();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  // Synchroniser le wallet local avec le contexte global
  useEffect(() => {
    if (wallet) {
      setWallet((prev) => (prev ? { ...prev, balance } : null));
    }
  }, [balance]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      // Récupérer le wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (walletError) {
        // Créer un wallet s'il n'existe pas
        if (walletError.code === "PGRST116") {
          const { data: newWallet, error: createError } = await supabase
            .from("wallets")
            .insert({ user_id: user?.id, balance: 0, currency: "EUR" })
            .select()
            .single();

          if (createError) throw createError;
          setWallet(newWallet);
        } else {
          throw walletError;
        }
      } else {
        setWallet(walletData);
      }

      // Récupérer les transactions
      if (walletData?.id) {
        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from("wallet_transactions")
            .select("*")
            .eq("wallet_id", walletData.id)
            .order("created_at", { ascending: false })
            .limit(50);

        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du wallet:", error);
      toast.error("Erreur lors du chargement du wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = () => {
    setShowDepositModal(true);
  };

  const handlePayPalDeposit = async (amount: number) => {
    try {
      setPaypalLoading(true);

      // Simuler l'intégration PayPal SDK
      // Dans un vrai projet, ici on utiliserait le PayPal SDK
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulation du processus PayPal

      // Simuler une réponse PayPal réussie
      const paypalTransactionId = `PAYPAL_${Date.now()}`;

      // Mettre à jour le solde du wallet
      const { error: updateError } = await supabase
        .from("wallets")
        .update({
          balance: (wallet?.balance || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id);

      if (updateError) throw updateError;

      // Créer une transaction
      const { error: transactionError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet?.id,
          type: "deposit",
          amount: amount,
          description: `Dépôt PayPal de ${amount}€`,
          reference_type: "deposit",
          status: "completed",
          external_reference: paypalTransactionId,
        });

      if (transactionError) throw transactionError;

      toast.success(`Dépôt de ${amount}€ effectué avec succès via PayPal !`);
      fetchWalletData(); // Recharger les données
    } catch (error) {
      console.error("Erreur lors du dépôt PayPal:", error);
      toast.error("Erreur lors du dépôt PayPal");
      throw error;
    } finally {
      setPaypalLoading(false);
    }
  };

  const handleWithdraw = () => {
    if (!wallet || wallet.balance <= 0) {
      toast.error("Solde insuffisant pour un retrait");
      return;
    }
    setShowWithdrawModal(true);
  };

  const handlePayPalWithdraw = async (amount: number, paypalEmail: string) => {
    try {
      setPaypalLoading(true);

      // Calculer la commission (2%)
      const commission = amount * 0.02;
      const netAmount = amount - commission;

      // Simuler l'intégration PayPal Payouts API
      // Dans un vrai projet, ici on utiliserait l'API PayPal Payouts
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulation du processus PayPal

      const paypalPayoutId = `PAYOUT_${Date.now()}`;

      // Mettre à jour le solde du wallet
      const { error: updateError } = await supabase
        .from("wallets")
        .update({
          balance: wallet!.balance - amount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id);

      if (updateError) throw updateError;

      // Créer une transaction pour le retrait
      const { error: transactionError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet!.id,
          type: "withdrawal",
          amount: amount,
          description: `Retrait PayPal vers ${paypalEmail}`,
          reference_type: "withdrawal",
          status: "processing",
          external_reference: paypalPayoutId,
        });

      if (transactionError) throw transactionError;

      // Créer une transaction pour la commission
      if (commission > 0) {
        await supabase.from("wallet_transactions").insert({
          wallet_id: wallet!.id,
          type: "debit",
          amount: commission,
          description: `Commission retrait PayPal (2%)`,
          reference_type: "fee",
          status: "completed",
        });
      }

      toast.success(
        `Retrait de ${netAmount.toFixed(
          2
        )}€ vers PayPal initié ! (Commission: ${commission.toFixed(2)}€)`
      );
      fetchWalletData(); // Recharger les données
    } catch (error) {
      console.error("Erreur lors du retrait PayPal:", error);
      toast.error("Erreur lors du retrait PayPal");
      throw error;
    } finally {
      setPaypalLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    if (filter === "income") return transaction.type === "credit";
    if (filter === "expenses") return transaction.type === "debit";
    if (filter === "withdrawals") return transaction.type === "withdrawal";
    if (filter === "deposits") return transaction.type === "deposit";
    return true;
  });

  const getTransactionIcon = (referenceType: string) => {
    switch (referenceType) {
      case "referral":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "order":
        return <ShoppingBag className="h-4 w-4 text-green-500" />;
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <WalletIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "credit":
        return "text-green-600";
      case "debit":
      case "withdrawal":
        return "text-red-600";
      default:
        return "text-foreground";
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <WalletIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {wallet?.balance.toFixed(2)} {wallet?.currency}
              </div>
              <div className="text-xs text-muted-foreground/70">Solde</div>
            </div>
          </div>
          {showActions && (
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeposit}
                className="h-7 px-2 glass border-primary/20 hover:border-primary/40 hover:bg-primary/5 group"
                title="Déposer"
              >
                <Plus className="h-3 w-3 text-primary" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleWithdraw}
                className="h-7 px-2 glass border-primary/20 hover:border-primary/40 hover:bg-primary/5 group"
                title="Retirer"
              >
                <Minus className="h-3 w-3 text-primary" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Solde principal */}
      <Card className="p-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="glass w-12 h-12 rounded-3xl flex items-center justify-center border border-primary/20">
                <WalletIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-light text-foreground">
                  Mon Wallet
                </h2>
                <p className="text-muted-foreground/70 text-sm">
                  Gérez vos revenus et paiements
                </p>
              </div>
            </div>
            {showActions && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleDeposit}
                  className="glass border-primary/30 hover:border-primary/50 hover:bg-primary/5 group"
                >
                  <Plus className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-foreground">Déposer</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWithdraw}
                  className="glass border-primary/30 hover:border-primary/50 hover:bg-primary/5 group"
                >
                  <Minus className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-foreground">Retirer</span>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl font-light text-foreground mb-2">
              {wallet?.balance.toFixed(2)} {wallet?.currency}
            </div>
            <div className="text-muted-foreground/70">Solde disponible</div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="glass w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-primary/20">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-lg font-medium text-foreground">
            {transactions
              .filter((t) => t.type === "credit")
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}{" "}
            €
          </div>
          <div className="text-xs text-muted-foreground">Revenus totaux</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="glass w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-primary/20">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-lg font-medium text-foreground">
            {transactions
              .filter((t) => t.reference_type === "referral")
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}{" "}
            €
          </div>
          <div className="text-xs text-muted-foreground">
            Commissions ambassadeur
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="glass w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-primary/20">
            <ShoppingBag className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-lg font-medium text-foreground">
            {transactions
              .filter((t) => t.reference_type === "order")
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}{" "}
            €
          </div>
          <div className="text-xs text-muted-foreground">Revenus ventes</div>
        </Card>
      </div>

      {/* Historique des transactions */}
      <Card className="p-6">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">
              Historique des transactions
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant={filter === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Tout
              </Button>
              <Button
                variant={filter === "income" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("income")}
              >
                Revenus
              </Button>
              <Button
                variant={filter === "expenses" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("expenses")}
              >
                Dépenses
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <WalletIcon className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground/70">
                Aucune transaction trouvée
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.reference_type)}
                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(transaction.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-medium ${getTransactionColor(
                      transaction.type
                    )}`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}
                    {transaction.amount.toFixed(2)} €
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals PayPal */}
      <PayPalDepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onConfirm={handlePayPalDeposit}
        loading={paypalLoading}
      />

      <PayPalWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={handlePayPalWithdraw}
        loading={paypalLoading}
        availableBalance={wallet?.balance || 0}
      />
    </div>
  );
}
