# QA Run Results (2026-03-14)

## Scope
- Lint: `npm run lint`
- Unit tests: `npm run test` (Vitest)
- E2E tests: `npm run test:e2e` (Playwright)

## Environment
- Local run in repo root
- Dependencies installed via `npm install`

## Results Summary
- Lint: PASS
- Unit tests: FAIL (Vitest picked up Playwright spec)
- E2E: FAIL (web server could not bind to 0.0.0.0:3000 in sandbox)

## Detailed Failures
1. **Unit tests (Vitest)**
   - Failure: `tests/smoke.spec.ts` executed under Vitest
   - Error: "Playwright Test did not expect test() to be called here"
   - Repro:
     1. Run `npm run test`
     2. Observe failure in `tests/smoke.spec.ts`
   - Likely cause: Playwright test file is in a path/pattern picked up by Vitest (`tests/**/*.spec.ts`).
   - Suggested fix: Move Playwright specs to `e2e/` or `tests/e2e/` and exclude from Vitest, or configure Vitest include pattern to avoid Playwright specs.

2. **E2E tests (Playwright)**
   - Failure: Web server failed to start
   - Error: `listen EPERM: operation not permitted 0.0.0.0:3000`
   - Repro:
     1. Run `npm run test:e2e`
     2. Playwright webServer fails to bind to 0.0.0.0:3000
   - Likely cause: sandbox restrictions on binding to 0.0.0.0 or port 3000.
   - Suggested fix: configure Playwright webServer to bind to `127.0.0.1` and/or a different port; or run with escalated permissions.

## Notes / Blockers
- Auth is reportedly being migrated to real Supabase, and migrations are being applied by another agent. This QA run did not validate database migrations or live auth because those changes were not available in this run.

## Next Steps
- Adjust Vitest config or test file locations to prevent Playwright tests from being executed by Vitest.
- Adjust Playwright `webServer` host/port and re-run `npm run test:e2e`.
- Re-run QA after Supabase auth and migrations are confirmed applied.

---

# QA Run Results (2026-03-14) - Rerun After Requested Fixes

## Scope
- Lint: `npm run lint`
- Unit tests: `npm run test` (Vitest)
- E2E tests: `npm run test:e2e` (Playwright)

## Environment
- Local run in repo root
- Used existing `node_modules`

## Results Summary
- Lint: PASS
- Unit tests: FAIL (Vitest still picked up Playwright spec)
- E2E: FAIL (web server could not bind to 0.0.0.0:3000)

## Detailed Failures
1. **Unit tests (Vitest)**
   - Failure: `tests/smoke.spec.ts` executed under Vitest
   - Error: "Playwright Test did not expect test() to be called here"
   - Repro:
     1. Run `npm run test`
     2. Observe failure in `tests/smoke.spec.ts`
   - Likely cause: Playwright test file still matches Vitest include pattern.
   - Suggested fix: Move Playwright specs to `e2e/` (or similar) and update Vitest include/exclude. Alternatively rename to `*.e2e.spec.ts` and exclude that glob from Vitest.

2. **E2E tests (Playwright)**
   - Failure: Web server failed to start
   - Error: `listen EPERM: operation not permitted 0.0.0.0:3000`
   - Repro:
     1. Run `npm run test:e2e`
     2. Playwright webServer fails to bind to 0.0.0.0:3000
   - Likely cause: webServer host is set to `0.0.0.0` and restricted in this environment.
   - Suggested fix: configure Playwright `webServer` to bind to `127.0.0.1` and/or change port to a safer value (e.g., 3100). Re-run after config change.

## Notes / Blockers
- Supabase migrations and seed application not verified in this run.
- Auth integration changes were not validated in these tests due to the same test harness failures.

## QA Run (2026-03-14)

Commands:
- `npm run lint`
- `npm run test`
- `npm run test:e2e`

Results:
- `npm run lint`: PASS
- `npm run test`: FAIL — Vitest is running `node_modules` test suites. Failures include `tsconfig-paths`, `next` telemetry tests, and `entities` package imports. This indicates Vitest include/exclude settings are too broad and should exclude `node_modules` test files.
- `npm run test:e2e`: FAIL — Playwright web server failed to bind: `listen EPERM 0.0.0.0:3001`. WebServer config is still binding to `0.0.0.0` despite earlier intended `127.0.0.1`.

Notes:
- No dependency install was required; tests executed with existing `node_modules`.
- Recommend adjusting `vitest.config.ts` to restrict to `src/**/*.test.*` (or a dedicated `tests/unit` folder) and ensure `exclude: ["node_modules", "tests/**"]` is applied.
- Update `playwright.config.ts` to set `webServer.host: "127.0.0.1"` and ensure it is not overridden by env or dev server defaults.

---

# QA Run Results (2026-03-14) - After Config Fixes

## Scope
- Lint: `npm run lint`
- Unit tests: `npm run test` (Vitest)
- E2E tests: `npm run test:e2e` (Playwright)

## Environment
- Local run in repo root
- Used existing `node_modules`

## Results Summary
- Lint: PASS
- Unit tests: FAIL (no test files found)
- E2E: FAIL (web server could not bind to 127.0.0.1:3001)

## Detailed Failures
1. **Unit tests (Vitest)**
   - Failure: No test files found
   - Error: `No test files found, exiting with code 1`
   - Repro:
     1. Run `npm run test`
     2. Observe zero tests matched
   - Likely cause: Include pattern is limited to `src/**/*.test.*` and `src/**/*.spec.*`, but there are no unit tests yet.
   - Suggested fix: Add at least one unit test or relax include patterns when ready.

2. **E2E tests (Playwright)**
   - Failure: Web server failed to start
   - Error: `listen EPERM: operation not permitted 127.0.0.1:3001`
   - Repro:
     1. Run `npm run test:e2e`
     2. Playwright webServer fails to bind to 127.0.0.1:3001
   - Likely cause: Sandbox restrictions on binding to local ports.
   - Suggested fix: Run E2E locally outside sandbox or request escalated permissions for port binding.

## Notes
- No dependency install was required; tests executed with existing `node_modules`.
- If you want tests to pass in CI here, we can add a basic unit test and configure Playwright to use an externally started server.
