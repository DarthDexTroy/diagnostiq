"use client";

import type { TriageSeverity } from "@/types/assistant";

interface TriageAlertProps {
  triage: TriageSeverity;
}

export default function TriageAlert({ triage }: TriageAlertProps) {
  const getColorScheme = () => {
    switch (triage.esi_level) {
      case 1:
        return {
          bg: "bg-red-600",
          border: "border-red-700",
          text: "text-white",
          badge: "bg-red-800",
          urgency: "CRITICAL",
          icon: "🚨"
        };
      case 2:
        return {
          bg: "bg-orange-500",
          border: "border-orange-600",
          text: "text-white",
          badge: "bg-orange-700",
          urgency: "EMERGENT",
          icon: "⚠️"
        };
      case 3:
        return {
          bg: "bg-yellow-400",
          border: "border-yellow-500",
          text: "text-slate-900",
          badge: "bg-yellow-600",
          urgency: "URGENT",
          icon: "⚡"
        };
      case 4:
        return {
          bg: "bg-green-500",
          border: "border-green-600",
          text: "text-white",
          badge: "bg-green-700",
          urgency: "LESS URGENT",
          icon: "✓"
        };
      case 5:
      default:
        return {
          bg: "bg-blue-500",
          border: "border-blue-600",
          text: "text-white",
          badge: "bg-blue-700",
          urgency: "NON-URGENT",
          icon: "ℹ️"
        };
    }
  };

  const colors = getColorScheme();
  const isCritical = triage.esi_level <= 2;

  return (
    <div
      className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4 shadow-lg animate-slide-up ${
        isCritical ? "animate-pulse" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{colors.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold ${colors.badge} ${colors.text} px-2 py-1 rounded`}>
              ESI-{triage.esi_level}
            </span>
            <span className={`text-sm font-bold ${colors.text} uppercase tracking-wide`}>
              {colors.urgency}
            </span>
          </div>
          
          <p className={`text-sm ${colors.text} font-medium mb-2`}>
            Time to Provider: <span className="font-bold">{triage.time_to_provider}</span>
          </p>

          {triage.red_flags && triage.red_flags.length > 0 && (
            <div className="mb-2">
              <p className={`text-xs font-semibold ${colors.text} mb-1`}>🚨 RED FLAGS:</p>
              <ul className={`text-xs ${colors.text} space-y-1 ml-4`}>
                {triage.red_flags.map((flag, i) => (
                  <li key={i} className="list-disc">{flag}</li>
                ))}
              </ul>
            </div>
          )}

          <p className={`text-xs ${colors.text} opacity-90 italic`}>
            {triage.reasoning}
          </p>
        </div>
      </div>

      {isCritical && (
        <div className={`mt-3 pt-3 border-t-2 ${colors.border}`}>
          <p className={`text-xs ${colors.text} font-bold uppercase tracking-wide`}>
            ⚡ IMMEDIATE ATTENTION REQUIRED ⚡
          </p>
        </div>
      )}
    </div>
  );
}
