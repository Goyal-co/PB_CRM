import React, { useState } from 'react';
import { User, Bell, Lock, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
);

const Settings: React.FC = () => {
  const { currentUser } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.name ?? 'Admin User');
  const [email, setEmail] = useState(currentUser?.email ?? 'admin@realestate.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('RealEstate CRM');
  const [currency, setCurrency] = useState('INR (₹)');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [notifications, setNotifications] = useState({
    newBookings: true,
    agreementApprovals: true,
    paymentUpdates: true,
    emailNotifications: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveAccount = () => {
    if (!fullName.trim()) {
      setToast({ message: 'Full name cannot be empty.', type: 'error' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setToast({ message: 'Please enter a valid email address.', type: 'error' });
      return;
    }
    setToast({ message: 'Account settings saved successfully!', type: 'success' });
  };

  const updatePassword = () => {
    if (!currentPassword) {
      setToast({ message: 'Please enter your current password.', type: 'error' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setToast({ message: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match.', type: 'error' });
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setToast({ message: 'Password updated successfully!', type: 'success' });
  };

  const saveSystemSettings = () => {
    setToast({ message: 'System settings saved successfully!', type: 'success' });
  };

  const confirmDeleteData = () => {
    setShowDeleteConfirm(false);
    setToast({ message: 'All CRM data has been permanently deleted.', type: 'success' });
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your CRM settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Account Settings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <User size={17} className="text-blue-500" />
            </div>
            <h2 className="font-semibold text-gray-900">Account Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Full Name</label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Phone Number</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
              />
            </div>
            <button
              onClick={saveAccount}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
              <Bell size={17} className="text-purple-500" />
            </div>
            <h2 className="font-semibold text-gray-900">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'newBookings' as const, label: 'New Bookings', desc: 'Get notified for new bookings' },
              { key: 'agreementApprovals' as const, label: 'Agreement Approvals', desc: 'Notifications for pending approvals' },
              { key: 'paymentUpdates' as const, label: 'Payment Updates', desc: 'Get notified about payment status' },
              { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive email updates' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4 py-0.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle
                  checked={notifications[key]}
                  onChange={() => {
                    toggleNotification(key);
                    setToast({ message: `${label} ${!notifications[key] ? 'enabled' : 'disabled'}.`, type: 'success' });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center shrink-0">
              <Lock size={17} className="text-green-500" />
            </div>
            <h2 className="font-semibold text-gray-900">Security Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">New Password</label>
              <input
                type="password"
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
            <button
              onClick={updatePassword}
              className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
              <Database size={17} className="text-orange-500" />
            </div>
            <h2 className="font-semibold text-gray-900">System Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Company Name</label>
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Default Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400 transition-colors"
              >
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Date Format</label>
              <select
                value={dateFormat}
                onChange={e => setDateFormat(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400 transition-colors"
              >
                <option>YYYY-MM-DD</option>
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
              </select>
            </div>
            <button
              onClick={saveSystemSettings}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-5">
        <h3 className="font-bold text-red-600 mb-3">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Delete All Data</p>
            <p className="text-xs text-red-500 mt-0.5">Permanently delete all CRM data. This action cannot be undone.</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap shrink-0"
          >
            Delete Data
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal title="Confirm Data Deletion" onClose={() => setShowDeleteConfirm(false)} size="sm">
          <div className="mb-5">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database size={22} className="text-red-500" />
            </div>
            <p className="text-sm text-gray-700 text-center">
              Are you sure you want to <strong>permanently delete all CRM data</strong>?
              This includes all bookings, agreements, customers, and payment records.
            </p>
            <p className="text-xs text-red-500 text-center mt-2 font-medium">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteData}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Yes, Delete All
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Settings;
