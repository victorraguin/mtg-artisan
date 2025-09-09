import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabase";
import {
  Save,
  Upload,
  Store,
  Globe,
  User,
  CreditCard,
  AlertTriangle,
  Image,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import { useTranslation } from "react-i18next";

export function ManageShop() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bio: "",
    country: "",
    policies: "",
    paypal_email: "",
    banner_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchShop();
    }
  }, [user]);

  const fetchShop = async () => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user?.id)
        .maybeSingle();

      if (data) {
        setShop(data);
        const initialData = {
          name: data.name || "",
          slug: data.slug || "",
          bio: data.bio || "",
          country: data.country || "",
          policies: data.policies || "",
          paypal_email: data.paypal_email || "",
          banner_url: data.banner_url || "",
        };
        setFormData(initialData);
        setOriginalData(initialData);
        setBannerPreview(data.banner_url);
      }
    } catch (error) {
      console.log("No shop found, will create new one");
    } finally {
      setLoading(false);
    }
  };

  // Vérifier les changements
  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error(t("manageShop.imageTooLarge"));
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error(t("manageShop.invalidImage"));
      return;
    }

    try {
      setUploadingBanner(true);
      
      // Créer un nom unique pour le fichier
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-banner-${Date.now()}.${fileExt}`;
      const filePath = `shop-banners/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('shop-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('shop-assets')
        .getPublicUrl(filePath);

      // Mettre à jour le formulaire
      handleInputChange("banner_url", publicUrl);
      setBannerPreview(publicUrl);
      
      toast.success(t("manageShop.bannerUploadSuccess"));
    } catch (error: any) {
      console.error(t("manageShop.bannerUploadConsoleError"), error);
      toast.error(t("manageShop.bannerUploadError"));
    } finally {
      setUploadingBanner(false);
    }
  };

  const removeBanner = async () => {
    try {
      // Supprimer l'URL de la bannière de la base de données
      if (shop && formData.banner_url) {
        const { error: updateError } = await supabase
          .from("shops")
          .update({ banner_url: null })
          .eq("id", shop.id);

        if (updateError) {
          console.error(t("manageShop.bannerDeleteConsoleError"), updateError);
          toast.error(t("manageShop.bannerDeleteError"));
          return;
        }
      }

      // Mettre à jour le formulaire
      setFormData(prev => ({ ...prev, banner_url: "" }));
      setBannerPreview(null);
      
      // Mettre à jour les données originales
      if (shop) {
        setOriginalData((prev: any) => prev ? { ...prev, banner_url: "" } : null);
        setHasChanges(false);
        toast.success(t("manageShop.bannerDeleteSuccess"));
      }
    } catch (error) {
      console.error(t("manageShop.bannerDeleteConsoleError"), error);
      toast.error(t("manageShop.bannerDeleteError"));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (shop && !hasChanges) {
      toast.success(t("manageShop.noChanges"));
      return;
    }

    setSaving(true);

    try {
      if (shop) {
        // Update existing shop
        const { error } = await supabase
          .from("shops")
          .update(formData)
          .eq("id", shop.id);

        if (error) throw error;
        
        toast.success(t("manageShop.shopUpdated"));
        setOriginalData({ ...formData });
        setHasChanges(false);
      } else {
        // Create new shop
        const { error } = await supabase.from("shops").insert({
          owner_id: user?.id,
          ...formData,
        });

        if (error) throw error;
        
        toast.success(t("manageShop.shopCreated"));
        await fetchShop();
      }
    } catch (error: any) {
      console.error("Error saving shop:", error);
      toast.error(error.message || t("manageShop.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center border border-primary/20">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-light text-foreground tracking-tight">
              {shop ? t("manageShop.manageYourShop") : t("manageShop.createYourShop")}
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              {shop
                ? t("manageShop.modifyShopInfo")
                : t("manageShop.configureCreatorSpace")}
            </p>
          </div>
        </div>
      </div>

      {/* Alert for changes */}
      {hasChanges && (
        <div className="mb-8 p-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <span className="text-foreground">
            {t("manageShop.unsavedChanges")}
          </span>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-light text-foreground tracking-tight">
            {t("manageShop.shopInfo")}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-8">
            {/* Bannière de la boutique */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <Image className="h-5 w-5 mr-2 text-primary" />
                {t("manageShop.shopBanner")}
              </h3>

              <div className="space-y-4">
                {/* Prévisualisation de la bannière */}
                {bannerPreview && (
                  <div className="relative">
                    <div className="h-48 bg-muted rounded-2xl overflow-hidden relative">
                      <img
                        src={bannerPreview}
                        alt={t("manageShop.shopBanner")}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                    </div>
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Upload de bannière */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    {bannerPreview ? t("manageShop.changeBanner") : t("manageShop.addBanner")}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                      id="banner-upload"
                      disabled={uploadingBanner}
                    />
                    <label
                      htmlFor="banner-upload"
                      className="flex items-center space-x-2 px-4 py-2 bg-card/50 border border-border/50 rounded-xl text-foreground hover:bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingBanner ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {uploadingBanner ? t("manageShop.uploading") : t("manageShop.chooseImage")}
                      </span>
                    </label>
                    <span className="text-xs text-muted-foreground/70">
                      {t("manageShop.bannerRequirements")}
                    </span>
                  </div>
                  
                  {/* Bouton de test pour voir la bannière */}
                  {bannerPreview && (
                    <div className="flex items-center space-x-3 pt-2">
                      <a
                        href={`/creator/${formData.slug || shop?.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors duration-300"
                      >
                        <span>{t("manageShop.bannerPreview")}</span>
                      </a>
                      <span className="text-xs text-muted-foreground/70">
                        {t("manageShop.bannerPreviewHint")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                {t("manageShop.basicInfo")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t("manageShop.shopNameLabel")}
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("manageShop.shopNamePlaceholder")}
                  id="name"
                />

                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-foreground mb-3"
                  >
                    {t("manageShop.shopUrlLabel")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 text-sm">
                      /creator/
                    </span>
                    <input
                      type="text"
                      id="slug"
                      required
                      value={formData.slug}
                      onChange={(e) => {
                        const value = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "");
                        handleInputChange("slug", value);
                      }}
                      className="w-full bg-card/50 border border-border/50 rounded-2xl pl-20 pr-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                      placeholder={t("manageShop.slugPlaceholder")}
                    />
                  </div>
                  {shop && (
                    <p className="text-sm text-muted-foreground/70 mt-2">
                      {t("manageShop.shopUrlWarning")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Payment */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <Globe className="h-5 w-5 mr-2 text-primary" />
                {t("manageShop.locationPayment")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-foreground mb-3"
                  >
                    {t("manageShop.countryLabel")}
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  >
                    <option value="">{t("manageShop.selectCountry")}</option>
                    <option value="United States">{t("manageShop.usa")}</option>
                    <option value="Canada">{t("manageShop.canada")}</option>
                    <option value="United Kingdom">{t("manageShop.uk")}</option>
                    <option value="Germany">{t("manageShop.germany")}</option>
                    <option value="France">{t("manageShop.france")}</option>
                    <option value="Japan">{t("manageShop.japan")}</option>
                    <option value="Australia">{t("manageShop.australia")}</option>
                  </select>
                </div>

                <Input
                  label={t("manageShop.paypalEmailLabel")}
                  type="email"
                  value={formData.paypal_email}
                  onChange={(e) =>
                    handleInputChange("paypal_email", e.target.value)
                  }
                  placeholder={t("manageShop.paypalEmailPlaceholder")}
                  id="paypal_email"
                  icon={CreditCard}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <Store className="h-5 w-5 mr-2 text-primary" />
                {t("manageShop.descriptionPolicies")}
              </h3>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-foreground mb-3"
                >
                  {t("manageShop.shopBioLabel")}
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
                  placeholder={t("manageShop.shopBioPlaceholder")}
                />
              </div>

              <div>
                <label
                  htmlFor="policies"
                  className="block text-sm font-medium text-foreground mb-3"
                >
                  {t("manageShop.shopPoliciesLabel")}
                </label>
                <textarea
                  id="policies"
                  rows={6}
                  value={formData.policies}
                  onChange={(e) =>
                    handleInputChange("policies", e.target.value)
                  }
                  className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
                  placeholder={t("manageShop.shopPoliciesPlaceholder")}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-border/30">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                icon={Save}
                loading={saving}
                className="w-full md:w-auto px-8 py-3 text-base font-medium"
                disabled={shop && !hasChanges}
              >
                {saving
                  ? t("manageShop.saving")
                  : shop
                  ? t("manageShop.updateShop")
                  : t("manageShop.createShop")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
