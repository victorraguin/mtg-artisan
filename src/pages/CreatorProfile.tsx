import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Star, Calendar, Package, Briefcase } from 'lucide-react';
import { ProductCard } from '../components/Cards/ProductCard';
import { ServiceCard } from '../components/Cards/ServiceCard';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

export function CreatorProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (slug) {
      fetchCreatorData();
    }
  }, [slug]);

  const fetchCreatorData = async () => {
    try {
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('slug', slug)
        .single();

      if (shopError) throw shopError;
      setShop(shopData);

      // Fetch products and services
      const [productsResult, servicesResult] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(name)')
          .eq('shop_id', shopData.id)
          .eq('status', 'active'),
        supabase
          .from('services')
          .select('*, category:categories(name)')
          .eq('shop_id', shopData.id)
          .eq('status', 'active')
      ]);

      setProducts(productsResult.data?.map(p => ({ ...p, shop: shopData })) || []);
      setServices(servicesResult.data?.map(s => ({ ...s, shop: shopData })) || []);
    } catch (error) {
      console.error('Error fetching creator data:', error);
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

  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white">Shop Not Found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Shop Header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
        {/* Banner */}
        {shop.banner_url && (
          <div className="h-48 bg-gray-700">
            <img
              src={shop.banner_url}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start space-x-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {shop.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={shop.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-700 border-4 border-gray-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">
                    {shop.name[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Shop Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{shop.name}</h1>
                {shop.is_verified && (
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    Verified
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 text-gray-400 mb-4">
                {shop.country && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {shop.country}
                  </div>
                )}
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {shop.rating_avg || 'New'} rating
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Member since {new Date(shop.created_at).getFullYear()}
                </div>
              </div>

              {shop.bio && (
                <p className="text-gray-300 leading-relaxed">{shop.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
            activeTab === 'products'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Package className="h-5 w-5 mr-2" />
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
            activeTab === 'services'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Briefcase className="h-5 w-5 mr-2" />
          Services ({services.length})
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'products' ? (
          products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No products available</p>
            </div>
          )
        ) : (
          services.length > 0 ? (
            services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No services available</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}