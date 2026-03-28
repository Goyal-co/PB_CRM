import React, { useState } from 'react';
import { Filter, Download } from 'lucide-react';
import { customers, projects, towers } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import Toast from '../components/ui/Toast';

const avatarColors: Record<string, string> = {
  R: 'bg-red-400',
  P: 'bg-purple-400',
  A: 'bg-orange-400',
  S: 'bg-blue-400',
  V: 'bg-teal-400',
};

const Customers: React.FC = () => {
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [towerFilter, setTowerFilter] = useState('All Towers');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filtered = customers.filter(c => {
    const matchProject = projectFilter === 'All Projects' || c.project === projectFilter;
    const matchTower = towerFilter === 'All Towers' || c.tower === towerFilter;
    return matchProject && matchTower;
  });

  const newBookings = filtered.filter(c => c.bookingStatus === 'New').length;
  const inProcess = filtered.filter(c => c.bookingStatus === 'In Process').length;
  const completed = filtered.filter(c => c.bookingStatus === 'Done').length;

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Project', 'Tower', 'Unit', 'Status'];
    const rows = filtered.map(c => [
      c.id, c.name, c.phone, c.email, c.project, c.tower, `"${c.unit}"`, c.bookingStatus,
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast({ message: `Exported ${filtered.length} customer record(s) to CSV.`, type: 'success' });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Customer Database</h1>
          <p className="text-gray-500 text-sm mt-1">CRM-style customer management</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
        >
          <Download size={15} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={15} />
            <span>Filters:</span>
          </div>
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400"
          >
            <option>All Projects</option>
            {projects.map(p => <option key={p}>{p}</option>)}
          </select>
          <select
            value={towerFilter}
            onChange={e => setTowerFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400"
          >
            <option>All Towers</option>
            {towers.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        {[
          { label: 'Total Customers', value: filtered.length, color: 'text-gray-900' },
          { label: 'New Bookings', value: newBookings, color: 'text-gray-900' },
          { label: 'In Process', value: inProcess, color: 'text-blue-600' },
          { label: 'Completed', value: completed, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Name', 'Phone', 'Email', 'Project', 'Tower', 'Unit', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => {
                const initial = c.name.charAt(0);
                const avatarColor = avatarColors[initial] || 'bg-gray-400';
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                          {initial}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{c.phone}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{c.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{c.project}</td>
                    <td className="px-5 py-4">
                      <Badge status={c.tower} type="tower" />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{c.unit}</td>
                    <td className="px-5 py-4">
                      <Badge status={c.bookingStatus} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Customers;
