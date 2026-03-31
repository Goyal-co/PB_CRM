import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileText, Calendar, Home, Filter, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { bookingService, type Booking } from '../services/bookingService';


const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.getWorkspace();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error('Failed to fetch bookings:', error);
        setError(error?.response?.data?.message || error?.message || 'Failed to load bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, []);

  const filteredBookings = selectedStatus === 'all' 
    ? bookings 
    : bookings.filter((b: Booking) => b.status === selectedStatus);

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
          <h3 className="text-red-800 font-semibold mb-2">Failed to Load Bookings</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage all your property bookings</p>
        </div>
        <Link 
          to="/booking-form" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + New Booking
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="mb-5 bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
        <Filter size={18} className="text-gray-400" />
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
            onClick={() => setSelectedStatus('submitted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'submitted' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Submitted
          </button>
          <button
            onClick={() => setSelectedStatus('under_review')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'under_review' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Under Review
          </button>
          <button
            onClick={() => setSelectedStatus('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'approved' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setSelectedStatus('agreement_signed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'agreement_signed' 
                ? 'bg-teal-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Home size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No bookings found</p>
          </div>
        ) : (
          filteredBookings.map((booking: Booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{booking.project?.name || 'N/A'}</h3>
                      <Badge status={booking.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {booking.id.slice(0, 8)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/booking-form?id=${booking.id}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Unit Details</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {booking.unit?.unit_type || 'N/A'} • {booking.unit?.unit_no || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">{booking.unit?.carpet_area_sqft || 0} sqft</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {booking.allottee ? `${booking.allottee.first_name} ${booking.allottee.last_name}` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Tower</p>
                    <p className="text-sm font-semibold text-blue-600">{booking.unit?.tower || 'N/A'}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Agent</p>
                    <p className="text-sm font-semibold text-purple-600">{booking.agent_name || 'Direct'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Status: <span className="font-semibold">{booking.status.replace('_', ' ').toUpperCase()}</span></span>
                    <span className="text-xs text-gray-500">Updated: {new Date(booking.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBookings;
