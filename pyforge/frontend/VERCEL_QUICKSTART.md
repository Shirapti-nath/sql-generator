# PyForge — deploy to Vercel (do these steps now)

Code is committed locally on branch `main`. Choose **A** (fastest) or **B** (GitHub auto-deploy).

---

## A. Deploy from your Mac (no GitHub push needed)

Open Terminal:

```bash
cd /Users/shiraptinath/Desktop/Project/pyforge/frontend

# 1) Log in to Vercel (browser opens)
npx vercel login

# 2) First deploy (answer prompts: link to your Vercel account, project name "pyforge")
npx vercel

# 3) Production deploy
npx vercel --prod
```

When `vercel` asks for settings, accept defaults (Next.js).

### Set environment variables (Vercel dashboard)

Open **https://vercel.com** → your **pyforge** project → **Settings** → **Environment Variables**:

| Name | Value |
|------|--------|
| `JWT_SECRET` | Run locally: `openssl rand -base64 32` and paste result |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://pyforge.vercel.app` |

### Add Redis (required for sign-up)

1. Project → **Storage** → **Create** → **Upstash Redis**
2. **Connect** to this project
3. **Deployments** → latest → **⋯** → **Redeploy**

### Fix URL after first deploy

Copy the live URL from **Deployments** → **Visit**, put it in `NEXT_PUBLIC_APP_URL`, then **Redeploy**.

---

## B. Deploy via GitHub (auto-deploy on every push)

### 1. Push code (run in Terminal)

```bash
cd /Users/shiraptinath/Desktop/Project
git push origin main
```

If you prefer a new repo named `pyforge`, create it on https://github.com/new then:

```bash
git remote add pyforge https://github.com/Shirapti-nath/pyforge.git
git push pyforge main
```

### 2. Import on Vercel

1. Open **https://vercel.com/new**
2. Import your repository (`sql-generator` or `pyforge`)
3. **Root Directory:** click Edit → set to `pyforge/frontend`
4. Add env vars (same table as above) **before** Deploy
5. Click **Deploy**
6. Add **Upstash Redis** (Storage) → Connect → Redeploy

---

## After deploy — quick test

1. Open `https://YOUR-URL.vercel.app/playground`
2. Run: `print("hello world")`
3. Register at `/register` (needs Redis connected)

---

## Optional: AI Copilot

Add `ANTHROPIC_API_KEY` in Vercel env vars → Redeploy.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Sign-up fails / users disappear | Connect Upstash Redis and redeploy |
| Run shows server error | Normal on Vercel — code runs in browser (status: **instant**) |
| `vercel login` hangs | Open the URL it prints and approve in browser |

Full docs: [DEPLOY.md](./DEPLOY.md)
