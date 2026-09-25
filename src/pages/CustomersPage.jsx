import PageHeader from '../components/layout/PageHeader';
import CustomerSearch from '../features/customers/CustomerSearch';

export default function CustomersPage() {
  return <div className="page"><PageHeader title="Customer Lookup" description="Find a customer, review their accounts and inspect linked cards." /><section className="card section-card"><p className="info-box">Demo directory only. No bank system is queried.</p><CustomerSearch /></section></div>;
}
