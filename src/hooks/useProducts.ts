import { useQuery } from "@tanstack/react-query";
import { supabase, withRetry } from "../lib/supabase";

export function useProducts(filters: any = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      return withRetry(async () => {
        let query = supabase
          .from("products")
          .select(
            `
            *,
            shop:shops(name, slug, logo_url, country),
            category:categories(name)
          `
          )
          .eq("status", "active");

        if (filters.shopId) {
          query = query.eq("shop_id", filters.shopId);
        }

        if (filters.categoryId) {
          query = query.eq("category_id", filters.categoryId);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
      }, 2, 8000);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      return withRetry(async () => {
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
        return data;
      }, 2, 8000);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
