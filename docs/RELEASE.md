# Frontend release handoff

The frontend has passed the Phase 08 Chromium and build checks. The live banking
release remains dependent on the API/identity work listed in `API-INTEGRATION.md`.

## Build and review

1. Run `npm run verify:release`. It runs domain tests, creates isolated API/demo
   builds, checks emitted assets and fixture separation, and verifies invalid
   settings are rejected. It prints the temporary artifact directory for review.
2. Start `npm run dev`; run the optional browser suites with
   `PLAYWRIGHT_MODULE=/path/to/playwright npm run test:browser`.
3. For a release artifact, use `VITE_DATA_MODE=api npm run build` with reviewed
   environment settings. API mode stays closed while productionContract is null.
   For an explicitly labeled demo artifact use `VITE_DATA_MODE=demo npm run build`.
4. Preview the chosen fresh output with `npm run preview`. Check both `/login`
   and a protected deep link. Do not publish old tracked dist files.

The mode and API URL are public, build-time settings; rebuild to change them.
A URL alone does not enable the production adapter. Never put credentials in
Vite variables. New builds exclude reference sheets and card-back artwork.
The loading strip is bundled under a fingerprinted filename in assets.

## Hosting handoff

The current router and asset paths assume deployment at the origin root `/`.
The host must serve index.html for application deep links, while keeping API
routes and missing static assets out of that fallback. Do not use Vite's
local development server as a production service.

Keep index.html revalidatable and serve its matching fingerprinted assets
together. Test refresh/direct navigation to a nested route after deployment.
Bank operations must review the host's HTTPS, security headers, access policy,
and API/identity configuration before live use. No hosting configuration or
live service was supplied or deployed in this phase.

## Sign-off still required

Approved backend contracts and staging checks; Firefox and Safari/WebKit;
physical-device checks; manual screen-reader and artwork/gradient accessibility
review; brand review of the supplied logo in its application layouts. Phase 09 implements
and checks the four-stage intake layout. See Phases 08 and 09 for the exact
implemented coverage. Transfers, reconciliation, approvals and administration
remain honest preview/unavailable states where services are not connected.
