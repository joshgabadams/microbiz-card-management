export const cards = [
  {
    id: 'MBZ-001', batch: 'MBZ-B001', scheme: 'Verve',
    receivedOn: '2026-09-18', receivedBy: 'Demo Operator',
    serial: 'S4D5678-Y5', pan: '•••• •••• •••• 4567',
    product: 'Professional Debit', branch: 'Head Office',
    status: 'ACTIVE', customerId: 'CUS-10021',
    customer: 'Godwin Chika O.', account: '•••• 7891',
    expiry: '07/28', issuedAt: '22 Sep 2026', issuedOn: '2026-09-22',
    timeline: [
      { event: 'Card activated by cardholder', timestamp: '22 Sep 2026, 11:14 AM', actor: 'System' },
      { event: 'Card issued to Godwin Chika O.', timestamp: '22 Sep 2026, 10:42 AM', actor: 'Demo Operator', note: 'Savings Account •••• 7891' },
      { event: 'Card received into inventory (Batch MBZ-B001)', timestamp: '18 Sep 2026, 09:30 AM', actor: 'Demo Operator' },
    ],
  },
  {
    id: 'MBZ-002', batch: 'MBZ-B002', scheme: 'Verve',
    receivedOn: '2026-09-18', receivedBy: 'Demo Operator',
    serial: 'S4D5681-P3', pan: '•••• •••• •••• 8812',
    product: 'Business Debit', branch: 'Mpape',
    status: 'AVAILABLE', customerId: null,
    customer: '—', account: '—', expiry: '08/28', issuedAt: '—',
    timeline: [
      { event: 'Card received into inventory (Batch MBZ-B002)', timestamp: '18 Sep 2026, 09:35 AM', actor: 'Demo Operator' },
    ],
  },
  {
    id: 'MBZ-003', batch: 'MBZ-B003', scheme: 'Verve',
    receivedOn: '2026-09-18', receivedBy: 'Demo Operator',
    serial: 'S4D5688-Q8', pan: '•••• •••• •••• 2901',
    product: 'Professional Debit', branch: 'Kubwa',
    status: 'FROZEN', customerId: 'CUS-10031',
    customer: 'Ada Okafor', account: '•••• 3024',
    expiry: '09/28', issuedAt: '21 Sep 2026', issuedOn: '2026-09-21',
    timeline: [
      { event: 'Card frozen by operator', timestamp: '24 Sep 2026, 02:10 PM', actor: 'Demo Operator', note: 'Customer request — temporary travel hold' },
      { event: 'Card issued to Ada Okafor', timestamp: '21 Sep 2026, 09:21 AM', actor: 'Demo Operator', note: 'Savings Account •••• 3024' },
      { event: 'Card received into inventory (Batch MBZ-B003)', timestamp: '18 Sep 2026, 09:40 AM', actor: 'Demo Operator' },
    ],
  },
  {
    id: 'MBZ-004', batch: 'MBZ-B004', scheme: 'Verve',
    receivedOn: '2026-09-17', receivedBy: 'Demo Operator',
    serial: 'S4D5692-L1', pan: '•••• •••• •••• 7239',
    product: 'Business Debit', branch: 'Head Office',
    status: 'BLOCKED', customerId: 'CUS-10044',
    customer: 'Musa Bello', account: '•••• 1182',
    expiry: '10/28', issuedAt: '18 Sep 2026', issuedOn: '2026-09-18',
    timeline: [
      { event: 'Card blocked / hotlisted', timestamp: '23 Sep 2026, 04:55 PM', actor: 'Demo Operator', note: 'Suspected unauthorised transaction — under review' },
      { event: 'Card issued to Musa Bello', timestamp: '18 Sep 2026, 03:00 PM', actor: 'Demo Operator', note: 'Current Account •••• 1182' },
      { event: 'Card received into inventory (Batch MBZ-B004)', timestamp: '17 Sep 2026, 10:05 AM', actor: 'Demo Operator' },
    ],
  },
  {
    id: 'MBZ-005', batch: 'MBZ-B005', scheme: 'Verve',
    receivedOn: '2026-09-18', receivedBy: 'Demo Operator',
    serial: 'S4D5700-A7', pan: '•••• •••• •••• 9440',
    product: 'Professional Debit', branch: 'Gwarinpa',
    status: 'AVAILABLE', customerId: null,
    customer: '—', account: '—', expiry: '10/28', issuedAt: '—',
    timeline: [
      { event: 'Card received into inventory (Batch MBZ-B005)', timestamp: '18 Sep 2026, 09:50 AM', actor: 'Demo Operator' },
    ],
  },
  {
    id: 'MBZ-006', batch: 'MBZ-B006', scheme: 'Verve',
    receivedOn: '2024-05-10', receivedBy: 'Demo Operator',
    serial: 'S4D5714-K4', pan: '•••• •••• •••• 1176',
    product: 'Professional Debit', branch: 'Mpape',
    status: 'EXPIRED', customerId: null,
    customer: 'Tobi James', account: '•••• 9921',
    expiry: '07/26', issuedAt: '11 May 2024', issuedOn: '2024-05-11',
    timeline: [
      { event: 'Card expired — past stated expiry date', timestamp: '31 Jul 2026, 11:59 PM', actor: 'System' },
      { event: 'Card issued to Tobi James', timestamp: '11 May 2024, 11:00 AM', actor: 'Demo Operator', note: 'Savings Account •••• 9921' },
      { event: 'Card received into inventory (Batch MBZ-B006)', timestamp: '10 May 2024, 02:00 PM', actor: 'Demo Operator' },
    ],
  },
];

export const customers = [
  { id: 'CUS-10021', name: 'Godwin Chika O.', account: '234567891', phone: '080••••1234', branch: 'Head Office', status: 'ACTIVE' },
  { id: 'CUS-10031', name: 'Ada Okafor', account: '287901224', phone: '081••••3024', branch: 'Kubwa', status: 'ACTIVE' },
  { id: 'CUS-10044', name: 'Musa Bello', account: '290011182', phone: '070••••1182', branch: 'Mpape', status: 'ACTIVE' },
];
