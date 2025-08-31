import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Fonction utilitaire pour ajouter un timeout aux requêtes Supabase
const withTimeout = async (
  promise: Promise<any>,
  timeoutMs: number = 15000
) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout - Requête bloquée")), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};

export function useCategories(type?: "product" | "service") {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: async () => {
      let query = supabase.from("categories").select("*");

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await withTimeout(query.order("name"));

      if (error) throw error;
      return data || [];
    },
  });
}
