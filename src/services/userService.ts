import { apiService } from './api';

export interface UserProfile {
  id: string;
  email: string;
  role: 'super_admin' | 'manager' | 'user';
  first_name: string;
  last_name: string;
  phone?: string;
  father_husband_name?: string;
  date_of_birth?: string;
  marital_status?: string;
  nationality?: string;
  aadhar_no?: string;
  pan_no?: string;
  alternate_phone?: string;
  communication_address?: string;
  permanent_address?: string;
  occupation?: string;
  employer_name?: string;
  designation?: string;
  place_of_business?: string;
  is_active: boolean;
  manager_id?: string;
  projects?: Array<{ id: string; name: string }>;
  project_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationDto {
  email: string;
  role: 'manager' | 'user';
  first_name: string;
  last_name: string;
  phone?: string;
  project_ids?: string[];
  manager_id?: string;
  notes?: string;
}

export interface AssignProjectDto {
  project_id: string;
}

export interface AssignManagerDto {
  manager_id: string;
}

export interface UpdateRoleDto {
  role: 'super_admin' | 'manager' | 'user';
}

export interface RevokeUserDto {
  reason?: string;
}

export const userService = {
  // List all users (admin directory)
  async getAll(params?: {
    page?: number;
    limit?: number;
    role?: 'super_admin' | 'manager' | 'user';
    project_id?: string;
    is_active?: boolean;
    search?: string;
  }) {
    return apiService.get<UserProfile[]>('/admin/users-directory', params);
  },

  // Get user by ID
  async getById(id: string) {
    return apiService.get<UserProfile>(`/profiles/${id}`);
  },

  // Get managers list
  async getManagers() {
    return apiService.get<UserProfile[]>('/profiles/managers');
  },

  // Create invitation (invite new user)
  async createInvitation(data: CreateInvitationDto) {
    return apiService.post<any>('/admin/invitations', data);
  },

  // Update user role
  async updateRole(userId: string, data: UpdateRoleDto) {
    return apiService.patch<UserProfile>(`/profiles/${userId}/role`, data);
  },

  // Assign manager to user
  async assignManager(userId: string, data: AssignManagerDto) {
    return apiService.patch<UserProfile>(`/admin/users/${userId}/manager`, data);
  },

  // Assign project to user
  async assignProject(userId: string, data: AssignProjectDto) {
    return apiService.post<any>(`/admin/users/${userId}/project-assignments`, data);
  },

  // Remove project assignment
  async removeProject(userId: string, projectId: string) {
    return apiService.delete(`/admin/users/${userId}/project-assignments/${projectId}`);
  },

  // Deactivate user
  async deactivate(userId: string, data?: RevokeUserDto) {
    return apiService.post<any>(`/admin/users/${userId}/revoke`, data || {});
  },

  // Reactivate user
  async reactivate(userId: string) {
    return apiService.post<any>(`/admin/users/${userId}/reactivate`, {});
  },

  // Get project user summary
  async getProjectUserSummary(projectId: string) {
    return apiService.get<any>(`/admin/projects/${projectId}/user-summary`);
  },
};
