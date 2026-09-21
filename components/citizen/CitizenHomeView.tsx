import Link from "next/link";
import { Plus, FolderClock, Loader2, CheckCircle2 } from "lucide-react";
import CitizenNavbar from "./CitizenNavbar";
import CitizenReportCard from "./CitizenReportCard";
import { MOCK_REPORTS, MOCK_SUMMARY } from "@/lib/mock-data";

// Static placeholder values — the UI is structured so real numbers from
// `getMyReports()` can replace these without changing the layout.
const SUMMARY_CARDS = [
  { label: "Open", value: MOCK_SUMMARY.open, icon: FolderClock },
  { label: "In Progress", value: MOCK_SUMMARY.inProgress, icon: Loader2 },
  { label: "Resolved", value: MOCK_SUMMARY.resolved, icon: CheckCircle2 },
] as const;

export default function CitizenHomeView() {
  const recentReports = MOCK_REPORTS.slice(0, 3);

  return (
    <>
      <CitizenNavbar />
      <main className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-ink-700/60">Good morning,</p>
            <h1 className="font-display text-2xl font-semibold text-ink-900">
              Citizen
            </h1>
          </div>
          <Link
            href="/report"
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-raised transition-colors hover:bg-teal-600"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Report Water Problem
          </Link>
        </div>
        <Link
          href="/map"
          className="mt-3 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          Explore Water Map →
        </Link>

        <section
          aria-label="My reports summary"
          className="mt-8 grid grid-cols-3 gap-3 sm:gap-5"
        >
          {SUMMARY_CARDS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-surface-line bg-surface-raised p-4 shadow-card sm:p-5"
            >
              <Icon className="h-4 w-4 text-teal-600" strokeWidth={2.25} />
              <p className="mt-3 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
                {value}
              </p>
              <p className="text-xs font-medium text-ink-700/60 sm:text-sm">
                {label}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Recent Reports
            </h2>
            <Link
              href="/my-reports"
              className="text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentReports.map((report) => (
              <CitizenReportCard key={report.id} report={report} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
