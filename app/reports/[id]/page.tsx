import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MapPin, Droplet } from "lucide-react";
import CitizenNavbar from "@/components/citizen/CitizenNavbar";
import { PriorityBadge, StatusPill } from "@/components/citizen/StatusBadge";
import { getMockReportById } from "@/lib/mock-data";
import { CATEGORY_LABELS } from "@/types/report";
import type { ReportStatus } from "@/types/report";

const TIMELINE_STEPS = ["Submitted", "Under Review", "In Progress", "Resolved"] as const;

function currentStepIndex(status: ReportStatus): number {
  switch (status) {
    case "OPEN":
      return 1; // submitted, now under review
    case "IN_PROGRESS":
      return 2;
    case "RESOLVED":
      return 3;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ReportDetailsPage({ params }: { params: { id: string } }) {
  // TEMPORARY: reads from local mock data until getReport(id) is wired up.
  const report = getMockReportById(params.id);
  if (!report) notFound();

  const activeStep = currentStepIndex(report.status);

  return (
    <>
      <CitizenNavbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/my-reports"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-700/70 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Reports
        </Link>

        <div className="overflow-hidden rounded-2xl border border-surface-line bg-surface-raised shadow-card">
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-ink-950/95 text-white/30">
            {report.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={report.imageUrl}
                alt={`Photo submitted for report ${report.id}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Droplet className="h-8 w-8" strokeWidth={1.5} />
                <span className="text-xs">No photo available for this mock report</span>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold text-ink-900">
                  #{report.id}
                </p>
                <p className="mt-0.5 text-sm text-ink-700/70">
                  {CATEGORY_LABELS[report.category]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={report.priority} />
                <StatusPill status={report.status} />
              </div>
            </div>

            {/* TIMELINE */}
            <div className="mt-8">
              <ol className="flex items-center">
                {TIMELINE_STEPS.map((step, i) => {
                  const done = i <= activeStep;
                  const isCurrent = i === activeStep;
                  return (
                    <li key={step} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                            done
                              ? "border-teal-500 bg-teal-500 text-white"
                              : "border-surface-line bg-white text-ink-700/40"
                          }`}
                        >
                          {done && !isCurrent ? <Check className="h-4 w-4" /> : i + 1}
                        </span>
                        <span
                          className={`w-20 text-center text-[11px] font-medium leading-tight sm:w-24 ${
                            isCurrent ? "text-ink-900" : "text-ink-700/50"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div
                          className={`mx-1.5 h-0.5 flex-1 sm:mx-2 ${
                            i < activeStep ? "bg-teal-500" : "bg-surface-line"
                          }`}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-surface-line pt-6 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-ink-700/55">Severity</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-900">
                  {report.severity_rating} / 5
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-ink-700/55">Date Submitted</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-900">
                  {formatDate(report.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-ink-700/55">Location</dt>
                <dd className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-ink-900">
                  <MapPin className="h-3.5 w-3.5 text-ink-700/50" />
                  {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                </dd>
              </div>
            </dl>

            {report.description && (
              <div className="mt-6 border-t border-surface-line pt-6">
                <h2 className="text-xs font-medium text-ink-700/55">Description</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-800">
                  {report.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
