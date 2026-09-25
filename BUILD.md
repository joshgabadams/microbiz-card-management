# MicroBiz Card Management Platform — Main Build Reference

## 1. Purpose

This repository is the frontend-only Card Operations platform for MicroBiz Microfinance Bank. It is intentionally designed with **no application database**. Customer, card, inventory, authorization, audit and lifecycle data will be supplied by bank/card-processor APIs.

The frontend must make those services safe and operationally clear for authorized bank staff.

## 2. Product Outcomes

The finished platform must allow authorized users to:

1. View card operations KPIs and alerts.
2. Receive card stock and batches into inventory.
3. Track physical card stock using serial number and masked PAN.
4. Search/fetch customers and eligible accounts.
5. Select an available card and assign/issue it to a customer.
6. Support PIN/default-PIN workflow only as exposed by the API.
7. View all issued cards and an individual card profile.
8. Freeze/unfreeze, block, unlink, replace or reassign where the API and role permit.
9. Review card activity/audit history.
10. Support branch-aware card stock and future stock transfers.
11. Remain responsive across desktop, tablet and mobile.

## 3. Non-Negotiable Frontend Rules

- Never persist full PAN, PIN, CVV or secrets in localStorage/sessionStorage.
- PAN should be masked by default. Full sensitive values must only appear if explicitly permitted by backend policy and user entitlement.
- Never log PIN, PAN, CVV, auth tokens or sensitive API payloads to the browser console.
- Frontend role visibility is UX only; backend authorization remains authoritative.
- Every irreversible/high-risk action must use a confirmation step.
- API errors must be normalized into consistent UI states.
- UI components must use centralized design tokens; no random colors/radii/spacing.
- API calls belong in the API/service/query layer, not directly inside page components.
- Keep API contracts isolated so integration can change without redesigning pages.

## 4. Navigation Architecture

### Overview
- `/overview` — operational dashboard

### Cards
- `/cards` — all cards
- `/cards/available` — cards ready for issuance
- `/cards/issued` — issued/assigned cards
- `/cards/frozen` — frozen cards
- `/cards/blocked` — blocked/hotlisted cards
- `/cards/expired` — expired cards
- `/cards/:cardId` — card profile and lifecycle controls

### Issuance
- `/issuance/new` — guided Issue Card workflow
- `/issuance/history` — issuance history

### Customers
- `/customers` — customer lookup
- `/customers/:customerId` — customer card/account context

### Inventory
- `/inventory` — stock overview
- `/inventory/receive` — receive cards/batches
- `/inventory/batches` — card batches
- `/inventory/transfers` — branch stock transfers
- `/inventory/reconciliation` — stock reconciliation

### Activity & Controls
- `/activity` — card lifecycle/activity events
- `/audit` — audit trail
- `/approvals` — future approval queue for restricted operations

### Administration
- `/admin/card-products` — card products/schemes
- `/admin/branches` — branch reference
- `/admin/users` — user/role reference where exposed by API
- `/settings` — UI/profile/application preferences

## 5. Primary User Journeys

### A. Receive stock
Inventory → Receive Cards → choose batch/product/branch → enter/import serial/PAN metadata → validate → submit → inventory updated.

### B. Issue card
Issue Card → search customer → select eligible account → select available card → supply allowed PIN/default-PIN information → review → confirm → success receipt.

### C. Manage issued card
Issued Cards → Card Detail → inspect status/customer/account/history → allowed lifecycle action → reason/confirmation → API call → refreshed state.

### D. Find customer and cards
Customers → search by API-supported identifiers → customer profile → cards/accounts → open card detail or issue card.

### E. Reconcile stock
Inventory → Reconciliation → compare expected/physical counts → resolve discrepancy using backend-supported process.

## 6. Application Layers

```text
Page / Feature UI
      ↓
Reusable Components
      ↓
Query / Mutation Hooks
      ↓
API Service Layer
      ↓
HTTP Client / Auth Interceptors
      ↓
Bank / Card Processor APIs
```

## 7. Planned Folder Structure

```text
src/
  api/            # HTTP clients + endpoint modules
  components/
    cards/
    customers/
    data/
    layout/
    ui/
  config/         # nav, environment, feature flags
  data/           # temporary local fixtures only
  features/       # domain-specific logic
  hooks/
  layouts/
  pages/
  routes/
  services/
  styles/
  types/
  utils/
```

## 8. Design Foundation

Source references supplied by MicroBiz are stored in `public/references/`.

### Reference and component contract (updated 25 September 2026)

For every frontend build, review all supplied references together:
- `proposed-design-outlook.png`: operational desktop/mobile composition, navigation, tables, intake and issuance workflow hierarchy.
- `mobile-ui-reference.png`: MicroBiz branding, mobile spacing, card surfaces and shortcut patterns.
- `portal-signin-reference.png`: portal composition, blue actions, pale surfaces and card presentation.
- `microbiz-card-layout.png` and `microbiz-card-layout.pdf`: Professional/Business card artwork and brand details.
- `public/assets/loading-animation.png`: shared branded loading treatment.

Use the operational outlook for application composition and the other references
for their respective brand and interaction details. Product rules, accessibility
and PAN masking still apply when sample artwork depicts different behavior.
Reuse the Phase 01 foundation: centralized tokens in `src/styles/global.css`,
shared UI primitives, `PageHeader`, `MetricCard`, `DataTable` and `CardVisual`.
Extend shared components/tokens where needed instead of introducing page-specific
visual systems. Verify affected screens against the references at desktop and
mobile sizes before visual sign-off.

