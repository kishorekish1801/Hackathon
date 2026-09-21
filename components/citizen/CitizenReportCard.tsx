import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { WaterReport } from "@/types/report";
import { CATEGORY_LABELS } from "@/types/report";
import { PriorityBadge, StatusPill } from "./StatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CitizenReportCard({ report }: { report: WaterReport }) {
  return (
    <div className="group rounded-xl border border-surface-line bg-surface-raised p-5 shadow-card transition-shadow hover:shadow-raised">
      <Link href={`/reports/${report.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-sm font-semibold text-ink-900">
              #{report.id}
            </p>
            <p className="mt-0.5 text-sm text-ink-700/70">
              {CATEGORY_LABELS[report.category]}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <PriorityBadge priority={report.priority} />
            <StatusPill status={report.status} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs text-ink-700/60">
          <span>{formatDate(report.created_at)}</span>
          {report.locationLabel && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {report.locationLabel}
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-center justify-between border-t border-surface-line pt-3">
        <Link
          href={`/map?report=${report.id}`}
          className="text-xs font-semibold text-ink-700/70 hover:text-ink-900"
        >
          View on Map
        </Link>
        <Link
          href={`/reports/${report.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-teal-700"
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
