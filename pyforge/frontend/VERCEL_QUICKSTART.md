# PyForge — Vercel quick start (do this now)

Your code is on GitHub: **https://github.com/Shirapti-nath/pyforge**

## Step 1 — Log in to Vercel (one time)

Open a terminal in `pyforge/frontend` and run:

```bash
npx vercel login
```

Complete the browser sign-in when prompted.

## Step 2 — Import from GitHub (recommended)

1. Open **https://vercel.com/new**
2. Import **`Shirapti-nath/pyforge`**
3. Leave **Root Directory** as `.` (repo root is the Next.js app)
4. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   |------|--------|
   | `JWT_SECRET` | Paste a long random string (32+ chars) |
   | `NEXT_PUBLIC_APP_URL` | `https://pyforge.vercel.app` (change after deploy to your real URL) |

5. Click **Deploy**

## Step 3 — Add Redis (required for accounts)

1. In the Vercel project → **Storage** → **Create** → **Upstash Redis**
2. **Connect** it to this project (adds `KV_REST_API_URL` + `KV_REST_API_TOKEN`)
3. **Redeploy** (Deployments → … → Redeploy)

## Step 4 — Fix app URL

1. Copy your live URL (e.g. `https://pyforge-xxx.vercel.app`)
2. **Settings → Environment Variables** → set `NEXT_PUBLIC_APP_URL` to that URL
3. **Redeploy** again

## Step 5 — Test

- Open `/playground`
- Run: `print("hello world")`
- Try sign-up at `/register`

## Optional — CLI deploy

```bash
cd pyforge/frontend
npx vercel login
chmod +x scripts/vercel-deploy.sh
./scripts/vercel-deploy.sh
```

## Optional — AI Copilot

Add `ANTHROPIC_API_KEY` in Vercel env vars and redeploy.
