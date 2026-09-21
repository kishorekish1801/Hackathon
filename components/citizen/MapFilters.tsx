"use client";

import type { Priority } from "@/types/report";

export type MapFilterValue = "ALL" | Priority;

const FILTERS: { value: MapFilterValue; label: string; dot?: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CRITICAL", label: "Critical", dot: "bg-status-critical" },
  { value: "HIGH", label: "High", dot: "bg-status-high" },
  { value: "MEDIUM", label: "Medium", dot: "bg-status-medium" },
  { value: "LOW", label: "Low", dot: "bg-status-low" },
];

interface MapFiltersProps {
  value: MapFilterValue;
  onChange: (value: MapFilterValue) => void;
}

export default function MapFilters({ value, onChange }: MapFiltersProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter reports by priority"
      className="flex flex-wrap gap-2"
    >
      {FILTERS.map((filter) => {
        const active = value === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(filter.value)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-surface-line bg-white text-ink-700/80 hover:border-ink-900/30"
            }`}
          >
            {filter.dot && (
              <span
                className={`h-2 w-2 rounded-full ${filter.dot} ${active ? "ring-2 ring-white/40" : ""}`}
                aria-hidden="true"
              />
            )}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
