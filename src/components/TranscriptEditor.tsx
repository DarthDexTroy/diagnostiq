"use client";

import { useState } from "react";

interface TranscriptEditorProps {
  transcript: string;
  onSave: (edited: string) => void;
}

export default function TranscriptEditor({ transcript, onSave }: TranscriptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcript);

  const handleSave = () => {
    onSave(editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(transcript);
    setIsEditing(false);
  };

  if (!transcript) return null;

  return (
    <div className="rounded-lg border border-cyan-700/40 bg-gradient-to-br from-slate-800/95 to-cyan-900/95 backdrop-blur-sm p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-cyan-300 uppercase">Transcript</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Transcript
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-32 px-3 py-2 text-sm text-slate-800 bg-white border border-cyan-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            placeholder="Edit transcript here..."
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-medium text-cyan-300 border border-cyan-600 rounded-lg hover:bg-cyan-900/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg hover:from-cyan-500 hover:to-teal-500 transition-colors shadow"
            >
              Save & Reprocess
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-cyan-50 leading-relaxed">{transcript}</p>
      )}
    </div>
  );
}
