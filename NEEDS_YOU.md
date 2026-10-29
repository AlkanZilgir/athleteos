# Things only you can do

Everything below is blocked on something I can't do for you — money, accounts,
or a real device. Pick them off in any order. The app already works without
any of them.

## Critical for shipping

- [ ] **Custom domain.** Point `athleteos.app` (or whatever you pick) at the
      static host. Update the canonical URL in `privacy.html` and `terms.html` once it's live.

## High value

- [ ] **Apple HealthKit / Google Fit import.** Web has no direct API for
      these. Two real options:
      1. Build a tiny native iOS shell that reads HealthKit and POSTs JSON
         to a new Supabase Edge Function. Needs $99/yr Apple Developer.
      2. CSV import — user exports from Apple Health, drops the file in
         Settings → Import. No native app required.
      Tell me which path you want and I'll wire the import side.
- [ ] **Push notifications with real delivery.** Generate VAPID keys
      (`npx web-push generate-vapid-keys`), store the public key in app
      config and the private key in a Supabase Edge Function. I'll wire the
      `PushManager.subscribe()` flow and a `send-push` function once you
      hand over the keys.
- [ ] **Email transactional flows.** Configure these templates in Supabase
      → Authentication → Email Templates (welcome, magic link, password
      reset already exist; we want a re-engagement email at +3 days idle).
      For non-auth emails (welcome content, weekly recap) we need an
      email provider — Resend has a free tier worth a look.
- [ ] **Apple Developer account** if you ever want a real Apple Watch app.
- [ ] **Discord / community channel** so paying users have somewhere to
      hang out and report bugs. I added the in-app feedback button, but a
      Discord URL in Settings would do a lot more.

## Polish (do whenever)

- [ ] **WebP screenshots.** `screen-home.png`, `screen-workout.png`,
      `screen-ai.png` could shrink ~75% as WebP. Run them through
      squoosh.app or `cwebp -q 80 in.png -o out.webp` and update the
      `<img src>` paths in `marketing.html`.
- [ ] **Replace the testimonial.** Right now the quote is from "Beta
      tester" — replace with a real customer name once you have one.
- [ ] **Get 10 real paying users.** This is the actual bottleneck. The
      product is more than ready. Pick one of: Indie Hackers post,
      r/Fitness "I built", X thread, lifting friend group chat. Charge
      from day 1.

## Already wired — don't redo

- ✅ Sentry (error tracking) — your key is in `index.html`
- ✅ PostHog (analytics) — your key is in `index.html`
- ✅ Lighthouse CI on PRs (workflows folder)
- ✅ Playwright smoke tests on PRs (set TEST_EMAIL/TEST_PASSWORD repo
     secrets if you want the logged-in tests to actually run)
- ✅ Service worker + offline write queue
- ✅ Pricing page · privacy.html · terms.html · plan library · in-journey
     Pro nudges
