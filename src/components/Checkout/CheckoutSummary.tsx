import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "../UI/Card";
import { useCart } from "../../contexts/CartContext";

interface CheckoutSummaryProps {
  items: any[];
  total: number;
  shippingRequired: boolean;
  isShippingComplete: boolean;
}

export function CheckoutSummary({
  items,
  total,
  shippingRequired,
  isShippingComplete,
}: CheckoutSummaryProps) {
  const { cart } = useCart();
  const { t } = useTranslation();
  // Group items by shop
  const itemsByShop = items.reduce((acc, item) => {
    if (!acc[item.shop_id]) {
      acc[item.shop_id] = {
        shop_name: item.shop_name,
        items: [],
      };
    }
    acc[item.shop_id].items.push(item);
    return acc;
  }, {} as Record<string, any>);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unit_price * item.qty,
    0
  );

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <h2 className="text-2xl font-light text-foreground tracking-tight">
          {t("checkoutSummary.title")}
        </h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {Object.entries(itemsByShop).map(([shopId, shop]: [string, any]) => (
            <div key={shopId} className="space-y-3">
              <h3 className="text-lg font-medium text-foreground">
                {shop.shop_name}
              </h3>

              <div className="space-y-4">
                {shop.items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center">
                          {t("checkoutSummary.noImage")}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t("checkoutSummary.qty")} {item.qty}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        ${(item.unit_price * item.qty).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${item.unit_price} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr className="border-border/30" />

        <div className="flex justify-between items-center text-lg font-bold">
          <span className="text-foreground">{t("checkoutSummary.total")}</span>
          <span className="text-foreground">${subtotal.toFixed(2)}</span>
        </div>

        {shippingRequired && !isShippingComplete && (
          <p className="text-sm text-destructive">
            {t("checkoutSummary.completeShipping")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
