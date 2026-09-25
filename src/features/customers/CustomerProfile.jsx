import StatusBadge from '../../components/ui/StatusBadge';

export default function CustomerProfile({ customer, children }) {
  return <section className="customer-profile" aria-label={`Customer ${customer.name}`}>
    <div className="customer-profile-heading"><div className="avatar" aria-hidden="true">{customer.name.split(' ').slice(0, 2).map(part => part[0]).join('')}</div><div><h2>{customer.name}</h2><p className="dashboard-caption">{customer.id} · {customer.branch}</p></div><StatusBadge status={customer.status} /></div>
    <dl className="receipt-details"><div><dt>Account</dt><dd>{customer.account}</dd></div><div><dt>Phone</dt><dd>{customer.phone}</dd></div></dl>
    {children}
  </section>;
}
