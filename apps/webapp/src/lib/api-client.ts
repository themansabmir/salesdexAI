import axios, { AxiosRequestConfig } from 'axios';
import { config } from '@/config';

// Create base axios instance
const axiosInstance = axios.create({
    baseURL: config.api.baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Error interceptor only - keep original response structure
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error?.message || error.message;
        return Promise.reject(new Error(message));
    }
);

// Type-safe wrapper that returns data directly
export const apiClient = {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance.get<T>(url, config).then(r => r.data),

    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance.post<T>(url, data, config).then(r => r.data),

    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance.patch<T>(url, data, config).then(r => r.data),

    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance.put<T>(url, data, config).then(r => r.data),

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        axiosInstance.delete<T>(url, config).then(r => r.data),
};

// Type for the API client - useful for dependency injection/testing
export type ApiClient = typeof apiClient;
