import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/DataState';
import { ConfirmationModal } from '../components/ui/Modal';
import CardVisual from '../components/cards/CardVisual';
import CustomerSearch from '../features/customers/CustomerSearch';
import CustomerProfile from '../features/customers/CustomerProfile';
import { useCustomer, useIssuableCards, useIssueCard } from '../hooks/useIssuance';

const steps = ['Customer', 'Account', 'Card', 'PIN setup', 'Review'];

export default function IssueCardPage() {
  const [params] = useSearchParams();
  // Remount the workflow when a different profile starts issuance.
  return <IssuanceWorkflow key={params.get('customer') || 'new'} initialCustomer={params.get('customer') || ''} />;
}

function IssuanceWorkflow({ initialCustomer }) {
  const [step, setStep] = useState(initialCustomer ? 1 : 0);
  const [customerId, setCustomerId] = useState(initialCustomer);
  const [accountId, setAccountId] = useState('');
  const [cardId, setCardId] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const heading = useRef(null);
  const submitting = useRef(false);
  const customerQuery = useCustomer(customerId);
  const stock = useIssuableCards(customerId, accountId);
  const mutation = useIssueCard();
  const customer = customerQuery.data;
  const account = customer?.accounts.find(item => item.id === accountId && item.eligible && item.status === 'ACTIVE');
  const card = stock.data?.find(item => item.id === cardId);
  const valid = customer?.status === 'ACTIVE' && account && card;
  useEffect(() => { heading.current?.focus(); }, [step, receipt]);
  function selectCustomer(id) {
    setCustomerId(id); setAccountId(''); setCardId(''); setRequestId(null); mutation.reset(); setStep(1);
  }
  function selectAccount(id) {
    setAccountId(id); setCardId(''); setRequestId(null); mutation.reset();
  }
  function reset() {
    setCustomerId(''); setAccountId(''); setCardId(''); setRequestId(null);
    setReceipt(null); setStep(0); setConfirmOpen(false); setDiscardOpen(false); mutation.reset();
  }
  function review() { setRequestId(crypto.randomUUID()); setStep(4); }
  async function issue() {
    if (submitting.current || !valid) return;
    submitting.current = true;
    try {
      const result = await mutation.mutateAsync({ requestId, customerId, accountId, cardId });
      setConfirmOpen(false); setReceipt(result);
    } catch {
      // Render a safe error and refresh eligibility; never log request payloads.
      stock.refetch();
    } finally { submitting.current = false; }
  }
  const details = receipt || (valid ? { customer: customer.name, account: account.number, accountType: account.type, serial: card.serial, pan: card.pan, product: card.product, branch: card.branch } : null);
  const summary = details && <dl className="receipt-details">{[['Customer', details.customer], ['Account', `${details.accountType} · ${details.account}`], ['Card serial', details.serial], ['Masked PAN', details.pan], ['Product', details.product], ['Branch', details.branch]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
  return <div className="page issuance-page"><PageHeader title="Issue New Card" description="Select a customer, eligible account and available card, then review issuance." actions={<Link className="btn btn-secondary" to="/issuance/history">Issuance history</Link>} />
    <p className="info-box">Demo workspace. Issuance changes this tab’s mock stock only and resets on reload. No bank system is updated.</p>
    {receipt ? <section className="card section-card"><h2 ref={heading} tabIndex={-1}>Demo card issued</h2><p role="status">The card is now ISSUED and is no longer available for issuance. PIN setup and activation have not been performed.</p>{summary}<dl className="receipt-details"><div><dt>Receipt</dt><dd>{receipt.id}</dd></div><div><dt>Issued / operator</dt><dd>{receipt.issuedOn} · {receipt.operator}</dd></div></dl><div className="page-actions"><Link className="btn btn-primary" to={`/cards/${receipt.cardId}`}>View card</Link><Link className="btn btn-secondary" to={`/customers/${receipt.customerId}`}>View customer</Link><Button variant="secondary" onClick={reset}>Issue another card</Button></div></section> : <>
      <ol className="issuance-steps" aria-label="Issuance progress">{steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={index <= step ? 'reached' : ''}><span>{index + 1}</span>{label}</li>)}</ol>
      <div className="issuance-layout"><section className="card section-card">
        <h2 ref={heading} tabIndex={-1}>{steps[step]}</h2>
        {step === 0 ? <CustomerSearch onSelect={selectCustomer} /> : customerQuery.isPending ? <LoadingState label="Loading customer accounts…" /> : customerQuery.isError ? <ErrorState onRetry={customerQuery.refetch} /> : !customer ? <EmptyState title="Customer not found" description="Go back and select another customer." /> : <>
          {step === 1 && <><CustomerProfile customer={customer} /><fieldset className="account-options"><legend>Select an eligible account</legend>{customer.accounts.map(item => <label className="selection-option" key={item.id}><input type="radio" name="account" value={item.id} checked={accountId === item.id} disabled={customer.status !== 'ACTIVE' || !item.eligible || item.status !== 'ACTIVE'} onChange={() => selectAccount(item.id)} /><span><strong>{item.type} · {item.number}</strong><small>{item.eligible && item.status === 'ACTIVE' ? item.products.join(', ') + ' · ' + item.branch : item.reason || 'Not eligible'}</small></span></label>)}</fieldset><p className="dashboard-caption">Demo rules: active customer/account, matching product and account branch. Production eligibility will be supplied by the API.</p></>}
          {step === 2 && <>{stock.isPending ? <LoadingState label="Loading eligible stock…" /> : stock.isError ? <ErrorState onRetry={stock.refetch} /> : !stock.data.length ? <><EmptyState title="No eligible cards available" description="Choose another eligible account or receive matching stock for this branch." /><Link className="text-link" to="/inventory/receive">Receive cards</Link></> : <><FormField label="Available card" as="select" value={cardId} onChange={event => { setCardId(event.target.value); setRequestId(null); mutation.reset(); }}><option value="">Select card stock</option>{stock.data.map(item => <option key={item.id} value={item.id}>{item.serial} · {item.pan} · {item.product}</option>)}</FormField><p className="dashboard-caption">Showing unexpired AVAILABLE stock matching {account?.type} at {account?.branch}.</p></>}</>}
          {step === 3 && <><p className="info-box">PIN setup is unavailable until the processor API contract and permissions are supplied.</p><p>No PIN, default PIN or CVV is collected, generated or stored. You can continue with demo issuance; this does not activate the card or set its PIN.</p></>}
          {step === 4 && <>{valid ? summary : <EmptyState title="Selection is no longer available" description="Go back to the card step and choose eligible stock." />}<p className="info-box">Confirming changes the demo card status to ISSUED. PIN setup and activation remain unavailable.</p></>}
        </>}
        <div className="receipt-footer">{step > 0 && <Button variant="secondary" onClick={() => { mutation.reset(); setStep(step - 1); }}>Back</Button>}<Button variant="secondary" onClick={() => setDiscardOpen(true)}>Cancel issuance</Button>
          {step === 1 && <Button disabled={!account || customer?.status !== 'ACTIVE'} onClick={() => setStep(2)}>Continue to card</Button>}
          {step === 2 && <Button disabled={!valid || stock.isFetching} onClick={() => setStep(3)}>Continue to PIN setup</Button>}
          {step === 3 && <Button disabled={!valid} onClick={review}>Continue to review</Button>}
          {step === 4 && <Button disabled={!valid || stock.isFetching} onClick={() => setConfirmOpen(true)}>Confirm issuance</Button>}
        </div>
      </section><aside className="card section-card issuance-preview"><h2>Selected card</h2>{card ? <><CardVisual card={{ ...card, customer: customer?.name }} compact /><p className="dashboard-caption">{card.serial} · {card.product}<br />{card.branch} · {card.expiry}</p></> : <EmptyState title="Your card preview" description="Choose a customer, account and available card to preview it here." />}<p className="dashboard-caption">PAN stays masked throughout the workflow.</p></aside></div>
    </>}
    <ConfirmationModal open={confirmOpen} onClose={() => { setConfirmOpen(false); mutation.reset(); }} title="Confirm demo issuance" confirmLabel="Issue demo card" busy={mutation.isPending} onConfirm={issue}>{summary}<p>Issue this card to the selected customer and account? No PIN or activation will be performed.</p>{mutation.isError && <p className="form-error-summary" role="alert">Issuance was not completed. Close this dialog, review the account and select available stock again.</p>}{!valid && <p role="alert">This selection is no longer available. Close this dialog and choose again.</p>}</ConfirmationModal>
    <ConfirmationModal open={discardOpen} onClose={() => setDiscardOpen(false)} title="Discard issuance selection?" confirmLabel="Discard selection" danger onConfirm={reset}><p>The selected customer, account and card will be cleared. No card has been issued.</p></ConfirmationModal>
  </div>;
}
