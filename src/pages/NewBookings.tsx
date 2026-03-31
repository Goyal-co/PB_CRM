import React, { useState, useEffect } from 'react';
import { Filter, X, Loader2, FileText } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import { bookingService, type Booking } from '../services/bookingService';
import { documentService, type Document } from '../services/documentService';

const NewBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [bookingDocuments, setBookingDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getPendingReview();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setToast({ message: 'Failed to load bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const takeOwnership = async (id: string) => {
    try {
      await bookingService.startReview(id);
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: 'under_review' } : b)
      );
      setToast({ message: 'Review started. Booking is now under review.', type: 'success' });
    } catch (error) {
      console.error('Failed to start review:', error);
      setToast({ message: 'Failed to start review', type: 'error' });
    }
  };

  const filtered = filterStatus === 'All'
    ? bookings
    : bookings.filter(b => b.status.toLowerCase() === filterStatus.toLowerCase());

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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">New Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and process customer bookings</p>
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
          {['All', 'submitted', 'under_review', 'approved'].map(s => (
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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Booking ID', 'Customer Name', 'Project', 'Unit Type', 'Sqft', 'Tower', 'Booking Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-blue-600">{b.id.slice(0, 8)}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {b.allottee ? `${b.allottee.first_name} ${b.allottee.last_name}` : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{b.allottee_phone || 'N/A'}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{b.project?.name || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{b.unit?.unit_type || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{b.unit?.carpet_area_sqft || 0}</td>
                  <td className="px-5 py-4">
                    <Badge status={b.unit?.tower || 'N/A'} type="tower" />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={b.status} />
                  </td>
                  <td className="px-5 py-4">
                    {b.status === 'submitted' ? (
                      <button
                        onClick={() => takeOwnership(b.id)}
                        className="px-3 md:px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        Take Ownership
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          setViewBooking(b);
                          // Fetch documents for this booking
                          setLoadingDocuments(true);
                          try {
                            const docs = await documentService.getAll({ booking_id: b.id });
                            setBookingDocuments(docs);
                          } catch (error) {
                            console.error('Failed to fetch documents:', error);
                            setBookingDocuments([]);
                          } finally {
                            setLoadingDocuments(false);
                          }
                        }}
                        className="px-3 md:px-4 py-1.5 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                    No bookings match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {viewBooking && (
        <Modal title="Booking Details" onClose={() => { setViewBooking(null); setBookingDocuments([]); }} size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Details */}
            <div className="space-y-0">
            {[
              ['Booking ID', viewBooking.id.slice(0, 8)],
              ['Customer', viewBooking.allottee ? `${viewBooking.allottee.first_name} ${viewBooking.allottee.last_name}` : 'N/A'],
              ['Phone', viewBooking.allottee_phone || 'N/A'],
              ['Project', viewBooking.project?.name || 'N/A'],
              ['Unit Type', viewBooking.unit?.unit_type || 'N/A'],
              ['Area', `${viewBooking.unit?.carpet_area_sqft || 0} sq.ft`],
              ['Tower', viewBooking.unit?.tower || 'N/A'],
              ['Booking Date', new Date(viewBooking.created_at).toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="text-sm font-medium text-gray-900">{v}</span>
              </div>
            ))}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-gray-500">Status</span>
                <Badge status={viewBooking.status} />
              </div>
            </div>
            
            {/* Uploaded Documents */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText size={16} />
                Uploaded Documents
              </h3>
              {loadingDocuments ? (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : bookingDocuments.length > 0 ? (
                <div className="space-y-3">
                  {bookingDocuments.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{doc.file_name}</span>
                        <Badge status={doc.type} type="tower" />
                      </div>
                      {doc.file_name.toLowerCase().endsWith('.pdf') && (
                        <iframe
                          src={doc.preview_url || `https://pbcrmbackend-production.up.railway.app/api/v1/documents/${doc.id}/signed-url`}
                          className="w-full h-96 border border-gray-200 rounded"
                          title={doc.file_name}
                        />
                      )}
                      {doc.notes && (
                        <p className="text-xs text-gray-500 mt-2">{doc.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <FileText size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                </div>
              )}
            </div>
          </div>
          
          {viewBooking.status === 'under_review' && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={async () => {
                  try {
                    await bookingService.completeReview(viewBooking.id, 'approve');
                    setToast({ message: 'Booking approved successfully!', type: 'success' });
                    setViewBooking(null);
                    fetchBookings();
                  } catch (error: any) {
                    setToast({ message: error?.message || 'Failed to approve booking', type: 'error' });
                  }
                }}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={async () => {
                  try {
                    await bookingService.completeReview(viewBooking.id, 'reject', 'Rejected by manager');
                    setToast({ message: 'Booking rejected', type: 'success' });
                    setViewBooking(null);
                    fetchBookings();
                  } catch (error: any) {
                    setToast({ message: error?.message || 'Failed to reject booking', type: 'error' });
                  }
                }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </div>
          )}
          
          <button
            onClick={() => setViewBooking(null)}
            className="mt-4 w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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

export default NewBookings;
