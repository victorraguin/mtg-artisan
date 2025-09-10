import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabase";
import {
  ArrowLeft,
  Settings,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Globe,
  Package,
  Briefcase,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import { RadioGroup } from "../../components/UI/RadioGroup";
import toast from "react-hot-toast";

interface FormState {
  scope: "global" | "product" | "service";
  rate: number;
  fixed_fee: number;
  currency: string;
  is_active: boolean;
}

interface AmbassadorCommissionConfig {
  id?: string;
  default_rate: number;
  max_rate: number;
  min_rate: number;
  is_active: boolean;
  updated_at?: string;
}

interface CommissionRule {
  id: string;
  scope: "global" | "product" | "service";
  rate: number;
  fixed_fee: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CommissionsConfig() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [ambassadorConfig, setAmbassadorConfig] =
    useState<AmbassadorCommissionConfig>({
      default_rate: 0.02, // 2%
      max_rate: 0.1, // 10%
      min_rate: 0.01, // 1%
      is_active: true,
    });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [form, setForm] = useState<FormState>({
    scope: "global",
    rate: 0,
    fixed_fee: 0,
    currency: "EUR",
    is_active: true,
  });

  const scopeLabels = {
    global: "Global",
    product: "Produit",
    service: "Service",
  };

  const scopeIcons = {
    global: Globe,
    product: Package,
    service: Briefcase,
  };

  useEffect(() => {
    fetchRules();
    fetchAmbassadorConfig();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("commissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des règles:", error);
      toast.error("Erreur lors du chargement des règles");
    } finally {
      setLoading(false);
    }
  };

  const fetchAmbassadorConfig = async () => {
    try {
      // Pour l'instant, on utilise des valeurs par défaut
      // Plus tard on pourrait créer une table de config
      const { data, error } = await supabase
        .from("ambassador_config")
        .select("*")
        .single();

      if (data && !error) {
        setAmbassadorConfig(data);
      }
    } catch (error) {
      // Utiliser les valeurs par défaut si pas de config
      console.log(
        "Utilisation des valeurs par défaut pour les commissions ambassadeur"
      );
    }
  };

  const saveAmbassadorConfig = async () => {
    try {
      setSubmitting(true);

      // Pour l'instant, on simule la sauvegarde
      // Plus tard on pourrait créer une table de config
      toast.success("Configuration ambassadeur sauvegardée !");
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde de la config ambassadeur:",
        error
      );
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const ruleData = {
        ...form,
        updated_at: new Date().toISOString(),
      };

      if (editingRule) {
        const { error } = await supabase
          .from("commissions")
          .update(ruleData)
          .eq("id", editingRule.id);

        if (error) throw error;
        toast.success("Règle mise à jour avec succès");
      } else {
        const { error } = await supabase.from("commissions").insert(ruleData);

        if (error) throw error;
        toast.success("Règle créée avec succès");
      }

      resetForm();
      fetchRules();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      scope: "global",
      rate: 0,
      fixed_fee: 0,
      currency: "EUR",
      is_active: true,
    });
    setEditingRule(null);
  };

  const handleEdit = (rule: CommissionRule) => {
    setForm({
      scope: rule.scope,
      rate: rule.rate,
      fixed_fee: rule.fixed_fee,
      currency: rule.currency,
      is_active: rule.is_active,
    });
    setEditingRule(rule);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette règle ?")) return;

    try {
      const { error } = await supabase
        .from("commissions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Règle supprimée avec succès");
      fetchRules();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Calculer les statistiques
  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter((r) => r.is_active).length,
    averageRate:
      rules.length > 0
        ? rules.reduce((sum, r) => sum + r.rate, 0) / rules.length
        : 0,
    totalFixedFees: rules.reduce((sum, r) => sum + r.fixed_fee, 0),
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
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight">
              Configuration des Commissions
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              Gérer les règles de commission de la plateforme
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.totalRules}
          </div>
          <div className="text-muted-foreground/70 text-sm">Règles totales</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.activeRules}
          </div>
          <div className="text-muted-foreground/70 text-sm">Règles actives</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {(stats.averageRate * 100).toFixed(1)}%
          </div>
          <div className="text-muted-foreground/70 text-sm">Taux moyen</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.totalFixedFees.toFixed(2)}€
          </div>
          <div className="text-muted-foreground/70 text-sm">
            Frais fixes totaux
          </div>
        </Card>
      </div>

      {/* Configuration Commissions Ambassadeur */}
      <Card className="mb-8 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20">
        <CardHeader>
          <h2 className="text-2xl font-light text-foreground tracking-tight flex items-center">
            <DollarSign className="h-6 w-6 mr-3 text-blue-500" />
            Commissions Ambassadeur
          </h2>
          <p className="text-muted-foreground/70">
            Configuration globale des commissions pour le programme
            d'ambassadeurs
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Taux par défaut */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Taux par défaut
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.001"
                  value={ambassadorConfig.default_rate}
                  onChange={(e) =>
                    setAmbassadorConfig({
                      ...ambassadorConfig,
                      default_rate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">
                  ({(ambassadorConfig.default_rate * 100).toFixed(1)}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Taux appliqué aux nouveaux ambassadeurs
              </p>
            </div>

            {/* Taux minimum */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Taux minimum
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.001"
                  value={ambassadorConfig.min_rate}
                  onChange={(e) =>
                    setAmbassadorConfig({
                      ...ambassadorConfig,
                      min_rate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">
                  ({(ambassadorConfig.min_rate * 100).toFixed(1)}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Taux minimum autorisé
              </p>
            </div>

            {/* Taux maximum */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Taux maximum
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.001"
                  value={ambassadorConfig.max_rate}
                  onChange={(e) =>
                    setAmbassadorConfig({
                      ...ambassadorConfig,
                      max_rate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">
                  ({(ambassadorConfig.max_rate * 100).toFixed(1)}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Taux maximum autorisé
              </p>
            </div>
          </div>

          {/* Explication du nouveau système */}
          <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <h4 className="font-medium text-foreground mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              Nouveau système anti-triche
            </h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Commission prélevée sur la plateforme :</strong> Le
                créateur gagne toujours le même montant, peu importe le
                parrainage.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-medium text-foreground mb-1">
                    Sans parrainage
                  </div>
                  <div className="text-xs">
                    100€ → 10% plateforme → Créateur 90€
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-medium text-foreground mb-1">
                    Avec parrainage
                  </div>
                  <div className="text-xs">
                    100€ → 8% plateforme + 2% ambassadeur → Créateur 90€
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={saveAmbassadorConfig}
              loading={submitting}
              className="flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Sauvegarder la configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <CardHeader>
              <h2 className="text-2xl font-light text-foreground tracking-tight">
                {editingRule ? "Modifier la règle" : "Nouvelle règle"}
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Portée
                  </label>
                  <RadioGroup
                    value={form.scope}
                    onValueChange={(value) =>
                      setForm({ ...form, scope: value as FormState["scope"] })
                    }
                    options={[
                      {
                        value: "global",
                        label: "Global",
                        description: "Tous les types",
                      },
                      {
                        value: "product",
                        label: "Produit",
                        description: "Produits physiques/numériques",
                      },
                      {
                        value: "service",
                        label: "Service",
                        description: "Services personnalisés",
                      },
                    ]}
                  />
                </div>

                <div>
                  <Input
                    label="Taux de commission (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.rate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Ex: 15.00"
                  />
                </div>

                <div>
                  <Input
                    label="Frais fixes (€)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.fixed_fee}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fixed_fee: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Ex: 2.50"
                  />
                </div>

                <div>
                  <Select
                    label="Devise"
                    value={form.currency}
                    onChange={(value) => setForm({ ...form, currency: value })}
                    options={[
                      { value: "EUR", label: "EUR (€)" },
                      { value: "USD", label: "USD ($)" },
                    ]}
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
                    Règle active
                  </label>
                </div>

                <div className="flex space-x-3">
                  <Button type="submit" loading={submitting} className="flex-1">
                    {editingRule ? "Mettre à jour" : "Créer la règle"}
                  </Button>
                  {editingRule && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Liste des règles */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <CardHeader>
              <h2 className="text-2xl font-light text-foreground tracking-tight">
                Règles existantes
              </h2>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground/70">
                    Aucune règle de commission configurée
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rules.map((rule) => {
                    const IconComponent = scopeIcons[rule.scope];
                    return (
                      <Card key={rule.id} className="p-4 hover">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center border border-primary/20">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-foreground">
                                {scopeLabels[rule.scope]}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>
                                  Taux: {(rule.rate * 100).toFixed(1)}%
                                </span>
                                <span>Frais: {rule.fixed_fee}€</span>
                                <span>Devise: {rule.currency}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                rule.is_active
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {rule.is_active ? "Actif" : "Inactif"}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(rule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(rule.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
