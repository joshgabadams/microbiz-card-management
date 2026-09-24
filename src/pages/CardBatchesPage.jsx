import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { ErrorState, LoadingState } from '../components/ui/DataState';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import DataTable from '../components/data/DataTable';
import StockTable from '../features/inventory/StockTable';
import { useInventory } from '../hooks/useInventory';

export default function CardBatchesPage() {
  const { data, isPending, isError, refetch } = useInventory();
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const batch = data?.batches.find(item => item.id === selected);
  const rows = (data?.batches || []).filter(item => (!branch || item.branch === branch) && [item.batch, item.product].some(value => value.toLowerCase().includes(search.trim().toLowerCase())));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 5)));
  const columns = [
    { key: 'batch', label: 'Batch' }, { key: 'product', label: 'Product' }, { key: 'scheme', label: 'Scheme' },
    { key: 'branch', label: 'Branch' }, { key: 'quantity', label: 'Received quantity' }, { key: 'available', label: 'Available now' },
    { key: 'receivedOn', label: 'Received' },
    { key: 'action', label: 'Details', render: row => <Button variant="secondary" onClick={() => setSelected(row.id)} aria-label={`View batch ${row.batch}`}>View batch</Button> },
  ];
  return <div className="page"><PageHeader title="Card Batches" description="Inspect received batches, quantities and the current status of their cards." actions={<Link className="btn btn-primary" to="/inventory/receive">Receive Cards</Link>} />
    {isPending ? <LoadingState label="Loading batches…" /> : isError ? <ErrorState onRetry={refetch} /> : <section className="card table-card"><div className="table-toolbar"><FormField label="Search batches" type="search" value={search} placeholder="Batch reference or product" onChange={event => { setSearch(event.target.value); setPage(1); }} /><FormField label="Branch" as="select" value={branch} onChange={event => { setBranch(event.target.value); setPage(1); }}><option value="">All branches</option>{data.reference.branches.map(value => <option key={value}>{value}</option>)}</FormField><Button variant="secondary" onClick={() => { setSearch(''); setBranch(''); setPage(1); }}>Clear filters</Button></div><DataTable label="Card batches" columns={columns} rows={rows.slice((currentPage - 1) * 5, currentPage * 5)} total={rows.length} pageSize={5} page={currentPage} onPageChange={setPage} /></section>}
    <Modal open={Boolean(batch)} onClose={() => setSelected(null)} title={batch ? `Batch ${batch.batch}` : 'Batch details'} drawer>{batch && <><dl className="receipt-details batch-details"><div><dt>Received by</dt><dd>{batch.receivedBy}</dd></div><div><dt>Date received</dt><dd>{batch.receivedOn}</dd></div><div><dt>Quantity / available</dt><dd>{batch.quantity} received / {batch.available} available</dd></div></dl><StockTable cards={batch.cards} label="Batch cards" /></>}</Modal>
  </div>;
}
