"use client";

interface MicButtonProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export default function MicButton({ isRecording, onStart, onStop, disabled }: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="mic-button-circle"
        style={{
          width: '96px',
          height: '96px',
          borderRadius: '9999px',
          position: 'relative'
        }}
      >
        <button
          type="button"
          onClick={isRecording ? onStop : onStart}
          disabled={disabled}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={`
            absolute inset-0 flex items-center justify-center
            shadow-lg overflow-hidden
            transition-all duration-300 transform
            hover:scale-110 hover:shadow-2xl
            focus:outline-none focus:ring-4 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              isRecording
                ? "bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 animate-pulse-ring focus:ring-red-400"
                : "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-400"
            }
          `}
          style={{
            borderRadius: '9999px',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        >
          {isRecording ? (
            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
              <rect x="7" y="7" width="10" height="10" rx="2" />
            </svg>
          ) : (
            <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>
      <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        {isRecording ? "🎙️ Listening… Click to stop" : "Click to capture conversation"}
      </span>
    </div>
  );
}
