import Link from "next/link";
import type { WaterReport } from "@/types/report";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/types/report";

const PRIORITY_EMOJI: Record<WaterReport["priority"], string> = {
  LOW: "🟢",
  MEDIUM: "🟡",
  HIGH: "🟠",
  CRITICAL: "🔴",
};

const STATUS_TEXT: Record<WaterReport["status"], string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MapReportPopup({ report }: { report: WaterReport }) {
  return (
    <div className="min-w-[190px] font-body">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-700/70">
        <span aria-hidden="true">{PRIORITY_EMOJI[report.priority]}</span>
        {PRIORITY_LABELS[report.priority]} Priority
      </p>
      <p className="mt-1.5 font-display text-sm font-semibold text-ink-900">
        {CATEGORY_LABELS[report.category]}
      </p>

      <dl className="mt-2.5 space-y-1 text-xs text-ink-700/80">
        <div className="flex justify-between">
          <dt>Severity</dt>
          <dd className="font-medium text-ink-900">{report.severity_rating} / 5</dd>
        </div>
        <div className="flex justify-between">
          <dt>Status</dt>
          <dd className="font-medium text-ink-900">{STATUS_TEXT[report.status]}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Report</dt>
          <dd className="font-medium text-ink-900">#{report.id}</dd>
        </div>
      </dl>

      <p className="mt-2 text-[11px] text-ink-700/50">{formatDate(report.created_at)}</p>

      <Link
        href={`/reports/${report.id}`}
        className="mt-3 block rounded-md bg-ink-900 px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-ink-800"
      >
        View Report
      </Link>
    </div>
  );
}
