import { useState, useEffect, useRef, useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';

interface UseSupabaseQueryOptions<T> {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  staleTime?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: PostgrestError | null) => void;
}

interface UseSupabaseQueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
  loading: boolean;
  refetch: () => Promise<void>;
  isStale: boolean;
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: UseSupabaseQueryOptions<T> = {}
): UseSupabaseQueryResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    refetchOnMount = true,
    staleTime = 5 * 60 * 1000, // 5 minutes par défaut
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);

  const lastFetchTime = useRef<number>(0);
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  const executeQuery = useCallback(async () => {
    if (!enabled || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      
      if (!isMounted.current) return;

      if (result.error) {
        setError(result.error);
        onError?.(result.error);
      } else {
        setData(result.data);
        setError(null);
        lastFetchTime.current = Date.now();
        setIsStale(false);
        onSuccess?.(result.data!);
      }
    } catch (err) {
      if (!isMounted.current) return;
      
      const postgrestError = err as PostgrestError;
      setError(postgrestError);
      onError?.(postgrestError);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        isFetching.current = false;
      }
    }
  }, [enabled, queryFn, onSuccess, onError]);

  const refetch = useCallback(async () => {
    await executeQuery();
  }, [executeQuery]);

  // Vérifier si les données sont périmées
  useEffect(() => {
    if (data && staleTime > 0) {
      const checkStale = () => {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime.current;
        setIsStale(timeSinceLastFetch > staleTime);
      };

      checkStale();
      const interval = setInterval(checkStale, 1000);
      return () => clearInterval(interval);
    }
  }, [data, staleTime]);

  // Exécuter la requête au montage si activé
  useEffect(() => {
    if (enabled && refetchOnMount) {
      executeQuery();
    }
  }, [enabled, refetchOnMount, executeQuery]);

  // Gérer le focus de la fenêtre
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (isStale) {
        executeQuery();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, isStale, executeQuery]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    data,
    error,
    loading,
    refetch,
    isStale,
  };
}
