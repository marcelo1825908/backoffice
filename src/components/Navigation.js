import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/api';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    // Clear all auth data
    localStorage.removeItem('user');
    // Reload page to reset app state
    window.location.reload();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/payments', label: 'Payments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/members', label: 'Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-pos-bg-secondary border-r-2 border-pos-border-primary shadow-2xl z-50">
      <div className="flex flex-col h-full py-6">
        <div className="px-6 mb-8">
          <h1 className="text-2xl font-bold text-pos-text-primary">Backoffice</h1>
          <p className="text-sm text-pos-text-secondary mt-1">POS System</p>
        </div>
        <div className="flex flex-col space-y-2 px-4 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'text-blue-400 bg-pos-bg-primary border-2 border-pos-border-primary shadow-lg'
                    : 'text-pos-text-secondary hover:text-blue-400 hover:bg-pos-bg-primary'
                }`}
              >
                <svg
                  className="w-6 h-6 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Profile and Logout Buttons */}
        <div className="px-4 pt-4 border-t border-pos-border-secondary space-y-2">
          {/* Profile Button */}
          <button
            onClick={() => navigate('/profile')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${
              location.pathname === '/profile'
                ? 'text-blue-400 bg-pos-bg-primary border-2 border-pos-border-primary shadow-lg'
                : 'text-pos-text-secondary hover:text-blue-400 hover:bg-pos-bg-primary'
            }`}
          >
            <svg
              className="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm font-medium">Profile</span>
          </button>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl transition-colors text-pos-text-secondary hover:text-red-400 hover:bg-pos-bg-primary"
          >
            <svg
              className="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

