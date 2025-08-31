import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

export function Cart() {
  const { items, loading, updateQuantity, removeFromCart, getTotal, getItemCount } = useCart();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4 font-display">Your Cart is Empty</h1>
        <p className="text-gray-400 mb-8">
          Discover amazing artwork and professional services from talented creators
        </p>
        <Link
          to="/search"
          className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Start Shopping
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    );
  }

  // Group items by shop
  const itemsByShop = items.reduce((acc, item) => {
    if (!acc[item.shop_id]) {
      acc[item.shop_id] = {
        shop_name: item.shop_name,
        items: [],
        total: 0
      };
    }
    acc[item.shop_id].items.push(item);
    acc[item.shop_id].total += item.unit_price * item.qty;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://draftsim.com/wp-content/uploads/2022/06/Gods-Demigods-Constellation-%E2%80%93-Jason-A.-Engle-1-1024x606.jpg"
          alt="MTG Cart Background"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/98 to-background"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 font-display">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(itemsByShop).map(([shopId, shop]: [string, any]) => (
              <div key={shopId} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {shop.shop_name}
                </h3>
                
                <div className="space-y-4">
                  {shop.items.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      {/* Image */}
                      <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.title}</h4>
                        <p className="text-gray-400 text-sm">
                          ${item.unit_price} each
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center text-white">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-lg font-semibold text-white w-20 text-right">
                        ${(item.unit_price * item.qty).toFixed(2)}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-700 mt-4 pt-4 flex justify-between">
                  <span className="text-gray-400">Shop Subtotal:</span>
                  <span className="font-semibold text-white">${shop.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Items ({getItemCount()})</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Platform Fee</span>
                  <span>${(getTotal() * 0.05).toFixed(2)}</span>
                </div>
                <hr className="border-gray-700" />
                <div className="flex justify-between text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>${(getTotal() * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <Link
                to="/search"
                className="block text-center text-purple-400 hover:text-purple-300 mt-4 text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}