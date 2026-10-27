import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi, departmentsApi, analyticsApi } from '../services/api';
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  Building,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Modal / action state
  const [actionType, setActionType] = useState(''); // 'STATUS' or 'ASSIGN'
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, deptsRes, analyticsRes] = await Promise.all([
        reportsApi.list(statusFilter ? { status: statusFilter } : {}),
        departmentsApi.list(),
        analyticsApi.getSummary()
      ]);
      setReports(reportsRes.data.data.reports);
      setDepartments(deptsRes.data.data.departments);
      setSummary(analyticsRes.data.data.summary);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setActionType('STATUS');
    setNewStatus('');
    setRejectionReason('');
    setResolutionNotes('');
    setActionError('');
  };

  const openAssignModal = (report) => {
    setSelectedReport(report);
    setActionType('ASSIGN');
    setSelectedDeptId(report.assignedDepartment?._id || departments[0]?._id || '');
    setWorkerName(report.assignedWorker || '');
    setActionError('');
  };

  const closeModal = () => {
    setSelectedReport(null);
    setActionType('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setSubmitting(true);
    try {
      await reportsApi.updateStatus(selectedReport._id, {
        status: newStatus,
        ...(newStatus === 'REJECTED' ? { rejectionReason } : {}),
        ...(newStatus === 'RESOLVED' ? { resolutionNotes } : {})
      });
      closeModal();
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Status transition failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setSubmitting(true);
    try {
      await reportsApi.assignDepartment(selectedReport._id, {
        departmentId: selectedDeptId,
        assignedWorker: workerName
      });
      closeModal();
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Department assignment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Municipal Administration Console</h1>
          <p className="mt-1 text-sm text-slate-600">
            Triage submitted reports, verify authentic defects, assign departments, and track resolutions.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      {summary && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reports</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">{summary.totalReports}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Review</span>
            <div className="mt-2 text-2xl font-bold text-amber-600">{summary.pendingReviewReports}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">In Progress</span>
            <div className="mt-2 text-2xl font-bold text-purple-600">{summary.inProgressReports}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolution Rate</span>
            <div className="mt-2 text-2xl font-bold text-emerald-600">{summary.resolutionRate}%</div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <span className="text-xs text-slate-500">{reports.length} reports listed</span>
      </div>

      {/* Reports Table */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Report & Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Citizen</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Loading reports...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">No reports found matching criteria.</td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link to={`/reports/${report._id}`} className="font-bold text-slate-900 hover:text-emerald-600 line-clamp-1">
                        {report.title}
                      </Link>
                      <span className="text-xs text-slate-500 line-clamp-1">{report.location?.address}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {report.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{report.citizen?.name || 'Citizen'}</div>
                      <div className="text-slate-400">{report.citizen?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 font-medium">
                      {report.assignedDepartment?.name ? (
                        <span className="text-indigo-700">{report.assignedDepartment.name}</span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openStatusModal(report)}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition"
                      >
                        Change Status
                      </button>
                      <button
                        onClick={() => openAssignModal(report)}
                        className="px-2.5 py-1 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded transition"
                      >
                        Assign Dept
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Modal */}
      {actionType === 'STATUS' && selectedReport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Update Report Status</h3>
            <p className="text-xs text-slate-500 mt-1">
              Current Status: <span className="font-semibold text-slate-800">{selectedReport.status}</span>
            </p>

            {actionError && (
              <div className="mt-3 p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {actionError}
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Next Status *</label>
                <select
                  required
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="">-- Choose Next Status --</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Triage in progress)</option>
                  <option value="VERIFIED">VERIFIED (Valid public defect confirmed)</option>
                  <option value="REJECTED">REJECTED (Out of jurisdiction / invalid)</option>
                  <option value="ASSIGNED">ASSIGNED (Allocated to department)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Field repair underway)</option>
                  <option value="RESOLVED">RESOLVED (Remediation complete)</option>
                </select>
              </div>

              {newStatus === 'REJECTED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason *</label>
                  <textarea
                    required
                    minLength={5}
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Provide specific rationale for rejection..."
                  />
                </div>
              )}

              {newStatus === 'RESOLVED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution Remarks</label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Details of remedial repair completed..."
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newStatus}
                  className="px-4 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Confirm Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {actionType === 'ASSIGN' && selectedReport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Assign Municipal Department</h3>
            <p className="text-xs text-slate-500 mt-1">
              Report: <span className="font-semibold text-slate-800">{selectedReport.title}</span>
            </p>

            {actionError && (
              <div className="mt-3 p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department *</label>
                <select
                  required
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Worker / Crew (Optional)</label>
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="e.g. Field Crew Alpha / Technician Dave"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedDeptId}
                  className="px-4 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
