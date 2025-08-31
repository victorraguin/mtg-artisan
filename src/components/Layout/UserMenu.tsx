import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Shield,
  Palette,
  Package,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

export function UserMenu() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Gestion d'erreur pour useAuth
  let user, profile, signOut;
  let getItemCount;

  try {
    const auth = useAuth();
    user = auth.user;
    profile = auth.profile;
    signOut = auth.signOut;
  } catch (error) {
    // Si useAuth n'est pas disponible, on utilise des valeurs par défaut
    user = null;
    profile = null;
    signOut = () => Promise.resolve();
  }

  try {
    const cart = useCart();
    getItemCount = cart.getItemCount;
  } catch (error) {
    getItemCount = () => 0;
  }

  const getDashboardRoute = () => {
    if (!profile) return "/dashboard/buyer";

    switch (profile.role) {
      case "admin":
        return "/admin";
      case "creator":
        return "/dashboard/creator";
      case "buyer":
      default:
        return "/dashboard/buyer";
    }
  };

  const getDashboardLabel = () => {
    if (!profile) return "Dashboard";

    switch (profile.role) {
      case "admin":
        return "Admin Panel";
      case "creator":
        return "Creator Studio";
      case "buyer":
      default:
        return "Mes Commandes";
    }
  };

  const getDashboardIcon = () => {
    if (!profile) return Package;

    switch (profile.role) {
      case "admin":
        return Shield;
      case "creator":
        return Palette;
      case "buyer":
      default:
        return Package;
    }
  };

  const handleSignOut = async () => {
    try {
      setIsDropdownOpen(false);
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Link
          to="/auth/signin"
          className="text-muted-foreground hover:text-primary transition-colors duration-300 px-4 py-2 text-sm font-light"
        >
          Se connecter
        </Link>
        <Link
          to="/auth/signup"
          className="gradient-border rounded-xl overflow-hidden"
        >
          <span className="block px-6 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-300">
            S'inscrire
          </span>
        </Link>
      </div>
    );
  }

  const DashboardIcon = getDashboardIcon();

  return (
    <div className="flex items-center space-x-2">
      {/* Cart */}
      <Link
        to="/cart"
        className="relative p-3 text-muted-foreground hover:text-primary transition-colors duration-300 rounded-xl hover:bg-card/50"
      >
        <ShoppingCart className="h-5 w-5" />
        {getItemCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium animate-pulse">
            {getItemCount()}
          </span>
        )}
      </Link>

      {/* User Menu */}
      <div className="relative">
        <button
          className="flex items-center space-x-2 p-3 text-muted-foreground hover:text-primary transition-colors duration-300 rounded-xl hover:bg-card/50"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <User className="h-5 w-5" />
          <span className="hidden xl:inline text-sm font-light">
            {profile?.display_name || "Compte"}
          </span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-3 w-64 glass rounded-2xl shadow-2xl border border-border/30 z-50 overflow-hidden">
            <div className="py-2">
              {/* Admin specific links */}
              {profile?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Shield className="w-4 h-4 mr-3 text-primary" />
                  Admin Panel
                </Link>
              )}

              {/* Creator specific links */}
              {(profile?.role === "creator" || profile?.role === "admin") && (
                <>
                  <Link
                    to="/dashboard/creator"
                    className="flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Palette className="w-4 h-4 mr-3 text-primary" />
                    Studio Créateur
                  </Link>
                  <Link
                    to="/creator/shop"
                    className="flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Package className="w-4 h-4 mr-3 text-primary" />
                    Gérer la Boutique
                  </Link>
                </>
              )}

              {/* Orders link for all authenticated users */}
              <Link
                to="/dashboard/buyer"
                className="flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                <DashboardIcon className="w-4 h-4 mr-3 text-primary" />
                {getDashboardLabel()}
              </Link>

              <hr className="border-border/30 my-2" />
              <Link
                to="/profile"
                className="flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User className="w-4 h-4 mr-3" />
                Paramètres du Profil
              </Link>
              <hr className="border-border/30 my-2" />
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-3 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-3 inline" />
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
