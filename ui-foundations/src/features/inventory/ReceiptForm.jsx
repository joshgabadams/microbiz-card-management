import { useEffect, useRef, useState } from 'react';
import Link from '../../components/layout/PermissionLink';
import FormField from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/Modal';
import { useReceiveInventory } from '../../hooks/useInventory';
import WorkflowSteps from '../../components/ui/WorkflowSteps';
import { validateBatchDetails, validateReceipt } from './validateReceipt';
import { maskPan } from '../../utils/maskPan';

const steps = ['Batch Details', 'Card Details', 'Review', 'Complete'];
const emptyCard = () => ({ serial: '', lastFour: '', expiry: '' });
const emptyForm = reference => ({ batch: '', product: '', scheme: reference.schemes[0] || '', branch: '', receivedOn: reference.reportingDate, quantity: 1, cards: [emptyCard()] });

export default function ReceiptForm({ reference, existingCards }) {
  const [step, setStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, [step]);
  const [form, setForm] = useState(() => emptyForm(reference));
  const [errors, setErrors] = useState({});
  const [review, setReview] = useState(null);
  const [discard, setDiscard] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const errorSummary = useRef(null);
  const submitting = useRef(false);
  const mutation = useReceiveInventory();
  const change = key => event => setForm(previous => ({ ...previous, [key]: event.target.value }));
  function changeCard(index, key, value) {
    setForm(previous => ({ ...previous, cards: previous.cards.map((card, row) => row === index ? { ...card, [key]: value } : card) }));
  }
  function updateRows(rows) { setForm(previous => ({ ...previous, cards: rows })); setErrors({}); }
  function reset() { setStep(0); setConfirmOpen(false); setForm(emptyForm(reference)); setErrors({}); setReview(null); setDiscard(false); setReceipt(null); mutation.reset(); }
  function showIssues(issues, nextStep) {
    setErrors(Object.fromEntries(Object.entries(issues).filter(([key]) => nextStep === 0 ? !key.startsWith('cards.') : key === 'quantity' || key.startsWith('cards.'))));
    setStep(nextStep);
    requestAnimationFrame(() => errorSummary.current?.focus());
  }
  function prepare(event) {
    event.preventDefault();
    if (step === 0) {
      const issues = validateBatchDetails(form, reference, existingCards);
      if (Object.keys(issues).length) { showIssues(issues, 0); return; }
      setErrors({}); setStep(1); return;
    }
    if (step !== 1) return;
    const issues = validateReceipt(form, reference, existingCards);
    if (Object.keys(issues).length) {
      const batchIssue = Object.keys(issues).some(key => key !== 'quantity' && !key.startsWith('cards.'));
      showIssues(issues, batchIssue ? 0 : 1); return;
    }
    setErrors({}); mutation.reset();
    setReview({ ...form, batch: form.batch.trim().toUpperCase(), cards: form.cards.map(card => ({ ...card, serial: card.serial.trim().toUpperCase() })), requestId: crypto.randomUUID() });
    setStep(2);
  }
  function edit(nextStep) { setReview(null); setErrors({}); mutation.reset(); setStep(nextStep); }
  async function confirm() {
    if (submitting.current || !review) return;
    const issues = validateReceipt(review, reference, existingCards);
    if (Object.keys(issues).length) {
      setConfirmOpen(false); setReview(null);
      const batchIssue = Object.keys(issues).some(key => key !== 'quantity' && !key.startsWith('cards.'));
      showIssues(issues, batchIssue ? 0 : 1); return;
    }
    submitting.current = true;
    try {
      const result = await mutation.mutateAsync(review);
      setConfirmOpen(false);
      setReceipt(result);
      setStep(3);
      setReview(null);
      setForm(emptyForm(reference));
      setErrors({});
    } catch {
      // The modal renders a safe error; no input payload is logged.
    } finally { submitting.current = false; }
  }
  const progress = <WorkflowSteps steps={steps} current={step} label="Stock intake progress" />;
  const summary = review && <><dl className="receipt-details"><div><dt>Batch</dt><dd>{review.batch}</dd></div><div><dt>Product / scheme</dt><dd>{review.product} · {review.scheme}</dd></div><div><dt>Receiving branch</dt><dd>{review.branch}</dd></div><div><dt>Date / operator</dt><dd>{review.receivedOn} · {reference.receivedBy}</dd></div><div><dt>Quantity</dt><dd>{review.cards.length} cards</dd></div></dl><ul className="receipt-review-list">{review.cards.map(card => <li key={card.serial}><strong>{card.serial}</strong><span>{maskPan(card.lastFour)} · {card.expiry}</span></li>)}</ul></>;
  if (receipt) return <>{progress}<section className="card section-card" aria-labelledby="receipt-success"><h2 id="receipt-success" tabIndex={-1} ref={node => node?.focus()}>Demo stock received</h2><p role="status">{receipt.quantity} {receipt.quantity === 1 ? 'card is' : 'cards are'} now available at {receipt.branch}.</p><dl className="receipt-details"><div><dt>Batch</dt><dd>{receipt.batch}</dd></div><div><dt>Date received</dt><dd>{receipt.receivedOn}</dd></div><div><dt>Received by</dt><dd>{receipt.receivedBy}</dd></div></dl><p className="info-box">This is a demo receipt. No bank system was updated. Reloading the page clears this session’s received stock.</p><div className="page-actions"><Link className="btn btn-primary" to="/inventory">View inventory</Link><Link className="btn btn-secondary" to="/inventory/batches">View batches</Link><Button variant="secondary" onClick={reset}>Receive another batch</Button></div></section></>;
  return <>
    {progress}
    <form className="card section-card receipt-form" onSubmit={prepare} noValidate autoComplete="off">
      <p className="dashboard-caption">Step {step + 1} of {steps.length}</p>
      <h2 ref={heading} tabIndex={-1}>{steps[step]}</h2>
      {Object.keys(errors).length > 0 && <div className="form-error-summary" role="alert" tabIndex={-1} ref={errorSummary}><strong>Check the highlighted fields before continuing.</strong><ul>{Object.entries(errors).map(([key, message]) => <li key={key}><a href={`#receipt-${key}`}>{key.startsWith('cards.') ? `Card ${Number(key.split('.')[1]) + 1}: ` : ''}{message}</a></li>)}</ul></div>}
      {step === 0 && <div className="receipt-fields">
        <FormField id="receipt-batch" label="Batch reference" required value={form.batch} onChange={change('batch')} maxLength={40} error={errors.batch} />
        <FormField id="receipt-product" label="Card product" required as="select" value={form.product} onChange={change('product')} error={errors.product}><option value="">Select product</option>{reference.products.map(value => <option key={value}>{value}</option>)}</FormField>
        <FormField id="receipt-scheme" label="Card scheme" required as="select" value={form.scheme} onChange={change('scheme')} error={errors.scheme}><option value="">Select scheme</option>{reference.schemes.map(value => <option key={value}>{value}</option>)}</FormField>
        <FormField id="receipt-branch" label="Receiving branch" required as="select" value={form.branch} onChange={change('branch')} error={errors.branch}><option value="">Select branch</option>{reference.branches.map(value => <option key={value}>{value}</option>)}</FormField>
        <FormField id="receipt-receivedOn" label="Date received" type="date" required max={reference.reportingDate} value={form.receivedOn} onChange={change('receivedOn')} error={errors.receivedOn} hint={`Demo snapshot date: ${reference.reportingDate}`} />
        <FormField id="receipt-quantity" label="Expected quantity" type="number" required min={1} max={reference.maxManualCards} value={form.quantity} onChange={change('quantity')} error={errors.quantity} hint="Must match the number of card rows in Card Details." />
        <FormField label="Received by" value={reference.receivedBy} readOnly hint="Demo identity; production identity will come from the authenticated session." />
      </div>}
      {step === 1 && <>
      <p className="dashboard-caption">{form.batch.trim().toUpperCase()} · {form.product} · {form.branch}</p>
      <FormField id="receipt-quantity" label="Expected quantity" type="number" required min={1} max={reference.maxManualCards} value={form.quantity} onChange={change('quantity')} error={errors.quantity} hint="Must match the number of card rows below." />
      <div className="section-title"><h3>Individual cards</h3><span className="dashboard-caption">{form.cards.length} of {reference.maxManualCards} manual rows</span></div>
      <p className="info-box">Enter serial numbers and PAN last-four digits only. Do not enter full PAN, PIN or CVV. Bulk upload is unavailable.</p>
      <div className="receipt-rows">{form.cards.map((card, index) => <fieldset key={index} className="receipt-row"><legend>Card {index + 1}</legend><div className="receipt-fields">
        <FormField id={`receipt-cards.${index}.serial`} label="Serial number" required maxLength={40} value={card.serial} onChange={event => changeCard(index, 'serial', event.target.value)} error={errors[`cards.${index}.serial`]} />
        <FormField id={`receipt-cards.${index}.lastFour`} label="PAN last four digits" required inputMode="numeric" maxLength={4} value={card.lastFour} onChange={event => changeCard(index, 'lastFour', event.target.value)} error={errors[`cards.${index}.lastFour`]} />
        <FormField id={`receipt-cards.${index}.expiry`} label="Expiry month" type="month" required min={reference.reportingDate.slice(0, 7)} value={card.expiry} onChange={event => changeCard(index, 'expiry', event.target.value)} error={errors[`cards.${index}.expiry`]} />
      </div><Button variant="secondary" disabled={form.cards.length === 1} onClick={() => updateRows(form.cards.filter((_, row) => row !== index))} aria-label={`Remove card ${index + 1}`}>Remove row</Button></fieldset>)}</div>
      <Button variant="secondary" disabled={form.cards.length >= reference.maxManualCards} onClick={() => updateRows([...form.cards, emptyCard()])}>Add card row</Button>
      </>}
      {step === 2 && <>{summary}<p className="info-box">Review the batch and masked card details before confirming. Stock will become AVAILABLE in this demo tab only.</p><div className="page-actions"><Button variant="secondary" onClick={() => edit(0)}>Edit batch details</Button><Button variant="secondary" onClick={() => edit(1)}>Edit card details</Button></div></>}
      <div className="receipt-footer">{step > 0 && <Button variant="secondary" onClick={() => edit(step - 1)}>Back</Button>}<Button variant="secondary" onClick={() => setDiscard(true)}>Cancel intake</Button>{step < 2 ? <Button type="submit">{step === 0 ? 'Continue to card details' : 'Review batch'}</Button> : <Button onClick={() => setConfirmOpen(true)}>Confirm receipt</Button>}</div>
    </form>
    <ConfirmationModal open={confirmOpen} onClose={() => { setConfirmOpen(false); mutation.reset(); }} title="Confirm stock receipt" confirmLabel="Receive demo stock" busy={mutation.isPending} onConfirm={confirm}>
      {review && <><p>Receive <strong>{review.cards.length} cards</strong> into <strong>{review.branch}</strong> as AVAILABLE?</p>{summary}<p className="dashboard-caption">Demo session only. No bank system will be updated.</p></>}
      {mutation.isError && <div className="form-error-summary" role="alert"><strong>Stock was not received.</strong><p>{mutation.error?.fieldErrors ? 'Close this review and correct the following:' : 'Please try again. If the problem continues, cancel this review and return to inventory.'}</p>{mutation.error?.fieldErrors && <ul>{Object.entries(mutation.error.fieldErrors).map(([key, message]) => <li key={key}>{message}</li>)}</ul>}</div>}
    </ConfirmationModal>
    <ConfirmationModal open={discard} onClose={() => setDiscard(false)} title="Discard intake details?" confirmLabel="Discard details" danger onConfirm={reset}><p>The batch and card rows entered here will be cleared. No stock has been received.</p></ConfirmationModal>
  </>;
}
