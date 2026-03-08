import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default behavior: Don't auto-refetch on navigation
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true, // DO refetch when internet reconnects

      // Cache settings
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache (formerly cacheTime)

      // Error handling
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      // Will be configured per mutation
      retry: 1,
    },
  },
});

// Query configuration presets for different data types
export const QueryConfig = {
  // For static data that rarely changes
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },

  // For data that should update periodically in background
  semiRealtime: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnMount: false,
  },

  // For critical real-time data
  realtime: {
    staleTime: 0, // Always considered stale
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnWindowFocus: true, // Check when user returns to tab
  },

  // For one-time fetch data (details pages)
  detail: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
  },
};
