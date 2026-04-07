import { API_CONFIG, type ApiResponse, type ApiError } from '../config/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('access_token');
  }

  private async refreshIfPossible(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;
    const refreshUrl = `${this.baseURL}/auth/refresh`;
    const refreshRes = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const refreshData = await refreshRes.json().catch(() => null);
    if (refreshRes.ok && refreshData?.success && refreshData.data) {
      const sessionData = refreshData.data;
      this.setToken(sessionData.access_token);
      localStorage.setItem('refresh_token', sessionData.refresh_token);
      if (sessionData.profile) {
        localStorage.setItem('user_profile', JSON.stringify(sessionData.profile));
      }
      return true;
    }
    return false;
  }

  private buildHeaders(options: RequestInit): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(options);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !isRetry && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        console.log('Token expired, attempting refresh...');
        try {
          const ok = await this.refreshIfPossible();
          if (ok) {
            console.log('Token refreshed successfully');
            return this.request<T>(endpoint, options, true);
          }
          throw new Error('Token refresh failed');
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          this.setToken(null);
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_profile');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.error?.message || `Request failed with status ${response.status}`);
      }

      const apiResponse = data as ApiResponse<T>;
      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getText(endpoint: string, params?: Record<string, string | number | boolean>): Promise<string> {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : '';
    const url = `${this.baseURL}${endpoint}${queryString}`;
    const doFetch = async (isRetry: boolean) => {
      const response = await fetch(url, { method: 'GET', headers: this.buildHeaders({}) });
      if (response.status === 401 && !isRetry && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        const ok = await this.refreshIfPossible();
        if (ok) return doFetch(true);
      }
      if (!response.ok) {
        // best effort: parse standard API error envelope
        const maybeJson = await response.json().catch(() => null);
        const message =
          maybeJson?.error?.message ||
          `Request failed with status ${response.status}`;
        throw new Error(message);
      }
      return response.text();
    };
    return doFetch(false);
  }

  async getBlob(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<{ blob: Blob; contentType: string; status: number }> {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : '';
    const url = `${this.baseURL}${endpoint}${queryString}`;
    const doFetch = async (isRetry: boolean) => {
      const response = await fetch(url, { method: 'GET', headers: this.buildHeaders({}) });
      if (response.status === 401 && !isRetry && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        const ok = await this.refreshIfPossible();
        if (ok) return doFetch(true);
      }
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const maybeJson = await response.json().catch(() => null);
        const message =
          maybeJson?.error?.message ||
          `Request failed with status ${response.status}`;
        throw Object.assign(new Error(message), { status: response.status, contentType });
      }
      const blob = await response.blob();
      return { blob, contentType, status: response.status };
    };
    return doFetch(false);
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : '';

    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.error?.message || 'Upload failed');
      }

      const apiResponse = data as ApiResponse<T>;
      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Upload failed');
    }
  }
}

export const apiService = new ApiService();
