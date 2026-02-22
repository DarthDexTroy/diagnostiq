"use client";

import { useEffect, useRef, useState } from "react";
import { SUPPORTED_LANGUAGES } from "@/types/assistant";

interface TheHubProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  language: string;
  onLanguageChange: (code: string) => void;
  /** When recording, pass the live stream for waveform visualization */
  stream: MediaStream | null;
}

export default function TheHub({
  isRecording,
  onStart,
  onStop,
  disabled,
  language,
  onLanguageChange,
  stream,
}: TheHubProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [globeSpin, setGlobeSpin] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  const handleLanguageChange = (code: string) => {
    setGlobeSpin(true);
    onLanguageChange(code);
    setTimeout(() => setGlobeSpin(false), 600);
  };

  // Real-time waveform when recording
  useEffect(() => {
    if (!stream || !canvasRef.current || !isRecording) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 32;
    const barWidth = Math.max(2, (canvas.width - (barCount - 1) * 4) / barCount);

    function draw() {
      if (!ctx) return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      // Blue gradient background to match glassmorphism theme
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, "rgba(59, 130, 246, 0.95)");
      bgGradient.addColorStop(0.5, "rgba(37, 99, 235, 0.95)");
      bgGradient.addColorStop(1, "rgba(29, 78, 216, 0.95)");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const step = Math.floor(bufferLength / barCount);
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] || 0;
        const h = (value / 255) * (canvas.height * 0.6) + 4;
        const x = i * (barWidth + 4);
        const y = (canvas.height - h) / 2;
        
        // Blue bars to match glassmorphism theme
        ctx.fillStyle = "rgba(147, 197, 253, 0.85)";
        
        // Soft blue glow
        ctx.shadowColor = "rgba(59, 130, 246, 0.4)";
        ctx.shadowBlur = 3;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    }
    draw();
    return () => {
      cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [stream, isRecording]);

  return (
    <header 
      className="sticky top-0 z-20 flex flex-col items-center pt-6 pb-8 px-4 border-b border-slate-200" 
      style={{ background: "var(--glass-bg)", backdropFilter: "var(--blur)" }}
    >
      <div className="flex items-center justify-center gap-6 w-full max-w-2xl">
        {/* Language pill - floating next to orb */}
        <button
          type="button"
          onClick={() => {}}
          className="glass-card flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
          aria-label="Language"
        >
          <span
            className={`inline-block ${globeSpin ? "globe-rotate" : ""}`}
            style={{ display: "inline-flex" }}
          >
            <GlobeIcon />
          </span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-transparent border-none cursor-pointer font-medium focus:outline-none focus:ring-0 text-slate-700"
          >
            {SUPPORTED_LANGUAGES.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </button>

        {/* Orb (idle) or Waveform (recording) */}
        <button
          type="button"
          onClick={isRecording ? onStop : onStart}
          disabled={disabled}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={`relative flex items-center justify-center overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl ${
            !isRecording ? "orb-pulse" : "animate-pulse-ring"
          }`}
          style={{
            width: isRecording ? 380 : 108,
            height: 108,
            borderRadius: isRecording ? "24px" : "50%",
            background: "linear-gradient(135deg, #007BFF 0%, #0056b3 100%)",
          }}
        >
          {isRecording ? (
            <canvas
              ref={canvasRef}
              width={360}
              height={80}
              className="rounded-lg"
              style={{ width: 360, height: 80 }}
            />
          ) : (
            <svg
              className="h-12 w-12 text-white relative z-10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-sm text-slate-600 mt-3 text-center">
        {isRecording ? "🎙️ Listening… Click to stop" : "Click the microphone to start recording"}
      </p>
    </header>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
