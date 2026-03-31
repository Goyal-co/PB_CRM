import React from 'react';
import Modal from '../components/ui/Modal';

interface EditProjectModalProps {
  showEditModal: boolean;
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onClose: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  showEditModal,
  formData,
  handleInputChange,
  handleSubmit,
  loading,
  onClose,
}) => {
  if (!showEditModal) return null;

  return (
    <Modal title="Edit Project" onClose={onClose} size="lg">
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
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectModal;
