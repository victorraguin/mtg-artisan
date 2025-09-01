import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useCategories(type?: "product" | "service") {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: async () => {
      let query = supabase.from("categories").select("*");

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes pour les catégories
    retry: 3,
  });
}
