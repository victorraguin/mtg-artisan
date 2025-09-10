import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { OrderService } from "../services/orderService";
import { CheckoutSummary } from "../components/Checkout/CheckoutSummary";
import { PayPalButtons } from "../components/Checkout/PayPalButtons";
import { PaymentBreakdown } from "../components/Checkout/PaymentBreakdown";
import {
  MapPin,
  User,
  Phone,
  Save,
  ArrowLeft,
  CreditCard,
  Wallet as WalletIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Card, CardHeader, CardContent } from "../components/UI/Card";
import supabase from "../lib/supabase";

export function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { profile, updateProfile } = useAuth();
  const {
    balance: walletBalance,
    loading: loadingWallet,
    refreshBalance,
  } = useWallet();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: profile?.shipping_name || "",
    address: profile?.shipping_address || "",
    city: profile?.shipping_city || "",
    postal_code: profile?.shipping_postal_code || "",
    country: profile?.shipping_country || "",
    phone: profile?.phone || "",
  });

  const hasPhysicalItems = items.some((item) => item.item_type === "product");
  const isShippingComplete = hasPhysicalItems
    ? shippingAddress.name &&
      shippingAddress.address &&
      shippingAddress.city &&
      shippingAddress.postal_code &&
      shippingAddress.country
    : true;

  const getPaymentBreakdown = () => {
    const total = getTotal();
    const walletAmount = Math.min(walletBalance, total);
    const paypalAmount = total - walletAmount;

    return {
      total,
      walletAmount,
      paypalAmount,
      canPayWithWallet: walletBalance >= total,
    };
  };

  const isAddressDifferentFromProfile =
    shippingAddress.name !== (profile?.shipping_address || "") ||
    shippingAddress.address !== (profile?.shipping_address || "") ||
    shippingAddress.city !== (profile?.shipping_city || "") ||
    shippingAddress.postal_code !== (profile?.shipping_postal_code || "") ||
    shippingAddress.country !== (profile?.shipping_country || "") ||
    shippingAddress.phone !== (profile?.phone || "");

  const saveAddressToProfile = async () => {
    if (!profile) return;

    setSavingAddress(true);
    try {
      const { error } = await updateProfile({
        shipping_name: shippingAddress.name,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_postal_code: shippingAddress.postal_code,
        shipping_country: shippingAddress.country,
        phone: shippingAddress.phone,
      });

      if (error) throw error;
      toast.success("Adresse sauvegardée dans votre profil");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde de l'adresse");
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePaymentSuccess = async (paymentDetails?: any) => {
    if (!profile?.id) {
      toast.error("Utilisateur non connecté");
      return;
    }

    setProcessing(true);
    try {
      console.log("💳 Traitement du paiement...", paymentDetails);

      const breakdown = getPaymentBreakdown();

      // 1. Débiter le wallet si nécessaire
      if (breakdown.walletAmount > 0) {
        // Récupérer l'ID du wallet
        const { data: walletData } = await supabase
          .from("wallets")
          .select("id")
          .eq("user_id", profile.id)
          .single();

        if (!walletData) {
          throw new Error("Wallet introuvable");
        }

        // Débiter le wallet
        const { error: walletError } = await supabase
          .from("wallets")
          .update({
            balance: walletBalance - breakdown.walletAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", profile.id);

        if (walletError) throw walletError;

        // Créer une transaction wallet
        await supabase.from("wallet_transactions").insert({
          wallet_id: walletData.id,
          type: "debit",
          amount: breakdown.walletAmount,
          description: `Paiement commande (${breakdown.walletAmount.toFixed(
            2
          )}€ du wallet)`,
          reference_type: "order",
          status: "completed",
        });

        console.log(`💰 Wallet débité: ${breakdown.walletAmount.toFixed(2)}€`);
      }

      const paymentData = {
        id: paymentDetails?.id || `DEMO_${Date.now()}`,
        capture_id: paymentDetails?.capture_id || `CAPTURE_${Date.now()}`,
        status: paymentDetails?.status || "COMPLETED",
        amount: getTotal(),
        wallet_amount: breakdown.walletAmount,
        paypal_amount: breakdown.paypalAmount,
      };

      // 2. Utiliser le service pour créer la commande complète
      const result = await OrderService.createCompleteOrder(
        items,
        profile.id,
        paymentData,
        hasPhysicalItems ? shippingAddress : undefined
      );

      if (!result.success) {
        throw new Error(
          result.error || "Erreur lors de la création de la commande"
        );
      }

      console.log("✅ Commande créée avec succès:", {
        orderId: result.order.id,
        escrowsCount: result.escrows.length,
        notificationsCount: result.notifications.length,
        paymentBreakdown: breakdown,
      });

      // Rafraîchir le solde du wallet dans le contexte
      await refreshBalance();

      // Clear cart and redirect
      clearCart();

      const paymentMessage =
        breakdown.walletAmount > 0
          ? `(Wallet: ${breakdown.walletAmount.toFixed(2)}€${
              breakdown.paypalAmount > 0
                ? `, PayPal: ${breakdown.paypalAmount.toFixed(2)}€`
                : ""
            })`
          : "";

      toast.success(
        `🎉 Commande passée avec succès ! Total: ${getTotal().toFixed(
          2
        )}€ ${paymentMessage}`
      );

      navigate(`/dashboard/buyer`);
    } catch (error) {
      console.error("❌ Error creating order:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la commande"
      );
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <Card className="text-center p-16">
          <CreditCard className="h-16 w-16 text-muted-foreground/40 mx-auto mb-6" />
          <h1 className="text-2xl font-light text-foreground mb-4">
            Votre panier est vide
          </h1>
          <p className="text-muted-foreground/70 mb-6">
            Ajoutez des articles à votre panier avant de procéder au paiement
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/search")}
          >
            Parcourir les boutiques
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center text-muted-foreground/70 hover:text-primary transition-colors duration-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au panier
        </Link>
        <h1 className="text-4xl font-light text-foreground tracking-tight">
          Finaliser la commande
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          {hasPhysicalItems && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center border border-primary/20">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-light text-foreground">
                      Adresse de livraison
                    </h2>
                    <p className="text-muted-foreground/70">
                      Où souhaitez-vous recevoir votre commande ?
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom complet"
                    value={shippingAddress.name}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        name: e.target.value,
                      })
                    }
                    placeholder="Votre nom complet"
                  />
                  <Input
                    label="Téléphone"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Votre numéro de téléphone"
                  />
                </div>

                <Input
                  label="Adresse"
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address: e.target.value,
                    })
                  }
                  placeholder="Adresse complète"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Ville"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    placeholder="Ville"
                  />
                  <Input
                    label="Code postal"
                    value={shippingAddress.postal_code}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        postal_code: e.target.value,
                      })
                    }
                    placeholder="Code postal"
                  />
                  <Input
                    label="Pays"
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        country: e.target.value,
                      })
                    }
                    placeholder="Pays"
                  />
                </div>

                {isAddressDifferentFromProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Save}
                    loading={savingAddress}
                    onClick={saveAddressToProfile}
                    className="w-full md:w-auto"
                  >
                    Sauvegarder dans mon profil
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Répartition du paiement */}
          <PaymentBreakdown
            total={getTotal()}
            walletAmount={getPaymentBreakdown().walletAmount}
            paypalAmount={getPaymentBreakdown().paypalAmount}
            walletBalance={walletBalance}
            loading={loadingWallet}
          />

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center border border-primary/20">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-light text-foreground">
                    {getPaymentBreakdown().paypalAmount > 0
                      ? "Complément PayPal"
                      : "Paiement wallet"}
                  </h2>
                  <p className="text-muted-foreground/70">
                    {getPaymentBreakdown().canPayWithWallet
                      ? "Paiement intégral par wallet"
                      : `${getPaymentBreakdown().paypalAmount.toFixed(
                          2
                        )}€ via PayPal`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {getPaymentBreakdown().paypalAmount > 0 ? (
                <PayPalButtons
                  amount={getPaymentBreakdown().paypalAmount}
                  onSuccess={handlePaymentSuccess}
                  disabled={!isShippingComplete || processing}
                />
              ) : (
                <Button
                  onClick={() => handlePaymentSuccess()}
                  disabled={!isShippingComplete || processing}
                  loading={processing}
                  className="w-full"
                >
                  <WalletIcon className="h-4 w-4 mr-2" />
                  Payer avec mon wallet ({getTotal().toFixed(2)}€)
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <CheckoutSummary
            items={items}
            total={getTotal()}
            shippingRequired={hasPhysicalItems}
            isShippingComplete={isShippingComplete}
          />
        </div>
      </div>
    </div>
  );
}
