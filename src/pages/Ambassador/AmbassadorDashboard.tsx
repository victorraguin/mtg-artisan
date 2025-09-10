import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabase";
import {
  Users,
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  Award,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import toast from "react-hot-toast";

interface AmbassadorData {
  id: string;
  referral_code: string;
  commission_rate: number;
  is_active: boolean;
  start_date: string;
  total_referrals: number;
  total_earnings: number;
  active_referrals: number;
  pending_earnings: number;
}

interface Referral {
  id: string;
  referred_user_id: string;
  referral_date: string;
  first_sale_date: string | null;
  total_earned: number;
  is_active: boolean;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

interface Commission {
  id: string;
  order_id: string;
  gross_amount: number;
  commission_ambassador: number;
  status: string;
  created_at: string;
  orders: {
    total: number;
    created_at: string;
    profiles: {
      display_name: string;
    };
  };
}

export function AmbassadorDashboard() {
  const { user } = useAuth();
  const [ambassadorData, setAmbassadorData] = useState<AmbassadorData | null>(
    null
  );
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      fetchAmbassadorData();
    }
  }, [user]);

  const fetchAmbassadorData = async () => {
    try {
      // Récupérer les données de l'ambassadeur
      const { data: ambassador, error: ambassadorError } = await supabase
        .from("ambassadors")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (ambassadorError) {
        console.error("Pas d'ambassadeur trouvé:", ambassadorError);
        return;
      }

      // Récupérer les référrals
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select(
          `
          *,
          profiles:referred_user_id(display_name, avatar_url)
        `
        )
        .eq("ambassador_id", ambassador.id);

      // Récupérer les commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from("payouts")
        .select(
          `
          *,
          orders:order_id(
            total,
            created_at,
            profiles:user_id(display_name)
          )
        `
        )
        .eq("ambassador_id", ambassador.id)
        .order("created_at", { ascending: false });

      if (referralsError) console.error("Erreur referrals:", referralsError);
      if (commissionsError)
        console.error("Erreur commissions:", commissionsError);

      // Calculer les statistiques
      const totalReferrals = referralsData?.length || 0;
      const activeReferrals =
        referralsData?.filter((r) => r.is_active)?.length || 0;
      const totalEarnings =
        commissionsData?.reduce(
          (sum, c) => sum + (c.commission_ambassador || 0),
          0
        ) || 0;
      const pendingEarnings =
        commissionsData
          ?.filter((c) => c.status === "en_attente")
          ?.reduce((sum, c) => sum + (c.commission_ambassador || 0), 0) || 0;

      setAmbassadorData({
        ...ambassador,
        total_referrals: totalReferrals,
        total_earnings: totalEarnings,
        active_referrals: activeReferrals,
        pending_earnings: pendingEarnings,
      });

      setReferrals(referralsData || []);
      setCommissions(commissionsData || []);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!ambassadorData) return;

    const link = `${window.location.origin}?ref=${ambassadorData.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Lien de parrainage copié !");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en_attente":
        return "text-yellow-500 bg-yellow-500/10";
      case "en_traitement":
        return "text-blue-500 bg-blue-500/10";
      case "paye":
        return "text-green-500 bg-green-500/10";
      case "echec":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "en_attente":
        return "En attente";
      case "en_traitement":
        return "En traitement";
      case "paye":
        return "Payé";
      case "echec":
        return "Échec";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!ambassadorData) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <Card className="text-center p-12">
          <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Pas encore ambassadeur
          </h3>
          <p className="text-muted-foreground/70 mb-4">
            Rejoignez notre programme d'ambassadeurs pour gagner des commissions
            !
          </p>
          <Button onClick={() => (window.location.href = "/ambassador/join")}>
            Devenir Ambassadeur
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center border border-primary/20">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-light text-foreground tracking-tight">
              Dashboard Ambassadeur
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              Suivez vos performances et gagnez des commissions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center p-6">
          <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="text-2xl font-light text-foreground mb-1">
            {ambassadorData.total_referrals}
          </div>
          <div className="text-muted-foreground/70 text-sm">
            Référrals totaux
          </div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-green-500/20">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-2xl font-light text-foreground mb-1">
            {ambassadorData.active_referrals}
          </div>
          <div className="text-muted-foreground/70 text-sm">Actifs</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-green-600/20">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-light text-foreground mb-1">
            {ambassadorData.total_earnings.toFixed(2)}€
          </div>
          <div className="text-muted-foreground/70 text-sm">Gains totaux</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-yellow-500/20">
            <DollarSign className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="text-2xl font-light text-foreground mb-1">
            {ambassadorData.pending_earnings.toFixed(2)}€
          </div>
          <div className="text-muted-foreground/70 text-sm">En attente</div>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="text-lg font-medium text-foreground flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Votre lien de parrainage
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-muted/20 rounded-lg border border-border/30 font-mono text-sm">
              {window.location.origin}?ref={ambassadorData.referral_code}
            </div>
            <Button onClick={copyReferralLink} size="sm">
              <Copy className="h-4 w-4 mr-1" />
              Copier
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Partagez ce lien pour gagner{" "}
            {(ambassadorData.commission_rate * 100).toFixed(1)}% de commission
            sur chaque vente !
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <Button
          variant={activeTab === "overview" ? "primary" : "outline"}
          onClick={() => setActiveTab("overview")}
        >
          Vue d'ensemble
        </Button>
        <Button
          variant={activeTab === "referrals" ? "primary" : "outline"}
          onClick={() => setActiveTab("referrals")}
        >
          Référrals ({referrals.length})
        </Button>
        <Button
          variant={activeTab === "commissions" ? "primary" : "outline"}
          onClick={() => setActiveTab("commissions")}
        >
          Commissions ({commissions.length})
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "referrals" && (
        <div className="space-y-4">
          {referrals.length === 0 ? (
            <Card className="text-center p-12">
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aucun référral
              </h3>
              <p className="text-muted-foreground/70">
                Partagez votre lien pour commencer à gagner des commissions !
              </p>
            </Card>
          ) : (
            referrals.map((referral) => (
              <Card key={referral.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {referral.profiles?.display_name || "Utilisateur"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Référé le{" "}
                          {new Date(referral.referral_date).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium text-foreground">
                        {referral.total_earned.toFixed(2)}€
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          referral.is_active
                            ? "text-green-500 bg-green-500/10"
                            : "text-gray-500 bg-gray-500/10"
                        }`}
                      >
                        {referral.is_active ? "Actif" : "Inactif"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "commissions" && (
        <div className="space-y-4">
          {commissions.length === 0 ? (
            <Card className="text-center p-12">
              <DollarSign className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aucune commission
              </h3>
              <p className="text-muted-foreground/70">
                Vos commissions apparaîtront ici une fois que vos référrals
                auront effectué des achats.
              </p>
            </Card>
          ) : (
            commissions.map((commission) => (
              <Card key={commission.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">
                        Commande de{" "}
                        {commission.orders?.profiles?.display_name || "Client"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(commission.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Commande: {commission.orders?.total.toFixed(2)}€
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium text-foreground">
                        +{commission.commission_ambassador.toFixed(2)}€
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          commission.status
                        )}`}
                      >
                        {getStatusText(commission.status)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
