import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import { supabase, withRetry } from "../lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔍 Initialisation de l'authentification...");
        
        const { data: { session }, error } = await withRetry(
          () => supabase.auth.getSession(),
          2,
          5000
        );
        
        if (error) {
          console.error("❌ Erreur lors de la récupération de la session:", error);
          setLoading(false);
          return;
        }
        
        console.log("📋 Session récupérée:", { hasSession: !!session, userId: session?.user?.id });
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("❌ Erreur d'initialisation auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Écouter les changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Changement d'état auth:", { event, hasSession: !!session });
      
      if (event === "SIGNED_IN") {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Rafraîchir le profil seulement si nécessaire
        if (!profile || profile.id !== session.user.id) {
          await fetchProfile(session.user.id);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("👤 Récupération du profil pour:", userId);
      
      const { data, error } = await withRetry(
        () => supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single(),
        2,
        8000
      );
      
      if (error) {
        console.error("❌ Erreur profil:", error);
        throw error;
      }
      
      console.log("✅ Profil récupéré:", { displayName: data?.display_name, role: data?.role });
      setProfile(data);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du profil:", error);
      // Ne pas bloquer l'app si le profil n'existe pas
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 Tentative de connexion pour:", email);
      
      const { data, error } = await withRetry(
        () => supabase.auth.signInWithPassword({ email, password }),
        2,
        8000
      );
      
      if (error) {
        console.error("❌ Erreur de connexion:", error);
      } else {
        console.log("✅ Connexion réussie");
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
    displayName?: string
  ) => {
    try {
      console.log("📝 Tentative d'inscription pour:", email);
      
      const { data, error } = await withRetry(
        () => supabase.auth.signUp({ email, password }),
        2,
        8000
      );
      
      if (!error && data.user) {
        console.log("✅ Inscription réussie, création du profil...");
        
        const { error: profileError } = await withRetry(
          () => supabase.from("profiles").insert({
            id: data.user.id,
            display_name: displayName || "",
            role: "buyer",
          }),
          2,
          8000
        );
        
        if (profileError) {
          console.error("❌ Erreur création profil:", profileError);
        } else {
          console.log("✅ Profil créé");
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
      
      const { error } = await withRetry(
        () => supabase.auth.signOut(),
        2,
        5000
      );
      
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
      
      const { error } = await withRetry(
        () => supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id),
        2,
        8000
      );
      
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

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
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