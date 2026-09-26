import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Link from '../components/layout/PermissionLink';
import { ArrowLeft, User } from 'lucide-react';
import { useCardDetail } from '../hooks/useCardDetail';
import { useCardActions } from '../hooks/useCardActions';
import { useCustomer } from '../hooks/useIssuance';
import CardVisual from '../components/cards/CardVisual';
import StatusBadge from '../components/ui/StatusBadge';
import PageHeader from '../components/layout/PageHeader';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataState';
import CardTimeline from '../features/cards/CardTimeline';
import LifecycleActions from '../features/cards/LifecycleActions';
import ReasonModal from '../features/cards/ReasonModal';
import { maskPan } from '../utils/maskPan';

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <label>{label}</label>
      <strong>{value || '—'}</strong>
    </div>
  );
}

export default function CardDetailPage() {
  const { cardId } = useParams();
  const { data: card, isPending, isError, error, refetch } = useCardDetail(cardId);
  const actions = useCardActions(cardId);

  const [activeAction, setActiveAction] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const customerQuery = useCustomer(card?.customerId);
  const customer = customerQuery.data;

  const currentMutation = activeAction ? actions[activeAction] : null;
  const isBusy = currentMutation?.isPending ?? false;
  const actionError = currentMutation?.error?.message ?? null;

  function handleAction(key) {
    setActiveAction(key);
    actions[key]?.reset?.();
  }

  function handleModalClose() {
    setActiveAction(null);
  }

  function handleConfirm(reason) {
    if (!activeAction) return;
    actions[activeAction].mutate(reason, {
      onSuccess: () => setActiveAction(null),
    });
  }

  if (isPending) return <div className="page"><PageHeader title="Card Profile" description="Loading card details." /><LoadingState label="Loading card profile…" /></div>;
  if (isError)   return <div className="page"><PageHeader title="Card Profile" description="Card details could not be loaded." /><ErrorState error={error} onRetry={refetch} /></div>;
  if (!card)     return (
    <div className="page">
      <PageHeader title="Card Profile" description="The requested card is unavailable." />
      <EmptyState
        title="Card not found"
        description="This card ID does not exist or you may not have permission to view it."
        action={<Link className="btn btn-secondary" to="/cards"><ArrowLeft size={15} aria-hidden="true" /> All Cards</Link>}
      />
    </div>
  );

  const tabs = [
    {
      value: 'overview',
      label: 'Overview',
      content: (
        <div className="card-tab-panel">
          <div className="detail-grid">
            <DetailItem label="Masked PAN"    value={maskPan(card.pan)} />
            <DetailItem label="Card Serial"   value={card.serial} />
            <DetailItem label="Expiry Date"   value={card.expiry} />
            <DetailItem label="Card Scheme"   value={card.scheme} />
            <DetailItem label="Card Product"  value={card.product} />
            <DetailItem label="Branch"        value={card.branch} />
            <DetailItem label="Batch"         value={card.batch} />
            <DetailItem label="Date Issued"   value={card.issuedAt} />
          </div>
        </div>
      ),
    },
    {
      value: 'activity',
      label: 'Activity',
      content: (
        <div className="card-tab-panel">
          <CardTimeline events={card.timeline ?? []} />
        </div>
      ),
    },
    {
      value: 'customer',
      label: 'Customer',
      content: (
        <div className="card-tab-panel">
          {card.customerId && customerQuery.isPending ? <LoadingState label="Loading linked customer…" /> : customerQuery.isError ? <ErrorState error={customerQuery.error} onRetry={customerQuery.refetch} /> : customer ? (
            <div className="card-customer-mini">
              <div className="customer-profile-heading">
                <div className="avatar" aria-hidden="true">
                  {customer.name.split(' ').slice(0, 2).map(p => p[0]).join('')}
                </div>
                <div>
                  <h3>{customer.name}</h3>
                  <p className="dashboard-caption">{customer.id} · {customer.branch}</p>
                </div>
                <StatusBadge status={customer.status} />
              </div>
              <dl className="receipt-details" style={{ marginTop: 'var(--space-4)' }}>
                <div><dt>Account Number</dt><dd>{customer.account}</dd></div>
                <div><dt>Phone</dt><dd>{customer.phone}</dd></div>
                <div><dt>Linked Account</dt><dd>{card.account}</dd></div>
              </dl>
              <div className="page-actions" style={{ marginTop: 'var(--space-4)' }}>
                <Link className="btn btn-secondary" to={`/customers/${customer.id}`}>
                  <User size={15} aria-hidden="true" /> View Full Profile
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={User}
              title="No customer linked"
              description={
                card.status === 'AVAILABLE'
                  ? 'This card is unissued and available for issuance.'
                  : 'Customer relationship data is not available for this card.'
              }
              action={
                card.status === 'AVAILABLE'
                  ? <Link className="btn btn-primary" to="/issuance/new">Issue this Card</Link>
                  : undefined
              }
            />
          )}
        </div>
      ),
    },
    {
      value: 'cardinfo',
      label: 'Card Information',
      content: (
        <div className="card-tab-panel">
          <div className="detail-grid">
            <DetailItem label="Scheme"        value={card.scheme} />
            <DetailItem label="Product"       value={card.product} />
            <DetailItem label="Batch"         value={card.batch} />
            <DetailItem label="Branch"        value={card.branch} />
            <DetailItem label="Date Received" value={card.receivedOn} />
            <DetailItem label="Received By"   value={card.receivedBy} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Card Profile"
        description="Card detail, customer relationship and lifecycle controls."
        actions={
          <Link className="btn btn-secondary" to="/cards">
            <ArrowLeft size={15} aria-hidden="true" /> All Cards
          </Link>
        }
      />

      <div className="card-detail-grid">
        <div>
          <CardVisual card={card} />
          <LifecycleActions card={card} onAction={handleAction} busy={isBusy} />
        </div>

        <section className="card detail-panel" aria-label={`Card ${card.serial} detail`}>
          <div className="section-title" style={{ marginBottom: 0 }}>
            <h2 style={{ fontSize: '1rem' }}>{card.serial}</h2>
            <StatusBadge status={card.status} />
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <Tabs
              label="Card detail sections"
              items={tabs}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </section>
      </div>

      <ReasonModal
        open={Boolean(activeAction)}
        actionKey={activeAction}
        onClose={handleModalClose}
        onConfirm={handleConfirm}
        busy={isBusy}
        error={actionError}
      />
    </div>
  );
}
