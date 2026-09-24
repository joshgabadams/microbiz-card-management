import { useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/data/DataTable';
import FormField from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { maskPan } from '../../utils/maskPan';

const columns = [
  { key: 'serial', label: 'Serial', render: card => <Link className="text-link" to={`/cards/${card.id}`}>{card.serial}</Link> },
  { key: 'pan', label: 'Masked PAN', render: card => maskPan(card.pan) },
  { key: 'product', label: 'Product / Scheme', render: card => <>{card.product}<span className="cell-secondary">{card.scheme}</span></> },
  { key: 'branch', label: 'Branch' },
  { key: 'batch', label: 'Batch' },
  { key: 'expiry', label: 'Expiry' },
  { key: 'receivedOn', label: 'Received' },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status', render: card => <StatusBadge status={card.status} /> },
];
export default function StockTable({ cards, availableOnly = false, label = 'Card stock' }) {
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [product, setProduct] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const scoped = cards.filter(card => !availableOnly || card.status === 'AVAILABLE');
  const rows = scoped.filter(card => (!branch || card.branch === branch) && (!product || card.product === product) && (!status || card.status === status) && [card.serial, maskPan(card.pan), card.batch].some(value => value.toLowerCase().includes(search.trim().toLowerCase())));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 5)));
  const change = setter => event => { setter(event.target.value); setPage(1); };
  function reset() { setSearch(''); setBranch(''); setProduct(''); setStatus(''); setPage(1); }
  return <section className="card table-card"><div className="table-toolbar">
    <FormField label="Search stock" type="search" placeholder="Serial, last four digits or batch" value={search} onChange={change(setSearch)} />
    <FormField label="Branch" as="select" value={branch} onChange={change(setBranch)}><option value="">All branches</option>{[...new Set(scoped.map(card => card.branch))].map(value => <option key={value}>{value}</option>)}</FormField>
    <FormField label="Product" as="select" value={product} onChange={change(setProduct)}><option value="">All products</option>{[...new Set(scoped.map(card => card.product))].map(value => <option key={value}>{value}</option>)}</FormField>
    {!availableOnly && <FormField label="Status" as="select" value={status} onChange={change(setStatus)}><option value="">All statuses</option>{[...new Set(scoped.map(card => card.status))].map(value => <option key={value}>{value}</option>)}</FormField>}
    <Button variant="secondary" onClick={reset}>Clear filters</Button>
  </div><DataTable label={label} columns={columns} rows={rows.slice((currentPage - 1) * 5, currentPage * 5)} page={currentPage} pageSize={5} total={rows.length} onPageChange={setPage} /></section>;
}
