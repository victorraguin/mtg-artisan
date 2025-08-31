import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useServices(filters: any = {}) {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select(`
          *,
          shop:shops(name, slug, logo_url, country),
          category:categories(name)
        `)
        .eq('status', 'active');

      if (filters.shopId) {
        query = query.eq('shop_id', filters.shopId);
      }

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          shop:shops(*),
          category:categories(name, id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}