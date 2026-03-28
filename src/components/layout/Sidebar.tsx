import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  HardHat,
  CreditCard,
  TrendingUp,
  Layout,
  Settings,
  X,
  Building2,
  ClipboardList,
  List,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'agent'] },
  { path: '/booking-form', label: 'Booking Form', icon: ClipboardList, roles: ['agent'] },
  { path: '/my-bookings', label: 'My Bookings', icon: List, roles: ['agent'] },
  { path: '/bookings', label: 'New Bookings', icon: BookOpen, roles: ['admin', 'manager'] },
  { path: '/agreements', label: 'Agreements', icon: FileText, roles: ['admin', 'manager'] },
  { path: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager'] },
  { path: '/construction', label: 'Construction Updates', icon: HardHat, roles: ['admin', 'manager'] },
  { path: '/payment-requests', label: 'Payment Requests', icon: CreditCard, roles: ['admin', 'manager'] },
  { path: '/payment-tracking', label: 'Payment Tracking', icon: TrendingUp, roles: ['admin', 'manager'] },
  { path: '/templates', label: 'Templates', icon: Layout, roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager', 'agent'] },
];

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  
  const filteredNavItems = navItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <aside className="w-56 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">RealEstate CRM</div>
            <div className="text-xs text-gray-500">Post-Booking Management</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {filteredNavItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
