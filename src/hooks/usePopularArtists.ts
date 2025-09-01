import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

export interface PopularArtist {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  shop: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    banner_url: string | null;
    rating_avg: number;
    is_verified: boolean;
  };
  products_count: number;
  services_count: number;
  total_rating: number;
}

export function usePopularArtists(limit: number = 6) {
  const [artists, setArtists] = useState<PopularArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPopularArtists();
  }, [limit]);

  const fetchPopularArtists = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les créateurs avec leurs boutiques et statistiques
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          display_name,
          avatar_url,
          bio,
          country,
          shops!inner(
            id,
            name,
            slug,
            logo_url,
            banner_url,
            rating_avg,
            is_verified
          )
        `)
        .eq("role", "creator")
        .not("shops.id", "is", null);

      if (profilesError) throw profilesError;

      // Récupérer le nombre de produits et services pour chaque artiste
      const artistsWithStats = await Promise.all(
        profilesData.map(async (profile) => {
          const shop = profile.shops[0];
          
          // Compter les produits actifs
          const { count: productsCount } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("shop_id", shop.id)
            .eq("status", "active");

          // Compter les services actifs
          const { count: servicesCount } = await supabase
            .from("services")
            .select("*", { count: "exact", head: true })
            .eq("shop_id", shop.id)
            .eq("status", "active");

          return {
            id: profile.id,
            display_name: profile.display_name || "Artiste Anonyme",
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            country: profile.country,
            shop: {
              id: shop.id,
              name: shop.name,
              slug: shop.slug,
              logo_url: shop.logo_url,
              banner_url: shop.banner_url,
              rating_avg: shop.rating_avg || 0,
              is_verified: shop.is_verified,
            },
            products_count: productsCount || 0,
            services_count: servicesCount || 0,
            total_rating: shop.rating_avg || 0,
          };
        })
      );

      // Trier par popularité (note moyenne + nombre de créations)
      const sortedArtists = artistsWithStats
        .sort((a, b) => {
          const scoreA = (a.total_rating * 10) + (a.products_count + a.services_count);
          const scoreB = (b.total_rating * 10) + (b.products_count + b.services_count);
          return scoreB - scoreA;
        })
        .slice(0, limit);

      setArtists(sortedArtists);
    } catch (err) {
      console.error("Erreur lors de la récupération des artistes populaires:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return { artists, loading, error, refetch: fetchPopularArtists };
}
