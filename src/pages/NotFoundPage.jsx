import Link from '../components/layout/PermissionLink';
import { EmptyState } from '../components/ui/DataState';
export default function NotFoundPage({ card = false }) {
  return <div className="page"><h1>{card ? 'Card not found' : 'Page not found'}</h1><div className="card"><EmptyState title={card ? 'This card could not be found' : 'This page is unavailable'} description="Check the reference or return to the workspace." action={<Link className="btn btn-primary" to={card ? '/cards' : '/overview'}>{card ? 'View all cards' : 'Go to overview'}</Link>} /></div></div>;
}
