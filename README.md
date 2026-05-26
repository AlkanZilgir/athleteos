# AthleteOS

A personal fitness PWA — workouts, nutrition, sleep, body composition, and an AI coach. Single-page app, offline-capable, installs to your home screen.

## Stack

- **Frontend**: plain HTML/CSS/JS — no framework, no build step.
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions).
- **AI**: Pollinations.AI (free, no SLA) via fetch.
- **Charts**: Chart.js (lazy-loaded).
- **Payments**: Stripe (edge functions deployed).
- **Hosting**: any static host (Netlify / Cloudflare Pages / Vercel — all free).

## Run locally

```bash
# any of these — the app is plain static files
npx http-server -p 5173 -o
# or
python -m http.server 5173
# or
npm run dev
```

Visit `http://localhost:5173/` for the app, `http://localhost:5173/marketing.html` for the landing page.

## Deploy

The app is static. Drag-and-drop the project folder (minus `tests/`, `node_modules/`, `playwright.config.js`, `package.json`) to:

- **Cloudflare Pages**: pages.cloudflare.com → "Direct upload"
- **Netlify**: app.netlify.com → drag a zip
- **Vercel**: `npx vercel`

After deploying, **set Supabase Auth redirect URL** to your live domain (Supabase Dashboard → Authentication → URL Configuration).

## Tests

```bash
npm install                 # installs Playwright + http-server
npx playwright install      # downloads chromium
npm test                    # runs the smoke spec
```

Smoke test verifies the marketing page loads and the auth screen renders without console errors. The sign-in test is skipped unless you set `TEST_EMAIL` / `TEST_PASSWORD` env vars to a pre-existing Supabase test account.

## Ship checklist — what's wired vs what needs your config

Code-level — already wired:
- [x] Marketing landing page (`marketing.html`)
- [x] Light/Dark theme + Forge/Cool/Purple/Pink accent variants
- [x] Empty-state SVG illustrations
- [x] Password reset (email link + recovery flow)
- [x] Export-my-data (JSON download)
- [x] PR share-to-story (1080×1080 PNG via Web Share API)
- [x] Onboarding tooltips
- [x] iOS install hint card
- [x] AI rate limit (20 msg / 10 min)
- [x] Cross-device prefs sync (theme/accent/pinned to Supabase)
- [x] Accessibility — keyboard nav + roles + landmarks
- [x] AI safety hardening (refuses medical advice)
- [x] AI retry + offline fallback messaging
- [x] Cookie consent banner (EU only)
- [x] Google OAuth button (calls supabase.auth.signInWithOAuth)
- [x] Stripe Checkout + Customer Portal (edge functions live)
- [x] Sentry bootstrap (lazy-loaded)
- [x] Plausible bootstrap (cookie-consent gated)
- [x] Service Worker w/ Background Sync, scheduled reminders, weekly digest

Needs your config (free):

| Step | Where | Time |
|------|-------|------|
| Paste Sentry DSN | `app.js` → `SENTRY_DSN` | 5 min — create project at [sentry.io](https://sentry.io) |
| Paste Plausible domain | `app.js` → `PLAUSIBLE_DOMAIN` | 5 min — register domain at [plausible.io](https://plausible.io) |
| Enable Google OAuth | Supabase Dashboard → Authentication → Providers → Google | 10 min — needs a Google Cloud OAuth client (free) |
| Add Stripe keys | Supabase Dashboard → Functions → Secrets | 5 min — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs |
| Add real screenshots | drop `screen-home.png`, `screen-workout.png`, `screen-ai.png` into the folder | 5 min |
| Set Supabase Auth redirect URL | Supabase Dashboard → Auth → URL Configuration | 2 min after deploy |
| Configure email templates | Supabase Dashboard → Auth → Email Templates | 10 min — at least replace the password-reset template subject |

Needs your money (skipped):
- Apple Developer Program ($99/yr) — required for App Store, Apple Sign In Service ID, and any iOS-native path
- Custom domain (~$10/yr at any registrar)

Not done (out of scope, multi-session):
- Full test suite (only smoke test exists)
- Modularize `app.js` (still a 5000-line monolith)
- Apple Watch / native iOS
- Form-check AI from video
- Internationalization (English-only)

## File structure

```
.
├── index.html          # the app
├── marketing.html      # public landing page
├── app.css             # all styles
├── app.js              # all JS — ~5,500 lines
├── sw.js               # service worker (caching, notifications, sync)
├── manifest.json       # PWA manifest
├── icon-192.png        # PWA icons
├── icon-512.png
├── package.json        # for Playwright + http-server (not the app itself)
├── playwright.config.js
└── tests/
    └── smoke.spec.js
```

`app.js` is structured by section — search for `/* ── SECTION ──` to jump around.

## Service worker cache

Bump `CACHE` in `sw.js` (currently `athleteos-v39`) any time you edit `index.html`, `app.css`, or `app.js`. The SW uses skipWaiting + clients.claim so users get the new bundle on their next reload.

## Contact

[alkanzilgir@gmail.com](mailto:alkanzilgir@gmail.com)
