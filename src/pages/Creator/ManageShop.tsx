import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export function ManageShop() {
  const { user } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    bio: '',
    country: '',
    policies: '',
    paypal_email: ''
  });

  useEffect(() => {
    if (user) {
      fetchShop();
    }
  }, [user]);

  const fetchShop = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (data) {
        setShop(data);
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          bio: data.bio || '',
          country: data.country || '',
          policies: data.policies || '',
          paypal_email: data.paypal_email || ''
        });
      }
    } catch (error) {
      console.log('No shop found, will create new one');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (shop) {
        // Update existing shop
        const { error } = await supabase
          .from('shops')
          .update(formData)
          .eq('id', shop.id);

        if (error) throw error;
        toast.success('Shop updated successfully!');
      } else {
        // Create new shop
        const { error } = await supabase
          .from('shops')
          .insert({
            owner_id: user?.id,
            ...formData
          });

        if (error) throw error;
        toast.success('Shop created successfully!');
        await fetchShop();
      }
    } catch (error: any) {
      console.error('Error saving shop:', error);
      toast.error(error.message || 'Failed to save shop');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        {shop ? 'Manage Shop' : 'Create Your Shop'}
      </h1>

      <form onSubmit={handleSave} className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shop Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Shop Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Your shop name"
            />
          </div>

          {/* Shop Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
              Shop URL *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                /creator/
              </span>
              <input
                type="text"
                id="slug"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-20 pr-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="my-shop"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
              Country
            </label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="">Select Country</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
              <option value="Australia">Australia</option>
            </select>
          </div>

          {/* PayPal Email */}
          <div>
            <label htmlFor="paypal_email" className="block text-sm font-medium text-gray-300 mb-2">
              PayPal Email
            </label>
            <input
              type="email"
              id="paypal_email"
              value={formData.paypal_email}
              onChange={(e) => setFormData({ ...formData, paypal_email: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="your.paypal@email.com"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
            Shop Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="Tell potential customers about your work and expertise..."
          />
        </div>

        {/* Policies */}
        <div className="mt-6">
          <label htmlFor="policies" className="block text-sm font-medium text-gray-300 mb-2">
            Shop Policies
          </label>
          <textarea
            id="policies"
            rows={6}
            value={formData.policies}
            onChange={(e) => setFormData({ ...formData, policies: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="Returns, refunds, shipping policies, etc..."
          />
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {saving ? 'Saving...' : (shop ? 'Update Shop' : 'Create Shop')}
          </button>
        </div>
      </form>
    </div>
  );
}