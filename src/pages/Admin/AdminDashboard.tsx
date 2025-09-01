import React, { useState, useEffect } from "react";
import supabase from "../../lib/supabase";
import {
  Users,
  Package,
  Briefcase,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Shield,
} from "lucide-react";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalProducts: 0,
    totalServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      ] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("profiles").select("id").eq("role", "creator"),
        supabase.from("products").select("id"),
        supabase.from("services").select("id"),
        supabase.from("orders").select("*, order_items(*)"),
      ]);

      const totalRevenue =
        ordersResult.data?.reduce((sum, order) => sum + order.total, 0) || 0;

      setStats({
        totalUsers: usersResult.data?.length || 0,
        totalCreators: creatorsResult.data?.length || 0,
        totalProducts: productsResult.data?.length || 0,
        totalServices: servicesResult.data?.length || 0,
        totalOrders: ordersResult.data?.length || 0,
        totalRevenue,
        pendingReviews: 0,
      });

      setRecentOrders(ordersResult.data?.slice(0, 10) || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
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
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center border border-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight">
              Admin Panel
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              Gestion des boutiques ManaShop
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-sm">
            Utilisateurs totaux
          </div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {stats.totalCreators.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-sm">Créateurs</div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            {(stats.totalProducts + stats.totalServices).toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-sm">
            Produits & Services
          </div>
        </Card>

        <Card className="text-center p-6">
          <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <div className="text-3xl font-light text-foreground mb-2">
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <div className="text-muted-foreground/70 text-sm">Revenus totaux</div>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-foreground tracking-tight">
            Commandes Récentes
          </h2>
          <Button variant="outline" size="sm">
            Voir toutes
          </Button>
        </div>

        <div className="space-y-4">
          {recentOrders.length === 0 ? (
            <Card className="text-center p-12">
              <Package className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground/70">
                Aucune commande récente
              </p>
            </Card>
          ) : (
            recentOrders.map((order) => (
              <Card key={order.id} hover className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-light text-foreground">
                      Commande #{order.id.slice(-8)}
                    </h3>
                    <p className="text-muted-foreground/70 text-sm">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-muted-foreground/70 text-sm">
                      {order.order_items?.length || 0} article
                      {order.order_items?.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-light text-foreground">
                      ${order.total}
                    </div>
                    <div className="text-sm text-muted-foreground/70">
                      {order.status}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-light text-foreground tracking-tight mb-6">
          Actions Rapides
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center hover cursor-pointer">
            <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-light text-foreground mb-2">
              Gérer les Utilisateurs
            </h3>
            <p className="text-muted-foreground/70 text-sm">
              Voir et modifier les profils utilisateurs
            </p>
          </Card>

          <Card className="p-6 text-center hover cursor-pointer">
            <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-light text-foreground mb-2">
              Modérer le Contenu
            </h3>
            <p className="text-muted-foreground/70 text-sm">
              Examiner et approuver les produits
            </p>
          </Card>

          <Card className="p-6 text-center hover cursor-pointer">
            <div className="glass w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-light text-foreground mb-2">
              Rapports
            </h3>
            <p className="text-muted-foreground/70 text-sm">
              Analyser les performances
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
