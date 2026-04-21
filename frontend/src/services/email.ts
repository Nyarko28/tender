import api from './api';

export const emailService = {
  async sendTestEmail(to?: string) {
    const res = await api.post<{ success: boolean; data: { message: string; to: string } }>('/email/test', {
      to: to?.trim() || undefined,
    });
    return res.data.data;
  },
};

