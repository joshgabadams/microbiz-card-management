import { useEffect, useState } from 'react';
import { CreditCard, Send, Users, PackageOpen, ShieldCheck, Search, Plus, Check, Snowflake, Ban, History, Settings } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import BrandLogo from '../components/ui/BrandLogo';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import StatusBadge from '../components/ui/StatusBadge';
import EventBadge from '../components/ui/EventBadge';
import MetricCard from '../components/ui/MetricCard';
import Modal, { ConfirmationModal } from '../components/ui/Modal';
import Tabs from '../components/ui/Tabs';
import WorkflowSteps from '../components/ui/WorkflowSteps';
import { EmptyState, ErrorState, LoadingState, Skeleton } from '../components/ui/DataState';
import DataTable from '../components/data/DataTable';
import CardVisual from '../components/cards/CardVisual';
import { cardStatuses } from '../config/cardStatuses';
import '../styles/foundations.css';

const sections = ['Brand', 'Colours', 'Typography', 'Spacing', 'Icons', 'Buttons', 'Forms', 'Status', 'Cards', 'Tables', 'Feedback', 'Dialogs', 'Workflows', 'Layouts'];
const colourGroups = {
  'Brand palette': ['navy-950', 'navy-900', 'navy-800', 'blue-600', 'blue-500', 'blue-100', 'red-600', 'green-600', 'amber-600'],
  'Surfaces & text': ['surface', 'surface-subtle', 'white', 'slate-900', 'slate-700', 'slate-500', 'slate-300', 'slate-200', 'slate-100', 'text-muted'],
  'Semantic colours': ['info-text', 'info-bg', 'success-text', 'success-bg', 'warning-text', 'warning-bg', 'danger-text', 'danger-bg', 'neutral-text', 'neutral-bg', 'overlay'],
};
const icons = { CreditCard, Send, Users, PackageOpen, ShieldCheck, Search, Plus, Check, Snowflake, Ban, History, Settings };
const rows = [
  { id: 'SAMPLE-01', product: 'Professional', status: 'AVAILABLE' },
  { id: 'SAMPLE-02', product: 'Business', status: 'ACTIVE' },
  { id: 'SAMPLE-03', product: 'Professional', status: 'FROZEN' },
];
function Code({ children }) { return <pre className="foundation-code" tabIndex={0}><code>{children}</code></pre>; }
function Section({ name, source, children }) {
  return <section id={name.toLowerCase()} className="card section-card foundation-section" aria-labelledby={`foundation-${name}`}>
    <header><h2 id={`foundation-${name}`}>{name}</h2><p className="foundation-source">{source}</p></header>{children}
  </section>;
}

