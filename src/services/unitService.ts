import { apiService } from './api';

export type UnitStatus = 
  | 'available' 
  | 'blocked' 
  | 'booked' 
  | 'agreement_signed' 
  | 'registered' 
  | 'cancelled';

export type UnitType = '2bhk' | '2_5bhk' | '3bhk';
export type Tower = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Unit {
  id: string;
  project_id: string;
  unit_no: string;
  tower: Tower;
  floor_no: number;
  floor?: number; // Alias for floor_no
  unit_type: UnitType;
  carpet_area_sqft: number;
  super_built_up_sqft: number;
  balcony_area_sqft?: number;
  no_of_parking?: number;
  facing?: string;
  basic_rate_per_sqft: number;
  price_per_sqft?: number; // Alias for basic_rate_per_sqft
  basic_sale_value: number;
  gst_amount?: number;
  maintenance_24mo?: number;
  corpus_fund?: number;
  other_charges?: number;
  gross_apartment_value?: number;
  undivided_share_sqft?: number;
  undivided_share_fraction?: string;
  floor_plan_url?: string;
  status: UnitStatus;
  remarks?: string;
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
  };
}

export interface UnitMatrix {
  [tower: string]: {
    [floor: string]: {
      [unitType: string]: number; // count of units
    };
  };
}

export const unitService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    project_id?: string;
    tower?: Tower;
    unit_type?: UnitType;
    status?: UnitStatus;
  }) {
    return apiService.get<Unit[]>('/units', params);
  },

  async getById(id: string) {
    return apiService.get<Unit>(`/units/${id}`);
  },

  async getMatrix(projectId: string) {
    return apiService.get<UnitMatrix>('/units/matrix', { project_id: projectId });
  },

  async create(data: Partial<Unit>) {
    return apiService.post<Unit>('/units', data);
  },

  async bulkCreate(units: Partial<Unit>[]) {
    return apiService.post<{ count: number }>('/units/bulk', { units });
  },

  async update(id: string, data: Partial<Unit>) {
    return apiService.patch<Unit>(`/units/${id}`, data);
  },
};
