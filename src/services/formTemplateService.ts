import { apiService } from './api';

export type FieldDataType = 
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'file';

export interface FormField {
  id: string;
  section_id: string;
  field_key: string;
  field_label: string;
  data_type: FieldDataType;
  is_required: boolean;
  visible_to_user: boolean;
  editable_by_user: boolean;
  visible_to_manager: boolean;
  editable_by_manager: boolean;
  display_order: number;
  placeholder?: string;
  help_text?: string;
  validation_regex?: string;
  options?: string[];
  default_value?: string;
  max_file_size_mb?: number;
  accepted_file_types?: string[];
  is_active: boolean;
}

export interface FormSection {
  id: string;
  form_template_id: string;
  section_label: string;
  section_key?: string;
  display_order: number;
  is_active: boolean;
  fields?: FormField[];
}

export interface FormTemplate {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sections?: FormSection[];
}

export const formTemplateService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    project_id?: string;
    is_active?: boolean;
  }) {
    return apiService.get<FormTemplate[]>('/form-templates', params);
  },

  async getById(id: string) {
    return apiService.get<FormTemplate>(`/form-templates/${id}`);
  },

  async create(data: { project_id: string; name: string; description?: string }) {
    return apiService.post<FormTemplate>('/form-templates', data);
  },

  async update(id: string, data: { name?: string; description?: string; is_active?: boolean }) {
    return apiService.patch<FormTemplate>(`/form-templates/${id}`, data);
  },

  async delete(id: string) {
    return apiService.delete(`/form-templates/${id}`);
  },

  async getSections(templateId: string) {
    return apiService.get<FormSection[]>(`/form-templates/${templateId}/sections`);
  },

  async createSection(templateId: string, data: {
    section_label: string;
    section_key?: string;
    display_order?: number;
    is_active?: boolean;
  }) {
    return apiService.post<FormSection>(`/form-templates/${templateId}/sections`, data);
  },

  async updateSection(templateId: string, sectionId: string, data: Partial<{
    section_label: string;
    section_key: string;
    display_order: number;
    is_active: boolean;
  }>) {
    return apiService.patch<FormSection>(`/form-templates/${templateId}/sections/${sectionId}`, data);
  },

  async deleteSection(templateId: string, sectionId: string) {
    return apiService.delete(`/form-templates/${templateId}/sections/${sectionId}`);
  },

  async getFields(templateId: string, params?: {
    page?: number;
    limit?: number;
    section_id?: string;
    is_active?: boolean;
  }) {
    return apiService.get<FormField[]>(`/form-templates/${templateId}/fields`, params);
  },

  async createField(templateId: string, data: {
    section_id: string;
    field_key: string;
    field_label: string;
    data_type: FieldDataType;
    is_required?: boolean;
    visible_to_user?: boolean;
    editable_by_user?: boolean;
    visible_to_manager?: boolean;
    editable_by_manager?: boolean;
    display_order?: number;
    placeholder?: string;
    help_text?: string;
    validation_regex?: string;
    options?: string[];
    default_value?: string;
    max_file_size_mb?: number;
    accepted_file_types?: string[];
  }) {
    return apiService.post<FormField>(`/form-templates/${templateId}/fields`, data);
  },

  async updateField(templateId: string, fieldId: string, data: Partial<Omit<FormField, 'id' | 'field_key'>>) {
    return apiService.patch<FormField>(`/form-templates/${templateId}/fields/${fieldId}`, data);
  },

  async toggleField(templateId: string, fieldId: string, data: {
    visible_to_user?: boolean;
    editable_by_user?: boolean;
    is_active?: boolean;
  }) {
    return apiService.patch<FormField>(`/form-templates/${templateId}/fields/${fieldId}/toggle`, data);
  },

  async deleteField(templateId: string, fieldId: string) {
    return apiService.delete(`/form-templates/${templateId}/fields/${fieldId}`);
  },

  async reorderFields(templateId: string, fields: { id: string; display_order: number }[]) {
    return apiService.patch(`/form-templates/${templateId}/fields/reorder`, { fields });
  },
};
