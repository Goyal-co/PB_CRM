import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { bookings, payments } from '../data/mockData';
import { Badge } from '../components/ui/Badge';

const statCards = [
  { label: 'Total Bookings', value: 5, color: 'bg-blue-100' },
  { label: 'Agreements Pending Review', value: 1, color: 'bg-orange-100' },
  { label: 'Agreements Approved', value: 1, color: 'bg-green-100' },
  { label: 'Payments Pending', value: 1, color: 'bg-yellow-100' },
  { label: 'Payments Received', value: 1, color: 'bg-teal-100' },
];

const Dashboard: React.FC = () => {
  const recentBookings = bookings.slice(0, 4);
  const recentPayments = payments;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Alert Banner */}
      <div className="mb-5 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
        <AlertCircle size={18} className="text-orange-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-gray-800 text-sm">1 Agreement Pending Approval</p>
          <p className="text-xs text-orange-600 mt-0.5">Please review and approve pending agreements to proceed with bookings.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-5">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1 leading-tight">{card.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full shrink-0 ${card.color}`} />
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/bookings" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium whitespace-nowrap">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Booking ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Project</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Unit</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{b.id}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{b.customerName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{b.project}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">{b.unitType} • {b.sqft} sqft</td>
                    <td className="px-5 py-3.5">
                      <Badge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payment Requests */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Payment Requests</h2>
          </div>
          <div className="p-4 space-y-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="p-3.5 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-900">{p.customerName}</span>
                  <Badge status={p.status} />
                </div>
                <p className="text-xs text-gray-500 mb-2">{p.project} • {p.tower}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{p.amount}</span>
                  <span className="text-xs text-gray-400">{p.requestDate}</span>
                </div>
              </div>
            ))}
            <Link to="/payment-tracking" className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium pt-1">
              View All Payments →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
