import { apiService } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'manager' | 'user';
    phone?: string;
    is_active: boolean;
    project_ids?: string[];
    projects?: Array<{ id: string; name: string }>;
  };
}

export interface RefreshRequest {
  refresh_token: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    
    if (response.access_token) {
      apiService.setToken(response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_profile', JSON.stringify(response.profile));
    }
    
    return response;
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    if (response.access_token) {
      apiService.setToken(response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_profile', JSON.stringify(response.profile));
    }
    
    return response;
  },

  logout() {
    apiService.setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
  },

  getStoredProfile() {
    const stored = localStorage.getItem('user_profile');
    return stored ? JSON.parse(stored) : null;
  },

  async getMyProfile(): Promise<LoginResponse['profile']> {
    const profile = await apiService.get<LoginResponse['profile']>('/profiles/me');
    localStorage.setItem('user_profile', JSON.stringify(profile));
    return profile;
  },
};
