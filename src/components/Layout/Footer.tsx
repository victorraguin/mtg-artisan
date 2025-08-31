import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">MTG Artisans</span>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              The premier marketplace for Magic: The Gathering custom art, alters, tokens, 
              and professional services. Connect with talented artists worldwide.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search?category=Card+Alters" className="text-muted-foreground hover:text-foreground transition-colors">
                  Card Alters
                </Link>
              </li>
              <li>
                <Link to="/search?category=Custom+Tokens" className="text-muted-foreground hover:text-foreground transition-colors">
                  Custom Tokens
                </Link>
              </li>
              <li>
                <Link to="/search?category=Playmats" className="text-muted-foreground hover:text-foreground transition-colors">
                  Playmats
                </Link>
              </li>
              <li>
                <Link to="/search?type=service&category=Deckbuilding" className="text-muted-foreground hover:text-foreground transition-colors">
                  Deckbuilding Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/seller-guide" className="text-muted-foreground hover:text-foreground transition-colors">
                  Seller Guide
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 MTG Artisans. All rights reserved. Magic: The Gathering is a trademark of Wizards of the Coast.</p>
        </div>
      </div>
    </footer>
  );
}