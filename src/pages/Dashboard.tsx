import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { kpis, userSummary, recentBookings, recentPayments, loading, error, isAdmin, isManager, isUser } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const statCards = isAdmin || isManager ? [
    { label: 'Total Bookings', value: kpis?.total_bookings ?? 0, color: 'bg-blue-100' },
    { label: 'Active Bookings', value: kpis?.active_bookings ?? 0, color: 'bg-orange-100' },
    { label: 'Total Revenue', value: `₹${(kpis?.total_revenue ?? 0).toLocaleString()}`, color: 'bg-green-100' },
    { label: 'Pending Payments', value: `₹${(kpis?.pending_payments ?? 0).toLocaleString()}`, color: 'bg-yellow-100' },
    { label: 'Units Available', value: kpis?.units_available ?? 0, color: 'bg-teal-100' },
  ] : [];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {currentUser?.name}! {isAdmin ? "Here's your complete system overview." : isManager ? "Here's your daily task summary." : "Track your bookings and customer status."}
        </p>
      </div>

      {/* Alert Banner - Admin & Manager only */}
      {(isAdmin || isManager) && (
        <div className="mb-5 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-gray-800 text-sm">1 Agreement Pending Approval</p>
            <p className="text-xs text-orange-600 mt-0.5">Please review and approve pending agreements to proceed with bookings.</p>
          </div>
        </div>
      )}

      {/* User/Agent Welcome Banner */}
      {isUser && (
        <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <CheckCircle size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-gray-800 text-sm">Current Bookings: {userSummary?.total ?? 0}</p>
            <p className="text-xs text-blue-600 mt-0.5">Draft: {userSummary?.by_status?.draft ?? 0} | Submitted: {userSummary?.by_status?.submitted ?? 0}</p>
          </div>
        </div>
      )}

      {/* Stat Cards - Admin & Manager */}
      {(isAdmin || isManager) && (
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
      )}

      {/* User/Agent Stats */}
      {isUser && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-5">
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-600">{userSummary?.total ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{userSummary?.by_status?.approved ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Under Review</p>
            <p className="text-2xl font-bold text-orange-600">{userSummary?.by_status?.under_review ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Agreement Signed</p>
            <p className="text-2xl font-bold text-teal-600">{userSummary?.by_status?.agreement_signed ?? 0}</p>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Bookings - Admin & Manager only */}
        {(isAdmin || isManager) && (
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
                {Array.isArray(recentBookings) && recentBookings.length > 0 ? recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{b.id?.slice(0, 8) ?? 'N/A'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      {b.allottee ? `${b.allottee.first_name} ${b.allottee.last_name}` : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{b.project?.name ?? 'N/A'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                      {b.unit ? `${b.unit.unit_type ?? 'N/A'} • ${b.unit.carpet_area_sqft ?? 0} sqft` : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={b.status} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">
                      {loading ? 'Loading bookings...' : 'No bookings found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {/* User/Agent Bookings List */}
        {isUser && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Your Bookings</h2>
              <Link to="/my-bookings" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium whitespace-nowrap">
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
                {Array.isArray(recentBookings) && recentBookings.length > 0 ? recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{b.id?.slice(0, 8) ?? 'N/A'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      {b.allottee ? `${b.allottee.first_name} ${b.allottee.last_name}` : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{b.project?.name ?? 'N/A'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                      {b.unit ? `${b.unit.unit_type ?? 'N/A'} • ${b.unit.carpet_area_sqft ?? 0} sqft` : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={b.status} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">
                      {loading ? 'Loading bookings...' : 'No bookings found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {/* Recent Payment Requests / Agent Bookings Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{isUser ? 'Your Bookings Summary' : 'Recent Payment Requests'}</h2>
          </div>
          <div className="p-4 space-y-3">
            {isUser ? (
              <>
                {Array.isArray(recentBookings) && recentBookings.length > 0 ? recentBookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-3.5 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {b.allottee ? `${b.allottee.first_name} ${b.allottee.last_name}` : 'N/A'}
                      </span>
                      <Badge status={b.status} />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {b.project?.name ?? 'N/A'} • {b.unit?.unit_type ?? 'N/A'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {b.unit?.carpet_area_sqft ?? 0} sqft
                      </span>
                      <span className="text-xs text-gray-400">{b.id?.slice(0, 8) ?? 'N/A'}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">{loading ? 'Loading...' : 'No bookings yet'}</p>
                )}
                <Link to="/my-bookings" className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium pt-1">
                  View All Bookings →
                </Link>
              </>
            ) : (
              <>
                {Array.isArray(recentPayments) && recentPayments.length > 0 ? recentPayments.map((p) => (
                  <div key={p.id} className="p-3.5 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {p.booking?.allottee ? `${p.booking.allottee.first_name} ${p.booking.allottee.last_name}` : 'N/A'}
                      </span>
                      <Badge status={p.status} />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {p.booking?.project?.name ?? 'N/A'} • {p.booking?.unit?.tower ?? 'N/A'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">₹{(p.amount_due ?? 0).toLocaleString()}</span>
                      <span className="text-xs text-gray-400">{p.milestone ?? 'N/A'}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">{loading ? 'Loading...' : 'No payment requests'}</p>
                )}
                <Link to="/payment-tracking" className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium pt-1">
                  View All Payments →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
