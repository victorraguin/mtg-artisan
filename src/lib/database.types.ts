export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'buyer' | 'creator' | 'admin'
          display_name: string | null
          avatar_url: string | null
          country: string | null
          bio: string | null
          shipping_name: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_postal_code: string | null
          shipping_country: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: 'buyer' | 'creator' | 'admin'
          display_name?: string | null
          avatar_url?: string | null
          country?: string | null
          bio?: string | null
          shipping_name?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_postal_code?: string | null
          shipping_country?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'buyer' | 'creator' | 'admin'
          display_name?: string | null
          avatar_url?: string | null
          country?: string | null
          bio?: string | null
          shipping_name?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_postal_code?: string | null
          shipping_country?: string | null
          phone?: string | null
          created_at?: string
        }
      }
      shops: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          banner_url: string | null
          logo_url: string | null
          bio: string | null
          policies: string | null
          shipping_profile_id: string | null
          paypal_merchant_id: string | null
          paypal_email: string | null
          is_verified: boolean
          rating_avg: number
          country: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          banner_url?: string | null
          logo_url?: string | null
          bio?: string | null
          policies?: string | null
          shipping_profile_id?: string | null
          paypal_merchant_id?: string | null
          paypal_email?: string | null
          is_verified?: boolean
          rating_avg?: number
          country?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          banner_url?: string | null
          logo_url?: string | null
          bio?: string | null
          policies?: string | null
          shipping_profile_id?: string | null
          paypal_merchant_id?: string | null
          paypal_email?: string | null
          is_verified?: boolean
          rating_avg?: number
          country?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: 'product' | 'service'
          mtg_scope: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'product' | 'service'
          mtg_scope?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'product' | 'service'
          mtg_scope?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          shop_id: string
          type: 'physical' | 'digital'
          title: string
          description: string
          price: number
          currency: string
          stock: number | null
          images: string[]
          category_id: string
          tags: string[]
          attributes: Json
          lead_time_days: number | null
          status: 'draft' | 'active' | 'paused' | 'sold_out'
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          type: 'physical' | 'digital'
          title: string
          description: string
          price: number
          currency?: string
          stock?: number | null
          images?: string[]
          category_id: string
          tags?: string[]
          attributes?: Json
          lead_time_days?: number | null
          status?: 'draft' | 'active' | 'paused' | 'sold_out'
          created_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          type?: 'physical' | 'digital'
          title?: string
          description?: string
          price?: number
          currency?: string
          stock?: number | null
          images?: string[]
          category_id?: string
          tags?: string[]
          attributes?: Json
          lead_time_days?: number | null
          status?: 'draft' | 'active' | 'paused' | 'sold_out'
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          shop_id: string
          title: string
          description: string
          base_price: number
          currency: string
          requires_brief: boolean
          delivery_days: number
          slots_config: Json | null
          category_id: string | null
          status: 'draft' | 'active' | 'paused'
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          title: string
          description: string
          base_price: number
          currency?: string
          requires_brief?: boolean
          delivery_days: number
          slots_config?: Json | null
          category_id?: string | null
          status?: 'draft' | 'active' | 'paused'
          created_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          title?: string
          description?: string
          base_price?: number
          currency?: string
          requires_brief?: boolean
          delivery_days?: number
          slots_config?: Json | null
          category_id?: string | null
          status?: 'draft' | 'active' | 'paused'
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total: number
          currency: string
          status: string
          paypal_order_id: string | null
          paypal_capture_id: string | null
          breakdown_by_shop: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total: number
          currency?: string
          status: string
          paypal_order_id?: string | null
          paypal_capture_id?: string | null
          breakdown_by_shop: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total?: number
          currency?: string
          status?: string
          paypal_order_id?: string | null
          paypal_capture_id?: string | null
          breakdown_by_shop?: Json
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          shop_id: string
          item_type: 'product' | 'service'
          item_id: string
          qty: number
          unit_price: number
          currency: string
          status: string
          tracking: string | null
          delivery_due_at: string | null
          delivered_at: string | null
          files: string[]
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          shop_id: string
          item_type: 'product' | 'service'
          item_id: string
          qty: number
          unit_price: number
          currency?: string
          status: string
          tracking?: string | null
          delivery_due_at?: string | null
          delivered_at?: string | null
          files?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          shop_id?: string
          item_type?: 'product' | 'service'
          item_id?: string
          qty?: number
          unit_price?: number
          currency?: string
          status?: string
          tracking?: string | null
          delivery_due_at?: string | null
          delivered_at?: string | null
          files?: string[]
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          item_type: 'product' | 'service'
          item_id: string
          qty: number
          unit_price: number
          currency: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          item_type: 'product' | 'service'
          item_id: string
          qty: number
          unit_price: number
          currency?: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          item_type?: 'product' | 'service'
          item_id?: string
          qty?: number
          unit_price?: number
          currency?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
  }
}