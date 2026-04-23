# ResumeAI — AI-Powered Resume Analyzer

A full-stack web application for CS, AI, and Data Science professionals to analyze resumes, get ATS scores, build resumes from scratch, and receive AI-powered feedback.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| AI | Claude API (claude-sonnet-4-6) |
| Auth | JWT |
| PDF | jsPDF, html2canvas, pdf-parse, mammoth |

## Features

- **Resume Analyzer** — Upload PDF/DOCX, extract text, get AI analysis
- **ATS Score Engine** — 0–100 score across 5 dimensions
- **AI Suggestions** — Rewritten bullet points with action verbs + metrics
- **Resume Builder** — Form-based builder with live preview + PDF export
- **10 Templates** — 5 student + 5 professional, all ATS-optimized
- **Keyword Optimizer** — Domain-specific missing keywords
- **Job Description Matching** — Match score against a job posting
- **Domain Analysis** — Tailored for SWE, AI/ML, Data Science
- **User Dashboard** — History, past analyses, edit/delete resumes

## Project Structure

```
resume-analyzer/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── pages/     # Home, Login, Register, Dashboard, Analyzer, Builder, Templates, AnalysisReport
│   │   ├── components/ # Navbar, ScoreGauge
│   │   ├── store/     # Zustand auth store
│   │   └── utils/     # API client
│   └── public/
└── backend/           # Express API
    ├── src/
    │   ├── models/    # User, Resume, Analysis (Mongoose)
    │   ├── routes/    # auth, resumes, analysis, templates
    │   ├── controllers/
    │   ├── services/  # ai.service.js, pdf.service.js
    │   ├── middleware/ # auth, upload (multer)
    │   └── utils/     # prompts.js (AI prompt engineering)
    └── uploads/       # Uploaded resume files
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- Anthropic API key (console.anthropic.com)

### 1. Clone and install

```bash
# Install backend deps
cd resume-analyzer/backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resume-analyzer
JWT_SECRET=your-random-32-char-string
ANTHROPIC_API_KEY=sk-ant-your-key-here
FRONTEND_URL=http://localhost:5173
```

### 3. Run the backend

```bash
cd backend
npm run dev   # uses nodemon
# Server starts at http://localhost:5000
```

### 4. Run the frontend

```bash
cd frontend
npm run dev
# App starts at http://localhost:5173
```

## AI Prompt Engineering

The system uses carefully engineered prompts in `backend/src/utils/prompts.js`:

### Resume Analysis Prompt

```
System: "You are an expert ATS analyzer..."
User prompt includes:
  - Full resume text
  - Target domain (SWE / AI-ML / Data Science)
  - Domain-specific keywords list
  - Optional job description
  
Returns JSON with:
  - atsScore (0-100)
  - scoreBreakdown (5 dimensions)
  - strengths, weaknesses
  - missingKeywords
  - suggestions (before/after)
  - improvedBullets
  - domainAnalysis
  - aiGeneratedSummary
  - jobDescriptionMatch (if JD provided)
```

### Scoring Dimensions

| Dimension | Max Points | What's Checked |
|-----------|-----------|----------------|
| Keywords | 25 | Domain-specific terms, industry vocabulary |
| Formatting | 20 | Section clarity, bullet points, length |
| Completeness | 20 | All key sections present |
| Experience Clarity | 20 | Action verbs, quantifiable metrics, STAR method |
| Skills Relevance | 15 | Skills match for chosen domain |

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
# Set VITE_API_URL env var to your backend URL
```

### Backend → Render / Railway

1. Push to GitHub
2. Create a new Web Service on Render
3. Set environment variables from `.env`
4. Build command: `npm install`
5. Start command: `npm start`

### Database → MongoDB Atlas

1. Create free cluster at mongodb.com/atlas
2. Add connection string to `MONGODB_URI`
3. Whitelist your backend server IP

## API Endpoints

```
POST /api/auth/register     — Create account
POST /api/auth/login        — Sign in
GET  /api/auth/me           — Get current user

POST /api/resumes/upload    — Upload PDF/DOCX
POST /api/resumes/build     — Save builder resume
GET  /api/resumes           — List all resumes
GET  /api/resumes/:id       — Get single resume
PUT  /api/resumes/:id       — Update builder resume
DELETE /api/resumes/:id     — Delete resume

POST /api/analysis/analyze  — Run AI analysis
GET  /api/analysis/history  — Past analyses
GET  /api/analysis/:id      — Get analysis report
POST /api/analysis/improve-bullets — Improve bullet points

GET  /api/templates         — List templates
POST /api/templates/save    — Save template to profile
```

## Security

- Passwords hashed with bcryptjs (12 rounds)
- JWT authentication on all protected routes
- File upload validation (PDF/DOCX only, max 10MB)
- Rate limiting: 100 req/15min global, 10 req/min for AI endpoints
- Helmet.js security headers
- CORS restricted to frontend origin
- API keys in environment variables only
