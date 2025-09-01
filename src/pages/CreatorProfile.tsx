import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import supabase from "../lib/supabase";
import { MapPin, Star, Calendar, Package, Briefcase } from "lucide-react";
import { ProductCard } from "../components/Cards/ProductCard";
import { ServiceCard } from "../components/Cards/ServiceCard";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { Button } from "../components/UI/Button";
import { Card, CardHeader, CardContent } from "../components/UI/Card";

export function CreatorProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (slug) {
      fetchCreatorData();
    }
  }, [slug]);

  const fetchCreatorData = async () => {
    try {
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("slug", slug)
        .single();

      if (shopError) throw shopError;
      setShop(shopData);

      // Fetch products and services
      const [productsResult, servicesResult] = await Promise.all([
        supabase
          .from("products")
          .select("*, category:categories(name)")
          .eq("shop_id", shopData.id)
          .eq("status", "active"),
        supabase
          .from("services")
          .select("*, category:categories(name)")
          .eq("shop_id", shopData.id)
          .eq("status", "active"),
      ]);

      setProducts(
        productsResult.data?.map((p) => ({ ...p, shop: shopData })) || []
      );
      setServices(
        servicesResult.data?.map((s) => ({ ...s, shop: shopData })) || []
      );
    } catch (error) {
      console.error("Error fetching creator data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-light text-foreground">
          Boutique introuvable
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Hero Section avec Bannière */}
      <div className="relative mb-12">
        {/* Bannière de la boutique */}
        <div className="h-64 md:h-80 bg-muted rounded-3xl overflow-hidden relative">
          {shop.banner_url ? (
            <img
              src={shop.banner_url}
              alt={`Bannière de ${shop.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background/50" />
          )}

          {/* Overlay gradient pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

          {/* Contenu de la bannière */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end space-x-6">
              {/* Logo de la boutique */}
              <div className="flex-shrink-0">
                {shop.logo_url ? (
                  <img
                    src={shop.logo_url}
                    alt={shop.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-background/80 shadow-2xl"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-muted border-4 border-background/80 shadow-2xl flex items-center justify-center">
                    <span className="text-3xl md:text-4xl font-light text-muted-foreground">
                      {shop.name[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Informations de la boutique */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
                    {shop.name}
                  </h1>
                  {shop.is_verified && (
                    <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Vérifié
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-6 text-foreground/80 mb-4">
                  {shop.country && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {shop.country}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-primary" />
                    {shop.rating_avg
                      ? `${shop.rating_avg.toFixed(1)}/5`
                      : "Nouveau"}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Membre depuis {new Date(shop.created_at).getFullYear()}
                  </div>
                </div>

                {shop.bio && (
                  <p className="text-foreground/90 text-lg leading-relaxed max-w-3xl">
                    {shop.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-12">
        <Button
          variant={activeTab === "products" ? "primary" : "ghost"}
          size="lg"
          onClick={() => setActiveTab("products")}
          className="flex items-center space-x-2"
        >
          <Package className="h-5 w-5" />
          <span>Produits ({products.length})</span>
        </Button>
        <Button
          variant={activeTab === "services" ? "primary" : "ghost"}
          size="lg"
          onClick={() => setActiveTab("services")}
          className="flex items-center space-x-2"
        >
          <Briefcase className="h-5 w-5" />
          <span>Services ({services.length})</span>
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeTab === "products" ? (
          products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="glass w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border/50">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-light text-foreground mb-2">
                Aucun produit disponible
              </h3>
              <p className="text-muted-foreground/70">
                Cette boutique n'a pas encore de produits
              </p>
            </div>
          )
        ) : services.length > 0 ? (
          services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="glass w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border/50">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-light text-foreground mb-2">
              Aucun service disponible
            </h3>
            <p className="text-muted-foreground/70">
              Cette boutique n'a pas encore de services
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
