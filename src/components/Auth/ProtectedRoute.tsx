import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../UI/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "buyer" | "creator" | "admin";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, profile, loading, authStable } = useAuth();

  // 👈 AJOUT : Debug pour voir l'état
  console.log("🛡️ ProtectedRoute check:", {
    hasUser: !!user,
    hasProfile: !!profile,
    userRole: profile?.role,
    requiredRole,
    loading,
    authStable,
  });

  // Attendre que l'auth soit stable ET que le loading soit fini
  if (loading || !authStable) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <div className="ml-4 text-muted-foreground">
          Vérification de l'authentification...
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur après que l'auth soit stable
  if (!user) {
    console.log("🚫 No user, redirecting to signin");
    return <Navigate to="/auth/signin" replace />;
  }

  // Si un rôle spécifique est requis
  if (requiredRole) {
    // Attendre d'avoir le profil si on a un user
    if (!profile) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner size="lg" />
          <div className="ml-4 text-muted-foreground">
            Chargement du profil...
          </div>
        </div>
      );
    }

    // Vérifier le rôle
    if (profile.role !== requiredRole) {
      console.log(`🚫 Role mismatch: ${profile.role} !== ${requiredRole}`);
      return <Navigate to="/" replace />;
    }
  }

  console.log("✅ ProtectedRoute: Access granted");
  return <>{children}</>;
}
