import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Package, Briefcase, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalProducts: 0,
    totalServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingReviews: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [
        usersResult,
        creatorsResult,
        productsResult,
        servicesResult,
        ordersResult
      ] = await Promise.all([
        supabase.from('profiles').select('id'),
        supabase.from('profiles').select('id').eq('role', 'creator'),
        supabase.from('products').select('id'),
        supabase.from('services').select('id'),
        supabase.from('orders').select('*, order_items(*)')
      ]);

      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + order.total, 0) || 0;

      setStats({
        totalUsers: usersResult.data?.length || 0,
        totalCreators: creatorsResult.data?.length || 0,
        totalProducts: productsResult.data?.length || 0,
        totalServices: servicesResult.data?.length || 0,
        totalOrders: ordersResult.data?.length || 0,
        totalRevenue,
        pendingReviews: 0
      });

      setRecentOrders(ordersResult.data?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Creators</p>
              <p className="text-2xl font-bold text-white">{stats.totalCreators}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Products</p>
              <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Services</p>
              <p className="text-2xl font-bold text-white">{stats.totalServices}</p>
            </div>
            <Briefcase className="h-8 w-8 text-cyan-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Orders</p>
              <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Orders</h2>
          
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentOrders.map((order) => (
                <div key={order.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        ${order.total.toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {order.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Moderation Queue */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Moderation Queue</h2>
          
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center text-yellow-400 mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                Pending Reviews
              </div>
              <p className="text-sm text-gray-300">
                {stats.pendingReviews} items awaiting moderation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}