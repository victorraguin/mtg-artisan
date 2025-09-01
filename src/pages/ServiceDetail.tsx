import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../lib/supabase";
import { MessageSquare, Clock, MapPin, Star, CheckCircle } from "lucide-react";
import {
  LoadingSpinner,
  Button,
  Card,
  CardHeader,
  CardContent,
} from "../components/UI";
import toast from "react-hot-toast";

export function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select(
          `
          *,
          shop:shops(*),
          category:categories(name)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("Service not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-light tracking-tight text-foreground mb-4">
          Service Not Found
        </h1>
        <Link
          to="/search"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          ← Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/search" className="hover:text-foreground transition-colors">
          Search
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{service.title}</span>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="p-8 bg-gradient-to-r from-primary/5 to-primary/10">
          <Link
            to={`/creator/${service.shop?.slug}`}
            className="flex items-center space-x-4 mb-6 group"
          >
            {service.shop?.logo_url ? (
              <img
                src={service.shop.logo_url}
                alt={service.shop.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xl font-medium text-muted-foreground">
                  {service.shop?.name?.[0]}
                </span>
              </div>
            )}
            <div>
              <div className="text-xl font-medium text-primary group-hover:text-primary/80 transition-colors">
                {service.shop?.name}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                {service.shop?.country && (
                  <>
                    <MapPin className="h-4 w-4 mr-1" />
                    {service.shop.country}
                  </>
                )}
                {service.shop?.rating_avg && (
                  <>
                    <span className="mx-2">•</span>
                    <Star className="h-4 w-4 mr-1 text-primary" />
                    {service.shop.rating_avg} ({service.shop.reviews_count || 0}{" "}
                    reviews)
                  </>
                )}
              </div>
            </div>
          </Link>

          <h1 className="text-3xl font-light tracking-tight text-foreground mb-4">
            {service.title}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {service.delivery_days} day delivery
            </div>
            {service.category?.name && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                {service.category.name}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Description */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-medium text-foreground mb-4">
                  About This Service
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* What's Included */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">
                  What's Included
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    Professional service delivery
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    Direct communication throughout the process
                  </div>
                  {service.requires_brief && (
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-primary mr-3" />
                      Detailed consultation and brief review
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-6">
                <div className="text-3xl font-light tracking-tight text-foreground mb-2">
                  ${service.base_price}
                </div>
                <div className="text-muted-foreground mb-6">Starting price</div>

                {service.requires_brief ? (
                  <div className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                      <div className="flex items-center text-primary mb-2">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Consultation Required
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This service requires a detailed brief. You'll work with
                        the creator to define your exact needs and receive a
                        custom quote.
                      </p>
                    </div>

                    <Button className="w-full" size="lg">
                      Request Quote
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button
                      onClick={() => toast.success("Service added to cart!")}
                      className="w-full"
                      size="lg"
                    >
                      Order Now
                    </Button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border/30">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    Delivery time: {service.delivery_days} days
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
