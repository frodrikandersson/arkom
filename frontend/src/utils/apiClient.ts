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
    }

    private getAccessToken(): string | null {
        // Get token from localStorage
        return localStorage.getItem('auth_token');
    }

    // Method to clear token cache (call this on logout)
    public clearTokenCache(): void {
        localStorage.removeItem('auth_token');
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}, retryCount = 0): Promise<T> {
        const { method = 'GET', body, headers = {}, queryParams } = options;

        // Build URL with query params
        let url = `${this.baseUrl}${endpoint}`;
        if (queryParams) {
            const params = new URLSearchParams(queryParams);
            url += `?${params}`;
        }

        // Get access token from localStorage
        const accessToken = this.getAccessToken();

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

        // Check content type before parsing
        const contentType = res.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            // Not JSON - likely an HTML error page
            const text = await res.text();
            throw new ApiError(
                `Server returned non-JSON response: ${text.substring(0, 100)}...`,
                res.status
            );
        }

        // Handle errors
        if (!res.ok) {
            // If 401 and we haven't retried yet, clear token cache and retry once
            if (res.status === 401 && retryCount === 0) {
                this.clearTokenCache();
                // Wait 500ms for Stack Auth to finish refreshing before retry
                await new Promise(resolve => setTimeout(resolve, 500));
                // Retry the request with a fresh token
                return this.request<T>(endpoint, options, retryCount + 1);
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
