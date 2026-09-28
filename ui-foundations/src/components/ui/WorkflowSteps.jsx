export default function WorkflowSteps({ steps, current, label }) {
  return <ol className="issuance-steps" aria-label={label}>
    {steps.map((step, index) => <li key={step} aria-current={current === index ? 'step' : undefined} className={index <= current ? 'reached' : ''}>
      <span aria-hidden="true">{index + 1}</span>{step}
    </li>)}
  </ol>;
}
