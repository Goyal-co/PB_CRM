import React from 'react';

interface BadgeProps {
  status: string;
  type?: 'status' | 'tower';
}

const statusStyles: Record<string, string> = {
  'New': 'bg-gray-100 text-gray-700 border border-gray-200',
  'In Process': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Done': 'bg-green-50 text-green-700 border border-green-200',
  'Pending': 'bg-orange-50 text-orange-600 border border-orange-200',
  'Paid': 'bg-green-50 text-green-600 border border-green-200',
  'Payment Requested': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'Under Review': 'bg-orange-50 text-orange-600 border border-orange-200',
  'Approved': 'bg-green-50 text-green-600 border border-green-200',
  'Rework': 'bg-red-50 text-red-500 border border-red-200',
};

const towerStyles: Record<string, string> = {
  'Tower A': 'bg-blue-50 text-blue-700',
  'Tower B': 'bg-purple-50 text-purple-700',
  'Tower C': 'bg-teal-50 text-teal-700',
};

export const Badge: React.FC<BadgeProps> = ({ status, type = 'status' }) => {
  const styles = type === 'tower'
    ? (towerStyles[status] || 'bg-gray-100 text-gray-700')
    : (statusStyles[status] || 'bg-gray-100 text-gray-700');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
};
