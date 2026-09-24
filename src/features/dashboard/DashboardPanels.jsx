import { ArrowRight, PackageOpen, Send, ShieldAlert, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/DataState';

const actions = [
  { title: 'Issue a Card', description: 'Open the issuance workspace', to: '/issuance/new', icon: Send },
  { title: 'Find Customer', description: 'Open customer lookup', to: '/customers', icon: Users },
  { title: 'Receive Stock', description: 'Open stock intake', to: '/inventory/receive', icon: PackageOpen },
  { title: 'Review Approvals', description: 'Open the approvals workspace', to: '/approvals', icon: ShieldAlert },
];

export function QuickActions() {
  return <section className="card section-card" aria-labelledby="quick-actions-title"><div className="section-title"><h2 id="quick-actions-title">Quick Actions</h2></div>
    <div className="quick-actions">{actions.map(({ title, description, to, icon: Icon }) => <Link className="quick-action" key={to} to={to}><span className="quick-action-icon"><Icon size={18} aria-hidden="true" /></span><span>{title}<small>{description}</small></span><ArrowRight className="action-arrow" size={16} aria-hidden="true" /></Link>)}</div>
    <p className="dashboard-caption">Demo destinations are available; operational workflows are still being built.</p>
  </section>;
}

export function InventoryHealth({ rows }) {
  return <section className="card section-card" aria-labelledby="inventory-health-title"><div className="section-title"><h2 id="inventory-health-title">Inventory Health</h2><Link className="text-link" to="/inventory">View inventory</Link></div>
    <p className="dashboard-caption">Cards available for issuance by branch. Minimums below are demo thresholds.</p>
    {rows.length ? <ul className="stock-summary">{rows.map(row => <li key={row.name}><div><strong>{row.name}</strong><span className="dashboard-caption">Minimum {row.minimumAvailable} available</span></div><div className="stock-count"><strong>{row.available} available</strong><span className={`badge badge-${row.lowStock ? 'warning' : 'success'}`}>{row.lowStock ? 'Low stock' : 'At or above minimum'}</span></div></li>)}</ul> : <EmptyState title="No branch stock" description="No branch stock information is available for this view." />}
  </section>;
}

export function AttentionQueue({ items }) {
  return <section className="card section-card" aria-labelledby="attention-title"><div className="section-title"><h2 id="attention-title">Needs Attention</h2><span className="dashboard-caption">{items.length} review {items.length === 1 ? 'item' : 'items'}</span></div>
    <p className="dashboard-caption">Signals for the selected branch scope. Links open the full inventory or status view.</p>
    {items.length ? <ul className="attention-list">{items.map(item => <li key={item.id}><span className={`attention-marker badge-${item.tone}`}><ShieldAlert size={18} aria-hidden="true" /></span><div><strong>{item.title}</strong><p>{item.description}</p><Link className="text-link" to={item.kind === 'stock' ? '/inventory' : `/cards/${item.status.toLowerCase()}`}>Review {item.kind === 'stock' ? 'inventory' : `${item.status.toLowerCase()} cards`}<span className="sr-only"> — {item.title}</span></Link></div></li>)}</ul> : <EmptyState title="No items need attention" description="No low-stock, frozen, blocked or expired-card signals in this demo scope." />}
  </section>;
}

export function StatusDistribution({ rows, total }) {
  return <section className="card section-card" aria-labelledby="distribution-title"><div className="section-title"><h2 id="distribution-title">Card Status Distribution</h2><span className="dashboard-caption">{total} cards</span></div>
    {rows.length ? <ul className="status-distribution">{rows.map(row => <li key={row.status}><div><StatusBadge status={row.status} /><span>{row.count} {row.count === 1 ? 'card' : 'cards'} · {Math.round(row.count / total * 100)}%</span></div><progress value={row.count} max={total} aria-label={`${row.status}: ${row.count} of ${total} cards`} /></li>)}</ul> : <EmptyState title="No cards to summarize" description="Card statuses will appear when records are available." />}
  </section>;
}
