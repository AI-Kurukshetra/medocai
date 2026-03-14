# Next.js Test Fixes

## Summary
- Updated Vitest config to exclude Playwright specs under `tests/` so unit tests don’t pick them up.
- Adjusted Playwright webServer binding to `127.0.0.1:3001` to avoid EPERM on `0.0.0.0:3000`.

## Files Changed
- `vitest.config.ts`
- `playwright.config.ts`

## Notes
- Playwright uses `PORT=3001` and `HOST=127.0.0.1` for the dev server via `webServer.env`.
- If you want a different port, update both `baseURL` and `webServer.env.PORT` in `playwright.config.ts`.

## Update (Vitest Include Tightening)
- `vitest.config.ts` now limits `include` to `src/**/*.{test,spec}.{ts,tsx,js,jsx}` to prevent any discovery under `node_modules`.
- Kept explicit excludes for `node_modules`, `tests/`, and `.next/`.

## Update (Host/Port + Vitest Include)
- Vitest now explicitly includes only `src/**/*.test.*` and `src/**/*.spec.*`, and excludes `node_modules`, `tests`, and `.next`.
- Playwright `webServer.command` now forces `--hostname 127.0.0.1 --port 3001` and sets `HOSTNAME` in env to avoid binding to `0.0.0.0` at runtime.
