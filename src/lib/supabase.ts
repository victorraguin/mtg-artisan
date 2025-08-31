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

// Fonction utilitaire pour wrapper les requêtes avec timeout et retry
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 4,
  timeoutMs: number = 10000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Créer une promesse avec timeout
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout après ${timeoutMs}ms (tentative ${attempt})`)), timeoutMs)
      );

      // Exécuter l'opération avec timeout
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error: any) {
      console.warn(`Tentative ${attempt}/${maxRetries} échouée:`, error.message);
      
      // Si c'est la dernière tentative, on lance l'erreur
      if (attempt === maxRetries) {
        throw new Error(`Échec après ${maxRetries} tentatives: ${error.message}`);
      }
      
      // Attendre avant de réessayer (backoff exponentiel)
      await new Promise(resolve => setTimeout(resolve, Math.min(Math.pow(2, attempt) * 500, 3000)));
    }
  }
  
  throw new Error('Échec inattendu');
};

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
  }, 1000);
}