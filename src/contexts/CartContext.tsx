import React, { createContext, useContext, useReducer, useEffect } from "react";
import supabase from "../lib/supabase";
import { useAuth } from "./AuthContext";
import analyticsService from "../services/analytics";
import { StockNotificationService } from "../services/stockNotificationService";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export interface CartItem {
  id: string;
  item_type: "product" | "service";
  item_id: string;
  qty: number;
  unit_price: number;
  currency: string;
  metadata: any;
  title: string;
  image_url: string;
  shop_name: string;
  shop_id: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_ITEM"; payload: { id: string; qty: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ITEMS":
      return { ...state, items: action.payload, loading: false };
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.payload] };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, qty: action.payload.qty }
            : item
        ),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
};

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (item: Omit<CartItem, "id">) => Promise<void>;
  updateQuantity: (itemId: string, qty: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
  });
  const { user, authStable } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    // Attendre que l'auth soit stable avant de récupérer le panier
    if (!authStable) return;

    if (user?.id) {
      console.log("🛒 Récupération du panier pour:", user.id);
      fetchCart();
    } else {
      dispatch({ type: "SET_ITEMS", payload: [] });
    }
  }, [user?.id, authStable]); // Dépendance sur l'ID et l'état stable

  const fetchCart = async () => {
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      console.log("🛒 Récupération du panier...");

      // Lecture directe de cart_items pour éviter les soucis de RLS
      const { data: cartItemsData, error: cartError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", user.id);

      if (cartError) {
        console.warn("⚠️ Erreur panier:", cartError.message);
        dispatch({ type: "SET_ITEMS", payload: [] });
        return;
      }

      console.log(
        "📦 Articles du panier récupérés:",
        cartItemsData?.length || 0
      );

      // Les détails (titre, image, boutique) sont stockés dans metadata
      const cartItems: CartItem[] = (cartItemsData || []).map((item) => ({
        id: item.id,
        item_type: item.item_type,
        item_id: item.item_id,
        qty: item.qty,
        unit_price: item.unit_price,
        currency: item.currency,
        metadata: item.metadata,
        title: item.metadata?.title || t("cart.unknownItem"),
        image_url: item.metadata?.image_url || "",
        shop_name: item.metadata?.shop_name || t("cart.unknownShop"),
        shop_id: item.metadata?.shop_id || "",
      }));

      dispatch({ type: "SET_ITEMS", payload: cartItems });
      console.log("✅ Panier chargé avec succès");
    } catch (error) {
      console.warn("⚠️ Erreur panier:", error);
      dispatch({ type: "SET_ITEMS", payload: [] });
    }
  };

  const addToCart = async (item: Omit<CartItem, "id">) => {
    if (!user) {
      toast.error(t("cart.mustSignIn"));
      return;
    }

    // Vérifier le stock disponible pour les produits physiques
    if (item.item_type === "product") {
      try {
        const stockInfo = await analyticsService.checkStockAvailability(
          item.item_id,
          item.qty
        );

        if (!stockInfo.available) {
          toast.error(
            t("cart.stockInsufficient", {
              stock: stockInfo.availableStock,
            })
          );
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du stock:", error);
        toast.error(t("cart.stockCheckError"));
        return;
      }
    }

    try {
      const metadataToStore = {
        ...item.metadata,
        title: item.title,
        image_url: item.image_url,
        shop_name: item.shop_name,
        shop_id: item.shop_id,
      };

      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          cart_id: user.id,
          item_type: item.item_type,
          item_id: item.item_id,
          qty: item.qty,
          unit_price: item.unit_price,
          currency: item.currency,
          metadata: metadataToStore,
        })
        .select()
        .single();

      if (error) throw error;

      const cartItem: CartItem = {
        id: data.id,
        ...item,
        metadata: metadataToStore,
      };

      dispatch({ type: "ADD_ITEM", payload: cartItem });

      // Tracker l'ajout au panier pour les analytics
      if (item.item_type === "product") {
        analyticsService.trackCartAddition(item.item_id, item.qty, user.id);
        // Vérifier le stock et envoyer des notifications si nécessaire
        StockNotificationService.checkStockAfterCartAction(item.item_id);
      }

      toast.success(t("cart.addSuccess"));
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast.error(t("cart.addError"));
    }
  };

  const updateQuantity = async (itemId: string, qty: number) => {
    if (qty <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ qty })
        .eq("id", itemId);

      if (error) throw error;

      dispatch({ type: "UPDATE_ITEM", payload: { id: itemId, qty } });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error(t("cart.updateError"));
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      // Récupérer les informations de l'article avant suppression pour le tracking
      const itemToRemove = state.items.find((item) => item.id === itemId);

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      dispatch({ type: "REMOVE_ITEM", payload: itemId });

      // Tracker la suppression du panier pour les analytics
      if (itemToRemove?.item_type === "product") {
        analyticsService.trackCartRemoval(itemToRemove.item_id, user?.id);
      }

      toast.success(t("cart.removeSuccess"));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(t("cart.removeError"));
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", user.id);

      if (error) throw error;

      dispatch({ type: "CLEAR_CART" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error(t("cart.clearError"));
    }
  };

  const getTotal = () => {
    return state.items.reduce(
      (total, item) => total + item.unit_price * item.qty,
      0
    );
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.qty, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        loading: state.loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
