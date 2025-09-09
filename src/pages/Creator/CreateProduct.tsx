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
import { Save, ArrowLeft, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function CreateProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        toast.error(t("creator.common.createShopFirst"));
        navigate("/creator/shop");
        return;
      }
    } catch (error) {
      console.error(t("creator.common.dataFetchError"), error);
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

      toast.success(t("creator.create.success"));
      navigate("/dashboard/creator");
    } catch (error: any) {
      console.error(t("creator.create.errorCreating"), error);
      toast.error(error.message || t("creator.create.error"));
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
            {t("creator.common.back")}
          </Button>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground">
            {t("creator.create.title")}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t("creator.create.subtitle")}
          </p>
        </div>
      </div>

      <Card className="p-4 sm:p-6 lg:p-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6">
            <Plus className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground">
              {t("creator.common.productInfo")}
            </h2>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Type de produit */}
            <RadioGroup
              label={t("creator.common.productType")}
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
                  label: t("creator.common.physical"),
                  description: t("creator.common.physicalDescription"),
                },
                {
                  value: "digital",
                  label: t("creator.common.digital"),
                  description: t("creator.common.digitalDescription"),
                },
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Titre */}
              <Input
                label={t("creator.common.productTitle")}
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="ex: Lightning Bolt Alter"
              />

              {/* Prix */}
              <Input
                label={t("creator.common.priceUsd")}
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
                    label={t("creator.common.inventoryStock")}
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("creator.common.stockNote")}
                  </p>
                </div>
              )}

              {/* Délai de livraison */}
              <Input
                label={t("creator.common.leadTime")}
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
                label={t("creator.common.category")}
                value={formData.category_id}
                onChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                placeholder={t("creator.common.selectCategory")}
              />

              {/* Statut */}
              <Select
                label={t("creator.common.status")}
                value={formData.status}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "draft" | "active",
                  })
                }
                options={[
                  { value: "draft", label: t("creator.common.draft") },
                  { value: "active", label: t("creator.common.active") },
                ]}
              />
            </div>

            {/* Description */}
            <Textarea
              label={t("creator.common.description")}
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t("creator.common.descriptionPlaceholder")}
            />

            {/* Images */}
            <ImageUpload
              label={t("creator.common.productImages")}
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={3}
            />

            {/* Tags */}
            <TagInput
              label={t("creator.common.tags")}
              tags={formData.tags}
              onTagsChange={(tags) => setFormData({ ...formData, tags })}
              placeholder={t("creator.common.addTag")}
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
                {t("creator.common.cancel")}
              </Button>
              <Button
                type="submit"
                loading={saving}
                icon={Save}
                size="lg"
                className="order-1 sm:order-2"
              >
                {saving
                  ? t("creator.create.submitting")
                  : t("creator.create.submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
