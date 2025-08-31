import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Debug: Vérifier la configuration
console.log("🔍 Configuration Supabase:", {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length,
  timestamp: new Date().toISOString(),
});

// Configuration simplifiée pour diagnostiquer le problème
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "X-Client-Info": "mtg-artisans-web",
    },
  },
});

// Test de connexion immédiat
if (typeof window !== "undefined") {
  console.log("🔍 Test de connexion Supabase au démarrage...");

  // Test simple
  (async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      console.log("🔍 Test de connexion résultat:", {
        success: !error,
        hasData: !!data,
        error: error?.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Erreur de connexion:", error);
    }
  })();
}
