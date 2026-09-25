# Phase 04 — Customer Lookup & Card Issuance

## Build
- Customer search
- Customer result/profile component
- Eligible account selection
- Available-card selection
- PIN/default-PIN step only according to API contract
- Review/confirm step
- Success state/receipt
- Issuance history

## Safety
Sensitive PIN data must never be persisted or logged.

## Status — frontend demo completed (25 September 2026)

### Delivered
- Customer lookup by name, customer ID, account number or the displayed masked phone value, with validation, loading/error/retry and empty results.
- Reusable customer result/profile components; customer routes show masked accounts, demo eligibility and linked cards. Unknown customers have an explicit not-found state.
- Five-step issuance: Customer → Account → Card → PIN setup → Review. Account changes clear card selection; changing customers clears both selections.
- Active, eligible accounts and unexpired AVAILABLE cards filtered by account product and branch. These are explicitly illustrative demo capabilities, not bank policy.
- PIN setup is explicitly unavailable without the processor contract. No PIN/default-PIN/CVV inputs or generated credentials exist. Demo issuance does not activate the card.
- Review, confirmation, pending/error handling, cancellation and a masked receipt with links to the card/customer and a new issuance action.
- Atomic mock issuance revalidates eligibility, prevents duplicate issuance and supports request-id retries. Unexpected payload fields are rejected. State remains in memory and resets on reload.
- Successful issuance changes stock to ISSUED and refreshes cards, inventory, dashboard, customer profiles and issuance history.
- History includes fixture issuance events and session receipts with search, branch filtering and pagination. Event status is distinguished from current card status; unsuccessful attempts do not create completed events.
- Customer and issuance adapters/query hooks replace direct fixture usage in the Phase 04 pages. No provisional production endpoints are used.

### Design and foundation
The updated operational outlook guides the five-step hierarchy, account selection,
review and card preview. Existing mobile, portal and card-art references inform
the shared surfaces, blue/navy palette and Professional/Business previews.
Pages reuse PageHeader, FormField, Button, DataTable, StatusBadge, CardVisual,
confirmation modals and loading/empty/error states. Added styles use centralized
tokens. Existing shell/logo differences identified in the Phase 03 audit remain
separate visual follow-up work; this phase does not claim pixel-for-pixel parity.

### Verification
- `npm.cmd test`: 21 passing tests, including eight new issuance tests for search, masking, eligibility, atomic updates, shared inventory/dashboard state, retries, sensitive-field rejection and receipt isolation.
- `npm.cmd run build`: production build passes.
- `tests/issuance.browser.cjs`: Chromium checks pass for lookup/profile, end-to-end issuance, history search, linked-card refresh, cancellation, unavailable stock, missing customers and stale-stock rejection after review.
- Confirmation Tab containment, Escape dismissal and focus restoration checked. No page runtime errors in tested flows; no localStorage/sessionStorage writes.
- Complete issuance and customer-profile checks at 320, 390 and 768 pixels; desktop checked at 1440 pixels. No document overflow. Desktop and mobile screenshots inspected.
- Cross-browser and full screen-reader testing remain release QA.

### Try it
Customer Lookup → search `Musa` → View Musa Bello → Issue card → select the
Business account → select `S4D5681-P3` → continue through PIN explanation and
review → confirm demo issuance. The card appears in issuance history and the
customer's linked cards, and leaves available stock. Reload resets the demo.

To run optional browser QA, start Vite on port 5173, make Playwright available
through `PLAYWRIGHT_MODULE` (an installed package path, or install it separately),
then run `node tests/issuance.browser.cjs`. `QA_BASE_URL` overrides the local URL;
`QA_OUTPUT` optionally writes screenshots. No dependency was added to the app.

Production customer eligibility, authorization, processor issuance and any PIN
workflow remain dependent on the real API contract in Phase 07.
