"use client";

import { useEffect, useRef } from "react";

interface LeftPanelProps {
  transcript: string;
  isLive: boolean;
}

export default function LeftPanel({ transcript, isLive }: LeftPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !isLive) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [transcript, isLive]);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-cyan-200 uppercase tracking-wide mb-2">
        Clinician view — Speech-to-text
      </h2>
      <div
        ref={scrollRef}
        className="transcription-scroll flex-1 overflow-y-auto rounded-lg border border-cyan-700/40 bg-gradient-to-br from-slate-800/95 to-cyan-900/95 backdrop-blur-sm p-4 text-cyan-50 min-h-[200px] shadow-xl"
      >
        {transcript ? (
          transcript.split(/(?<=[.!?])\s+/).map((sentence, i) => (
            <p
              key={i}
              className="animate-fade-in-up mb-2 last:mb-0"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {sentence.trim()}
            </p>
          ))
        ) : (
          <p className="text-cyan-300/60 italic">Transcript will appear here as you speak.</p>
        )}
      </div>
    </div>
  );
}
