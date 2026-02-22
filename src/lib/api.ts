import type { AssistantResponse, EMRExportPayload, ExportResponse, AuditTrailEntry } from "@/types/assistant";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "/api/backend";

export async function transcribeAndSummarize(
  audioBlob: Blob,
  language: string = "en",
  overrideTranscript?: string
): Promise<AssistantResponse> {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");
  form.append("language", language);
  if (overrideTranscript) {
    form.append("override_transcript", overrideTranscript);
  }

  const res = await fetch(`${BACKEND}/transcribe`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Transcribe failed");
  }
  return res.json();
}

/**
 * Generate a unique report ID in format AX-2026-XXXX
 */
function generateReportId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AX-2026-${timestamp}-${random}`;
}

/**
 * Generate SHA-256 hash for data integrity verification
 */
async function generateDigitalSignature(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate that all mandatory SOAP sections are populated
 */
function validateSOAPData(data: AssistantResponse): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!data.soapNote) {
    missing.push("SOAP Note is missing");
    return { valid: false, missing };
  }
  
  if (!data.soapNote.subjective?.trim()) missing.push("Subjective");
  if (!data.soapNote.objective?.trim()) missing.push("Objective");
  if (!data.soapNote.assessment?.trim()) missing.push("Assessment");
  if (!data.soapNote.plan?.trim()) missing.push("Plan");
  
  return { valid: missing.length === 0, missing };
}

export async function buildEMRPayload(data: AssistantResponse, clinicianId?: string): Promise<EMRExportPayload> {
  const reportId = generateReportId();
  const timestamp = new Date().toISOString();
  
  // Build the payload object (without signature first)
  const payloadData = {
    reportId,
    transcript: data.transcript,
    patientSummary: data.patientSummary,
    extracted: data.extracted,
    icdMappings: data.icdMappings,
    suggestedTreatments: data.suggestedTreatments,
    language: data.language,
    soapNote: data.soapNote,
    labTests: data.labTests,
    painAssessment: data.painAssessment,
    triageSeverity: data.triageSeverity,
    exportedAt: timestamp,
    exportedBy: clinicianId || "Unknown Clinician",
    finalized: true,
  };
  
  // Generate digital signature
  const dataString = JSON.stringify(payloadData);
  const digitalSignature = await generateDigitalSignature(dataString);
  
  return {
    ...payloadData,
    digitalSignature,
  };
}

/**
 * Export report to EMR with audit trail
 */
export async function exportToEMR(
  data: AssistantResponse,
  clinicianId?: string,
  clinicianName?: string
): Promise<ExportResponse> {
  // Validate SOAP data
  const validation = validateSOAPData(data);
  if (!validation.valid) {
    throw new Error(`SOAP validation failed. Missing: ${validation.missing.join(", ")}`);
  }
  
  // Build payload with signature
  const payload = await buildEMRPayload(data, clinicianId);
  
  // Send to backend for processing and audit trail creation
  const res = await fetch(`${BACKEND}/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payload,
      clinicianId: clinicianId || "CLI-DEFAULT-001",
      clinicianName: clinicianName || "Dr. Default Clinician",
    }),
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Export failed");
  }
  
  return res.json();
}

export function downloadJSON(filename: string, payload: EMRExportPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { validateSOAPData };