Visual principles:
- deep MicroBiz navy as the primary operational color
- bright banking blue for primary actions/active navigation
- MicroBiz red as a restrained accent/danger-adjacent brand detail
- white card surfaces on pale blue-grey application background
- rounded but professional component language
- simple outline icons
- strong table readability
- card artwork treated as a first-class product visual
- responsive mobile layouts inspired by existing MicroBiz mobile UI, without copying consumer-banking navigation into the internal operations context

## 9. Status Model

The frontend must be capable of rendering, at minimum:

`AVAILABLE`, `ASSIGNED`, `ISSUED`, `ACTIVE`, `INACTIVE`, `FROZEN`, `BLOCKED`, `EXPIRED`, `UNLINKED`, `LOST`, `STOLEN`, `DAMAGED`, `REPLACED`.

These are UI-capability placeholders until the real API enum is supplied.

## 10. API Capability Map

Expected capabilities, not prescribed backend route names:

- Auth/session/current-user/permissions
- Dashboard card summary
- Search customers
- Fetch customer accounts
- List/search/filter cards
- Card detail
- Available cards
- Assign/issue card
- Freeze/unfreeze card
- Block/hotlist card
- Unlink/reassign/replace card where permitted
- Receive inventory/batch
- Branch stock
- Stock transfer
- Card history/audit events
- Card products/schemes

## 11. Phase Execution Index

| Phase | Goal | Reference |
|---|---|---|
| 0 | Product rules + architecture | `docs/phases/PHASE-00-ARCHITECTURE.md` |
| 1 | Design system + app shell | `docs/phases/PHASE-01-FOUNDATION.md` |
| 2 | Dashboard + global navigation | `docs/phases/PHASE-02-DASHBOARD.md` |
| 3 | Card inventory + stock intake | `docs/phases/PHASE-03-INVENTORY.md` |
| 4 | Customer lookup + issuance | `docs/phases/PHASE-04-ISSUANCE.md` |
| 5 | Card profile + lifecycle actions | `docs/phases/PHASE-05-LIFECYCLE.md` |
| 6 | Activity, audit, approvals | `docs/phases/PHASE-06-CONTROLS.md` |
| 7 | API integration + auth hardening | `docs/phases/PHASE-07-INTEGRATION.md` |
| 8 | Responsive QA + production readiness | `docs/phases/PHASE-08-RELEASE.md` |

## 12. Current Implementation State

Updated 25 September 2026 after the Phase 03 audit and Phase 04 frontend implementation.

| Phase | Status | Evidence / remaining work |
|---|---|---|
| 00 | COMPLETED | Product structure, routes, journeys and constraints documented. |
| 01 | COMPLETED | Reusable UI/data primitives, accessible responsive shell, branded card rendering and build verification. See Phase 01 for files and checks. |
| 02 | COMPLETED | Branch-scoped mock dashboard, eight KPIs, stock health, recent issuance, status distribution, attention queue and quick actions; responsive navigation verified. |
| 03 | IMPLEMENTED; QA PENDING | All seven scoped features exist, including validated mock intake and transfer/reconciliation shells. Updated-reference visual alignment and browser workflow verification remain; see Phase 03 audit. |
| 04 | COMPLETED (FRONTEND DEMO) | Customer lookup/profile, eligible accounts/cards, five-step issuance, confirmation/receipt and history. PIN setup explicitly unavailable pending API contract. Unit/build/Chromium checks pass. |
| 05 | PARTIALLY COMPLETED | Card profile scaffold only; authorized lifecycle actions and contextual history remain. |
| 06 | NOT STARTED | Placeholder routes only. |
| 07 | BLOCKED | Production API/auth contracts are unavailable; shared HTTP client and initial mock query adapter exist. |
| 08 | NOT STARTED | Phase 01/02 browser/build checks and dashboard aggregation tests passed; full release validation remains. |

**Next implementation phase: Phase 05 — Card Profile & Lifecycle Actions. Phase 03 browser/visual sign-off remains tracked separately.**

All displayed records remain development fixtures, and the shell identifies the demo workspace. The card listing uses `useCards` and the mock `cardsApi` adapter. The dashboard uses `useDashboard` and `dashboardApi`, with aggregation isolated in `src/data/dashboardMock.js`. Its fixed snapshot date and stock thresholds are explicitly marked as demo data. Other scaffold pages still import fixtures directly; migrate them through domain queries during their respective phases. No production endpoint contract is assumed by the card adapter.

### Known follow-up issues
- Card-detail timelines remain illustrative and need contextual event fixtures during Phase 05. Dashboard and inventory summaries use the shared card fixture set; receipt mutations invalidate inventory, cards and dashboard queries.
- Customer, inventory and issuance workflows use isolated mock capability adapters. Production paths, eligibility and authorization still require approved API contracts.
- Shared HTTP error normalization still retains server payloads; sanitize it and handle authentication/authorization failures according to the real contract during Phase 07.
- Inventory, customer lookup/profile and issuance use the shared component foundation. Phase 04 adds the operational reference's five-step workflow with responsive verification.
- No authenticated session or backend authorization exists. Lifecycle buttons remain disabled; PIN/CVV collection is not implemented.
- Original reference artwork remains unchanged in `public/references`. It includes printed sample card-back data and must not be used as operational UI or shipped as public production content without asset review.
- Git metadata is present in the current workspace.

When real API documentation is provided, replace fixtures feature-by-feature through the API/query layer without redesigning presentation components.
