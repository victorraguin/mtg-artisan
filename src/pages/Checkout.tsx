import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { NotificationService } from "../services/notificationService";
import { StockNotificationService } from "../services/stockNotificationService";
import supabase from "../lib/supabase";
import { CheckoutSummary } from "../components/Checkout/CheckoutSummary";
import { PayPalButtons } from "../components/Checkout/PayPalButtons";
import { MapPin, User, Phone, Save, ArrowLeft, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Card, CardHeader, CardContent } from "../components/UI/Card";
import { useTranslation } from "react-i18next";

export function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      toast.success(t("checkout.addressSaved"));
    } catch (error) {
      toast.error(t("checkout.addressError"));
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setProcessing(true);
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: profile?.id,
          total: getTotal(),
          status: "paid",
          payment_method: "paypal",
          payment_id: paymentDetails.id,
          shipping_address: hasPhysicalItems ? shippingAddress : null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        item_type: item.item_type,
        item_id: item.item_id,
        qty: item.qty,
        unit_price: item.unit_price,
        total: item.qty * item.unit_price,
        shop_id: item.shop_id,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Émettre les événements de notification
      try {
        // Notification pour l'acheteur
        await NotificationService.emitEvent("order.paid", [profile?.id!], {
          orderId: order.id,
          total: getTotal(),
          currency: "EUR",
        });

        // Notifications pour les vendeurs (groupées par boutique)
        const shopNotifications = new Map<string, any>();
        for (const item of items) {
          if (!shopNotifications.has(item.shop_id)) {
            shopNotifications.set(item.shop_id, {
              shopId: item.shop_id,
              orderId: order.id,
              buyerName: profile?.display_name || "Un client",
              items: [],
            });
          }
          shopNotifications.get(item.shop_id)!.items.push(item);
        }

        // Récupérer les propriétaires des boutiques et envoyer les notifications
        for (const [shopId, notifData] of shopNotifications) {
          const { data: shop } = await supabase
            .from("shops")
            .select("owner_id")
            .eq("id", shopId)
            .single();

          if (shop?.owner_id) {
            await NotificationService.emitEvent(
              "order.created",
              [shop.owner_id],
              notifData
            );
          }
        }
      } catch (notifError) {
        console.error("Erreur lors de l'envoi des notifications:", notifError);
        // Ne pas faire échouer la commande pour une erreur de notification
      }

      // Vérifier le stock après la commande
      StockNotificationService.checkStockAfterOrder(orderItems);

      // Clear cart and redirect
      clearCart();
      toast.success(t("checkout.orderSuccess"));
      navigate(`/dashboard/buyer`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(t("checkout.orderError"));
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
            {t("checkout.empty.title")}
          </h1>
          <p className="text-muted-foreground/70 mb-6">
            {t("checkout.empty.subtitle")}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/search")}
          >
            {t("checkout.empty.action")}
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
          {t("checkout.backToCart")}
        </Link>
        <h1 className="text-4xl font-light text-foreground tracking-tight">
          {t("checkout.title")}
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
                      {t("checkout.shipping.title")}
                    </h2>
                    <p className="text-muted-foreground/70">
                      {t("checkout.shipping.subtitle")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t("checkout.shipping.name")}
                    value={shippingAddress.name}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        name: e.target.value,
                      })
                    }
                    placeholder={t("checkout.shipping.namePlaceholder")}
                  />
                  <Input
                    label={t("checkout.shipping.phone")}
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        phone: e.target.value,
                      })
                    }
                    placeholder={t("checkout.shipping.phonePlaceholder")}
                  />
                </div>

                <Input
                  label={t("checkout.shipping.address")}
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address: e.target.value,
                    })
                  }
                  placeholder={t("checkout.shipping.addressPlaceholder")}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t("checkout.shipping.city")}
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    placeholder={t("checkout.shipping.city")}
                  />
                  <Input
                    label={t("checkout.shipping.postalCode")}
                    value={shippingAddress.postal_code}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        postal_code: e.target.value,
                      })
                    }
                    placeholder={t("checkout.shipping.postalCode")}
                  />
                  <Input
                    label={t("checkout.shipping.country")}
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        country: e.target.value,
                      })
                    }
                    placeholder={t("checkout.shipping.country")}
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
                    {t("checkout.shipping.save")}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center border border-primary/20">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-light text-foreground">
                    {t("checkout.payment.title")}
                  </h2>
                  <p className="text-muted-foreground/70">
                    {t("checkout.payment.securedBy")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PayPalButtons
                amount={getTotal()}
                onSuccess={handlePaymentSuccess}
                disabled={!isShippingComplete || processing}
              />
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
