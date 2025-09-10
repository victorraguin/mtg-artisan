import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabase";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  MessageSquare,
  Edit,
  Eye,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Home,
} from "lucide-react";
import Chat from "../../components/Chat";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import toast from "react-hot-toast";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import { useClickOutside } from "../../hooks/useClickOutside";

import { OrderItemWithDetails } from "../../types";

interface OrderItemManagement extends OrderItemWithDetails {
  // Étendre si nécessaire pour des propriétés spécifiques à la gestion
}

export function OrdersManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItemManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] =
    useState<OrderItemManagement | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    tracking: "",
  });

  // Empêcher le scroll du body quand la modal est ouverte
  useModalScrollLock(showChatModal);

  // Fermer la modal en cliquant en dehors
  const chatModalRef = useClickOutside(showChatModal, () => {
    setShowChatModal(false);
    setSelectedOrder(null);
  });

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const shopId = await getShopId();
      if (!shopId) {
        setOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
          *,
          order:orders(
            id,
            user_id,
            total,
            status,
            created_at,
            profiles:user_id(
              display_name,
              avatar_url,
              shipping_address,
              shipping_city,
              shipping_postal_code,
              shipping_country
            )
          )
        `
        )
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Récupérer les détails des produits et services séparément
      const enrichedData = await Promise.all(
        (data || []).map(async (item) => {
          let productData = null;
          let serviceData = null;

          if (item.item_type === "product") {
            const { data: product } = await supabase
              .from("products")
              .select("title, images")
              .eq("id", item.item_id)
              .single();
            productData = product;
          } else if (item.item_type === "service") {
            const { data: service } = await supabase
              .from("services")
              .select("title")
              .eq("id", item.item_id)
              .single();
            serviceData = service;
          }

          return {
            ...item,
            product: productData,
            service: serviceData,
          };
        })
      );

      setOrders(enrichedData);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const getShopId = async () => {
    const { data } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user?.id)
      .single();
    return data?.id;
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      const updates: any = {
        status: updateForm.status,
      };

      if (updateForm.tracking) {
        updates.tracking = updateForm.tracking;
      }

      if (updateForm.status === "delivered") {
        updates.delivered_at = new Date().toISOString();
        // Marquer comme livré dans le système d'escrow
        await supabase.functions.invoke("markDelivered", {
          body: { orderId: selectedOrder.order_id },
        });
      }

      const { error } = await supabase
        .from("order_items")
        .update(updates)
        .eq("id", selectedOrder.id);

      if (error) throw error;

      toast.success("Commande mise à jour avec succès");
      setShowUpdateModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const openUpdateModal = (order: OrderItemManagement) => {
    setSelectedOrder(order);
    setUpdateForm({
      status: order.status,
      tracking: order.tracking || "",
    });
    setShowUpdateModal(true);
  };

  const openChatModal = (order: OrderItemManagement) => {
    setSelectedOrder(order);
    setShowChatModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      case "in_progress":
        return "text-blue-500 bg-blue-500/10";
      case "shipped":
        return "text-purple-500 bg-purple-500/10";
      case "delivered":
        return "text-green-500 bg-green-500/10";
      case "completed":
        return "text-green-600 bg-green-600/10";
      case "disputed":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "in_progress":
        return "En cours";
      case "shipped":
        return "Expédié";
      case "delivered":
        return "Livré";
      case "completed":
        return "Terminé";
      case "disputed":
        return "Litige";
      default:
        return status;
    }
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.status === activeTab);

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
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-light text-foreground tracking-tight">
              Gestion des Commandes
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              Gérez et suivez toutes vos commandes reçues
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-4">
          <div className="text-2xl font-light text-foreground mb-1">
            {orders.length}
          </div>
          <div className="text-muted-foreground/70 text-xs">Total</div>
        </Card>

        <Card className="text-center p-4">
          <div className="text-2xl font-light text-foreground mb-1">
            {orders.filter((o) => o.status === "pending").length}
          </div>
          <div className="text-muted-foreground/70 text-xs">En attente</div>
        </Card>

        <Card className="text-center p-4">
          <div className="text-2xl font-light text-foreground mb-1">
            {
              orders.filter((o) =>
                ["in_progress", "shipped"].includes(o.status)
              ).length
            }
          </div>
          <div className="text-muted-foreground/70 text-xs">En cours</div>
        </Card>

        <Card className="text-center p-4">
          <div className="text-2xl font-light text-foreground mb-1">
            {
              orders.filter((o) =>
                ["delivered", "completed"].includes(o.status)
              ).length
            }
          </div>
          <div className="text-muted-foreground/70 text-xs">Terminées</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          "all",
          "pending",
          "in_progress",
          "shipped",
          "delivered",
          "completed",
          "disputed",
        ].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "Toutes" : getStatusText(tab)}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center p-12">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucune commande
            </h3>
            <p className="text-muted-foreground/70">
              {activeTab === "all"
                ? "Vous n'avez reçu aucune commande pour le moment."
                : `Aucune commande avec le statut "${getStatusText(
                    activeTab
                  )}".`}
            </p>
          </Card>
        ) : (
          filteredOrders.map((orderItem) => (
            <Card key={orderItem.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {orderItem.order.profiles?.display_name || "Client"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(orderItem.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                        orderItem.status
                      )}`}
                    >
                      {getStatusText(orderItem.status)}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openChatModal(orderItem)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openUpdateModal(orderItem)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Gérer
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product/Service Info */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Package className="h-4 w-4 text-primary" />
                      <h5 className="font-medium text-foreground">
                        Détails de la commande
                      </h5>
                    </div>
                    <div className="bg-card rounded-xl p-4 border border-border/30">
                      <h4 className="font-medium text-foreground mb-3">
                        {orderItem.item_type === "product"
                          ? orderItem.product?.title
                          : orderItem.service?.title}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Quantité:
                          </span>
                          <span className="text-foreground font-medium">
                            {orderItem.qty}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Prix unitaire:
                          </span>
                          <span className="text-foreground font-medium">
                            {orderItem.unit_price}€
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border/30 pt-2">
                          <span className="text-foreground font-medium">
                            Total:
                          </span>
                          <span className="text-primary font-bold">
                            {(orderItem.unit_price * orderItem.qty).toFixed(2)}€
                          </span>
                        </div>
                        {orderItem.tracking && (
                          <div className="mt-3 pt-3 border-t border-border/30">
                            <div className="flex items-center space-x-2 mb-2">
                              <Truck className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-foreground">
                                Numéro de suivi
                              </span>
                            </div>
                            <p className="text-sm font-mono bg-muted/30 rounded px-2 py-1">
                              {orderItem.tracking}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <h5 className="font-medium text-foreground">
                        Adresse de livraison
                      </h5>
                    </div>
                    {orderItem.order.profiles?.shipping_address ? (
                      <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <Home className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-foreground font-medium">
                                {orderItem.order.profiles.shipping_address}
                              </p>
                              <p className="text-muted-foreground">
                                {[
                                  orderItem.order.profiles.shipping_city,
                                  orderItem.order.profiles.shipping_postal_code,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              </p>
                              {orderItem.order.profiles.shipping_country && (
                                <p className="text-muted-foreground font-medium">
                                  {orderItem.order.profiles.shipping_country}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">
                            Adresse de livraison non renseignée
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <h3 className="text-lg font-medium text-foreground">
                Mettre à jour la commande
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Statut
                </label>
                <Select
                  value={updateForm.status}
                  onChange={(value) =>
                    setUpdateForm({ ...updateForm, status: value })
                  }
                  options={[
                    { value: "pending", label: "En attente" },
                    { value: "in_progress", label: "En cours" },
                    { value: "shipped", label: "Expédié" },
                    { value: "delivered", label: "Livré" },
                  ]}
                  placeholder="Sélectionner un statut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Numéro de suivi (optionnel)
                </label>
                <Input
                  value={updateForm.tracking}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, tracking: e.target.value })
                  }
                  placeholder="Ex: 1Z999AA1234567890"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleStatusUpdate} className="flex-1">
                  Mettre à jour
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card
            ref={chatModalRef}
            className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Conversation - Commande #{selectedOrder.order_id.slice(-6)}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  Fermer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-96 flex flex-col">
              <Chat
                orderId={selectedOrder.order_id}
                userId={user?.id || ""}
                context="order"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
