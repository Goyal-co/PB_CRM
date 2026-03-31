import { apiService } from './api';

export interface Project {
  id: string;
  name: string;
  location?: string;
  status?: 'active' | 'upcoming' | 'completed';
  rera_number?: string;
  rera_website?: string;
  plan_sanction_no?: string;
  land_area_guntas?: number;
  total_units?: number;
  available_units?: number;
  total_towers?: number;
  possession_date?: string;
  address?: string;
  city?: string;
  vendor_name?: string;
  vendor_pan?: string;
  vendor_address?: string;
  vendor_phone?: string;
  vendor_email?: string;
  vendor_rep_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  total_units: number;
  available_units: number;
  booked_units: number;
  total_bookings: number;
  revenue_collected: number;
}

export const projectService = {
  async getAll(params?: { page?: number; limit?: number }) {
    return apiService.get<Project[]>('/projects', params);
  },

  async getMyProjects() {
    return apiService.get<Project[]>('/projects/my');
  },

  async getById(id: string) {
    return apiService.get<Project>(`/projects/${id}`);
  },

  async getStats(id: string) {
    return apiService.get<ProjectStats>(`/projects/${id}/stats`);
  },

  async create(data: Partial<Project>) {
    return apiService.post<Project>('/projects', data);
  },

  async update(id: string, data: Partial<Project>) {
    return apiService.patch<Project>(`/projects/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/projects/${id}`);
  },
};
