# Phase 07 — API Integration & Auth Hardening

## Build
- Environment-based API URL
- Axios HTTP client
- Auth/token interceptor according to backend contract
- Query/mutation hooks
- Error normalization
- Permission/capability handling
- Remove fixtures feature-by-feature

## Rule
Do not encode backend business rules twice. Treat API as authority for permissions and state transitions.

## Status — frontend complete; live integration deferred (25 September 2026)

Per the requested scope, the frontend portion is wrapped up now; the bank API
and authentication layer will follow when its approved contracts are supplied.

### Delivered

- Environment-selected demo/API modes and validated API base URL. Development
  defaults to demo; production defaults to closed API mode with no fixture fallback.
- Shared Axios client factory with a contract-owned authorization hook, opt-in
  cookies, timeouts, safe errors, 401 expiry and stale-session response rejection.
- Domain adapters isolated from dynamically loaded demo stores. All pages now
  obtain records through query/service boundaries, including linked card customers.
- In-memory session provider, explicit demo entry, deep-link return, logout/reset,
  session loading and expired-session states. No fake staff credentials or tokens.
- Route, navigation, action-link and service capability checks. Missing permission
  denies access. Lifecycle actions require returned per-card capabilities and
  session permission instead of hardcoded status transitions.
- Query cancellation/cache clearing on session changes; no automatic mutation
  retry; bounded retry only for transient query errors.
- Shared errors distinguish forbidden/unavailable services without exposing API
  payloads. Existing confirmation and pending-state components remain in use.
- Production builds omit reference sheets and demo records; reference sources and
  existing tracked build output remain intact. Explicit demo builds remain supported.

### Design review

Reviewed BUILD.md, all phase documents, every supplied PNG reference, the actual
card-layout PDF and loading strip before implementation. The entry composition
uses the operational/portal references, existing Professional/Business CardVisual,
navy/blue tokens, pale surfaces and shared buttons. Desktop/mobile screenshots
were reviewed. Fixed the existing card-profile grid's narrow-screen overflow.
This phase reuses the existing brand components; earlier asset/logo fidelity
follow-ups and Phase 03 intake visual sign-off remain separate work.

### Verification

- 38 domain tests pass, including nine session/transport/integration tests.
- Chromium session checks cover entry, deep links, linked-customer masking,
  capability visibility, restricted navigation/routes, expiry, logout/reload,
  absence of storage writes and layouts at 320, 390, 768 and 1440 px.
- Existing issuance and activity/audit browser suites pass through the new demo
  entry, including mutations, confirmations, filters and responsive behavior.
- Production and explicit-demo builds verified; default production browser check
  verifies closed staff access with no demo entry or protected records.
- No new dependencies. Optional browser instructions follow Phase 06; run
  `node tests/auth.browser.cjs` with `PLAYWRIGHT_MODULE`. Set `QA_PRODUCTION=1`
  and `QA_BASE_URL` to a production preview for the closed-mode check.

See `docs/API-INTEGRATION.md` for the adapter shape, configuration, session behavior
and concrete remaining backend work. This is not a claim of production integration
or backend security verification.
