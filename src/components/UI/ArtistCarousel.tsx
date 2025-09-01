import React, { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Star,
  Package,
  Briefcase,
} from "lucide-react";
import { ArtistCard } from "../Cards/ArtistCard";
import { usePopularArtists } from "../../hooks/usePopularArtists";
import { LoadingSpinner } from "./LoadingSpinner";

export function ArtistCarousel() {
  const { artists, loading, error } = usePopularArtists(8);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // Largeur approximative de 2 cartes
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Fallback si pas d'artistes ou erreur
  if (error || !artists.length) {
    return (
      <div className="text-center py-16">
        <div className="glass w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border/50">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-light text-foreground mb-3">
          {error ? "Erreur de chargement" : "Aucun artiste disponible"}
        </h3>
        <p className="text-muted-foreground/70 max-w-md mx-auto">
          {error
            ? "Impossible de charger les artistes populaires pour le moment."
            : "Les artistes populaires apparaîtront ici une fois qu'ils auront rejoint la plateforme."}
        </p>

        {/* Fallback avec des cartes d'exemple */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center group">
            <div className="glass w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto border border-primary/20">
              <Star className="w-10 h-10 text-primary" />
            </div>
            <h4 className="text-lg font-light text-foreground mb-2">
              Artistes Vérifiés
            </h4>
            <p className="text-muted-foreground/70 text-sm">
              Tous nos artistes sont des professionnels qualifiés
            </p>
          </div>

          <div className="text-center group">
            <div className="glass w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto border border-primary/20">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h4 className="text-lg font-light text-foreground mb-2">
              Créations Uniques
            </h4>
            <p className="text-muted-foreground/70 text-sm">
              Des œuvres d'art personnalisées et originales
            </p>
          </div>

          <div className="text-center group">
            <div className="glass w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto border border-primary/20">
              <Briefcase className="w-10 h-10 text-primary" />
            </div>
            <h4 className="text-lg font-light text-foreground mb-2">
              Services Premium
            </h4>
            <p className="text-muted-foreground/70 text-sm">
              Expertise et qualité garanties
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Boutons de navigation */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/90 backdrop-blur-sm border border-border/50 rounded-full flex items-center justify-center text-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 hover:opacity-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/90 backdrop-blur-sm border border-border/50 rounded-full flex items-center justify-center text-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 hover:opacity-100"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Container de défilement */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex space-x-6 overflow-x-auto scrollbar-hide pb-6 px-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>

      {/* Indicateurs de défilement */}
      <div className="flex justify-center space-x-2 mt-6">
        {artists.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-border/50 transition-all duration-300"
          />
        ))}
      </div>
    </div>
  );
}

// Masquer la scrollbar pour Webkit
const style = document.createElement("style");
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(style);
