# Candid

An honest AI audit tool for designers' resumes and portfolios. Next.js port of the
original React prototype (`candid-app.jsx`).

**Live:** https://candiddesign.vercel.app

## Setup

```bash
npm install
cp .env.example .env.local   # then set ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Architecture

- **`app/page.jsx`** — the full Candid UI, ported verbatim from the prototype. The
  only change is that `runAudit` now POSTs the request to `/api/audit` instead of
  calling `api.anthropic.com` directly.
- **`app/api/audit/route.ts`** — server-side route handler. It attaches
  `ANTHROPIC_API_KEY` from the server environment and proxies the request to the
  Anthropic Messages API, so the key is never exposed to the browser. The upstream
  response is returned unchanged.

## Environment

| Variable            | Required | Notes                                              |
| ------------------- | -------- | -------------------------------------------------- |
| `ANTHROPIC_API_KEY` | yes      | Server-side only. Read in `app/api/audit/route.ts`. |
