# Phase 08 — QA & Production Readiness

## Verify
- Responsive behavior
- Keyboard navigation
- Accessible labels/focus states
- Loading/empty/error states
- No sensitive values in storage/logs
- API timeout/retry behavior
- Role visibility
- Confirmation for risky actions
- Production build
- Environment configuration

## Status — frontend QA completed (26 September 2026)

The frontend/demo release checks are complete. This is **not authorization for a
live banking release**: production API/identity contracts remain deferred under
the agreed Phase 07 scope. No deployment was performed.

### Coverage and results

| Checklist | Evidence |
|---|---|
| Responsive behavior | 27 routes at 320, 390, 768, 1024 and 1440 px; no document overflow. Mobile batch drawer checked at 320 px. Desktop/mobile screenshots reviewed against the previously inspected design references. |
| Keyboard navigation | Skip link, tab arrows/Home/End, mobile drawer containment/Escape/return focus, intake and issuance confirmation focus, and route focus handling. |
| Accessible labels/focus | One main landmark and page heading, named visible controls, unique IDs and valid ARIA references across all routes. Solid-surface text contrast checked; reduced-motion setting verified. |
| Loading/empty/error | Inventory loading, empty stock, failure/recovery, forbidden and unavailable states; existing activity/audit query and filter-option recovery checks. |
| Storage/logs | Browser suites reject storage writes. Full-route audit has no page or console errors. Sanitized transport errors and masked records verified. |
| Timeout/retry | Actual browser HTTP timeout with one mutation request and no replay; transient query retries once; 403 keeps session and 401 expires it. Unit coverage includes stale-session responses. |
| Role visibility | Existing auth suite checks guarded navigation/routes and absent lifecycle capabilities. Session changes additionally dismiss old dialogs and clear local intake forms. |
| Confirmation | Intake validation, cancel-without-loss, review, confirmation and success; issuance confirmation/cancellation/stale selection regression suite. |
| Production build | API and explicit-demo builds pass. Fingerprinted loader is referenced correctly. Reference sheets and source maps are absent; API build excludes fixture records. |
| Environment | Invalid mode and insecure API URL fail before a build is produced. Build outputs are generated in temporary folders without replacing tracked dist. |

### Issues fixed during QA

- Cleared page-local state as well as query caches on session changes by remounting
  the protected workspace for each session revision.
- Added page headings to card loading/error/not-found and restricted-route states.
- Raised table/detail/timeline label contrast using the shared muted-text token.
- Added route title/focus handling that does not steal focus from a newly focused
  control. Existing drawer restoration and tab navigation remain intact.
- Removed a dashboard React warning caused by spreading the `key` property.
- Replaced internal build-documentation text on placeholder pages with clear
  unavailable-service messaging using shared PageHeader/EmptyState components.
- Validate environment settings in Vite before serving/building.
- Bundle/fingerprint the loading strip through CSS, eliminating the unresolved
  asset warning while still excluding all design-reference sheets from builds.

### Repeatable commands

```sh
npm run verify:release
# Start npm run dev separately; point to an existing Playwright installation:
PLAYWRIGHT_MODULE=/path/to/playwright npm run test:browser
# Optional screenshots from the full route audit:
PLAYWRIGHT_MODULE=/path/to/playwright QA_OUTPUT=/tmp/microbiz-release-qa node tests/release.browser.cjs
```

`verify:release` runs 38 domain tests and builds both modes in fresh temporary
folders, checks output isolation/assets, and rejects two invalid configurations.
`test:browser` runs auth, issuance, activity, full-route release and HTTP/state
suites. Browser failure injection exists only in test scripts. No dependency was
added to the application.

### Remaining release gates

- Real backend authentication, permissions, eligibility, lifecycle/PIN/approval
  operations and staging contract tests require the bank's approved contracts.
- Coverage here is Chromium. Firefox, Safari/WebKit, physical devices and manual
  assistive-technology testing have not been performed. Automated semantic and
  solid-surface contrast checks are not a complete accessibility certification;
  gradients/artwork and assistive-technology behavior need human review.
- Earlier design differences remain explicitly tracked: constructed brand mark
  and combined intake form instead of the reference's staged intake. Functional
  inventory QA is complete; exact artwork/layout parity is not claimed.
- Review hosting/security policy and validate deployment deep links before a live
  release. See `docs/RELEASE.md`. Existing tracked dist is not the verified output.
