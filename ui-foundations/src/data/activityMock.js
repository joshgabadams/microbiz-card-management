export const activityEvents = [
  { id: 'EVT-001', cardId: 'MBZ-001', serial: 'S4D5678-Y5', pan: '•••• 4567', customer: 'Godwin Chika O.', branch: 'Head Office', action: 'ACTIVATED',  actor: 'System',        timestamp: '2026-09-22T11:14:00+01:00', note: null },
  { id: 'EVT-002', cardId: 'MBZ-001', serial: 'S4D5678-Y5', pan: '•••• 4567', customer: 'Godwin Chika O.', branch: 'Head Office', action: 'ISSUED',      actor: 'Demo Operator', timestamp: '2026-09-22T10:42:00+01:00', note: 'Savings Account •••• 7891' },
  { id: 'EVT-003', cardId: 'MBZ-003', serial: 'S4D5688-Q8', pan: '•••• 2901', customer: 'Ada Okafor',      branch: 'Kubwa',       action: 'FROZEN',      actor: 'Demo Operator', timestamp: '2026-09-24T14:10:00+01:00', note: 'Customer request — temporary travel hold' },
  { id: 'EVT-004', cardId: 'MBZ-003', serial: 'S4D5688-Q8', pan: '•••• 2901', customer: 'Ada Okafor',      branch: 'Kubwa',       action: 'ISSUED',      actor: 'Demo Operator', timestamp: '2026-09-21T09:21:00+01:00', note: 'Savings Account •••• 3024' },
  { id: 'EVT-005', cardId: 'MBZ-004', serial: 'S4D5692-L1', pan: '•••• 7239', customer: 'Musa Bello',      branch: 'Head Office', action: 'BLOCKED',     actor: 'Demo Operator', timestamp: '2026-09-23T16:55:00+01:00', note: 'Suspected unauthorised transaction — under review' },
  { id: 'EVT-006', cardId: 'MBZ-004', serial: 'S4D5692-L1', pan: '•••• 7239', customer: 'Musa Bello',      branch: 'Head Office', action: 'ISSUED',      actor: 'Demo Operator', timestamp: '2026-09-18T15:00:00+01:00', note: 'Current Account •••• 1182' },
  { id: 'EVT-007', cardId: 'MBZ-006', serial: 'S4D5714-K4', pan: '•••• 1176', customer: 'Tobi James',      branch: 'Mpape',       action: 'EXPIRED',     actor: 'System',        timestamp: '2026-07-31T23:59:00+01:00', note: null },
  { id: 'EVT-008', cardId: 'MBZ-006', serial: 'S4D5714-K4', pan: '•••• 1176', customer: 'Tobi James',      branch: 'Mpape',       action: 'ISSUED',      actor: 'Demo Operator', timestamp: '2024-05-11T11:00:00+01:00', note: 'Savings Account •••• 9921' },
  { id: 'EVT-009', cardId: 'MBZ-001', serial: 'S4D5678-Y5', pan: '•••• 4567', customer: '—',               branch: 'Head Office', action: 'RECEIVED',    actor: 'Demo Operator', timestamp: '2026-09-18T09:30:00+01:00', note: 'Batch MBZ-B001' },
  { id: 'EVT-010', cardId: 'MBZ-002', serial: 'S4D5681-P3', pan: '•••• 8812', customer: '—',               branch: 'Mpape',       action: 'RECEIVED',    actor: 'Demo Operator', timestamp: '2026-09-18T09:35:00+01:00', note: 'Batch MBZ-B002' },
  { id: 'EVT-011', cardId: 'MBZ-003', serial: 'S4D5688-Q8', pan: '•••• 2901', customer: '—',               branch: 'Kubwa',       action: 'RECEIVED',    actor: 'Demo Operator', timestamp: '2026-09-18T09:40:00+01:00', note: 'Batch MBZ-B003' },
  { id: 'EVT-012', cardId: 'MBZ-004', serial: 'S4D5692-L1', pan: '•••• 7239', customer: '—',               branch: 'Head Office', action: 'RECEIVED',    actor: 'Demo Operator', timestamp: '2026-09-17T10:05:00+01:00', note: 'Batch MBZ-B004' },
  { id: 'EVT-013', cardId: 'MBZ-005', serial: 'S4D5700-A7', pan: '•••• 9440', customer: '—',               branch: 'Gwarinpa',    action: 'RECEIVED',    actor: 'Demo Operator', timestamp: '2026-09-18T09:50:00+01:00', note: 'Batch MBZ-B005' },
  { id: 'EVT-014', cardId: 'MBZ-006', serial: 'S4D5714-K4', pan: '•••• 1176', customer: '—',               branch: 'Mpape',       action: 'RECEIVED',    actor: 'Demo Operator', timestamp: '2024-05-10T14:00:00+01:00', note: 'Batch MBZ-B006' },
];

// Explicit fixture references mirror the corresponding issuance and stock records.
for (const event of activityEvents) {
  event.reference = event.action === 'RECEIVED' ? event.note.replace('Batch ', '')
    : event.action === 'ISSUED' ? `historical-${event.cardId}` : event.id;
}
