import { apiService } from './api';

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'manager' | 'user';
  phone?: string;
  alternate_phone?: string;
  father_husband_name?: string;
  date_of_birth?: string;
  marital_status?: string;
  nationality?: string;
  aadhar_no?: string;
  pan_no?: string;
  communication_address?: string;
  permanent_address?: string;
  occupation?: string;
  employer_name?: string;
  designation?: string;
  place_of_business?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const profileService = {
  async getMe() {
    return apiService.get<Profile>('/profiles/me');
  },

  async updateMe(data: Partial<Profile>) {
    return apiService.patch<Profile>('/profiles/me', data);
  },

  async getAll(params?: {
    page?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
    search?: string;
  }) {
    return apiService.get<Profile[]>('/profiles', params);
  },

  async getById(id: string) {
    return apiService.get<Profile>(`/profiles/${id}`);
  },

  async getManagers() {
    return apiService.get<Profile[]>('/profiles/managers');
  },
};
