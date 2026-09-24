import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCards } from '../hooks/useCards';
import StatusBadge from '../components/ui/StatusBadge';
import PageHeader from '../components/layout/PageHeader';
import FormField from '../components/ui/FormField';
import DataTable from '../components/data/DataTable';
import { maskPan } from '../utils/maskPan';

const columns = [
  { key: 'serial', label: 'Serial', render: card => <strong>{card.serial}</strong> },
  { key: 'pan', label: 'Masked PAN', render: card => maskPan(card.pan) },
  { key: 'customer', label: 'Customer' }, { key: 'product', label: 'Product' },
  { key: 'branch', label: 'Branch' },
  { key: 'status', label: 'Status', render: card => <StatusBadge status={card.status} /> },
  { key: 'action', label: 'Action', render: card => <Link className="text-link" to={`/cards/${card.id}`} aria-label={`View card ${card.serial}`}>View card</Link> },
];
export default function CardsPage({ title, filter }) {
  const { data: cards = [], isPending, isError, refetch } = useCards();
  const products = [...new Set(cards.map(card => card.product))];
  const branches = [...new Set(cards.map(card => card.branch))];
  const [search, setSearch] = useState('');
  const [product, setProduct] = useState('');
  const [branch, setBranch] = useState('');
  const [page, setPage] = useState(1);
  const rows = cards.filter(card => (filter === 'all' || (filter === 'issued' ? card.customer !== '—' : card.status === filter))
    && (!product || card.product === product) && (!branch || card.branch === branch)
    && [card.serial, maskPan(card.pan), card.customer].some(value => value.toLowerCase().includes(search.trim().toLowerCase())));
  const pageSize = 5;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  function change(setter) { return event => { setter(event.target.value); setPage(1); }; }
  return <div className="page"><PageHeader title={title} description="Search and inspect cards in the MicroBiz card estate." actions={<Link className="btn btn-primary" to="/issuance/new"><CreditCard size={17} /> Issue Card</Link>} />
    <section className="card table-card"><div className="table-toolbar">
      <FormField label="Search cards" type="search" value={search} onChange={change(setSearch)} placeholder="Serial, last four digits or customer" />
      <FormField label="Product" as="select" value={product} onChange={change(setProduct)}><option value="">All products</option>{products.map(value => <option key={value}>{value}</option>)}</FormField>
      <FormField label="Branch" as="select" value={branch} onChange={change(setBranch)}><option value="">All branches</option>{branches.map(value => <option key={value}>{value}</option>)}</FormField>
    </div><DataTable loading={isPending} error={isError} onRetry={refetch} label={title} columns={columns} rows={rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)} total={rows.length} page={currentPage} pageSize={pageSize} onPageChange={setPage} /></section>
  </div>;
}
