import React, { useState } from 'react';
import { Filter, TrendingUp, CheckCircle, X } from 'lucide-react';
import { payments as initialPayments } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import Toast from '../components/ui/Toast';

const avatarColors = ['bg-purple-400', 'bg-blue-400', 'bg-teal-400'];

const PaymentTracking: React.FC = () => {
  const [payments, setPayments] = useState(initialPayments);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const markAsPaid = (id: string) => {
    setPayments(prev => prev.map(p =>
      p.id === id
        ? { ...p, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] }
        : p
    ));
    const payment = payments.find(p => p.id === id);
    setToast({ message: `${payment?.customerName}'s payment marked as paid.`, type: 'success' });
  };

  const pendingAmount = payments
    .filter(p => p.status !== 'Paid')
    .reduce((sum, p) => sum + p.amountValue, 0);

  const receivedAmount = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amountValue, 0);

  const formatCr = (v: number) => `₹${(v / 10000000).toFixed(2)}Cr`;

  const filtered = filterStatus === 'All'
    ? payments
    : payments.filter(p => p.status === filterStatus);

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Payment Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage payment requests</p>
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
          {['All', 'Pending', 'Paid', 'Payment Requested'].map(s => (
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Payments</p>
            <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Pending Amount</p>
            <p className="text-2xl md:text-3xl font-bold text-orange-500">{formatCr(pendingAmount)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Received Amount</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{formatCr(receivedAmount)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle size={18} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Payment ID', 'Customer Name', 'Project', 'Tower', 'Amount', 'Status', 'Request Date', 'Payment Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-blue-600">{p.id}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{p.customerName}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{p.project}</td>
                  <td className="px-5 py-4">
                    <Badge status={p.tower} type="tower" />
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{p.amount}</td>
                  <td className="px-5 py-4">
                    <Badge status={p.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{p.requestDate}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{p.paymentDate}</td>
                  <td className="px-5 py-4">
                    {p.status !== 'Paid' ? (
                      <button
                        onClick={() => markAsPaid(p.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        <CheckCircle size={13} />
                        Mark as Paid
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                        <CheckCircle size={14} />
                        Paid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                    No payments match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payment Activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Payment Activity</h2>
        <div className="space-y-3">
          {payments.map((p, i) => (
            <div key={p.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
              <div className={`w-9 h-9 rounded-full ${avatarColors[i % 3]} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm truncate">{p.customerName}</span>
                  <Badge status={p.status} />
                </div>
                <p className="text-xs text-gray-500">{p.project} • {p.tower}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-semibold text-gray-900">{p.amount}</span>
                  <span className="text-xs text-gray-400">{p.requestDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default PaymentTracking;
