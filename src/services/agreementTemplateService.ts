import { apiService } from './api';

export interface AgreementTemplate {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  body_html: string;
  header_html?: string;
  footer_html?: string;
  page_size: string;
  margin_top?: number;
  margin_bottom?: number;
  margin_left?: number;
  margin_right?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MergedAgreement {
  merged_html: string;
  header_html?: string;
  footer_html?: string;
  page_size: string;
  margins: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export const agreementTemplateService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    project_id?: string;
    is_active?: boolean;
  }) {
    return apiService.get<AgreementTemplate[]>('/agreement-templates', params);
  },

  async getById(id: string) {
    return apiService.get<AgreementTemplate>(`/agreement-templates/${id}`);
  },

  async getMergedAgreement(bookingId: string) {
    return apiService.get<MergedAgreement>(`/bookings/${bookingId}/merged-agreement`);
  },

  async create(data: Partial<AgreementTemplate>) {
    return apiService.post<AgreementTemplate>('/agreement-templates', data);
  },

  async update(id: string, data: Partial<AgreementTemplate>) {
    return apiService.patch<AgreementTemplate>(`/agreement-templates/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/agreement-templates/${id}`);
  },
};
