import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Grid, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCategories } from '../hooks/useCategories';
import { ProductCard } from '../components/Cards/ProductCard';
import { ServiceCard } from '../components/Cards/ServiceCard';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

export function Search() {
  const [searchParams] = useSearchParams();
  const { data: categories } = useCategories();
  const [items, setItems] = useState<any[]>([]);
  const [groupedItems, setGroupedItems] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'categories'>('grid');
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    type: searchParams.get('type') || 'all',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    country: searchParams.get('country') || '',
    sortBy: searchParams.get('sortBy') || 'created_at'
  });

  useEffect(() => {
    searchItems();
  }, [filters]);

  useEffect(() => {
    if (viewMode === 'categories' && categories) {
      groupItemsByCategory();
    }
  }, [items, categories, viewMode]);

  const groupItemsByCategory = () => {
    const grouped = items.reduce((acc, item) => {
      const categoryName = item.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    }, {});
    setGroupedItems(grouped);
  };

  const searchItems = async () => {
    setLoading(true);
    try {
      // Find category ID if category filter is applied
      let categoryId = null;
      if (filters.category && categories) {
        const category = categories.find(cat => cat.name.toLowerCase() === filters.category.toLowerCase());
        categoryId = category?.id || null;
      }

      let productQuery = supabase
        .from('products')
        .select(`
          *,
          shop:shops(name, slug, logo_url, country),
          category:categories(name)
        `)
        .eq('status', 'active');

      let serviceQuery = supabase
        .from('services')
        .select(`
          *,
          shop:shops(name, slug, logo_url, country),
          category:categories(name)
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.query) {
        productQuery = productQuery.textSearch('title,description', filters.query);
        serviceQuery = serviceQuery.textSearch('title,description', filters.query);
      }

      if (categoryId) {
        productQuery = productQuery.eq('category_id', categoryId);
        serviceQuery = serviceQuery.eq('category_id', categoryId);
      }

      if (filters.minPrice) {
        productQuery = productQuery.gte('price', parseFloat(filters.minPrice));
        serviceQuery = serviceQuery.gte('base_price', parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        productQuery = productQuery.lte('price', parseFloat(filters.maxPrice));
        serviceQuery = serviceQuery.lte('base_price', parseFloat(filters.maxPrice));
      }

      if (filters.country) {
        productQuery = productQuery.eq('shops.country', filters.country);
        serviceQuery = serviceQuery.eq('shops.country', filters.country);
      }

      // Execute queries
      const results = [];
      
      if (filters.type === 'all' || filters.type === 'product') {
        const { data: products } = await productQuery;
        if (products) {
          results.push(...products.map(p => ({ ...p, item_type: 'product' })));
        }
      }

      if (filters.type === 'all' || filters.type === 'service') {
        const { data: services } = await serviceQuery;
        if (services) {
          results.push(...services.map(s => ({ ...s, item_type: 'service' })));
        }
      }

      // Sort results
      if (filters.sortBy === 'price_low') {
        results.sort((a, b) => (a.price || a.base_price) - (b.price || b.base_price));
      } else if (filters.sortBy === 'price_high') {
        results.sort((a, b) => (b.price || b.base_price) - (a.price || a.base_price));
      } else {
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      setItems(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      category: '',
      minPrice: '',
      maxPrice: '',
      country: '',
      sortBy: 'created_at'
    });
  };

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 
    'France', 'Japan', 'Australia'
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://draftsim.com/wp-content/uploads/2022/06/Briarhorn-Illustration-by-Nils-Hamm-1024x759.jpg"
          alt="MTG Search Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/98 to-background"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Search and View Toggle */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {filters.query ? `Search results for "${filters.query}"` : 'Browse Marketplace'}
              </h1>
              <p className="text-gray-400">
                {loading ? 'Searching...' : `${items.length} ${items.length === 1 ? 'result' : 'results'} found`}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('categories')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'categories' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-center text-white mb-4"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {showFilters && <X className="h-5 w-5 ml-2" />}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Item Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All Items</option>
                  <option value="product">Products</option>
                  <option value="service">Services</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="created_at">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              item.item_type === 'product' ? (
                <ProductCard key={item.id} product={item} />
              ) : (
                <ServiceCard key={item.id} service={item} />
              )
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">
                  No items found matching your criteria.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([categoryName, categoryItems]: [string, any]) => (
              <div key={categoryName}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">{categoryName}</h2>
                  <span className="text-gray-400 text-sm">{categoryItems.length} items</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryItems.map((item: any) => (
                    item.item_type === 'product' ? (
                      <ProductCard key={item.id} product={item} />
                    ) : (
                      <ServiceCard key={item.id} service={item} />
                    )
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedItems).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No items found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}