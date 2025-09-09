import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, EmptyState } from "../UI";
import supabase from "../../lib/supabase";
import { useTranslation } from "react-i18next";
import {
  Edit3,
  Eye,
  Briefcase,
  TrendingUp,
  DollarSign,
  ExternalLink,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Service {
  id: string;
  title: string;
  description: string;
  base_price: number;
  requires_brief: boolean;
  delivery_days: number;
  status: "draft" | "active" | "paused";
  category_id: string | null;
  created_at: string;
  // Statistiques simulées
  views?: number;
  orders?: number;
  revenue?: number;
}

interface ServicesTableProps {
  shopId: string;
}

export function ServicesTable({ shopId }: ServicesTableProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [shopId]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Ajouter des statistiques simulées pour la démo
      const servicesWithStats = (data || []).map((service) => ({
        ...service,
        views: Math.floor(Math.random() * 300) + 30,
        orders: Math.floor(Math.random() * 15),
        revenue: Math.floor(Math.random() * 2000) + 200,
      }));

      setServices(servicesWithStats);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error(t("servicesTable.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("type", "service");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return t("common.noCategory");
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || t("common.noCategory");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "draft":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "paused":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-muted-foreground bg-muted/10 border-border/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t("common.status.active");
      case "draft":
        return t("common.status.draft");
      case "paused":
        return t("common.status.paused");
      default:
        return status;
    }
  };

  const deleteService = async (serviceId: string, serviceTitle: string) => {
    if (
      !window.confirm(
        t("servicesTable.confirmDelete", { title: serviceTitle })
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      toast.success(t("servicesTable.deleteSuccess"));
      fetchServices(); // Recharger la liste
    } catch (error: any) {
      console.error("Error deleting:", error);
      toast.error(error.message || t("servicesTable.deleteError"));
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

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light text-foreground tracking-tight">
              {t("servicesTable.heading")}
            </h2>
            <Link to="/creator/services/new">
              <Button variant="primary" size="sm" icon={Briefcase}>
                {t("servicesTable.create")}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Briefcase}
            title={t("servicesTable.emptyTitle")}
            description={t("servicesTable.emptyDescription")}
            actionLabel={t("servicesTable.emptyAction")}
            actionIcon={Briefcase}
            onAction={() => navigate("/creator/services/new")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-light text-foreground tracking-tight">
            {t("servicesTable.headingCount", { count: services.length })}
          </h2>
          <Link to="/creator/services/new">
            <Button variant="primary" size="sm" icon={Briefcase}>
              {t("servicesTable.create")}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="glass rounded-2xl p-4 md:p-6 border border-border/30 hover:border-primary/20 transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                {/* Informations principales */}
                <div className="lg:col-span-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center border border-border/30">
                      <Briefcase className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-foreground truncate">
                          {service.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            service.status
                          )}`}
                        >
                          {getStatusLabel(service.status)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted/20 px-2 py-1 rounded-full">
                          {getCategoryName(service.category_id)}
                        </span>
                        <span className="bg-muted/20 px-2 py-1 rounded-full">
                          {t("common.days", { count: service.delivery_days })}
                        </span>
                        {service.requires_brief && (
                          <span className="bg-muted/20 px-2 py-1 rounded-full">
                            {t("common.briefRequired")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prix */}
                <div className="lg:col-span-2 flex lg:flex-col lg:items-center lg:justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-light text-foreground">
                      ${service.base_price}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("common.startingFrom")}
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-3 gap-4 lg:gap-2 text-center">
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm font-medium text-foreground">
                          {service.views}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{t("common.views")}</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-foreground">
                          {service.orders}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("common.orders")}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="h-4 w-4 text-primary mr-1" />
                        <span className="text-sm font-medium text-foreground">
                          ${service.revenue}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("common.revenue")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-1 flex lg:flex-col gap-2 lg:items-center lg:justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit3}
                    onClick={() =>
                      toast.info(t("servicesTable.editComingSoon"))
                    }
                  >
                    <span className="sr-only">{t("common.edit")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => navigate(`/service/${service.id}`)}
                  >
                    <span className="sr-only">{t("common.view")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => deleteService(service.id, service.title)}
                    className="text-red-500 hover:text-red-600 hover:border-red-500/30"
                  >
                    <span className="sr-only">{t("common.delete")}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
