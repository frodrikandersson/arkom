// frontend/src/utils/apiClient.ts

import { config } from '../config/env';
import { stackClientApp } from '../config/stack';

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
    private tokenCache: { token: string | null; timestamp: number } | null = null;
    private readonly TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async getAccessToken(): Promise<string | undefined> {
        // Check if we have a valid cached token
        const now = Date.now();
        if (this.tokenCache && (now - this.tokenCache.timestamp) < this.TOKEN_CACHE_DURATION) {
            return this.tokenCache.token ?? undefined;
        }

        // Fetch fresh token
        try {
            const user = await stackClientApp.getUser();
            if (user) {
                const authJson = await user.getAuthJson();
                const token = authJson.accessToken ?? null;
                
                // Cache the token
                this.tokenCache = {
                    token,
                    timestamp: now
                };
                
                return token ?? undefined;
            }
            
            // No user logged in
            this.tokenCache = { token: null, timestamp: now };
            return undefined;
        } catch (error) {
            console.warn('Failed to get access token:', error);
            return undefined;
        }
    }

    // Method to clear token cache (call this on logout)
    public clearTokenCache(): void {
        this.tokenCache = null;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {}, queryParams } = options;

        // Build URL with query params
        let url = `${this.baseUrl}${endpoint}`;
        if (queryParams) {
            const params = new URLSearchParams(queryParams);
            url += `?${params}`;
        }

        // Get access token (from cache if available)
        const accessToken = await this.getAccessToken();

        // Build fetch options
        const fetchOptions: RequestInit = {
            method,
            headers: {
                ...headers,
                // Add Authorization header if user is logged in
                ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
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
            }
        }

        // Make request
        const res = await fetch(url, fetchOptions);
        const data = await res.json();

        // Handle errors
        if (!res.ok) {
            // If 401, clear token cache and retry once
            if (res.status === 401 && this.tokenCache) {
                this.clearTokenCache();
            }
            
            throw new ApiError(
                data.error || `Request failed with status ${res.status}`,
                res.status,
                data
            );
        }

        return data;
    }

    async get<T>(endpoint: string, queryParams?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', queryParams });
    }

    async post<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body });
    }

    async put<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body });
    }

    async patch<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'PATCH', body });
    }

    async delete<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', body });
    }

    // Special method for file uploads
    async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body: formData });
    }
}

// Export singleton instance
export const api = new ApiClient(config.apiUrl);
