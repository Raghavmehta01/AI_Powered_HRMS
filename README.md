# AI Powered HRMS

AI-powered interview platform for structured technical and behavioral assessments. Admins create shareable interview links; candidates complete video interviews with speech-to-text answers, automated scoring, and session reporting.

## Features

- **Admin dashboard** — Create interview links, view sessions, and review candidate results
- **Token-based interviews** — Secure `/interview/[token]` links for candidates
- **Video interviews** — Camera capture with optional proctoring
- **Speech-to-text** — Browser Web Speech API (default) with optional Deepgram
- **AI question generation** — Azure OpenAI streams contextual follow-up questions
- **Automated scoring** — Each answer scored 0–10 with reasoning via Azure OpenAI
- **Session persistence** — Interview history saved for admin review

## Tech stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **LLM:** Azure OpenAI (GPT-4o or your deployment)
- **Speech:** Web Speech API (default)
- **Storage:** Local JSON (`/data`) for sessions and interview links

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/Raghavmehta01/AI_Powered_HRMS.git
cd AI_Powered_HRMS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `LLM_PROVIDER` | Set to `azure` |
| `AZURE_ENDPOINT` | Azure OpenAI resource endpoint |
| `AZURE_API_KEY` | Azure OpenAI API key |
| `AZURE_MODEL` | Deployment name (exact match, no spaces) |
| `AZURE_API_VERSION` | API version (e.g. `2025-01-01-preview`) |
| `STT_PROVIDER` | `web-speech` (default) or `deepgram` |
| `ADMIN_PASSWORD` | Password for the admin dashboard |
| `NEXT_PUBLIC_BASE_URL` | Public app URL for generated interview links |
| `NEXT_PUBLIC_ENABLE_PROCTORING` | Set to `true` to enable proctoring |

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Admin:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Interview:** Use a link generated from the admin panel

## Project structure

```
app/
  admin/              Admin dashboard
  interview/[token]/  Candidate interview page
  api/
    interview/        Question generation (Azure)
    evaluate-answer/  Answer scoring (Azure)
    admin/            Link creation and session listing
    sessions/         Session save
components/
  VideoInterviewElevate.tsx   Main interview UI
  LandingPageElevate.tsx      Landing page
lib/
  azure.ts            Azure OpenAI client
  webSpeechAPI.ts     Browser speech recognition
  proctoring.ts       Proctoring monitor
  dataStore.ts        Session persistence
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
