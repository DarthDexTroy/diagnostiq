"use client";

interface PediatricToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function PediatricToggle({ enabled, onToggle }: PediatricToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? "Disable pediatric mode" : "Enable pediatric mode"}
      className={`
        flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all
        ${enabled
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        }
      `}
    >
      <span className="text-lg" aria-hidden>
        🧸
      </span>
      <span>Pediatric mode</span>
    </button>
  );
}
