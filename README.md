# A Diagnostic Assistant

A pediatric-focused Diagnostic Assistant that captures clinician–patient conversations and turns them into structured data, diagnoses, and patient-friendly insights. The UI shows raw speech-to-text on the left and a translated, color-coded summary on the right, with Export to EMR as a JSON payload.

## Architecture

- **Frontend**: Next.js (React), MediaRecorder API for audio, side-by-side layout with color-coded vitals/symptoms/diagnoses and language toggle.
- **Backend**: FastAPI (Python) with optional C++ (whisper.cpp). Local Whisper for STT, Ollama (LLaMA 3) for summarization, NIH Clinical Table Search for ICD-10-CM mapping.

## Prerequisites

- Node.js 18+
- Python 3.10+
- [Ollama](https://ollama.ai) installed and running with a model (e.g. `ollama run llama3.2`)
- **Speech-to-text** (one of):
  - **Option A**: OpenAI Whisper (Python) — see [Optional: Install Whisper](#optional-install-whisper) below.
  - **Option B**: whisper.cpp built locally; set env `WHISPER_CPP_PATH` to the directory containing the `main` binary.

## Quick Start

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Without Whisper or whisper.cpp, `/transcribe` will return 503 until an STT engine is configured. The rest of the API (e.g. `GET /health`) works.

**Optional env vars**

- `OLLAMA_URL` — default `http://localhost:11434`
- `WHISPER_CPP_PATH` — path to whisper.cpp build (disables Python Whisper)
- `WHISPER_MODEL` — OpenAI Whisper model: `base` (default), `small`, `medium`, `large`

### Implementing the OpenAI Whisper backend

1. **Activate the backend venv** (if not already):
   ```bash
   cd backend
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   ```

2. **Install setuptools and wheel** (needed for the Whisper build):
   ```bash
   pip install setuptools wheel
   ```

3. **Install OpenAI Whisper** (use `--no-build-isolation` to avoid build errors):
   ```bash
   pip install --no-build-isolation openai-whisper==20231117
   ```
   This pulls in Whisper and its dependencies (e.g. PyTorch, so it may take a few minutes).

4. **Optional: pick the model size** via env before starting the server:
   - `base` (default) — fastest, good for most use.
   - `small` — better accuracy, more RAM.
   - `medium` / `large` — best accuracy, most RAM and slower.
   ```bash
   export WHISPER_MODEL=small   # optional
   uvicorn main:app --reload --port 8000
   ```

5. **Verify**: Start the backend and call `POST /transcribe` with an audio file; you should get a `transcript` in the JSON response. Do **not** set `WHISPER_CPP_PATH` if you want to use this Python Whisper backend.

### 2. Frontend

```bash
# from project root
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Allow microphone access, click the mic to record, then stop to get transcription and AI summary. Use **Export to EMR** to download the structured JSON.

## Features

- **Side-by-side layout**: Clinician view (STT) left, patient view (summary + extracted items + ICD + treatments) right.
- **Color-coded highlights**: Vitals (green), symptoms (amber), diagnoses (blue) with 0.3s fade-in.
- **Language toggle**: Header dropdown for real-time language preference (summary/UI intent).
- **Animations**: Recording pulse, auto-scroll and fade-in for new sentences, skeleton loader while processing, export button scale + success checkmark.
- **Export to EMR**: Compiles transcript, summary, extracted items, ICD mappings, and suggested treatments into a JSON file for EMR integration.

## API

- `POST /transcribe`: `multipart/form-data` with `audio` (file) and `language` (string). Returns JSON with `transcript`, `patientSummary`, `extracted`, `icdMappings`, `suggestedTreatments`, `language`.
- `GET /health`: Health check.

## Security Note

This app is designed for use in controlled environments (e.g. UTSW). Ensure proper access control, HTTPS, and compliance with institutional policies before handling real PHI.
