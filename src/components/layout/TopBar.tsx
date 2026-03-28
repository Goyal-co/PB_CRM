import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, Menu, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onMenuClick: () => void;
}

const notifications = [
  {
    title: 'New booking received',
    desc: 'Priya Patel booked Tower A — 3 BHK',
    time: '5 min ago',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Payment received',
    desc: 'Sneha Reddy completed ₹22L payment',
    time: '1 hr ago',
    color: 'bg-green-100 text-green-600',
  },
  {
    title: 'Agreement under review',
    desc: "Vikram Singh's agreement needs attention",
    time: '2 hrs ago',
    color: 'bg-orange-100 text-orange-600',
  },
];

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-10">
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-lg">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search customer / booking / tower..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right: Bell + User */}
      <div className="flex items-center gap-1 ml-3" ref={containerRef}>
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setDropdownOpen(false); }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900 text-sm">Notifications</p>
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                  {notifications.length} new
                </span>
              </div>
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${n.color} flex items-center justify-center shrink-0 text-xs font-bold mt-0.5`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 truncate">{n.desc}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5 border-t border-gray-100">
                <button className="text-xs text-blue-600 font-medium hover:text-blue-700 w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDropdownOpen(v => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div
              className={`w-8 h-8 ${currentUser?.avatarColor ?? 'bg-blue-600'} rounded-full flex items-center justify-center shrink-0`}
            >
              <span className="text-white text-xs font-semibold">{currentUser?.initials ?? 'U'}</span>
            </div>
            <div className="hidden sm:block text-sm text-left">
              <div className="font-medium text-gray-900 leading-tight">{currentUser?.name ?? 'User'}</div>
              <div className="text-xs text-gray-500 leading-tight">{currentUser?.email ?? ''}</div>
            </div>
            <ChevronDown
              size={14}
              className={`hidden sm:block text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              {/* User info header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${currentUser?.avatarColor ?? 'bg-blue-600'} rounded-full flex items-center justify-center shrink-0`}
                  >
                    <span className="text-white text-sm font-semibold">{currentUser?.initials ?? 'U'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        currentUser?.role === 'admin'
                          ? 'bg-blue-100 text-blue-700'
                          : currentUser?.role === 'manager'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role === 'manager' ? 'Manager' : 'Agent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={16} className="text-gray-400" />
                  Profile
                </button>
                <button
                  onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} className="text-gray-400" />
                  Settings
                </button>
              </div>

              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} className="text-red-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
