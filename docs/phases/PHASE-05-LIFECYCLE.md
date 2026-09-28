# Phase 05 — Card Profile & Lifecycle

## Build
- Card detail/profile
- Customer/account relationship
- Activity timeline
- Freeze/unfreeze
- Block/hotlist
- Unlink
- Reassign/replace where backend permits
- Reason capture and confirmation dialogs

## Rule
Only render actions returned by permissions/capability data when the API provides them.

## Interface follow-up — 26 September 2026

At the user's request, the card profile now shows the lifecycle control set
(Activate, Freeze, Unfreeze, Block, Unlink and Reassign). Unsupported or
unauthorized controls are disabled and explained; enabled actions still require
both returned card capabilities and session permissions. This updates the
visibility rule above without enabling unsupported operations. Activation now
has the same service/mutation/confirmation seam as the other actions; no live
endpoint or local status transition is invented.

The Activity tab uses shared event badges and token-based timeline styling for
markers, connectors, notes and actor/timestamp metadata. Login uses Sign in;
the header uses an icon and Sign out, without demo workspace/operator labels.
Development fixtures and the closed production-auth behavior remain unchanged.
