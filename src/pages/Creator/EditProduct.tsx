import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Save, ArrowLeft, Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function EditProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
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
    status: "draft" as "draft" | "active" | "paused" | "sold_out",
    images: [] as string[],
  });

  useEffect(() => {
    if (productId) {
      fetchInitialData();
    }
  }, [user, productId]);

  const fetchInitialData = async () => {
    try {
      const [shopResult, categoriesResult, productResult] = await Promise.all([
        supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user?.id)
          .maybeSingle(),
        supabase.from("categories").select("*").eq("type", "product"),
        supabase.from("products").select("*").eq("id", productId).single(),
      ]);

      if (!shopResult.data) {
        toast.error(t("creator.common.createShopFirst"));
        navigate("/creator/shop");
        return;
      }

      if (!productResult.data) {
        toast.error(t("creator.edit.productNotFound"));
        navigate("/dashboard/creator");
        return;
      }

      // Vérifier que l'utilisateur est propriétaire du produit
      if (productResult.data.shop_id !== shopResult.data.id) {
        toast.error(t("creator.edit.unauthorized"));
        navigate("/dashboard/creator");
        return;
      }

      setShop(shopResult.data);
      setCategories(categoriesResult.data || []);

      // Remplir le formulaire avec les données existantes
      const product = productResult.data;
      setFormData({
        type: product.type,
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock?.toString() || "",
        category_id: product.category_id || "",
        tags: product.tags || [],
        lead_time_days: product.lead_time_days?.toString() || "",
        status: product.status,
        images: product.images || [],
      });
    } catch (error) {
      console.error(t("creator.common.dataFetchError"), error);
      toast.error(t("creator.edit.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !productId) return;

    setSaving(true);
    try {
      const updateData = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock:
          formData.type === "physical"
            ? Number.isNaN(parseInt(formData.stock, 10))
              ? null
              : parseInt(formData.stock, 10)
            : null,
        category_id: formData.category_id || null,
        tags: formData.tags,
        lead_time_days: formData.lead_time_days
          ? parseInt(formData.lead_time_days)
          : null,
        status: formData.status,
        images: formData.images,
      };

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId);

      if (error) throw error;

      toast.success(t("creator.edit.success"));
      navigate("/dashboard/creator");
    } catch (error: any) {
      console.error(t("creator.edit.errorUpdating"), error);
      toast.error(error.message || t("creator.edit.error"));
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
            {t("creator.edit.title")}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t("creator.edit.subtitle")}
          </p>
        </div>
      </div>

      <Card className="p-4 sm:p-6 lg:p-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6">
            <Edit3 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
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
                onChange={(e) => {
                  const raw = e.target.value;
                  // Autoriser chiffres et un seul point
                  const cleaned = raw
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1");
                  setFormData({ ...formData, price: cleaned });
                }}
                placeholder="25.00"
              />

              {/* Stock (Physique uniquement) */}
              {formData.type === "physical" && (
                <div>
                  <Input
                    label={t("creator.common.inventoryStock")}
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={(e) => {
                      const raw = e.target.value;
                      // Nettoyage: garder uniquement chiffres
                      const digitsOnly = raw.replace(/[^0-9]/g, "");
                      setFormData({ ...formData, stock: digitsOnly });
                    }}
                    onWheel={(e) => {
                      // Empêcher la molette de modifier la valeur
                      (e.target as HTMLInputElement).blur();
                    }}
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
                step="1"
                value={formData.lead_time_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lead_time_days: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                onWheel={(e) => {
                  (e.target as HTMLInputElement).blur();
                }}
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
                    status: value as "draft" | "active" | "paused" | "sold_out",
                  })
                }
                options={[
                  { value: "draft", label: t("creator.common.draft") },
                  { value: "active", label: t("creator.common.active") },
                  { value: "paused", label: t("creator.common.paused") },
                  { value: "sold_out", label: t("creator.common.soldOut") },
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
                  ? t("creator.edit.submitting")
                  : t("creator.edit.submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
