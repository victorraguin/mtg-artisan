import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, Clock, CheckCircle, MessageSquare, Star } from 'lucide-react';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';

export function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            shop:shops(name, slug)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <Package className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'processing':
        return 'text-yellow-400';
      case 'completed':
        return 'text-green-400';
      case 'shipped':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://draftsim.com/wp-content/uploads/2022/05/Alseid-of-Lifes-Bounty-Illustration-by-Magali-Villeneuve.jpg"
          alt="MTG Dashboard Background"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/98 to-background"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 font-display">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2 font-display">No Orders Yet</h2>
          <p className="text-gray-400 mb-6">
            Start exploring to discover amazing artwork and services
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    ${order.total.toFixed(2)}
                  </div>
                  <div className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{item.title || 'Item'}</h4>
                        <p className="text-gray-400 text-sm">
                          From {item.shop?.name} • Qty: {item.qty}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(item.status)}
                        <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {item.status === 'completed' && (
                      <div className="flex items-center space-x-4 mt-4">
                        <button className="flex items-center text-purple-400 hover:text-purple-300 text-sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message Seller
                        </button>
                        <button className="flex items-center text-yellow-400 hover:text-yellow-300 text-sm">
                          <Star className="h-4 w-4 mr-1" />
                          Leave Review
                        </button>
                      </div>
                    )}

                    {/* Tracking Info */}
                    {item.tracking && (
                      <div className="mt-3 p-3 bg-gray-600 rounded-lg">
                        <p className="text-sm text-gray-300">
                          <strong>Tracking:</strong> {item.tracking}
                        </p>
                      </div>
                    )}

                    {/* Delivery Info */}
                    {item.delivery_due_at && (
                      <div className="mt-2 text-sm text-gray-400">
                        Expected delivery: {new Date(item.delivery_due_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}