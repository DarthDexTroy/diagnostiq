"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface VoiceCommandsProps {
  onCommand: (command: string, params?: any) => void;
  isRecording: boolean;
}

export default function VoiceCommands({ onCommand, isRecording }: VoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  const commands = [
    { pattern: /export|download|save/i, action: "export", label: "Export to EMR" },
    { pattern: /mark.*(urgent|critical|emergency)/i, action: "mark-urgent", label: "Mark as Urgent" },
    { pattern: /order.*(cbc|blood|test|lab)/i, action: "order-labs", label: "Order Labs" },
    { pattern: /prescribe|medication|medicine/i, action: "prescribe", label: "View Treatments" },
    { pattern: /clear|reset|new/i, action: "clear", label: "Clear/New Patient" },
    { pattern: /stop.*(listening|commands)/i, action: "stop-listening", label: "Stop Voice Commands" },
  ];

  const processCommand = useCallback((transcript: string) => {
    console.log("🎤 Voice input:", transcript);
    
    for (const cmd of commands) {
      if (cmd.pattern.test(transcript)) {
        console.log("✅ Command matched:", cmd.label);
        setLastCommand(cmd.label);
        setFeedback(cmd.label);
        onCommand(cmd.action);
        
        // Clear feedback after 2 seconds
        setTimeout(() => setFeedback(""), 2000);
        return;
      }
    }
    
    console.log("❌ No command matched");
    setFeedback("Command not recognized");
    setTimeout(() => setFeedback(""), 2000);
  }, [onCommand]);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice commands not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      console.log("🎤 Voice commands active");
    };

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      processCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech') {
        // Ignore no-speech errors
        return;
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Auto-restart if we were listening
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, processCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Stop listening when recording starts
  useEffect(() => {
    if (isRecording && isListening) {
      stopListening();
    }
  }, [isRecording, isListening, stopListening]);

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col items-end gap-2">
      {/* Toggle button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isRecording}
        className={`group relative px-4 py-2 rounded-lg font-medium text-sm shadow-lg transition-all ${
          isListening
            ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
            : "bg-cyan-600 hover:bg-cyan-700 text-white"
        } ${isRecording ? "opacity-50 cursor-not-allowed" : ""}`}
        title={isListening ? "Stop voice commands" : "Start voice commands"}
      >
        <span className="flex items-center gap-2">
          {isListening ? "🔴" : "🎤"} Voice Commands
        </span>
      </button>

      {/* Command feedback */}
      {feedback && (
        <div className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-slide-up">
          ✓ {feedback}
        </div>
      )}

      {/* Active listening indicator */}
      {isListening && (
        <div className="bg-slate-800/95 backdrop-blur-sm text-cyan-300 text-xs px-3 py-2 rounded-lg shadow-lg border border-cyan-600/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Listening for commands...</span>
          </div>
          <div className="mt-2 pt-2 border-t border-cyan-600/30 space-y-1">
            <p className="text-cyan-400 font-medium">Try saying:</p>
            <ul className="text-cyan-200 space-y-0.5">
              <li>• "Export to EMR"</li>
              <li>• "Mark as urgent"</li>
              <li>• "Order labs"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
