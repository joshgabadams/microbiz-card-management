# Phase 06 — Activity, Audit & Approvals

## Build
- Global activity log
- Audit trail
- Approval queue shell
- Actor/action/timestamp/reference filters
- Read-only audit detail

## Status — frontend demo completed (25 September 2026)

### Delivered
- `/activity`, `/audit` and `/approvals` now render their implemented pages through the existing navigation.
- Shared event-log feature with customer/serial/masked-PAN search; actor, action, branch and reference filters; inclusive from/to dates; reset, refresh and ten-row pagination. References cover event IDs, card IDs/serials, issuance receipt IDs and batch IDs.
- Explicit West Africa Time (Africa/Lagos, UTC+01:00) for display and calendar-date filters, independent of the browser timezone. Reversed date ranges show a validation message.
- Read-only audit drawer with event/reference, action, actor, exact timestamp, card link, masked PAN, customer, branch and note; keyboard focus containment, Escape and focus restoration use the shared modal.
- Approval queue shell with distinct pending/approved/rejected views. It explicitly states that the service is not connected and does not imply that real queues are empty or that approvals are enforced.
- API/query boundary owns event reads and filter options. Page components do not import fixtures.
- Session stock receipts and issuance append masked event snapshots after successful validation. Retries do not duplicate records; rejected operations do not create completed events. Query invalidation refreshes both logs, and card-detail timelines use the same event source.
- Read APIs return isolated copies. Event fields are explicitly projected; mutation payloads, PIN/CVV and tokens are not copied into history. There is no browser-storage persistence.

### Design review
Before implementation, reviewed `BUILD.md`, every phase plan, the operational
outlook, mobile and portal references, both card-layout PNG/PDF files, and the
loading asset. Reused PageHeader, DataTable, FormField, Button, EventBadge,
loading/error/empty states and the shared drawer. Added responsive filter styles
use the centralized tokens; active navigation now uses the reference's blue
selection on the navy shell. Desktop tables and mobile labeled records follow
the established foundation. No new bitmap assets or dependencies were needed.

### Verification
- `npm test`: eight new Phase 06 domain tests pass alongside the existing domain tests. The runner reports 30 passing entries, including the pre-existing empty `auth.test.js` file; this is not authentication verification.
- Production build passes (`npm run build -- --outDir /private/tmp/microbiz-phase6-build`), keeping existing tracked build output untouched.
- `tests/activity.browser.cjs`: Chromium passes routes, combined filters, reference lookup, pagination/reset, date validation, timezone independence, drawer read-only content and keyboard behavior, linked card navigation, approval views, and actual issuance/intake form submissions followed by refreshed logs.
- Loading, empty, failed-query/retry and failed-filter-options recovery verified through browser-only adapter injection. No runtime errors or local/session-storage writes in tested flows.
- Layouts checked at 320, 390, 768 and 1440 pixels with no document overflow. Desktop/mobile screenshots reviewed against the supplied references; mobile navigation and drawer overflow checked.

Run optional browser QA with Vite running:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright QA_BASE_URL=http://127.0.0.1:5173 QA_OUTPUT=/tmp/phase6-qa node tests/activity.browser.cjs
```

### Integration boundary
This is an in-memory frontend demo, not a durable or tamper-proof audit service.
Seed lifecycle events remain illustrative; supported session operations are stock
receipt and issuance. Unsupported lifecycle mutations are not newly enabled.
The audit action classification is a demo convention; production event coverage,
retention, identity, permissions and approval decisions belong to the bank APIs
in Phase 07. Full cross-browser and screen-reader review remain release QA.
