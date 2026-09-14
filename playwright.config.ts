import { defineConfig, devices } from '@playwright/test'

// Unlike `next dev` (which loads .env.local natively), this config file runs
// as a plain Node script — without this, SITE_PASSWORD_USER/SITE_PASSWORD
// below are undefined unless manually exported into the shell first, every
// request 401s against the site-wide Basic Auth gate (src/middleware.ts),
// and every test silently runs against that 401 page instead of real
// content. Exactly the failure mode hit re-running scripts/a11y-audit.mjs
// without exported credentials — see "RERUN ACCESSIBILITY TESTING" audit,
// 2026-09-13. Guarded in case .env.local doesn't exist (e.g. CI, which
// injects real env vars directly instead).
try {
  process.loadEnvFile('.env.local')
} catch {}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // The shop carousel's auto-rotate skips itself under
    // prefers-reduced-motion (see tile-carousel.tsx) — without this, its
    // 6s timer can advance the carousel mid-keyboard-interaction and make
    // Journey E's arrow-key assertions flaky. (This version of
    // @playwright/test's `use` only accepts BrowserContextOptions like
    // this one nested under contextOptions, not flattened — see
    // node_modules/playwright/types/test.d.ts.)
    contextOptions: { reducedMotion: 'reduce' },
    // Playwright's real Basic Auth support (not embedded-URL credentials,
    // which break in-page fetch() calls) — see scripts/a11y-audit.mjs for
    // the same pattern. Omitted entirely once the pre-launch gate is
    // removed (both env vars gone), so this config keeps working after
    // public launch without editing.
    ...(process.env.SITE_PASSWORD_USER && process.env.SITE_PASSWORD
      ? {
          httpCredentials: {
            username: process.env.SITE_PASSWORD_USER,
            password: process.env.SITE_PASSWORD,
          },
        }
      : {}),
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
})
