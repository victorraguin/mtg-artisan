import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, MapPin, Star } from 'lucide-react';

interface ServiceCardProps {
  service: any;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link to={`/service/${service.id}`} className="group">
      <div className="bg-card rounded-xl md:rounded-2xl border border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl p-4 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {service.shop?.logo_url ? (
              <img
                src={service.shop.logo_url}
                alt={service.shop.name}
                className="w-8 md:w-10 h-8 md:h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                  {service.shop?.name?.[0]}
                </span>
              </div>
            )}
            <div className="ml-2 md:ml-3 min-w-0">
              <div className="text-xs md:text-sm font-medium text-primary truncate">
                {service.shop?.name}
              </div>
              {service.shop?.country && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {service.shop.country}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-base md:text-lg font-bold text-card-foreground">
              From ${service.base_price}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {service.delivery_days} days
            </div>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-base md:text-lg font-semibold text-card-foreground mb-2 md:mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {service.title}
        </h3>
        
        <p className="text-muted-foreground text-xs md:text-sm line-clamp-3 mb-3 md:mb-4 leading-relaxed">
          {service.description}
        </p>

        {/* Features */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs md:text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{service.requires_brief ? 'Consultation required' : 'Quick order'}</span>
            <span className="sm:hidden">{service.requires_brief ? 'Consult' : 'Quick'}</span>
          </div>
          
          <div className="flex items-center text-xs md:text-sm text-muted-foreground">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            {service.shop?.rating_avg || 'New'}
          </div>
        </div>

        {/* Category */}
        {service.category && (
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
            <span className="bg-muted text-muted-foreground text-xs px-2 md:px-3 py-1 rounded-full">
              {service.category.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}