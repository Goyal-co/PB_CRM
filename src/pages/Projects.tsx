import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Loader2, Plus, Edit2, Trash2, Home } from 'lucide-react';
import { projectService, type Project } from '../services/projectService';
import { unitService, type Unit, type Tower, type UnitType } from '../services/unitService';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import EditProjectModal from './Projects_EditModal';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Units management state
  const [units, setUnits] = useState<Unit[]>([]);
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showEditUnitModal, setShowEditUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [unitFormData, setUnitFormData] = useState({
    unit_no: '',
    tower: 'A' as Tower,
    floor_no: '',
    unit_type: '2bhk' as UnitType,
    carpet_area_sqft: '',
    super_built_up_sqft: '',
    balcony_area_sqft: '',
    no_of_parking: '',
    facing: '',
    basic_rate_per_sqft: '',
    basic_sale_value: '',
    gst_amount: '',
    maintenance_24mo: '',
    corpus_fund: '',
    other_charges: '',
    gross_apartment_value: '',
    undivided_share_sqft: '',
    undivided_share_fraction: '',
    floor_plan_url: '',
    remarks: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    rera_number: '',
    rera_website: '',
    plan_sanction_no: '',
    land_area_guntas: '',
    total_units: '',
    total_towers: '',
    possession_date: '',
    address: '',
    city: '',
    vendor_name: '',
    vendor_pan: '',
    vendor_address: '',
    vendor_phone: '',
    vendor_email: '',
    vendor_rep_name: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getAll();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      setError(err?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleViewProject = async (project: Project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const fetchUnits = async (projectId: string) => {
    try {
      setLoading(true);
      const data = await unitService.getAll({ project_id: projectId });
      setUnits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch units:', err);
      setToast({ message: err?.message || 'Failed to load units', type: 'error' });
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManageUnits = async (project: Project) => {
    setSelectedProject(project);
    await fetchUnits(project.id);
    setShowDetailModal(false);
    setShowUnitsModal(true);
  };

  const handleAddUnit = () => {
    setUnitFormData({
      unit_no: '',
      tower: 'A',
      floor_no: '',
      unit_type: '2bhk',
      carpet_area_sqft: '',
      super_built_up_sqft: '',
      balcony_area_sqft: '',
      no_of_parking: '',
      facing: '',
      basic_rate_per_sqft: '',
      basic_sale_value: '',
      gst_amount: '',
      maintenance_24mo: '',
      corpus_fund: '',
      other_charges: '',
      gross_apartment_value: '',
      undivided_share_sqft: '',
      undivided_share_fraction: '',
      floor_plan_url: '',
      remarks: '',
    });
    setShowAddUnitModal(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setUnitFormData({
      unit_no: unit.unit_no || '',
      tower: unit.tower || 'A',
      floor_no: unit.floor_no?.toString() || '',
      unit_type: unit.unit_type || '2bhk',
      carpet_area_sqft: unit.carpet_area_sqft?.toString() || '',
      super_built_up_sqft: unit.super_built_up_sqft?.toString() || '',
      balcony_area_sqft: unit.balcony_area_sqft?.toString() || '',
      no_of_parking: unit.no_of_parking?.toString() || '',
      facing: unit.facing || '',
      basic_rate_per_sqft: unit.basic_rate_per_sqft?.toString() || '',
      basic_sale_value: unit.basic_sale_value?.toString() || '',
      gst_amount: unit.gst_amount?.toString() || '',
      maintenance_24mo: unit.maintenance_24mo?.toString() || '',
      corpus_fund: unit.corpus_fund?.toString() || '',
      other_charges: unit.other_charges?.toString() || '',
      gross_apartment_value: unit.gross_apartment_value?.toString() || '',
      undivided_share_sqft: unit.undivided_share_sqft?.toString() || '',
      undivided_share_fraction: unit.undivided_share_fraction || '',
      floor_plan_url: unit.floor_plan_url || '',
      remarks: unit.remarks || '',
    });
    setShowEditUnitModal(true);
  };

  const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUnitFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setLoading(true);
      const unitData: any = {
        project_id: selectedProject.id,
        unit_no: unitFormData.unit_no,
        tower: unitFormData.tower,
        floor_no: parseInt(unitFormData.floor_no),
        unit_type: unitFormData.unit_type,
        carpet_area_sqft: parseFloat(unitFormData.carpet_area_sqft),
        super_built_up_sqft: parseFloat(unitFormData.super_built_up_sqft),
        basic_rate_per_sqft: parseFloat(unitFormData.basic_rate_per_sqft),
        basic_sale_value: parseFloat(unitFormData.basic_sale_value),
      };

      // Add optional fields if provided
      if (unitFormData.balcony_area_sqft) unitData.balcony_area_sqft = parseFloat(unitFormData.balcony_area_sqft);
      if (unitFormData.no_of_parking) unitData.no_of_parking = parseInt(unitFormData.no_of_parking);
      if (unitFormData.facing) unitData.facing = unitFormData.facing;
      if (unitFormData.gst_amount) unitData.gst_amount = parseFloat(unitFormData.gst_amount);
      if (unitFormData.maintenance_24mo) unitData.maintenance_24mo = parseFloat(unitFormData.maintenance_24mo);
      if (unitFormData.corpus_fund) unitData.corpus_fund = parseFloat(unitFormData.corpus_fund);
      if (unitFormData.other_charges) unitData.other_charges = parseFloat(unitFormData.other_charges);
      if (unitFormData.gross_apartment_value) unitData.gross_apartment_value = parseFloat(unitFormData.gross_apartment_value);
      if (unitFormData.undivided_share_sqft) unitData.undivided_share_sqft = parseFloat(unitFormData.undivided_share_sqft);
      if (unitFormData.undivided_share_fraction) unitData.undivided_share_fraction = unitFormData.undivided_share_fraction;
      if (unitFormData.floor_plan_url) unitData.floor_plan_url = unitFormData.floor_plan_url;
      if (unitFormData.remarks) unitData.remarks = unitFormData.remarks;

      if (selectedUnit) {
        await unitService.update(selectedUnit.id, unitData);
        setToast({ message: 'Unit updated successfully!', type: 'success' });
        setShowEditUnitModal(false);
      } else {
        await unitService.create(unitData);
        setToast({ message: 'Unit created successfully!', type: 'success' });
        setShowAddUnitModal(false);
      }

      await fetchUnits(selectedProject.id);
      setSelectedUnit(null);
    } catch (err: any) {
      console.error('Failed to save unit:', err);
      setToast({ message: err?.message || 'Failed to save unit', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name || '',
      rera_number: project.rera_number || '',
      rera_website: project.rera_website || '',
      plan_sanction_no: project.plan_sanction_no || '',
      land_area_guntas: project.land_area_guntas?.toString() || '',
      total_units: project.total_units?.toString() || '',
      total_towers: project.total_towers?.toString() || '',
      possession_date: project.possession_date || '',
      address: project.address || '',
      city: project.city || '',
      vendor_name: project.vendor_name || '',
      vendor_pan: project.vendor_pan || '',
      vendor_address: project.vendor_address || '',
      vendor_phone: project.vendor_phone || '',
      vendor_email: project.vendor_email || '',
      vendor_rep_name: project.vendor_rep_name || '',
    });
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setShowDetailModal(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;
    try {
      setLoading(true);
      await projectService.delete(selectedProject.id);
      setToast({ message: 'Project deleted successfully!', type: 'success' });
      setShowDeleteConfirm(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setToast({ message: err?.message || 'Failed to delete project', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const projectData = {
        ...formData,
        land_area_guntas: parseFloat(formData.land_area_guntas) || 0,
        total_units: parseInt(formData.total_units) || 0,
        total_towers: parseInt(formData.total_towers) || 0,
      };
      
      if (showEditModal && selectedProject) {
        await projectService.update(selectedProject.id, projectData);
        setToast({ message: 'Project updated successfully!', type: 'success' });
        setShowEditModal(false);
      } else {
        await projectService.create(projectData);
        setToast({ message: 'Project created successfully!', type: 'success' });
        setShowAddModal(false);
      }
      
      setFormData({
        name: '',
        rera_number: '',
        rera_website: '',
        plan_sanction_no: '',
        land_area_guntas: '',
        total_units: '',
        total_towers: '',
        possession_date: '',
        address: '',
        city: '',
        vendor_name: '',
        vendor_pan: '',
        vendor_address: '',
        vendor_phone: '',
        vendor_email: '',
        vendor_rep_name: '',
      });
      setSelectedProject(null);
      fetchProjects();
    } catch (err: any) {
      console.error('Failed to save project:', err);
      setToast({ message: err?.message || 'Failed to save project', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Failed to Load Projects</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all real estate projects</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin size={14} />
                      <span>{project.location}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Total Units</p>
                    <p className="text-lg font-bold text-gray-900">{project.total_units || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Available</p>
                    <p className="text-lg font-bold text-green-600">{project.available_units || 0}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleViewProject(project)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {showDetailModal && selectedProject && (
        <Modal title="Project Details" onClose={() => setShowDetailModal(false)} size="lg">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Project Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">City</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.city || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* RERA Details */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">RERA Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">RERA Number</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.rera_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Plan Sanction No</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.plan_sanction_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">RERA Website</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.rera_website || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Land Area</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.land_area_guntas || 0} Guntas</p>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Project Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Units</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.total_units || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Towers</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.total_towers || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Possession Date</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.possession_date || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Vendor Details */}
            {selectedProject.vendor_name && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Vendor Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Vendor Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.vendor_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Vendor PAN</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.vendor_pan || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Vendor Address</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.vendor_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.vendor_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.vendor_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Representative</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.vendor_rep_name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t">
              <button
                onClick={() => handleManageUnits(selectedProject)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Manage Units
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEditProject(selectedProject)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProject(selectedProject)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedProject && (
        <Modal title="Delete Project" onClose={() => setShowDeleteConfirm(false)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{selectedProject.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <Modal title="Add New Project" onClose={() => setShowAddModal(false)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Orchid Life Towers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bengaluru"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Whitefield Main Road, Bangalore"
                  />
                </div>
              </div>
            </div>

            {/* RERA Details */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">RERA Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RERA Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rera_number"
                    value={formData.rera_number}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., PRM/KA/RERA/1251/446/PR/151223/006487"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RERA Website
                  </label>
                  <input
                    type="url"
                    name="rera_website"
                    value={formData.rera_website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://rera.karnataka.gov.in"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Sanction No
                  </label>
                  <input
                    type="text"
                    name="plan_sanction_no"
                    value={formData.plan_sanction_no}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BDA/2024/PLAN/8821"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Land Area (Guntas)
                  </label>
                  <input
                    type="number"
                    name="land_area_guntas"
                    value={formData.land_area_guntas}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="120"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Units
                  </label>
                  <input
                    type="number"
                    name="total_units"
                    value={formData.total_units}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="240"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Towers
                  </label>
                  <input
                    type="number"
                    name="total_towers"
                    value={formData.total_towers}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Possession Date
                  </label>
                  <input
                    type="date"
                    name="possession_date"
                    value={formData.possession_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Vendor Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Vendor Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    name="vendor_name"
                    value={formData.vendor_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sample Vendor Pvt Ltd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor PAN
                  </label>
                  <input
                    type="text"
                    name="vendor_pan"
                    value={formData.vendor_pan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="AABCV1234C"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Address
                  </label>
                  <input
                    type="text"
                    name="vendor_address"
                    value={formData.vendor_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MG Road, Bengaluru"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Phone
                  </label>
                  <input
                    type="tel"
                    name="vendor_phone"
                    value={formData.vendor_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+919876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Email
                  </label>
                  <input
                    type="email"
                    name="vendor_email"
                    value={formData.vendor_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="vendor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Representative
                  </label>
                  <input
                    type="text"
                    name="vendor_rep_name"
                    value={formData.vendor_rep_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="R. Kumar"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Project Modal */}
      <EditProjectModal
        showEditModal={showEditModal}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        loading={loading}
        onClose={() => { setShowEditModal(false); setSelectedProject(null); }}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Units Management Modal */}
      {showUnitsModal && selectedProject && (
        <Modal title={`Units - ${selectedProject.name}`} onClose={() => setShowUnitsModal(false)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Manage units for this project</p>
              <button
                onClick={handleAddUnit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Add Unit
              </button>
            </div>

            {units.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Home size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No units found for this project</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tower</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carpet Area</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{unit.unit_no}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{unit.tower}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{unit.floor_no}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{unit.unit_type}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{unit.carpet_area_sqft} sqft</td>
                        <td className="px-4 py-3 text-sm text-gray-600">₹{unit.basic_sale_value?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            unit.status === 'available' ? 'bg-green-100 text-green-700' :
                            unit.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                            unit.status === 'blocked' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {unit.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEditUnit(unit)}
                            className="text-blue-600 hover:text-blue-700 mr-3"
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add/Edit Unit Modal */}
      {(showAddUnitModal || showEditUnitModal) && (
        <Modal 
          title={selectedUnit ? 'Edit Unit' : 'Add Unit'} 
          onClose={() => {
            setShowAddUnitModal(false);
            setShowEditUnitModal(false);
            setSelectedUnit(null);
          }} 
          size="lg"
        >
          <form onSubmit={handleSubmitUnit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="unit_no"
                    value={unitFormData.unit_no}
                    onChange={handleUnitInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tower <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tower"
                    value={unitFormData.tower}
                    onChange={handleUnitInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="floor_no"
                    value={unitFormData.floor_no}
                    onChange={handleUnitInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unit_type"
                    value={unitFormData.unit_type}
                    onChange={handleUnitInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2bhk">2 BHK</option>
                    <option value="2_5bhk">2.5 BHK</option>
                    <option value="3bhk">3 BHK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facing
                  </label>
                  <input
                    type="text"
                    name="facing"
                    value={unitFormData.facing}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="East"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No of Parking
                  </label>
                  <input
                    type="number"
                    name="no_of_parking"
                    value={unitFormData.no_of_parking}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            {/* Area Details */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Area Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carpet Area (sqft) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="carpet_area_sqft"
                    value={unitFormData.carpet_area_sqft}
                    onChange={handleUnitInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Super Built-up (sqft) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="super_built_up_sqft"
                    value={unitFormData.super_built_up_sqft}
                    onChange={handleUnitInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balcony Area (sqft)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="balcony_area_sqft"
                    value={unitFormData.balcony_area_sqft}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Undivided Share (sqft)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="undivided_share_sqft"
                    value={unitFormData.undivided_share_sqft}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Undivided Share Fraction
                  </label>
                  <input
                    type="text"
                    name="undivided_share_fraction"
                    value={unitFormData.undivided_share_fraction}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1/240"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Basic Rate per sqft <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="basic_rate_per_sqft"
                    value={unitFormData.basic_rate_per_sqft}
                    onChange={handleUnitInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Basic Sale Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="basic_sale_value"
                    value={unitFormData.basic_sale_value}
                    onChange={handleUnitInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="6000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="gst_amount"
                    value={unitFormData.gst_amount}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="300000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance (24 months)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="maintenance_24mo"
                    value={unitFormData.maintenance_24mo}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Corpus Fund
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="corpus_fund"
                    value={unitFormData.corpus_fund}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Charges
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="other_charges"
                    value={unitFormData.other_charges}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gross Apartment Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="gross_apartment_value"
                    value={unitFormData.gross_apartment_value}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="6385000"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Plan URL
                  </label>
                  <input
                    type="url"
                    name="floor_plan_url"
                    value={unitFormData.floor_plan_url}
                    onChange={handleUnitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/floor-plan.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={unitFormData.remarks}
                    onChange={handleUnitInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowAddUnitModal(false);
                  setShowEditUnitModal(false);
                  setSelectedUnit(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : selectedUnit ? 'Update Unit' : 'Create Unit'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Projects;
