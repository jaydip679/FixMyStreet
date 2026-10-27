import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { PlusCircle, MapPin, AlertCircle, ArrowLeft, Navigation } from 'lucide-react';

export default function CreateReport() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('POTHOLE');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        alert('Unable to retrieve your location');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        location: {
          address: address.trim(),
          ...(latitude ? { latitude: parseFloat(latitude) } : {}),
          ...(longitude ? { longitude: parseFloat(longitude) } : {})
        },
        ...(photoUrl.trim() ? { photoUrl: photoUrl.trim() } : {})
      };

      const res = await reportsApi.create(payload);
      const newReportId = res.data.data.report._id;
      navigate(`/reports/${newReportId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to submit report. Please review your input.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Reports</span>
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="pb-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report a Civic Problem</h1>
          <p className="mt-1 text-sm text-slate-600">
            Submit photographic evidence and location details so municipal crews can verify and resolve the issue.
          </p>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center space-x-2 border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="POTHOLE">Pothole / Road Damage</option>
              <option value="GARBAGE">Garbage Accumulation / Waste Dumping</option>
              <option value="STREETLIGHT">Streetlight Failure / Exposed Wiring</option>
              <option value="WATER_LEAKAGE">Water Leakage / Pipe Burst / Drainage</option>
              <option value="INFRASTRUCTURE_OTHER">Other Public Infrastructure Damage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brief Title *</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="e.g. Hazardous pothole opposite Government High School"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              required
              minLength={10}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Describe the physical condition, size, potential danger, or how long the defect has been present..."
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Location Address / Landmark *</label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="inline-flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-500 font-medium"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{locating ? 'Locating...' : 'Get GPS Coordinates'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              minLength={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="e.g. 5th Cross Road, Indira Nagar, near Post Office"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 23.215635"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 72.636941"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1">Photograph URL (Optional)</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="https://example.com/pothole.jpg"
            />
            <p className="mt-1 text-xs text-slate-500">
              Provide an image URL showing the defect for initial triage.
            </p>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 text-sm font-medium transition shadow-sm disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Submitting Report...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
