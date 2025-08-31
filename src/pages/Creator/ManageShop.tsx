import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Save, Upload, Store, Globe, User, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";

export function ManageShop() {
  const { user } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bio: "",
    country: "",
    policies: "",
    paypal_email: "",
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
        .single();

      if (data) {
        setShop(data);
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          bio: data.bio || "",
          country: data.country || "",
          policies: data.policies || "",
          paypal_email: data.paypal_email || "",
        });
      }
    } catch (error) {
      console.log("No shop found, will create new one");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (shop) {
        // Update existing shop
        const { error } = await supabase
          .from("shops")
          .update(formData)
          .eq("id", shop.id);

        if (error) throw error;
        toast.success("Boutique mise à jour avec succès !");
      } else {
        // Create new shop
        const { error } = await supabase
          .from("shops")
          .insert({
            owner_id: user?.id,
            ...formData,
          });

        if (error) throw error;
        toast.success("Boutique créée avec succès !");
        await fetchShop();
      }
    } catch (error: any) {
      console.error("Error saving shop:", error);
      toast.error(error.message || "Échec de la sauvegarde de la boutique");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center border border-primary/20">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-light text-foreground tracking-tight">
              {shop ? "Gérer votre Boutique" : "Créer votre Boutique"}
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              {shop ? "Modifiez les informations de votre boutique" : "Configurez votre espace créateur"}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-light text-foreground tracking-tight">
            Informations de la Boutique
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Informations de base
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nom de la boutique *"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de votre boutique"
                  id="name"
                />

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-3">
                    URL de la boutique *
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      className="w-full bg-card/50 border border-border/50 rounded-2xl pl-20 pr-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                      placeholder="ma-boutique"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Payment */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <Globe className="h-5 w-5 mr-2 text-primary" />
                Localisation et Paiement
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-foreground mb-3">
                    Pays
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  >
                    <option value="">Sélectionner un pays</option>
                    <option value="United States">États-Unis</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">Royaume-Uni</option>
                    <option value="Germany">Allemagne</option>
                    <option value="France">France</option>
                    <option value="Japan">Japon</option>
                    <option value="Australia">Australie</option>
                  </select>
                </div>

                <Input
                  label="Email PayPal"
                  type="email"
                  value={formData.paypal_email}
                  onChange={(e) => setFormData({ ...formData, paypal_email: e.target.value })}
                  placeholder="votre.paypal@email.com"
                  id="paypal_email"
                  icon={CreditCard}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <Store className="h-5 w-5 mr-2 text-primary" />
                Description et Politiques
              </h3>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-3">
                  Bio de la boutique
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
                  placeholder="Parlez aux clients potentiels de votre travail et de votre expertise..."
                />
              </div>

              <div>
                <label htmlFor="policies" className="block text-sm font-medium text-foreground mb-3">
                  Politiques de la boutique
                </label>
                <textarea
                  id="policies"
                  rows={6}
                  value={formData.policies}
                  onChange={(e) => setFormData({ ...formData, policies: e.target.value })}
                  className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
                  placeholder="Retours, remboursements, politiques d'expédition, etc..."
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
                className="w-full md:w-auto"
              >
                {saving ? "Sauvegarde..." : shop ? "Mettre à jour la boutique" : "Créer la boutique"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}