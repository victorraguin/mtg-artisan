import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Save, User, MapPin, Phone, Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Card, CardHeader, CardContent } from "../components/UI/Card";

export function Profile() {
  const { profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    country: profile?.country || "",
    shipping_name: profile?.shipping_name || "",
    shipping_address: profile?.shipping_address || "",
    shipping_city: profile?.shipping_city || "",
    shipping_postal_code: profile?.shipping_postal_code || "",
    shipping_country: profile?.shipping_country || "",
    phone: profile?.phone || "",
  });

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
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
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
            {/* Informations de contact */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                Informations de contact
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Numéro de téléphone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+33 6 12 34 56 78"
                  id="phone"
                />
              </div>
            </div>

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

            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                icon={Save}
                loading={saving}
              >
                {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
