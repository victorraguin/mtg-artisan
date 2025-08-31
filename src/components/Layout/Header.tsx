import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, Menu, X } from "lucide-react";
import { UserMenu } from "./UserMenu";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="glass border-b border-border/30 sticky top-0 z-50 h-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="text-xl font-light tracking-wider text-foreground group-hover:text-primary transition-colors duration-300">
              MTG ARTISANS
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/search"
              className="text-foreground/80 hover:text-primary transition-colors duration-300"
            >
              Marketplace
            </Link>
            <Link
              to="/search?type=services"
              className="text-foreground/80 hover:text-primary transition-colors duration-300"
            >
              Services
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Rechercher des créations..."
                className="w-full bg-card/50 border border-border/50 rounded-2xl pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-4">
            {/* User Menu - avec gestion d'erreur */}
            <UserMenu />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/30">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/search"
                className="text-foreground/80 hover:text-primary transition-colors duration-300 px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                to="/search?type=services"
                className="text-foreground/80 hover:text-primary transition-colors duration-300 px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
