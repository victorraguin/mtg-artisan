import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { User } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import supabase from "../lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authStable: boolean; // État de stabilité de l'authentification
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authStable, setAuthStable] = useState(false); // État de stabilité

  // Référence pour éviter les fuites de mémoire
  const isMountedRef = useRef(true);
  const profileFetchingRef = useRef<Set<string>>(new Set());
  const lastFetchTimeRef = useRef<number>(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction fetchProfile mémorisée avec useCallback
  const fetchProfile = useCallback(async (userId: string) => {
    console.log("🎯 fetchProfile appelé avec userId:", userId);

    // Éviter les appels multiples simultanés
    if (profileFetchingRef.current.has(userId)) {
      console.log("🔄 Profil déjà en cours de récupération pour:", userId);
      return;
    }

    profileFetchingRef.current.add(userId);
    console.log(
      "📝 Ajout de",
      userId,
      "à la liste des profils en cours de récupération"
    );

    try {
      console.log("👤 Récupération du profil pour:", userId);
      console.log("🔍 Exécution de la requête Supabase...");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      console.log("📊 Réponse Supabase - data:", data);
      console.log("📊 Réponse Supabase - error:", error);
      console.log(
        "🔍 Vérification isMountedRef.current:",
        isMountedRef.current
      );

      // On continue même si le composant se remonte, car on veut récupérer le profil
      console.log("✅ Composant monté, continuation de fetchProfile");

      if (error) {
        console.warn("⚠️ Profil non trouvé:", error.message);
        // Créer un profil par défaut si il n'existe pas
        if (error.code === "PGRST116") {
          console.log("📝 Création d'un profil par défaut...");
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              display_name: "",
              role: "buyer",
            })
            .select()
            .single();

          if (!createError && newProfile && isMountedRef.current) {
            setProfile(newProfile);
            return;
          }
        }
        setProfile(null);
        return;
      }

      console.log("✅ Pas d'erreur, traitement du profil récupéré");

      console.log("✅ Profil récupéré:", {
        displayName: data?.display_name,
        role: data?.role,
      });
      console.log("réussi");
      console.log("🔄 Mise à jour de l'état profile avec:", data);
      setProfile(data);
    } catch (error) {
      console.warn("⚠️ Erreur profil:", error);
      if (isMountedRef.current) {
        setProfile(null);
      }
    } finally {
      profileFetchingRef.current.delete(userId);
    }
  }, []);

  // Fonction de debounce pour éviter les appels trop fréquents
  const debouncedFetchProfile = useCallback(
    (userId: string, delay: number = 1000) => {
      const now = Date.now();

      // Si on a déjà fait un appel récemment, annuler le précédent
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Si on a fait un appel il y a moins de 1 seconde, attendre
      if (now - lastFetchTimeRef.current < delay) {
        fetchTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            fetchProfile(userId);
          }
        }, delay - (now - lastFetchTimeRef.current));
        return;
      }

      // Sinon, faire l'appel immédiatement
      lastFetchTimeRef.current = now;
      fetchProfile(userId);
    },
    [fetchProfile]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔍 Initialisation de l'authentification...");

        // Récupérer la session persistée
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMountedRef.current) return;

        if (error) {
          console.error(
            "❌ Erreur lors de la récupération de la session:",
            error
          );
          setLoading(false);
          setAuthStable(true);
          return;
        }

        console.log("📋 Session récupérée:", {
          hasSession: !!session,
          userId: session?.user?.id,
          expiresAt: session?.expires_at,
        });

        // Si on a une session valide, mettre à jour l'état
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

        setAuthStable(true);
      } catch (error) {
        console.error("❌ Erreur d'initialisation auth:", error);
        if (isMountedRef.current) {
          setAuthStable(true);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Écouter les changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      console.log("🔄 Changement d'état auth:", {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      });

      if (event === "SIGNED_IN") {
        console.log("🔐 Événement SIGNED_IN détecté");
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log("👤 Récupération du profil après SIGNED_IN");
          // Utiliser fetchProfile directement au lieu du debounce pour l'événement SIGNED_IN
          await fetchProfile(session.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 Événement SIGNED_OUT détecté");
        setUser(null);
        setProfile(null);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 Événement TOKEN_REFRESHED détecté");
        // Rafraîchir le profil seulement si nécessaire et si on a déjà un profil
        const currentProfile = profile;
        if (!currentProfile || currentProfile.id !== session.user.id) {
          debouncedFetchProfile(session.user.id);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchProfile, debouncedFetchProfile]);

  // Cleanup lors du démontage
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 Tentative de connexion pour:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Erreur de connexion:", error);
      } else {
        console.log("✅ Connexion réussie");
        console.log("📋 Données de session:", {
          user: data.user,
          session: data.session,
        });

        // Forcer la mise à jour immédiate de l'état
        if (data.user) {
          console.log("🔄 Mise à jour forcée de l'état utilisateur");
          console.log("🎯 Appel direct de fetchProfile pour:", data.user.id);
          try {
            await fetchProfile(data.user.id);
            console.log("✅ fetchProfile terminé avec succès");
            // Mettre à jour l'état utilisateur APRÈS avoir récupéré le profil
            setUser(data.user);
            // L'authentification est maintenant stable
            setLoading(false);
            setAuthStable(true);
          } catch (error) {
            console.error("❌ Erreur lors de fetchProfile:", error);
            // Même en cas d'erreur, on met à jour l'utilisateur
            setUser(data.user);
            setLoading(false);
            setAuthStable(true);
          }
        }
      }

      return { error };
    } catch (error) {
      console.error("❌ Erreur inattendue lors de la connexion:", error);
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
    referralCode?: string
  ) => {
    try {
      console.log("📝 Tentative d'inscription pour:", email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (!error && data.user) {
        console.log("✅ Inscription réussie, création du profil...");

        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          display_name: displayName || "",
          role: "buyer",
        });

        if (profileError) {
          console.error("❌ Erreur création profil:", profileError);
        } else {
          console.log("✅ Profil créé");

          // Traitement du code de parrainage si fourni
          if (referralCode) {
            try {
              console.log("🔗 Traitement du code de parrainage:", referralCode);
              
              // Vérifier si l'ambassadeur existe et est actif
              const { data: ambassador, error: ambassadorError } = await supabase
                .from('ambassadors')
                .select('id, user_id, commission_rate')
                .eq('referral_code', referralCode)
                .eq('is_active', true)
                .single();

              if (!ambassadorError && ambassador) {
                // Créer l'enregistrement de parrainage
                const { error: referralError } = await supabase
                  .from('referrals')
                  .insert({
                    ambassador_id: ambassador.id,
                    referred_user_id: data.user.id,
                    referral_date: new Date().toISOString(),
                    is_active: true,
                    total_earned: 0
                  });

                if (referralError) {
                  console.error("❌ Erreur création parrainage:", referralError);
                } else {
                  console.log("✅ Parrainage créé avec succès");
                }
              } else {
                console.error("❌ Code de parrainage invalide:", ambassadorError);
              }
            } catch (referralProcessError) {
              console.error("❌ Erreur traitement parrainage:", referralProcessError);
              // On ne fait pas échouer l'inscription pour autant
            }
          }
        }
      }

      return { error };
    } catch (error) {
      console.error("❌ Erreur inattendue lors de l'inscription:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 Déconnexion...");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Erreur de déconnexion:", error);
      } else {
        console.log("✅ Déconnexion réussie");
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("❌ Erreur inattendue lors de la déconnexion:", error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "Not authenticated" };

    try {
      console.log("📝 Mise à jour du profil...");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (!error) {
        console.log("✅ Profil mis à jour");
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      } else {
        console.error("❌ Erreur mise à jour profil:", error);
      }

      return { error };
    } catch (error) {
      console.error("❌ Erreur inattendue mise à jour profil:", error);
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      console.log("🔄 Rafraîchissement du profil...");
      await fetchProfile(user.id);
    } catch (error) {
      console.error("❌ Erreur rafraîchissement profil:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authStable,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
