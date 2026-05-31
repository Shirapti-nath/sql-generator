# Deploy PyForge on Vercel

PyForge’s frontend is designed to run on **Vercel only**. Python executes in the **browser** (Pyodide), including NumPy and Pandas. User accounts use **Vercel KV** for persistent storage.

## Prerequisites

- GitHub account
- [Vercel](https://vercel.com) account (free tier works)
- (Optional) [Anthropic API key](https://console.anthropic.com/) for AI Copilot

## 1. Push code to GitHub

```bash
cd pyforge/frontend
git init   # if not already in a repo
git add .
git commit -m "Prepare PyForge for Vercel"
git remote add origin https://github.com/YOUR_USER/pyforge.git
git push -u origin main
```

Or push the whole monorepo and set the **Root Directory** to `pyforge/frontend` in Vercel.

## 2. Import project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your GitHub repository.
3. Configure:
   - **Root Directory:** `pyforge/frontend` (if repo root is the monorepo)
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`

4. Do **not** deploy yet — add environment variables first.

## 3. Add Redis storage (required for sign-up / login)

Vercel’s file system is ephemeral — accounts need a database.

1. In your Vercel project → **Storage** → **Create** (or [Marketplace → Redis](https://vercel.com/marketplace?category=storage&search=redis)).
2. Create an **Upstash Redis** store (recommended) or legacy KV.
3. **Connect to Project** — Vercel injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (used by `@vercel/kv`).

Without Redis/KV connected, sign-up may appear to work once but users won’t persist.

## 4. Environment variables

In **Project → Settings → Environment Variables**, add:

| Variable | Required | Example |
|----------|----------|---------|
| `JWT_SECRET` | Yes | Random string, 32+ characters |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://your-app.vercel.app` (update after first deploy) |
| `ANTHROPIC_API_KEY` | No | For AI Copilot |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | No | Welcome emails |

`KV_REST_API_URL` and `KV_REST_API_TOKEN` come from the KV connection (step 3).

`NEXT_PUBLIC_FORCE_BROWSER` is set automatically at build time when `VERCEL=1`.

## 5. Deploy

Click **Deploy**. When finished, open the production URL.

Update `NEXT_PUBLIC_APP_URL` to your final URL (including custom domain), then **Redeploy**.

## 6. Custom domain (optional)

1. **Project → Settings → Domains**
2. Add `pyforge.yourdomain.com`
3. Add the DNS records Vercel shows at your registrar
4. Set `NEXT_PUBLIC_APP_URL=https://pyforge.yourdomain.com` and redeploy

## What works on Vercel

| Feature | Status |
|---------|--------|
| Playground editor | Yes |
| Run Python (browser / Pyodide) | Yes |
| NumPy, Pandas, Matplotlib (browser) | Yes (first run loads packages) |
| Error Guide, Learn tab, drills | Yes |
| Register / Login | Yes (with Vercel KV) |
| AI Copilot | Yes (with `ANTHROPIC_API_KEY`) |
| PyTorch / TensorFlow | No (browser limitation) |
| Server `/api/execute` with system Python | No (by design on Vercel) |

## Deploy from CLI

```bash
cd pyforge/frontend
npm i -g vercel
vercel login
vercel link
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_APP_URL
# Connect KV in dashboard, then:
vercel --prod
```

## Troubleshooting

**“Python not found” / execute API errors**  
Expected on Vercel. Use **Run** in the playground — execution should show mode **instant** (browser), not server.

**Sign-up works once then fails**  
Connect **Vercel KV** to the project and redeploy.

**Pyodide slow first run**  
First load downloads ~10MB from CDN; later runs are faster.

**Copilot timeout**  
Upgrade to Vercel Pro for longer function duration, or shorten prompts.

## Local development

```bash
cd pyforge/frontend
cp .env.example .env.local
npm install
npm run dev
```

Locally, `NEXT_PUBLIC_FORCE_BROWSER` is `0` — `/api/execute` uses system `python3` when you import heavy packages. For local KV testing, copy KV env vars from Vercel → Storage → your KV → `.env.local`.
