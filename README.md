# MicroBiz Card Management

Frontend-only Vite + React implementation for MicroBiz internal card operations.

Start with `BUILD.md`, then follow `docs/phases/` in order.

For every frontend build, review all supplied assets in `public/references/` and
the loading asset in `public/assets/`. Follow the design-reference and shared
component contract in `BUILD.md` and Phase 01. Phase 03 audit results are recorded
in `docs/phases/PHASE-03-INVENTORY.md`.

## Local run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Customer lookup and issuance demo

Search for `Musa` in Customer Lookup, open his profile and choose **Issue card**.
Select the Business account and card `S4D5681-P3`, then review and confirm.
Demo issuance updates inventory, linked cards, dashboard and issuance history
in memory; reloading resets it. PIN setup and production APIs are not connected.

Run `npm test` for domain tests. See `docs/phases/PHASE-04-ISSUANCE.md` for the
implemented scope and optional Chromium browser checks.

## Phase 07 frontend

Open the app and choose **Enter demo workspace**. Reloading or **End demo** resets
the in-memory session and sample operations. No staff credentials are needed.

Production builds default to API mode and keep staff access closed until an
approved adapter is connected. For a demonstration build, use
`VITE_DATA_MODE=demo npm run build`. See `.env.example` and
[the integration handoff](docs/API-INTEGRATION.md) for configuration and remaining
backend work. Design reference sheets are excluded from new build output.

## Phase 08 release checks

`npm run verify:release` runs the domain suite and verifies API/demo builds,
asset isolation and configuration validation in temporary output folders.
With Vite running and Playwright available, run
`PLAYWRIGHT_MODULE=/path/to/playwright npm run test:browser` for the Chromium
workflow, responsive, keyboard, session and failure-state suites.

See [release handoff](docs/RELEASE.md) for build/hosting instructions and remaining
backend, cross-browser and manual accessibility sign-off.
