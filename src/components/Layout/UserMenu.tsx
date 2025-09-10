import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Shield,
  Palette,
  Package,
  LogOut,
  Store,
  LogIn,
  UserPlus,
  Users,
  Brush,
  Receipt,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import supabase from "../../lib/supabase";

export function UserMenu() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasShop, setHasShop] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Gestion d'erreur pour useAuth
  let user: any = null;
  let profile: any = null;
  let signOut: any = () => Promise.resolve();
  let getItemCount: () => number = () => 0;

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

  // Vérifier si l'utilisateur a une boutique
  useEffect(() => {
    const checkShop = async () => {
      if (user && profile?.role === "creator") {
        try {
          const { data } = await supabase
            .from("shops")
            .select("id")
            .eq("owner_id", user.id)
            .maybeSingle();
          setHasShop(!!data);
        } catch (error) {
          console.error(
            "Erreur lors de la vérification de la boutique:",
            error
          );
        }
      }
    };

    checkShop();
  }, [user, profile]);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDashboardRoute = () => {
    if (!profile) return "/dashboard/buyer";

    switch (profile.role) {
      case "admin":
        return "/admin";
      case "creator":
        return hasShop ? "/dashboard/creator" : "/creator/shop";
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
        return hasShop ? "Creator Studio" : "Studio Créateur";
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
        return hasShop ? Palette : Store;
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
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Link
          to="/auth/signin"
          className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300 px-3 sm:px-4 py-2 text-sm font-light rounded-xl hover:bg-card/50"
        >
          <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Se connecter</span>
        </Link>
        <Link
          to="/auth/signup"
          className="gradient-border rounded-xl overflow-hidden"
        >
          <span className="block px-4 sm:px-6 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-300 flex items-center space-x-2">
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">S'inscrire</span>
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
      <div className="relative" ref={dropdownRef}>
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

              {/* Creator Studio for creators */}
              {(profile?.role === "creator" || profile?.role === "admin") && (
                <Link
                  to="/dashboard/creator"
                  className="flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Brush className="w-4 h-4 mr-3 text-primary" />
                  Studio Créateur
                </Link>
              )}

              {/* My Purchases for all authenticated users */}
              <Link
                to="/orders"
                className="flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Receipt className="w-4 h-4 mr-3 text-primary" />
                Mes Achats
              </Link>

              {/* Ambassador Dashboard link for all authenticated users */}
              <Link
                to="/ambassador"
                className="flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Users className="w-4 h-4 mr-3 text-primary" />
                Programme Ambassadeur
              </Link>

              {/* Creator Program link for buyers */}
              {profile?.role === "buyer" && (
                <Link
                  to="/creator-program"
                  className="flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Palette className="w-4 h-4 mr-3 text-primary" />
                  Devenir Artisan
                </Link>
              )}

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
