'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getAdminStats,
  getAdminReports,
  getReportImageUrl,
  isAdminAuthenticated,
  clearAdminAuth,
  ReportItem,
  AdminStats,
} from '@/lib/admin-api';

const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const CATEGORIES = [
  'PIPE_LEAK',
  'BROKEN_TAP',
  'TANK_OVERFLOW',
  'DAMAGED_PIPELINE',
  'WATER_CONTAMINATION',
  'DRAINAGE_PROBLEM',
  'NO_WATER_SUPPLY',
  'PUBLIC_WATER_WASTAGE',
  'OTHER',
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, reportsData] = await Promise.all([
        getAdminStats().catch(() => null),
        getAdminReports().catch(() => []),
      ]);

      setReports(reportsData);

      if (statsData) {
        setStats(statsData);
      } else {
        // Fallback calculation from reports list if stats endpoint is not yet connected
        setStats({
          total: reportsData.length,
          open: reportsData.filter((r) => r.status === 'OPEN').length,
          in_progress: reportsData.filter((r) => r.status === 'IN_PROGRESS').length,
          resolved: reportsData.filter((r) => r.status === 'RESOLVED').length,
          critical: reportsData.filter((r) => r.priority === 'CRITICAL').length,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminAuth();
    router.push('/admin/login');
  };

  // Filter and sort reports: CRITICAL first, then HIGH, MEDIUM, LOW
  const filteredAndSortedReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;
        if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
        if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const pDiff = (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
        if (pDiff !== 0) return pDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [reports, priorityFilter, categoryFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AquaWatch AI &mdash; Municipal Command</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Smart Water Infrastructure Incident Response Console</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg border border-slate-700 transition"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-sm font-medium rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* KPI Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4 my-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Reports</p>
          <p className="text-3xl font-bold text-white mt-2">{stats ? stats.total : '—'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Open</p>
          <p className="text-3xl font-bold text-amber-400 mt-2">{stats ? stats.open : '—'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-blue-400 font-semibold">In Progress</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{stats ? stats.in_progress : '—'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Resolved</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{stats ? stats.resolved : '—'}</p>
        </div>
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-red-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Critical Incidents
          </p>
          <p className="text-3xl font-bold text-red-400 mt-2">{stats ? stats.critical : '—'}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-medium">
              Filter by Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-medium">
              Filter by Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-medium">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </section>

      {/* Reports List */}
      <main>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold tracking-tight">Active Incident Queue</h2>
          <span className="text-sm text-slate-400">
            Showing {filteredAndSortedReports.length} report{filteredAndSortedReports.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
            Fetching incident feed from AquaWatch backend...
          </div>
        ) : filteredAndSortedReports.length === 0 ? (
          <div className="p-16 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
            No incident reports matching criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedReports.map((report) => {
              const isCritical = report.priority === 'CRITICAL';
              const mapUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;

              return (
                <div
                  key={report.id}
                  className={`relative flex flex-col rounded-xl border overflow-hidden transition shadow-lg ${
                    isCritical
                      ? 'bg-red-950/20 border-red-500/60 ring-2 ring-red-500/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isCritical && (
                    <div className="bg-red-600 text-white text-[11px] font-black uppercase tracking-wider py-1 text-center flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      CRITICAL PRIORITY &mdash; IMMEDIATE ACTION REQUIRED
                    </div>
                  )}

                  {/* Image Container */}
                  <div className="relative h-48 w-full bg-slate-950 flex items-center justify-center border-b border-slate-800 overflow-hidden">
                    <img
                      src={getReportImageUrl(report.id)}
                      alt={`Report ${report.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if backend or specific image is not reachable
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-slate-600 select-none">AquaWatch Evidence Camera</span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Priority and Status Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            report.priority === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : report.priority === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : report.priority === 'MEDIUM'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {report.priority}
                        </span>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase ${
                            report.status === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : report.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {report.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-white mb-2">
                        {report.category ? report.category.replace(/_/g, ' ') : 'Uncategorized'}
                      </h3>

                      <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                        <div className="flex justify-between">
                          <span>Severity Rating:</span>
                          <span className="font-semibold text-slate-200">{report.severity} / 5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reported:</span>
                          <span className="text-slate-300">
                            {new Date(report.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coordinates:</span>
                          <span className="text-slate-300 font-mono">
                            {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                      >
                        View Location &rarr;
                      </a>

                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition"
                      >
                        Details &amp; Action
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}