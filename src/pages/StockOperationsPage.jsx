import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import { ErrorState, LoadingState, EmptyState } from '../components/ui/DataState';
import { useInventory } from '../hooks/useInventory';
import StockTable from '../features/inventory/StockTable';

function OperationsForm({ data, reconciliation }) {
  const [branch, setBranch] = useState('');
  const [destination, setDestination] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const rows = data.cards.filter(card => card.status === 'AVAILABLE' && card.branch === branch && (!product || card.product === product));
  const count = Number(quantity);
  const validCount = quantity !== '' && Number.isInteger(count) && count >= (reconciliation ? 0 : 1);
  const canPreview = branch && validCount && (reconciliation || (destination && destination !== branch && count <= rows.length));
  function changeScope(setter) { return event => { setter(event.target.value); setQuantity(''); }; }
  return <>
    <section className="card section-card">
      <p className="info-box">{reconciliation ? 'Compare a physical count with demo AVAILABLE stock. Counts are not saved and discrepancies cannot be resolved here yet.' : 'Inspect demo AVAILABLE stock before a transfer. Transfers cannot be submitted until backend permissions and movement rules are supplied.'}</p>
      <div className="receipt-fields">
        <FormField label={reconciliation ? 'Count branch' : 'Source branch'} as="select" value={branch} onChange={event => { setBranch(event.target.value); setDestination(''); setQuantity(''); }}><option value="">Select branch</option>{data.reference.branches.map(value => <option key={value}>{value}</option>)}</FormField>
        {!reconciliation && <FormField label="Destination branch" as="select" value={destination} onChange={event => setDestination(event.target.value)}><option value="">Select destination</option>{data.reference.branches.filter(value => value !== branch).map(value => <option key={value}>{value}</option>)}</FormField>}
        <FormField label="Product scope" as="select" value={product} onChange={changeScope(setProduct)}><option value="">All products</option>{data.reference.products.map(value => <option key={value}>{value}</option>)}</FormField>
        <FormField label={reconciliation ? 'Physical count' : 'Requested quantity'} type="number" min={reconciliation ? 0 : 1} value={quantity} onChange={event => setQuantity(event.target.value)} hint="Preview only; no records will be changed." error={quantity !== '' && (!validCount || (!reconciliation && count > rows.length)) ? (reconciliation ? 'Enter a nonnegative whole number.' : 'Enter a whole number within the available stock range.') : undefined} />
      </div>
      {branch && <p><strong>{rows.length} available cards</strong> in the selected stock scope.</p>}
      {canPreview && <div className="info-box" role="status">{reconciliation ? <>Expected: {rows.length}. Counted: {count}. Difference: {count - rows.length}. {count === rows.length ? 'Counts match.' : 'Discrepancy requires review.'}</> : <>Preview: {count} cards from {branch} to {destination}. Individual card selection and authorization will be supplied by the transfer workflow.</>}</div>}
      <div className="receipt-footer"><Button disabled aria-describedby="operation-unavailable">{reconciliation ? 'Submit reconciliation' : 'Submit transfer'}</Button></div><p id="operation-unavailable" className="dashboard-caption">Submission is unavailable. No stock movement or reconciliation record will be created.</p>
    </section>
    {branch ? <StockTable key={`${branch}-${product}`} cards={rows} label="Stock in selected scope" availableOnly /> : <EmptyState title="Select a branch to inspect stock" description="Only cards with AVAILABLE status are included in this preview." />}
  </>;
}
export default function StockOperationsPage({ reconciliation = false }) {
  const { data, isPending, isError, refetch } = useInventory();
  return <div className="page"><PageHeader title={reconciliation ? 'Stock Reconciliation' : 'Stock Transfers'} description={reconciliation ? 'Review expected and physical counts in a demo stock scope.' : 'Review branch stock and prepare the context for a future transfer.'} />
    {isPending ? <LoadingState label="Loading branch stock…" /> : isError ? <ErrorState onRetry={refetch} /> : <OperationsForm key={String(reconciliation)} data={data} reconciliation={reconciliation} />}
  </div>;
}
