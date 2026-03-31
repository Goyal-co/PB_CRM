import { apiService } from './api';

export type PaymentStatus = 'pending' | 'demanded' | 'received' | 'cleared' | 'bounced' | 'refunded';

export interface Payment {
  id: string;
  booking_id: string;
  milestone: string;
  amount_due: number;
  amount_paid?: number;
  status: PaymentStatus;
  payment_method?: string;
  cheque_no?: string;
  upi_txn_no?: string;
  bank_name?: string;
  paid_at?: string;
  cleared_at?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  booking?: {
    allottee?: {
      first_name: string;
      last_name: string;
    };
    project?: {
      name: string;
    };
    unit?: {
      tower: string;
      unit_no: string;
    };
  };
}

export interface PaymentSummary {
  total_due: number;
  total_paid: number;
  total_pending: number;
  total_cleared: number;
}

export const paymentService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    booking_id?: string;
    status?: PaymentStatus;
    project_id?: string;
  }) {
    return apiService.get<Payment[]>('/payments', params);
  },

  async getById(id: string) {
    return apiService.get<Payment>(`/payments/${id}`);
  },

  async getByBooking(bookingId: string) {
    return apiService.get<{ payments: Payment[]; summary: PaymentSummary }>(
      `/payments/booking/${bookingId}`
    );
  },

  async recordPayment(id: string, data: {
    amount_paid: number;
    payment_method: string;
    cheque_no?: string;
    upi_txn_no?: string;
    bank_name?: string;
    paid_at?: string;
    notes?: string;
  }) {
    return apiService.patch<Payment>(`/payments/${id}/record`, data);
  },

  async clearPayment(id: string) {
    return apiService.patch<Payment>(`/payments/${id}/clear`);
  },

  async demandPayment(id: string, data: {
    due_date: string;
    notice_number: 1 | 2;
  }) {
    return apiService.patch<Payment>(`/payments/${id}/demand`, data);
  },

  async getCollections(params?: {
    year?: number;
    month?: number;
    project_id?: string;
  }) {
    return apiService.get('/payments/collections', params);
  },
};
