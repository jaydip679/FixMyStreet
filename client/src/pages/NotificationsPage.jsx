import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../services/api';
import { Bell, CheckCheck, FileText, ArrowRight, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    setLoading(true);
    notificationsApi.list()
      .then((res) => {
        setNotifications(res.data.data.notifications);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Notifications</h1>
        <p className="mt-1 text-sm text-slate-600">
          Real-time updates regarding status changes, department dispatches, and verification of your reports.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="mt-8 bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No notifications</h3>
          <p className="mt-1 text-sm text-slate-500">
            You will receive updates here whenever a municipal action is taken on your reported issues.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-emerald-50/50 border-emerald-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-full mt-0.5 ${
                    n.isRead ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold">{n.title}</h3>
                    {!n.isRead && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-600 text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <div className="mt-2 flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </span>
                    {n.report && (
                      <Link
                        to={`/reports/${n.report._id || n.report}`}
                        className="text-emerald-600 font-medium hover:underline inline-flex items-center space-x-0.5"
                      >
                        <span>View Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n._id)}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/50 rounded transition flex items-center space-x-1 flex-shrink-0"
                  title="Mark as Read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
