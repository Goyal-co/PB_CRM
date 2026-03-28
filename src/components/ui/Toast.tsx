import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm ${
        type === 'success'
          ? 'bg-white border-green-200'
          : 'bg-white border-red-200'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={18} className="text-green-500 shrink-0" />
      ) : (
        <XCircle size={18} className="text-red-500 shrink-0" />
      )}
      <span className={`text-sm font-medium flex-1 ${type === 'success' ? 'text-gray-800' : 'text-gray-800'}`}>
        {message}
      </span>
      <button
        onClick={onClose}
        className="p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
};

export default Toast;
