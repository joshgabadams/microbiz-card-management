import Link from '../../components/layout/PermissionLink';
import Modal from '../../components/ui/Modal';
import EventBadge from '../../components/ui/EventBadge';
import { formatEventTime } from '../../utils/eventTime';

export default function AuditDetailDrawer({ event, onClose }) {
  return <Modal open={Boolean(event)} onClose={onClose} title="Audit Event Detail" drawer>
    {event && <div className="batch-details">
      <EventBadge action={event.action} />
      <p className="dashboard-caption">Recorded event details. This view cannot edit or delete history.</p>
      <dl className="receipt-details">
        <div><dt>Event ID</dt><dd>{event.id}</dd></div>
        <div><dt>Reference</dt><dd>{event.reference}</dd></div>
        <div><dt>Timestamp (WAT)</dt><dd><time dateTime={event.timestamp}>{formatEventTime(event.timestamp)}</time></dd></div>
        <div><dt>Actor</dt><dd>{event.actor}</dd></div>
        <div><dt>Card serial</dt><dd><Link className="text-link" to={`/cards/${event.cardId}`} onClick={onClose}>{event.serial}</Link></dd></div>
        <div><dt>Card ID</dt><dd>{event.cardId}</dd></div>
        <div><dt>Masked PAN</dt><dd>{event.pan}</dd></div>
        <div><dt>Customer</dt><dd>{event.customer}</dd></div>
        <div><dt>Branch</dt><dd>{event.branch}</dd></div>
        <div><dt>Note</dt><dd>{event.note || 'No note recorded.'}</dd></div>
      </dl>
    </div>}
  </Modal>;
}
