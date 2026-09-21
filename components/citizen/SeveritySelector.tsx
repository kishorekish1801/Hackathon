"use client";

const LEVELS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: "Minor" },
  { value: 2, label: "Small" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Serious" },
  { value: 5, label: "Critical" },
];

// Same status hues used elsewhere, mapped across five steps so the
// selector reads as a visual severity ramp, not just a set of buttons.
const LEVEL_STYLES: Record<number, { active: string; ring: string }> = {
  1: { active: "bg-status-low text-white", ring: "ring-status-low" },
  2: { active: "bg-status-low text-white", ring: "ring-status-low" },
  3: { active: "bg-status-medium text-white", ring: "ring-status-medium" },
  4: { active: "bg-status-high text-white", ring: "ring-status-high" },
  5: { active: "bg-status-critical text-white", ring: "ring-status-critical" },
};

interface SeveritySelectorProps {
  value: 1 | 2 | 3 | 4 | 5 | null;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
}

export default function SeveritySelector({
  value,
  onChange,
}: SeveritySelectorProps) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Problem severity"
        className="grid grid-cols-5 gap-2 sm:gap-3"
      >
        {LEVELS.map((level) => {
          const selected = value === level.value;
          const styles = LEVEL_STYLES[level.value];
          return (
            <button
              key={level.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(level.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border py-3.5 transition-all sm:py-4 ${
                selected
                  ? `border-transparent ${styles.active} shadow-raised scale-[1.03]`
                  : "border-surface-line bg-surface-raised text-ink-800 hover:border-ink-900/20"
              }`}
            >
              <span className="font-display text-lg font-semibold sm:text-xl">
                {level.value}
              </span>
              <span
                className={`text-[11px] font-medium sm:text-xs ${
                  selected ? "text-white/90" : "text-ink-700/70"
                }`}
              >
                {level.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-ink-700/50">
        <span>Low impact</span>
        <span>Urgent, widespread</span>
      </div>
    </div>
  );
}
