# Phase 09 — Design Refinement & Staged Intake

## Scope

This phase extends the roadmap with the agreed design-refinement work: align
stock intake with the four-stage operational reference and replace the placeholder
brand mark with a shared, reference-based vector wordmark. It does not introduce
production endpoints or expand the lifecycle capabilities deferred in Phase 05.

## Design protocol

- Review the operational outlook, mobile UI, portal reference, Professional/Business
  artwork and branded loader together, following BUILD.md's reference contract.
- Reuse centralized tokens and shared fields, buttons, dialogs and card visuals.
- Keep card data masked and use a separate confirmation before receiving stock.
- Check each stage on desktop and mobile, including focus and error recovery.
- Record implementation evidence separately from brand-owner approval.

## Implementation — 26 September 2026

- **Batch Details:** batch reference, product/scheme, receiving branch, date,
  expected quantity and operator. Validate metadata before proceeding, without
  requiring card rows that have not been entered yet.
- **Card Details:** manual serial, PAN last-four and expiry rows. Validate duplicate
  serials, dates and quantity before review. Adding/removing rows does not silently
  change the expected batch quantity.
- **Review:** normalized batch/serial values and masked cards, with edit links and
  Back navigation that preserve input. Confirmation opens a separate dialog;
  canceling that dialog preserves the review. Revalidate current stock before
  submission and retain the request ID for retrying the same reviewed receipt.
- **Complete:** receipt, inventory/batch links and a clean start for another batch.
  Discard confirmation resets all stages; session changes retain the existing
  isolation behavior.
- `WorkflowSteps` supplies the shared responsive progress indicator for intake
  and issuance, including the current-step accessibility attribute. Stage changes
  focus their heading; invalid input focuses a linked error summary.
- `BrandLogo` replaces the letter-M placeholder on the entry screen and desktop/
  mobile sidebar, and the text-only brand on Professional/Business card previews.
  It uses SVG geometry and centralized color tokens, with light and dark variants.

## Validation — passed

- `npm run verify:release`: 38 domain tests, isolated API/demo builds, emitted
  asset and fixture checks, and invalid-environment rejection.
- Existing Chromium suites: authentication, issuance, activity/audit, stock
  workflows, session isolation, timeout/retry and 27 routes at five widths.
- `tests/intake.browser.cjs`: all four stages at 320, 390, 768, 1024 and 1440 px;
  required fields, quantity mismatch, duplicate serials, retained back/edit state,
  masking, confirmation dismissal, discard, failed submission/retry and reset.
- Desktop/mobile screenshots are emitted when `QA_OUTPUT` is set. The Phase 09
  review artifacts are in `/tmp/microbiz-phase9-qa` on this workstation.

```sh
npm run verify:release
# With npm run dev running and an existing Playwright installation:
PLAYWRIGHT_MODULE=/path/to/playwright QA_OUTPUT=/tmp/microbiz-phase9-qa npm run test:browser
```

## Visual review limits

The reference-based SVG is a hand-built interpretation, not an original approved
vector logo export. Brand-owner approval or replacement with an official vector
asset remains open. The staged layout now follows the reference's four steps;
exact pixel parity with the composite reference is not claimed. Existing
cross-browser, manual accessibility and production integration gates still apply.

## Supplied logo update — 26 September 2026

The user supplied `public/assets/image.png` as the replacement brand logo.
`BrandLogo` now renders that original image across login, desktop/mobile navigation
and card previews; the hand-built SVG has been removed. The image keeps its
956 × 285 proportions, responsive width and original colors. Dark surfaces use
a white backing for legibility. Vite imports the asset into production output.
This supersedes the earlier request to replace the interpreted wordmark with an
original asset; the remaining release and accessibility reviews still apply.
