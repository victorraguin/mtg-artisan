import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, EmptyState } from "../UI";
import { useShopStatistics } from "../../hooks/useAnalytics";
import { Product, ProductWithStats, Category } from "../../types";
import supabase from "../../lib/supabase";
import { useTranslation } from "react-i18next";
import {
  Edit3,
  Eye,
  Package,
  TrendingUp,
  DollarSign,
  MoreHorizontal,
  ExternalLink,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

interface ProductsTableProps {
  shopId: string;
}

export function ProductsTable({ shopId }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsWithStats, setProductsWithStats] = useState<
    ProductWithStats[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    statistics,
    loading: statsLoading,
    refetch,
  } = useShopStatistics(shopId);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [shopId]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(t("productsTable.loadError"));
    }
  };

  // Combiner les produits avec leurs statistiques
  useEffect(() => {
    if (products.length > 0 && statistics.length > 0) {
      const combined = products.map((product) => {
        const stats = statistics.find((s) => s.product_id === product.id);
        return {
          ...product,
          total_views: stats?.total_views || 0,
          currently_in_carts: stats?.currently_in_carts || 0,
          total_quantity_sold: stats?.total_quantity_sold || 0,
          total_revenue: stats?.total_revenue || 0,
          conversion_rate_percent: stats?.conversion_rate_percent || 0,
        };
      });
      setProductsWithStats(combined);
    } else {
      // Si pas de stats, créer avec des valeurs par défaut
      setProductsWithStats(
        products.map((product) => ({
          ...product,
          total_views: 0,
          currently_in_carts: 0,
          total_quantity_sold: 0,
          total_revenue: 0,
          conversion_rate_percent: 0,
        }))
      );
    }
  }, [products, statistics]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("type", "product");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || t("common.noCategory");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "draft":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "paused":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "sold_out":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-muted-foreground bg-muted/10 border-border/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t("common.status.active");
      case "draft":
        return t("common.status.draft");
      case "paused":
        return t("common.status.paused");
      case "sold_out":
        return t("common.status.sold_out");
      default:
        return status;
    }
  };

  const deleteProduct = async (productId: string, productTitle: string) => {
    if (
      !window.confirm(
        t("productsTable.confirmDelete", { title: productTitle })
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast.success(t("productsTable.deleteSuccess"));
      fetchProducts(); // Recharger la liste
      refetch(); // Recharger les statistiques
    } catch (error: any) {
      console.error("Error deleting:", error);
      toast.error(error.message || t("productsTable.deleteError"));
    }
  };

  if (statsLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (productsWithStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light text-foreground tracking-tight">
              {t("productsTable.heading")}
            </h2>
            <Link to="/creator/products/new">
              <Button variant="primary" size="sm" icon={Package}>
                {t("productsTable.create")}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title={t("productsTable.emptyTitle")}
            description={t("productsTable.emptyDescription")}
            actionLabel={t("productsTable.emptyAction")}
            actionIcon={Package}
            onAction={() => navigate("/creator/products/new")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-light text-foreground tracking-tight">
            {t("productsTable.headingCount", { count: productsWithStats.length })}
          </h2>
          <Link to="/creator/products/new">
            <Button variant="primary" size="sm" icon={Package}>
              {t("productsTable.create")}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {productsWithStats.map((product) => (
            <div
              key={product.id}
              className="glass rounded-2xl p-4 md:p-6 border border-border/30 hover:border-primary/20 transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                {/* Informations principales */}
                <div className="lg:col-span-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center border border-border/30">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-foreground truncate">
                          {product.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {getStatusLabel(product.status)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted/20 px-2 py-1 rounded-full">
                          {product.type === "physical"
                            ? t("common.types.physical")
                            : t("common.types.digital")}
                        </span>
                        <span className="bg-muted/20 px-2 py-1 rounded-full">
                          {getCategoryName(product.category_id)}
                        </span>
                        {product.stock !== null && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.stock > 10
                                ? "bg-green-500/20 text-green-500"
                                : product.stock > 5
                                ? "bg-yellow-500/20 text-yellow-500"
                                : product.stock > 0
                                ? "bg-orange-500/20 text-orange-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {t("common.stockTotal")}: {product.stock}
                            {product.currently_in_carts > 0 && (
                              <span className="ml-1 opacity-70">
                                ({t("common.inCarts", { count: product.currently_in_carts })})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prix */}
                <div className="lg:col-span-1 flex lg:flex-col lg:items-center lg:justify-center">
                  <div className="text-center">
                    <div className="text-xl font-light text-foreground">
                      ${product.price}
                    </div>
                    <div className="text-xs text-muted-foreground">{t("common.price")}</div>
                  </div>
                </div>

                {/* Stock */}
                <div className="lg:col-span-2 flex lg:flex-col lg:items-center lg:justify-center">
                  {product.type === "physical" && product.stock !== null ? (
                    <div className="text-center">
                      <div
                        className={`text-xl font-medium ${
                          product.stock > 10
                            ? "text-green-500"
                            : product.stock > 5
                            ? "text-yellow-500"
                            : product.stock > 0
                            ? "text-orange-500"
                            : "text-red-500"
                        }`}
                      >
                        {product.stock}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("common.stockTotal")}
                        {product.currently_in_carts > 0 && (
                          <div className="text-xs text-orange-500 mt-1">
                            {t("common.inCarts", { count: product.currently_in_carts })}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t("common.available")}: {Math.max(
                          0,
                          product.stock - product.currently_in_carts
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">∞</div>
                      <div className="text-xs text-muted-foreground">
                        {t("common.unlimited")}
                      </div>
                    </div>
                  )}
                </div>

                {/* Statistiques */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-3 gap-2 lg:gap-1 text-center">
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm font-medium text-foreground">
                          {product.total_views}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{t("common.views")}</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-foreground">
                          {product.total_quantity_sold}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("common.sales")}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="h-4 w-4 text-primary mr-1" />
                        <span className="text-sm font-medium text-foreground">
                          ${Math.round(product.total_revenue)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("common.revenue")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-1 flex lg:flex-col gap-2 lg:items-center lg:justify-center">
                  <Link to={`/creator/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm" icon={Edit3}>
                      <span className="sr-only">{t("common.edit")}</span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <span className="sr-only">{t("common.view")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => deleteProduct(product.id, product.title)}
                    className="text-red-500 hover:text-red-600 hover:border-red-500/30"
                  >
                    <span className="sr-only">{t("common.delete")}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
