import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../services/api';
import { Shield, Bell, PlusCircle, LogOut, CheckCircle2, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi.list()
        .then((res) => {
          const unread = res.data.data.notifications.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-brand-500 font-bold text-xl">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span className="text-white tracking-tight">Fix<span className="text-emerald-400">My</span>Street</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-800 text-emerald-300 hover:bg-slate-700 transition"
                  >
                    Admin Console
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/reports/new"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Report Issue</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      My Reports
                    </Link>
                  </>
                )}

                <Link
                  to="/notifications"
                  className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-200">{user?.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-400 border border-slate-700">
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
