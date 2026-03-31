export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://pbcrmbackend-production.up.railway.app/api/v1',
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
