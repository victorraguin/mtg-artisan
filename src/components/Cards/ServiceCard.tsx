import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Clock, MapPin, Star } from "lucide-react";

interface ServiceCardProps {
  service: any;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link to={`/service/${service.id}`} className="group">
      <div className="bg-card rounded-3xl border border-border/30 hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            {service.shop?.logo_url ? (
              <img
                src={service.shop.logo_url}
                alt={service.shop.name}
                className="w-12 h-12 rounded-2xl object-cover border border-border/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/30">
                <span className="text-lg font-light text-muted-foreground/60">
                  {service.shop?.name?.[0]}
                </span>
              </div>
            )}
            <div className="ml-4 min-w-0">
              <div className="text-sm font-medium text-primary/80 truncate">
                {service.shop?.name}
              </div>
              {service.shop?.country && (
                <div className="flex items-center text-xs text-muted-foreground/60 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {service.shop.country}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-light text-card-foreground">
              À partir de ${service.base_price}
            </div>
            <div className="flex items-center text-xs text-muted-foreground/60 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {service.delivery_days} jours
            </div>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-light text-card-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-relaxed">
          {service.title}
        </h3>

        <p className="text-muted-foreground/80 text-sm line-clamp-3 mb-4 leading-relaxed">
          {service.description}
        </p>

        {/* Features */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-muted-foreground/70">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {service.requires_brief
                ? "Consultation requise"
                : "Commande rapide"}
            </span>
            <span className="sm:hidden">
              {service.requires_brief ? "Consult" : "Rapide"}
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground/70">
            <Star className="h-4 w-4 mr-2 text-primary/60" />
            {service.shop?.rating_avg || "Nouveau"}
          </div>
        </div>

        {/* Category */}
        {service.category && (
          <div className="pt-4 border-t border-border/30">
            <span className="bg-muted/50 text-muted-foreground/80 text-xs px-3 py-1.5 rounded-full font-light border border-border/30">
              {service.category.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
