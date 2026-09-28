# Phase 02 — Dashboard & Navigation

## Build
- Overview KPI cards
- Inventory health summary
- Quick actions
- Recent issuance table
- Attention queue
- Responsive sidebar/mobile navigation

## Exit Criteria
Users can understand current card operations and reach every major workflow in 1–2 interactions.

## Status — completed (24 September 2026)

### Delivered
- Eight branch-scoped KPIs: total, available, issued, active, frozen, blocked, expired and issued today.
- Inventory health displays available-card counts, explicit demo minimums and low-stock indicators, including branches with no available cards.
- Quick actions open the existing issuance, customer lookup, stock intake and approvals routes. These destinations remain at their own implementation phases.
- Recent issuance includes only cards with an issuance record, sorted newest first and limited to five. Serial links open the existing card profile; PAN is masked. Mobile uses the shared record-list presentation.
- Attention queue presents low stock and frozen/blocked/expired-card review signals. Links open the existing full inventory/status listings; they do not imply branch filters on destination pages or perform mutations.
- Status distribution gives counts and percentages with labeled progress indicators. Unknown statuses remain visible through the shared badge fallback.
- Branch selector and refresh control, branded loading skeleton, retryable error state and explicit empty states. Quick actions remain available during loading and errors.
- Existing Phase 01 navigation reused without duplicate routes; mobile drawer access to inventory and dashboard quick actions verified.

### Data semantics and API boundary
`OverviewPage` → `useDashboard` → `dashboardApi.getSummary` → mock-only `buildDashboardSnapshot`.

No production endpoints, auth integration or operational mutation are introduced. Production summary semantics and thresholds must come from the backend contract, replacing the mock adapter.

The fixtures use a fixed `2026-09-24` reporting date. “Today” is that reporting date, not the browser clock. ISO `issuedOn` values were added to existing card fixtures while preserving legacy `issuedAt` display strings. Dates are formatted in UTC to prevent date-only values shifting across time zones.

The current all-branch snapshot has 6 cards, 2 available, 4 with issuance records, 1 active, 1 frozen, 1 blocked, 1 expired and 0 issued on the snapshot date. Issued is a historical issuance count and overlaps current statuses; the UI explains this. Inventory totals use AVAILABLE status. Demo minimum available stock is 1 per branch; Head Office and Kubwa are below that threshold. These values are fixture assumptions, not bank policy.

Branch selection scopes metrics, stock health, distribution, attention and recent issuance together. A successful refresh reloads the current mock snapshot without fabricating updated activity.

### Verification
- `npm run build` passed.
- `npm test` passed: 5 Node tests cover reconciled counts, branch scope, empty data, deterministic date handling/newest-five ordering, masking, fixture immutability, unknown statuses and zero-stock branches.
- Browser verification using locally cached Playwright/Chromium passed: KPI counts, branch selection, stock/attention counts, refresh, issuance drill-down, all four quick actions and mobile navigation.
- Loading, error, retry and fully empty dashboard states verified with browser-only adapter interception; no test switches or fake failure parameters were added to production code.
- No document overflow at 320, 390, 768, 1024 and 1440 px; mobile record fallback verified. Desktop/mobile screenshots reviewed. No runtime errors in tested flows.
- Full screen-reader, cross-browser and production authentication/authorization verification remain in Phase 08 and Phase 07 respectively.

### Files created
- `src/data/dashboardMock.js`
- `src/api/dashboard.api.js`
- `src/hooks/useDashboard.js`
- `src/features/dashboard/DashboardPanels.jsx`
- `tests/dashboard.test.js`

### Files modified
- `src/pages/OverviewPage.jsx`
- `src/data/mockData.js`
- `src/styles/global.css`
- `package.json` (Node test command; no new dependencies)
- `BUILD.md`
- `docs/phases/PHASE-02-DASHBOARD.md`

Next: Phase 03 — Inventory & Stock Intake. Reuse the data table/query foundation and replace the inventory scaffold's unrelated static totals with coherent stock fixtures. Build intake and batches without assuming production endpoint paths.
