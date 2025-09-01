import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Package,
  Briefcase,
  ArrowUpRight,
  User,
} from "lucide-react";

export interface ArtistCardProps {
  artist: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    country: string | null;
    shop: {
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
      banner_url: string | null;
      rating_avg: number;
      is_verified: boolean;
    };
    products_count: number;
    services_count: number;
    total_rating: number;
  };
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const totalCreations = artist.products_count + artist.services_count;
  const rating = artist.total_rating || 0;
  const hasRating = rating > 0;

  return (
    <Link
      to={`/creator/${artist.shop.slug}`}
      className="group bg-card rounded-3xl overflow-hidden border border-border/30 hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 relative min-w-[320px] max-w-[380px] flex-shrink-0"
    >
      {/* Banner/Header */}
      <div className="h-32 bg-muted relative overflow-hidden">
        {artist.shop.banner_url ? (
          <img
            src={artist.shop.banner_url}
            alt={`Bannière de ${artist.shop.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {/* Badge Vérifié */}
        {artist.shop.is_verified && (
          <div className="absolute top-4 right-4">
            <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Vérifié
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 relative">
        {/* Avatar et nom */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0">
            {artist.avatar_url ? (
              <img
                src={artist.avatar_url}
                alt={artist.display_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-border/50 group-hover:border-primary/30 transition-colors duration-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-muted border-2 border-border/50 group-hover:border-primary/30 transition-colors duration-300 flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-light text-foreground mb-1 truncate">
              {artist.display_name}
            </h3>
            <p className="text-sm text-muted-foreground/70 truncate">
              {artist.shop.name}
            </p>
          </div>
        </div>

        {/* Bio */}
        {artist.bio && (
          <p className="text-muted-foreground/80 text-sm leading-relaxed mb-4 line-clamp-2">
            {artist.bio}
          </p>
        )}

        {/* Stats et localisation */}
        <div className="space-y-3">
          {/* Localisation */}
          {artist.country && (
            <div className="flex items-center text-sm text-muted-foreground/70">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              {artist.country}
            </div>
          )}

          {/* Statistiques */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground/70">
                  {artist.products_count} produits
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground/70">
                  {artist.services_count} services
                </span>
              </div>
            </div>

            {/* Note */}
            {hasRating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-primary fill-current" />
                <span className="text-sm font-medium text-foreground">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRight className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Link>
  );
}
