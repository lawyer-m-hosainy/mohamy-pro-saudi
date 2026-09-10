# E2E tests

Playwright tests that drive a real browser against a real Supabase project —
unlike the `vitest` unit suite, these are not mocked and actually write data.

## Why they need a pre-existing account

Signing up a fresh account per run (like a typical E2E suite would) isn't
reliable here because whether the resulting account can sign in immediately
depends on that Supabase project's own Auth setting for email confirmation,
which this repo doesn't control and can vary per environment. Rather than a
flaky test that sometimes hangs waiting on a confirmation email, the suite
expects one already-confirmed test account to exist and reuses it.

## One-time setup

1. In the target Supabase project, sign up a test account (via the app's own
   "إنشاء حساب جديد" flow, or the Supabase dashboard) and confirm its email
   if required. `AuthProvider` (`src/components/AuthProvider.tsx`) auto-
   provisions its own new tenant and a `users` row with the `مدير مكتب`
   (full access) role on first login, so no extra setup is needed beyond
   that — the test data it creates lives in its own isolated tenant and
   never touches anyone else's.
2. Set `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` for that account, and
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` for that project, in your
   `.env` (local) or as CI secrets.
3. Install the browser binaries once: `npx playwright install --with-deps chromium`.

## Running

```
npm run test:e2e
```

Without `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` set, the suite skips (not
fails) — safe to run in an environment that hasn't been configured yet.

`playwright.config.ts` starts `npm run dev` automatically unless
`PLAYWRIGHT_BASE_URL` is set (point it at an already-running instance,
e.g. a preview deployment, to test against that instead).

## What it covers

`core-flow.spec.ts`: login → create a client → open a case for them → issue
an invoice. This is the platform's basic sellable path — it existing and
staying green is a stronger signal than the unit suite alone, which mocks
Supabase and can't catch an RLS policy or a form wired to the wrong field.

## Not wired into CI by default

Same reasoning as `.github/workflows/backup.yml`: this needs real secrets
(`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`) that aren't provisioned automatically. Once you've
set up a test account and added those as repository secrets, enable
`.github/workflows/e2e.yml` by removing its early guard (see the comment at
the top of that file) or just trigger it manually via `workflow_dispatch`.
