import type { Priority, ReportStatus } from "@/types/report";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/types/report";

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "bg-status-low-bg text-status-low",
  MEDIUM: "bg-status-medium-bg text-status-medium",
  HIGH: "bg-status-high-bg text-status-high",
  CRITICAL: "bg-status-critical-bg text-status-critical",
};

const STATUS_STYLES: Record<ReportStatus, string> = {
  OPEN: "bg-ink-900/[0.06] text-ink-900",
  IN_PROGRESS: "bg-teal-100 text-teal-700",
  RESOLVED: "bg-status-low-bg text-status-low",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StatusPill({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
