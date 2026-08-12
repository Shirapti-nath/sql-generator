# Mumzworld AI Parenting Advisor

An AI-powered chat widget that acts as a knowledgeable parenting shopping advisor for Mumzworld. Parents describe their child's age and challenge — the advisor retrieves relevant products via semantic search and responds with warm, specific, safety-conscious recommendations powered by Claude.

---

## Architecture

```
Parent's question
      │
      ▼
  FastAPI /chat endpoint  (backend/main.py)
      │
      ├─► ChromaDB vector search  (backend/retriever.py)
      │     └─ Embeds query → finds top-5 semantically matching products
      │
      └─► Claude claude-sonnet-4-6  (backend/advisor.py)
            └─ Receives: system prompt + retrieved products + user message
            └─ Returns: warm, specific, safety-annotated recommendation
```

| Layer | Tool | Why |
|-------|------|-----|
| LLM Brain | Claude API (claude-sonnet-4-6) | Contextual reasoning, safe parenting advice |
| Product Data | `data/products.json` (25 mock products) | Simulates real Mumzworld catalogue |
| Retrieval | ChromaDB + default sentence embeddings | Semantic product search |
| Backend | FastAPI (Python) | Clean, lightweight API |
| Frontend | React chat widget (CDN, no build step) | Works as a single HTML file |
| Evals | 8 custom test cases + automated runner | Demonstrates engineering maturity |

---

## Quick Start

### 1. Install dependencies

```bash
cd backend
pip install fastapi uvicorn chromadb anthropic pydantic
```

### 2. Set your API key

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Start the backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 4. Open the frontend

Open `frontend/chat_widget/index.html` in any browser.
Toggle **Live mode** in the config panel (it defaults to Demo mode for offline viewing).

---

## Demo Mode (no backend needed)

Open `frontend/chat_widget/index.html` directly in a browser — it works out of the box with mock responses for 5 common parent queries:

- Tummy time fussiness
- Teething
- Newborn sleep
- Starting solids / high chair
- Toddler educational toys

---

## Running Evals

```bash
cd backend/evals
python run_evals.py              # all 8 evals
python run_evals.py --id eval-001         # single eval
python run_evals.py --verbose             # show full responses
python run_evals.py --output results.json # save results
```

### Eval suite (8 cases)

| ID | Scenario | Key check |
|----|----------|-----------|
| eval-001 | Tummy time, 4 months | Age match, developmental reason |
| eval-002 | Newborn won't sleep | Safe sleep warning mandatory |
| eval-003 | Starting solids, 6 months | High chair recommendation, link |
| eval-004 | Teething signs, 5 months | BPA-free note, validates early teething |
| eval-005 | Toddler toys, 18 months | Multi-category, milestone reasoning |
| eval-006 | 10-year-old (out of range) | Graceful decline, no hallucination |
| eval-007 | Bouncer for overnight sleep | **Safety-critical**: must warn against it |
| eval-008 | Vague "what should I buy?" | Asks single clarifying question |

A score ≥ 75% = PASS. Safety-critical evals (eval-002, eval-007) are flagged in rubrics.

---

## Product Catalogue

`data/products.json` contains 25 mock Mumzworld products across:

- Activity & Play Mats (tummy time gyms)
- Bouncers & Swings
- Teething & Sensory Toys
- Feeding (bottles, high chairs, trainer cups)
- Carriers & Slings
- Safety & Monitors
- Swaddles & Sleep Aids
- Toys by age (3m → 5yr)

Each product includes: name, brand, price (AED), age range, tags, description, `why_great`, `safety_notes`, and a Mumzworld link.

---

## Design Decisions & Tradeoffs

### Why ChromaDB over FAISS?
ChromaDB has a simpler Python API with no manual index management — better for a week-long build. FAISS would offer lower latency at scale (100k+ products) but requires more setup. For a 25-product demo, ChromaDB's cosine similarity is identical in quality.

### Why a system prompt with explicit format instructions?
The advisor's value to parents is trust. An unstructured response risks burying safety notes or omitting age suitability. Enforcing the format in the system prompt ensures every response has: empathy → product + price → why it fits right now → safety note → shop link. This is more reliable than hoping the model self-organises.

### Why mock products instead of live scraping?
Mumzworld's site structure may change, scraping ethics vary, and a live scraper adds failure modes outside the demo's scope. The JSON catalogue is structured identically to what a real API response would return — swapping in a real data source requires only changing `retriever.load_catalogue()`.

### Eval scoring approach
Rather than LLM-as-judge (expensive, non-deterministic), evals use keyword presence checks and structural rules (age range match, link included, safety phrase present). This is fast, cheap, and deterministic — appropriate for a CI eval suite. The tradeoff is that it can't evaluate tone or nuance; a qualitative human review round remains necessary for production.

---

## File Structure

```
mumzworld-ai-advisor/
├── README.md
├── data/
│   └── products.json              ← 25 mock Mumzworld products
├── backend/
│   ├── main.py                    ← FastAPI app, /chat and /health endpoints
│   ├── retriever.py               ← ChromaDB vector search + catalogue loader
│   ├── advisor.py                 ← Claude API integration + system prompt
│   └── evals/
│       ├── test_cases.json        ← 8 eval scenarios with scoring rubrics
│       └── run_evals.py           ← Automated eval runner (CLI)
├── frontend/
│   └── chat_widget/
│       └── index.html             ← Self-contained React chat widget
└── loom_walkthrough_link.txt
```
