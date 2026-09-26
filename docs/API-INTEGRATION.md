# Frontend integration handoff

Phase 07 frontend work is complete. Live bank/processor integration is deferred
until the approved API and identity contracts are supplied. No production routes,
credentials, token format, refresh flow, cookie/CSRF policy or bank permissions
have been invented. The demo session is a presentation tool, not authentication.

## Running the frontend

- `npm run dev`: demo mode by default. Open any route and choose **Enter demo workspace**.
- Reloading or **End demo** discards the in-memory session and demo mutations.
- `npm run build`: API mode by default. With no contract, staff access stays closed.
- `VITE_DATA_MODE=demo npm run build`: explicitly build a demonstration site.
- `.env.example` documents public build-time variables. Never put secrets in Vite variables.
- `VITE_API_BASE_URL`: HTTPS URL or same-origin absolute path; required by the HTTP client before requests are sent. Setting the URL alone does not enable integration.

Vite builds omit the design-reference directory. The branded loading image is
bundled through CSS under a fingerprinted filename. Phase 08 also validates
public environment settings before serving or building.
Default API builds also eliminate dynamically imported demo stores and records.
Existing tracked `dist` files were not replaced: deploy only a fresh build.

## Adapter seam

Replace `src/api/productionContract.js` only after reviewing the real contract.
Its current value is `null`. The intended frontend shape is:

```js
export const productionContract = {
  auth: { getSession, signIn, signOut },
  services: { dashboard, cards, customers, inventory, issuance, activity },
};
```

These are JavaScript capabilities, **not backend endpoint names**.
`getSession()` and `signIn()` resolve to `null` or
`{ user: { id, name }, permissions: string[] }`. `signIn()` may start an approved
identity redirect; any callback route and credential UI must follow that contract.
`signOut()` must clear the transport's credential state and perform the approved
server logout. Local UI/session/query data are cleared immediately; a server
logout failure displays a safe error and does not restore local access.

`src/config/permissions.js` contains frontend capability names. Map real bank
entitlements to those capabilities at the adapter boundary. Missing permissions
deny access; there is no wildcard/admin bypass. Route and link visibility are UX
only. Every backend operation still requires server-side authorization.

Domain method names are declared in `src/api/*.api.js`. Preserve their current
view-model shapes when mapping approved responses:

| Domain | Frontend capabilities / data |
|---|---|
| dashboard | `getSummary({ branch })`: metrics, reporting date, branches, inventory, attention, distribution and recent issuance |
| cards | `list`, `get`, `getDetail`, `available`; detail contains masked card fields, `customerId`, timeline and `allowedActions` |
| customers | `search(query)`, `get(id)`; masked accounts, eligibility and linked cards |
| inventory | `list`: cards, batches and reference options; `receive(input)`: receipt |
| issuance | `available(customerId, accountId)`, `issue(input)`, `history` |
| activity | `list(filters)`, `audit(filters)`, `options(audit)`, `getEvent(id)` |

Production adapters should explicitly project and validate responses, including
masking sensitive values before they reach query caches. Demo adapters under
`src/api/demo` document current view models but do not prescribe bank policy.
Production mode never falls back to these adapters. Missing methods return a
safe unavailable-service error. Migrate domains individually after contract review.

Lifecycle controls require both `card.allowedActions` and the matching session
permission (`cards.freeze`, `cards.unfreeze`, `cards.block`, `cards.unlink`,
`cards.reassign`). No status-to-action rules remain in the component. The demo
returns no lifecycle capabilities. Implement supported methods and server-side
state validation before exposing them. Replacement, approval decisions and PIN
operations still need their own approved contracts and UI completion.

## Transport and session behavior

`createHttpClient` in `src/api/http.js` accepts a configured `baseURL`, optional
`authorize(config)` hook and opt-in `withCredentials`. The reviewed adapter owns
any bearer token in memory or approved cookie/CSRF configuration. No browser
storage, credential collection or automatic refresh is implemented. All request
paths stay within the API base; query values belong in Axios `params`.

- 30-second timeout; mutations are never automatically retried.
- Queries retry once only for network/timeout/5xx failures.
- Errors use fixed messages/codes and retain no Axios configuration, server body,
  headers, tokens or sensitive payloads.
- 401 clears the current session and returns to entry; 403 preserves the session
  and displays restricted access. There is no automatic request replay.
- Session changes cancel and clear queries/mutations. Transport and service
  revision checks reject late results or failures from an earlier session.
- Mutation timeouts do not prove the operation failed. Reconcile server state
  before retrying; approved idempotency semantics must be implemented by the adapter.

## Remaining backend integration work

Obtain identity/SSO, expiry/refresh/logout, cookie/CSRF/CORS, endpoint schemas,
error enums, pagination, masks, branch scope, entitlement and per-record action
contracts. Map backend eligibility and reference data without copying demo
business rules. Update demo-specific explanatory copy and intake/issuance
validation to match the approved capabilities when enabling each production
workflow. Complete PIN, lifecycle and approval behavior only where supported.

Run contract tests against a staging service for authentication, authorization,
session expiry, idempotency, stale state and all supported mutations. Phase 08 frontend/Chromium checks are recorded in `docs/phases/PHASE-08-RELEASE.md`;
backend staging, cross-browser and full screen-reader sign-off remain release gates.
