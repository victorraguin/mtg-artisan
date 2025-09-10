import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Save,
  User,
  MapPin,
  Edit3,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Card, CardHeader, CardContent } from "../components/UI/Card";
import supabase from "../lib/supabase";

interface ReferralInfo {
  ambassador: {
    display_name: string;
    referral_code: string;
  };
  referral_date: string;
  total_earned: number;
}

export function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(true);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    country: profile?.country || "",
    shipping_name: profile?.shipping_name || "",
    shipping_address: profile?.shipping_address || "",
    shipping_city: profile?.shipping_city || "",
    shipping_postal_code: profile?.shipping_postal_code || "",
    shipping_country: profile?.shipping_country || "",
  });

  useEffect(() => {
    if (user) {
      fetchReferralInfo();
    }
  }, [user]);

  const fetchReferralInfo = async () => {
    try {
      setLoadingReferral(true);

      const { data, error } = await supabase
        .from("referrals")
        .select(
          `
          referral_date,
          total_earned,
          ambassador:ambassadors!referrals_ambassador_id_fkey(
            referral_code,
            profile:profiles!ambassadors_user_id_fkey(display_name)
          )
        `
        )
        .eq("referred_user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setReferralInfo({
          ambassador: {
            display_name:
              data.ambassador.profile?.display_name || "Ambassadeur",
            referral_code: data.ambassador.referral_code,
          },
          referral_date: data.referral_date,
          total_earned: data.total_earned || 0,
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des informations de parrainage:",
        error
      );
    } finally {
      setLoadingReferral(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await updateProfile(formData);
      if (error) throw error;

      toast.success("Profil mis à jour avec succès !");
    } catch (error: any) {
      toast.error(error.message || "Échec de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-light text-foreground tracking-tight mb-4">
          Paramètres du Profil
        </h1>
        <p className="text-muted-foreground/70 text-lg">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-6">
            <div className="glass w-24 h-24 rounded-3xl flex items-center justify-center border border-primary/20">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || "Avatar"}
                  className="w-24 h-24 rounded-3xl object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-light text-foreground">
                {profile?.display_name || "Anonyme"}
              </h2>
              <p className="text-muted-foreground/70 capitalize">
                Compte{" "}
                {profile?.role === "creator"
                  ? "créateur"
                  : profile?.role === "admin"
                  ? "administrateur"
                  : "acheteur"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Adresse de livraison */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Adresse de livraison
              </h3>

              <div className="space-y-4">
                <Input
                  label="Nom complet"
                  value={formData.shipping_name}
                  onChange={(e) =>
                    setFormData({ ...formData, shipping_name: e.target.value })
                  }
                  placeholder="Jean Dupont"
                  id="shipping_name"
                />

                <Input
                  label="Adresse"
                  value={formData.shipping_address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shipping_address: e.target.value,
                    })
                  }
                  placeholder="123 Rue Principale, Appt 4B"
                  id="shipping_address"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Ville"
                    value={formData.shipping_city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping_city: e.target.value,
                      })
                    }
                    placeholder="Paris"
                    id="shipping_city"
                  />

                  <Input
                    label="Code postal"
                    value={formData.shipping_postal_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping_postal_code: e.target.value,
                      })
                    }
                    placeholder="75001"
                    id="shipping_postal_code"
                  />

                  <div>
                    <label
                      htmlFor="shipping_country"
                      className="block text-sm font-medium text-foreground mb-3"
                    >
                      Pays
                    </label>
                    <select
                      id="shipping_country"
                      value={formData.shipping_country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping_country: e.target.value,
                        })
                      }
                      className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    >
                      <option value="">Sélectionner un pays</option>
                      <option value="France">France</option>
                      <option value="United States">États-Unis</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">Royaume-Uni</option>
                      <option value="Germany">Allemagne</option>
                      <option value="Japan">Japon</option>
                      <option value="Australia">Australie</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <Edit3 className="h-5 w-5 mr-2 text-primary" />
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nom d'affichage"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                  placeholder="Votre nom d'affichage"
                  id="display_name"
                />

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-foreground mb-3"
                  >
                    Pays
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  >
                    <option value="">Sélectionner un pays</option>
                    <option value="France">France</option>
                    <option value="United States">États-Unis</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">Royaume-Uni</option>
                    <option value="Germany">Allemagne</option>
                    <option value="Japan">Japon</option>
                    <option value="Australia">Australie</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-foreground mb-3"
                >
                  Biographie
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full bg-card/50 border border-border/50 rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  placeholder="Parlez-nous de vous..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-border/30">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                icon={Save}
                loading={saving}
                className="px-8 py-3 text-base font-medium"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder dans mon profil"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Informations de Parrainage */}
      {!loadingReferral && referralInfo && (
        <Card className="mt-8">
          <CardHeader>
            <h3 className="text-2xl font-light text-foreground tracking-tight flex items-center">
              <Users className="h-6 w-6 mr-3 text-primary" />
              Informations de Parrainage
            </h3>
            <p className="text-muted-foreground/70">
              Vous avez rejoint ManaShop grâce à un ambassadeur
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ambassadeur */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Parrainé par
                  </div>
                  <div className="text-lg text-primary font-medium">
                    {referralInfo.ambassador.display_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Code: {referralInfo.ambassador.referral_code}
                  </div>
                </div>
              </div>

              {/* Date de parrainage */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Membre depuis
                  </div>
                  <div className="text-lg text-foreground">
                    {new Date(referralInfo.referral_date).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Date de parrainage
                  </div>
                </div>
              </div>

              {/* Commissions générées */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Commissions générées
                  </div>
                  <div className="text-lg text-foreground">
                    {referralInfo.total_earned.toFixed(2)} €
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pour votre ambassadeur
                  </div>
                </div>
              </div>
            </div>

            {referralInfo.total_earned > 0 && (
              <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Merci pour votre contribution !
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vos ventes ont permis à votre ambassadeur de gagner{" "}
                      {referralInfo.total_earned.toFixed(2)} €
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
