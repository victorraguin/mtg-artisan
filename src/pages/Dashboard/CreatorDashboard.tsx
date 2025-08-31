import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, Package, Briefcase, DollarSign, TrendingUp } from 'lucide-react';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';

export function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [stats, setStats] = useState({
    products: 0,
    services: 0,
    orders: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCreatorData();
    }
  }, [user]);

  const fetchCreatorData = async () => {
    try {
      // Fetch shop
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      setShop(shopData);

      if (shopData) {
        // Fetch stats
        const [productsResult, servicesResult, ordersResult] = await Promise.all([
          supabase.from('products').select('id').eq('shop_id', shopData.id),
          supabase.from('services').select('id').eq('shop_id', shopData.id),
          supabase.from('order_items').select('*, orders(*)').eq('shop_id', shopData.id)
        ]);

        const revenue = ordersResult.data?.reduce((sum, item) => 
          sum + (item.unit_price * item.qty), 0) || 0;

        setStats({
          products: productsResult.data?.length || 0,
          services: servicesResult.data?.length || 0,
          orders: ordersResult.data?.length || 0,
          revenue
        });

        setRecentOrders(ordersResult.data?.slice(0, 5) || []);
      }
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
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Welcome to Creator Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Set up your shop to start selling your amazing artwork and services
        </p>
        <Link
          to="/creator/shop"
          className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Your Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images3.alphacoders.com/558/558484.jpg"
          alt="MTG Creator Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/98 to-background"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white font-display">Creator Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            to="/creator/products/new"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Link>
          <Link
            to="/creator/services/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Service
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Products</p>
              <p className="text-2xl font-bold text-white">{stats.products}</p>
            </div>
            <Package className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Services</p>
              <p className="text-2xl font-bold text-white">{stats.services}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Orders</p>
              <p className="text-2xl font-bold text-white">{stats.orders}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-white">${stats.revenue.toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Orders</h2>
        
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((item) => (
              <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Order Item #{item.id.slice(0, 8)}</h3>
                    <p className="text-gray-400 text-sm">
                      Qty: {item.qty} • ${item.unit_price} each
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      ${(item.unit_price * item.qty).toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${
                      item.status === 'completed' ? 'text-green-400' : 
                      item.status === 'shipped' ? 'text-blue-400' : 'text-yellow-400'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}