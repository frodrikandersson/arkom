// frontend/src/utils/apiClient.ts

import { config } from '../config/env';

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

    interface RequestOptions {
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        body?: any;
        headers?: Record<string, string>;
        queryParams?: Record<string, string>;
    }

    class ApiClient {
        private baseUrl: string;

        constructor(baseUrl: string) {
            this.baseUrl = baseUrl;
        };

        private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
            const { method = 'GET', body, headers = {}, queryParams } = options;

            // Build URL with query params
            let url = `${this.baseUrl}${endpoint}`;
            if (queryParams) {
                const params = new URLSearchParams(queryParams);
                url += `?${params}`;
            };

            // Build fetch options
            const fetchOptions: RequestInit = {
                method,
                headers: {
                    ...headers,
                },
            };

            // Handle body
            if (body) {
                if (body instanceof FormData) {
                    // Don't set Content-Type for FormData (browser sets it with boundary)
                    fetchOptions.body = body;
                } else {
                    fetchOptions.headers = {
                    ...fetchOptions.headers,
                    'Content-Type': 'application/json',
                    };
                    fetchOptions.body = JSON.stringify(body);
                };
            };

            // Make request
            const res = await fetch(url, fetchOptions);
            const data = await res.json();

            // Handle errors
            if (!res.ok) {
                throw new ApiError(
                    data.error || `Request failed with status ${res.status}`,
                    res.status,
                    data
                );
            };

            return data;
        };

    async get<T>(endpoint: string, queryParams?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', queryParams });
    };

    async post<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body });
    };

    async put<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body });
    };

    async patch<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'PATCH', body });
    };

    async delete<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', body });
    };

    // Special method for file uploads
    async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body: formData });
    };
}

// Export singleton instance
export const api = new ApiClient(config.apiUrl);
