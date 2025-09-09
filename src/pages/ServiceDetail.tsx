import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../lib/supabase";
import { MessageSquare, Clock, MapPin, Star, CheckCircle } from "lucide-react";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import toast from "react-hot-toast";
import { t } from "i18next";

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
      toast.error(t("serviceDetail.notFound"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          Service Not Found
        </h1>
        <Link to="/search" className="text-purple-400 hover:text-purple-300">
          ← Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/search" className="hover:text-white">
          Search
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">{service.title}</span>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
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
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-xl font-medium text-gray-400">
                  {service.shop?.name?.[0]}
                </span>
              </div>
            )}
            <div>
              <div className="text-xl font-semibold text-purple-400 group-hover:text-purple-300">
                {service.shop?.name}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                {service.shop?.country && (
                  <>
                    <MapPin className="h-4 w-4 mr-1" />
                    {service.shop.country}
                  </>
                )}
                {service.shop?.rating_avg && (
                  <>
                    <span className="mx-2">•</span>
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {service.shop.rating_avg} ({service.shop.reviews_count || 0}{" "}
                    reviews)
                  </>
                )}
              </div>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-4">
            {service.title}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-gray-300">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {service.delivery_days} day delivery
            </div>
            {service.category?.name && (
              <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full">
                {service.category.name}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Description */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  About This Service
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* What's Included */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  What's Included
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    Professional service delivery
                  </div>
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    Direct communication throughout the process
                  </div>
                  {service.requires_brief && (
                    <div className="flex items-center text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                      Detailed consultation and brief review
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 sticky top-6">
                <div className="text-3xl font-bold text-white mb-2">
                  ${service.base_price}
                </div>
                <div className="text-gray-400 mb-6">Starting price</div>

                {service.requires_brief ? (
                  <div className="space-y-4">
                    <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center text-purple-400 mb-2">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Consultation Required
                      </div>
                      <p className="text-sm text-gray-300">
                        This service requires a detailed brief. You'll work with
                        the creator to define your exact needs and receive a
                        custom quote.
                      </p>
                    </div>

                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
                      Request Quote
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => toast.success(t("serviceDetail.addedToCart"))}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                    >
                      Order Now
                    </button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    Delivery time: {service.delivery_days} days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
