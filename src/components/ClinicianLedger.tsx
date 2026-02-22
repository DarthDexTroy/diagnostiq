"use client";

import { useEffect, useRef } from "react";
import type { ExtractedItem } from "@/types/assistant";

interface ClinicianLedgerProps {
  transcript: string;
  isLive: boolean;
  /** When we have results, highlight these in the transcript (live tagging) */
  extracted?: ExtractedItem[];
}

export default function ClinicianLedger({ transcript, isLive, extracted = [] }: ClinicianLedgerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !isLive) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, isLive]);

  // Build segments: wrap extracted terms in highlighted spans for live tagging
  const segments: { text: string; type?: "vital" | "symptom" | "diagnosis" }[] = [];
  if (!transcript) {
    segments.push({ text: "" });
  } else if (extracted.length === 0) {
    transcript.split(/(\s+)/).forEach((t) => segments.push({ text: t }));
  } else {
    let remaining = transcript;
    const sorted = [...extracted].filter((e) => remaining.includes(e.text)).sort((a, b) => remaining.indexOf(a.text) - remaining.indexOf(b.text));
    for (const item of sorted) {
      const idx = remaining.indexOf(item.text);
      if (idx === -1) continue;
      if (idx > 0) {
        remaining.slice(0, idx).split(/(\s+)/).forEach((t) => segments.push({ text: t }));
      }
      segments.push({ text: item.text, type: item.type });
      remaining = remaining.slice(idx + item.text.length);
    }
    if (remaining) remaining.split(/(\s+)/).forEach((t) => segments.push({ text: t }));
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <path d="M14 2v6h6"/>
        </svg>
        The Ledger
      </h2>
      <div
        ref={scrollRef}
        className="glass-panel flex-1 overflow-y-auto min-h-[200px] font-mono text-sm text-slate-800 leading-relaxed"
      >
        {segments.length === 0 || (segments.length === 1 && !segments[0].text) ? (
          <p className="text-slate-400 italic">Live transcript will appear here as you speak...</p>
        ) : (
          <p className="whitespace-pre-wrap break-words">
            {segments.map((seg, i) => {
              if (!seg.text) return null;
              if (seg.type) {
                const cls =
                  seg.type === "vital"
                    ? "highlight-vital"
                    : seg.type === "symptom"
                      ? "highlight-symptom"
                      : "highlight-diagnosis";
                return (
                  <span
                    key={i}
                    className={`rounded px-0.5 ${cls} transition-all duration-300`}
                    style={{ animationDelay: `${i * 0.02}s` }}
                  >
                    {seg.text}
                  </span>
                );
              }
              return (
                <span key={i} className="typewriter-char" style={{ animationDelay: `${i * 0.03}s` }}>
                  {seg.text}
                </span>
              );
            })}
          </p>
        )}
      </div>
    </div>
  );
}
