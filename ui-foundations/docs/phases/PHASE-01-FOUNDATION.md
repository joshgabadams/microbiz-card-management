# Phase 01 — UI Foundation & App Shell

## Live component reference

Open **UI Foundations** in the app navigation, or visit `/ui-foundations` after
signing in. The page includes current colour tokens, typography, spacing,
logo treatments, icons, buttons, fields, badges, card previews, metrics,
searchable/paginated sample tables, feedback states, dialogs, tabs, workflow
steps and layout guidance. Code snippets and source paths accompany the samples.
All interactions use page-local sample state and do not mutate operational data.

Page source: `src/pages/UiFoundationsPage.jsx`. Gallery layout styles:
`src/styles/foundations.css`. Shared component styling remains in
`src/styles/global.css`.

## Build
- Design tokens: color, typography, spacing, radius, shadow, motion
- App shell: sidebar, topbar, mobile header
- Button, input, select, badge, modal, drawer, tabs, skeleton, empty-state primitives
- CardVisual and CardStatusBadge
- Reusable page header and KPI cards
- Loading state using supplied MicroBiz loading reference

## Exit Criteria
All later pages can be assembled without inventing one-off visual styles.

## Status — completed (24 September 2026)

The reusable foundation is implemented and exercised in the shell, dashboard and card listing. Feature-specific workflow completion remains in subsequent phases.

### Delivered
- Shared color/status, typography, spacing, radius, shadow and motion tokens; visible keyboard focus and reduced-motion support.
- `Button` (including pending/disabled states), labeled `FormField` (input/select/textarea, hints/errors), centralized status badges, modal/drawer and confirmation composition, keyboard-operable tabs, skeleton/loading/empty/error states.
- Branded loading indicator using the supplied loading image as a frame strip.
- Shared `PageHeader`, `MetricCard` and `DataTable`; the table takes caller-owned rows, columns, pagination and loading/error state, and switches to labeled mobile records.
- Responsive shell with skip link, exact navigation highlighting, collapsible groups, native modal drawer with explicit keyboard wrapping, Escape close, background isolation, scroll locking and focus restoration.
- Existing Professional/Business card visuals preserved; final-four PAN masking and compact layout corrected. No card-back reference image is rendered.
- Card listing demonstrates the foundation with real mock search/product/branch filters and pagination. `useCards` → `cardsApi` → isolated fixtures establishes the query/adapter boundary without invented endpoints. Unsupported card mutations reject rather than send a request.
- Unknown routes/card IDs render explicit not-found states. Unimplemented lifecycle controls are disabled.
- Standard Vite React plugin configuration uses the already-installed dependency.

### Verification
- `npm run build` passes, without the initial module-directive warnings.
- Existing locally cached Playwright/Chromium used for browser checks; no dependency added.
- Verified card search, product filtering, pagination, empty results, unknown routes/card IDs and single active navigation link.
- Verified mobile record layout and no document overflow at 320, 390 and 768 px; desktop listing inspected at 1440 px.
- Verified repeated Tab navigation stays in the drawer, Escape closes it, trigger focus is restored and navigation closes the drawer.
- No page runtime errors in tested flows. PAN utility checked with raw digits, masked values, missing values and short values.
- Dedicated confirmation and tab integration, full screen-reader review and cross-browser coverage remain part of feature integration/release QA.

### Reuse contract
Use `FormField` with a visible label; set `as="select"` or `as="textarea"` where needed. Dialogs receive controlled `open`/`onClose` props; mutations own pending/error state, and confirmation dialogs accept `busy` to prevent duplicate submission/dismissal. Tabs receive `{ value, label, content }` items and a controlled selection. Tables receive already filtered/paginated rows and a total; pages or queries own data transformations. The current listing uses five rows per page to exercise pagination with the small fixture set.

### Files created
- `vite.config.js`
- `src/components/ui/Button.jsx`
- `src/components/ui/FormField.jsx`
- `src/components/ui/DataState.jsx`
- `src/components/ui/Modal.jsx`
- `src/components/ui/Tabs.jsx`
- `src/components/ui/MetricCard.jsx`
- `src/components/layout/PageHeader.jsx`
- `src/components/data/DataTable.jsx`
- `src/config/cardStatuses.js`
- `src/utils/maskPan.js`
- `src/hooks/useCards.js`
- `src/pages/NotFoundPage.jsx`

### Files modified
- `src/App.jsx`
- `src/layouts/AppShell.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/ui/StatusBadge.jsx`
- `src/components/cards/CardVisual.jsx`
- `src/pages/CardsPage.jsx`
- `src/pages/CardDetailPage.jsx`
- `src/pages/OverviewPage.jsx`
- `src/api/cards.api.js`
- `src/styles/global.css`
- `BUILD.md`
- `docs/phases/PHASE-01-FOUNDATION.md`

Next: Phase 02 — Dashboard & Navigation.
