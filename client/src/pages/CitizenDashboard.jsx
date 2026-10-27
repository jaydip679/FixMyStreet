import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { PlusCircle, Clock, MapPin, AlertCircle, FileText, ChevronRight } from 'lucide-react';

const statusColorMap = {
  SUBMITTED: 'bg-slate-100 text-slate-700 border-slate-300',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-blue-50 text-blue-700 border-blue-200',
  ASSIGNED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200'
};

export default function CitizenDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi.list()
      .then((res) => {
        setReports(res.data.data.reports);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load your reports');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Issue Reports</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track and monitor the status of civic problems you reported in your community.
          </p>
        </div>
        <Link
          to="/reports/new"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium text-sm transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </Link>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center space-x-2 border border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          Loading your reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="mt-8 bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No civic issues reported yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Notice a pothole, broken streetlight, or garbage accumulation? Submit a report with location and details.
          </p>
          <div className="mt-6">
            <Link
              to="/reports/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium text-sm transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Report</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Link
              key={report._id}
              to={`/reports/${report._id}`}
              className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {report.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      statusColorMap[report.status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {report.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-1">
                  {report.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                  {report.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1 truncate max-w-[70%]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{report.location?.address}</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 font-medium">
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
