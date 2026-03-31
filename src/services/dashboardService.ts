import { apiService } from './api';

export interface DashboardKPIs {
  total_bookings: number;
  active_bookings: number;
  total_revenue: number;
  pending_payments: number;
  units_available: number;
  units_booked: number;
}

export interface BookingFunnel {
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  agreement_signed: number;
}

export interface InventorySummary {
  available: number;
  blocked: number;
  booked: number;
  agreement_signed: number;
  registered: number;
}

export interface UserSummary {
  by_status: {
    draft: number;
    submitted: number;
    under_review: number;
    approved: number;
    needs_revision: number;
    agreement_signed: number;
  };
  total: number;
}

export const dashboardService = {
  async getKPIs() {
    return apiService.get<DashboardKPIs>('/dashboard/kpis');
  },

  async getBookingFunnel(projectId?: string) {
    return apiService.get<BookingFunnel>('/dashboard/booking-funnel', 
      projectId ? { project_id: projectId } : undefined
    );
  },

  async getInventorySummary(projectId?: string) {
    return apiService.get<InventorySummary>('/dashboard/inventory-summary',
      projectId ? { project_id: projectId } : undefined
    );
  },

  async getMySummary() {
    return apiService.get<UserSummary>('/dashboard/my-summary');
  },

  async getRecentActivity(params?: { project_id?: string; limit?: number }) {
    return apiService.get('/dashboard/recent-activity', params);
  },
};
