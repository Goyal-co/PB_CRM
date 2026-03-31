import React, { useState, useEffect } from 'react';
import { Plus, Users as UsersIcon, Edit2, UserCheck, UserX, Loader2, Shield, Briefcase, User } from 'lucide-react';
import { userService, type UserProfile, type CreateInvitationDto } from '../services/userService';
import { projectService, type Project } from '../services/projectService';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  // Form data
  const [inviteData, setInviteData] = useState<CreateInvitationDto>({
    email: '',
    role: 'user',
    first_name: '',
    last_name: '',
    phone: '',
    project_ids: [],
    manager_id: '',
    notes: '',
  });
  
  const [editData, setEditData] = useState({
    role: '' as 'super_admin' | 'manager' | 'user',
    manager_id: '',
  });
  
  const [projectAssignments, setProjectAssignments] = useState<string[]>([]);
  const [deactivateReason, setDeactivateReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [roleFilter, statusFilter, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter === 'active';
      if (searchQuery) params.search = searchQuery;
      
      const [usersData, projectsData, managersData] = await Promise.all([
        userService.getAll(params),
        projectService.getAll(),
        userService.getManagers(),
      ]);
      
      // Debug logging
      console.log('usersData type:', typeof usersData);
      console.log('usersData is array?', Array.isArray(usersData));
      console.log('usersData keys:', Object.keys(usersData || {}));
      console.log('usersData.users:', (usersData as any)?.users);
      
      // Extract the actual arrays - users endpoint returns {users: [...]} while others return arrays directly
      const users = Array.isArray(usersData) ? usersData : ((usersData as any)?.users || []);
      const projects = Array.isArray(projectsData) ? projectsData : ((projectsData as any)?.data || []);
      const managers = Array.isArray(managersData) ? managersData : ((managersData as any)?.data || []);
      
      console.log('Final extracted users:', users);
      console.log('Final extracted users length:', users?.length);
      console.log('First user project_ids:', users[0]?.project_ids);
      console.log('First user projects:', users[0]?.projects);
      console.log('Sample user object:', users[0]);
      
      // Transform users to extract project IDs from projects array
      const transformedUsers = users.map((user: any) => ({
        ...user,
        project_ids: user.projects?.map((p: any) => p.id) || []
      }));
      
      console.log('Transformed users with project_ids:', transformedUsers);
      console.log('First transformed user project_ids:', transformedUsers[0]?.project_ids);
      
      setUsers(transformedUsers);
      setProjects(projects);
      setManagers(managers);
      
      console.log('State updated - users now have', transformedUsers.length, 'items');
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setToast({ message: error?.message || 'Failed to load users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Invite new user
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userService.createInvitation(inviteData);
      setToast({ message: 'User invitation sent successfully!', type: 'success' });
      setShowInviteModal(false);
      setInviteData({
        email: '',
        role: 'user',
        first_name: '',
        last_name: '',
        phone: '',
        project_ids: [],
        manager_id: '',
        notes: '',
      });
      await fetchData();
    } catch (error: any) {
      console.error('Invite user error:', error);
      setToast({ message: error?.message || 'Failed to send invitation', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Edit user (role and manager)
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setLoading(true);
      
      // Update role if changed
      if (editData.role && editData.role !== selectedUser.role) {
        await userService.updateRole(selectedUser.id, { role: editData.role });
      }
      
      // Update manager if changed
      if (editData.manager_id && editData.manager_id !== selectedUser.manager_id) {
        await userService.assignManager(selectedUser.id, { manager_id: editData.manager_id });
      }
      
      setToast({ message: 'User updated successfully!', type: 'success' });
      setShowEditModal(false);
      setSelectedUser(null);
      await fetchData();
    } catch (error: any) {
      console.error('Update user error:', error);
      setToast({ message: error?.message || 'Failed to update user', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setEditData({
      role: user.role,
      manager_id: user.manager_id || '',
    });
    setShowEditModal(true);
  };

  // Manage projects
  const openProjectsModal = (user: UserProfile) => {
    setSelectedUser(user);
    // Use project_ids if available, otherwise extract from projects array
    const projectIds = user.project_ids || user.projects?.map(p => p.id) || [];
    setProjectAssignments(projectIds);
    setShowProjectsModal(true);
  };

  const handleToggleProject = async (projectId: string) => {
    if (!selectedUser) return;
    try {
      const isRemoving = projectAssignments.includes(projectId);
      
      if (isRemoving) {
        // Remove project
        await userService.removeProject(selectedUser.id, projectId);
        setProjectAssignments(prev => prev.filter(id => id !== projectId));
        setToast({ message: 'Project removed successfully!', type: 'success' });
      } else {
        // Add project
        await userService.assignProject(selectedUser.id, { project_id: projectId });
        setProjectAssignments(prev => [...prev, projectId]);
        setToast({ message: 'Project assigned successfully!', type: 'success' });
      }
      await fetchData();
    } catch (error: any) {
      console.error('Toggle project error:', error);
      setToast({ message: error?.message || 'Failed to update project assignment', type: 'error' });
      // Revert the optimistic update on error
      if (selectedUser) {
        setProjectAssignments(selectedUser.project_ids || []);
      }
    }
  };

  // Deactivate user
  const handleDeactivate = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      await userService.deactivate(selectedUser.id, { reason: deactivateReason });
      setToast({ message: 'User deactivated successfully!', type: 'success' });
      setShowDeactivateModal(false);
      setSelectedUser(null);
      setDeactivateReason('');
      await fetchData();
    } catch (error: any) {
      console.error('Deactivate user error:', error);
      setToast({ message: error?.message || 'Failed to deactivate user', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Reactivate user
  const handleReactivate = async (user: UserProfile) => {
    try {
      setLoading(true);
      await userService.reactivate(user.id);
      setToast({ message: 'User reactivated successfully!', type: 'success' });
      await fetchData();
    } catch (error: any) {
      console.error('Reactivate user error:', error);
      setToast({ message: error?.message || 'Failed to reactivate user', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield size={16} className="text-purple-600" />;
      case 'manager': return <Briefcase size={16} className="text-blue-600" />;
      default: return <User size={16} className="text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      super_admin: 'bg-purple-100 text-purple-700',
      manager: 'bg-blue-100 text-blue-700',
      user: 'bg-gray-100 text-gray-700',
    };
    return badges[role as keyof typeof badges] || badges.user;
  };

  if (loading && !showInviteModal && !showEditModal && !showProjectsModal && !showDeactivateModal) {
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage users, roles, and project assignments</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Invite User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.first_name[0]}{user.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{user.project_ids?.length || 0} projects</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openProjectsModal(user)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Manage projects"
                        >
                          <Briefcase size={16} />
                        </button>
                        {user.is_active ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeactivateModal(true);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deactivate user"
                          >
                            <UserX size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(user)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Reactivate user"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <Modal title="Invite New User" onClose={() => setShowInviteModal(false)} size="lg">
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inviteData.first_name}
                  onChange={(e) => setInviteData({ ...inviteData, first_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inviteData.last_name}
                  onChange={(e) => setInviteData({ ...inviteData, last_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={inviteData.phone}
                  onChange={(e) => setInviteData({ ...inviteData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as 'manager' | 'user' })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Manager</label>
                <select
                  value={inviteData.manager_id}
                  onChange={(e) => setInviteData({ ...inviteData, manager_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.first_name} {manager.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={inviteData.notes}
                  onChange={(e) => setInviteData({ ...inviteData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <Modal title="Edit User" onClose={() => setShowEditModal(false)} size="md">
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="super_admin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Manager</label>
              <select
                value={editData.manager_id}
                onChange={(e) => setEditData({ ...editData, manager_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Manager</option>
                {managers.filter(m => m.id !== selectedUser.id).map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.first_name} {manager.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage Projects Modal */}
      {showProjectsModal && selectedUser && (
        <Modal title={`Manage Projects - ${selectedUser.first_name} ${selectedUser.last_name}`} onClose={() => setShowProjectsModal(false)} size="md">
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No projects available</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.city}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={projectAssignments.includes(project.id)}
                      onChange={() => handleToggleProject(project.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))
            )}
            <div className="pt-4 border-t">
              <button
                onClick={() => setShowProjectsModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deactivate User Modal */}
      {showDeactivateModal && selectedUser && (
        <Modal title="Deactivate User" onClose={() => setShowDeactivateModal(false)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to deactivate <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <textarea
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason for deactivation..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deactivating...' : 'Deactivate'}
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

export default Users;
