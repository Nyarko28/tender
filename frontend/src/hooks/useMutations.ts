import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

// Helper to show alerts (replace with your toast library if available)
const showToast = (message: string, type: 'success' | 'error') => {
  // Using console for now - replace with your toast implementation
  if (type === 'success') {
    console.log('✅ ' + message);
    alert(message);
  } else {
    console.error('❌ ' + message);
    alert(message);
  }
};

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

      showToast('Bid submitted successfully!', 'success');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to submit bid', 'error');
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

      showToast('Tender created successfully!', 'success');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to create tender', 'error');
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

      showToast('Tender updated successfully!', 'success');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to update tender', 'error');
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

      showToast('Tender awarded successfully!', 'success');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to award tender', 'error');
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
      showToast('Tender deleted successfully!', 'success');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to delete tender', 'error');
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
      showToast('Supplier approved successfully!', 'success');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to approve supplier', 'error');
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
      showToast('Contract created successfully!', 'success');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to create contract', 'error');
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
      showToast('Category created successfully!', 'success');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to create category', 'error');
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