export default function UiFoundationsPage() {
  const [tokens, setTokens] = useState({});
  const [dialog, setDialog] = useState(null);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('preview');
  const [step, setStep] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState('empty');
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setTokens(Object.fromEntries(Object.values(colourGroups).flat().map(name => [name, styles.getPropertyValue(`--${name}`).trim()])));
  }, []);
  const filtered = rows.filter(row => `${row.id} ${row.product}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page foundations-page">
    <PageHeader title="UI Foundations" description="The building blocks of MicroBiz Card Operations. Explore the live components, then reuse them in your pages." />
    <div className="info-box">Developer reference · All records and interactions on this page are samples. Start with src/styles/global.css and the shared components in src/components.</div>
    <nav className="foundation-jumps" aria-label="Foundation sections">{sections.map(name => <a className="text-link" key={name} href={`#${name.toLowerCase()}`}>{name}</a>)}</nav>

    <Section name="Brand" source="src/components/ui/BrandLogo.jsx · public/assets/image.png">
      <p>Use the supplied logo at its original proportions. The light prop adds a white backing for dark surfaces; it does not recolour the logo.</p>
      <div className="foundation-grid"><div className="foundation-preview"><BrandLogo /></div><div className="foundation-preview foundation-dark"><BrandLogo light /></div></div>
      <Code>{`import BrandLogo from '../components/ui/BrandLogo';\n\n<BrandLogo />\n<BrandLogo light />`}</Code>
      <p>The branded loader uses public/assets/loading-animation.png. Design reference sheets live in public/references and are excluded from production output; use the live CardVisual component for card previews.</p>
    </Section>
    <Section name="Colours" source="src/styles/global.css · :root tokens">
      <p>Use CSS variables. Primary buttons and active navigation use --info-text; --blue-600 is the brighter brand and focus colour. Values below are read from the current stylesheet.</p>
      {Object.entries(colourGroups).map(([group, names]) => <div key={group}><h3>{group}</h3><div className="foundation-swatches">{names.map(name => <div className="foundation-swatch" key={name}><div aria-hidden="true" style={{ background: `var(--${name})` }} /><code>--{name}</code><small>{tokens[name]}</small></div>)}</div></div>)}
      <Code>{`.example-panel {\n  background: var(--surface);\n  color: var(--slate-900);\n  border: 1px solid var(--slate-200);\n}`}</Code>
    </Section>
    <Section name="Typography" source="src/styles/global.css · font-family, --font-xs / sm / md">
      <p>Inter, ui-sans-serif, system-ui, then platform fallbacks. Inter is not bundled; the system font is used when it is unavailable.</p>
      <div className="foundation-type-title">Page title · 28px / 24px on small screens</div>
      <h3>Section heading · clear, concise labels</h3>
      {['md', 'sm', 'xs'].map(size => <p key={size} style={{ fontSize: `var(--font-${size})` }}>Aa · MicroBiz Card Operations <code>--font-{size}</code> · {({ md: '1rem', sm: '.875rem', xs: '.75rem' })[size]}</p>)}
      <p>Use PageHeader for the page’s single h1. Use h2 for sections, visible field labels, and sentence case for supporting text.</p>
    </Section>
    <Section name="Spacing" source="src/styles/global.css · --space-*, --radius-*, --shadow-*, --motion-fast">
      <div className="foundation-space-list">{[1, 2, 3, 4, 5, 6, 8].map((n, i) => <div key={n}><code>--space-{n}</code><span aria-hidden="true" style={{ width: `var(--space-${n})` }} /><small>{[4, 8, 12, 16, 24, 32, 48][i]}px at a 16px root</small></div>)}</div>
      <div className="foundation-grid">{['sm', 'md', 'lg'].map((size, i) => <div className="foundation-preview" key={size} style={{ borderRadius: `var(--radius-${size})`, boxShadow: `var(--shadow-${size === 'lg' ? 'md' : 'sm'})` }}><code>--radius-{size} · {[10, 14, 20][i]}px</code><p>--shadow-{size === 'lg' ? 'md' : 'sm'}</p></div>)}</div>
      <p>Button transitions use --motion-fast (160ms). Spinners, skeletons and the branded loader respect prefers-reduced-motion. Reuse components to preserve their existing control radii and 44px minimum control height.</p>
    </Section>
    <Section name="Icons" source="lucide-react · src/config/navigation.js">
      <p>Use outline icons from lucide-react. Navigation uses 17px icons (14px for child links); buttons commonly use 17–18px. Decorative icons should be hidden from assistive technology.</p>
      <div className="foundation-icons">{Object.entries(icons).map(([name, Icon]) => <div key={name}><Icon size={20} aria-hidden="true" /><code>{name}</code></div>)}</div>
      <Code>{`import { Plus } from 'lucide-react';\n<Button><Plus size={17} aria-hidden="true" />Add item</Button>\n<Button variant="secondary" aria-label="Add item">\n  <Plus size={17} aria-hidden="true" />\n</Button>`}</Code>
    </Section>
    <Section name="Buttons" source="src/components/ui/Button.jsx">
      <div className="foundation-row">{['primary', 'secondary', 'danger'].map(variant => <Button key={variant} variant={variant} onClick={() => setMessage(`${variant} sample clicked.`)}>{variant}</Button>)}<Button disabled>Disabled</Button><Button loading>Saving…</Button></div>
      <p role="status">{message || 'Click a sample button to see feedback.'}</p>
      <Code>{`<Button variant="primary" onClick={handleSave}>Save changes</Button>\n<Button variant="secondary">Cancel</Button>\n<Button variant="danger">Block card</Button>\n<Button loading={pending} disabled={!valid} type="submit">Save</Button>`}</Code>
      <p>Variants: primary, secondary, danger. Default type is button. Loading disables the control and sets aria-busy; pages own submission and error state.</p>
    </Section>
    <Section name="Forms" source="src/components/ui/FormField.jsx">
      <div className="foundation-grid"><FormField label="Batch reference" placeholder="e.g. SAMPLE-001" hint="A visible label is required." required /><FormField label="Product" as="select" defaultValue="Professional"><option>Professional</option><option>Business</option></FormField><FormField label="Validation example" error="Enter a batch reference." defaultValue="" /><FormField label="Disabled field" disabled defaultValue="Head Office" /></div>
      <FormField label="Notes" as="textarea" placeholder="Add context for this sample…" />
      <Code>{`import FormField from '../components/ui/FormField';\n\n<FormField label="Reference" value={reference}\n  onChange={event => setReference(event.target.value)}\n  hint="Use the batch reference." error={errors.reference} required />\n<FormField label="Product" as="select"><option>Business</option></FormField>`}</Code>
      <p>Hints and errors are linked automatically. Set as="select" or as="textarea"; native input props and refs are forwarded. Group related controls in a fieldset and focus validation summaries in multi-step forms.</p>
    </Section>
    <Section name="Status" source="src/components/ui/StatusBadge.jsx · EventBadge.jsx · src/config/cardStatuses.js">
      <h3>Card status</h3><div className="foundation-row">{Object.keys(cardStatuses).map(status => <StatusBadge key={status} status={status} />)}<StatusBadge status="UNKNOWN" /></div>
      <h3>Activity events</h3><div className="foundation-row">{['RECEIVED', 'ISSUED', 'ACTIVATED', 'FROZEN', 'BLOCKED'].map(action => <EventBadge key={action} action={action} />)}</div>
      <Code>{`<StatusBadge status="ACTIVE" />\n<EventBadge action="ISSUED" />`}</Code><p>Use the central status mapping. Labels carry meaning alongside colour; unknown statuses use the neutral tone.</p>
    </Section>
    <Section name="Cards" source="src/components/cards/CardVisual.jsx · src/components/ui/MetricCard.jsx">
      <div className="foundation-grid">{['Professional', 'Business'].map(product => <div key={product}><h3>{product}</h3><CardVisual compact card={{ product, pan: '•••• 1234', expiry: '12/29', customer: 'SAMPLE CUSTOMER' }} /></div>)}</div>
      <div className="foundation-grid"><MetricCard label="Available cards" value="128" caption="Sample metric" icon={CreditCard} /><MetricCard label="Issued today" value="24" caption="Sample metric" icon={Send} /></div>
      <Code>{`<CardVisual compact card={{ product: 'Business', pan: '1234',\n  expiry: '12/29', customer: 'SAMPLE CUSTOMER' }} />\n<MetricCard label="Available cards" value="128"\n  caption="Ready for issuance" icon={CreditCard} />`}</Code>
      <p>CardVisual masks PAN to the final four digits. Use maskAccount for account displays. Never introduce PIN, CVV, full PAN or card-back artwork into page samples.</p>
    </Section>
    <Section name="Tables" source="src/components/data/DataTable.jsx">
      <FormField label="Search sample rows" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Search serial or product" />
      <DataTable label="Foundation sample cards" columns={[{ key: 'id', label: 'Serial' }, { key: 'product', label: 'Product' }, { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> }]} rows={filtered.slice((page - 1) * 2, page * 2)} total={filtered.length} pageSize={2} page={page} onPageChange={setPage} />
      <Code>{`<DataTable label="Cards"\n  columns={[{ key: 'id', label: 'Serial' },\n    { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> }]}\n  rows={visibleRows} total={total} page={page} pageSize={10}\n  onPageChange={setPage} loading={loading} error={error} onRetry={refetch} />`}</Code>
      <p>Rows must already be filtered and paginated; the page/query owns those operations. Below 821px, the same columns become labelled mobile records. Use a stable id or supply rowKey.</p>
    </Section>
    <Section name="Feedback" source="src/components/ui/DataState.jsx">
      <FormField label="Preview state" as="select" value={feedback} onChange={event => setFeedback(event.target.value)}>{['empty', 'loading', 'error', 'forbidden', 'unavailable'].map(state => <option key={state}>{state}</option>)}</FormField>
      {feedback === 'empty' && <EmptyState title="No sample cards" description="Try a different filter or add a sample." />}
      {feedback === 'loading' && <><LoadingState label="Loading sample cards…" /><Skeleton /></>}
      {feedback === 'error' && <ErrorState onRetry={() => setFeedback('empty')} />}
      {feedback === 'forbidden' && <ErrorState error={{ code: 'FORBIDDEN' }} />}
      {feedback === 'unavailable' && <ErrorState error={{ code: 'UNAVAILABLE' }} />}
      <Code>{`<LoadingState label="Loading cards…" />\n<Skeleton />\n<EmptyState title="No cards found" description="Try another filter." />\n<ErrorState error={error} onRetry={refetch} />`}</Code>
    </Section>
    <Section name="Dialogs" source="src/components/ui/Modal.jsx · Modal and ConfirmationModal">
      <div className="foundation-row"><Button onClick={() => setDialog('modal')}>Open modal</Button><Button variant="secondary" onClick={() => setDialog('drawer')}>Open drawer</Button><Button variant="danger" onClick={() => setDialog('confirm')}>Open confirmation</Button></div>
      <Modal open={dialog === 'modal' || dialog === 'drawer'} drawer={dialog === 'drawer'} onClose={() => setDialog(null)} title="Sample details"><p className="foundation-dialog-copy">This is a shared dialog. Try Tab, Shift+Tab and Escape. Closing restores focus to the trigger.</p></Modal>
      <ConfirmationModal open={dialog === 'confirm'} onClose={() => setDialog(null)} onConfirm={() => { setDialog(null); setMessage('Sample confirmed. No records changed.'); }} title="Confirm sample action" confirmLabel="Confirm sample" danger><p>No operational data will change.</p></ConfirmationModal>
      <Code>{`<Modal open={open} onClose={() => setOpen(false)} title="Details">\n  <p>Dialog content</p>\n</Modal>\n<ConfirmationModal open={open} onClose={close} onConfirm={save}\n  title="Confirm changes" confirmLabel="Save" busy={pending}>\n  <p>Review the change before continuing.</p>\n</ConfirmationModal>`}</Code>
      <p>Dialogs handle focus containment, Escape, scroll locking and focus restoration. Set drawer for the side panel, and busy during mutations to prevent dismissal or duplicate confirmation.</p>
    </Section>
    <Section name="Workflows" source="src/components/ui/Tabs.jsx · WorkflowSteps.jsx">
      <Tabs label="Foundation examples" value={tab} onChange={setTab} items={[{ value: 'preview', label: 'Preview', content: <p>Controlled tabs support arrow keys, Home and End.</p> }, { value: 'usage', label: 'Usage', content: <Code>{`<Tabs label="Card details" value={tab} onChange={setTab}\n  items={[{ value: 'overview', label: 'Overview', content: <Overview /> }]} />`}</Code> }]} />
      <WorkflowSteps steps={['Batch Details', 'Card Details', 'Review', 'Complete']} current={step} label="Sample intake progress" />
      <div className="foundation-row"><Button variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Previous step</Button><Button disabled={step === 3} onClick={() => setStep(step + 1)}>Next step</Button></div>
      <Code>{`<WorkflowSteps steps={['Details', 'Review', 'Complete']}\n  current={0} label="Receipt progress" />`}</Code><p>Steps use a zero-based index and aria-current. The page owns validation, state preservation, heading focus and confirmation.</p>
    </Section>
    <Section name="Layouts" source="src/layouts/AppShell.jsx · src/components/layout/PageHeader.jsx · src/styles/global.css">
      <p>AppShell supplies navigation, the sticky topbar, skip link and main landmark. Route pages supply a .page wrapper and PageHeader. Desktop content has a 1500px maximum width and 30px padding; mobile uses 20px 16px 30px.</p>
      <div className="foundation-grid"><div className="card section-card"><h3>Main section</h3><p>White surface, subtle border, medium radius and small shadow.</p></div><div className="card section-card"><h3>Supporting section</h3><p>Use existing grids: kpi-grid, dashboard-grid, receipt-fields or issuance-layout for matching page patterns.</p></div></div>
      <Code>{`import PageHeader from '../components/layout/PageHeader';\nimport Button from '../components/ui/Button';\n\nexport default function ExamplePage() {\n  return <div className="page">\n    <PageHeader title="Example page" description="A clear description."\n      actions={<Button onClick={handleCreate}>Create item</Button>} />\n    <section className="card section-card" aria-label="Results">\n      {/* Shared fields, metrics or DataTable */}\n    </section>\n  </div>;\n}\n// Define handleCreate for your workflow before using this template.`}</Code>
      <p>At 820px the sidebar becomes a modal drawer and tables become records. Dashboard grids collapse at 1050px; issuance grids at 1100px; forms simplify at 620px. Check new pages at 320, 390, 768, 1024 and 1440px.</p>
      <p>Keep API access in hooks/services. Preserve keyboard focus, visible labels, loading/error/empty states and confirmation for irreversible actions. Consult docs/phases/PHASE-01-FOUNDATION.md for the implementation contract.</p>
    </Section>
  </div>;
}
