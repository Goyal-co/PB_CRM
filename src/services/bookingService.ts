import { apiService } from './api';

export type BookingStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'needs_revision'
  | 'agreement_generated'
  | 'agreement_signed'
  | 'cancelled';

export interface Booking {
  id: string;
  project_id: string;
  unit_id: string;
  allottee_id: string;
  status: BookingStatus;
  allottee_address?: string;
  allottee_phone?: string;
  allottee_email?: string;
  agent_name?: string;
  agent_rera_no?: string;
  agent_contact_no?: string;
  agent_email?: string;
  fund_source?: string;
  home_loan_pct?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
  };
  unit?: {
    unit_no: string;
    tower: string;
    unit_type: string;
    carpet_area_sqft: number;
  };
  allottee?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}

export interface JointAllotteeDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export interface CreateBookingDto {
  project_id: string;
  unit_id: string;
  form_template_id: string;      // Required by backend
  agreement_template_id: string;  // Required by backend
  joint_allottees?: JointAllotteeDto[];  // Max 2
  allottee_address?: string;
  allottee_phone?: string;
  allottee_email?: string;
  agent_name?: string;
  agent_rera_no?: string;
  agent_represented_by?: string;  // Added to match backend
  agent_contact_no?: string;
  agent_email?: string;
  fund_source?: string;
  home_loan_pct?: number;
  notes?: string;
}

export const bookingService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: BookingStatus;
    project_id?: string;
    search?: string;
  }) {
    return apiService.get<Booking[]>('/bookings', params);
  },

  async getWorkspace(params?: {
    page?: number;
    limit?: number;
    status?: string;
    project_id?: string;
    search?: string;
  }) {
    return apiService.get<Booking[]>('/bookings/workspace', params);
  },

  async getPendingReview() {
    return apiService.get<Booking[]>('/bookings/pending-review');
  },

  async getById(id: string) {
    return apiService.get<Booking>(`/bookings/${id}`);
  },

  async create(data: CreateBookingDto) {
    return apiService.post<Booking>('/bookings', data);
  },

  async update(id: string, data: Partial<CreateBookingDto>) {
    return apiService.patch<Booking>(`/bookings/${id}`, data);
  },

  async submit(id: string) {
    return apiService.post(`/bookings/${id}/submit`);
  },

  async startReview(id: string) {
    return apiService.post(`/bookings/${id}/start-review`);
  },

  async cancel(id: string, reason: string, isAllotteeCancel: boolean) {
    return apiService.patch(`/bookings/${id}/cancel`, {
      reason,
      is_allottee_cancel: isAllotteeCancel,
    });
  },

  async completeReview(id: string, action: 'approve' | 'reject' | 'request_revision', notes?: string) {
    return apiService.patch(`/bookings/${id}/complete-review`, {
      action,
      notes,
    });
  },

  async getMergedAgreement(id: string) {
    return apiService.get<{ merged_html: string; header_html?: string; footer_html?: string }>(`/bookings/${id}/merged-agreement`);
  },

  async getForm(id: string) {
    return apiService.get<Record<string, unknown>>(`/bookings/${id}/form`);
  },
};
