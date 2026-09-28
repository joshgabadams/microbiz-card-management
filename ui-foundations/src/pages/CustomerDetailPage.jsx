import { useParams } from 'react-router-dom';
import Link from '../components/layout/PermissionLink';
import PageHeader from '../components/layout/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/DataState';
import DataTable from '../components/data/DataTable';
import CustomerProfile from '../features/customers/CustomerProfile';
import StockTable from '../features/inventory/StockTable';
import { useCustomer } from '../hooks/useIssuance';

const columns = [{ key: 'type', label: 'Account type' }, { key: 'number', label: 'Account' }, { key: 'status', label: 'Status' }, { key: 'eligibility', label: 'Demo eligibility', render: account => account.eligible && account.status === 'ACTIVE' ? account.products.join(', ') : account.reason || 'Not eligible' }];
export default function CustomerDetailPage() {
  const { customerId } = useParams();
  const result = useCustomer(customerId);
  return <div className="page"><PageHeader title="Customer Profile" description="Review demo account eligibility and linked cards." actions={<Link className="btn btn-secondary" to="/customers">Customer lookup</Link>} />
    {result.isPending ? <LoadingState /> : result.isError ? <ErrorState error={result.error} onRetry={result.refetch} /> : !result.data ? <EmptyState title="Customer not found" description="Return to lookup and select a customer." /> : <><section className="card section-card"><CustomerProfile customer={result.data}>{result.data.status === 'ACTIVE' && <Link className="btn btn-primary" to={`/issuance/new?customer=${encodeURIComponent(customerId)}`}>Issue card</Link>}</CustomerProfile><h2>Accounts</h2><p className="dashboard-caption">Eligibility and product/branch restrictions are illustrative demo capabilities.</p><DataTable label="Customer accounts" columns={columns} rows={result.data.accounts} /></section><h2>Linked cards</h2><StockTable cards={result.data.cards} label="Customer linked cards" /></>}
  </div>;
}
