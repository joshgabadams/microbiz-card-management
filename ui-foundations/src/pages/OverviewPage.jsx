import { useState } from 'react';
import { Ban, CalendarClock, CheckCircle2, CreditCard, PackageOpen, RefreshCw, Send, Snowflake } from 'lucide-react';
import Link from '../components/layout/PermissionLink';
import MetricCard from '../components/ui/MetricCard';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import DataTable from '../components/data/DataTable';
import { EmptyState, ErrorState, LoadingState, Skeleton } from '../components/ui/DataState';
import { useDashboard } from '../hooks/useDashboard';
import { AttentionQueue, InventoryHealth, QuickActions, StatusDistribution } from '../features/dashboard/DashboardPanels';

const metrics = [
  { key: 'total', label: 'Total Cards', icon: CreditCard, caption: 'Cards in this scope' },
  { key: 'available', label: 'Available Cards', icon: PackageOpen, caption: 'Ready for issuance' },
  { key: 'issued', label: 'Issued Cards', icon: Send, caption: 'With an issuance record, across statuses' },
  { key: 'active', label: 'Active Cards', icon: CheckCircle2, caption: 'Current active status' },
  { key: 'frozen', label: 'Frozen Cards', icon: Snowflake, caption: 'Current frozen status' },
  { key: 'blocked', label: 'Blocked Cards', icon: Ban, caption: 'Current blocked status' },
  { key: 'expired', label: 'Expired Cards', icon: CalendarClock, caption: 'Current expired status' },
  { key: 'issuedToday', label: 'Cards Issued Today', icon: Send, caption: 'On the demo snapshot date' },
];
const formatDate = value => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
const issuanceColumns = [
  { key: 'customer', label: 'Customer' },
  { key: 'serial', label: 'Card', render: card => <Link className="text-link" to={`/cards/${card.id}`} aria-label={`View card ${card.serial}`}>{card.serial}<span className="cell-secondary">{card.pan}</span></Link> },
  { key: 'product', label: 'Product' },
  { key: 'branch', label: 'Branch' },
  { key: 'status', label: 'Current status', render: card => <StatusBadge status={card.status} /> },
  { key: 'issuedOn', label: 'Issued', render: card => <time dateTime={card.issuedOn}>{formatDate(card.issuedOn)}</time> },
];

function DashboardLoading() {
  return <section aria-label="Loading dashboard" aria-busy="true"><LoadingState label="Loading card operations…" /><div className="kpi-grid">{metrics.map(metric => <div className="card kpi" key={metric.key}><Skeleton /><Skeleton /></div>)}</div></section>;
}

export default function OverviewPage() {
  const [branch, setBranch] = useState('');
  const { data, isPending, isError, error, isFetching, refetch } = useDashboard(branch);
  return <div className="page dashboard-page">
    <PageHeader title="Cards Overview" description="Monitor card inventory, issuance and lifecycle status across MicroBiz." actions={<Link className="btn btn-primary" to="/inventory/receive"><PackageOpen size={17} aria-hidden="true" /> Receive Cards</Link>} />
    <div className="dashboard-toolbar card">
      <FormField label="Branch scope" as="select" value={branch} onChange={event => setBranch(event.target.value)} disabled={isPending}><option value="">All branches</option>{(data?.branches || (branch ? [branch] : [])).map(name => <option key={name}>{name}</option>)}</FormField>
      <p className="dashboard-caption" role="status">{data ? <>Demo snapshot · <time dateTime={data.reportingDate}>{formatDate(data.reportingDate)}</time><br />{data.scope} · Counts use sample records</> : 'Demo workspace · sample records only'}</p>
      <Button variant="secondary" loading={isFetching} onClick={() => refetch()}><RefreshCw size={16} aria-hidden="true" /> Refresh</Button>
    </div>
    {isPending ? <DashboardLoading /> : isError ? <ErrorState error={error} onRetry={refetch} /> : <>
      <section aria-label="Card summary" className="kpi-grid">{metrics.map(({ key, ...metric }) => <MetricCard key={key} {...metric} value={data.metrics[key].toLocaleString('en-GB')} />)}</section>
      <p className="dashboard-caption metric-note">Issued counts overlap current statuses. “Today” refers to the snapshot date.</p>
      <div className="dashboard-grid"><InventoryHealth rows={data.inventory} /><QuickActions /></div>
      <div className="dashboard-grid"><AttentionQueue items={data.attention} /><StatusDistribution rows={data.distribution} total={data.metrics.total} /></div>
      <section className="card table-card" aria-labelledby="recent-issuance-title"><div className="section-title dashboard-table-heading"><div><h2 id="recent-issuance-title">Recent Card Issuance</h2><p className="dashboard-caption">Latest five issuance records in this scope, newest first.</p></div><Link className="text-link" to="/issuance/history">Issuance history</Link></div>
        {data.recentIssuance.length ? <DataTable label="Recent card issuance" columns={issuanceColumns} rows={data.recentIssuance} /> : <EmptyState title="No cards issued yet" description="There are no issuance records for this branch scope." />}
      </section>
    </>}
    {(isPending || isError) && <div className="dashboard-fallback-actions"><QuickActions /></div>}
  </div>;
}
