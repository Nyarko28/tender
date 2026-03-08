import axios, { type AxiosError } from 'axios';

function resolveApiBaseUrl(): string {
  // Primary: Use VITE_API_URL from environment (set in Vercel)
  const envUrl = (import.meta.env.VITE_API_URL ?? '').trim();
  if (envUrl) return envUrl;

  // Fallback: Use VITE_API_BASE_URL if set
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
  if (baseUrl) return baseUrl;

  // Development: Use localhost
  if (import.meta.env.DEV) return 'http://localhost:8080/api';

  // Production fallback (should not reach here if env vars are set)
  return 'http://localhost:8080/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const message = err.response?.data?.message ?? err.message ?? 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;
