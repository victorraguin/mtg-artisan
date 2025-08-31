import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Clock, MapPin, Star, ArrowLeft, Share } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shop:shops(*),
          category:categories(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({
        item_type: 'product',
        item_id: product.id,
        qty: quantity,
        unit_price: product.price,
        currency: product.currency,
        metadata: {},
        title: product.title,
        image_url: product.images?.[0] || '',
        shop_name: product.shop?.name || '',
        shop_id: product.shop_id
      });
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
        <Link to="/search" className="text-purple-400 hover:text-purple-300">
          ← Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-xs md:text-sm text-gray-400 mb-4 md:mb-6 overflow-x-auto">
        <Link to="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/search" className="hover:text-white">Search</Link>
        <span className="mx-2">/</span>
        <span className="text-white truncate">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-800 rounded-lg md:rounded-xl overflow-hidden border border-gray-700">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images?.length > 1 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-800 rounded-md md:rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-purple-500' : 'border-gray-700'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">{product.title}</h1>
            
            {/* Shop Info */}
            <Link
              to={`/creator/${product.shop?.slug}`}
              className="flex items-center space-x-3 mb-4 md:mb-6 group"
            >
              {product.shop?.logo_url ? (
                <img
                  src={product.shop.logo_url}
                  alt={product.shop.name}
                  className="w-10 md:w-12 h-10 md:h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-base md:text-lg font-medium text-gray-400">
                    {product.shop?.name?.[0]}
                  </span>
                </div>
              )}
              <div>
                <div className="text-base md:text-lg font-medium text-purple-400 group-hover:text-purple-300">
                  {product.shop?.name}
                </div>
                <div className="flex items-center text-xs md:text-sm text-gray-400">
                  {product.shop?.country && (
                    <>
                      <MapPin className="h-3 w-3 mr-1" />
                      {product.shop.country}
                    </>
                  )}
                  {product.shop?.rating_avg && (
                    <>
                      <span className="mx-2">•</span>
                      <Star className="h-3 w-3 mr-1 text-yellow-500" />
                      {product.shop.rating_avg}
                    </>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Price & Stock */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700">
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">
              ${product.price} {product.currency}
            </div>
            
            {product.stock !== null && (
              <div className="text-sm text-gray-400 mb-4">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </div>
            )}

            {product.lead_time_days && (
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <Clock className="h-4 w-4 mr-2" />
                Ships in {product.lead_time_days} days
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quantity
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full md:w-auto bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  {Array.from({ length: Math.min(product.stock || 10, 10) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 md:py-4 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm md:text-base"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-3">Description</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {product.description}
            </p>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-gray-700 text-gray-300 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-3">Details</h3>
              <div className="space-y-2">
                {Object.entries(product.attributes).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-400 capitalize flex-shrink-0 mr-4">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="text-white text-right">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}