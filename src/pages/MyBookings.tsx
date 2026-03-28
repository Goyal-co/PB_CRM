import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileText, Calendar, Home, Filter } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface Booking {
  id: string;
  applicationNo: string;
  projectName: string;
  unitType: string;
  unitNo: string;
  carpetArea: string;
  totalValue: string;
  paidAmount: string;
  pendingAmount: string;
  bookingDate: string;
  status: 'active' | 'pending' | 'completed';
  constructionProgress: number;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    applicationNo: 'APP001',
    projectName: 'Orchid Life',
    unitType: '3 BHK',
    unitNo: 'B-501',
    carpetArea: '1800 sqft',
    totalValue: '₹47,00,000',
    paidAmount: '₹22,00,000',
    pendingAmount: '₹25,00,000',
    bookingDate: '2024-01-15',
    status: 'active',
    constructionProgress: 60,
  },
  {
    id: '2',
    applicationNo: 'APP002',
    projectName: 'Green Valley',
    unitType: '2 BHK',
    unitNo: 'A-302',
    carpetArea: '1200 sqft',
    totalValue: '₹32,00,000',
    paidAmount: '₹10,00,000',
    pendingAmount: '₹22,00,000',
    bookingDate: '2024-02-20',
    status: 'pending',
    constructionProgress: 35,
  },
];

const MyBookings: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredBookings = selectedStatus === 'all' 
    ? mockBookings 
    : mockBookings.filter(b => b.status === selectedStatus);

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
            onClick={() => setSelectedStatus('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'active' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'pending' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'completed' 
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
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{booking.projectName}</h3>
                      <Badge status={booking.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {booking.applicationNo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(booking.bookingDate).toLocaleDateString()}
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
                    <p className="text-sm font-semibold text-gray-900">{booking.unitType} • {booking.unitNo}</p>
                    <p className="text-xs text-gray-600">{booking.carpetArea}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Total Value</p>
                    <p className="text-sm font-semibold text-gray-900">{booking.totalValue}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Paid Amount</p>
                    <p className="text-sm font-semibold text-green-600">{booking.paidAmount}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Pending Amount</p>
                    <p className="text-sm font-semibold text-orange-600">{booking.pendingAmount}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 font-medium">Construction Progress</span>
                    <span className="text-xs font-semibold text-blue-600">{booking.constructionProgress}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300" 
                      style={{ width: `${booking.constructionProgress}%` }}
                    />
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
