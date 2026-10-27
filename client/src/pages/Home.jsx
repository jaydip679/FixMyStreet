import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, MapPin, Camera, CheckCircle2, ArrowRight, Construction, Trash2, Lightbulb, Droplets } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 sm:pt-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-6">
          <Shield className="w-3.5 h-3.5" />
          <span>Civic Infrastructure Maintenance Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Report civic problems.<br className="hidden sm:inline" /> Track resolution in your community.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          FixMyStreet connects citizens directly with municipal authorities to report potholes, broken streetlights,
          overflowing garbage, and water leakages with photographic evidence and precise locations.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 transition shadow-sm text-sm"
            >
              <span>Go to {isAdmin ? 'Admin Console' : 'My Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 transition shadow-sm text-sm"
              >
                <span>Get Started as Citizen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition text-sm shadow-2xs"
              >
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Columns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Photograph & Describe</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Capture visual proof of the defect to provide objective evidence for municipal inspection teams.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Pin Exact Location</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Provide physical street addresses and GPS coordinates so repair crews navigate directly to the site.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Department Triage</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Administrators verify validity and assign issues directly to PWD, Sanitation, or Electrical units.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Track Status</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Receive in-app notifications as the report progresses from verification to active field repair and closure.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl font-bold text-slate-900">Supported Civic Defect Categories</h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
            <Construction className="w-6 h-6 text-amber-500 mb-2" />
            <span className="text-xs font-semibold text-slate-800">Roads & Potholes</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
            <Trash2 className="w-6 h-6 text-emerald-500 mb-2" />
            <span className="text-xs font-semibold text-slate-800">Garbage Accumulation</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
            <Lightbulb className="w-6 h-6 text-yellow-500 mb-2" />
            <span className="text-xs font-semibold text-slate-800">Streetlight Failure</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
            <Droplets className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-xs font-semibold text-slate-800">Water Leakage</span>
          </div>
        </div>
      </section>
    </div>
  );
}
