"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Priority, WaterReport } from "@/types/report";
import MapReportPopup from "./MapReportPopup";

// ============================================================
// DEFAULT MAP POSITION
// ============================================================

const DEFAULT_CENTER: [number, number] = [10.7905, 78.7047];
const DEFAULT_ZOOM = 13;

// ============================================================
// PRIORITY COLORS
// ============================================================

const PRIORITY_HEX: Record<Priority, string> = {
  LOW: "#3F8F5D",
  MEDIUM: "#B8860F",
  HIGH: "#C46A2E",
  CRITICAL: "#BC3A34",
};

// ============================================================
// WATER ISSUE MARKER
// ============================================================

function priorityIcon(priority: Priority, active: boolean) {
  const color = PRIORITY_HEX[priority];

  const size = active ? 30 : 24;

  return L.divIcon({
    className: "",
    html: `
      <span
        style="
          display:block;
          width:${size}px;
          height:${size}px;
          border-radius:9999px;
          background:${color};
          border:2.5px solid #ffffff;
          box-shadow:
            0 1px 3px rgba(11,35,64,0.35),
            0 0 0 ${active ? 3 : 0}px ${color}55;
        "
      ></span>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// ============================================================
// USER LOCATION MARKER
// ============================================================

function userLocationIcon() {
  return L.divIcon({
    className: "",
    html: `
      <span
        style="
          display:block;
          width:16px;
          height:16px;
          border-radius:9999px;
          background:#0879B1;
          border:3px solid #ffffff;
          box-shadow:
            0 0 0 4px rgba(8,121,177,0.22),
            0 1px 3px rgba(11,35,64,0.4);
        "
      ></span>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

// ============================================================
// MAP FLY / RECENTER
// ============================================================

function MapFlyTo({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 0.6,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom]);

  return null;
}

// ============================================================
// PROPS
// ============================================================

interface WaterMapProps {
  /**
   * Water reports displayed on the map.
   */
  reports?: WaterReport[];

  /**
   * Report that should be highlighted.
   */
  highlightedId?: string;

  /**
   * Public citizen view.
   *
   * true:
   * - No report popup
   * - No My Location button
   * - Only issue markers are visible
   *
   * false:
   * - Report popup available
   * - My Location button available
   */
  publicView?: boolean;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function WaterMap({
  reports = [],
  highlightedId,
  publicView = false,
}: WaterMapProps) {
  // ----------------------------------------------------------
  // USER LOCATION
  // ----------------------------------------------------------

  const [userLocation, setUserLocation] =
    useState<[number, number] | null>(null);

  const [locationMessage, setLocationMessage] =
    useState<string | null>(null);

  const [locating, setLocating] = useState(false);

  // ----------------------------------------------------------
  // MARKER REFERENCES
  // ----------------------------------------------------------

  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // ----------------------------------------------------------
  // FIND HIGHLIGHTED REPORT
  // ----------------------------------------------------------

  const focusReport = useMemo(
    () =>
      reports.find(
        (report) => report.id === highlightedId
      ) ?? null,
    [reports, highlightedId]
  );

  // ----------------------------------------------------------
  // MAP CENTER
  // ----------------------------------------------------------

  const center: [number, number] = focusReport
    ? [
        focusReport.latitude,
        focusReport.longitude,
      ]
    : DEFAULT_CENTER;

  const zoom = focusReport
    ? 16
    : DEFAULT_ZOOM;

  // ----------------------------------------------------------
  // OPEN HIGHLIGHTED REPORT
  // ----------------------------------------------------------

  useEffect(() => {
    // Public citizen map should never open report details.
    if (publicView) {
      return;
    }

    if (!focusReport) {
      return;
    }

    const marker =
      markerRefs.current[focusReport.id];

    marker?.openPopup();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusReport?.id, publicView]);

  // ----------------------------------------------------------
  // LOCATE USER
  // ----------------------------------------------------------

  function handleLocateMe() {
    if (!("geolocation" in navigator)) {
      setLocationMessage(
        "Location isn't available on this device."
      );

      return;
    }

    setLocating(true);
    setLocationMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);

        setLocating(false);
      },

      () => {
        setLocationMessage(
          "Location access was not granted."
        );

        setLocating(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="relative h-full w-full">

      {/* ====================================================
          MAP
      ==================================================== */}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{
          minHeight: 500,
        }}
      >

        {/* ==================================================
            OPEN STREET MAP
        ================================================== */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ==================================================
            MAP RECENTER
        ================================================== */}

        <MapFlyTo
          center={
            userLocation ?? center
          }
          zoom={
            userLocation
              ? 15
              : zoom
          }
        />

        {/* ==================================================
            WATER ISSUE MARKERS
        ================================================== */}

        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[
              report.latitude,
              report.longitude,
            ]}
            icon={priorityIcon(
              report.priority,
              report.id === highlightedId
            )}
            ref={(ref) => {
              markerRefs.current[report.id] = ref;
            }}
          >

            {/* ----------------------------------------------
                PUBLIC CITIZEN VIEW
                No popup is shown.
               ---------------------------------------------- */}

            {!publicView && (
              <Popup
                minWidth={220}
                closeButton={false}
              >
                <MapReportPopup
                  report={report}
                />
              </Popup>
            )}

          </Marker>
        ))}

        {/* ==================================================
            USER LOCATION
            Only available outside public citizen view.
        ================================================== */}

        {!publicView && userLocation && (
          <Marker
            position={userLocation}
            icon={userLocationIcon()}
          >
            <Popup closeButton={false}>
              My Location
            </Popup>
          </Marker>
        )}

      </MapContainer>

      {/* ====================================================
          MY LOCATION BUTTON
          Hidden on citizen home page.
      ==================================================== */}

      {!publicView && (
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="
            absolute
            bottom-4
            right-4
            z-[400]
            rounded-lg
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-800
            shadow-lg
            transition
            hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-70
          "
          aria-label="Center map on my current location"
        >
          {locating
            ? "Locating..."
            : "My Location"}
        </button>
      )}

      {/* ====================================================
          LOCATION ERROR
          Hidden on citizen home page.
      ==================================================== */}

      {!publicView && locationMessage && (
        <div
          role="status"
          className="
            absolute
            bottom-4
            left-4
            right-32
            z-[400]
            rounded-lg
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-xs
            text-slate-600
            shadow-lg
            sm:right-auto
            sm:max-w-xs
          "
        >
          {locationMessage}
        </div>
      )}

    </div>
  );
}