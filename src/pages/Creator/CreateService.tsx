import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabase";
import { Save, X } from "lucide-react";
import toast from "react-hot-toast";

export function CreateService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    base_price: "",
    requires_brief: false,
    delivery_days: "",
    category_id: "",
    status: "draft" as "draft" | "active",
  });

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const [shopResult, categoriesResult] = await Promise.all([
        supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user?.id)
          .maybeSingle(),
        supabase.from("categories").select("*").eq("type", "service"),
      ]);

      setShop(shopResult.data);
      setCategories(categoriesResult.data || []);

      if (!shopResult.data) {
        toast.error("Please create your shop first");
        navigate("/creator/shop");
        return;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("services").insert({
        shop_id: shop.id,
        title: formData.title,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        requires_brief: formData.requires_brief,
        delivery_days: parseInt(formData.delivery_days),
        category_id: formData.category_id || null,
        status: formData.status,
      });

      if (error) throw error;

      toast.success("Service created successfully!");
      navigate("/dashboard/creator");
    } catch (error: any) {
      console.error("Error creating service:", error);
      toast.error(error.message || "Failed to create service");
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
      <h1 className="text-3xl font-bold text-white mb-8">Create New Service</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-xl border border-gray-700 p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Service Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="e.g., Professional Card Altering Service"
            />
          </div>

          {/* Base Price */}
          <div>
            <label
              htmlFor="base_price"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Starting Price (USD) *
            </label>
            <input
              type="number"
              id="base_price"
              required
              min="0"
              step="0.01"
              value={formData.base_price}
              onChange={(e) =>
                setFormData({ ...formData, base_price: e.target.value })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="50.00"
            />
          </div>

          {/* Delivery Days */}
          <div>
            <label
              htmlFor="delivery_days"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Delivery Time (days) *
            </label>
            <input
              type="number"
              id="delivery_days"
              required
              min="1"
              value={formData.delivery_days}
              onChange={(e) =>
                setFormData({ ...formData, delivery_days: e.target.value })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              placeholder="7"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Category
            </label>
            <select
              id="category_id"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
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
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "draft" | "active",
                })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Service Description *
          </label>
          <textarea
            id="description"
            required
            rows={6}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="Describe your service, what's included, your process, etc..."
          />
        </div>

        {/* Requires Brief */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requires_brief}
              onChange={(e) =>
                setFormData({ ...formData, requires_brief: e.target.checked })
              }
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <div>
              <span className="text-white font-medium">
                Requires consultation
              </span>
              <p className="text-gray-400 text-sm">
                Customer needs to provide detailed brief before ordering
              </p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/creator")}
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
            {saving ? "Creating..." : "Create Service"}
          </button>
        </div>
      </form>
    </div>
  );
}
