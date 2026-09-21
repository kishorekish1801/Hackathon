import CitizenNavbar from "@/components/citizen/CitizenNavbar";
import CitizenReportCard from "@/components/citizen/CitizenReportCard";
import { MOCK_REPORTS } from "@/lib/mock-data";
import { Droplet } from "lucide-react";

export default function MyReportsPage() {
  // TEMPORARY: MOCK_REPORTS stands in for getMyReports() until the
  // backend is connected.
  const reports = MOCK_REPORTS;

  return (
    <>
      <CitizenNavbar />
      <main className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          My Reports
        </h1>
        <p className="mt-1.5 text-sm text-ink-700/70">
          Track the water problems you&apos;ve reported.
        </p>

        {reports.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-xl2 border border-dashed border-surface-line bg-surface-raised py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken">
              <Droplet className="h-5 w-5 text-teal-600" />
            </span>
            <p className="mt-4 text-sm font-medium text-ink-900">
              No reports yet
            </p>
            <p className="mt-1 text-sm text-ink-700/60">
              Reports you submit will show up here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <CitizenReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
