import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

// Submit bid mutation
export const useSubmitBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bidData: Record<string, unknown>) => {
      const { data } = await api.post('/bids/submit', bidData);
      return data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries to refetch
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      queryClient.invalidateQueries({ queryKey: ['tender', variables.tender_id] });
      queryClient.invalidateQueries({ queryKey: ['tenders'] });

      toast.success('Bid submitted successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit bid');
    },
  });
};

// Create tender mutation
export const useCreateTender = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenderData: Record<string, unknown>) => {
      const { data } = await api.post('/tenders/create', tenderData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      toast.success('Tender created successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create tender');
    },
  });
};

// Update tender mutation
export const useUpdateTender = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: tenderData }: { id: string; data: Record<string, unknown> }) => {
      const { data } = await api.put(`/tenders/${id}`, tenderData);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      queryClient.invalidateQueries({ queryKey: ['tender', variables.id] });

      toast.success('Tender updated successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update tender');
    },
  });
};

// Award tender mutation
export const useAwardTender = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tenderId, bidId }: { tenderId: string; bidId: string }) => {
      const { data } = await api.post(`/tenders/${tenderId}/award`, { bid_id: bidId });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tender', variables.tenderId] });
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });

      toast.success('Tender awarded successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to award tender');
    },
  });
};

// Delete tender mutation
export const useDeleteTender = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/tenders/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      toast.success('Tender deleted successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete tender');
    },
  });
};

// Approve supplier mutation
export const useApproveSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplierId: string) => {
      const { data } = await api.post(`/suppliers/${supplierId}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier'] });
      toast.success('Supplier approved successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to approve supplier');
    },
  });
};

// Create contract mutation
export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractData: Record<string, unknown>) => {
      const { data } = await api.post('/contracts/create', contractData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contract created successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create contract');
    },
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: Record<string, unknown>) => {
      const { data } = await api.post('/categories/create', categoryData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create category');
    },
  });
};

// Mark notification as read mutation
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.post(`/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
