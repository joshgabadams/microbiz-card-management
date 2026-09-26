import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import Link from '../components/layout/PermissionLink';
import PageHeader from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/DataState';
import FormField from '../components/ui/FormField';

const views = {
  PENDING: { label: 'Pending review', title: 'Approval queue is not connected', description: 'Requests awaiting supervisor review will appear here when the approval service is available.' },
  APPROVED: { label: 'Approved history', title: 'Approved history is not connected', description: 'Completed approvals will appear here when the approval service is available.' },
  REJECTED: { label: 'Rejected history', title: 'Rejected history is not connected', description: 'Rejected requests and their reasons will appear here when the approval service is available.' },
};
export default function ApprovalsPage() {
  const [filter, setFilter] = useState('PENDING');
  const view = views[filter];
  return <div className="page controls-page">
    <PageHeader title="Approvals" description="Supervisor review for restricted card operations." actions={<Link className="btn btn-secondary" to="/audit">View audit trail</Link>} />
    <p className="info-box">Approval queue preview. Requests, decisions and approval permissions are not available in this demo.</p>
    <section className="card table-card" aria-label="Approval queue preview">
      <div className="table-toolbar"><FormField label="Queue status" as="select" value={filter} onChange={event => setFilter(event.target.value)}>
        {Object.entries(views).map(([key, item]) => <option value={key} key={key}>{item.label}</option>)}
      </FormField></div>
      <div role="status"><EmptyState icon={ClipboardCheck} title={view.title} description={view.description} /></div>
    </section>
  </div>;
}
