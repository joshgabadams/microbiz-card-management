import BrandLogo from '../ui/BrandLogo';
import { maskPan } from '../../utils/maskPan';

export default function CardVisual({ card, compact = false }) {
  const business = card?.product?.toLowerCase().includes('business');
  return (
    <div className={`card-visual ${business ? 'business' : ''}`} style={compact ? { maxWidth: 320 } : undefined}>
      <div className="card-brand">
        <span>DEBIT</span>
        <BrandLogo light={!business} />
      </div>
      <div className="card-chip" />
      <div className="card-pan">{maskPan(card?.pan)}</div>
      <div className="card-meta">
        <div>
          <div style={{ fontSize: 9, opacity: .7 }}>VALID THRU</div>
          <strong>{card?.expiry || '—'}</strong>
          <div style={{ marginTop: 7, fontWeight: 700 }}>{card?.customer && card.customer !== '—' ? card.customer : 'MICROBIZ CUSTOMER'}</div>
        </div>
        <strong>Verve</strong>
      </div>
    </div>
  );
}
