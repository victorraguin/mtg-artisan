import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabase";
import {
  ArrowLeft,
  UserPlus,
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import toast from "react-hot-toast";

interface FormState {
  user_id: string;
  created_user_id: string;
  commission_rate: number;
  end_date?: string;
}

interface Ambassador {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  // Relations
  profile?: {
    display_name: string;
    email: string;
  };
  // Stats calculées
  total_referrals?: number;
  total_earned?: number;
  active_referrals?: number;
}

export default function AmbassadorsConfig() {
  const navigate = useNavigate();
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingAmbassador, setEditingAmbassador] = useState<Ambassador | null>(
    null
  );
  const [form, setForm] = useState({
    commission_rate: 0.05,
    end_date: "",
    is_active: true,
  });

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const fetchAmbassadors = async () => {
    try {
      setLoading(true);

      // Récupérer les ambassadeurs avec leurs profils et statistiques
      const { data, error } = await supabase
        .from("ambassadors")
        .select(
          `
          *,
          profile:profiles!ambassadors_user_id_fkey(display_name, email)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Pour chaque ambassadeur, récupérer les statistiques de parrainage
      const ambassadorsWithStats = await Promise.all(
        (data || []).map(async (ambassador) => {
          const { data: referrals, error: referralsError } = await supabase
            .from("referrals")
            .select("id, total_earned, is_active, first_sale_date")
            .eq("ambassador_id", ambassador.id);

          if (referralsError) {
            console.error(
              "Erreur lors du chargement des parrainages:",
              referralsError
            );
            return {
              ...ambassador,
              total_referrals: 0,
              total_earned: 0,
              active_referrals: 0,
            };
          }

          return {
            ...ambassador,
            total_referrals: referrals?.length || 0,
            total_earned:
              referrals?.reduce((sum, r) => sum + (r.total_earned || 0), 0) ||
              0,
            active_referrals:
              referrals?.filter((r) => r.is_active && r.first_sale_date)
                .length || 0,
          };
        })
      );

      setAmbassadors(ambassadorsWithStats);
    } catch (error) {
      console.error("Erreur lors du chargement des ambassadeurs:", error);
      toast.error("Erreur lors du chargement des ambassadeurs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmbassador) return;

    try {
      setSubmitting(true);

      const updateData = {
        commission_rate: form.commission_rate,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("ambassadors")
        .update(updateData)
        .eq("id", editingAmbassador.id);

      if (error) throw error;
      toast.success("Ambassadeur mis à jour avec succès");

      resetForm();
      fetchAmbassadors();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      commission_rate: 0.05,
      end_date: "",
      is_active: true,
    });
    setEditingAmbassador(null);
  };

  const handleEdit = (ambassador: Ambassador) => {
    setForm({
      commission_rate: ambassador.commission_rate,
      end_date: ambassador.end_date
        ? new Date(ambassador.end_date).toISOString().split("T")[0]
        : "",
      is_active: ambassador.is_active,
    });
    setEditingAmbassador(ambassador);
  };

  const toggleAmbassadorStatus = async (ambassador: Ambassador) => {
    try {
      const { error } = await supabase
        .from("ambassadors")
        .update({
          is_active: !ambassador.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ambassador.id);

      if (error) throw error;

      toast.success(
        `Ambassadeur ${
          !ambassador.is_active ? "activé" : "désactivé"
        } avec succès`
      );
      fetchAmbassadors();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Calculer les statistiques
  const stats = {
    totalAmbassadors: ambassadors.length,
    activeAmbassadors: ambassadors.filter((a) => a.is_active).length,
    totalReferrals: ambassadors.reduce(
      (sum, a) => sum + (a.total_referrals || 0),
      0
    ),
    totalEarned: ambassadors.reduce((sum, a) => sum + (a.total_earned || 0), 0),
    averageRate:
      ambassadors.length > 0
        ? ambassadors.reduce((sum, a) => sum + a.commission_rate, 0) /
          ambassadors.length
        : 0,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center border border-primary/20">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight">
              Programme d'Ambassadeurs
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              Gérer les liens ambassadeur-créateur et leurs commissions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.totalAmbassadors}
          </div>
          <div className="text-muted-foreground/70 text-sm">
            Ambassadeurs totaux
          </div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.activeAmbassadors}
          </div>
          <div className="text-muted-foreground/70 text-sm">
            Ambassadeurs actifs
          </div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.totalReferrals}
          </div>
          <div className="text-muted-foreground/70 text-sm">
            Parrainages totaux
          </div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.totalEarned.toFixed(2)} €
          </div>
          <div className="text-muted-foreground/70 text-sm">Total versé</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <CardHeader>
              <h2 className="text-2xl font-light text-foreground tracking-tight">
                {editingAmbassador
                  ? "Modifier l'ambassadeur"
                  : "Gestion des ambassadeurs"}
              </h2>
              <p className="text-muted-foreground/70 text-sm">
                {editingAmbassador
                  ? "Modifiez les paramètres de cet ambassadeur"
                  : "Les utilisateurs deviennent automatiquement ambassadeurs en créant leur lien de parrainage"}
              </p>
            </CardHeader>
            <CardContent>
              {editingAmbassador ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      label="Taux de commission (%)"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={form.commission_rate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          commission_rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Ex: 5.00"
                    />
                  </div>

                  <div>
                    <Input
                      label="Date de fin (optionnelle)"
                      type="date"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
                      }
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm font-medium text-foreground"
                    >
                      Ambassadeur actif
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      loading={submitting}
                      className="flex-1"
                    >
                      Mettre à jour
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground/70 mb-2">
                    Système automatisé
                  </p>
                  <p className="text-sm text-muted-foreground/50">
                    Les utilisateurs créent leur propre lien de parrainage.
                    Sélectionnez un ambassadeur pour modifier ses paramètres.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Liste des ambassadeurs */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <CardHeader>
              <h2 className="text-2xl font-light text-foreground tracking-tight">
                Ambassadeurs ({ambassadors.length})
              </h2>
            </CardHeader>
            <CardContent>
              {ambassadors.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground/70">
                    Aucun ambassadeur pour le moment
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ambassadors.map((ambassador) => (
                    <Card key={ambassador.id} className="p-4 hover">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center border border-primary/20">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-foreground">
                              {ambassador.profile?.display_name ||
                                "Ambassadeur"}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Code: {ambassador.referral_code}</span>
                              <span>
                                Taux:{" "}
                                {(ambassador.commission_rate * 100).toFixed(1)}%
                              </span>
                              <span>
                                {ambassador.total_referrals || 0} parrainages
                              </span>
                              <span>
                                {ambassador.total_earned?.toFixed(2) || "0.00"}{" "}
                                € gagnés
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                              <span>
                                Depuis:{" "}
                                {new Date(
                                  ambassador.start_date
                                ).toLocaleDateString()}
                              </span>
                              {ambassador.end_date && (
                                <span>
                                  Jusqu'au:{" "}
                                  {new Date(
                                    ambassador.end_date
                                  ).toLocaleDateString()}
                                </span>
                              )}
                              <span>
                                {ambassador.active_referrals || 0} parrainés
                                actifs
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAmbassadorStatus(ambassador)}
                            className={
                              ambassador.is_active
                                ? "text-orange-600"
                                : "text-green-600"
                            }
                          >
                            {ambassador.is_active ? "Désactiver" : "Activer"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(ambassador)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ambassador.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {ambassador.is_active ? "Actif" : "Inactif"}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
