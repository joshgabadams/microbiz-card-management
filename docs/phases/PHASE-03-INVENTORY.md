# Phase 03 — Inventory & Stock Intake

## Build
- Inventory overview
- Available cards
- Receive cards workflow
- Batch listing/detail pattern
- Stock transfer shell
- Reconciliation shell
- Search/filter/pagination patterns

## Data Rules
Mask PAN by default. Stock rows must prioritize serial number, masked PAN, product, branch, batch and status.

## Audit — 25 September 2026

Status: scoped implementation present; full browser and updated-reference visual
sign-off pending. This is a frontend demo, not production API integration.

| Requirement | Implementation evidence |
|---|---|
| Inventory overview | `InventoryPage.jsx`: shared-query cards, available count, batch count and low-stock branches. |
| Available cards | `/cards/available` uses `InventoryPage` and `StockTable` restricted to AVAILABLE. |
| Receive cards | `ReceiptForm.jsx`: batch metadata, individual card rows, validation, review/confirmation, errors and success receipt. |
| Batch listing/detail | `CardBatchesPage.jsx`: search, branch filter, pagination and a batch drawer with stock details. |
| Stock transfer shell | `StockOperationsPage.jsx`: source/destination, product scope, quantity validation and preview; submission explicitly disabled. |
| Reconciliation shell | Same page in reconciliation mode: expected/physical count comparison and discrepancy preview; submission disabled. |
| Search/filter/pagination | `StockTable.jsx`: serial/masked PAN/batch search, branch/product/status filters, reset and five-row pages. |
| Data rules | Stock columns begin with serial, masked PAN, product/scheme, branch and batch; status is included. Intake accepts PAN last-four only. |

The mock store validates atomically, rejects duplicate serials/batches, supports
idempotent receipt retries and keeps stock in memory. The API/query boundary is
implemented; successful receipts invalidate inventory, cards and dashboard data.
Transfers and reconciliation are intentionally shells under this phase's scope.
Bulk import and production persistence are not delivered.

### Verification and remaining sign-off

- `npm.cmd test`: all 13 tests pass, including eight inventory tests covering receipt validation, masking, atomicity, retries and dashboard aggregation.
- `npm.cmd run build`: passes. The sandbox blocked the initial Vite config load; the approved build outside the sandbox completed successfully.
- Browser interaction and responsive checks were not performed in this audit. Existing tests do not exercise rendered filtering/pagination, modal focus or the complete intake journey.
- The updated operational outlook depicts blue active navigation, the MicroBiz logo and a staged intake indicator. Current source uses white active navigation, a constructed brand mark and a single form followed by review/success. These require visual alignment review before claiming full consistency with the updated reference.
- Validate intake through confirmation and success, refreshed inventory/batch/dashboard counts, search/filter/pagination, empty/error states, drawer keyboard behavior and mobile layouts before marking the phase fully signed off.
- Every frontend change must follow the reference/component contract in `BUILD.md` and the Phase 01 reuse contract.
