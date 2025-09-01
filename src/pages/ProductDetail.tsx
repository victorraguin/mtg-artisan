import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ProductWithShop, StockInfo } from "../types";
import supabase from "../lib/supabase";
import {
  ShoppingCart,
  Clock,
  MapPin,
  Star,
  ArrowLeft,
  Share,
  Package,
  User,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAnalytics, useStockCheck } from "../hooks/useAnalytics";
import { useStockMonitoring } from "../hooks/useStockMonitoring";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { Button } from "../components/UI/Button";
import { Card, CardHeader, CardContent } from "../components/UI/Card";
import { ProductViewTracker } from "../components/Analytics";
import toast from "react-hot-toast";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { checkStock } = useStockCheck();

  // Utiliser le hook de monitoring du stock
  const { stockInfo, refetchStock } = useStockMonitoring(
    id || "",
    product?.type === "physical" && product?.stock !== null
  );

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          shop:shops(*),
          category:categories(name)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Erreur lors de la récupération du produit:", error);
      toast.error("Produit non trouvé");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Vérifier le stock avant d'ajouter
    if (product.type === "physical" && product.stock !== null) {
      const stock = await checkStock(product.id, quantity);
      if (!stock.available) {
        toast.error(
          `Stock insuffisant. Seulement ${stock.availableStock} article(s) disponible(s)`
        );
        return;
      }
    }

    try {
      await addToCart({
        item_type: "product",
        item_id: product.id,
        qty: quantity,
        unit_price: product.price,
        currency: product.currency,
        metadata: {},
        title: product.title,
        image_url: product.images?.[0] || "",
        shop_name: product.shop?.name || "",
        shop_id: product.shop_id,
      });

      // Mettre à jour les informations de stock après ajout
      if (product.type === "physical" && product.stock !== null) {
        refetchStock();
      }

      toast.success("Produit ajouté au panier !");
    } catch (error) {
      toast.error("Échec de l'ajout au panier");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 text-center">
        <div className="glass rounded-3xl p-12 border border-border/30">
          <div className="glass w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <Package className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-light text-foreground tracking-tight mb-4">
            Produit Non Trouvé
          </h1>
          <p className="text-muted-foreground/70 text-lg mb-8">
            Le produit que vous recherchez n'existe pas ou a été supprimé
          </p>
          <Link to="/search">
            <Button variant="gradient" size="lg" icon={ArrowLeft}>
              Retour à la Recherche
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Tracking automatique des vues */}
      {id && <ProductViewTracker productId={id} />}
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground/70 mb-8 overflow-x-auto">
        <Link
          to="/"
          className="hover:text-primary transition-colors duration-300"
        >
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <Link
          to="/search"
          className="hover:text-primary transition-colors duration-300"
        >
          Recherche
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground truncate">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="aspect-square bg-muted/50 rounded-3xl overflow-hidden border border-border/30">
            {product.images && product.images[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                <Package className="h-24 w-24" />
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-border/30 hover:border-primary/50"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              {product.category?.name && (
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">
                  {product.category.name}
                </span>
              )}
              {product.is_digital && (
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full border border-blue-500/20">
                  Numérique
                </span>
              )}
            </div>

            <h1 className="text-4xl font-light text-foreground tracking-tight mb-4">
              {product.title}
            </h1>

            <p className="text-muted-foreground/70 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Shop Info */}
          {product.shop && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  {product.shop.logo_url ? (
                    <img
                      src={product.shop.logo_url}
                      alt={product.shop.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-border/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/30">
                      <User className="h-8 w-8 text-muted-foreground/60" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-foreground mb-1">
                      {product.shop.name}
                    </h3>
                    {product.shop.country && (
                      <div className="flex items-center text-muted-foreground/70">
                        <MapPin className="h-4 w-4 mr-2" />
                        {product.shop.country}
                      </div>
                    )}
                  </div>
                  <Link to={`/creator/${product.shop.slug}`}>
                    <Button variant="outline" size="sm">
                      Voir la Boutique
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price & Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-3xl font-light text-foreground">
                    ${product.price}
                  </div>
                  {product.currency !== "USD" && (
                    <div className="text-sm text-muted-foreground/70">
                      Devise: {product.currency}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < (product.rating || 0)
                            ? "text-primary fill-current"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground/70">
                    {product.rating || 0}/5 ({product.review_count || 0} avis)
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              {product.type === "physical" && stockInfo && (
                <div className="bg-card/30 rounded-2xl p-4 border border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Stock disponible
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-sm font-medium ${
                          stockInfo.availableStock > 5
                            ? "text-green-500"
                            : stockInfo.availableStock > 0
                            ? "text-orange-500"
                            : "text-red-500"
                        }`}
                      >
                        {stockInfo.availableStock} disponible
                        {stockInfo.availableStock > 1 ? "s" : ""}
                      </span>
                      {stockInfo.inCartsCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({stockInfo.inCartsCount} dans des paniers)
                        </span>
                      )}
                    </div>
                  </div>
                  {stockInfo.availableStock <= 5 &&
                    stockInfo.availableStock > 0 && (
                      <p className="text-xs text-orange-500 mt-2">
                        ⚠️ Stock limité ! Plus que {stockInfo.availableStock}{" "}
                        article{stockInfo.availableStock > 1 ? "s" : ""}{" "}
                        disponible{stockInfo.availableStock > 1 ? "s" : ""}
                      </p>
                    )}
                  {stockInfo.availableStock === 0 && (
                    <p className="text-xs text-red-500 mt-2">
                      ❌ Rupture de stock
                    </p>
                  )}
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-foreground">
                    Quantité:
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ArrowLeft}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 p-0"
                    />
                    <span className="text-foreground font-medium min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ArrowLeft}
                      onClick={() => {
                        const maxQuantity = stockInfo?.availableStock || 999;
                        setQuantity(Math.min(maxQuantity, quantity + 1));
                      }}
                      disabled={
                        stockInfo?.availableStock
                          ? quantity >= stockInfo.availableStock
                          : false
                      }
                      className="w-10 h-10 p-0 rotate-180"
                    />
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  icon={ShoppingCart}
                  onClick={handleAddToCart}
                  disabled={stockInfo?.availableStock === 0}
                  className="w-full"
                >
                  {stockInfo?.availableStock === 0
                    ? "Rupture de stock"
                    : `Ajouter au Panier - ${(product.price * quantity).toFixed(
                        2
                      )}`}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-border/30 space-y-3">
                {product.lead_time && (
                  <div className="flex items-center text-sm text-muted-foreground/70">
                    <Clock className="h-4 w-4 mr-2" />
                    Délai de livraison: {product.lead_time} jours
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted/50 text-muted-foreground/70 text-xs rounded-lg border border-border/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
