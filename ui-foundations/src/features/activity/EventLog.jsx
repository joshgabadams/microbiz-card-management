import { useState } from 'react';
import Link from '../../components/layout/PermissionLink';
import { Activity, Eye, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEventLog, useEventOptions } from '../../hooks/useActivity';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/data/DataTable';
import FormField from '../../components/ui/FormField';
import EventBadge from '../../components/ui/EventBadge';
import Button from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/DataState';
import AuditDetailDrawer from './AuditDetailDrawer';
import { formatEventTime } from '../../utils/eventTime';

const emptyFilters = { search: '', reference: '', actor: '', action: '', branch: '', from: '', to: '' };
const PAGE_SIZE = 10;

export default function EventLog({ audit = false }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const result = useEventLog(filters, audit);
  const options = useEventOptions(audit);
  const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const events = invalidRange ? [] : result.data || [];
  const currentPage = Math.min(page, Math.max(1, Math.ceil(events.length / PAGE_SIZE)));
  const title = audit ? 'Audit Trail' : 'Card Activity';
  const label = audit ? 'Audit events' : 'Card activity events';
  const change = key => event => {
    setFilters(previous => ({ ...previous, [key]: event.target.value }));
    setPage(1);
  };
  function clear() { setFilters(emptyFilters); setPage(1); }
  function refresh() { result.refetch(); options.refetch(); }

  const columns = [
    { key: 'action', label: 'Action', render: event => <EventBadge action={event.action} /> },
    { key: 'serial', label: 'Card / customer', render: event => <>
      <Link className="text-link" to={`/cards/${event.cardId}`}>{event.serial}</Link>
      <span className="cell-secondary">{event.pan}</span>
      <span className="cell-secondary">{event.customer}</span>
    </> },
    { key: 'branch', label: 'Branch' },
    { key: 'actor', label: 'Actor' },
    { key: 'timestamp', label: 'Timestamp (WAT)', render: event => <time dateTime={event.timestamp}>{formatEventTime(event.timestamp)}</time> },
    { key: 'reference', label: 'Reference', render: event => <>
      <span className="event-reference">{event.reference}</span>
      {event.id !== event.reference && <span className="cell-secondary event-reference">{event.id}</span>}
    </> },
    ...(audit ? [{ key: 'details', label: 'Details', render: event => <Button variant="secondary" onClick={() => setSelected(event)} aria-label={`View audit event ${event.id}`}><Eye size={16} aria-hidden="true" /> View</Button> }]
      : [{ key: 'note', label: 'Note', render: event => <span className="event-note">{event.note || '—'}</span> }]),
  ];

  return <div className="page controls-page">
    <PageHeader title={title} description={audit ? 'Review recorded stock and sensitive card operations.' : 'Trace card lifecycle events across branches and operators.'}
      actions={<Button variant="secondary" onClick={refresh} loading={result.isFetching || options.isFetching}><RefreshCw size={16} aria-hidden="true" /> Refresh</Button>} />
    <p className="info-box">Demo records include this session’s completed issuance and stock receipts and reset on reload. Dates and times use West Africa Time (Lagos, UTC+01:00).{audit && ' Audit details are read-only.'}</p>
    <section className="card table-card" aria-label={title}>
      <div className="table-toolbar event-filters">
        <FormField label="Search events" type="search" placeholder="Customer, serial or last four" value={filters.search} onChange={change('search')} />
        <FormField label="Reference" type="search" placeholder="Event, receipt, batch or card ID" value={filters.reference} onChange={change('reference')} />
        {['actor', 'action', 'branch'].map(key => <FormField key={key} label={key[0].toUpperCase() + key.slice(1)} as="select" value={filters[key]} onChange={change(key)} disabled={options.isPending || options.isError}>
          <option value="">All {key === 'branch' ? 'branches' : `${key}s`}</option>
          {(options.data?.[key] || []).map(value => <option key={value}>{value}</option>)}
        </FormField>)}
        <FormField label="From date (WAT)" type="date" value={filters.from} max={filters.to || undefined} onChange={change('from')} />
        <FormField label="To date (WAT)" type="date" value={filters.to} min={filters.from || undefined} onChange={change('to')} error={invalidRange ? 'End date must be on or after start date.' : undefined} />
        <Button variant="secondary" onClick={clear}>Clear filters</Button>
      </div>
      {options.isError && <ErrorState error={options.error} onRetry={options.refetch} />}
      <div className="event-log-heading">
        <span className="dashboard-caption" role="status">{result.isPending ? 'Loading records…' : result.isError ? 'Records unavailable' : `${events.length} ${events.length === 1 ? 'event' : 'events'}${Object.values(filters).some(Boolean) ? ' matching filters' : ' recorded'} · Newest first`}</span>
        <span className="dashboard-caption">{audit ? <ShieldCheck size={16} aria-hidden="true" /> : <Activity size={16} aria-hidden="true" />} {audit ? 'Read-only history' : 'All lifecycle events'}</span>
      </div>
      <DataTable label={label} columns={columns} rows={events.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)}
        loading={result.isPending} error={result.isError ? result.error : null} onRetry={result.refetch}
        page={currentPage} pageSize={PAGE_SIZE} total={events.length} onPageChange={setPage}
        emptyIcon={audit ? ShieldCheck : Activity} emptyTitle={invalidRange ? 'Check the date range' : 'No matching events'}
        emptyDescription={invalidRange ? 'Choose an end date on or after the start date.' : 'Try different filters or clear them to view all recorded events.'}
        emptyAction={<Button variant="secondary" onClick={clear}>Reset filters</Button>} />
    </section>
    {audit && <AuditDetailDrawer event={selected} onClose={() => setSelected(null)} />}
  </div>;
}
