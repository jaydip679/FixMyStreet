import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { ArrowLeft, MapPin, Calendar, Building, CheckCircle, AlertTriangle, ShieldCheck, User } from 'lucide-react';

const LIFECYCLE_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' }
];

export default function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi.getById(id)
      .then((res) => {
        setReport(res.data.data.report);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load report details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading report details...</div>;
  }

  if (error || !report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <p className="font-semibold">{error || 'Report not found'}</p>
          <Link to="/dashboard" className="mt-4 inline-block text-sm underline font-medium">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isRejected = report.status === 'REJECTED';
  const currentStepIndex = LIFECYCLE_STEPS.findIndex((s) => s.key === report.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Reports</span>
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 uppercase tracking-wide">
              {report.category.replace('_', ' ')}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isRejected
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : report.status === 'RESOLVED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {report.status.replace('_', ' ')}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{report.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported on {new Date(report.createdAt).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{report.location?.address}</span>
            </span>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Lifecycle Resolution Progress</h2>
          {isRejected ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <div>
                <span className="font-bold">Report Rejected by Municipal Authority</span>
                <p className="mt-1 text-xs text-rose-700">{report.rejectionReason || 'No specific reason provided.'}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-lg border text-center transition ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs'
                        : isCompleted
                        ? 'bg-white border-slate-200 text-slate-700 font-medium'
                        : 'bg-slate-100/60 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="text-xs mb-1">Step {idx + 1}</div>
                    <div className="text-xs">{step.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Description</h3>
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {report.description}
            </p>
          </div>

          {report.photoUrl && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Uploaded Photographic Evidence</h3>
              <div className="rounded-lg overflow-hidden border border-slate-200 max-w-md">
                <img src={report.photoUrl} alt="Report Evidence" className="w-full h-auto object-cover max-h-64" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">Assigned Department</h4>
              <p className="text-sm font-medium text-slate-800 flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>{report.assignedDepartment?.name || 'Pending assignment'}</span>
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">Dispatched Field Worker</h4>
              <p className="text-sm font-medium text-slate-800 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{report.assignedWorker || 'Unassigned'}</span>
              </p>
            </div>
          </div>

          {report.resolutionNotes && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h4 className="text-xs font-bold uppercase text-emerald-800 mb-1 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Resolution Remarks</span>
              </h4>
              <p className="text-sm text-emerald-900">{report.resolutionNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
