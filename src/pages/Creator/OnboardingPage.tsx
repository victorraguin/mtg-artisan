import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { OnboardingWelcome } from "../../components/Creator/OnboardingWelcome";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import supabase from "../../lib/supabase";

export function OnboardingPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasShop, setHasShop] = useState(false);
  const [hasProducts, setHasProducts] = useState(false);

  useEffect(() => {
    if (user && profile?.role === "creator") {
      checkOnboardingStatus();
    }
  }, [user, profile]);

  const checkOnboardingStatus = async () => {
    try {
      // Vérifier si l'utilisateur a une boutique
      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user?.id)
        .maybeSingle();

      setHasShop(!!shop);

      // Vérifier si l'utilisateur a des produits
      if (shop) {
        const { data: products } = await supabase
          .from("products")
          .select("id")
          .eq("shop_id", shop.id)
          .limit(1);

        setHasProducts((products?.length || 0) > 0);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut d'onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <OnboardingWelcome 
        hasShop={hasShop} 
        hasProducts={hasProducts}
      />
    </div>
  );
}
