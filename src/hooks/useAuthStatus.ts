import { useAuth } from "../contexts/AuthContext";

export interface AuthStatus {
  isAuthenticated: boolean;
  isCreator: boolean;
  isAdmin: boolean;
  isBuyer: boolean;
  isLoading: boolean;
  isAuthStable: boolean;
  user: any;
  profile: any;
}

export function useAuthStatus(): AuthStatus {
  const { user, profile, loading, authStable } = useAuth();

  return {
    isAuthenticated: !!user && !!profile,
    isCreator: profile?.role === "creator",
    isAdmin: profile?.role === "admin",
    isBuyer: profile?.role === "buyer",
    isLoading: loading,
    isAuthStable: authStable,
    user,
    profile,
  };
}
