/** Structured response from backend: STT + AI summarization + ICD/treatments */
export interface ExtractedItem {
  text: string;
  type: "vital" | "symptom" | "diagnosis";
}

export interface ICDMapping {
  code: string;
  description: string;
}

export interface SuggestedTreatment {
  name: string;
  notes?: string;
  purchase_url?: string;
  pharmacy_links?: {
    amazon?: string;
    walgreens?: string;
    cvs?: string;
    walmart?: string;
  };
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface LabTest {
  name: string;
  reason: string;
  urgency: "routine" | "urgent" | "stat";
}

export interface PainAssessment {
  scale: number; // 0-10
  location?: string;
  quality?: string;
}

export interface TriageSeverity {
  esi_level: number; // 1-5 (1=most urgent)
  urgency: "critical" | "emergent" | "urgent" | "less-urgent" | "non-urgent";
  red_flags: string[];
  time_to_provider: string;
  reasoning: string;
}

export interface MedicalHistory {
  previousVisits?: Array<{
    date: string;
    diagnosis: string;
    treatments: string[];
  }>;
  chronicConditions?: string[];
  allergies?: string[];
  currentMedications?: string[];
}

export interface AssistantResponse {
  /** Raw speech-to-text transcript */
  transcript: string;
  /** Patient-friendly summary (optionally translated) */
  patientSummary: string;
  /** Extracted vitals, symptoms, diagnoses with spans for highlighting */
  extracted: ExtractedItem[];
  /** ICD code mappings from NIH API */
  icdMappings: ICDMapping[];
  /** Suggested treatments */
  suggestedTreatments: SuggestedTreatment[];
  /** Language code used for summary */
  language: string;
  /** SOAP-formatted EMR note */
  soapNote?: SOAPNote;
  /** Recommended laboratory tests */
  labTests?: LabTest[];
  /** Pain assessment if applicable */
  painAssessment?: PainAssessment;
  /** Emergency triage severity (ESI 1-5) */
  triageSeverity?: TriageSeverity;
  /** Follow-up questions for clarification */
  followUpQuestions?: string[];
}

/** Payload for Export to EMR */
export interface EMRExportPayload {
  reportId: string; // Unique identifier (e.g., AX-2026-XXXX)
  transcript: string;
  patientSummary: string;
  extracted: ExtractedItem[];
  icdMappings: ICDMapping[];
  suggestedTreatments: SuggestedTreatment[];
  language: string;
  soapNote?: SOAPNote;
  labTests?: LabTest[];
  painAssessment?: PainAssessment;
  triageSeverity?: TriageSeverity;
  exportedAt: string; // ISO timestamp
  exportedBy?: string; // Clinician ID or name
  digitalSignature: string; // SHA-256 hash for integrity verification
  finalized: boolean; // State lock indicator
}

/** Audit trail entry for compliance */
export interface AuditTrailEntry {
  reportId: string;
  clinicianId: string;
  clinicianName: string;
  timestamp: string; // ISO timestamp
  action: string; // e.g., "Report finalized and exported to Axxess EMR"
  integrityStatus: "Pass" | "Fail"; // Verification status
  digitalSignature: string; // SHA-256 hash at time of export
}

/** Response from export endpoint */
export interface ExportResponse {
  success: boolean;
  reportId: string;
  digitalSignature: string;
  auditTrail: AuditTrailEntry;
  pdfUrl?: string; // Optional PDF download URL
  jsonUrl?: string; // Optional JSON download URL
}

export const SUPPORTED_LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
];
