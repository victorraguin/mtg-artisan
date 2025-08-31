import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Clock, MapPin } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addToCart({
        item_type: 'product',
        item_id: product.id,
        qty: 1,
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

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-card rounded-xl md:rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
        {/* Image */}
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {product.type === 'digital' && (
            <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
              Digital
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          
          <div className="flex items-center text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
            <span className="font-medium text-primary">{product.shop?.name}</span>
            {product.shop?.country && (
              <>
                <span className="mx-2">•</span>
                <MapPin className="h-3 w-3 mr-1" />
                {product.shop.country}
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg md:text-xl font-bold text-card-foreground">
                ${product.price}
              </div>
              {product.lead_time_days && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {product.lead_time_days} days
                </div>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
            >
              <ShoppingCart className="h-4 md:h-5 w-4 md:w-5" />
            </button>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 md:mt-3">
              {product.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full truncate max-w-20 md:max-w-none"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-muted-foreground text-xs">+{product.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}