import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { bookings as initialBookings } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

type Booking = typeof initialBookings[0];

const NewBookings: React.FC = () => {
  const [bookings, setBookings] = useState(initialBookings);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const takeOwnership = (id: string) => {
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: 'In Process' } : b)
    );
    setToast({ message: 'Ownership taken. Booking is now In Process.', type: 'success' });
  };

  const filtered = filterStatus === 'All'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

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
          {['All', 'New', 'In Process', 'Done'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
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
                  <td className="px-5 py-4 text-sm font-semibold text-blue-600">{b.id}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-gray-900">{b.customerName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{b.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{b.project}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{b.unitType}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{b.sqft}</td>
                  <td className="px-5 py-4">
                    <Badge status={b.tower} type="tower" />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{b.bookingDate}</td>
                  <td className="px-5 py-4">
                    <Badge status={b.status} />
                  </td>
                  <td className="px-5 py-4">
                    {b.status === 'New' ? (
                      <button
                        onClick={() => takeOwnership(b.id)}
                        className="px-3 md:px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        Take Ownership
                      </button>
                    ) : (
                      <button
                        onClick={() => setViewBooking(b)}
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
        <Modal title="Booking Details" onClose={() => setViewBooking(null)} size="sm">
          <div className="space-y-0">
            {[
              ['Booking ID', viewBooking.id],
              ['Customer', viewBooking.customerName],
              ['Phone', viewBooking.phone],
              ['Project', viewBooking.project],
              ['Unit Type', viewBooking.unitType],
              ['Area', `${viewBooking.sqft} sq.ft`],
              ['Tower', viewBooking.tower],
              ['Booking Date', viewBooking.bookingDate],
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
