import React, { useState, useEffect } from 'react';
import { Filter, Eye, Printer, CheckCircle, RefreshCw, Copy, X, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import { bookingService, type Booking } from '../services/bookingService';

const Agreements: React.FC = () => {
  const [agreements, setAgreements] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAgreement, setViewAgreement] = useState<Booking | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getAll({ status: 'approved' });
        setAgreements(data);
      } catch (error) {
        console.error('Failed to fetch agreements:', error);
        setToast({ message: 'Failed to load agreements', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchAgreements();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      // This would call an API to update agreement status
      setAgreements(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
      setToast({ message: `Agreement updated successfully.`, type: 'success' });
      setViewAgreement(null);
    } catch (error) {
      console.error('Failed to update agreement:', error);
      setToast({ message: 'Failed to update agreement', type: 'error' });
    }
  };

  const underReview = agreements.filter(a => a.status === 'under_review').length;
  const approved = agreements.filter(a => a.status === 'approved' || a.status === 'agreement_generated').length;
  const rework = agreements.filter(a => a.status === 'needs_revision').length;

  const filtered = filterStatus === 'All'
    ? agreements
    : agreements.filter(a => a.status.toLowerCase() === filterStatus.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Agreements</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all customer agreements</p>
        </div>
        <button
          onClick={() => setShowFilter(v => !v)}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 border rounded-lg text-sm font-medium transition-colors shrink-0 ${
            showFilter
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
          }`}
        >
          <Filter size={15} />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Status:</span>
          {['All', 'under_review', 'approved', 'agreement_generated', 'needs_revision'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'All' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
          <button
            onClick={() => { setFilterStatus('All'); setShowFilter(false); }}
            className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Under Review', value: underReview, color: 'text-orange-500', bg: 'bg-orange-50', icon: 'text-orange-400' },
          { label: 'Approved', value: approved, color: 'text-green-600', bg: 'bg-green-50', icon: 'text-green-400' },
          { label: 'Rework', value: rework, color: 'text-red-500', bg: 'bg-red-50', icon: 'text-red-400' },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <Copy size={20} className={icon} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Agreement ID', 'Customer Name', 'Project', 'Unit', 'Status', 'Created By', 'Created Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-blue-600">{a.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {a.allottee ? `${a.allottee.first_name} ${a.allottee.last_name}` : 'N/A'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{a.project?.name || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {a.unit ? `${a.unit.tower}-${a.unit.unit_no}` : 'N/A'}
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={a.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{a.agent_name || 'System'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewAgreement(a)}
                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Print"
                      >
                        <Printer size={16} />
                      </button>
                      {a.status === 'under_review' && (
                        <>
                          <button
                            onClick={() => updateStatus(a.id, 'Approved')}
                            className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => updateStatus(a.id, 'Rework')}
                            className="p-1.5 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Send for Rework"
                          >
                            <RefreshCw size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    No agreements found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Agreement Modal */}
      {viewAgreement && (
        <Modal title="Agreement Details" onClose={() => setViewAgreement(null)} size="sm">
          <div className="space-y-0">
            {[
              ['Agreement ID', viewAgreement.id.slice(0, 8)],
              ['Customer', viewAgreement.allottee ? `${viewAgreement.allottee.first_name} ${viewAgreement.allottee.last_name}` : 'N/A'],
              ['Project', viewAgreement.project?.name || 'N/A'],
              ['Unit', viewAgreement.unit ? `${viewAgreement.unit.tower}-${viewAgreement.unit.unit_no}` : 'N/A'],
              ['Created By', viewAgreement.agent_name || 'System'],
              ['Created Date', new Date(viewAgreement.created_at).toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="text-sm font-medium text-gray-900">{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-gray-500">Status</span>
              <Badge status={viewAgreement.status} />
            </div>
          </div>

          {/* Action buttons in modal */}
          {viewAgreement.status === 'under_review' && (
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => updateStatus(viewAgreement.id, 'Approved')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={15} />
                Approve
              </button>
              <button
                onClick={() => updateStatus(viewAgreement.id, 'Rework')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                <RefreshCw size={15} />
                Send for Rework
              </button>
            </div>
          )}

          <button
            onClick={() => setViewAgreement(null)}
            className="mt-3 w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </Modal>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Agreements;
