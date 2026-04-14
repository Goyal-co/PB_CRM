import { apiService } from './api';

export type DocType = 
  | 'aadhar_card'
  | 'pan_card'
  | 'passport'
  | 'driving_license'
  | 'voter_id'
  | 'bank_statement'
  | 'salary_slip'
  | 'agreement_copy'
  | 'payment_receipt'
  | 'other';

export interface Document {
  id: string;
  booking_id: string;
  type: DocType;
  file_name: string;
  file_size: number;
  storage_path: string;
  preview_url?: string;
  allottee_index: number;
  is_verified: boolean;
  rejection_reason?: string;
  notes?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface UploadDocumentParams {
  booking_id: string;
  type: DocType;
  file: File;
  allottee_index?: number;
  notes?: string;
}

export const documentService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    booking_id?: string;
    type?: DocType;
    is_verified?: boolean;
  }) {
    return apiService.get<Document[]>('/documents', params);
  },

  async getById(id: string) {
    return apiService.get<Document>(`/documents/${id}`);
  },

  async getSignedUrl(id: string) {
    return apiService.get<{ url: string }>(`/documents/${id}/signed-url`);
  },

  async upload(params: UploadDocumentParams) {
    const formData = new FormData();
    // Include filename explicitly (some backends rely on it)
    formData.append('file', params.file, params.file.name);
    formData.append('booking_id', params.booking_id);
    formData.append('type', params.type);
    
    if (params.allottee_index !== undefined) {
      formData.append('allottee_index', params.allottee_index.toString());
    }
    
    if (params.notes) {
      formData.append('notes', params.notes);
    }

    return apiService.uploadFile<Document>('/documents/upload', formData);
  },

  async verify(id: string, isVerified: boolean, rejectionReason?: string) {
    return apiService.patch<Document>(`/documents/${id}/verify`, {
      is_verified: isVerified,
      rejection_reason: rejectionReason,
    });
  },

  async delete(id: string) {
    return apiService.delete(`/documents/${id}`);
  },
};
