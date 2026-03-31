import React, { useState, useEffect } from 'react';
import { Home, Loader2, Filter } from 'lucide-react';
import { unitService, type Unit } from '../services/unitService';
import { projectService, type Project } from '../services/projectService';

const Units: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchUnits();
    }
  }, [selectedProject, selectedStatus]);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(Array.isArray(data) ? data : []);
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { project_id: selectedProject };
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      const data = await unitService.getAll(params);
      setUnits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch units:', err);
      setError(err?.message || 'Failed to load units');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'booked':
        return 'bg-blue-100 text-blue-700';
      case 'sold':
        return 'bg-purple-100 text-purple-700';
      case 'blocked':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && !selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Units</h1>
        <p className="text-gray-500 text-sm mt-1">Manage unit inventory</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('available')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'available'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setSelectedStatus('booked')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'booked'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Booked
            </button>
            <button
              onClick={() => setSelectedStatus('sold')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'sold'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sold
            </button>
          </div>
        </div>
      </div>

      {/* Units Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Failed to Load Units</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchUnits}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      ) : units.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Home size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No units found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {unit.tower}-{unit.unit_no}
                  </h3>
                  <p className="text-sm text-gray-600">Floor {unit.floor_no}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                  {unit.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">{unit.unit_type?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium text-gray-900">{unit.carpet_area_sqft} sqft</span>
                </div>
                {unit.basic_rate_per_sqft && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price/sqft:</span>
                    <span className="font-medium text-gray-900">₹{unit.basic_rate_per_sqft.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Units;
