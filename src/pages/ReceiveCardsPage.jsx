import PageHeader from '../components/layout/PageHeader';
import { ErrorState, LoadingState } from '../components/ui/DataState';
import ReceiptForm from '../features/inventory/ReceiptForm';
import { useInventory } from '../hooks/useInventory';

export default function ReceiveCardsPage() {
  const { data, isPending, isError, refetch } = useInventory();
  return <div className="page"><PageHeader title="Receive Cards" description="Enter a batch, validate individual cards, then review and confirm stock receipt." />
    {isPending ? <LoadingState label="Loading stock intake…" /> : isError ? <ErrorState onRetry={refetch} /> : <ReceiptForm reference={data.reference} existingCards={data.cards} />}
  </div>;
}
