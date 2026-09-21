"use client";

import Link from "next/link";

import CitizenNavbar from "@/components/citizen/CitizenNavbar";
import WaterMap from "@/components/citizen/WaterMap";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f9fc] text-[#092f50]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <CitizenNavbar />

      {/* =====================================================
          HERO / WELCOME
      ===================================================== */}

      <section className="border-b border-[#dce7ef] bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-16 lg:px-8 lg:py-20">

          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">

            {/* LEFT */}

            <div className="max-w-[720px]">

              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0879b1]">
                CITIZEN PORTAL
              </p>

              <h1 className="mt-4 text-[44px] font-bold leading-[1.08] tracking-[-0.045em] text-[#082f50] sm:text-[52px]">
                Report water problems.
                <br />
                Protect every drop.
              </h1>

              <p className="mt-5 max-w-[650px] text-[16px] leading-7 text-[#607b92]">
                Help your community by reporting leaks, damaged pipelines,
                broken taps, water contamination and other water-related
                problems.
              </p>

              {/* ACTIONS */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/report"
                  className="
                    inline-flex
                    h-[50px]
                    items-center
                    justify-center
                    rounded-md
                    bg-[#075985]
                    px-8
                    text-[14px]
                    font-bold
                    text-white
                    shadow-[0_8px_22px_rgba(7,89,133,0.18)]
                    transition
                    hover:bg-[#064d73]
                  "
                >
                  Report Water Problem
                </Link>

                <Link
                  href="/my-reports"
                  className="
                    inline-flex
                    h-[50px]
                    items-center
                    justify-center
                    rounded-md
                    border
                    border-[#cbdde9]
                    bg-white
                    px-8
                    text-[14px]
                    font-semibold
                    text-[#174b6d]
                    transition
                    hover:border-[#9dbaca]
                    hover:bg-[#f7fafc]
                  "
                >
                  My Reports
                </Link>

              </div>

            </div>

            {/* RIGHT */}

            <div className="max-w-[280px] border-l border-[#d7e4ed] pl-6">

              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#0879b1]">
                AQUAWATCH AI
              </p>

              <p className="mt-3 text-[15px] leading-6 text-[#607b92]">
                A civic platform for reporting and monitoring
                water-related issues in your community.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          COMMUNITY MAP
      ===================================================== */}

      <section className="mx-auto max-w-[1180px] px-6 py-10 lg:px-8 lg:py-12">

        <div className="overflow-hidden border border-[#d5e2eb] bg-white">

          {/* MAP HEADER */}

          <div className="border-b border-[#dce7ef] px-6 py-6 sm:px-7">

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0879b1]">
              COMMUNITY MAP
            </p>

            <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

              <div>

                <h2 className="text-[25px] font-bold tracking-[-0.03em] text-[#092f50]">
                  Water Issues Near You
                </h2>

                <p className="mt-1 text-[14px] text-[#71879a]">
                  Explore reported water issue locations across the community.
                </p>

              </div>

              <Link
                href="/map"
                className="
                  text-[13px]
                  font-bold
                  text-[#0879b1]
                  transition
                  hover:text-[#075985]
                "
              >
                Open Full Map
              </Link>

            </div>

          </div>


          {/* =================================================
              MAP

              publicView = true means:

              • Citizen cannot open report details
              • No priority information shown
              • No status information shown
              • No reporter information shown
              • Only map locations are visible
             ================================================= */}

          <div className="h-[520px] w-full overflow-hidden">

            <WaterMap
              reports={[
                {
                  id: "demo-1",
                  latitude: 10.7905,
                  longitude: 78.7047,
                  severity_rating: 3,
                  priority: "MEDIUM",
                  status: "OPEN",
                  category: "PIPE_LEAK",
                  description: "",
                },

                {
                  id: "demo-2",
                  latitude: 10.7982,
                  longitude: 78.7104,
                  severity_rating: 4,
                  priority: "HIGH",
                  status: "OPEN",
                  category: "BROKEN_TAP",
                  description: "",
                },

                {
                  id: "demo-3",
                  latitude: 10.7845,
                  longitude: 78.6961,
                  severity_rating: 2,
                  priority: "LOW",
                  status: "RESOLVED",
                  category: "DRAINAGE_PROBLEM",
                  description: "",
                },

                {
                  id: "demo-4",
                  latitude: 10.8035,
                  longitude: 78.6978,
                  severity_rating: 5,
                  priority: "CRITICAL",
                  status: "OPEN",
                  category: "WATER_CONTAMINATION",
                  description: "",
                },

                {
                  id: "demo-5",
                  latitude: 10.7758,
                  longitude: 78.7132,
                  severity_rating: 3,
                  priority: "MEDIUM",
                  status: "OPEN",
                  category: "NO_WATER_SUPPLY",
                  description: "",
                },

                {
                  id: "demo-6",
                  latitude: 10.8061,
                  longitude: 78.6869,
                  severity_rating: 2,
                  priority: "LOW",
                  status: "OPEN",
                  category: "PUBLIC_WATER_WASTAGE",
                  description: "",
                },
              ]}
              publicView
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          REPORT CTA
      ===================================================== */}

      <section className="mx-auto max-w-[1180px] px-6 pb-16 lg:px-8">

        <div className="border border-[#cfe0eb] bg-[#edf6fb] px-7 py-9 sm:px-10">

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0879b1]">
            SEE SOMETHING?
          </p>

          <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-[25px] font-bold tracking-[-0.025em] text-[#092f50]">
                Report a water problem in your area.
              </h2>

              <p className="mt-2 max-w-[650px] text-[14px] leading-6 text-[#637d92]">
                Upload a photo, share your current location and tell us how
                serious the problem is.
              </p>

            </div>

            <Link
              href="/report"
              className="
                inline-flex
                h-[48px]
                shrink-0
                items-center
                justify-center
                rounded-md
                bg-[#075985]
                px-7
                text-[14px]
                font-bold
                text-white
                transition
                hover:bg-[#064d73]
              "
            >
              Report Problem
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}