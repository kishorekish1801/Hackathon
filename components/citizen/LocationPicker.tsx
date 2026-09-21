"use client";

import { useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value: Coordinates | null;
  onChange: (coords: Coordinates) => void;
}

// PLACEHOLDER UI ONLY — this does not call the real browser geolocation
// API against a backend yet. It simulates acquiring a location so the
// workflow can be demoed end-to-end before real integration.
export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [locating, setLocating] = useState(false);

  function handleUseCurrentLocation() {
    setLocating(true);
    window.setTimeout(() => {
      onChange({ latitude: 12.345678, longitude: 76.54321 });
      setLocating(false);
    }, 700);
  }

  return (
    <div className="rounded-xl border border-surface-line bg-surface-raised p-4">
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800 disabled:cursor-wait disabled:opacity-70"
      >
        <LocateFixed
          className={`h-4 w-4 ${locating ? "animate-pulse" : ""}`}
          strokeWidth={2.25}
        />
        {locating ? "Locating..." : "Use My Current Location"}
      </button>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-sunken px-3 py-2.5">
          <p className="text-[11px] font-medium text-ink-700/60">Latitude</p>
          <p className="mt-0.5 font-display text-sm font-semibold text-ink-900">
            {value ? value.latitude.toFixed(6) : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-surface-sunken px-3 py-2.5">
          <p className="text-[11px] font-medium text-ink-700/60">Longitude</p>
          <p className="mt-0.5 font-display text-sm font-semibold text-ink-900">
            {value ? value.longitude.toFixed(6) : "—"}
          </p>
        </div>
      </div>

      {value && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-status-low">
          <MapPin className="h-3.5 w-3.5" />
          Location captured
        </p>
      )}
    </div>
  );
}
