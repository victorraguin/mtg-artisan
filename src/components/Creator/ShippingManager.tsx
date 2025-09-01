import React, { useState, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, Input, Select } from "../UI";
import supabase from "../../lib/supabase";
import { Truck, Plus, Edit3, Trash2, Globe } from "lucide-react";
import toast from "react-hot-toast";

interface ShippingProfile {
  id: string;
  name: string;
  description: string | null;
  base_cost: number;
  free_shipping_threshold: number | null;
  is_default: boolean;
  created_at: string;
}

interface ShippingZone {
  id: string;
  profile_id: string;
  name: string;
  countries: string[];
  additional_cost: number;
  estimated_days_min: number;
  estimated_days_max: number;
}

interface ShippingManagerProps {
  shopId: string;
}

export function ShippingManager({ shopId }: ShippingManagerProps) {
  const [profiles, setProfiles] = useState<ShippingProfile[]>([]);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<ShippingProfile | null>(
    null
  );
  const [showNewProfile, setShowNewProfile] = useState(false);

  const [newProfile, setNewProfile] = useState({
    name: "",
    description: "",
    base_cost: 0,
    free_shipping_threshold: null as number | null,
    is_default: false,
  });

  useEffect(() => {
    fetchShippingData();
  }, [shopId]);

  const fetchShippingData = async () => {
    try {
      const [profilesResult, zonesResult] = await Promise.all([
        supabase
          .from("shipping_profiles")
          .select("*")
          .eq("shop_id", shopId)
          .order("is_default", { ascending: false }),
        supabase
          .from("shipping_zones")
          .select("*")
          .order("additional_cost", { ascending: true }),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (zonesResult.error) throw zonesResult.error;

      setProfiles(profilesResult.data || []);
      setZones(zonesResult.data || []);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données de livraison:",
        error
      );
      toast.error("Impossible de charger les paramètres de livraison");
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!newProfile.name.trim()) {
      toast.error("Le nom du profil est requis");
      return;
    }

    try {
      const { error } = await supabase.from("shipping_profiles").insert({
        shop_id: shopId,
        name: newProfile.name,
        description: newProfile.description || null,
        base_cost: newProfile.base_cost,
        free_shipping_threshold: newProfile.free_shipping_threshold,
        is_default: newProfile.is_default,
      });

      if (error) throw error;

      toast.success("Profil de livraison créé");
      setShowNewProfile(false);
      setNewProfile({
        name: "",
        description: "",
        base_cost: 0,
        free_shipping_threshold: null,
        is_default: false,
      });
      fetchShippingData();
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      toast.error(error.message || "Impossible de créer le profil");
    }
  };

  const deleteProfile = async (profileId: string, profileName: string) => {
    if (!window.confirm(`Supprimer le profil "${profileName}" ?`)) return;

    try {
      const { error } = await supabase
        .from("shipping_profiles")
        .delete()
        .eq("id", profileId);

      if (error) throw error;

      toast.success("Profil supprimé");
      fetchShippingData();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(error.message || "Impossible de supprimer le profil");
    }
  };

  const setDefaultProfile = async (profileId: string) => {
    try {
      // Désactiver tous les profils par défaut
      await supabase
        .from("shipping_profiles")
        .update({ is_default: false })
        .eq("shop_id", shopId);

      // Activer le nouveau profil par défaut
      const { error } = await supabase
        .from("shipping_profiles")
        .update({ is_default: true })
        .eq("id", profileId);

      if (error) throw error;

      toast.success("Profil par défaut mis à jour");
      fetchShippingData();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(error.message || "Impossible de mettre à jour le profil");
    }
  };

  if (loading) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-light text-foreground tracking-tight">
                Frais de Livraison
              </h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowNewProfile(true)}
            >
              Nouveau profil
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Formulaire de création */}
          {showNewProfile && (
            <div className="mb-6 p-4 border border-border/30 rounded-2xl bg-card/30">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Nouveau profil de livraison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom du profil *"
                  value={newProfile.name}
                  onChange={(e) =>
                    setNewProfile({ ...newProfile, name: e.target.value })
                  }
                  placeholder="ex: Livraison Standard"
                />
                <Input
                  label="Coût de base (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProfile.base_cost}
                  onChange={(e) =>
                    setNewProfile({
                      ...newProfile,
                      base_cost: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Input
                  label="Description"
                  value={newProfile.description}
                  onChange={(e) =>
                    setNewProfile({
                      ...newProfile,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description optionnelle"
                />
                <Input
                  label="Livraison gratuite à partir de (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProfile.free_shipping_threshold || ""}
                  onChange={(e) =>
                    setNewProfile({
                      ...newProfile,
                      free_shipping_threshold: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Optionnel"
                />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={newProfile.is_default}
                  onChange={(e) =>
                    setNewProfile({
                      ...newProfile,
                      is_default: e.target.checked,
                    })
                  }
                  className="rounded border-border/50 text-primary focus:ring-primary/20"
                />
                <label htmlFor="is_default" className="text-sm text-foreground">
                  Définir comme profil par défaut
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowNewProfile(false)}
                >
                  Annuler
                </Button>
                <Button variant="primary" onClick={createProfile}>
                  Créer le profil
                </Button>
              </div>
            </div>
          )}

          {/* Liste des profils */}
          {profiles.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Aucun profil de livraison configuré
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Créez votre premier profil pour définir vos frais de livraison
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`glass rounded-2xl p-4 border transition-all duration-300 ${
                    profile.is_default
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/30 hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-foreground">
                          {profile.name}
                        </h3>
                        {profile.is_default && (
                          <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full border border-primary/30">
                            Par défaut
                          </span>
                        )}
                      </div>
                      {profile.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {profile.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Coût de base: {profile.base_cost}€</span>
                        {profile.free_shipping_threshold && (
                          <span>
                            Gratuit à partir de:{" "}
                            {profile.free_shipping_threshold}€
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!profile.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultProfile(profile.id)}
                        >
                          Par défaut
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        onClick={() => deleteProfile(profile.id, profile.name)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations sur l'utilisation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-2">
                Comment ça marche ?
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  • Le profil par défaut sera appliqué à toutes les nouvelles
                  commandes
                </p>
                <p>
                  • Les frais de livraison sont calculés automatiquement lors du
                  checkout
                </p>
                <p>
                  • La livraison gratuite s'applique si le montant dépasse le
                  seuil défini
                </p>
                <p>
                  • Vous pouvez créer plusieurs profils pour différents types de
                  produits
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
