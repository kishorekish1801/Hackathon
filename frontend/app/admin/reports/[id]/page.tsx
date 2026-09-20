'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getAdminReportById,
  updateReportStatus,
  getReportImageUrl,
  isAdminAuthenticated,
  ReportItem,
} from '@/lib/admin-api';

export default function AdminReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id as string;

  const [report, setReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    if (reportId) {
      loadReport();
    }
  }, [reportId, router]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminReportById(reportId);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'IN_PROGRESS' | 'RESOLVED') => {
    setUpdating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await updateReportStatus(reportId, newStatus);
      setSuccessMsg(`Status successfully updated to ${newStatus.replace('_', ' ')}`);
      // Refresh state
      if (report) {
        setReport({ ...report, status: newStatus });
      }
    } catch (err: any) {
      setError(err.message || `Failed to update status to ${newStatus}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
        <p className="text-slate-400 animate-pulse">Loading report #{reportId}...</p>
      </div>
    );
  }

  if (!report && !loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-8 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">{error || 'Report not found'}</p>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm rounded-lg border border-slate-700"
        >
          &larr; Return to Dashboard
        </Link>
      </div>
    );
  }

  const isCritical = report?.priority === 'CRITICAL';
  const mapUrl = `https://www.google.com/maps?q=${report?.latitude},${report?.longitude}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Top Breadcrumb & Actions */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-sm text-slate-400 hover:text-white transition"
        >
          &larr; Back to Incident Queue
        </Link>

        <span className="text-xs text-slate-500 font-mono">Incident ID: {report?.id}</span>
      </div>

      <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Critical Banner */}
        {isCritical && (
          <div className="bg-red-600 text-white font-bold py-2 px-6 text-sm flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            CRITICAL INCIDENT &mdash; DISPATCH PRIORITY
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image / Visual Evidence */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Field Evidence
              </h2>
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-video md:aspect-square flex items-center justify-center">
                <img
                  src={report ? getReportImageUrl(report.id) : ''}
                  alt={`Report ${report?.id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-xs text-slate-600 select-none">AquaWatch Field Evidence Image</span>
              </div>

              {/* Geographic Coordinates & Direct Link */}
              <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-slate-400 text-xs block">Coordinates</span>
                    <span className="font-mono text-slate-200">
                      {report?.latitude.toFixed(6)}, {report?.longitude.toFixed(6)}
                    </span>
                  </div>
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-medium rounded-md transition"
                  >
                    Open in Maps &rarr;
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Technical Details & Municipal Workflow Actions */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {report?.category ? report.category.replace(/_/g, ' ') : 'Uncategorized'}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Reported on {report?.created_at ? new Date(report.created_at).toLocaleString() : '—'}
                  </p>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Priority</span>
                    <span
                      className={`text-xs font-bold ${
                        report?.priority === 'CRITICAL'
                          ? 'text-red-400'
                          : report?.priority === 'HIGH'
                          ? 'text-orange-400'
                          : report?.priority === 'MEDIUM'
                          ? 'text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {report?.priority}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Status</span>
                    <span
                      className={`text-xs font-semibold ${
                        report?.status === 'RESOLVED'
                          ? 'text-emerald-400'
                          : report?.status === 'IN_PROGRESS'
                          ? 'text-blue-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {report?.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Severity</span>
                    <span className="text-xs font-bold text-white">{report?.severity} / 5</span>
                  </div>
                </div>

                {/* Citizen Description */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-medium">
                    Citizen Description
                  </label>
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 leading-relaxed min-h-[100px]">
                    {report?.description ? report.description : <span className="text-slate-600 italic">No additional description provided.</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Admin Workflow */}
              <div className="pt-6 border-t border-slate-800">
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Municipal Action Controls
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={updating || report?.status === 'IN_PROGRESS'}
                    className="py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 disabled:text-slate-500 text-white font-medium text-sm rounded-lg transition disabled:cursor-not-allowed shadow-md"
                  >
                    {updating ? 'Updating...' : 'Mark In Progress'}
                  </button>

                  <button
                    onClick={() => handleStatusChange('RESOLVED')}
                    disabled={updating || report?.status === 'RESOLVED'}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950/40 disabled:text-slate-500 text-white font-medium text-sm rounded-lg transition disabled:cursor-not-allowed shadow-md"
                  >
                    {updating ? 'Updating...' : 'Mark Resolved'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}