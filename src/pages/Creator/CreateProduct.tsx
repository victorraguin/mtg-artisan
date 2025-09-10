import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Textarea,
  Select,
  TagInput,
  RadioGroup,
  ImageUpload,
} from "../../components/UI";
import supabase from "../../lib/supabase";
import { Save, Upload, ArrowLeft, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function CreateProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: "physical" as "physical" | "digital",
    title: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    tags: [] as string[],
    lead_time_days: "",
    status: "draft" as "draft" | "active",
    images: [] as string[],
  });
  const { t } = useTranslation();

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
        supabase.from("categories").select("*").eq("type", "product"),
      ]);

      setShop(shopResult.data);
      setCategories(categoriesResult.data || []);

      if (!shopResult.data) {
        toast.error(t("createProduct.needShop"));
        navigate("/creator/shop");
        return;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("products").insert({
        shop_id: shop.id,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock:
          formData.type === "physical"
            ? parseInt(formData.stock) || null
            : null,
        category_id: formData.category_id || null,
        tags: formData.tags,
        lead_time_days: formData.lead_time_days
          ? parseInt(formData.lead_time_days)
          : null,
        status: formData.status,
        images: formData.images,
      });

      if (error) throw error;

      toast.success(t("createProduct.success"));
      navigate("/dashboard/creator");
    } catch (error: any) {
      console.error("Erreur lors de la création du produit:", error);
      toast.error(error.message || t("createProduct.error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/dashboard/creator")}
            className="self-start"
          >
            {t("createProduct.back")}
          </Button>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground">
            {t("createProduct.title")}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t("createProduct.description")}
          </p>
        </div>
      </div>

      <Card className="p-4 sm:p-6 lg:p-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6">
            <Plus className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground">
              {t("createProduct.productInfo")}
            </h2>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Type de produit */}
            <RadioGroup
              label={t("createProduct.productType")}
              value={formData.type}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  type: value as "physical" | "digital",
                })
              }
              options={[
                {
                  value: "physical",
                  label: t("createProduct.physical"),
                  description: t("createProduct.physicalDescription"),
                },
                {
                  value: "digital",
                  label: t("createProduct.digital"),
                  description: t("createProduct.digitalDescription"),
                },
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Titre */}
              <Input
                label={t("createProduct.productTitle")}
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder={t("createProduct.productTitlePlaceholder")}
              />

              {/* Prix */}
              <Input
                label={t("createProduct.price")}
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="25.00"
              />

              {/* Stock (Physique uniquement) */}
              {formData.type === "physical" && (
                <div>
                  <Input
                    label={t("createProduct.stock")}
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("createProduct.stockHint")}
                  </p>
                </div>
              )}

              {/* Délai de livraison */}
              <Input
                label={t("createProduct.leadTime")}
                type="number"
                min="0"
                value={formData.lead_time_days}
                onChange={(e) =>
                  setFormData({ ...formData, lead_time_days: e.target.value })
                }
                placeholder="7"
              />

              {/* Catégorie */}
              <Select
                label={t("createProduct.category")}
                value={formData.category_id}
                onChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                placeholder={t("createProduct.selectCategory")}
              />

              {/* Statut */}
              <Select
                label={t("createProduct.status")}
                value={formData.status}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "draft" | "active",
                  })
                }
                options={[
                  { value: "draft", label: t("createProduct.draft") },
                  { value: "active", label: t("createProduct.active") },
                ]}
              />
            </div>

            {/* Description */}
            <Textarea
              label={t("createProduct.productDescription")}
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t("createProduct.productDescriptionPlaceholder")}
            />

            {/* Images */}
            <ImageUpload
              label={t("createProduct.images")}
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={3}
            />

            {/* Tags */}
            <TagInput
              label={t("createProduct.tags")}
              tags={formData.tags}
              onTagsChange={(tags) => setFormData({ ...formData, tags })}
              placeholder={t("createProduct.addTagPlaceholder")}
            />

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 md:pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/dashboard/creator")}
                size="lg"
                className="order-2 sm:order-1"
              >
                {t("createProduct.cancel")}
              </Button>
              <Button
                type="submit"
                loading={saving}
                icon={Save}
                size="lg"
                className="order-1 sm:order-2"
              >
                {saving
                  ? t("createProduct.creating")
                  : t("createProduct.create")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
