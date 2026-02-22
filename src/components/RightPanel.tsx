"use client";

import type { AssistantResponse, ExtractedItem } from "@/types/assistant";
import SkeletonLoader from "./SkeletonLoader";

interface RightPanelProps {
  data: AssistantResponse | null;
  isLoading: boolean;
}

function HighlightedText({ item }: { item: ExtractedItem }) {
  const className =
    item.type === "vital"
      ? "highlight-vital"
      : item.type === "symptom"
        ? "highlight-symptom"
        : "highlight-diagnosis";
  return <span className={`rounded px-0.5 ${className}`}>{item.text}</span>;
}

export default function RightPanel({ data, isLoading }: RightPanelProps) {
  // Debug logging
  if (data?.suggestedTreatments) {
    console.log('🔍 Suggested Treatments:', data.suggestedTreatments);
  }

  if (isLoading) return <SkeletonLoader />;

  if (!data) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-sm font-semibold text-cyan-200 uppercase tracking-wide mb-2">
          Patient view — Summary &amp; insights
        </h2>
        <div className="flex-1 rounded-lg border border-cyan-700/40 bg-gradient-to-br from-slate-800/95 to-cyan-900/95 backdrop-blur-sm p-4 flex items-center justify-center min-h-[200px] shadow-xl">
          <p className="text-cyan-300/60 italic">Summary will appear here after processing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <h2 className="text-sm font-semibold text-cyan-200 uppercase tracking-wide">
        Patient view — Summary &amp; insights
      </h2>

      <div className="flex-1 overflow-y-auto space-y-4">
        <section>
          <h3 className="text-xs font-medium text-cyan-300 uppercase mb-1">Patient-friendly summary</h3>
          <p className="text-cyan-50 rounded-lg border border-cyan-700/40 bg-gradient-to-br from-slate-800/95 to-cyan-900/95 backdrop-blur-sm p-4 shadow-lg">
            {data.patientSummary}
          </p>
        </section>

        {data.extracted.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-cyan-300 uppercase mb-1">Key vitals, symptoms &amp; diagnoses</h3>
            <div className="rounded-lg border border-cyan-700/40 bg-gradient-to-br from-slate-800/95 to-cyan-900/95 backdrop-blur-sm p-4 space-y-2 shadow-lg">
              {data.extracted.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      item.type === "vital"
                        ? "bg-emerald-900/70 text-emerald-200 border border-emerald-600/40"
                        : item.type === "symptom"
                          ? "bg-amber-900/70 text-amber-200 border border-amber-600/40"
                          : "bg-cyan-900/70 text-cyan-200 border border-cyan-600/40"
                    }`}
                  >
                    {item.type}
                  </span>
                  <HighlightedText item={item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {data.icdMappings.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-cyan-300 uppercase mb-1">ICD codes</h3>
            <ul className="rounded-lg border border-cyan-700/40 bg-gradient-to-br from-slate-800/95 to-cyan-900/95 backdrop-blur-sm p-4 space-y-1 shadow-lg">
              {data.icdMappings.map((m, i) => (
                <li key={i} className="text-sm text-cyan-100">
                  <span className="font-mono text-cyan-300">{m.code}</span> — {m.description}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.suggestedTreatments.length > 0 && (
          <section className="animate-slide-up">
            <h3 className="text-xs font-medium text-cyan-300 uppercase mb-1">Recommended Care</h3>
            <div className="rounded-lg border border-cyan-700/40 bg-gradient-to-br from-slate-800/95 to-cyan-900/95 backdrop-blur-md p-5 space-y-4 shadow-2xl">
              {data.suggestedTreatments.map((t, i) => {
                console.log(`🔍 Treatment ${i}:`, t.name, 'Has URL:', !!t.purchase_url, 'URL:', t.purchase_url);
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cyan-50">{t.name}</p>
                      {t.notes && (
                        <p className="text-xs text-cyan-300/70 mt-1">{t.notes}</p>
                      )}
                    </div>
                    {t.purchase_url ? (
                      <a
                        href={t.purchase_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl mt-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                        <span>Find on Amazon</span>
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-emerald-500 text-white rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">✓</span>
                      </a>
                    ) : (
                      <div className="text-red-500 text-xs">⚠️ No purchase URL</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
