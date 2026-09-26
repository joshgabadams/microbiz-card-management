import { useState } from 'react';
import Link from '../../components/layout/PermissionLink';
import FormField from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/DataState';
import { useCustomerSearch } from '../../hooks/useIssuance';
import CustomerProfile from './CustomerProfile';

export default function CustomerSearch({ onSelect }) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const result = useCustomerSearch(query);
  function search(event) {
    event.preventDefault();
    if (input.trim().length < 2) { setError('Enter at least two characters.'); setQuery(''); return; }
    setError(''); setQuery(input.trim());
    if (input.trim() === query) result.refetch();
  }
  return <><form className="customer-search-form" onSubmit={search} noValidate><FormField label="Find customer" type="search" value={input} onChange={event => setInput(event.target.value)} placeholder="Name, customer ID or account number" hint="Demo examples: Godwin, Ada, Musa or CUS-10044. Phone search matches only the displayed masked value." error={error} /><Button type="submit">Search</Button></form>
    {!query ? <EmptyState title="Find a customer to continue" description="Search the demo directory using a name, customer ID or account number." /> : result.isPending ? <LoadingState label="Searching customers…" /> : result.isError ? <ErrorState error={result.error} onRetry={result.refetch} /> : <><p className="dashboard-caption" role="status">{result.data.length} results for “{query}”</p>{!result.data.length ? <EmptyState title="No matching customers" description="Try another name, customer ID or account number." /> : <div className="customer-results">{result.data.map(customer => <CustomerProfile key={customer.id} customer={customer}><div className="page-actions">{onSelect ? <Button variant="secondary" disabled={customer.status !== 'ACTIVE'} onClick={() => onSelect(customer.id)}>Select {customer.name}</Button> : <Link className="btn btn-secondary" to={`/customers/${customer.id}`}>View {customer.name}</Link>}</div></CustomerProfile>)}</div>}</>}
  </>;
}
