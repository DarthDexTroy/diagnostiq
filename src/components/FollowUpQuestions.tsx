"use client";

import { useState, useRef, useCallback } from "react";

interface FollowUpQuestionsProps {
  questions: string[];
  onAnswer: (question: string, answer: string) => void;
}

export default function FollowUpQuestions({ questions, onAnswer }: FollowUpQuestionsProps) {
  const [isRecording, setIsRecording] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const speakQuestion = useCallback((question: string, index: number) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(index);
      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const startRecording = useCallback(async (question: string, index: number) => {
    try {
      // Try Web Speech API first (better for short responses)
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(index);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onAnswer(question, transcript);
          }
          setIsRecording(null);
        };

        recognition.onerror = () => {
          setIsRecording(null);
        };

        recognition.onend = () => {
          setIsRecording(null);
        };

        recognitionRef.current = recognition;
        recognition.start();
        
        // Auto-speak the question when recording starts
        speakQuestion(question, index);
      } else {
        // Fallback to MediaRecorder
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          stream.getTracks().forEach(t => t.stop());
          
          // Would need to send to backend for transcription
          // For now, just notify user to type
          alert("Voice transcription requires backend. Please type your answer.");
          setIsRecording(null);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(index);
        speakQuestion(question, index);
      }
    } catch (err) {
      console.error("Microphone access failed:", err);
      alert("Microphone access denied. Please type your answer.");
      setIsRecording(null);
    }
  }, [onAnswer, speakQuestion]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(null);
  }, []);

  if (!questions || questions.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-lg animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💬</span>
        <h3 className="text-sm font-semibold text-amber-900">Follow-up Questions</h3>
      </div>
      <p className="text-xs text-amber-800 mb-3">
        Click the speaker to hear the question, then the microphone to respond:
      </p>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border border-amber-200">
            <p className="text-sm font-medium text-slate-800 mb-2">{q}</p>
            <div className="flex gap-2">
              {/* Speaker button */}
              <button
                onClick={() => speakQuestion(q, i)}
                disabled={isSpeaking === i}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isSpeaking === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                title="Play question"
              >
                {isSpeaking === i ? '🔊' : '🔈'}
              </button>

              {/* Microphone button */}
              <button
                onClick={() => {
                  if (isRecording === i) {
                    stopRecording();
                  } else {
                    startRecording(q, i);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  isRecording === i
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
                title={isRecording === i ? "Stop recording" : "Record answer"}
              >
                {isRecording === i ? '⏹️ Stop' : '🎤 Speak'}
              </button>

              {/* Text input fallback */}
              <input
                type="text"
                placeholder="Or type answer..."
                className="flex-1 px-3 py-1.5 text-sm border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    onAnswer(q, e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input.value) {
                    onAnswer(q, input.value);
                    input.value = '';
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
