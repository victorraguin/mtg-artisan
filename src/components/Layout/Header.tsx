import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Sparkles, Shield, Palette, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const getDashboardRoute = () => {
    if (!profile) return '/dashboard/buyer';
    
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'creator':
        return '/dashboard/creator';
      case 'buyer':
      default:
        return '/dashboard/buyer';
    }
  };

  const getDashboardLabel = () => {
    if (!profile) return 'Dashboard';
    
    switch (profile.role) {
      case 'admin':
        return 'Admin Panel';
      case 'creator':
        return 'Creator Studio';
      case 'buyer':
      default:
        return 'My Orders';
    }
  };

  const getDashboardIcon = () => {
    if (!profile) return Package;
    
    switch (profile.role) {
      case 'admin':
        return Shield;
      case 'creator':
        return Palette;
      case 'buyer':
      default:
        return Package;
    }
  };

  const handleSignOut = async () => {
    try {
      setIsDropdownOpen(false);
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-lg md:text-xl font-bold text-foreground font-display">MTG Artisans</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for alters, tokens, services..."
                className="w-full bg-background border border-input pl-10 pr-4 py-2 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                  }
                }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-6 w-6" />
            </button>

            {user ? (
              <>
                <Link
                  to="/cart"
                  className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </Link>

                <div className="relative group">
                  <button 
                    className="flex items-center space-x-1 md:space-x-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <User className="h-6 w-6" />
                    <span className="hidden lg:inline text-sm">{profile?.display_name || 'Account'}</span>
                  </button>
                  
                  {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-popover rounded-lg shadow-lg border border-border z-50">
                    <div className="py-1">
                      {/* Admin specific links */}
                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      )}
                      
                      {/* Creator specific links */}
                      {(profile?.role === 'creator' || profile?.role === 'admin') && (
                        <>
                          <Link
                            to="/dashboard/creator"
                            className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Palette className="w-4 h-4 mr-2" />
                            Creator Studio
                          </Link>
                          <Link
                            to="/creator/shop"
                            className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Manage Shop
                          </Link>
                        </>
                      )}
                      
                      {/* Orders link for all authenticated users */}
                      <Link
                        to="/dashboard/buyer"
                        className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        My Orders
                      </Link>
                      
                      <hr className="border-border my-1" />
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Link>
                      <hr className="border-border my-1" />
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-1 md:space-x-2">
                <Link
                  to="/auth/signin"
                  className="text-muted-foreground hover:text-foreground transition-colors px-2 md:px-3 py-2 text-sm md:text-base"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for alters, tokens, services..."
              className="w-full bg-background border border-input pl-10 pr-4 py-2 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}