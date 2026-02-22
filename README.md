# A Diagnostic Assistant

A pediatric-focused Diagnostic Assistant that captures clinician–patient conversations and turns them into structured data, diagnoses, and patient-friendly insights. The UI shows raw speech-to-text on the left and a translated, color-coded summary on the right, with Export to EMR as a JSON payload.

- **Frontend**: Next.js (React), MediaRecorder API for audio, side-by-side layout with color-coded vitals/symptoms/diagnoses and language toggle.
- **Backend**: FastAPI (Python) with optional C++ (whisper.cpp). Local Whisper for STT, Ollama (LLaMA 3) for summarization, NIH Clinical Table Search for ICD-10-CM mapping.
