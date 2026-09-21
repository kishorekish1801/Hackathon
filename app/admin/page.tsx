"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import WaterMap from "@/components/citizen/WaterMap";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED";

type Report = {
  id: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  severity: number;
  priority: Priority;
  status: Status;
  submittedAt: string;
};

const initialReports: Report[] = [
  {
    id: "AW-1001",
    category: "PIPE_LEAK",
    description: "Large water leakage near the main road.",
    latitude: 10.7905,
    longitude: 78.7047,
    location: "Main Road, Tiruchirappalli",
    severity: 4,
    priority: "HIGH",
    status: "OPEN",
    submittedAt: "Today, 09:42 AM",
  },
  {
    id: "AW-1002",
    category: "BROKEN_TAP",
    description: "Public drinking water tap is damaged.",
    latitude: 10.7982,
    longitude: 78.7104,
    location: "Anna Nagar, Tiruchirappalli",
    severity: 3,
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    submittedAt: "Today, 10:15 AM",
  },
  {
    id: "AW-1003",
    category: "DRAINAGE_PROBLEM",
    description: "Water is collecting near the drainage area.",
    latitude: 10.7845,
    longitude: 78.6961,
    location: "Central Market, Tiruchirappalli",
    severity: 2,
    priority: "LOW",
    status: "RESOLVED",
    submittedAt: "Yesterday, 04:20 PM",
  },
  {
    id: "AW-1004",
    category: "WATER_CONTAMINATION",
    description: "Citizen reported unusual water quality.",
    latitude: 10.8035,
    longitude: 78.6978,
    location: "Gandhi Nagar, Tiruchirappalli",
    severity: 5,
    priority: "CRITICAL",
    status: "OPEN",
    submittedAt: "Today, 11:05 AM",
  },
  {
    id: "AW-1005",
    category: "NO_WATER_SUPPLY",
    description: "No water supply reported in the area.",
    latitude: 10.7758,
    longitude: 78.7132,
    location: "Bus Stand Area, Tiruchirappalli",
    severity: 3,
    priority: "MEDIUM",
    status: "OPEN",
    submittedAt: "Today, 12:10 PM",
  },
];

function formatCategory(category: string) {
  return category
    .split("_")
    .map(
      (word) =>
        word.charAt(0) + word.slice(1).toLowerCase()
    )
    .join(" ");
}

function priorityClass(priority: Priority) {
  switch (priority) {
    case "CRITICAL":
      return "bg-[#fff0f0] text-[#a33a3a] border-[#efcaca]";

    case "HIGH":
      return "bg-[#fff5ed] text-[#a85b20] border-[#f0d3bb]";

    case "MEDIUM":
      return "bg-[#fffbed] text-[#94720d] border-[#eadca9]";

    case "LOW":
      return "bg-[#eff9f2] text-[#39734d] border-[#cce4d4]";
  }
}

function statusClass(status: Status) {
  switch (status) {
    case "OPEN":
      return "bg-[#fff5f5] text-[#a33a3a] border-[#efcaca]";

    case "IN_PROGRESS":
      return "bg-[#eef7fc] text-[#0870a5] border-[#c9e0ec]";

    case "RESOLVED":
      return "bg-[#eff9f2] text-[#39734d] border-[#cce4d4]";
  }
}

