import React, { useState, useEffect } from 'react';
import { Plus, FileText, Edit2, Trash2, Loader2 } from 'lucide-react';
import { formTemplateService, type FormTemplate } from '../services/formTemplateService';
import { agreementTemplateService, type AgreementTemplate } from '../services/agreementTemplateService';
import { projectService, type Project } from '../services/projectService';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

const Templates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'agreement'>('form');
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [agreementTemplates, setAgreementTemplates] = useState<AgreementTemplate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Modal states
  const [showAddFormModal, setShowAddFormModal] = useState(false);
  const [showEditFormModal, setShowEditFormModal] = useState(false);
  const [showAddAgreementModal, setShowAddAgreementModal] = useState(false);
  const [showEditAgreementModal, setShowEditAgreementModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  // Form data
  const [formTemplateData, setFormTemplateData] = useState({
    project_id: '',
    name: '',
    description: '',
  });
  
  const [agreementTemplateData, setAgreementTemplateData] = useState({
    project_id: '',
    name: '',
    description: '',
    body_html: '',
    header_html: '',
    footer_html: '',
    page_size: 'A4',
    margin_top: 20,
    margin_bottom: 20,
    margin_left: 20,
    margin_right: 20,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData] = await Promise.all([
        projectService.getAll(),
      ]);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      
      if (activeTab === 'form') {
        const templates = await formTemplateService.getAll();
        setFormTemplates(Array.isArray(templates) ? templates : []);
      } else {
        const templates = await agreementTemplateService.getAll();
        setAgreementTemplates(Array.isArray(templates) ? templates : []);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setToast({ message: error?.message || 'Failed to load templates', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Form Template Handlers
  const handleCreateFormTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await formTemplateService.create(formTemplateData);
      setToast({ message: 'Form template created successfully!', type: 'success' });
      setShowAddFormModal(false);
      setFormTemplateData({ project_id: '', name: '', description: '' });
      fetchData();
    } catch (error: any) {
      setToast({ message: error?.message || 'Failed to create template', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFormTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    try {
      setLoading(true);
      await formTemplateService.update(selectedTemplate.id, {
        name: formTemplateData.name,
        description: formTemplateData.description,
      });
      setToast({ message: 'Form template updated successfully!', type: 'success' });
      setShowEditFormModal(false);
      setSelectedTemplate(null);
      setFormTemplateData({ project_id: '', name: '', description: '' });
      await fetchData();
    } catch (error: any) {
      console.error('Update form template error:', error);
      setToast({ message: error?.message || 'Failed to update template', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditFormTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setFormTemplateData({
      project_id: template.project_id,
      name: template.name,
      description: template.description || '',
    });
    setShowEditFormModal(true);
  };

  // Agreement Template Handlers
  const handleCreateAgreementTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await agreementTemplateService.create(agreementTemplateData);
      setToast({ message: 'Agreement template created successfully!', type: 'success' });
      setShowAddAgreementModal(false);
      setAgreementTemplateData({
        project_id: '',
        name: '',
        description: '',
        body_html: '',
        header_html: '',
        footer_html: '',
        page_size: 'A4',
        margin_top: 20,
        margin_bottom: 20,
        margin_left: 20,
        margin_right: 20,
      });
      fetchData();
    } catch (error: any) {
      setToast({ message: error?.message || 'Failed to create template', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAgreementTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    try {
      setLoading(true);
      await agreementTemplateService.update(selectedTemplate.id, agreementTemplateData);
      setToast({ message: 'Agreement template updated successfully!', type: 'success' });
      setShowEditAgreementModal(false);
      setSelectedTemplate(null);
      setAgreementTemplateData({
        project_id: '',
        name: '',
        description: '',
        body_html: '',
        header_html: '',
        footer_html: '',
        page_size: 'A4',
        margin_top: 20,
        margin_bottom: 20,
        margin_left: 20,
        margin_right: 20,
      });
      await fetchData();
    } catch (error: any) {
      console.error('Update agreement template error:', error);
      setToast({ message: error?.message || 'Failed to update template', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgreementTemplate = async (template: AgreementTemplate) => {
    try {
      setLoading(true);
      const fullTemplate = await agreementTemplateService.getById(template.id);
      setSelectedTemplate(fullTemplate);
      setAgreementTemplateData({
        project_id: fullTemplate.project_id,
        name: fullTemplate.name,
        description: fullTemplate.description || '',
        body_html: fullTemplate.body_html || '',
        header_html: fullTemplate.header_html || '',
        footer_html: fullTemplate.footer_html || '',
        page_size: fullTemplate.page_size || 'A4',
        margin_top: fullTemplate.margin_top || 20,
        margin_bottom: fullTemplate.margin_bottom || 20,
        margin_left: fullTemplate.margin_left || 20,
        margin_right: fullTemplate.margin_right || 20,
      });
      setShowEditAgreementModal(true);
    } catch (error: any) {
      setToast({ message: error?.message || 'Failed to load template', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!selectedTemplate) return;
    try {
      setLoading(true);
      if (activeTab === 'form') {
        await formTemplateService.delete(selectedTemplate.id);
      } else {
        await agreementTemplateService.delete(selectedTemplate.id);
      }
      setToast({ message: 'Template deleted successfully!', type: 'success' });
      setShowDeleteConfirm(false);
      setSelectedTemplate(null);
      await fetchData();
    } catch (error: any) {
      console.error('Delete template error:', error);
      const errorMessage = error?.message || 'Failed to delete template';
      setToast({ 
        message: errorMessage.includes('referenced') 
          ? 'Cannot delete: This template is being used by existing bookings. Please remove all bookings using this template first.'
          : errorMessage, 
        type: 'error' 
      });
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (template: any) => {
    setSelectedTemplate(template);
    setShowDeleteConfirm(true);
  };

  if (loading && !showAddFormModal && !showEditFormModal && !showAddAgreementModal && !showEditAgreementModal && !showDeleteConfirm) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage form and agreement templates</p>
        </div>
        <button
          onClick={() => activeTab === 'form' ? setShowAddFormModal(true) : setShowAddAgreementModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New Template
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 pt-4">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'form'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} />
            Form Templates
          </button>
          <button
            onClick={() => setActiveTab('agreement')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ml-2 ${
              activeTab === 'agreement'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} />
            Agreement Templates
          </button>
        </div>

        <div className="p-5">
          {activeTab === 'form' && (
            <div className="space-y-3">
              {formTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No form templates found</p>
                  <button
                    onClick={() => setShowAddFormModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Create First Template
                  </button>
                </div>
              ) : (
                formTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            template.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <button
                        onClick={() => handleEditFormTemplate(template)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(template)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'agreement' && (
            <div className="space-y-3">
              {agreementTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No agreement templates found</p>
                  <button
                    onClick={() => setShowAddAgreementModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Create First Template
                  </button>
                </div>
              ) : (
                agreementTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={20} className="text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            template.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {template.page_size}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <button
                        onClick={() => handleEditAgreementTemplate(template)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(template)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Form Template Modal */}
      {showAddFormModal && (
        <Modal title="Create Form Template" onClose={() => setShowAddFormModal(false)} size="md">
          <form onSubmit={handleCreateFormTemplate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={formTemplateData.project_id}
                onChange={(e) => setFormTemplateData({ ...formTemplateData, project_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formTemplateData.name}
                onChange={(e) => setFormTemplateData({ ...formTemplateData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Standard Booking Form"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formTemplateData.description}
                onChange={(e) => setFormTemplateData({ ...formTemplateData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAddFormModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Form Template Modal */}
      {showEditFormModal && (
        <Modal title="Edit Form Template" onClose={() => setShowEditFormModal(false)} size="md">
          <form onSubmit={handleUpdateFormTemplate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formTemplateData.name}
                onChange={(e) => setFormTemplateData({ ...formTemplateData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formTemplateData.description}
                onChange={(e) => setFormTemplateData({ ...formTemplateData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowEditFormModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Template'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Agreement Template Modal */}
      {showAddAgreementModal && (
        <Modal title="Create Agreement Template" onClose={() => setShowAddAgreementModal(false)} size="lg">
          <form onSubmit={handleCreateAgreementTemplate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={agreementTemplateData.project_id}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, project_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={agreementTemplateData.name}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Standard Sale Agreement"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={agreementTemplateData.description}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body HTML <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={agreementTemplateData.body_html}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, body_html: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="<h1>Agreement Title</h1><p>Agreement content...</p>"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Header HTML
                </label>
                <textarea
                  value={agreementTemplateData.header_html}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, header_html: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer HTML
                </label>
                <textarea
                  value={agreementTemplateData.footer_html}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, footer_html: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Size
                </label>
                <select
                  value={agreementTemplateData.page_size}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, page_size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
              <div className="grid grid-cols-4 gap-2 col-span-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Top (mm)</label>
                  <input
                    type="number"
                    value={agreementTemplateData.margin_top}
                    onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, margin_top: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bottom (mm)</label>
                  <input
                    type="number"
                    value={agreementTemplateData.margin_bottom}
                    onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, margin_bottom: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Left (mm)</label>
                  <input
                    type="number"
                    value={agreementTemplateData.margin_left}
                    onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, margin_left: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Right (mm)</label>
                  <input
                    type="number"
                    value={agreementTemplateData.margin_right}
                    onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, margin_right: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAddAgreementModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Agreement Template Modal */}
      {showEditAgreementModal && (
        <Modal title="Edit Agreement Template" onClose={() => setShowEditAgreementModal(false)} size="lg">
          <form onSubmit={handleUpdateAgreementTemplate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={agreementTemplateData.name}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={agreementTemplateData.description}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body HTML <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={agreementTemplateData.body_html}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, body_html: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Header HTML
                </label>
                <textarea
                  value={agreementTemplateData.header_html}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, header_html: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer HTML
                </label>
                <textarea
                  value={agreementTemplateData.footer_html}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, footer_html: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Size
                </label>
                <select
                  value={agreementTemplateData.page_size}
                  onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, page_size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
              <div className="grid grid-cols-4 gap-2 col-span-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Top (mm)</label>
                  <input
                    type="number"
                    value={agreementTemplateData.margin_top}
                    onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, margin_top: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bottom (mm)</label>
                  <input
                    type="number"
                    value={agreementTemplateData.margin_bottom}
                    onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, margin_bottom: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Left (mm)</label>
                  <input
                    type="number"
                    value={agreementTemplateData.margin_left}
                    onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, margin_left: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Right (mm)</label>
                  <input
                    type="number"
                    value={agreementTemplateData.margin_right}
                    onChange={(e) => setAgreementTemplateData({ ...agreementTemplateData, margin_right: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowEditAgreementModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Template'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedTemplate && (
        <Modal title="Delete Template" onClose={() => setShowDeleteConfirm(false)} size="sm">
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>Warning:</strong> Templates that are being used by existing bookings cannot be deleted.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{selectedTemplate.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Templates;
