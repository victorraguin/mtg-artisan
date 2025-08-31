import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Configuration optimisée pour éviter les requêtes qui restent en suspens
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "X-Client-Info": "mtg-artisans-web",
    },
  },
  // Configuration réseau pour éviter les timeouts
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test de connexion au démarrage
if (typeof window !== "undefined") {
  console.log("🔍 Initialisation Supabase...");
  
  // Test de connexion simple sans bloquer l'app
  setTimeout(() => {
    supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .then(({ error }) => {
        if (error) {
          console.warn("⚠️ Connexion Supabase:", error.message);
        } else {
          console.log("✅ Connexion Supabase OK");
        }
      })
      .catch(error => {
        console.warn("⚠️ Test connexion échoué:", error.message);
      });
  }, 2000);
}