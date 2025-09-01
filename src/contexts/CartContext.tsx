import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  item_type: 'product' | 'service';
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
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; qty: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, qty: action.payload.qty }
            : item
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      dispatch({ type: 'SET_ITEMS', payload: [] });
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log("🛒 Récupération du panier...");
      
      // Requête simple sans retry pour éviter les boucles
      const { data: cartItemsData, error: cartError } = await supabase
        .from('cart_items_enriched')
        .select('*')
        .eq('cart_id', user.id);

      if (cartError) {
        console.warn("⚠️ Erreur panier:", cartError.message);
        dispatch({ type: 'SET_ITEMS', payload: [] });
        return;
      }
      
      console.log("📦 Articles du panier récupérés:", cartItemsData?.length || 0);

      // Transform data directly from the view
      const cartItems: CartItem[] = (cartItemsData || []).map(item => ({
        id: item.id,
        item_type: item.item_type,
        item_id: item.item_id,
        qty: item.qty,
        unit_price: item.unit_price,
        currency: item.currency,
        metadata: item.metadata,
        title: item.title || 'Article inconnu',
        image_url: item.image_url || '',
        shop_name: item.shop_name || 'Boutique inconnue',
        shop_id: item.shop_id || '',
      }));

      dispatch({ type: 'SET_ITEMS', payload: cartItems });
      console.log("✅ Panier chargé avec succès");
    } catch (error) {
      console.warn('⚠️ Erreur panier:', error);
      dispatch({ type: 'SET_ITEMS', payload: [] });
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      const { data, error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: user.id,
            item_type: item.item_type,
            item_id: item.item_id,
            qty: item.qty,
            unit_price: item.unit_price,
            currency: item.currency,
            metadata: item.metadata,
          })
          .select()
          .single();

      if (error) throw error;

      const cartItem: CartItem = {
        id: data.id,
        ...item,
      };

      dispatch({ type: 'ADD_ITEM', payload: cartItem });
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const updateQuantity = async (itemId: string, qty: number) => {
    if (qty <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
          .from('cart_items')
          .update({ qty })
          .eq('id', itemId);

      if (error) throw error;

      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, qty } });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);

      if (error) throw error;

      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove from cart');
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', user.id);

      if (error) throw error;

      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getTotal = () => {
    return state.items.reduce((total, item) => total + (item.unit_price * item.qty), 0);
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
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}