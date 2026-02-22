"use client";

import { useState } from "react";
import type { AssistantResponse, EMRExportPayload } from "@/types/assistant";
import { buildEMRPayload, downloadJSON } from "@/lib/api";

interface ActionFooterProps {
  data: AssistantResponse | null;
}

type ExportState = "idle" | "success";

export default function ActionFooter({ data }: ActionFooterProps) {
  const [exportState, setExportState] = useState<ExportState>("idle");

  const handleExport = async () => {
    if (!data) return;
    const payload: EMRExportPayload = await buildEMRPayload(data);
    const filename = `emr-export-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    downloadJSON(filename, payload);
    setExportState("success");
    setTimeout(() => setExportState("idle"), 2000);
  };

  return (
    <footer className="sticky bottom-0 z-10 flex items-center justify-center border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button
        type="button"
        onClick={handleExport}
        disabled={!data}
        className={`
          export-btn inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3
          font-medium text-white shadow-md
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${exportState === "success" ? "bg-green-600 export-btn success" : "bg-blue-600 hover:bg-blue-700"}
        `}
      >
        {exportState === "success" ? (
          <>
            <span className="text-xl" aria-hidden>✓</span>
            <span>Exported</span>
          </>
        ) : (
          "Export to EMR"
        )}
      </button>
    </footer>
  );
}
