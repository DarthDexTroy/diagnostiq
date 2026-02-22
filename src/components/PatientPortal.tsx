"use client";

import type { AssistantResponse, ExtractedItem } from "@/types/assistant";
import SkeletonLoader from "./SkeletonLoader";
import { generateMedicationCard } from "@/lib/medicationLinks";

interface PatientPortalProps {
  data: AssistantResponse | null;
  isLoading: boolean;
  pediatricMode?: boolean;
}

function VitalsRings({ extracted, pediatricMode }: { extracted: ExtractedItem[]; pediatricMode?: boolean }) {
  const vitals = extracted.filter((e) => e.type === "vital");
  const temp = vitals.find((e) => /temp|°|fever|f\b|celsius|fahrenheit/i.test(e.text));
  const hr = vitals.find((e) => /heart|rate|bpm|pulse/i.test(e.text));
  const parseNum = (s: string): number => {
    const m = s.match(/(\d+(?:\.\d+)?)/);
    return m ? Math.min(100, Math.max(0, parseFloat(m[1]) % 100)) : 0;
  };
  const tempVal = temp ? parseNum(temp.text) : null;
  const hrVal = hr ? parseNum(hr.text) : null;
  if (!tempVal && !hrVal) return null;

  const Ring = ({
    value,
    label,
    icon,
    pediatricMode,
  }: {
    value: number;
    label: string;
    icon: React.ReactNode;
    pediatricMode?: boolean;
  }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="rgba(8, 145, 178, 0.2)"
            strokeWidth="4"
          />
          <circle
            className="vital-ring"
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="#14B8A6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={2 * Math.PI * 24 * (1 - value / 100)}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-cyan-300">
          {Math.round(value)}
        </span>
      </div>
      <span className="text-xs text-slate-600">{label}</span>
      {pediatricMode && <span className="text-slate-400 flex justify-center">{icon}</span>}
    </div>
  );

  return (
    <div className="flex gap-6 justify-center py-4 border-t border-slate-200 mt-4">
      {tempVal != null && (
        <Ring
          value={Math.min(100, (tempVal / 105) * 100)}
          label={pediatricMode ? "Temperature" : "Temp"}
          pediatricMode={pediatricMode}
          icon={
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
          }
        />
      )}
      {hrVal != null && (
        <Ring
          value={Math.min(100, hrVal)}
          label="Heart rate"
          pediatricMode={pediatricMode}
          icon={
            <svg className="w-5 h-5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          }
        />
      )}
    </div>
  );
}

export default function PatientPortal({ data, isLoading, pediatricMode }: PatientPortalProps) {
  if (isLoading) return <SkeletonLoader />;

  if (!data) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z"/>
          </svg>
          The Portal - Assessment & Plan
        </h2>
        <div className="glass-panel flex-1 flex items-center justify-center min-h-[200px] text-slate-400">
          <p className="text-center">Assessment and care plan will appear here after processing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z"/>
        </svg>
        The Portal - Assessment & Plan
      </h2>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4">
          <section>
            <h3 className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
              {pediatricMode && (
                <span className="text-lg" aria-hidden>📋</span>
              )}
              Patient-Friendly Summary
            </h3>
            <p className="glass-card text-slate-800 text-lg leading-relaxed p-4">
              {data.patientSummary}
            </p>
          </section>

          {data.extracted.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">🔑 Key Points</h3>
              <div className="glass-card p-4 space-y-2">
                {data.extracted.map((item, i) => (
                  <div
                    key={i}
                    className="jargon-bounce flex items-center gap-2"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        item.type === "vital"
                          ? "bg-vital-green/20 text-vital-green"
                          : item.type === "symptom"
                            ? "bg-warning-amber/25 text-amber-800"
                            : "bg-axxess-blue/20 text-axxess-blue"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-slate-800">{item.text}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.suggestedTreatments.length > 0 && (
            <section className="animate-slide-up" data-section="treatments">
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">💊 Recommended Care</h3>
              <div
                className="rounded-lg border border-slate-200 p-4 space-y-4"
                style={{ backgroundColor: "var(--glass-grey)" }}
              >
                {data.suggestedTreatments.map((t, i) => {
                  // Generate smart medication link
                  const medCard = generateMedicationCard(t.name, pediatricMode);
                  
                  return (
                    <div 
                      key={i} 
                      className="medication-card p-3 space-y-3"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                        {t.dosage && (
                          <p className="text-xs text-slate-600 mt-1">
                            <span className="font-medium">Dosage:</span> {t.dosage}
                            {t.frequency && <span> • {t.frequency}</span>}
                          </p>
                        )}
                        {t.duration && (
                          <p className="text-xs text-slate-600 mt-1">
                            <span className="font-medium">Duration:</span> {t.duration}
                          </p>
                        )}
                        {t.notes && (
                          <p className="text-xs text-slate-600 mt-1">{t.notes}</p>
                        )}
                      </div>
                      
                      {/* Smart Amazon Link */}
                      <a
                        href={medCard.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="buy-link-button inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white text-sm font-semibold rounded-lg shadow"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.596 8.449-1.789.168-.072.288-.046.36.078.072.124.048.234-.072.33-3.316 1.815-6.756 2.723-10.32 2.723-4.788 0-8.97-1.468-12.546-4.404-.144-.116-.18-.227-.089-.382zm1.334-7.583c-.072-.116-.048-.234.072-.354l.36-.36c.096-.096.216-.096.36 0 2.472 1.933 5.21 2.9 8.214 2.9 3.004 0 5.742-.967 8.214-2.9.144-.096.264-.096.36 0l.36.36c.12.12.144.238.072.354-.072.116-.168.185-.288.185-2.88 2.23-6.048 3.345-9.504 3.345s-6.624-1.115-9.504-3.345c-.12 0-.216-.069-.288-.185z"/>
                        </svg>
                        {medCard.label}
                      </a>
                      
                      {/* Multiple Pharmacy Links */}
                      {t.pharmacy_links && (
                        <div className="flex flex-wrap gap-2">
                          {t.pharmacy_links.walgreens && (
                            <a
                              href={t.pharmacy_links.walgreens}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xs font-semibold rounded-lg shadow transition-all duration-300 hover:scale-105"
                            >
                              🏪 Walgreens
                            </a>
                          )}
                          {t.pharmacy_links.cvs && (
                            <a
                              href={t.pharmacy_links.cvs}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-xs font-semibold rounded-lg shadow transition-all duration-300 hover:scale-105"
                            >
                              💊 CVS
                            </a>
                          )}
                          {t.pharmacy_links.walmart && (
                            <a
                              href={t.pharmacy_links.walmart}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold rounded-lg shadow transition-all duration-300 hover:scale-105"
                            >
                              🛒 Walmart
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Lab Tests Section */}
          {data.labTests && data.labTests.length > 0 && (
            <section className="animate-slide-up">
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">🔬 Recommended Lab Tests</h3>
              <div
                className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2"
              >
                {data.labTests.map((test, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      test.urgency === 'stat' ? 'bg-red-600 text-white' :
                      test.urgency === 'urgent' ? 'bg-orange-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {test.urgency.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{test.name}</p>
                      <p className="text-xs text-slate-600">{test.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pain Assessment Section */}
          {data.painAssessment && (
            <section>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">😣 Pain Assessment</h3>
              <div
                className="rounded-lg border border-slate-200 p-3"
                style={{ backgroundColor: "var(--glass-grey)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      data.painAssessment.scale >= 8 ? 'text-red-600' :
                      data.painAssessment.scale >= 5 ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}>
                      {data.painAssessment.scale}/10
                    </div>
                    <div className="text-xs text-slate-500">Pain Scale</div>
                  </div>
                  <div className="flex-1 text-sm text-slate-700">
                    {data.painAssessment.location && <div><span className="font-medium">Location:</span> {data.painAssessment.location}</div>}
                    {data.painAssessment.quality && <div><span className="font-medium">Quality:</span> {data.painAssessment.quality}</div>}
                  </div>
                </div>
              </div>
            </section>
          )}

          <VitalsRings extracted={data.extracted} pediatricMode={pediatricMode} />
        </div>

        {/* ICD sidebar - tags "pop" in with bubble rise */}
        {data.icdMappings.length > 0 && (
          <aside className="w-48 flex-shrink-0 flex flex-col">
            <h3 className="text-xs font-medium text-slate-500 uppercase mb-2">ICD-10</h3>
            <ul className="space-y-2">
              {data.icdMappings.map((m, i) => (
                <li
                  key={i}
                  className="icd-bubble rounded-lg border border-axxess-blue/30 bg-white px-2 py-1.5 shadow-sm"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="font-mono text-xs text-axxess-blue block">{m.code}</span>
                  <span className="text-xs text-slate-600 line-clamp-2">{m.description}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}
