import {
  LayoutDashboard,
  CreditCard,
  Send,
  Users,
  PackageOpen,
  History,
  ShieldCheck,
  Settings,
  Boxes,
  CircleDot,
  Snowflake,
  Ban,
  CalendarClock,
  ReceiptText,
  UserRoundCog,
  Building2,
  ArrowLeftRight,
  ClipboardCheck,
  Layers3,
} from 'lucide-react';

export const navigation = [
  { label: 'Overview', icon: LayoutDashboard, to: '/overview' },
  {
    label: 'Cards',
    icon: CreditCard,
    children: [
      { label: 'All Cards', icon: Layers3, to: '/cards' },
      { label: 'Available', icon: CircleDot, to: '/cards/available' },
      { label: 'Issued', icon: CreditCard, to: '/cards/issued' },
      { label: 'Frozen', icon: Snowflake, to: '/cards/frozen' },
      { label: 'Blocked', icon: Ban, to: '/cards/blocked' },
      { label: 'Expired', icon: CalendarClock, to: '/cards/expired' },
    ],
  },
  {
    label: 'Issuance',
    icon: Send,
    children: [
      { label: 'Issue Card', icon: Send, to: '/issuance/new' },
      { label: 'Issuance History', icon: ReceiptText, to: '/issuance/history' },
    ],
  },
  { label: 'Customers', icon: Users, to: '/customers' },
  {
    label: 'Inventory',
    icon: PackageOpen,
    children: [
      { label: 'Stock Overview', icon: Boxes, to: '/inventory' },
      { label: 'Receive Cards', icon: PackageOpen, to: '/inventory/receive' },
      { label: 'Card Batches', icon: Layers3, to: '/inventory/batches' },
      { label: 'Stock Transfers', icon: ArrowLeftRight, to: '/inventory/transfers' },
      { label: 'Reconciliation', icon: ClipboardCheck, to: '/inventory/reconciliation' },
    ],
  },
  {
    label: 'Controls',
    icon: ShieldCheck,
    children: [
      { label: 'Card Activity', icon: History, to: '/activity' },
      { label: 'Audit Trail', icon: ShieldCheck, to: '/audit' },
      { label: 'Approvals', icon: ClipboardCheck, to: '/approvals' },
    ],
  },
  {
    label: 'Administration',
    icon: UserRoundCog,
    children: [
      { label: 'Card Products', icon: CreditCard, to: '/admin/card-products' },
      { label: 'Branches', icon: Building2, to: '/admin/branches' },
      { label: 'Users & Roles', icon: UserRoundCog, to: '/admin/users' },
    ],
  },
  { label: 'Settings', icon: Settings, to: '/settings' },
];
