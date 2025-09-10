import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import supabase from "../lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean; // charge l'état (session+profil)
  authStable: boolean; // garantit qu'un premier passage d'init a eu lieu
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
  const [authStable, setAuthStable] = useState(false);

  // Évite double initialisation en StrictMode
  const startedRef = useRef(false);
  // Évite requêtes profil concurrentes pour le même user
  const currentProfileFetchRef = useRef<Promise<void> | null>(null);
  // Annule proprement en cas d’unmount
  const aliveRef = useRef(true);

  // --- Utilitaire: fetch/ensure profile
  const fetchOrCreateProfile = async (userId: string): Promise<void> => {
    if (!aliveRef.current) return;

    // dédoublonnage simple
    if (currentProfileFetchRef.current) {
      await currentProfileFetchRef.current;
      return;
    }

    const run = (async () => {
      // 1) Tenter de lire
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!aliveRef.current) return;

      if (
        error &&
        (error.code === "PGRST116" || (error.message ?? "").includes("No rows"))
      ) {
        // 2) Créer si inexistant
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({ id: userId, display_name: "", role: "buyer" })
          .select()
          .single();

        if (!aliveRef.current) return;

        if (createError) {
          console.error("❌ Erreur création profil:", createError);
          setProfile(null);
          return;
        }
        setProfile(newProfile);
        return;
      }

      if (error) {
        console.error("❌ Erreur récupération profil:", error);
        setProfile(null);
        return;
      }

      setProfile(data ?? null);
    })();

    currentProfileFetchRef.current = run;
    try {
      await run;
    } finally {
      currentProfileFetchRef.current = null;
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    aliveRef.current = true;

    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      setLoading(true);

      // 1) Session initiale
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) console.error("❌ getSession error:", error);

      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        await fetchOrCreateProfile(nextUser.id);
      } else {
        setProfile(null);
      }

      setAuthStable(true);
      setLoading(false);

      // 2) Écoute des changements d’auth
      const { data: sub } = supabase.auth.onAuthStateChange(
        async (_event, nextSession) => {
          // IMPORTANT: on part du principe que cet event est la vérité -> on met à jour en premier
          const u = nextSession?.user ?? null;
          setUser(u);

          if (u) {
            setLoading(true);
            await fetchOrCreateProfile(u.id);
            setLoading(false);
          } else {
            setProfile(null);
            setLoading(false);
          }

          setAuthStable(true);
        }
      );

      unsubscribe = () => sub.subscription.unsubscribe();
    };

    init();

    return () => {
      aliveRef.current = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      // onAuthStateChange mettra à jour user+profile+loading
      if (error) {
        console.error("❌ Erreur de connexion:", error);
        setLoading(false); // on laisse pas spinner si erreur
        return { error };
      }
      return { error: null };
    } catch (error) {
      console.error("❌ Erreur inattendue lors de la connexion:", error);
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: displayName ? { display_name: displayName } : undefined,
          // emailRedirectTo: `${location.origin}/auth/callback`, // optionnel si magic link
        },
      });
      if (error) {
        console.error("❌ Erreur d'inscription:", error);
        setLoading(false);
        return { error };
      }
      // Selon ta config (confirmation email), l’utilisateur ne sera peut-être pas
      // "signed in" immédiatement. onAuthStateChange gérera le cas échéant.
      return { error: null };
    } catch (error) {
      console.error("❌ Erreur inattendue lors de l'inscription:", error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) console.error("❌ Erreur de déconnexion:", error);
      // onAuthStateChange remettra user/profile à null
    } catch (error) {
      console.error("❌ Erreur inattendue lors de la déconnexion:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      console.warn("⚠️ updateProfile sans user");
      return { error: "Not authenticated" };
    }
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) {
        console.error("❌ Erreur mise à jour profil:", error);
        return { error };
      }
      // Optimiste
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
      return { error: null };
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
        authStable,
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
