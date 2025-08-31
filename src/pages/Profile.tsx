import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Save, User } from 'lucide-react';
import toast from 'react-hot-toast';

export function Profile() {
  const { profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    country: profile?.country || '',
    shipping_name: profile?.shipping_name || '',
    shipping_address: profile?.shipping_address || '',
    shipping_city: profile?.shipping_city || '',
    shipping_postal_code: profile?.shipping_postal_code || '',
    shipping_country: profile?.shipping_country || '',
    phone: profile?.phone || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await updateProfile(formData);
      if (error) throw error;
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <div className="flex items-center mb-8">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mr-6">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || 'Avatar'}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{profile?.display_name || 'Anonymous'}</h2>
            <p className="text-gray-400 capitalize">{profile?.role} account</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Shipping Address</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="shipping_name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="shipping_name"
                value={formData.shipping_name}
                onChange={(e) => setFormData({ ...formData, shipping_name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-300 mb-2">
                Street Address
              </label>
              <input
                type="text"
                id="shipping_address"
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="123 Main Street, Apt 4B"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="shipping_city" className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="shipping_city"
                  value={formData.shipping_city}
                  onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="New York"
                />
              </div>
              
              <div>
                <label htmlFor="shipping_postal_code" className="block text-sm font-medium text-gray-300 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="shipping_postal_code"
                  value={formData.shipping_postal_code}
                  onChange={(e) => setFormData({ ...formData, shipping_postal_code: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="10001"
                />
              </div>
              
              <div>
                <label htmlFor="shipping_country" className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <select
                  id="shipping_country"
                  value={formData.shipping_country}
                  onChange={(e) => setFormData({ ...formData, shipping_country: e.target.value })}
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
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="Your display name"
              />
            </div>

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
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex justify-end">
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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}