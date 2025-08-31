import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Github, Twitter, MessageCircle, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="glass border-t border-border/30 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span className="text-xl font-light tracking-wider text-foreground group-hover:text-primary transition-colors duration-300">
                MTG ARTISANS
              </span>
            </Link>
            <p className="text-muted-foreground/80 max-w-md leading-relaxed text-sm">
              La marketplace de référence pour l'art personnalisé Magic: The
              Gathering, les alters, tokens et services professionnels.
              Connectez-vous avec des artistes talentueux du monde entier.
            </p>
            <div className="flex space-x-4 mt-8">
              <a
                href="#"
                className="text-muted-foreground/60 hover:text-primary transition-colors duration-300 p-2 rounded-xl hover:bg-card/50"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground/60 hover:text-primary transition-colors duration-300 p-2 rounded-xl hover:bg-card/50"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground/60 hover:text-primary transition-colors duration-300 p-2 rounded-xl hover:bg-card/50"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-foreground font-light text-lg mb-6 tracking-wide">
              Marketplace
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/search?category=Card+Alters"
                  className="text-muted-foreground/70 hover:text-primary transition-colors duration-300 text-sm"
                >
                  Card Alters
                </Link>
              </li>
              <li>
                <Link
                  to="/search?category=Custom+Tokens"
                  className="text-muted-foreground/70 hover:text-primary transition-colors duration-300 text-sm"
                >
                  Custom Tokens
                </Link>
              </li>
              <li>
                <Link
                  to="/search?category=Playmats"
                  className="text-muted-foreground/70 hover:text-primary transition-colors duration-300 text-sm"
                >
                  Playmats
                </Link>
              </li>
              <li>
                <Link
                  to="/search?type=service&category=Deckbuilding"
                  className="text-muted-foreground/70 hover:text-primary transition-colors duration-300 text-sm"
                >
                  Services de Deckbuilding
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-foreground font-light text-lg mb-6 tracking-wide">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/help"
                  className="text-muted-foreground/70 hover:text-primary transition-colors duration-300 text-sm"
                >
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link
                  to="/seller-guide"
                  className="text-muted-foreground/70 hover:text-primary transition-colors duration-300 text-sm"
                >
                  Guide du vendeur
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground/70 hover:text-primary transition-colors duration-300 text-sm"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground/70 hover:text-primary transition-colors duration-300 text-sm"
                >
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 mt-12 pt-8 text-center">
          <p className="text-muted-foreground/60 text-sm">
            &copy; 2025 MTG Artisans. Tous droits réservés.
            <span className="mx-2">•</span>
            Magic: The Gathering est une marque déposée de Wizards of the Coast.
            <span className="mx-2">•</span>
            Fait avec <Heart className="inline h-4 w-4 text-primary/60" /> par
            des passionnés
          </p>
        </div>
      </div>
    </footer>
  );
}
