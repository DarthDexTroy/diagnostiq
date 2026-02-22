"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import type { AssistantResponse, ExportResponse } from "@/types/assistant";
import { exportToEMR, validateSOAPData, downloadJSON, buildEMRPayload } from "@/lib/api";

interface ExportRocketProps {
  data: AssistantResponse | null;
}

export interface ExportRocketHandle {
  triggerExport: () => void;
}

type Phase = "idle" | "validating" | "securing" | "flying" | "success" | "error";

const ExportRocket = forwardRef<ExportRocketHandle, ExportRocketProps>(({ data }, ref) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [showSOAP, setShowSOAP] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [exportResult, setExportResult] = useState<ExportResponse | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const emrIconRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    triggerExport: handleExport
  }));

  const handleExport = () => {
    if (!data || isFinalized) return;
    
    console.log('🔍 Export clicked. Data:', data);
    console.log('🔍 SOAP Note exists?', !!data.soapNote);
    console.log('🔍 SOAP Note data:', data.soapNote);
    
    // Check if SOAP note exists and has content
    if (!data.soapNote || !data.soapNote.subjective) {
      setErrorMessage("SOAP Note is missing. Please ensure the transcription was processed completely.");
      setPhase("error");
      setTimeout(() => {
        setPhase("idle");
        setErrorMessage("");
      }, 4000);
      return;
    }
    
    // Show SOAP note modal
    setShowSOAP(true);
  };

  const performExport = async () => {
    if (!data || isFinalized) return;
    
    try {
      // Phase 1: Data Validation (0-25%)
      setPhase("validating");
      setProgress(0);
      setErrorMessage("");
      
      await animateProgress(0, 25, 400);
      
      const validation = validateSOAPData(data);
      if (!validation.valid) {
        throw new Error(`SOAP validation failed: ${validation.missing.join(", ")}`);
      }
      
      // Phase 2: Cryptographic Hashing & Securing (25-60%)
      setPhase("securing");
      await animateProgress(25, 60, 600);
      
      // Phase 3: EMR Export with Audit Trail (60-90%)
      setPhase("flying");
      await animateProgress(60, 90, 500);
      
      const result = await exportToEMR(
        data,
        "CLI-DEMO-001",
        "Dr. Demo Clinician"
      );
      
      setExportResult(result);
      
      // Phase 4: Success & Download (90-100%)
      await animateProgress(90, 100, 300);
      
      // Generate downloadable files
      const payload = await buildEMRPayload(data, "CLI-DEMO-001");
      const filename = `${result.reportId}.json`;
      downloadJSON(filename, payload);
      
      setPhase("success");
      setIsFinalized(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setPhase("idle");
        setShowSOAP(false);
        setProgress(0);
      }, 3000);
      
    } catch (error) {
      console.error("Export failed:", error);
      setPhase("error");
      setErrorMessage(error instanceof Error ? error.message : "Export failed");
      
      // Reset after 4 seconds
      setTimeout(() => {
        setPhase("idle");
        setProgress(0);
        setErrorMessage("");
      }, 4000);
    }
  };

  const animateProgress = (from: number, to: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = from + (to - from) * progress;
        setProgress(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  };

  const getStatusMessage = () => {
    switch (phase) {
      case "validating":
        return "🔍 Validating SOAP sections...";
      case "securing":
        return "🔒 Generating secure audit trail...";
      case "flying":
        return "📤 Exporting to Axxess EMR...";
      case "success":
        return "✅ Report secured and finalized!";
      case "error":
        return `❌ ${errorMessage}`;
      default:
        return "";
    }
  };

  return (
    <>
      {/* SOAP Note Modal */}
      {showSOAP && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📋 SOAP Note - EMR Format
                {isFinalized && (
                  <span className="ml-3 px-3 py-1 bg-green-500 text-white text-sm rounded-full font-semibold">
                    FINALIZED
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowSOAP(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                disabled={phase !== "idle" && phase !== "success"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ opacity: isFinalized ? 0.7 : 1 }}>
              <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl p-5 border border-cyan-200">
                <h3 className="text-sm font-bold text-cyan-700 uppercase mb-2 flex items-center gap-2">
                  <span className="bg-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">S</span>
                  Subjective
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.soapNote?.subjective}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-teal-50 rounded-xl p-5 border border-teal-200">
                <h3 className="text-sm font-bold text-teal-700 uppercase mb-2 flex items-center gap-2">
                  <span className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">O</span>
                  Objective
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.soapNote?.objective}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-xl p-5 border border-emerald-200">
                <h3 className="text-sm font-bold text-emerald-700 uppercase mb-2 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">A</span>
                  Assessment
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.soapNote?.assessment}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-blue-200">
                <h3 className="text-sm font-bold text-blue-700 uppercase mb-2 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">P</span>
                  Plan
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.soapNote?.plan}</p>
              </div>
            </div>

            {/* Progress Bar Section */}
            {phase !== "idle" && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{getStatusMessage()}</span>
                  <span className="text-slate-500">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      phase === "success" 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                        : phase === "error"
                        ? "bg-gradient-to-r from-red-500 to-rose-500"
                        : "bg-gradient-to-r from-cyan-500 to-teal-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {exportResult && phase === "success" && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
                    <div className="font-semibold text-green-800 mb-1">✓ Audit Trail Created</div>
                    <div className="text-green-700">Report ID: {exportResult.reportId}</div>
                    <div className="text-green-700">Signature: {exportResult.digitalSignature.substring(0, 16)}...</div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowSOAP(false)}
                disabled={phase !== "idle" && phase !== "success"}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>
              <button
                onClick={performExport}
                disabled={phase !== "idle" || isFinalized}
                className={`px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFinalized
                    ? "bg-green-600 text-white"
                    : "bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-500 hover:to-teal-500"
                }`}
              >
                {isFinalized ? "✓ Finalized" : "🔒 Finalize & Export to EMR"}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer
        className="sticky bottom-0 z-10 flex items-center justify-between px-6 py-4 border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        style={{ backgroundColor: "var(--glass-grey)" }}
      >
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <div ref={emrIconRef} className="flex items-center gap-2" aria-hidden>
            <EMRIcon />
            <span>EMR</span>
          </div>
        </div>

        <div className="relative flex items-center gap-4">
          {phase === "error" && errorMessage && (
            <div className="absolute bottom-full mb-2 right-0 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg shadow-lg text-sm max-w-md animate-slide-up">
              <div className="font-semibold mb-1">❌ Export Failed</div>
              <div>{errorMessage}</div>
            </div>
          )}

          {phase === "flying" && (
            <div
              className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
              aria-hidden
            >
              <div className="export-packet w-16 h-16 rounded-xl bg-axxess-blue shadow-lg flex items-center justify-center animate-fly-to-emr">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zm-2 14v-4h2v4h2v-4h2v-2h-6v2z" />
                </svg>
              </div>
            </div>
          )}

          {phase === "success" && !showSOAP && (
            <span
              className="inline-flex items-center gap-2 text-vital-green font-semibold text-lg animate-scale-up"
              aria-live="polite"
            >
              <span className="text-2xl">✓</span> Report Secured
            </span>
          )}

          <button
            type="button"
            onClick={handleExport}
            disabled={!data || phase !== "idle" || isFinalized}
            className={`
              inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3
              font-semibold text-white shadow-md transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-95
              ${
                isFinalized
                  ? "bg-vital-green"
                  : phase === "success"
                  ? "bg-vital-green"
                  : phase === "error"
                  ? "bg-emergency-red"
                  : "bg-axxess-blue hover:bg-[#0069d9]"
              }
            `}
          >
            {isFinalized ? (
              <>
                <span className="text-xl">✓</span>
                Finalized
              </>
            ) : phase === "error" ? (
              <>
                <span className="text-xl">❌</span>
                Export Failed
              </>
            ) : phase === "idle" ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z" />
                </svg>
                Export to EMR
              </>
            ) : (
              "Processing..."
            )}
          </button>
        </div>
      </footer>
    </>
  );
});

ExportRocket.displayName = "ExportRocket";

export default ExportRocket;

function EMRIcon() {
  return (
    <svg className="w-8 h-8 text-axxess-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
