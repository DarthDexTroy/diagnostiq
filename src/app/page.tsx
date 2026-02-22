"use client";

import { useState, useCallback, useRef } from "react";
import TheHub from "@/components/TheHub";
import ClinicianLedger from "@/components/ClinicianLedger";
import PatientPortal from "@/components/PatientPortal";
import ExportRocket from "@/components/ExportRocket";
import TranscriptEditor from "@/components/TranscriptEditor";
import TriageAlert from "@/components/TriageAlert";
import VoiceCommands from "@/components/VoiceCommands";
import { transcribeAndSummarize } from "@/lib/api";
import type { AssistantResponse } from "@/types/assistant";

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      const recorder = new MediaRecorder(audioStream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setStream(null);
        audioStream.getTracks().forEach((t) => t.stop());
        const chunks = chunksRef.current;
        if (chunks.length === 0) return;
        const blob = new Blob(chunks, { type: "audio/webm" });
        setIsLoading(true);
        setResult(null);
        try {
          const data = await transcribeAndSummarize(blob, language);
          setTranscript(data.transcript);
          setResult(data);
        } catch (err) {
          console.error(err);
          setTranscript((t) => t + "\n[Error processing audio. Please try again.]");
        } finally {
          setIsLoading(false);
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setTranscript("");
      setResult(null);
      setIsRecording(true);
      setIsLive(true);
    } catch (e) {
      console.error("Microphone access failed:", e);
    }
  }, [language]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    setIsRecording(false);
    setIsLive(false);
  }, []);

  const handleTranscriptEdit = useCallback(async (editedTranscript: string) => {
    setTranscript(editedTranscript);
    setIsLoading(true);
    setResult(null);
    try {
      // Create a blob from the edited text to reprocess
      const textBlob = new Blob([editedTranscript], { type: "text/plain" });
      const data = await transcribeAndSummarize(textBlob, language, editedTranscript);
      setResult(data);
    } catch (err) {
      console.error("Error reprocessing edited transcript:", err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const exportRocketRef = useRef<{ triggerExport: () => void }>(null);

  const handleVoiceCommand = useCallback((command: string) => {
    console.log("Voice command received:", command);
    
    switch (command) {
      case "export":
        if (exportRocketRef.current) {
          exportRocketRef.current.triggerExport();
        }
        break;
      case "mark-urgent":
        alert("Marking as urgent - feature to be connected to EMR");
        break;
      case "order-labs":
        alert("Opening lab order interface - feature to be connected to EMR");
        break;
      case "prescribe":
        // Scroll to treatments section
        document.querySelector('[data-section="treatments"]')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case "clear":
        if (confirm("Start new patient encounter?")) {
          setTranscript("");
          setResult(null);
        }
        break;
    }
  }, []);

  const dataFlowing = isLoading || (!!result && transcript.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-blue-200 backdrop-blur-sm" style={{ background: "var(--glass-bg)" }}>
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM15 20H6c-.55 0-1-.45-1-1v-1h10v2zm4-1c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14z"/>
            <path d="M9 7h6v2H9zm7 0h2v2h-2zm-7 3h6v2H9zm7 0h2v2h-2z"/>
          </svg>
          <h1 className="text-2xl font-bold text-slate-800">Axxess Diagnostic Assistant</h1>
        </div>
      </div>

      {/* Voice Commands */}
      <VoiceCommands onCommand={handleVoiceCommand} isRecording={isRecording} />

      <TheHub
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
        disabled={isLoading}
        language={language}
        onLanguageChange={setLanguage}
        stream={stream}
      />

      <main className="flex-1 flex flex-col min-h-0 px-6 py-6">
        {/* Triage Alert - show at top if ESI 1-2 */}
        {result?.triageSeverity && result.triageSeverity.esi_level <= 2 && (
          <div className="mb-6 max-w-7xl w-full mx-auto">
            <TriageAlert triage={result.triageSeverity} />
          </div>
        )}

        {/* Twin-Pane Layout with Data Bridge */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 max-w-7xl w-full mx-auto min-h-[360px]">
          {/* LEFT PANEL: The Ledger (SOAP S/O) */}
          <div className="min-h-[280px] lg:min-h-0 flex flex-col gap-4">
            {/* Triage Alert in left column for ESI 3-5 */}
            {result?.triageSeverity && result.triageSeverity.esi_level > 2 && (
              <TriageAlert triage={result.triageSeverity} />
            )}
            
            <ClinicianLedger
              transcript={transcript}
              isLive={isLive}
              extracted={result?.extracted}
            />
            {transcript && !isRecording && (
              <TranscriptEditor 
                transcript={transcript}
                onSave={handleTranscriptEdit}
              />
            )}
          </div>

          {/* CENTRAL DIVIDER: Data Bridge */}
          <div
            className={`hidden lg:block w-2 rounded-full transition-all flex-shrink-0 ${
              dataFlowing ? "divider-pulse" : "bg-slate-300"
            }`}
            style={{ 
              background: dataFlowing 
                ? 'linear-gradient(180deg, var(--axxess-blue) 0%, var(--vital-green) 100%)' 
                : undefined
            }}
            aria-hidden
          />

          {/* RIGHT PANEL: The Portal (Assessment & Plan) */}
          <div className="min-h-[280px] lg:min-h-0 flex flex-col">
            <PatientPortal
              data={result}
              isLoading={isLoading}
            />
          </div>
        </section>
      </main>

      <ExportRocket ref={exportRocketRef} data={result} />
    </div>
  );
}
