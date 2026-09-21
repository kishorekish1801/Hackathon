import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { WaterReport } from "@/types/report";
import { CATEGORY_LABELS } from "@/types/report";
import { PriorityBadge, StatusPill } from "./StatusBadge";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SubmissionSuccess({ report }: { report: WaterReport }) {
  return (
    <div className="mx-auto max-w-md animate-rise rounded-2xl border border-surface-line bg-surface-raised p-8 text-center shadow-raised">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-low-bg">
        <CheckCircle2 className="h-7 w-7 text-status-low" strokeWidth={2} />
      </span>
      <h1 className="mt-5 font-display text-xl font-semibold text-ink-900">
        Report Submitted
      </h1>
      <p className="mt-1.5 text-sm text-ink-700/70">
        Your water problem has been successfully reported.
      </p>

      <dl className="mt-6 space-y-3 rounded-xl bg-surface-sunken p-5 text-left">
        <div className="flex items-center justify-between">
          <dt className="text-xs font-medium text-ink-700/60">Report ID</dt>
          <dd className="font-display text-sm font-semibold text-ink-900">
            #{report.id}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-xs font-medium text-ink-700/60">Category</dt>
          <dd className="text-sm font-medium text-ink-900">
            {CATEGORY_LABELS[report.category]}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-xs font-medium text-ink-700/60">Priority</dt>
          <dd>
            <PriorityBadge priority={report.priority} />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-xs font-medium text-ink-700/60">Status</dt>
          <dd>
            <StatusPill status={report.status} />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-xs font-medium text-ink-700/60">Submitted</dt>
          <dd className="text-sm font-medium text-ink-900">
            {formatDateTime(report.created_at)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href={`/reports/${report.id}`}
          className="flex-1 rounded-lg bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
        >
          View Report
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-lg border border-surface-line bg-white px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-surface-sunken"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
