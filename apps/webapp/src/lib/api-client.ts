import axios from 'axios';
import { config } from '@/config';

export const apiClient = axios.create({
    baseURL: config.api.baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    // Add auth token if needed
    return config;
});

apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error?.message || error.message;
        return Promise.reject(new Error(message));
    }
);
