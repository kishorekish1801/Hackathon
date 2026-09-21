"use client";

import { useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { FolderClock, Loader2, AlertOctagon, Layers } from "lucide-react";
import CitizenNavbar from "@/components/citizen/CitizenNavbar";
import MapFilters, { type MapFilterValue } from "@/components/citizen/MapFilters";
import MapErrorBoundary from "@/components/citizen/MapErrorBoundary";
import { MOCK_REPORTS } from "@/lib/mock-data";

// Leaflet touches window/document, so the map itself must never render on
// the server. next/dynamic with ssr:false keeps it entirely client-side.
const WaterMap = dynamic(() => import("@/components/citizen/WaterMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center gap-3 rounded-xl2 bg-surface-sunken">
      <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      <p className="text-sm font-medium text-ink-700/70">Loading Water Map...</p>
    </div>
  ),
});

export default function MapPage() {
  return (
    <Suspense fallback={<MapPageFallback />}>
      <MapPageContent />
    </Suspense>
  );
}

function MapPageFallback() {
  return (
    <>
      <CitizenNavbar />
      <main className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Water Issues Map
          </h1>
          <p className="mt-1.5 text-sm text-ink-700/70">
            Monitor reported water problems around you.
          </p>
        </div>
        <div className="flex h-[500px] w-full items-center justify-center rounded-xl2 bg-surface-sunken sm:h-[560px] lg:h-[620px]">
          <p className="text-sm font-medium text-ink-700/60">Loading Water Map...</p>
        </div>
      </main>
    </>
  );
}

function MapPageContent() {
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get("report") ?? undefined;
  const [filter, setFilter] = useState<MapFilterValue>("ALL");

  const filteredReports = useMemo(() => {
    if (filter === "ALL") return MOCK_REPORTS;
    return MOCK_REPORTS.filter((r) => r.priority === filter);
  }, [filter]);

  const summary = useMemo(() => {
    const source = filteredReports;
    return {
      total: source.length,
      highPriority: source.filter((r) => r.priority === "HIGH" || r.priority === "CRITICAL").length,
      inProgress: source.filter((r) => r.status === "IN_PROGRESS").length,
      open: source.filter((r) => r.status === "OPEN").length,
    };
  }, [filteredReports]);

  return (
    <>
      <CitizenNavbar />
      <main className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Water Issues Map
          </h1>
          <p className="mt-1.5 text-sm text-ink-700/70">
            Monitor reported water problems around you.
          </p>
        </div>

        <div className="mb-4">
          <MapFilters value={filter} onChange={setFilter} />
        </div>

        <div className="h-[500px] w-full overflow-hidden rounded-xl2 border border-surface-line shadow-card sm:h-[560px] lg:h-[620px]">
          <MapErrorBoundary>
            <WaterMap reports={filteredReports} highlightedId={highlightedId} />
          </MapErrorBoundary>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat icon={Layers} label="Total Reports" value={summary.total} />
          <SummaryStat icon={AlertOctagon} label="High Priority" value={summary.highPriority} />
          <SummaryStat icon={Loader2} label="In Progress" value={summary.inProgress} />
          <SummaryStat icon={FolderClock} label="Open" value={summary.open} />
        </div>
      </main>
    </>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-surface-line bg-surface-raised p-4 shadow-card">
      <Icon className="h-4 w-4 text-teal-600" strokeWidth={2.25} />
      <p className="mt-2.5 font-display text-xl font-semibold text-ink-900 sm:text-2xl">
        {value}
      </p>
      <p className="text-xs font-medium text-ink-700/60">{label}</p>
    </div>
  );
}
