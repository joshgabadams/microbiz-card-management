import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/ui/MetricCard';
import { ErrorState, LoadingState } from '../components/ui/DataState';
import { useInventory } from '../hooks/useInventory';
import StockTable from '../features/inventory/StockTable';

export default function InventoryPage({ availableOnly = false }) {
  const { data, isPending, isError, refetch } = useInventory();
  return <div className="page"><PageHeader title={availableOnly ? 'Available Cards' : 'Card Inventory'} description="Track card stock by serial, masked PAN, product, batch and branch." actions={<><Link className="btn btn-secondary" to="/inventory/batches">Card Batches</Link><Link className="btn btn-primary" to="/inventory/receive"><PackageOpen size={17} /> Receive Cards</Link></>} />
    <p className="info-box">Demo stock only. Received cards remain in this tab’s memory and reset when the page is reloaded.</p>
    {isPending ? <LoadingState label="Loading inventory…" /> : isError ? <ErrorState onRetry={refetch} /> : <>
      <div className="kpi-grid">
        <MetricCard label="Tracked Cards" value={data.cards.length} caption="All statuses, including previously issued" />
        <MetricCard label="Available Stock" value={data.cards.filter(card => card.status === 'AVAILABLE').length} caption="Cards ready for issuance" />
        <MetricCard label="Received Batches" value={data.batches.length} caption="In this demo session" />
        <MetricCard label="Low-stock Branches" value={data.reference.branches.filter(branch => data.cards.filter(card => card.branch === branch && card.status === 'AVAILABLE').length < data.reference.minimumAvailable).length} caption={`Demo minimum: ${data.reference.minimumAvailable} available per branch`} />
      </div>
      <StockTable cards={data.cards} availableOnly={availableOnly} label={availableOnly ? 'Available cards' : 'Card inventory'} />
    </>}
  </div>;
}
