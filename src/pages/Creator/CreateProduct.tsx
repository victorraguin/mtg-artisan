import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function CreateProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: 'physical' as 'physical' | 'digital',
    title: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    tags: [] as string[],
    lead_time_days: '',
    status: 'draft' as 'draft' | 'active'
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const [shopResult, categoriesResult] = await Promise.all([
        supabase.from('shops').select('*').eq('owner_id', user?.id).maybeSingle(),
        supabase.from('categories').select('*').eq('type', 'product')
      ]);

      setShop(shopResult.data);
      setCategories(categoriesResult.data || []);

      if (!shopResult.data) {
        toast.error('Please create your shop first');
        navigate('/creator/shop');
        return;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          shop_id: shop.id,
          type: formData.type,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: formData.type === 'physical' ? parseInt(formData.stock) || null : null,
          category_id: formData.category_id || null,
          tags: formData.tags,
          lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : null,
          status: formData.status,
          images: [] // Will be handled by image upload later
        });

      if (error) throw error;
      
      toast.success('Product created successfully!');
      navigate('/dashboard/creator');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');
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
      <h1 className="text-3xl font-bold text-white mb-8">Create New Product</h1>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-8 space-y-6">
        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Product Type *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              formData.type === 'physical' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}>
              <input
                type="radio"
                name="type"
                value="physical"
                checked={formData.type === 'physical'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'physical' })}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-lg font-medium text-white">Physical</div>
                <div className="text-sm text-gray-400">Ships to customer</div>
              </div>
            </label>
            
            <label className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              formData.type === 'digital' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}>
              <input
                type="radio"
                name="type"
                value="digital"
                checked={formData.type === 'digital'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'digital' })}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-lg font-medium text-white">Digital</div>
                <div className="text-sm text-gray-400">Download delivery</div>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Product Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="e.g., Lightning Bolt Alter"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
              Price (USD) *
            </label>
            <input
              type="number"
              id="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="25.00"
            />
          </div>

          {/* Stock (Physical only) */}
          {formData.type === 'physical' && (
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="1"
              />
            </div>
          )}

          {/* Lead Time */}
          <div>
            <label htmlFor="lead_time_days" className="block text-sm font-medium text-gray-300 mb-2">
              Lead Time (days)
            </label>
            <input
              type="number"
              id="lead_time_days"
              min="0"
              value={formData.lead_time_days}
              onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="7"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category_id"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'active' })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="Describe your product in detail..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-purple-200 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Add tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/creator')}
            className="text-gray-400 hover:text-white px-6 py-3 transition-colors"
          >
            Cancel
          </button>
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
            {saving ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}