export default function AdminPage() {
  const router = useRouter();

  const [reports, setReports] =
    useState<Report[]>(initialReports);

  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  const [filter, setFilter] =
    useState<"ALL" | Status>("ALL");

  const [locationFilter, setLocationFilter] =
    useState("ALL");

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const statusMatch =
        filter === "ALL" ||
        report.status === filter;

      const locationMatch =
        locationFilter === "ALL" ||
        report.location === locationFilter;

      return statusMatch && locationMatch;
    });
  }, [reports, filter, locationFilter]);

  const locations = useMemo(() => {
    return Array.from(
      new Set(reports.map((report) => report.location))
    );
  }, [reports]);

  const totalReports = reports.length;

  const openReports = reports.filter(
    (report) => report.status === "OPEN"
  ).length;

  const inProgressReports = reports.filter(
    (report) => report.status === "IN_PROGRESS"
  ).length;

  const resolvedReports = reports.filter(
    (report) => report.status === "RESOLVED"
  ).length;

  const criticalReports = reports.filter(
    (report) => report.priority === "CRITICAL"
  ).length;

  function updateStatus(
    reportId: string,
    status: Status
  ) {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status,
            }
          : report
      )
    );

    setSelectedReport((current) =>
      current && current.id === reportId
        ? {
            ...current,
            status,
          }
        : current
    );
  }

  function handleLogout() {
    localStorage.removeItem("adminAuthenticated");
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#f5f9fc] text-[#092f50]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[#dce7ef] bg-white">

        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-6 lg:px-8">

          <div>

            <h1 className="text-[21px] font-bold tracking-[-0.03em]">
              AquaWatch AI
            </h1>

            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0879b1]">
              ADMINISTRATION PORTAL
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="
              rounded-md
              border
              border-[#cbdce7]
              bg-white
              px-5
              py-2.5
              text-[13px]
              font-semibold
              text-[#31566e]
              transition
              hover:bg-[#f5f9fc]
            "
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className="mx-auto max-w-[1280px] px-6 py-10 lg:px-8">

        {/* PAGE TITLE */}

        <div className="mb-8">

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0879b1]">
            ADMINISTRATION
          </p>

          <h2 className="mt-3 text-[34px] font-bold tracking-[-0.04em]">
            Water Management Overview
          </h2>

          <p className="mt-2 text-[14px] text-[#71879a]">
            Monitor citizen reports and manage water-related
            problems across the community.
          </p>

        </div>


        {/* =================================================
            STAT CARDS
           ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            label="Total Reports"
            value={totalReports}
          />

          <StatCard
            label="Open"
            value={openReports}
          />

          <StatCard
            label="In Progress"
            value={inProgressReports}
          />

          <StatCard
            label="Resolved"
            value={resolvedReports}
          />

          <StatCard
            label="Critical"
            value={criticalReports}
          />

        </div>


        {/* =================================================
            REPORT MANAGEMENT
           ================================================= */}

        <div className="mt-8 border border-[#d5e2eb] bg-white">

          {/* SECTION HEADER */}

          <div className="flex flex-col justify-between gap-4 border-b border-[#dce7ef] px-6 py-5 lg:flex-row lg:items-center">

            <div>

              <h3 className="text-[18px] font-bold">
                Citizen Reports
              </h3>

              <p className="mt-1 text-[13px] text-[#71879a]">
                Review and update reported water problems.
              </p>

            </div>


            {/* FILTERS */}

            <div className="flex flex-wrap items-center gap-2">

              {(
                [
                  ["ALL", "All"],
                  ["OPEN", "Open"],
                  ["IN_PROGRESS", "In Progress"],
                  ["RESOLVED", "Resolved"],
                ] as const
              ).map(([value, label]) => (

                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`
                    rounded-md
                    border
                    px-4
                    py-2
                    text-[12px]
                    font-semibold
                    transition
                    ${
                      filter === value
                        ? "border-[#0879b1] bg-[#eef7fc] text-[#075985]"
                        : "border-[#d5e2eb] bg-white text-[#607b8e] hover:bg-[#f7fafc]"
                    }
                  `}
                >
                  {label}
                </button>

              ))}

              {/* LOCATION FILTER */}

              <select
                value={locationFilter}
                onChange={(event) =>
                  setLocationFilter(event.target.value)
                }
                className="
                  rounded-md
                  border
                  border-[#d5e2eb]
                  bg-white
                  px-4
                  py-2
                  text-[12px]
                  font-semibold
                  text-[#31566e]
                  outline-none
                  focus:border-[#0879b1]
                "
              >

                <option value="ALL">
                  All Locations
                </option>

                {locations.map((location) => (
                  <option
                    key={location}
                    value={location}
                  >
                    {location}
                  </option>
                ))}

              </select>

            </div>

          </div>


          {/* REPORT LIST */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead>

                <tr className="border-b border-[#dce7ef] bg-[#f8fbfd] text-left">

                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#71879a]">
                    Report
                  </th>

                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#71879a]">
                    Category
                  </th>

                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#71879a]">
                    Location
                  </th>

                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#71879a]">
                    Severity
                  </th>

                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#71879a]">
                    Priority
                  </th>

                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#71879a]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#71879a]">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredReports.length > 0 ? (

                  filteredReports.map((report) => (

                    <tr
                      key={report.id}
                      className="border-b border-[#edf2f5] last:border-0 hover:bg-[#fbfdfe]"
                    >

                      {/* REPORT */}

                      <td className="px-6 py-5">

                        <p className="text-[13px] font-bold text-[#174b6d]">
                          {report.id}
                        </p>

                        <p className="mt-1 max-w-[240px] truncate text-[12px] text-[#7b8f9e]">
                          {report.description}
                        </p>

                        <p className="mt-1 text-[11px] text-[#9aaab6]">
                          {report.submittedAt}
                        </p>

                      </td>


                      {/* CATEGORY */}

                      <td className="px-6 py-5">

                        <span className="text-[13px] font-semibold text-[#31566e]">
                          {formatCategory(report.category)}
                        </span>

                      </td>


                      {/* LOCATION */}

                      <td className="px-6 py-5">

                        <span className="text-[13px] font-bold text-[#31566e]">
                          {report.location}
                        </span>

                      </td>


                      {/* SEVERITY */}

                      <td className="px-6 py-5">

                        <span className="text-[13px] font-bold text-[#31566e]">
                          {report.severity}/5
                        </span>

                      </td>


                      {/* PRIORITY */}

                      <td className="px-6 py-5">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            border
                            px-3
                            py-1
                            text-[11px]
                            font-bold
                            ${priorityClass(report.priority)}
                          `}
                        >
                          {report.priority}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <select
                          value={report.status}
                          onChange={(event) =>
                            updateStatus(
                              report.id,
                              event.target.value as Status
                            )
                          }
                          className={`
                            rounded-md
                            border
                            px-3
                            py-2
                            text-[12px]
                            font-bold
                            outline-none
                            ${statusClass(report.status)}
                          `}
                        >

                          <option value="OPEN">
                            OPEN
                          </option>

                          <option value="IN_PROGRESS">
                            IN PROGRESS
                          </option>

                          <option value="RESOLVED">
                            RESOLVED
                          </option>

                        </select>

                      </td>


                      {/* ACTION */}

                      <td className="px-6 py-5">

                        <button
                          onClick={() =>
                            setSelectedReport(report)
                          }
                          className="
                            rounded-md
                            border
                            border-[#cbdde7]
                            px-4
                            py-2
                            text-[12px]
                            font-semibold
                            text-[#31566e]
                            transition
                            hover:border-[#0879b1]
                            hover:bg-[#f4fafd]
                          "
                        >
                          View Details
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center"
                    >

                      <p className="text-[14px] font-semibold text-[#31566e]">
                        No reports found
                      </p>

                      <p className="mt-1 text-[12px] text-[#8194a3]">
                        No reports match the selected filters.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            MAP
           ================================================= */}

        <div className="mt-8 border border-[#d5e2eb] bg-white">

          <div className="border-b border-[#dce7ef] px-6 py-5">

            <h3 className="text-[18px] font-bold">
              Report Locations
            </h3>

            <p className="mt-1 text-[13px] text-[#71879a]">
              View the locations submitted by citizens.
            </p>

          </div>

          <div className="h-[520px] w-full overflow-hidden">

            <WaterMap
              reports={reports}
              publicView={false}
              highlightedId={selectedReport?.id}
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          REPORT DETAILS MODAL
      ===================================================== */}

      {selectedReport && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092f50]/40 px-5">

          <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[#dce7ef] px-6 py-5">

              <div>

                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0879b1]">
                  REPORT DETAILS
                </p>

                <h3 className="mt-1 text-[21px] font-bold">
                  {selectedReport.id}
                </h3>

              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                aria-label="Close report details"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-[25px]
                  font-bold
                  leading-none
                  text-[#71879a]
                  transition
                  hover:bg-[#f1f6f9]
                  hover:text-[#092f50]
                "
              >
                ×
              </button>

            </div>


            {/* DETAILS */}

            <div className="space-y-5 p-6">

              <DetailRow
                label="Category"
                value={formatCategory(
                  selectedReport.category
                )}
              />

              <DetailRow
                label="Description"
                value={selectedReport.description}
              />

              <DetailRow
                label="Location"
                value={selectedReport.location}
              />

              <DetailRow
                label="Severity"
                value={`${selectedReport.severity}/5`}
              />

              <DetailRow
                label="Priority"
                value={selectedReport.priority}
              />

              <DetailRow
                label="Status"
                value={selectedReport.status}
              />

              <DetailRow
                label="Submitted"
                value={selectedReport.submittedAt}
              />


              {/* STATUS */}

              <div className="border-t border-[#e4edf2] pt-5">

                <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.12em] text-[#71879a]">
                  Update Status
                </label>

                <select
                  value={selectedReport.status}
                  onChange={(event) =>
                    updateStatus(
                      selectedReport.id,
                      event.target.value as Status
                    )
                  }
                  className="
                    h-[46px]
                    w-full
                    rounded-md
                    border
                    border-[#cbdce7]
                    bg-white
                    px-4
                    text-[13px]
                    font-semibold
                    text-[#31566e]
                    outline-none
                    focus:border-[#0879b1]
                  "
                >

                  <option value="OPEN">
                    Open
                  </option>

                  <option value="IN_PROGRESS">
                    In Progress
                  </option>

                  <option value="RESOLVED">
                    Resolved
                  </option>

                </select>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}


/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="border border-[#d5e2eb] bg-white px-5 py-5">

      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#71879a]">
        {label}
      </p>

      <p className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#092f50]">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   DETAIL ROW
   ========================================================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8194a3]">
        {label}
      </p>

      <p className="mt-1 text-[14px] font-semibold text-[#31566e]">
        {value}
      </p>

    </div>
  );
}