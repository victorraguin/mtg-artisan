import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Clock, MapPin } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useTranslation();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addToCart({
        item_type: "product",
        item_id: product.id,
        qty: 1,
        unit_price: product.price,
        currency: product.currency,
        metadata: {},
        title: product.title,
        image_url: product.images?.[0] || "",
        shop_name: product.shop?.name || "",
        shop_id: product.shop_id,
      });
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-card rounded-3xl overflow-hidden border border-border/30 hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
        {/* Image Container */}
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
              <div className="text-center">
                <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">📷</span>
                </div>
                <p className="text-sm">{t("productCard.noImage")}</p>
              </div>
            </div>
          )}

          {/* Digital Badge */}
          {product.type === "digital" && (
            <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full text-xs font-medium text-primary border border-primary/30">
              Digital
            </div>
          )}

          {/* Add to Cart Button Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              className="bg-primary/90 hover:bg-primary text-primary-foreground p-4 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-lg font-light text-card-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-relaxed">
            {product.title}
          </h3>

          {/* Shop Info */}
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <span className="font-medium text-primary/80">
              {product.shop?.name}
            </span>
            {product.shop?.country && (
              <>
                <span className="mx-2 text-muted-foreground/40">•</span>
                <div className="flex items-center text-muted-foreground/60">
                  <MapPin className="h-3 w-3 mr-1" />
                  {product.shop.country}
                </div>
              </>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-light text-card-foreground">
                ${product.price}
              </div>
              {product.lead_time_days && (
                <div className="flex items-center text-xs text-muted-foreground/60 mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {product.lead_time_days} jours
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="bg-muted/50 text-muted-foreground/80 text-xs px-3 py-1.5 rounded-full font-light border border-border/30"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-muted-foreground/60 text-xs px-3 py-1.5">
                  +{product.tags.length - 3} autres
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
