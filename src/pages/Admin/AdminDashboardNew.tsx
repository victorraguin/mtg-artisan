import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabase";
import {
  Users,
  Package,
  Briefcase,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Shield,
  Settings,
  UserPlus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import DisputesDashboard from "./DisputesDashboard";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalProducts: 0,
    totalServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingReviews: 0,
    totalDisputes: 0,
    pendingDisputes: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [
        usersResult,
        creatorsResult,
        productsResult,
        servicesResult,
        ordersResult,
        allOrdersResult,
        disputesResult,
        pendingDisputesResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("profiles").select("id").eq("role", "creator"),
        supabase.from("products").select("id"),
        supabase.from("services").select("id"),
        supabase.from("orders").select("*, order_items(*)").limit(10),
        supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false }),
        supabase.from("disputes").select("id, status"),
        supabase
          .from("disputes")
          .select("id, status")
          .in("status", [
            "open",
            "pending_admin_review",
            "pending_buyer_closure",
            "pending_seller_closure",
          ]),
      ]);

      const totalRevenue =
        ordersResult.data?.reduce((sum, order) => sum + order.total, 0) || 0;

      setStats({
        totalUsers: usersResult.data?.length || 0,
        totalCreators: creatorsResult.data?.length || 0,
        totalProducts: productsResult.data?.length || 0,
        totalServices: servicesResult.data?.length || 0,
        totalOrders: allOrdersResult.data?.length || 0,
        totalRevenue,
        pendingReviews: 0,
        totalDisputes: disputesResult.data?.length || 0,
        pendingDisputes: pendingDisputesResult.data?.length || 0,
      });

      setRecentActivity(ordersResult.data || []);
      setAllOrders(allOrdersResult.data || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(allOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = allOrders.slice(startIndex, startIndex + ordersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center border border-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight">
              Administration
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              Gestion de la plateforme ManaShop
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "overview", label: "Vue d'ensemble", icon: TrendingUp },
            {
              key: "disputes",
              label: "Litiges",
              icon: AlertCircle,
              count: stats.pendingDisputes,
              urgent: false,
            },
            { key: "users", label: "Utilisateurs", icon: Users },
            { key: "orders", label: "Commandes", icon: Package },
            { key: "settings", label: "Paramètres", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    tab.urgent
                      ? "bg-orange-100 text-orange-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Utilisateurs
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Créateurs
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalCreators}
                    </p>
                  </div>
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Revenus totaux
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      ${stats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Litiges
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        stats.pendingDisputes > 0
                          ? "text-destructive"
                          : "text-foreground"
                      }`}
                    >
                      {stats.totalDisputes}
                    </p>
                    {stats.pendingDisputes > 0 && (
                      <p className="text-sm text-destructive">
                        {stats.pendingDisputes} en attente
                      </p>
                    )}
                  </div>
                  {stats.pendingDisputes > 0 && (
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-foreground">
                Actions Rapides
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => navigate("/admin/commissions")}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium">Commissions</h4>
                      <p className="text-sm text-muted-foreground">
                        Configurer les règles
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => navigate("/admin/ambassadors")}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium">Ambassadeurs</h4>
                      <p className="text-sm text-muted-foreground">
                        Programme de parrainage
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => setActiveTab("disputes")}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium">Gérer les litiges</h4>
                      <p className="text-sm text-muted-foreground">
                        {stats.pendingDisputes} en attente
                      </p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-foreground">
                    Activité Récente
                  </h3>
                  <Button variant="ghost" size="sm" onClick={fetchAdminData}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Commande #{order.id.slice(-8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {order.total?.toFixed(2)}€
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "disputes" && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-foreground">
                Gestion des Litiges
              </h3>
              <p className="text-sm text-muted-foreground">
                Gérez tous les litiges de la plateforme
              </p>
            </CardHeader>
            <CardContent>
              <DisputesDashboard />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-8">
          {/* Orders List with Pagination */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Toutes les Commandes
                </h3>
                <div className="text-sm text-muted-foreground">
                  {allOrders.length} commande{allOrders.length > 1 ? "s" : ""}{" "}
                  au total
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground/70">
                      Aucune commande trouvée
                    </p>
                  </div>
                ) : (
                  currentOrders.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg"
                    >
                      <div>
                        <h4 className="text-lg font-medium text-foreground">
                          Commande #{order.id.slice(-8)}
                        </h4>
                        <p className="text-muted-foreground/70 text-sm">
                          {new Date(order.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        <p className="text-muted-foreground/70 text-sm">
                          {order.order_items?.length || 0} article
                          {order.order_items?.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          ${order.total}
                        </div>
                        <div className="text-sm text-muted-foreground/70">
                          {order.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-10 h-10 p-0"
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-foreground">
              Gestion des Utilisateurs
            </h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground/60 mx-auto mb-4" />
              <h4 className="text-xl font-medium text-foreground mb-2">
                Gestion des utilisateurs
              </h4>
              <p className="text-muted-foreground">
                Cette fonctionnalité sera bientôt disponible.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "settings" && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-foreground">
              Paramètres de la Plateforme
            </h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-muted-foreground/60 mx-auto mb-4" />
              <h4 className="text-xl font-medium text-foreground mb-2">
                Paramètres système
              </h4>
              <p className="text-muted-foreground">
                Configuration avancée de la plateforme.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
