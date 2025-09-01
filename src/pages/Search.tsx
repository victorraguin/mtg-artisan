import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, Grid, List, Search as SearchIcon } from "lucide-react";
import supabase from "../lib/supabase";
import { useCategories } from "../hooks/useCategories";
import { ProductCard } from "../components/Cards/ProductCard";
import { ServiceCard } from "../components/Cards/ServiceCard";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";

export function Search() {
  const [searchParams] = useSearchParams();
  const { data: categories } = useCategories();
  const [items, setItems] = useState<any[]>([]);
  const [groupedItems, setGroupedItems] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "categories">("grid");
  const [filters, setFilters] = useState({
    query: searchParams.get("q") || "",
    type: searchParams.get("type") || "all",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    country: searchParams.get("country") || "",
    sortBy: searchParams.get("sortBy") || "created_at",
  });

  useEffect(() => {
    searchItems();
  }, [filters]);

  useEffect(() => {
    if (viewMode === "categories" && categories) {
      groupItemsByCategory();
    }
  }, [items, categories, viewMode]);

  useEffect(() => {
    console.log("🔍 Page Search initialisée");
  }, []);

  const groupItemsByCategory = () => {
    const grouped = items.reduce((acc, item) => {
      const categoryName = item.category?.name || "Uncategorized";
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
        const category = categories.find(
          (cat) => cat.name.toLowerCase() === filters.category.toLowerCase()
        );
        categoryId = category?.id || null;
      }

      let productQuery = supabase
        .from("products")
        .select(
          `
          *,
          shop:shops(name, slug, logo_url, country),
          category:categories(name)
        `
        )
        .eq("status", "active");

      let serviceQuery = supabase
        .from("services")
        .select(
          `
          *,
          shop:shops(name, slug, logo_url, country),
          category:categories(name)
        `
        )
        .eq("status", "active");

      // Apply filters
      if (filters.query) {
        productQuery = productQuery.textSearch(
          "title,description",
          filters.query
        );
        serviceQuery = serviceQuery.textSearch(
          "title,description",
          filters.query
        );
      }

      if (categoryId) {
        productQuery = productQuery.eq("category_id", categoryId);
        serviceQuery = serviceQuery.eq("category_id", categoryId);
      }

      if (filters.minPrice) {
        productQuery = productQuery.gte("price", parseFloat(filters.minPrice));
        serviceQuery = serviceQuery.gte(
          "base_price",
          parseFloat(filters.minPrice)
        );
      }

      if (filters.maxPrice) {
        productQuery = productQuery.lte("price", parseFloat(filters.maxPrice));
        serviceQuery = serviceQuery.lte(
          "base_price",
          parseFloat(filters.maxPrice)
        );
      }

      if (filters.country) {
        productQuery = productQuery.eq("shops.country", filters.country);
        serviceQuery = serviceQuery.eq("shops.country", filters.country);
      }

      // Execute queries
      const results = [];

      if (filters.type === "all" || filters.type === "product") {
        const { data: products } = await productQuery;
        if (products) {
          results.push(
            ...products.map((p) => ({ ...p, item_type: "product" }))
          );
        }
      }

      if (filters.type === "all" || filters.type === "service") {
        const { data: services } = await serviceQuery;
        if (services) {
          results.push(
            ...services.map((s) => ({ ...s, item_type: "service" }))
          );
        }
      }

      // Sort results
      if (filters.sortBy === "price_low") {
        results.sort(
          (a, b) => (a.price || a.base_price) - (b.price || b.base_price)
        );
      } else if (filters.sortBy === "price_high") {
        results.sort(
          (a, b) => (b.price || b.base_price) - (a.price || a.base_price)
        );
      } else {
        results.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      setItems(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      type: "all",
      category: "",
      minPrice: "",
      maxPrice: "",
      country: "",
      sortBy: "created_at",
    });
  };

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "Australia",
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header with Search and View Toggle */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-2">
                {filters.query
                  ? `Résultats pour "${filters.query}"`
                  : "Parcourir les Boutiques"}
              </h1>
              <p className="text-muted-foreground/70 text-lg">
                {loading
                  ? "Recherche en cours..."
                  : `${items.length} ${
                      items.length === 1 ? "résultat" : "résultats"
                    } trouvé${items.length > 1 ? "s" : ""}`}
              </p>
            </div>

            <div className="flex items-center space-x-3 self-start lg:self-auto">
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                size="sm"
                icon={Grid}
                onClick={() => setViewMode("grid")}
              >
                Grille
              </Button>
              <Button
                variant={viewMode === "categories" ? "primary" : "outline"}
                size="sm"
                icon={List}
                onClick={() => setViewMode("categories")}
              >
                Catégories
              </Button>
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="md"
            icon={showFilters ? X : Filter}
            onClick={() => setShowFilters(!showFilters)}
            className="w-full lg:w-auto"
          >
            {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass rounded-3xl p-6 md:p-8 border border-border/30 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-light text-foreground">Filtres</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-primary hover:text-primary/80"
              >
                Effacer tout
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Item Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilter("type", e.target.value)}
                  className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                >
                  <option value="all">Tous les éléments</option>
                  <option value="product">Produits</option>
                  <option value="service">Artisans</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Catégorie
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter("category", e.target.value)}
                  className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                >
                  <option value="">Toutes les catégories</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Fourchette de prix
                </label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter("sortBy", e.target.value)}
                  className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                >
                  <option value="created_at">Plus récent</option>
                  <option value="price_low">Prix : Croissant</option>
                  <option value="price_high">Prix : Décroissant</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {items.map((item) =>
              item.item_type === "product" ? (
                <ProductCard key={item.id} product={item} />
              ) : (
                <ServiceCard key={item.id} service={item} />
              )
            )}
            {items.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="glass rounded-3xl p-12 border border-border/30">
                  <SearchIcon className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground/70 text-lg">
                    Aucun élément trouvé correspondant à vos critères.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedItems).map(
              ([categoryName, categoryItems]: [string, any]) => (
                <div key={categoryName}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-light text-foreground tracking-tight">
                      {categoryName}
                    </h2>
                    <span className="text-muted-foreground/60 text-sm">
                      {categoryItems.length} élément
                      {categoryItems.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                    {categoryItems.map((item: any) =>
                      item.item_type === "product" ? (
                        <ProductCard key={item.id} product={item} />
                      ) : (
                        <ServiceCard key={item.id} service={item} />
                      )
                    )}
                  </div>
                </div>
              )
            )}

            {Object.keys(groupedItems).length === 0 && (
              <div className="text-center py-16">
                <div className="glass rounded-3xl p-12 border border-border/30">
                  <SearchIcon className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground/70 text-lg">
                    Aucun élément trouvé correspondant à vos critères.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
