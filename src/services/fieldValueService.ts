import { apiService } from './api';

export interface FieldValue {
  id: string;
  booking_id: string;
  field_id: string;
  value_text?: string;
  value_number?: number;
  value_date?: string;
  value_boolean?: boolean;
  value_json?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BulkFieldValueItem {
  field_id: string;
  value_text?: string;
  value_number?: number;
  value_date?: string;
  value_boolean?: boolean;
  value_json?: Record<string, unknown>;
}

export const fieldValueService = {
  async getByBooking(bookingId: string) {
    return apiService.get<Record<string, FieldValue>>(`/field-values/${bookingId}`);
  },

  async upsertSingle(bookingId: string, fieldId: string, data: {
    value_text?: string;
    value_number?: number;
    value_date?: string;
    value_boolean?: boolean;
    value_json?: Record<string, unknown>;
  }) {
    return apiService.put<FieldValue>(`/field-values/${bookingId}/${fieldId}`, data);
  },

  async bulkUpsert(bookingId: string, values: BulkFieldValueItem[]) {
    return apiService.put<{ count: number }>(`/field-values/${bookingId}/bulk`, {
      values,
    });
  },
};
