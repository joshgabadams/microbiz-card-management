import { Ban, Link2Off, RefreshCcw, Snowflake } from 'lucide-react';
import { useParams } from 'react-router-dom';
import CardVisual from '../components/cards/CardVisual';
import StatusBadge from '../components/ui/StatusBadge';
import NotFoundPage from './NotFoundPage';
import { maskPan } from '../utils/maskPan';
import { cards } from '../data/mockData';

export default function CardDetailPage() {
  const { cardId } = useParams();
  const card = cards.find(c => c.id === cardId);
  if (!card) return <NotFoundPage card />;
  return (
    <div className="page">
      <div className="page-header"><div><h1>Card Details</h1><p>Card profile, relationship and lifecycle controls.</p></div><StatusBadge status={card.status}/></div>
      <div className="card-detail-grid">
        <div><CardVisual card={card}/><div className="action-row"><button disabled title="Lifecycle controls are not yet available" className="btn btn-secondary"><Snowflake size={16}/> Freeze</button><button disabled title="Lifecycle controls are not yet available" className="btn btn-secondary"><RefreshCcw size={16}/> Reassign</button><button disabled title="Lifecycle controls are not yet available" className="btn btn-secondary"><Link2Off size={16}/> Unlink</button><button disabled title="Lifecycle controls are not yet available" className="btn btn-danger"><Ban size={16}/> Block</button></div></div>
        <section className="card detail-panel">
          <div className="section-title"><h2>Card Overview</h2></div>
          <div className="detail-grid">
            {[['Cardholder',card.customer],['Account',card.account],['Serial Number',card.serial],['Masked PAN',maskPan(card.pan)],['Card Product',card.product],['Branch',card.branch],['Batch',card.batch],['Scheme',card.scheme],['Expiry',card.expiry],['Issued',card.issuedAt]].map(([label,value]) => <div className="detail-item" key={label}><label>{label}</label><strong>{value}</strong></div>)}
          </div>
          <div className="timeline">
            <div className="section-title"><h2>Recent Activity</h2></div>
            {[...(card.issuedOn ? [['Card issued to customer', card.issuedOn]] : []), ['Card received into inventory', card.receivedOn]].map(([title,time]) => <div className="timeline-item" key={title}><span className="timeline-dot"/><div><strong>{title}</strong><span>{time}</span></div></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
