"use client";

import { SUPPORTED_LANGUAGES } from "@/types/assistant";

interface HeaderProps {
  language: string;
  onLanguageChange: (code: string) => void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-800">A Diagnostic Assistant</h1>
      <div className="flex items-center gap-2">
        <label htmlFor="lang-select" className="text-sm text-slate-600">
          Language
        </label>
        <select
          id="lang-select"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {SUPPORTED_LANGUAGES.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
