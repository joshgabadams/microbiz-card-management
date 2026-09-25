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
