export const API_CONFIG = {
  // Prefer a relative base URL so hosting (Vercel) can proxy /api/v1 → backend and avoid CORS.
  // You can still override with VITE_API_BASE_URL for direct calls.
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  TIMEOUT: 30000,
};

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  statusCode: number;
}
