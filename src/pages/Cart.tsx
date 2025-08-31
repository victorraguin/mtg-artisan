import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { Button } from "../components/UI/Button";
import { Card, CardHeader, CardContent } from "../components/UI/Card";

export function Cart() {
  const {
    items,
    loading,
    updateQuantity,
    removeFromCart,
    getTotal,
    getItemCount,
  } = useCart();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 text-center">
        <div className="glass rounded-3xl p-12 border border-border/30">
          <div className="glass w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <ShoppingCart className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-light text-foreground tracking-tight mb-4">
            Votre Panier est Vide
          </h1>
          <p className="text-muted-foreground/70 text-lg mb-8">
            Découvrez des œuvres d'art incroyables et des services
            professionnels de créateurs talentueux
          </p>
          <Link to="/search">
            <Button variant="gradient" size="lg" icon={ArrowRight}>
              Commencer les Achats
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group items by shop
  const itemsByShop = items.reduce((acc, item) => {
    if (!acc[item.shop_id]) {
      acc[item.shop_id] = {
        shop_name: item.shop_name,
        items: [],
        total: 0,
      };
    }
    acc[item.shop_id].items.push(item);
    acc[item.shop_id].total += item.unit_price * item.qty;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-light text-foreground tracking-tight mb-2">
          Panier d'Achats
        </h1>
        <p className="text-muted-foreground/70 text-lg">
          {getItemCount()} article{getItemCount() > 1 ? "s" : ""} • Total: $
          {getTotal().toFixed(2)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(itemsByShop).map(([shopId, shop]: [string, any]) => (
            <Card key={shopId}>
              <CardHeader>
                <h3 className="text-xl font-light text-foreground tracking-tight">
                  {shop.shop_name}
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {shop.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="glass rounded-2xl p-4 border border-border/30"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Image */}
                      <div className="w-20 h-20 bg-muted/50 rounded-2xl overflow-hidden flex-shrink-0 border border-border/30">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 text-xs">
                            Pas d'image
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground font-medium text-base truncate mb-1">
                          {item.title}
                        </h4>
                        <p className="text-muted-foreground/70 text-sm mb-2">
                          ${item.unit_price} l'unité
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Minus}
                            onClick={() =>
                              updateQuantity(item.id, Math.max(0, item.qty - 1))
                            }
                            className="w-8 h-8 p-0"
                          />
                          <span className="text-foreground font-medium min-w-[2rem] text-center">
                            {item.qty}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Plus}
                            onClick={() =>
                              updateQuantity(item.id, item.qty + 1)
                            }
                            className="w-8 h-8 p-0"
                          />
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="text-right">
                        <div className="text-xl font-light text-foreground mb-2">
                          ${(item.unit_price * item.qty).toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <h2 className="text-2xl font-light text-foreground tracking-tight">
                Résumé de la Commande
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {Object.entries(itemsByShop).map(
                  ([shopId, shop]: [string, any]) => (
                    <div key={shopId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground/70">
                        {shop.shop_name}
                      </span>
                      <span className="text-foreground">
                        ${shop.total.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>

              <hr className="border-border/30" />

              <div className="flex justify-between text-lg font-medium">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${getTotal().toFixed(2)}</span>
              </div>

              <Link to="/checkout" className="block w-full">
                <Button
                  variant="gradient"
                  size="lg"
                  icon={ArrowRight}
                  className="w-full"
                >
                  Passer la Commande
                </Button>
              </Link>

              <Link to="/search" className="block w-full">
                <Button variant="outline" size="md" className="w-full">
                  Continuer les Achats
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
