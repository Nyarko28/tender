import { useQuery } from '@tanstack/react-query';
import { QueryConfig } from '@/lib/queryClient';
import api from '@/services/api';

// Static data - categories (rarely changes)
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    },
    ...QueryConfig.static,
  });
};

// Normal data - tenders list (5 min cache, manual refresh)
export const useTenders = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['tenders', filters],
    queryFn: async () => {
      const { data } = await api.get('/tenders/public', { params: filters });
      return data.data;
    },
    // Uses default config (5 min cache)
  });
};

// Detail page - single tender (10 min cache)
export const useTender = (id: string) => {
  return useQuery({
    queryKey: ['tender', id],
    queryFn: async () => {
      const { data } = await api.get(`/tenders/${id}`);
      return data.data;
    },
    ...QueryConfig.detail,
    enabled: !!id, // Only fetch if id exists
  });
};

// Real-time data - notifications (poll every 30s)
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data.data;
    },
    ...QueryConfig.realtime,
  });
};

// Dashboard analytics (semi-realtime - background refresh)
export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get('/reports/analytics');
      return data.data;
    },
    ...QueryConfig.semiRealtime,
  });
};

// Bids list for admin
export const useBids = (tenderId?: string) => {
  return useQuery({
    queryKey: ['bids', tenderId],
    queryFn: async () => {
      const { data } = await api.get('/bids', {
        params: tenderId ? { tender_id: tenderId } : {},
      });
      return data.data;
    },
    enabled: !!tenderId,
  });
};

// Suppliers list
export const useSuppliers = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async () => {
      const { data } = await api.get('/suppliers', { params: filters });
      return data.data;
    },
  });
};

// Single supplier
export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const { data } = await api.get(`/suppliers/${id}`);
      return data.data;
    },
    ...QueryConfig.detail,
    enabled: !!id,
  });
};

// Contracts list
export const useContracts = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['contracts', filters],
    queryFn: async () => {
      const { data } = await api.get('/contracts', { params: filters });
      return data.data;
    },
  });
};

// Single contract
export const useContract = (id: string) => {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      const { data } = await api.get(`/contracts/${id}`);
      return data.data;
    },
    ...QueryConfig.detail,
    enabled: !!id,
  });
};
