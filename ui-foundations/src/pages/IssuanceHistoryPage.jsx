import { useState } from 'react';
import Link from '../components/layout/PermissionLink';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/data/DataTable';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { ErrorState, LoadingState } from '../components/ui/DataState';
import { useIssuanceHistory } from '../hooks/useIssuance';

const columns = [
  { key: 'customer', label: 'Customer', render: row => row.customerId ? <Link className="text-link" to={`/customers/${row.customerId}`}>{row.customer}</Link> : row.customer },
  { key: 'serial', label: 'Card serial', render: row => <Link className="text-link" to={`/cards/${row.cardId}`}>{row.serial}</Link> },
  { key: 'pan', label: 'Masked PAN' }, { key: 'account', label: 'Account' }, { key: 'product', label: 'Product' }, { key: 'branch', label: 'Branch' },
  { key: 'issuedOn', label: 'Issued' }, { key: 'status', label: 'Event', render: row => <StatusBadge status={row.status} /> },
];
export default function IssuanceHistoryPage() {
  const result = useIssuanceHistory();
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [page, setPage] = useState(1);
  const rows = (result.data || []).filter(row => (!branch || row.branch === branch) && [row.customer, row.serial, row.pan, row.account, row.id].some(value => value.toLowerCase().includes(search.trim().toLowerCase())));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 5)));
  return <div className="page"><PageHeader title="Issuance History" description="Completed issuance events from demo fixtures and this session." actions={<Link className="btn btn-primary" to="/issuance/new">Issue card</Link>} /><p className="info-box">These are issuance events, not current card statuses. Session receipts reset on reload; failed attempts do not create issuance records.</p>
    {result.isPending ? <LoadingState /> : result.isError ? <ErrorState error={result.error} onRetry={result.refetch} /> : <section className="card table-card"><div className="table-toolbar"><FormField label="Search issuance" type="search" placeholder="Customer, serial, last four or receipt" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /><FormField label="Branch" as="select" value={branch} onChange={event => { setBranch(event.target.value); setPage(1); }}><option value="">All branches</option>{[...new Set(result.data.map(row => row.branch))].map(value => <option key={value}>{value}</option>)}</FormField><Button variant="secondary" onClick={() => { setSearch(''); setBranch(''); setPage(1); }}>Clear filters</Button></div><DataTable label="Issuance history" columns={columns} rows={rows.slice((currentPage - 1) * 5, currentPage * 5)} total={rows.length} page={currentPage} pageSize={5} onPageChange={setPage} /></section>}
  </div>;
}
